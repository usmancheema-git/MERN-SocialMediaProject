import express from 'express';
import { registerUser, loginUser, logoutUser, getUser, deleteUser, getRefreshAndAccessTokens, changePassword, addBio, UpdateBio, changeProfilePic } from '../controllers/user.controller.js';
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
router.post('/account/add-bio', verifyJWT, addBio);
router.patch('/account/update-bio', verifyJWT, UpdateBio);
// router.patch('/account/update-profile-image', upload.single('profilePic'), verifyJWT, changeProfilePic);
router.route('/account/update-profileImage').patch(upload.single('profilePic'), verifyJWT, changeProfilePic);
export { router };
//# sourceMappingURL=user.route.js.map