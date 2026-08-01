import { Request, Response } from "express";
import { geminiService } from "../services/gemini.service";

export const generateStory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Missing prompt" });
      return;
    }
    const result = await geminiService.generateStoryOutline(prompt);
    res.json(result);
  } catch (error) {
    console.error("Generate Story Error:", error);
    res.status(500).json({ error: "Failed to generate story" });
  }
};

export const generateChapter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, context } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Missing prompt" });
      return;
    }
    const fullPrompt = `${prompt}\nContext: ${context || ""}`;
    const result = await geminiService.assistantAction("expand_scene", fullPrompt);
    res.json({ content: result.suggestion });
  } catch (error) {
    console.error("Generate Chapter Error:", error);
    res.status(500).json({ error: "Failed to generate chapter" });
  }
};

export const generateCover = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, title } = req.body;
    const finalPrompt = prompt || title || "A beautiful story cover";
    const encodedPrompt = encodeURIComponent(finalPrompt);
    const coverUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=400&height=600&nologo=true`;
    res.json({ coverUrl });
  } catch (error) {
    console.error("Generate Cover Error:", error);
    res.status(500).json({ error: "Failed to generate cover" });
  }
};


