import { Router } from "express";
import {
  getUserProfile,
  updateMe,
  getMyStories,
  getMyFeed
} from "../controllers/user.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

// "me" routes must come before "/:username" to prevent "me" being interpreted as a username
router.put("/me", requireAuth, updateMe);
router.get("/me/stories", requireAuth, getMyStories);
router.get("/me/feed", requireAuth, getMyFeed);

router.get("/:username", getUserProfile);

export default router;
