import type {Request, Response} from "express";
import {userServices} from "../services/userService.js";
import {AppError} from "../utils/AppError.js";
import {getUserIdOrError} from "../services/userHelpers.js";
import {chatService} from "../services/chatService.js";
import cloudinary from "../utils/cloudinary.js";

export async function createPrivateChat(req:Request, res: Response){
    const {userId} = req.body;
    if(!userId) throw new AppError(400, "User id is required");
    const user = await userServices.getUserById(parseInt(userId));
    if(!user) throw new AppError(404,"User with this is not found");
    const currentUserId = getUserIdOrError(req);
    if(currentUserId === userId) throw new AppError(400, "You cant create chat with yourself");
    const existingChat = await chatService.existingChat(currentUserId, userId);
    if(existingChat) {
         return res.status(200).json({chat: existingChat});
    }
    const chat = await chatService.createChat("PRIVATE", currentUserId, user.id);
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
export async function createGroupChat(req:Request, res:Response){
    let {name, usersId} = req.body;
    let avatar:string|null = null;
    if(req.file){
        const result = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
            {
                folder: "messenger-group-chats"
            }
        );
        avatar = result.secure_url;
    }

    const currentUserId = getUserIdOrError(req);
    const chat =await chatService.createGroupChat("GROUP", name, usersId, currentUserId, avatar);
    res.status(201).json({chat});
}