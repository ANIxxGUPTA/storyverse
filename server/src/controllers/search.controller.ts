import { Request, Response } from "express";
import Story from "../models/Story";
import { embed, cosineSimilarity } from "../services/embeddings.service";

export const searchStories = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;

    if (!query) {
      res.status(400).json({ error: "Missing query parameter 'q'" });
      return;
    }

    // 1. Generate the embedding vector for the semantic query
    let queryVector;
    try {
      queryVector = await embed(query);
    } catch (e) {
      console.warn("Semantic search failed (possibly missing Gemini API Key). Falling back to Regex search.");
      // Fallback: standard regex search
      const regexStories = await Story.find({
        status: "ongoing",
        title: { $regex: query, $options: "i" }
      }).populate("author", "username profilePicture").lean();
      
      res.json({
        success: true,
        query,
        results: regexStories
      });
      return;
    }

    // 2. Fetch all stories that have pre-computed embeddings
    const allStories = await Story.find({
      status: "ongoing",
      embedding: { $exists: true, $not: { $size: 0 } }
    })
      .populate("author", "username profilePicture")
      .lean();

    // 3. Perform In-Memory Vector Search using Cosine Similarity
    const scoredStories = allStories.map((story: any) => {
      const score = cosineSimilarity(queryVector, story.embedding);
      return { ...story, similarityScore: score };
    });

    // 4. Sort by highest similarity score (closest semantic match)
    scoredStories.sort((a, b) => b.similarityScore - a.similarityScore);

    // Filter out stories that don't match the vibe well enough
    const SIMILARITY_THRESHOLD = 0.65;
    const relevantStories = scoredStories.filter((s: any) => s.similarityScore >= SIMILARITY_THRESHOLD);

    // 5. Take top matches and remove the raw embeddings from the response payload
    const recommendations = relevantStories.slice(0, 10).map((story: any) => {
      const { embedding, similarityScore, ...safeStory } = story;
      return safeStory;
    });

    res.json({
      success: true,
      query,
      results: recommendations
    });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ error: "Failed to perform search" });
  }
};
