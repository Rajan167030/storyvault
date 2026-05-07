import { Router } from "express";
const router = Router();
import { scrapeStories } from "../controller/story.controller.js";
import { getStories } from "../controller/story.controller.js";

router.get('/' , getStories);
router.post('/scrape' , scrapeStories);

export default router;