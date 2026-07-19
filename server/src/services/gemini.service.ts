import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "";
const isValidKey = apiKey && apiKey.length > 20 && !apiKey.includes("your_key");

let ai: GoogleGenAI | null = null;
if (isValidKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const geminiService = {
  /**
   * Generates a story outline based on a prompt.
   */
  async generateStoryOutline(prompt: string) {
    const fullPrompt = `You are an expert creative writer. Generate a new story outline based on this prompt: "${prompt}". 
Return a JSON object with exactly these keys: "title" (string), "description" (string, 1-2 paragraphs), "genre" (string, choose one of: Fiction, Fantasy, Sci-Fi, Romance, Mystery, Thriller, Horror), and "tags" (string, comma-separated keywords). Return ONLY valid JSON, no markdown formatting.`;

    if (ai) {
      try {
        const responsePromise = ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: fullPrompt,
        });

        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("AI Request timed out")), 15000));
        const response = (await Promise.race([responsePromise, timeoutPromise])) as any;

        let result = response.text || "";
        result = result.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(result);
      } catch (e) {
        console.error("Gemini API call failed:", e);
        // Fallback to Pollinations
      }
    }

    return await this.fallbackToPollinations(fullPrompt);
  },

  /**
   * Helper for assistant actions (rewrite, expand, brainstorm).
   */
  async assistantAction(action: string, text: string) {
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
        throw new Error("Action not supported by AI.");
    }

    if (ai) {
      try {
        const responsePromise = ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });
        
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("AI Request timed out")), 15000));
        const response = (await Promise.race([responsePromise, timeoutPromise])) as any;
        
        return { suggestion: response.text || "" };
      } catch (aiError) {
        console.error("Gemini API call failed in Assistant:", aiError);
      }
    }

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
      return { suggestion: result };
    } catch (pollinationsError) {
      console.error("Pollinations API failed:", pollinationsError);
      return { 
        suggestion: action === "brainstorm_next" 
          ? "1. A mysterious figure appears.\n2. The main character discovers a hidden secret.\n3. A sudden betrayal changes everything." 
          : "(Mock) " + text + " [This is a mocked enhancement due to missing API keys and network failure]" 
      };
    }
  },

  /**
   * Translates content and optional title.
   */
  async translateContent(text: string, targetLanguage: string, title?: string) {
    const contentPrompt = `You are an expert literary translator. Translate the following text into ${targetLanguage} while perfectly preserving the author's original tone, emotion, and pacing. Only return the translated text, no extra commentary:\n\n"${text}"`;
    const titlePrompt = title ? `Translate this story chapter title into ${targetLanguage}. Output ONLY the translated title, no extra text or quotes:\n\n"${title}"` : "";

    if (ai) {
      try {
        const contentPromise = ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: contentPrompt,
        });
        
        const titlePromise = title ? ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: titlePrompt,
        }) : Promise.resolve({ text: "" });
        
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("AI Request timed out")), 60000));
        
        const [contentRes, titleRes] = await Promise.race([
          Promise.all([contentPromise, titlePromise]),
          timeoutPromise
        ]) as any;
        
        return {
          translatedText: contentRes.text || "",
          translatedTitle: titleRes.text || ""
        };
      } catch (aiError) {
        console.error("Gemini API translation failed:", aiError);
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const contentRes = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: contentPrompt }] }),
        signal: controller.signal
      });
      const translatedTextRes = await contentRes.text();
      
      let translatedTitleRes = "";
      if (title) {
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
      
      return {
        translatedText: translatedTextRes,
        translatedTitle: translatedTitleRes
      };
    } catch (pollinationsError: any) {
      console.error("Pollinations translation failed:", pollinationsError);
      return {
        translatedText: `(Mock Translation into ${targetLanguage} | Error: ${pollinationsError.message}) ` + text,
        translatedTitle: title ? `(Mock) ` + title : ""
      };
    }
  },

  /**
   * Shared fallback method to Pollinations AI
   */
  async fallbackToPollinations(fullPrompt: string) {
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
      
      const jsonStart = result.indexOf('{');
      const jsonEnd = result.lastIndexOf('}');
      if (jsonStart >= 0 && jsonEnd >= 0) {
        result = result.substring(jsonStart, jsonEnd + 1);
      }
      
      return JSON.parse(result);
    } catch (pollinationsError) {
      console.error("Pollinations API failed:", pollinationsError);
      const isFantasy = fullPrompt.toLowerCase().includes("fantasy");
      return {
        title: isFantasy ? "The Dragon's Ember" : "The Neon Protocol",
        description: isFantasy 
          ? "In a world where dragons are hunted for their magical scales, one young baker discovers a wounded hatchling that could change the fate of the kingdom."
          : "In a cyberpunk future, a rogue AI discovers the secret to human consciousness, setting off a chain reaction that could destroy or save humanity.",
        genre: isFantasy ? "Fantasy" : "Sci-Fi",
        tags: isFantasy ? ["fantasy", "dragons", "magic"] : ["cyberpunk", "ai", "future"]
      };
    }
  }
};
