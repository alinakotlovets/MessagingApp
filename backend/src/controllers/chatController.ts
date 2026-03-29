import type {Request, Response} from "express";
import {userServices} from "../services/userService.js";
import {AppError} from "../utils/AppError.js";
import {getUserIdOrError} from "../services/userHelpers.js";
import {chatService} from "../services/chatService.js";
import cloudinary from "../utils/cloudinary.js";
import {Client} from "pg";

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

export async function addUserToGroupChat(req:Request, res:Response){
    const {chatId, usersId} = req.body;
    const userId = getUserIdOrError(req);
    const chatUsers = await chatService.getChatUsers(chatId);

    const chatFromDB = await chatService.getChatById(chatId);
    if (!chatFromDB) throw new AppError(400, "Chat with this id dont exist");
    if(chatFromDB.type !== "GROUP") throw new AppError(400, "You cant add users to private chat");

    const chatUser = chatUsers.find((u)=> u.userId === userId);
    if(!chatUser) throw new AppError(403, "You are not user of this chat");
    if(chatUser.role !=="ADMIN") throw new AppError(403, "You are not admin of this chat");
    const existingUsersId = chatUsers.map((u)=>u.userId);
    const filteredUsersId = usersId.filter((u:number) => !existingUsersId.includes(u));
    if(filteredUsersId.length===0) throw new AppError(400, "All added users already in chat");

    try {
        const chat = await chatService.addUserToGroupChat(chatId, filteredUsersId);
        res.status(200).json({chat});
    } catch(err) {
        console.error(err);
        throw new AppError(500, "Something went wrong");
    }
}

export async function deleteChat(req:Request, res:Response){
    const rawChatId = req.params.chatId;
    const chatId = Number(rawChatId);
    if (Number.isNaN(chatId)) {
        throw new AppError(400, "chat id is invalid");
    }

    const userId = getUserIdOrError(req);
    const chatDb:any = await chatService.getChatById(chatId);
    if(!chatDb) throw new AppError(401, "Chat with tis id not found");
    const chatUser = chatDb.chatUsers.find((u: any) => u.userId === userId);
    if (!chatUser) throw new AppError(403, "You are not member of this chat");

    if (chatDb.type === "GROUP" && chatUser.role !== "ADMIN") {
        throw new AppError(403, "You are not admin of this chat");
    }

    await chatService.deleteChat(chatId);
    res.status(200).json({message: "Chat delete successfully"});
}

export async function removeUserFromGroupChat(req:Request, res: Response){
    const rawChatId = req.params.chatId;
    const rawUserId = req.params.userId;
    const userId = Number(rawUserId);
    const chatId = Number(rawChatId);
    if (isNaN(chatId)) throw new AppError(400, "chat id is invalid");
    if (isNaN(userId)) throw new AppError(400, "user id is invalid");

    const currentUserId = getUserIdOrError(req);
    const chatDb:any = await chatService.getChatById(Number(chatId));
    if(!chatDb) throw new AppError(404, "Chat with tis id not found");

    const chatUser = chatDb.chatUsers.find((u: any) => u.userId === currentUserId);
    if(!chatUser) throw new AppError(403,"User id is not member of this chat");
    const isUserInChat = chatDb.chatUsers.find((u:any)=>u.userId === userId);
    if(!isUserInChat)  throw new AppError(404,"User is not member of this chat");

    const isRemovingSelf = currentUserId === userId;
    const isAdmin = chatUser.role === "ADMIN";

    if(isRemovingSelf && isAdmin) throw new AppError(400, "You cant delete yourself because you admin, if you want you can delete chat");
    if(!isRemovingSelf && !isAdmin)  throw new AppError(403, "You dont have permission to delete user from chat");

    await chatService.removeUserFromGroupChat(chatId, userId);
    res.status(200).json({message:"user delete successfully"});
}

export async function editGroupChat(req:Request,res:Response){
    const {name} = req.body;

    const rawChatId = req.params.chatId;
    const chatId = Number(rawChatId);
    if (isNaN(chatId)) throw new AppError(400, "chat id is invalid");

    const chatInDb:any = await chatService.getChatById(chatId);
    if(!chatInDb) throw new AppError(404, "Chat with tis id not found");

    const currentUserId = getUserIdOrError(req);
    const chatUser = chatInDb.chatUsers.find((u: any) => u.userId === currentUserId);
    if(!chatUser) throw new AppError(403,"User id is not member of this chat");
    if(chatUser.role !== "ADMIN") throw new AppError(403, "You dont have permission to edit this chat because you not admin");

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

    if( avatar === null && chatInDb.avatar !== null) avatar = chatInDb.avatar;

    const chat = await chatService.updateGroupChat(chatId, name, avatar);
    res.status(200).json({chat});
}