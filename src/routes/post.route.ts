import express from 'express';
import { 
    createPost,
    getAllPosts,
    getPostById,
    getAllPostsForHome,
    getuserPosts
} from "../controllers/post.controller";
import { upload } from '../middlewares/multer.middleware';
import { verifyJWT } from '../middlewares/Jwt.middleware';
import { defaultMaxListeners } from 'node:events';
const router = express.Router();

router.use(verifyJWT);
router.post("/create-post",verifyJWT , upload.single('image'),createPost);
router.get("/all-posts", verifyJWT , getAllPostsForHome);
router.get("/:postid", getPostById);
router.get('/users-posts/:username',getuserPosts)

// router.get("/user/:userId", getUserPosts);
// router.patch("/:id", updatePost);
// router.delete("/:id", deletePost);

export default router;