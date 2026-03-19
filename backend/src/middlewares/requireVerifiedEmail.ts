import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { userServices } from "../services/userService.js";

export async function requireVerifiedEmail(req: Request, res: Response, next: NextFunction) {
    if (!req.user) throw new AppError(401, "Unauthorized");

    const user = await userServices.getUserById(req.user.id);

    if (!user) throw new AppError(404, "User not found");
    if (!user.isVerified) throw new AppError(403, "Email not verified");

    next();
}