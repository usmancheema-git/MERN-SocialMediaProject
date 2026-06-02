import mongoose from "mongoose";
const postSchema = new mongoose.Schema(
    {
        owner: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        content: {
            type: String,
            required:true
        },

        image: {
            type: String
        },

        likes:[
            {
               type: mongoose.Schema.Types.ObjectId,
                ref: "" 
            }
        ],

        comments:[
            {
               type: mongoose.Schema.Types.ObjectId,
                ref: "" 
            }
        ]
    },
    { timestamps: true }
)


export const Post = mongoose.model('Post', postSchema)