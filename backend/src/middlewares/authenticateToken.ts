import "dotenv/config"
import type {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import {AppError} from "../utils/AppError.js";

export default function authenticateToken(req: Request, res: Response, next: NextFunction){
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
        throw new AppError(401, "You are unauthorized");
    }

    if (!process.env.JWT_SECRET_KEY) throw new AppError(500, "No secret key");

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET_KEY) as {
            id: number;
            displayName: string;
            username: string;
            email: string;
        };
        next();
    } catch (err) {
        throw new AppError(401, "Invalid token");
    }

}