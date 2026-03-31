import "dotenv/config"
import jwt from "jsonwebtoken";
import {AppError} from "./AppError.js";
import type {User} from "../../generated/prisma/client.js";
export function generateToken(user: User) {
    if (!process.env.JWT_SECRET_KEY) throw new AppError(501, "No secret key");
    return jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "30d" }
    );
}