const QDRANT_URL = process.env.QDRANT_URL!
const QDRANT_API_KEY = process.env.QDRANT_API_KEY!

async function qdrantFetch(urlPath: string, method: string, body?: unknown): Promise<Response> {
  if (!QDRANT_URL || !QDRANT_API_KEY) {
    throw new Error('QDRANT_URL and QDRANT_API_KEY must be set in environment variables')
  }
  return fetch(`${QDRANT_URL}${urlPath}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'api-key': QDRANT_API_KEY,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

export async function createCollection(collectionId: string, vectorSize: number = 1024) {
  const response = await qdrantFetch(`/collections/${collectionId}`, 'PUT', {
    vectors: { size: vectorSize, distance: 'Cosine' },
  })
  // 409 means the collection already exists — acceptable
  if (!response.ok && response.status !== 409) {
    throw new Error(`Failed to create Qdrant collection: ${await response.text()}`)
  }
}

export async function upsertPoints(
  collectionId: string,
  points: Array<{ id: number; vector: number[]; payload: Record<string, unknown> }>,
) {
  const response = await qdrantFetch(`/collections/${collectionId}/points`, 'PUT', { points })
  if (!response.ok) {
    throw new Error(`Failed to upsert points: ${await response.text()}`)
  }
}

export type SearchResult = {
  id: number
  score: number
  payload: Record<string, unknown>
}

export async function searchPoints(
  collectionId: string,
  vector: number[],
  limit: number = 5,
): Promise<SearchResult[]> {
  const response = await qdrantFetch(`/collections/${collectionId}/points/search`, 'POST', {
    vector,
    limit,
    with_payload: true,
  })
  if (!response.ok) {
    throw new Error(`Failed to search Qdrant: ${await response.text()}`)
  }
  const data = await response.json() as { result: SearchResult[] }
  return data.result
}

export async function deleteCollection(collectionId: string) {
  await qdrantFetch(`/collections/${collectionId}`, 'DELETE')
}
