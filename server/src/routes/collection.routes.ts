import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  getUserCollections,
  createCollection,
  addStoryToCollection,
} from "../controllers/collection.controller";

const router = Router();

router.get("/", requireAuth, getUserCollections);
router.post("/", requireAuth, createCollection);
router.post("/:id/add", requireAuth, addStoryToCollection);

export default router;
