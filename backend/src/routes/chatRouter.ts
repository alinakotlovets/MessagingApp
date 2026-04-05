import express from "express";
import authenticateToken from "../middlewares/authenticateToken.js";
import {requireVerifiedEmail} from "../middlewares/requireVerifiedEmail.js";
import {
    createPrivateChat,
    getUserChats,
    getChatById,
    createGroupChat,
    addUserToGroupChat,
    deleteChat,
    removeUserFromGroupChat,
    editGroupChat
} from "../controllers/chatController.js";
import {
    validateChat,
    validateGroupChat,
    validateAddUserToGroupChat,
    validateEditGroupChat
} from "../services/validateChat.js";
import {validateFields} from "../middlewares/validateFields.js";
import {upload} from "../utils/multer.js";
import {validateImage} from "../middlewares/validateImage.js";

const chatRouter = express.Router();


chatRouter.put("/group/user", validateAddUserToGroupChat, validateFields, authenticateToken, requireVerifiedEmail, addUserToGroupChat);
chatRouter.put("/group/:chatId", upload.single("avatar"), validateEditGroupChat, validateFields, validateImage, authenticateToken, requireVerifiedEmail, editGroupChat);
chatRouter.delete("/:chatId/user/:userId", authenticateToken, requireVerifiedEmail, removeUserFromGroupChat);
chatRouter.delete("/:chatId", authenticateToken, requireVerifiedEmail, deleteChat)
chatRouter.get("/user", authenticateToken, requireVerifiedEmail, getUserChats);
chatRouter.get("/:chatId", authenticateToken, requireVerifiedEmail, getChatById)
chatRouter.post("/private", validateChat, validateFields, authenticateToken, requireVerifiedEmail, createPrivateChat);
chatRouter.post("/group", upload.single("avatar"), validateGroupChat, validateFields, validateImage, authenticateToken, requireVerifiedEmail, createGroupChat);

export default chatRouter;