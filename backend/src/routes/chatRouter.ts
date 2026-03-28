import express from "express";
import authenticateToken from "../middlewares/authenticateToken.js";
import {requireVerifiedEmail} from "../middlewares/requireVerifiedEmail.js";
import {createPrivateChat, getUserChats, getChatById, createGroupChat, addUserToGroupChat, deleteChat} from "../controllers/chatController.js";
import {validateChat, validateGroupChat, validateAddUserToGroupChat} from "../services/validateChat.js";
import {validateFields} from "../middlewares/validateFields.js";
import {upload} from "../utils/multer.js";
import {validateAvatar} from "../middlewares/validateAvatar.js";

const chatRouter = express.Router();

chatRouter.delete("/:chatId", authenticateToken, requireVerifiedEmail, deleteChat)
chatRouter.get("/user", authenticateToken, requireVerifiedEmail, getUserChats);
chatRouter.get("/:chatId", authenticateToken, requireVerifiedEmail, getChatById)
chatRouter.post("/private", validateChat, validateFields, authenticateToken, requireVerifiedEmail, createPrivateChat);
chatRouter.put("/group/user", validateAddUserToGroupChat, validateFields, authenticateToken, requireVerifiedEmail, addUserToGroupChat);
chatRouter.post("/group", upload.single("avatar"), validateGroupChat, validateFields, validateAvatar, authenticateToken, requireVerifiedEmail, createGroupChat);

export default chatRouter;