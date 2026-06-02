import { ApiError } from "../utils/ApiError"
import { ApiResponse } from "../utils/ApiResponse"
import { Request, Response } from "express";

const testcontroller = async (req: Request, res: Response) => {
    try {
        res.status(200).json(new ApiResponse(200,{data:212},'api response'));
    } catch (error) {
        
        console.log(error);
    }
}


// let error = new ApiError(400, "hello");

export {testcontroller};