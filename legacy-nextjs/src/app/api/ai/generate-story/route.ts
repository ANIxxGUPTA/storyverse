import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    const isValidKey = apiKey && apiKey.length > 20 && !apiKey.includes("your_key");
    const fullPrompt = `You are an expert creative writer. Generate a new story outline based on this prompt: "${prompt}". 
Return a JSON object with exactly these keys: "title" (string), "description" (string, 1-2 paragraphs), "genre" (string, choose one of: Fiction, Fantasy, Sci-Fi, Romance, Mystery, Thriller, Horror), and "tags" (string, comma-separated keywords). Return ONLY valid JSON, no markdown formatting.`;

    if (isValidKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const responsePromise = ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: fullPrompt,
        });

        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("AI Request timed out")), 15000));
        const response = (await Promise.race([responsePromise, timeoutPromise])) as any;

        let result = response.text || "";
        try {
          result = result.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(result);
          return NextResponse.json(parsed);
        } catch (e) {
          console.error("Failed to parse JSON from Gemini AI story generator:", result);
          // fallthrough to pollinations
        }
      } catch (aiError) {
        console.error("Gemini API call failed:", aiError);
        // Fallthrough to pollinations if real API throws an error
      }
    }

    // Fallback: Use Pollinations AI (Free, no key required) for real generation
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: fullPrompt + " Make sure it is PERFECTLY valid JSON." }] }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      let result = await response.text();
      result = result.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // Sometimes models add extra text. Try to extract just the JSON object.
      const jsonStart = result.indexOf('{');
      const jsonEnd = result.lastIndexOf('}');
      if (jsonStart >= 0 && jsonEnd >= 0) {
        result = result.substring(jsonStart, jsonEnd + 1);
      }
      
      const parsed = JSON.parse(result);
      return NextResponse.json(parsed);
    } catch (pollinationsError) {
      console.error("Pollinations API failed:", pollinationsError);
      // Absolute final hardcoded fallback
      const isFantasy = prompt.toLowerCase().includes("fantasy");
      return NextResponse.json({
        title: isFantasy ? "The Dragon's Ember" : "The Neon Protocol",
        description: isFantasy 
          ? "In a world where dragons are hunted for their magical scales, one young baker discovers a wounded hatchling that could change the fate of the kingdom."
          : "In a cyberpunk future, a rogue AI discovers the secret to human consciousness, setting off a chain reaction that could destroy or save humanity.",
        genre: isFantasy ? "Fantasy" : "Sci-Fi",
        tags: isFantasy ? "fantasy, dragons, magic" : "cyberpunk, ai, future"
      });
    }

  } catch (error) {
    console.error("AI Story Generator error:", error);
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
  }
}
