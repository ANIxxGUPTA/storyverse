import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Story from "@/models/Story";
import { pipeline } from "@xenova/transformers";

// Helper function to calculate Cosine Similarity between two arrays
function cosineSimilarity(vecA: number[], vecB: number[]) {
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

// Global cache for the embedding model so it doesn't reload on every request
let extractor: any = null;

export async function POST(req: Request) {
  try {
    const { theme } = await req.json();

    if (!theme || typeof theme !== 'string') {
      return NextResponse.json({ error: "Missing or invalid theme query" }, { status: 400 });
    }

    await connectDB();

    // 1. Load the embedding model (only once per server lifecycle)
    if (!extractor) {
      // We use Xenova's Transformers.js to run the embedding LLM locally for free!
      extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true,
      });
    }

    // 2. Generate the embedding vector for the user's semantic query
    const output = await extractor(theme, {
      pooling: 'mean',
      normalize: true,
    });
    const queryVector = Array.from(output.data) as number[];

    // 3. Fetch all stories that have pre-computed embeddings
    const allStories = await Story.find({
      status: "ongoing",
      embedding: { $exists: true, $not: { $size: 0 } }
    }).populate("author", "name image").lean();

    // 4. Perform In-Memory Vector Search using Cosine Similarity
    const scoredStories = allStories.map((story: any) => {
      const score = cosineSimilarity(queryVector, story.embedding);
      return { ...story, similarityScore: score };
    });

    // 5. Sort by highest similarity score (closest semantic match)
    scoredStories.sort((a, b) => b.similarityScore - a.similarityScore);

    // 6. Take top 4 recommendations and remove the raw embeddings from the response payload
    const recommendations = scoredStories.slice(0, 4).map(story => {
      const { embedding, similarityScore, ...safeStory } = story;
      return safeStory;
    });

    return NextResponse.json({
      success: true,
      query: theme,
      recommendations
    });
  } catch (error: any) {
    console.error("Vector Search Error:", error);
    return NextResponse.json({ error: "Failed to perform semantic recommendations" }, { status: 500 });
  }
}
