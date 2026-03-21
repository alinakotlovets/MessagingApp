import type {Request, Response} from "express";
import {userServices} from "../services/userService.js";
import {AppError} from "../utils/AppError.js";
import {getUserIdOrError} from "../services/userHelpers.js";
import {chatService} from "../services/chatService.js";

export async function createPrivateChat(req:Request, res: Response){
    const {username} = req.body;
    if(!username) throw new AppError(400, "Username is required");
    const chatUser = await userServices.getUserByUsername(username);
    if(!chatUser) throw new AppError(404, "User with this username not found");
    const currentUserId = getUserIdOrError(req);
    if(currentUserId === chatUser.id) throw new AppError(400, "You cant create chat with yourself");
    const existingChat = await chatService.existingChat(currentUserId, chatUser.id);
    if(existingChat) throw new AppError(400, "Chat already exist");

    const chat = await chatService.createChat("PRIVATE", chatUser.displayName, currentUserId, chatUser.id);

    res.status(201).json({chat});
}

export async function getUserChats(req: Request, res:Response){
    const userId = getUserIdOrError(req);
    const chats = await chatService.getUserChats(userId);
    res.status(200).json({chats})
}

export async function getChatById(req:Request, res:Response){
    const rawChatId = req.params.chatId;

    const chatId = Number(rawChatId);

    if(!rawChatId || Number.isNaN(chatId)){
        throw new AppError(400, "chat id is invalid");
    }

    const chat = await chatService.getChatById(chatId);
    if(!chat) throw new AppError(404, "Chat not found");
    res.status(200).json({chat});
}