import express from 'express';
import { registerUser, loginUser, logoutUser, getUser , deleteUser} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/Jwt.middleware.js';
const router = express.Router();

// // user routes route-Level:
router.post('/auth/register', upload.single("profilePic"), registerUser);
router.post('/auth/login'                , loginUser);
router.post('/auth/logout'               , verifyJWT, logoutUser); // AUTH Middleware use for requested user;
router.get('/auth/me'                    , verifyJWT, getUser);
router.delete('/auth/delete-account'     , verifyJWT, deleteUser);

export { router };