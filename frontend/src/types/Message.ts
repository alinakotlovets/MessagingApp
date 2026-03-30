import type {User} from "./User.ts";
export type Message={
    id: number,
    chatId: number,
    senderId: number,
    type: "MESSAGE" | "IMAGE",
    text: string,
    createdAt: Date,
    editedAt: Date | null,
    user: User
}