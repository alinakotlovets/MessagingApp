import type {Request, Response} from "express";
import {userServices} from "../services/userService.js";
import {AppError} from "../utils/AppError.js";
import {getUserIdOrError} from "../services/userHelpers.js";
import {chatService} from "../services/chatService.js";
import {uploadImage} from "../utils/uploadImage.js";
import {parseIdOrError} from "../services/parseIdOrError.js";
import {getChatAndMemberOrError} from "../services/getChatAndMemberOrError.js";
import type {ChatUser} from "../../generated/prisma/client.js";

export async function createPrivateChat(req:Request, res: Response){
    const userId = parseIdOrError(req.body.userId, "User id");
    if(!userId) throw new AppError(400, "User id is required");
    const user = await userServices.getUserById(userId);
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
    const currentUserId = getUserIdOrError(req);
    const chats = await chatService.getUserChats(currentUserId);
    res.status(200).json({chats})
}

export async function getChatById(req:Request, res:Response){
    const chatId = parseIdOrError(req.params.chatId, "Chat id");
    const chat = await chatService.getChatById(chatId);
    if(!chat) throw new AppError(404, "Chat not found");
    res.status(200).json({chat});
}
export async function createGroupChat(req:Request, res:Response){
    let {name, usersId} = req.body;
    const avatar = await  uploadImage(req.file, "messenger-group-chats")
    const currentUserId = getUserIdOrError(req);
    const chat =await chatService.createGroupChat("GROUP", name, usersId, currentUserId, avatar);
    res.status(201).json({chat});
}

export async function addUserToGroupChat(req:Request, res:Response){
    const {chatId, usersId} = req.body;
    const chatUsers = await chatService.getChatUsers(chatId);

    const currentUserId = getUserIdOrError(req);
    const {chatDb, chatUser} = await getChatAndMemberOrError(chatId, currentUserId);

    if(chatDb.type !== "GROUP") throw new AppError(400, "You cant add users to private chat");
    if(chatUser.role !=="ADMIN") throw new AppError(403, "You are not admin of this chat");

    const existingUsersId = chatUsers.map((u)=>u.userId);
    const filteredUsersId = usersId.filter((u:number) => !existingUsersId.includes(u));
    if(filteredUsersId.length===0) throw new AppError(400, "All added users already in chat");

    const chat = await chatService.addUserToGroupChat(chatId, filteredUsersId);
    res.status(200).json({chat});
}

export async function deleteChat(req:Request, res:Response){
    const chatId = parseIdOrError(req.params.chatId, "Chat id");
    const currentUserId = getUserIdOrError(req);
    const {chatDb, chatUser} = await getChatAndMemberOrError(chatId, currentUserId);

    if (!chatUser) throw new AppError(403, "You are not member of this chat");
    if (chatDb.type === "GROUP" && chatUser.role !== "ADMIN") {
        throw new AppError(403, "You are not admin of this chat");
    }

    await chatService.deleteChat(chatId);
    res.status(200).json({message: "Chat delete successfully"});
}

export async function removeUserFromGroupChat(req:Request, res: Response){

    const userId = parseIdOrError(req.params.userId, 'User id');
    const chatId = parseIdOrError(req.params.chatId, "Chat id");

    const currentUserId = getUserIdOrError(req);

    const {chatUser} = await getChatAndMemberOrError(chatId, currentUserId);

    const isRemovingSelf = currentUserId === userId;
    const isAdmin = chatUser.role === "ADMIN";

    if(isRemovingSelf && isAdmin) throw new AppError(400, "You cant delete yourself because you admin, if you want you can delete chat");
    if(!isRemovingSelf && !isAdmin)  throw new AppError(403, "You dont have permission to delete user from chat");

    await chatService.removeUserFromGroupChat(chatId, userId);
    res.status(200).json({message:"user delete successfully"});
}

export async function editGroupChat(req:Request,res:Response){
    const {name} = req.body;
    const chatId = parseIdOrError(req.params.chatId, "Chat id");

    const chatInDb = await chatService.getChatById(chatId);
    if(!chatInDb) throw new AppError(404, "Chat with tis id not found");

    const currentUserId = getUserIdOrError(req);
    const chatUser = chatInDb.chatUsers.find((u: ChatUser) => u.userId === currentUserId);
    if(!chatUser) throw new AppError(403,"User id is not member of this chat");
    if(chatUser.role !== "ADMIN") throw new AppError(403, "You dont have permission to edit this chat because you not admin");

    let avatar = await uploadImage(req.file, "messenger-group-chats");
    if( avatar === null && chatInDb.avatar !== null) avatar = chatInDb.avatar;

    const chat = await chatService.updateGroupChat(chatId, name, avatar);
    res.status(200).json({chat});
}