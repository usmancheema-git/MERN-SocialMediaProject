import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { urlencoded } from 'express'
const app = express();

app.use(express.json());
app.use(urlencoded({extended:true ,limit:"16kb"}))
app.use(cookieParser());
// app.use(cors(urlencoded:true))



// test routes 

import tesRouter from './routes/testRoute'
app.use("/api/v1/test",tesRouter)

export default app;