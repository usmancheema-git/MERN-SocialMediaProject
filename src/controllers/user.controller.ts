import { json, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { userLogoutService, userLoginService } from "../services/user.services.js";
import { getAuthCookieOptions } from "../utils/cookieOptions.js";
import { stringify } from "querystring";


export const registerUser = async (req: Request, res: Response) => {
  try {
    let profileImageLocalPath;
    let profileImageUrl;
    if (req.file?.path) {
      profileImageLocalPath = req.file.path;
      const cloudinaryResult = await uploadOnCloudinary(profileImageLocalPath);
      if (cloudinaryResult) {
        profileImageUrl = typeof cloudinaryResult === "string"
          ? cloudinaryResult
          : (cloudinaryResult as { url: string }).url;
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
      throw new ApiError(400, "passowrd is required");
    }

    let existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ApiError(
        409,
        "User with this email or username already exists."
      );
    }

    let user;
    if (profileImageUrl) {
      user = await User.create({
        username,
        email,
        password,
        profilePic: profileImageUrl,
      });
    } else {
      user = await User.create({
        username,
        email,
        password,
      });
    }



    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          {
            success: true,
            user: user,

          },
          "User registered successfully"
        )
      );
  } catch (error: unknown) {
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

export const loginUser = async (req: Request, res: Response) => {
  try {
    console.log("body", req.body);

    const { username, email, password } = req.body;

    const { accessToken, refreshToken, user } = await userLoginService(username, email, password);

    res
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", refreshToken)
      .json({
        success: true,
        accessToken,
        user
      });
  } catch (error: unknown) {
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


export const logoutUser = async (req: Request, res: Response) => {
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

  } catch (error: unknown) {
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


export const getUser = async (req: Request, res: Response) :Promise<Response> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "User not authenticated");
    }
    const authenticatedUser = req.user;
    if (!authenticatedUser) {
      throw new ApiError(400, 'Ownership failed')
    }
    const user = await User.findOne(authenticatedUser);
    if (!user) {
      throw new ApiError(401, " User not found ");
    }

    return res.status(200).json(new ApiResponse(201, { success: true, user: `${String(user)}\n`, }, "User fetched successfully"))


  } catch (error: unknown) {
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
}

export const deleteUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new ApiError(400, 'User not Authanticated');
    }
    const authenticatedUser = req.user._id;
    if (!authenticatedUser) {
      throw new ApiError(400, 'Ownership failed')
    }
    console.log(authenticatedUser);

    const user = await User.findOneAndDelete(authenticatedUser);
    if (!user) {
      throw new ApiError(401, " User not found ");
    }

    return res.json(new ApiResponse(201, { success: true }, " User Deleted successfully "))


  } catch (error: unknown) {
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
}