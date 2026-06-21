import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response, urlencoded } from 'express';
import { router } from './routes/user.route.js';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN ?? true,
    credentials: true,
}));
app.use(express.json());
// app.use(urlencoded({ extended: true, limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// user routes app-Level
app.use("/api/v1/users", router);

export default app;