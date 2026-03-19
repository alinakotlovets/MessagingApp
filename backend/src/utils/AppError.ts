export class AppError extends Error {
    statusCode: number;
    constructor(statusCode = 500, message: string) {
        super(message);
        this.statusCode = statusCode;
    }
}