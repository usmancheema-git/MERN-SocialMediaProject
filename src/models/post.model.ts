import mongoose from "mongoose";
import { IPostDocument } from "../types";
const postSchema = new mongoose.Schema(
    {
        

        content: {
            type: String,
            required:true
        },

        image: {
            type: String
        },

        owner: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
        // likes:[
        //     {
        //        type: mongoose.Schema.Types.ObjectId,
        //         ref: "" 
        //     }
        // ],

        comments:[
            {
               type: mongoose.Schema.Types.ObjectId,
                ref: "Comment" 
            }
        ]
    },
    { timestamps: true }
)


export const Post = mongoose.model<IPostDocument>('Post', postSchema)