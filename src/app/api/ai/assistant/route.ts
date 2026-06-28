import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { action, text } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    const isValidKey = apiKey && apiKey.length > 20 && !apiKey.includes("your_key");

    let prompt = "";
    switch (action) {
      case "rewrite_polish":
        prompt = `You are an expert creative writer and editor. Please rewrite the following text to have better flow, stronger vocabulary, and a more professional tone while preserving the author's original voice and meaning: "${text}". Only return the rewritten text, no explanations.`;
        break;
      case "expand_scene":
        prompt = `You are an expert creative writer. Please expand the following scene/paragraph by adding rich sensory details, character reactions, internal thoughts, and atmospheric description. Make it more immersive: "${text}". Only return the expanded text, no explanations.`;
        break;
      case "brainstorm_next":
        prompt = `You are a creative writing partner. Based on the following text from a story, brainstorm 3 compelling, distinct ideas for what could happen next. Format them as a short bulleted list: "${text}".`;
        break;
      default:
        return NextResponse.json({ suggestion: "Action not supported by AI." });
    }

    if (isValidKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const responsePromise = ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });
        
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("AI Request timed out")), 15000));
        const response = (await Promise.race([responsePromise, timeoutPromise])) as any;
        
        return NextResponse.json({ suggestion: response.text || "" });
      } catch (aiError) {
        console.error("Gemini API call failed in Assistant:", aiError);
        // Fallthrough to pollinations on error
      }
    }

    // Fallback to Pollinations AI
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const result = await response.text();
      return NextResponse.json({ suggestion: result });
    } catch (pollinationsError) {
      console.error("Pollinations API failed:", pollinationsError);
      
      // Ultimate hardcoded fallback
      return NextResponse.json({ 
        suggestion: action === "brainstorm_next" 
          ? "1. A mysterious figure appears.\n2. The main character discovers a hidden secret.\n3. A sudden betrayal changes everything." 
          : "(Mock) " + text + " [This is a mocked enhancement due to missing API keys and network failure]" 
      });
    }

  } catch (error) {
    console.error("AI Assistant error:", error);
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
  }
}
