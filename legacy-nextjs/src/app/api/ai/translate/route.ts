import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { text, title, targetLanguage } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    const isValidKey = apiKey && apiKey.length > 20 && !apiKey.includes("your_key");
    const contentPrompt = `You are an expert literary translator. Translate the following text into ${targetLanguage} while perfectly preserving the author's original tone, emotion, and pacing. Only return the translated text, no extra commentary:\n\n"${text}"`;
    const titlePrompt = title ? `Translate this story chapter title into ${targetLanguage}. Output ONLY the translated title, no extra text or quotes:\n\n"${title}"` : "";

    let translatedText = "";
    let translatedTitle = "";

    if (isValidKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        
        // Translate Content
        const contentPromise = ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: contentPrompt,
        });
        
        // Translate Title if provided
        const titlePromise = title ? ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: titlePrompt,
        }) : Promise.resolve({ text: "" });
        
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("AI Request timed out")), 60000));
        
        const [contentRes, titleRes] = await Promise.race([
          Promise.all([contentPromise, titlePromise]),
          timeoutPromise
        ]) as any;
        
        return NextResponse.json({
          success: true,
          translatedText: contentRes.text || "",
          translatedTitle: titleRes.text || ""
        });
      } catch (aiError) {
        console.error("Gemini API translation failed:", aiError);
        // Fallthrough to pollinations
      }
    }

    // Fallback: Pollinations AI
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      // Execute sequentially to avoid Pollinations queue limits (max 1 concurrent)
      const contentRes = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: contentPrompt }] }),
        signal: controller.signal
      });
      const translatedTextRes = await contentRes.text();
      
      let translatedTitleRes = "";
      if (title) {
        // Add a small delay between requests to be safe
        await new Promise(resolve => setTimeout(resolve, 500));
        const titleRes = await fetch("https://text.pollinations.ai/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [{ role: "user", content: titlePrompt }] }),
          signal: controller.signal
        });
        translatedTitleRes = await titleRes.text();
      }
      
      clearTimeout(timeoutId);
      
      return NextResponse.json({
        success: true,
        translatedText: translatedTextRes,
        translatedTitle: translatedTitleRes
      });
    } catch (pollinationsError: any) {
      console.error("Pollinations translation failed:", pollinationsError);
      return NextResponse.json({
        success: true,
        translatedText: `(Mock Translation into ${targetLanguage} | Error: ${pollinationsError.message}) ` + text,
        translatedTitle: title ? `(Mock) ` + title : ""
      });
    }

  } catch (error) {
    return NextResponse.json({ error: "Failed to translate content" }, { status: 500 });
  }
}
