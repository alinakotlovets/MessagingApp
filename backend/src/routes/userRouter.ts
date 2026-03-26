import express from "express";
import authenticateToken from "../middlewares/authenticateToken.js";
import {requireVerifiedEmail} from "../middlewares/requireVerifiedEmail.js";
import {searchUsers} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.use("/search", authenticateToken, requireVerifiedEmail, searchUsers);

export default userRouter;