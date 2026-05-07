import { Router } from "express";
const router = Router();
import { protect } from "../middleware/user.middleware.js";
import { register , login , bookmarkStory  , getBookmarkedStories , logout} from "../controller/auth.controller.js";
router.post('/register' , register);
router.post('/login' , login);
router.post('/bookmark/:storyId' , protect , bookmarkStory);
router.get('/test' , protect , async (req, res) => {
    const user = await req.user.populate('bookmarkedStories');
    return res.json({ message: 'Authenticated', user });
});
router.get('/getuserstories' , protect , getBookmarkedStories);
router.post('/logout' , logout);
export default router;
