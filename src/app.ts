import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response, urlencoded } from 'express';
import userrouter from './routes/user.route';
import postrouter from './routes/post.route.js';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN ?? true,
    credentials: true,
}));

app.get("/", (req, res) => {
    res.status(200).json({
        message: "API is running"
    });
});

app.use(express.json());
// app.use(urlencoded({ extended: true, limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// user routes app-Level
app.use("/api/v1/users", userrouter);
app.use("/api/v1/posts", postrouter);

export default app;