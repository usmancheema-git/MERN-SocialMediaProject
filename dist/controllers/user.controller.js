import jwt from 'jsonwebtoken';
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { userLogoutService, userLoginService } from "../services/user.services.js";
import { getAuthCookieOptions } from "../utils/cookieOptions.js";
import { v2 as cloudinary } from 'cloudinary';
export const registerUser = async (req, res) => {
    try {
        let profileImageLocalPath;
        let profileImageUrl;
        if (req.file?.path) {
            profileImageLocalPath = req.file.path;
            const cloudinaryResult = await uploadOnCloudinary(profileImageLocalPath);
            if (cloudinaryResult) {
                profileImageUrl = typeof cloudinaryResult === "string"
                    ? cloudinaryResult
                    : cloudinaryResult.url;
            }
        }
        const { username, email, password } = req.body;
        if (!username || username === "") {
            throw new ApiError(400, "username is required");
        }
        if (!email || email === "") {
            throw new ApiError(400, "email is required");
        }
        if (!email.includes("@")) {
            throw new ApiError(400, "invalid email");
        }
        if (!password || password === "") {
            throw new ApiError(400, "password is required");
        }
        let existingUser = await User.findOne({
            $or: [{ username }, { email }],
        });
        if (existingUser) {
            throw new ApiError(409, "User with this email or username already exists.");
        }
        let user;
        if (profileImageUrl) {
            user = await User.create({
                username,
                email,
                password,
                profilePic: profileImageUrl
            });
        }
        else {
            user = await User.create({
                username,
                email,
                password
            });
        }
        return res
            .status(201)
            .json(new ApiResponse(201, {
            success: true,
            user: user,
        }, "User registered successfully"));
    }
    catch (error) {
        console.error("Error: ", error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                errors: error.errors,
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: [],
        });
    }
};
export const loginUser = async (req, res) => {
    try {
        console.log("body", req.body);
        const { username, email, password } = req.body;
        const { accessToken, refreshToken, user } = await userLoginService(username, email, password);
        res
            .cookie("accessToken", accessToken)
            .cookie("refreshToken", refreshToken)
            .json({
            success: true,
            user,
            accessToken,
        });
    }
    catch (error) {
        console.error("Error: ", error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                errors: error.errors,
            });
        }
        return res.status(600).json({
            success: false,
            message: "Internal Server Error",
            errors: [],
        });
    }
};
export const logoutUser = async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, " User not authenticated");
        }
        const userid = req.user._id;
        const user = await userLogoutService(userid);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const cookieOptions = getAuthCookieOptions();
        return res
            .status(200)
            .clearCookie("accessToken", cookieOptions)
            .clearCookie("refreshToken", cookieOptions)
            .json({
            success: true,
            message: " User successfully Logged out ",
        });
    }
    catch (error) {
        console.error("Error: ", error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                errors: error.errors,
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: []
        });
    }
};
export const getUser = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            throw new ApiError(400, ' Ownership failed');
        }
        return res.status(200).json(new ApiResponse(200, user, " Current User fetched successfully "));
    }
    catch (error) {
        console.error("Error: ", error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                errors: error.errors,
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: []
        });
    }
};
export const deleteUser = async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(400, 'User not Authanticated');
        }
        const authenticatedUser = req.user._id;
        if (!authenticatedUser) {
            throw new ApiError(400, 'Ownership failed');
        }
        console.log(authenticatedUser);
        const user = await User.findOneAndDelete(authenticatedUser);
        if (!user) {
            throw new ApiError(401, " User not found ");
        }
        return res.json(new ApiResponse(201, { success: true }, " User Deleted successfully "));
    }
    catch (error) {
        console.error("Error: ", error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                errors: error.errors,
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: []
        });
    }
};
export const getRefreshAndAccessTokens = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.header('Authorization')?.replace('Bearer', "");
        if (!incomingRefreshToken) {
            throw new ApiError(401, 'Unauthorized requests');
        }
        const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
        // const accessTokenSecret: Secret = process.env.ACCESS_TOKEN_SECRET as Secret;
        const decodedToken = jwt.verify(incomingRefreshToken, refreshTokenSecret);
        if (typeof decodedToken !== "object" || decodedToken === null || !("_id" in decodedToken)) {
            throw new ApiError(401, "Invalid refreshToken");
        }
        const userid = decodedToken._id;
        const user = await User.findById(userid);
        if (!user) {
            throw new ApiError(401, " Invalid refreshToken ");
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, " refreshToken  expired or invalid");
        }
        const newrefreshToken = user.generateRefreshToken();
        const newaccessToken = user.generateAccessToken();
        user.refreshToken = newrefreshToken;
        user.save({ validateBeforeSave: false });
        const loggedinUser = await User.findById(user._id).select("-password -refreshToken");
        const cookieOptions = {
            httpOnly: true,
            secure: true
        };
        return res.status(201).cookie('refreshToken', newrefreshToken, cookieOptions).cookie('accessToken', newaccessToken, cookieOptions).json(new ApiResponse(201, {
            refreshToken: newrefreshToken,
            accesstoken: newaccessToken
        }, ' Refresh Token successfully created '));
    }
    catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                errors: []
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: []
        });
    }
};
export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userid = req.user?._id;
        const user = await User.findById(userid);
        if (!oldPassword || !newPassword) {
            throw new ApiError(401, 'both old and new password are required');
        }
        if (!user) {
            throw new ApiError(400, 'Unauthorized requests');
        }
        const ispassworcorrect = await user.isPasswordCorrect(oldPassword);
        if (!ispassworcorrect) {
            throw new ApiError(401, 'old password not correct ');
        }
        user.password = newPassword;
        await user.save();
        return res.status(200).json(new ApiResponse(200, 'Password Changed Successfuly'));
    }
    catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                errors: []
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: []
        });
    }
};
export async function addBio(req, res) {
    try {
        const { newBio } = req.body;
        const userid = req.user?.id;
        if (!newBio || newBio == null || newBio === undefined) {
            throw new ApiError(400, ' Bio is missing ');
        }
        const user = await User.findById(userid);
        if (!user) {
            throw new ApiError(400, ' User not found ');
        }
        user.bio = newBio;
        await user.save();
        return res.status(200).json(new ApiResponse(200, { msg: user.bio }, ' Bio Added Successfuly '));
    }
    catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                errors: []
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: []
        });
    }
}
export async function UpdateBio(req, res) {
    try {
        const { updatedbio } = req.body;
        const userid = req.user?.id;
        if (!updatedbio || updatedbio === "" || updatedbio == null || updatedbio === undefined) {
            throw new ApiError(400, ' Bio is missing ');
        }
        const user = await User.findByIdAndUpdate(userid, { $set: { bio: updatedbio } }, { new: true });
        if (!user) {
            throw new ApiError(400, ' User not found ');
        }
        // await user.save();
        return res.status(200).json(new ApiResponse(200, { msg: user.bio }, ' Bio Updated  Successfuly '));
    }
    catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                errors: []
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: []
        });
    }
}
export const changeProfilePic = async (req, res) => {
    try {
        const userid = req.user?._id;
        const user = await User.findById(userid);
        if (!user) {
            throw new ApiError(401, ' Unauthorized requests  ');
        }
        if (!req.file?.path) {
            throw new ApiError(400, " Profile image is required ");
        }
        let profileImageUrl;
        const localfilepath = req.file?.path;
        const uploadedImage = await uploadOnCloudinary(localfilepath);
        if (!uploadedImage) {
            throw new ApiError(500, "Error occurred while uploading image to Cloudinary");
        }
        profileImageUrl = uploadedImage;
        user.profilePic = profileImageUrl;
        await user.save();
        const oldimage = user.profilePic;
        await removefromCloudinariy(oldimage);
        return res.status(200).json(new ApiResponse(200, { profilepic: user.profilePic }, ' ProfilePic Updated  Successfuly '));
    }
    catch (error) {
        console.error("Error:", error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                errors: []
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: []
        });
    }
};
export const removefromCloudinariy = async (imageUrl) => {
    try {
        const urlArray = imageUrl.split('/');
        const imagenamewithExtension = urlArray[urlArray.length - 1];
        const imageNameArray = imagenamewithExtension.split(".");
        console.log(imageNameArray);
        const imageName = imageNameArray[0];
        console.log(imageName);
        await cloudinary.uploader.destroy(imageName);
    }
    catch (error) {
        console.log("Cloudiary Error :", error);
    }
};
//# sourceMappingURL=user.controller.js.map