import express from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    getUser,
    deleteUser,
    getRefreshAndAccessTokens,
    changePassword,
    changeBio

} from '../controllers/user.controller.js';


import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/Jwt.middleware.js';
const router = express.Router();

// // user routes route-Level:
// protected routes
router.post('/auth/register', upload.single("profilePic"), registerUser);
router.post('/auth/login', loginUser);
router.post('/auth/logout', verifyJWT, logoutUser); // AUTH Middleware use for requested user;
router.post('/auth/accessrefreshtoken', getRefreshAndAccessTokens);

// User Account- Actions:

router.get('/account/me', verifyJWT, getUser);
router.delete('/account/delete-account', verifyJWT, deleteUser);
router.post('/account/change-Password', verifyJWT, changePassword);
router.post('/account/change-bio', verifyJWT, changeBio);




export { router };