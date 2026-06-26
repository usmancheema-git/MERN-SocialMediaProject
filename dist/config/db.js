import mongoose from "mongoose";
// const url = process.env.DB_URL ;
const ConnectionTODB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Database connection failed: ${message}`);
    }
};
export { ConnectionTODB };
//# sourceMappingURL=db.js.map