import express from "express";
import authenticateToken from "../middlewares/authenticateToken.js";
import {requireVerifiedEmail} from "../middlewares/requireVerifiedEmail.js";
import {createPrivateChat, getUserChats, getChatById, createGroupChat} from "../controllers/chatController.js";
import {validateChat, validateGroupChat} from "../services/validateChat.js";
import {validateFields} from "../middlewares/validateFields.js";

const chatRouter = express.Router();

chatRouter.get("/user", authenticateToken, requireVerifiedEmail, getUserChats);
chatRouter.get("/:chatId", authenticateToken, requireVerifiedEmail, getChatById)
chatRouter.post("/private", validateChat, validateFields, authenticateToken, requireVerifiedEmail, createPrivateChat);
chatRouter.post("/group", validateGroupChat, validateFields, authenticateToken, requireVerifiedEmail, createGroupChat);
export default chatRouter;