import mongoose, { Model } from "mongoose";
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
// import { accessTokenSecret, accesstokenExpiry, refreshTokenSecret, refreshTokenExpiry } from "../types/env";
import { Sign } from "crypto";
import { IPostDocument, IUserDocument } from '../types/index'
const userSchema = new mongoose.Schema<IPostDocument , Model<IPostDocument>>(
    {
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


    },
    { timestamps: true }
)

userSchema.pre<IUserDocument>('save', async function () {
    if (!this.isModified("password")) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods.isPasswordCorrect = async function (password: string) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function (): string {
    const accessTokenSecret: Secret = process.env.ACCESS_TOKEN_SECRET as Secret;
    const options: SignOptions = { expiresIn: process.env.ACCESS_TOKEN_EXPIRY as SignOptions['expiresIn'] }
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username
    }, accessTokenSecret, options)
}


userSchema.methods.generateRefreshToken = function (): string {
    const refreshTokenSecret: Secret = process.env.REFRESH_TOKEN_SECRET as Secret;
    const options: SignOptions = { expiresIn: process.env.REFRESH_TOKEN_EXPIRY as SignOptions['expiresIn'] }
    return jwt.sign({
        _id: this._id,

    }, refreshTokenSecret, options)
}

export const User = mongoose.model<IUserDocument>('User', userSchema)
