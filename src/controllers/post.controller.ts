import { ApiError } from "../utils/ApiError";
import { Request, Response } from "express";
import { v2 as cloudinary } from 'cloudinary';
import { uploadOnCloudinary } from "../utils/cloudinary";
import { User } from "../models/user.model";
import { Post } from "../models/post.model";
import { ApiResponse } from "../utils/ApiResponse";
import { lookup } from "node:dns";
// post.controller.ts

// createPost

// getAllPosts

// getPostById

// getUserPosts

// updatePost

// deletePost


export const createPost = async (req: Request, res: Response) => {
    try {
        let imageLocalPath;
        let image;
        let post;

        if (req.file?.path) {
            imageLocalPath = req.file.path;
            image = await uploadOnCloudinary(imageLocalPath);
        }

        const { content } = req.body;
        const userid = req.user?._id;

        if (!content) {
            throw new ApiError(400, ' hello content is missing');

        }
        const user = await User.findById(userid);
        if (!user) {
            throw new ApiError(404, 'user not found');
        }



        if (image === undefined) {
            post = await Post.create({
                owner: userid,
                content

            })
        } else {
            await Post.create({
                content,
                image: image,
                owner: userid
            });
        }



        return res.status(201).json(new ApiResponse(201, { msg: post }, ' post created successfuly '));

    } catch (error: unknown) {
        console.error("Error:", error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                errors: []
            })
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: []
        });
    }
};


export const getAllPosts = async (req: Request, res: Response) => {
    try {
        // const userid =  req.user?._id;
        const posts = await Post.find();
        return res.status(200).json(new ApiResponse(201, { msg: posts }, ' post fetched successfuly '));

    } catch (error: unknown) {
        console.error("Error:", error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                errors: []
            })
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: []
        });
    }
}


export const getPostById = async (req: Request, res: Response) => {
    try {
        const { postid } = req.params;
        const posts = await Post.findById(postid);

        if (!posts) {
            throw new ApiError(404, "Post not found");
        }
        return res.status(200).json(new ApiResponse(200, { msg: posts }, ` post ${postid}fetched successfuly`));


    } catch (error: unknown) {
        console.error("Error:", error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                errors: []
            })
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: []
        });
    }
}

export const getAllPostsForHome = async (req: Request, res: Response) => {
    try {
        const posts = await Post.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner"
                }
            },

            {
                $unwind:{
                    path : "$owner",
                    preserveNullAndEmptyArrays : true
                }
            }
            ,

            {
                $project:{
                    "owner.password"     : 0,
                    "owner.refreshToken" : 0,
                    "owner.__v"          :0,


                }
            },
            
            {
                $lookup:{
                    from : 'comments',
                    localField: "comments",
                    foreignField: "_id",
                    as: "comments"
                }
            },
            {
                $lookup:{
                    from : 'users',
                    localField: "comments.commentedBy",
                    foreignField: "_id",
                    as: "commentUsers"
                }
            }


        ])
        console.log(posts);
    return res.status(200).json(new ApiResponse(200, { msg: posts }, `post Fetched successfuly`));

    } catch (error: unknown) {
        console.error("Error:", error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                errors: []
            })
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: []
        });
    }
}