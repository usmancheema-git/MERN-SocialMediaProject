import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    bio: {
        type: String
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    following: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
    profilePic: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String
    },
}, { timestamps: true });
userSchema.pre('save', async function () {
    if (!this.isModified("password")) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};
userSchema.methods.generateAccessToken = function () {
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const options = { expiresIn: process.env.ACCESS_TOKEN_EXPIRY };
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username
    }, accessTokenSecret, options);
};
userSchema.methods.generateRefreshToken = function () {
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    const options = { expiresIn: process.env.REFRESH_TOKEN_EXPIRY };
    return jwt.sign({
        _id: this._id,
    }, refreshTokenSecret, options);
};
export const User = mongoose.model('User', userSchema);
//# sourceMappingURL=user.model.js.map