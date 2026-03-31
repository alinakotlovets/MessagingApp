import "dotenv/config"
import express from "express";
import cors from "cors";
import {errorHandler} from "./middlewares/errorHandler.js";
import authRouter from "./routes/authRouter.js";
import chatRouter from "./routes/chatRouter.js";
import messageRouter from "./routes/messageRouter.js";
import userRouter from "./routes/userRouter.js";

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_LINK,
    credentials: true
}))


app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.use("/user", userRouter);
app.use("/message", messageRouter);
app.use("/auth", authRouter);
app.use("/chat", chatRouter);


app.use(errorHandler);

const port = 3000;

app.listen(port, ()=>{
    console.log(`app listen on ${port}`)
})

