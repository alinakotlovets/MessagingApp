import express from "express";
import {validateFields} from "../middlewares/validateFields.js";
import {validateRegister,validateLogin, validateEmailVerifyCode} from "../services/validateAuth.js";
import {registerUser, loginUser, verifyEmail, resendEmail, getEmailStatus} from "../controllers/authController.js";
import {upload} from "../utils/multer.js";
import {validateAvatar} from "../middlewares/validateAvatar.js";
import authenticateToken from "../middlewares/authenticateToken.js";

const authRouter = express.Router();

authRouter.get("/status", authenticateToken, getEmailStatus);
authRouter.get("/email/resend", authenticateToken, resendEmail);
authRouter.post("/email", authenticateToken, validateEmailVerifyCode, validateFields, verifyEmail);
authRouter.post("/login", validateLogin, validateFields, loginUser);
authRouter.post("/register", upload.single("avatar"), validateRegister, validateFields, validateAvatar, registerUser);

export default authRouter;