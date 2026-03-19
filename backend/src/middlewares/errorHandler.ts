import type {Request, Response, NextFunction} from "express";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    const status = err.statusCode || 500;
    let messages = err.message || "Something went wrong";

    try {
        messages = JSON.parse(messages);
    } catch (e) {}

    res.status(status).json({ messages });
}