import type {Request, Response} from "express";
import {getUserIdOrError} from "../services/userHelpers.js";
import {AppError} from "../utils/AppError.js";
import {messageService} from "../services/messageService.js";
import {chatService} from "../services/chatService.js";
import {uploadImage} from "../utils/uploadImage.js";
import {parseIdOrError} from "../services/parseIdOrError.js";
import type {ChatUser} from "../../generated/prisma/client.js";

export async function addMessage(req:Request, res: Response){
    const {text} = req.body
    const currentUserId = getUserIdOrError(req)
    const chatId = parseIdOrError(req.params.chatId, "Chat id");

    const message = await messageService.addMessage(chatId, currentUserId, text, "MESSAGE");
    res.status(201).json({message})
}

export async function getLastMessages(req: Request, res:Response){
    const rawCursorId = req.query.cursorId;
    const cursorId = rawCursorId ? Number(rawCursorId) : null;
    if(cursorId !== null && Number.isNaN(cursorId)) throw new AppError(400, "Invalid cursorId");

    const chatId = parseIdOrError(req.params.chatId, "Chat id");

    const chat = await chatService.getChatById(chatId);
    if(chat){
        const userId = getUserIdOrError(req);
        const chatUsers = chat.chatUsers.map((u:ChatUser)=>u.userId);
        const user = chatUsers.find((u: number)=>u === userId);
        if(!user){
            throw new AppError(401, "You are not member of this chat");
        }
    }

    const messages = await messageService.getLastMessages(chatId, cursorId);
    res.status(200).json({messages});
}

export async function deleteMessage(req:Request, res:Response){
    const chatId = parseIdOrError(req.params.chatId, "Chat id");
    const messageId  = parseIdOrError(req.params.messageId, "Message id");

    const chat = await chatService.getChatById(chatId);
    if(!chat) throw new AppError(404, "Chat with this id not found");

    const message = await messageService.getMessageById(messageId);
    if(!message) throw new AppError(404, "Message with this id not found");

    const currentUserId = getUserIdOrError(req);

    const isUserMessageSender = message.senderId === currentUserId;
    let isAdmin = false;
    if(chat.type === "GROUP"){
        const chatUser = chat.chatUsers.find((u:ChatUser)=>u.userId === currentUserId);
        if(!chatUser) throw new AppError(403, "You dont have permission to delete this message")
        if(chatUser.role === "ADMIN") isAdmin = true
    }

    if(!isUserMessageSender && !isAdmin) throw new AppError(403, "You dont have permission to delete this message");

    if(chat.lastMessageId === messageId) {
        const prevMessage = await messageService.getPrevMessage(chatId, messageId);
        if(!prevMessage){
            await chatService.updateLastMessage(chatId, null, null, null, null, null);
        } else {
            await chatService.updateLastMessage(chatId, prevMessage.id, prevMessage.createdAt, prevMessage.text, prevMessage.senderId, prevMessage.type);
        }
    }

    await messageService.deleteMessage(messageId);
    res.status(200).json({message: "Message deleted successfully"});
}

export async function editMessage(req:Request, res:Response){
    const {text} = req.body;
    const chatId = parseIdOrError(req.params.chatId, "Chat id");
    const messageId  = parseIdOrError(req.params.messageId, "Message id")

    const chat = await chatService.getChatById(chatId);
    if(!chat) throw new AppError(404, "Chat with this id not found");

    const messageDb = await messageService.getMessageById(messageId);
    if(!messageDb) throw new AppError(404, "Message with this id not found");
    const currentUserId = getUserIdOrError(req);

    const isUserMessageSender = messageDb.senderId === currentUserId;
    if(!isUserMessageSender) throw new AppError(403, "You dont have permission to edit this message");
    const message = await messageService.editMessage(messageId, text);

    res.status(200).json({message});
}


export async function addMessageImage(req:Request, res:Response){
    const chatId = parseIdOrError(req.params.chatId, "Chat id");

    const chat = await chatService.getChatById(chatId);
    if(!chat) throw new AppError(404, "Chat with this id not found");

    const userId = getUserIdOrError(req);
    const chatUser = chat.chatUsers.find((u:ChatUser)=>u.userId === userId);
    if(!chatUser) throw new AppError(403, "You are not User of this chat");

    const image = await uploadImage(req.file, "messenger-messages");

    if(!image) throw new AppError(400, "Image is required");

    const message = await messageService.addMessage(chatId, userId, image, "IMAGE");
    res.status(201).json({message});
}