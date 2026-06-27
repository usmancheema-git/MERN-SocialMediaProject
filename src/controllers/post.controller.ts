import { ApiError } from "../utils/ApiError";
import { Request, Response } from "express";
import { v2 as cloudinary } from 'cloudinary';
import { uploadOnCloudinary } from "../utils/cloudinary";
import { User } from "../models/user.model";
import { Post } from "../models/post.model";
import { ApiResponse } from "../utils/ApiResponse";
import { lookup } from "node:dns";
import { profile } from "node:console";
import { Comment } from "../models/comment.model";
import { create } from "node:domain";
// post.controller.ts

// createPost

// getAllPosts

// getPostById

// getUserPosts

// updatePost

// deletePost


export const createPost = async (req: Request, res: Response) => {
    try {
        let imageLocalPath: string | undefined;
        let image: string | undefined;
        let post: any;

        if (req.file?.path) {
            imageLocalPath = req.file.path;
            const uploadedImage = await uploadOnCloudinary(imageLocalPath);
            if (uploadedImage) {
                image = uploadedImage;
            }
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

        const postData: { content: string; owner: string | undefined; image?: string } = {
            content,
            owner: userid,
        };

        if (image) {
            postData.image = image;
        }

        post = await Post.create(postData);



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
                $unwind: {
                    path: "$owner",
                    preserveNullAndEmptyArrays: true
                }
            }
            ,

            {
                $project: {
                    "owner.password": 0,
                    "owner.refreshToken": 0,
                    "owner.__v": 0,


                }
            },

            {
                $lookup: {
                    from: 'comments',
                    localField: "comments",
                    foreignField: "_id",
                    as: "comments"
                }
            },
            {
                $lookup: {
                    from: 'users',
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


// export const getuserPosts = async (req: Request, res: Response) => {
//     try {

    
//     const {username } =  req.params;
//     if(!username){
//         throw new ApiError(404,'username not found')
//     }

//     const posts = await Post.aggregate([
//         {
//             $lookup:{
//                 from : 'users',
//                 localField:"owner",
//                 foreignField : '_id',
//                 as : 'owner'
//             }
//         },

//         {
//             $unwind:"$owner",
//         },
//         {
//             $match:{
//                 'owner.username':username
//             }
//         },

//         {
//             $lookup:{
//                 from:"users",
//                 localField : 'comments.commentedBy',
//                 foreignField : "_id",
//                 as : "commentsUsers"
//             }
//         },

//         {
//             $project :{
//                 content :1,
//                 image : 1,
//                 createdAt :1,
//                 commentCount :1,
//                 owner : {
//                     _id : "owner._id",
//                     username: "$owner.username",
//                     profileImage : "$owner.profileImage",
//                     comments :{
//                          _id : 1,
//                          comment :1,
//                          commentedBy :1,
//                     }

//                 }
//             }
//         },

//         {
//             $sort: {createdAt :-1},
//         }

    


//     ])

// return res.status(200).json(new ApiResponse(200, posts, ` user post Fetched successfuly`));

//     } catch (error:unknown) {
//         console.error("Error:", error);
//         if (error instanceof ApiError) {
//             return res.status(error.statusCode).json({
//                 success: false,
//                 message: error.message,
//                 errors: []
//             })
//         }

//         return res.status(500).json({
//             success: false,
//             message: "Internal Server Error",
//             errors: []
//         });
//     }
// }


export const getuserPosts = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;

        if (!username) {
            throw new ApiError(404, "Username not found");
        }

        const posts = await Post.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                },
            },
            {
                $unwind: "$owner",
            },
            {
                $match: {
                    "owner.username": username,
                },
            },
            {
                $project: {
                    content: 1,
                    image: 1,
                    createdAt: 1,
                    comments: 1,
                    commentCount: {
                        $size: "$comments",
                    },
                    owner: {
                        _id: "$owner._id",
                        username: "$owner.username",
                        profileImage: "$owner.profileImage",
                    },
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
        ]);

        return res
            .status(200)
            .json(new ApiResponse(200, posts, "User posts fetched successfully"));
    } catch (error: unknown) {
        console.error(error);

        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                errors: [],
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: [],
        });
    }
};