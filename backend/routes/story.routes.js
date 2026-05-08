import { Router } from "express";
const router = Router();
import { getStories, getStoryById, scrapeStories } from "../controller/story.controller.js";
import { bookmarkStory } from "../controller/auth.controller.js";
import { protect } from "../middleware/user.middleware.js";

router.get('/', getStories);
router.get('/:id', getStoryById);
router.post('/scrape', scrapeStories);
router.post('/:storyId/bookmark', protect, bookmarkStory);

export default router;