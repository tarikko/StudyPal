const MISTRAL_BASE = 'https://api.mistral.ai/v1'

function getKey(): string {
  const key = process.env.MISTRAL_API_KEY
  if (!key) throw new Error('MISTRAL_API_KEY is not set')
  return key
}

// ─── File & OCR ───────────────────────────────────────────────────────────────

/** Upload a file (as base64) to the Mistral Files API. Returns the file ID. */
async function uploadFile(base64: string, fileName: string, mimeType: string): Promise<string> {
  const buffer = Buffer.from(base64, 'base64')
  const blob = new Blob([buffer], { type: mimeType })

  const form = new FormData()
  form.append('file', blob, fileName)
  form.append('purpose', 'ocr')

  const resp = await fetch(`${MISTRAL_BASE}/files`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getKey()}` },
    body: form,
  })
  if (!resp.ok) throw new Error(`File upload failed: ${await resp.text()}`)
  const data = await resp.json() as { id: string }
  return data.id
}

/** Get a short-lived signed URL for an uploaded file. */
async function getFileUrl(fileId: string): Promise<string> {
  const resp = await fetch(`${MISTRAL_BASE}/files/${fileId}/url?expiry=24`, {
    headers: { Authorization: `Bearer ${getKey()}` },
  })
  if (!resp.ok) throw new Error(`Get file URL failed: ${await resp.text()}`)
  const data = await resp.json() as { url: string }
  return data.url
}

/** Run OCR on a document URL and return the extracted markdown text. */
async function ocrDocument(documentUrl: string): Promise<string> {
  const resp = await fetch(`${MISTRAL_BASE}/ocr`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-ocr-latest',
      document: { type: 'document_url', document_url: documentUrl },
    }),
  })
  if (!resp.ok) throw new Error(`OCR failed: ${await resp.text()}`)
  const data = await resp.json() as { pages: Array<{ markdown: string }> }
  return data.pages.map((p) => p.markdown).join('\n\n')
}

/** Run OCR on a base64 image directly. */
async function ocrImage(base64: string, mimeType: string): Promise<string> {
  const resp = await fetch(`${MISTRAL_BASE}/ocr`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-ocr-latest',
      document: {
        type: 'image_url',
        image_url: { url: `data:${mimeType};base64,${base64}` },
      },
    }),
  })
  if (!resp.ok) throw new Error(`Image OCR failed: ${await resp.text()}`)
  const data = await resp.json() as { pages: Array<{ markdown: string }> }
  return data.pages.map((p) => p.markdown).join('\n\n')
}

// ─── Public file extraction ───────────────────────────────────────────────────

export interface InputFile {
  name: string
  base64: string
  mimeType: string
}

/** Given any supported file type, extract its text content. */
export async function extractTextFromFile(file: InputFile): Promise<string> {
  const { name, base64, mimeType } = file

  // Plain text / markdown — just decode
  if (
    mimeType === 'text/plain' ||
    mimeType === 'text/markdown' ||
    name.endsWith('.txt') ||
    name.endsWith('.md')
  ) {
    return Buffer.from(base64, 'base64').toString('utf-8')
  }

  // Images — OCR directly with base64 (avoid upload round-trip)
  if (mimeType.startsWith('image/')) {
    return ocrImage(base64, mimeType)
  }

  // PDFs — upload then OCR via signed URL
  const fileId = await uploadFile(base64, name, mimeType)
  const url = await getFileUrl(fileId)
  return ocrDocument(url)
}

// ─── Embeddings ───────────────────────────────────────────────────────────────

const EMBED_BATCH = 32 // Mistral embed can handle large batches; keep conservative

/** Embed an array of text strings. Returns parallel array of embedding vectors. */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []
  // Process in batches to stay within API limits
  const results: number[][] = []
  for (let i = 0; i < texts.length; i += EMBED_BATCH) {
    const batch = texts.slice(i, i + EMBED_BATCH)
    const resp = await fetch(`${MISTRAL_BASE}/embeddings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: 'mistral-embed', input: batch }),
    })
    if (!resp.ok) throw new Error(`Embedding failed: ${await resp.text()}`)
    const data = await resp.json() as { data: Array<{ embedding: number[] }> }
    results.push(...data.data.map((d) => d.embedding))
  }
  return results
}

// ─── Chat completion ──────────────────────────────────────────────────────────

/** Chat completion returning JSON (use response_format: json_object). */
export async function chatJSON(system: string, user: string): Promise<string> {
  const resp = await fetch(`${MISTRAL_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4096,
    }),
  })
  if (!resp.ok) throw new Error(`Chat (JSON) failed: ${await resp.text()}`)
  const data = await resp.json() as { choices: Array<{ message: { content: string } }> }
  return data.choices[0].message.content
}

/** Chat completion returning plain text (markdown). */
export async function chatText(system: string, user: string): Promise<string> {
  const resp = await fetch(`${MISTRAL_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: 2048,
    }),
  })
  if (!resp.ok) throw new Error(`Chat (text) failed: ${await resp.text()}`)
  const data = await resp.json() as { choices: Array<{ message: { content: string } }> }
  return data.choices[0].message.content
}
