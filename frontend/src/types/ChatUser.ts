import type {User} from "./User.ts";

export type ChatUser = {
    id: number;
    chatId: number;
    userId: number;
    role: "USER" | "ADMIN";
    joinedAt: Date;
    user: User;
};
