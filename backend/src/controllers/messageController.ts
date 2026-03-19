import type {Request, Response} from "express";
import {getUserIdOrError} from "../services/userHelpers.js";
import {AppError} from "../utils/AppError.js";
import {messageService} from "../services/messageService.js";
import {chatService} from "../services/chatService.js";

export async function addMessage(req:Request, res: Response){
    const {text} = req.body
    const rawChatId = req.params.chatId;
    const userId = getUserIdOrError(req)
    const chatId = Number(rawChatId);

    if (!rawChatId || Number.isNaN(chatId)) {
        throw new AppError(400, "chat id is invalid");
    }

    const message = await messageService.addMessage(chatId, userId, text);
    res.status(201).json({message})

}

export async function getLastMessages(req: Request, res:Response){
    const rawCursorId = req.query.cursorId;
    const rawChatId = req.params.chatId;
    const chatId = Number(rawChatId);
    let cursorId: number | null = Number(rawCursorId);
    if (!rawChatId || Number.isNaN(chatId)) {
        throw new AppError(400, "chat id is invalid");
    }
    if(!cursorId || Number.isNaN(rawCursorId)) cursorId = null;

    const chat = await chatService.getChatById(chatId);
    if(chat){
        const userId = getUserIdOrError(req);
        // @ts-ignore
        const chatUsers = chat.chatUsers.map((u:any)=>u.userId);
        const user = chatUsers.find((u: any)=>u === userId);
        if(!user){
            throw new AppError(401, "You are not member of this chat");
        }
    }

    const messages = await messageService.getLastMessages(chatId, cursorId);
    res.status(200).json({messages});
}