import { prisma } from "../../lib/prisma.js";
import type {Chat} from "../../generated/prisma/client.js";
import { Role, Type } from "../../generated/prisma/client.js";

export const chatService = {
    createChat: async (type: Type, name: string, firstUserId: number, secondUserId: number): Promise<Chat> => {
        return prisma.chat.create({
                data: {
                    type,
                    name,
                    chatUsers:{
                        create:[
                            { userId: firstUserId, role: Role.USER },
                            { userId: secondUserId, role: Role.USER },
                        ]
                    }
                },
                include:{
                 chatUsers: {
                     include: {
                         user: {
                             select: {
                                 id: true,
                                 displayName: true,
                                 avatar: true,
                                 username: true
                             }
                         }
                     }
                 }
                }
            });
    },
    getUserChats: async (userId: number):Promise <Chat[]> =>
        await prisma.chat.findMany({
            where: {
                chatUsers: {
                    some: {userId}
                }},
            include:{
                chatUsers: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                displayName: true,
                                avatar: true,
                                username: true
                            }
                        }
                    }
                }
            }
        }),
    getChatById: async(chatId: number):Promise <Chat | null> =>
        await prisma.chat.findUnique({
            where: {
                id: chatId
            },
            include:{
                chatUsers: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                displayName: true,
                                avatar: true,
                                username: true
                            }
                        }
                    }
                }
            }
        }),
    existingChat: async(firstUserId: number, secondUserId:number):Promise<Chat| null> =>
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
            include: { chatUsers: true }
        }),
};