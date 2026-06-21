import fs from "fs";
import multer from "multer";

const uploadDir = "./public/temp";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, uploadDir);
    },

    filename(req, file, cb) {
        cb(null, file.originalname);
    },
});

export const upload = multer({
    storage,
})