import { Router } from "express";
const router = Router();
import { scrapeStories } from "../controller/story.controller";
router.post('/scrape' , scrapeStories);

export default router;