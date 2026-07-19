import { Router } from "express";
import {
  getStories,
  getStory,
  createStory,
  updateStory,
  deleteStory,
  createChapter,
  updateChapter,
  reorderChapters,
  deleteChapter
} from "../controllers/story.controller";
import { requireAuth } from "../middleware/requireAuth";
import { requireOwner } from "../middleware/requireOwner";
import Story from "../models/Story";

const router = Router();

router.get("/", getStories);
router.get("/:id", getStory);
router.post("/", requireAuth, createStory);

router.put("/:id", requireAuth, requireOwner(Story, "id", "author"), updateStory);
router.delete("/:id", requireAuth, requireOwner(Story, "id", "author"), deleteStory);

router.post("/:id/chapters", requireAuth, requireOwner(Story, "id", "author"), createChapter);

// Note: the reorder endpoint is /:id/chapters/reorder, so it must come BEFORE /:id/chapters/:chapterId
router.put("/:id/chapters/reorder", requireAuth, requireOwner(Story, "id", "author"), reorderChapters);

// update/delete chapter also requires ownership of the Story
router.put("/:id/chapters/:chapterId", requireAuth, requireOwner(Story, "id", "author"), updateChapter);
router.delete("/:id/chapters/:chapterId", requireAuth, requireOwner(Story, "id", "author"), deleteChapter);

export default router;
