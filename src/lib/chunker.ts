export interface TextChunk {
  id: string
  text: string
  source: string
  index: number
}

const CHARS_PER_CHUNK = 1800 // ~512 tokens
const OVERLAP_CHARS = 200    // ~64 tokens overlap

export function chunkText(text: string, source: string): TextChunk[] {
  const chunks: TextChunk[] = []
  let idx = 0
  let chunkIndex = 0

  while (idx < text.length) {
    const tentativeEnd = Math.min(idx + CHARS_PER_CHUNK, text.length)

    // Try to break at a paragraph or sentence boundary
    let actualEnd = tentativeEnd
    if (tentativeEnd < text.length) {
      const slice = text.slice(idx, tentativeEnd)
      const lastParagraph = slice.lastIndexOf('\n\n')
      const lastSentence = Math.max(
        slice.lastIndexOf('. '),
        slice.lastIndexOf('.\n'),
        slice.lastIndexOf('? '),
        slice.lastIndexOf('! '),
      )
      const breakPoint = lastParagraph > CHARS_PER_CHUNK * 0.4
        ? lastParagraph
        : lastSentence > CHARS_PER_CHUNK * 0.4
        ? lastSentence + 1
        : -1

      if (breakPoint > 0) {
        actualEnd = idx + breakPoint + 1
      }
    }

    const chunkContent = text.slice(idx, actualEnd).trim()
    if (chunkContent.length > 50) {
      chunks.push({
        id: `${source}-${chunkIndex}`,
        text: chunkContent,
        source,
        index: chunkIndex,
      })
      chunkIndex++
    }

    // Move forward with overlap
    idx = actualEnd - OVERLAP_CHARS
    if (actualEnd >= text.length) break
  }

  return chunks
}
