import { Router } from "express";
import { generateStory, generateChapter, generateCover } from "../controllers/ai.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

// We require authentication for all AI generation tools to prevent abuse
router.post("/generate-story", requireAuth, generateStory);
router.post("/generate-chapter", requireAuth, generateChapter);
router.post("/generate-cover", requireAuth, generateCover);

export default router;
