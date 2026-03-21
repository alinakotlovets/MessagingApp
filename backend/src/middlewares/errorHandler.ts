import type {Request, Response, NextFunction} from "express";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    const status = err.statusCode || 500;

    const errors = err.messages || ["Something went wrong"];

    res.status(status).json({ errors });
}
