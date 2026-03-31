import {chatService} from "./chatService.js";
import {AppError} from "../utils/AppError.js";
import type {Chat, ChatUser} from "../../generated/prisma/client.js";
export async function getChatAndMemberOrError(chatId: number, userId: number) {
    const chatDb = await chatService.getChatById(chatId);
    if (!chatDb) throw new AppError(404, "Chat not found");
    const chatUser = (chatDb as Chat & { chatUsers: ChatUser[] }).chatUsers.find((u: ChatUser) => u.userId === userId);
    if (!chatUser) throw new AppError(403, "You are not member of this chat");
    return { chatDb, chatUser };
}