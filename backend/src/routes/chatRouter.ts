import express from "express";
import authenticateToken from "../middlewares/authenticateToken.js";
import {requireVerifiedEmail} from "../middlewares/requireVerifiedEmail.js";
import {createPrivateChat, getUserChats, getChatById} from "../controllers/chatController.js";

const chatRouter = express.Router();

chatRouter.get("/:chatId", authenticateToken, requireVerifiedEmail, getChatById)
chatRouter.get("/user/:userId", authenticateToken, requireVerifiedEmail, getUserChats);
chatRouter.post("/private",authenticateToken, requireVerifiedEmail, createPrivateChat);
export default chatRouter;