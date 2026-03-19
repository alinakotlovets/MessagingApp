import 'express';

declare module 'express' {
    export interface Request {
        user?: {
            id: number;
            displayName: string;
            username: string;
            email: string;
        };
    }
}