import type {Request, Response} from "express";
import {getUserIdOrError} from "../services/userHelpers.js";
import {AppError} from "../utils/AppError.js";
import {messageService} from "../services/messageService.js";
import {chatService} from "../services/chatService.js";
import cloudinary from "../utils/cloudinary.js";

export async function addMessage(req:Request, res: Response){
    const {text} = req.body
    const rawChatId = req.params.chatId;
    const userId = getUserIdOrError(req)
    const chatId = Number(rawChatId);

    if (!rawChatId || Number.isNaN(chatId)) {
        throw new AppError(400, "chat id is invalid");
    }

    const message = await messageService.addMessage(chatId, userId, text, "MESSAGE");
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

    const chat:any = await chatService.getChatById(chatId);
    if(chat){
        const userId = getUserIdOrError(req);
        const chatUsers = chat.chatUsers.map((u:any)=>u.userId);
        const user = chatUsers.find((u: any)=>u === userId);
        if(!user){
            throw new AppError(401, "You are not member of this chat");
        }
    }

    const messages = await messageService.getLastMessages(chatId, cursorId);
    res.status(200).json({messages});
}

export async function deleteMessage(req:Request, res:Response){
    const rawChatId = req.params.chatId;
    const chatId = Number(rawChatId);
    if(isNaN(chatId))  throw new AppError(400, "chat id is invalid");

    const rawMessageId= req.params.messageId;
    const messageId = Number(rawMessageId);
    if(isNaN(messageId)) throw new AppError(400, "message id is invalid");

    const chat:any = await chatService.getChatById(chatId);
    if(!chat) throw new AppError(404, "Chat with this id not found");

    const message = await messageService.getMessageById(messageId);
    if(!message) throw new AppError(404, "Message with this id not found");

    const currentUserId = getUserIdOrError(req);


    const isUserMessageSender = message.senderId === currentUserId;
    let isAdmin = false;
    if(chat.type === "GROUP"){
        const chatUser = chat.chatUsers.find((u:any)=>u.userId === currentUserId);
        if(!chatUser) throw new AppError(403, "You dont have permission to delete this message")
        if(chatUser.role === "ADMIN") isAdmin = true
    }

    if(!isUserMessageSender && !isAdmin) throw new AppError(403, "You dont have permission to delete this message");

    await messageService.deleteMessage(messageId);
    res.status(200).json({message: "Message deleted successfully"});
}

export async function editMessage(req:Request, res:Response){
    const {text} = req.body;
    const rawChatId = req.params.chatId;
    const chatId = Number(rawChatId);
    if(isNaN(chatId))  throw new AppError(400, "chat id is invalid");

    const rawMessageId= req.params.messageId;
    const messageId = Number(rawMessageId);
    if(isNaN(messageId)) throw new AppError(400, "message id is invalid");

    const chat:any = await chatService.getChatById(chatId);
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
    const rawChatId = req.params.chatId;
    const chatId = Number(rawChatId);
    if(isNaN(chatId))  throw new AppError(400, "chat id is invalid");

    const chat:any = await chatService.getChatById(chatId);
    if(!chat) throw new AppError(404, "Chat with this id not found");

    const userId = getUserIdOrError(req);
    const chatUser = chat.chatUsers.find((u:any)=>u.userId === userId);
    if(!chatUser) throw new AppError(403, "You are not user of this chat");

    let image:string|null = null;
    if(req.file){
        const result = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
            {
                folder: "messenger-messages"
            }
        );
        image = result.secure_url;
    }

    if(!image) throw new AppError(400, "Image is required");

    const message = await messageService.addMessage(chatId, userId, image, "IMAGE");
    res.status(201).json({message});
}