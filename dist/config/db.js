import mongoose from "mongoose";
import DB_NAME from "../constant.js";
const ConnectionTODB = async () => {
    mongoose.connect(DB_NAME);
};
