import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
// login steps : 
// Login Request
//       ↓
// Validate Input
//       ↓
// Find User
//       ↓
// Check Password
//       ↓
// Generate Tokens
//       ↓
// Save Refresh Token
//       ↓
// Send Response

const userLoginService = async (username: string, email: string, password: string) => {

  if (!username && !email) {
    throw new ApiError(400, " username or email is required ");
  }

  if (!password || password === "") {
    throw new ApiError(400, "password is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, " User not found");
  }

  const checkPassword = await user.isPasswordCorrect(password);

  if (!checkPassword) {
    throw new Error("Invalid credentials");
  }
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken };
};



async function userLogoutService(id: string | mongoose.Types.ObjectId) {
  const user = await User.findByIdAndUpdate(id, {
    $unset: {
      refreshToken: "",
    },
  },
    {
      new: true,
    }
  );

  if (!user) {
    throw new ApiError(404, " User not found");
  }

  return true;
}


export { userLogoutService, userLoginService };


