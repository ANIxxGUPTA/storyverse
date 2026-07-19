import { Router } from "express";
import { getFeed, createPost, deletePost } from "../controllers/feed.controller";
import { requireAuth } from "../middleware/requireAuth";
import { requireOwner } from "../middleware/requireOwner";
import Post from "../models/Post";

const router = Router();

router.get("/", getFeed);
router.post("/", requireAuth, createPost);
router.delete("/:id", requireAuth, requireOwner(Post, "id", "author"), deletePost);

export default router;
