import bcrypt from 'bcrypt'
import jwt, {SignOptions , Secret} from 'jsonwebtoken';
import { Document } from 'mongodb';
import mongoose from 'mongoose';


export interface IUser{
    username : string,
    email : string,
    password : string,
    bio ?: string,
    profilePic : string
    post : mongoose.Types.ObjectId;
    followers : mongoose.Types.ObjectId;
    following : mongoose.Types.ObjectId;
    refreshToken ?: string
}

export interface IUserMethods{
    isPasswordCorrect(password:string): Promise <boolean>
    generateAccessToken(): string,
    generateRefreshToken(): string,

}

export interface  IUserDocument extends  IUser , Document , IUserMethods {}