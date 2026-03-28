import { validationResult } from "express-validator";
import { AppError } from "../utils/AppError.js";
import type { Request, Response, NextFunction } from "express";

export function validateFields(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => err.msg);
        return next(new AppError(400, formattedErrors));
    }
    next();
}