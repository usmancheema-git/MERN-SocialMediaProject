import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";


// const url = process.env.DB_URL ;

const ConnectionTODB = async () => {
    try {

        await mongoose.connect(process.env.DB_URL as string);



    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Database connection failed: ${message}`);
    }
}


export { ConnectionTODB };