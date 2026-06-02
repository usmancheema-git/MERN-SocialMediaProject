import mongoose from "mongoose";
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {accessTokenSecret , accesstokenExpiry} from "../types/env"
import { Sign } from "crypto";
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        bio: {
            type: String
        },
        posts:[
            {
                type : mongoose.Schema.Types.ObjectId,
                ref  : "Post"
            }
        ],
        profilePic: {
            type: String
        },
        refreshToken:{
            type : String
        },
        password: {
            type: String,
            required: true
        },

    },
    { timestamps: true }
)

userSchema.pre('save', async function () {
    if (!this.isModified("password")) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods.isPasswordCorrect = async function (password:string){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.genrateAccessToken =  function (){
    const accessTokenSecret : Secret = process.env.ACCESS_TOKEN_SECRET as Secret;
    const options : SignOptions={expiresIn :process.env.ACCESS_TOKEN_EXPIRY as SignOptions['expiresIn']}
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username
    },accessTokenSecret,options)
}


userSchema.methods.genrateRefresToken =  function (){
    const refreshTokenSecret : Secret = process.env.REFRESH_TOKEN_SECRET as Secret;
    const options : SignOptions={expiresIn :process.env.REFRESH_TOKEN_EXPIRY as SignOptions['expiresIn']}
    return jwt.sign({
        _id: this._id,
       
    },refreshTokenSecret,options)
}

export const User = mongoose.model('User', userSchema)
