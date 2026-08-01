import { getGeminiClient } from './gemini.service';

/**
 * Generates an embedding for the given text.
 * @param text The text to embed.
 * @returns The embedding vector as a number array.
 */
export async function embed(text: string): Promise<number[]> {
  const client = getGeminiClient();
  try {
    const response = await client.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text,
    });
    return response.embeddings?.[0]?.values || [];
  } catch (error) {
    console.error('Error generating embedding with Gemini:', error);
    throw error;
  }
}

/**
 * Calculates Cosine Similarity between two numeric vectors.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
