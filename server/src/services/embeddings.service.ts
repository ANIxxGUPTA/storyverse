import { pipeline } from "@xenova/transformers";

let extractor: any = null;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

/**
 * Initializes the Transformers.js pipeline (only once).
 */
export async function initEmbeddingsModel(): Promise<void> {
  if (extractor) return;
  if (loadPromise) return loadPromise;

  isLoading = true;
  loadPromise = (async () => {
    try {
      console.log("Loading Xenova embedding model...");
      extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true,
      });
      console.log("Embedding model loaded successfully.");
    } catch (error) {
      console.error("Failed to load embedding model:", error);
      throw error;
    } finally {
      isLoading = false;
    }
  })();

  return loadPromise;
}

/**
 * Generates an embedding for the given text.
 * @param text The text to embed.
 * @returns The embedding vector as a number array.
 */
export async function embed(text: string): Promise<number[]> {
  if (!extractor) {
    await initEmbeddingsModel();
  }
  
  const output = await extractor(text, {
    pooling: 'mean',
    normalize: true,
  });
  
  return Array.from(output.data) as number[];
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
