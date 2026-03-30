import express from "express";
import authenticateToken from "../middlewares/authenticateToken.js";
import {requireVerifiedEmail} from "../middlewares/requireVerifiedEmail.js";
import {searchUsers, updateUser, getUser} from "../controllers/userController.js";
import {upload} from "../utils/multer.js";
import {validateUserEdit} from "../services/validateAuth.js";
import {validateFields} from "../middlewares/validateFields.js";
import {validateImage} from "../middlewares/validateImage.js";

const userRouter = express.Router();

userRouter.put("/:userId",
    upload.single("avatar"),
    authenticateToken,
    requireVerifiedEmail,
    validateUserEdit,
    validateFields,
    validateImage,
    updateUser);
userRouter.get("/search", authenticateToken, requireVerifiedEmail, searchUsers);
userRouter.get("/", authenticateToken, requireVerifiedEmail,getUser);

export default userRouter;