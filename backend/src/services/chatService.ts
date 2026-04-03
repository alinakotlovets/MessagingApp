import { prisma } from "../../lib/prisma.js";
import {type MessageType, Role, Type} from "../../generated/prisma/client.js";
import type { Chat, ChatUser, User } from "../../generated/prisma/client.js";
import {chatWithUsersInclude} from "../utils/chatWithUsersInclude.js";
import {fdatasync} from "node:fs";
type ChatWithUsers = Chat & {
    chatUsers: (ChatUser & { user: Pick<User, 'id' | 'displayName' | 'username' | 'avatar'> })[]
};


export const chatService = {
    createChat: async (type: Type, firstUserId: number, secondUserId: number): Promise<ChatWithUsers> => {
        return prisma.chat.create({
                data: {
                    type,
                    chatUsers:{
                        create:[
                            { userId: firstUserId, role: Role.USER },
                            { userId: secondUserId, role: Role.USER },
                        ]
                    }
                },
                include:chatWithUsersInclude
            });
    },
    getUserChats: async (userId: number):Promise <ChatWithUsers[]> =>
        await prisma.chat.findMany({
            where: {
                chatUsers: {
                    some: {userId}
                }},
            include: chatWithUsersInclude
        }),
    getChatById: async(chatId: number):Promise <ChatWithUsers | null> =>
        await prisma.chat.findUnique({
            where: {
                id: chatId
            },
            include: chatWithUsersInclude
        }),
    existingChat: async(firstUserId: number, secondUserId:number):Promise<ChatWithUsers| null> =>
        await prisma.chat.findFirst({
            where: {
                type: "PRIVATE",
                chatUsers: {
                    some: { userId: firstUserId }
                },
                AND: {
                    chatUsers: {
                        some: { userId: secondUserId }
                    }
                }
            },
            include: chatWithUsersInclude
        }),
    createGroupChat: async(type:Type, name:string, usersId:number[], currentUserId: number, avatar: string|null):Promise<ChatWithUsers> =>
        await prisma.chat.create({
            data:{
                type,
                name,
                avatar,
                chatUsers:{
                    create: [
                        {userId: currentUserId, role: Role.ADMIN},
                        ...usersId.map((id:number)=>({userId: id, role: Role.USER}))
                    ]
                }

            },
            include: chatWithUsersInclude
        }),
    addUserToGroupChat: async(chatId:number, usersId:number[]):Promise<ChatWithUsers> =>
        prisma.chat.update({
            where:{id: chatId},
            data: {
                chatUsers:{
                    create: [
                        ...usersId.map((id:number)=>({userId: id, role: Role.USER}))
                    ]
                }
            },
            include: chatWithUsersInclude
        }),
    getChatUsers: async(chatId:number):Promise<ChatUser[]>=>
        prisma.chatUser.findMany({where:{chatId}}),
    removeUserFromGroupChat: async(chatId: number,userId:number) =>
        prisma.chatUser.deleteMany({
            where: {
                chatId,
                userId
            }
        }),
    deleteChat: async(chatId: number)=>
        prisma.chat.delete({where:{id:chatId}}),
    updateGroupChat: async(chatId:number, name:string, avatar:string|null):Promise<Chat>=>
        prisma.chat.update({
            where:{
                id:chatId
            },
            data:{
                name,
                avatar
            },
            include: chatWithUsersInclude
        }),
    updateLastMessage: async(chatId: number,
                             lastMessageId: number | null,
                             lastMessageCreatedAt: Date | null,
                             lastMessageText: string | null,
                             lastMessageSenderId: number | null,
                             lastMessageType: MessageType | null): Promise<ChatWithUsers> =>
        prisma.chat.update({where:{
            id: chatId
            },
            data:{lastMessageId, lastMessageCreatedAt, lastMessageText, lastMessageSenderId, lastMessageType
        }, include: chatWithUsersInclude
        })
};