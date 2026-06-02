import mongoose from "mongoose";
import {DB_NAME} from "../constant.js";


const url = process.env.DB_URL ;

const ConnectionTODB = async () => {
    try {
        if (typeof url === 'string') {
            await mongoose.connect(url);
        }

    } catch (err: unknown) {
        if (typeof err === 'string') {
            throw new Error(` Database connection failed: ${err}`);
        }
        return `some thing happend in connecting with the Database`;
    }
}


export { ConnectionTODB };