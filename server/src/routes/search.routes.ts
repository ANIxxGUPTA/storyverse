import { Router } from "express";
import { searchStories } from "../controllers/search.controller";

const router = Router();

router.get("/", searchStories);

export default router;
