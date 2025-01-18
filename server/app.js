import express from "express"
import {config } from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
export const app= express();
import { connection } from "./database/dbconnection.js";
import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./routes/userRoutes.js"
config({path:"./config.env"});
import {removeUnverifiedAccounts}  from "./automation/removeunverifiedaccount.js"
app.use(cors({
    origin: [process.env.FRONTEND_URL],
    methods:["GET","POST","PUT","DELETE"],
    credentials:true
}))

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/api/v1/user",userRouter);

removeUnverifiedAccounts()
connection();

app.use(errorMiddleware);

