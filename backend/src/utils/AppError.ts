export class AppError extends Error {
    statusCode: number;
    messages: string[];
    constructor(statusCode = 500, messages: string | string[]) {
        super();
        this.statusCode = statusCode;

        this.messages = Array.isArray(messages)
            ? messages
            : [messages];
    }
}