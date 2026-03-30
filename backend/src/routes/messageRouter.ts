import express from "express";
import authenticateToken from "../middlewares/authenticateToken.js";
import {requireVerifiedEmail} from "../middlewares/requireVerifiedEmail.js";
import {validateMessage} from "../services/validateMessage.js";
import {validateFields} from "../middlewares/validateFields.js";
import {addMessage, getLastMessages, deleteMessage, editMessage, addMessageImage} from "../controllers/messageController.js";
import {upload} from "../utils/multer.js";
import {validateImage} from "../middlewares/validateImage.js";

const messageRouter = express.Router();


messageRouter.put("/chat/:chatId/:messageId", validateMessage, validateFields, authenticateToken, requireVerifiedEmail, editMessage);
messageRouter.delete("/chat/:chatId/:messageId", authenticateToken, requireVerifiedEmail, deleteMessage);
messageRouter.get("/chat/:chatId", authenticateToken, requireVerifiedEmail, getLastMessages);
messageRouter.post("/chat/:chatId/image", upload.single("image"), validateImage, authenticateToken, requireVerifiedEmail, addMessageImage);
messageRouter.post("/chat/:chatId", validateMessage, validateFields, authenticateToken, requireVerifiedEmail, addMessage);

export default messageRouter;