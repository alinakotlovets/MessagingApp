import {prisma} from "../../lib/prisma.js";
import type {Message} from "../../generated/prisma/client.js";


export const messageService = {
    addMessage: async(chatId: number, senderId: number, text: string): Promise<Message> =>
    { return prisma.$transaction(async (tx)=>{
        const message = await tx.message.create({data:{chatId,senderId, text}});
        await tx.chat.update({where:{id: chatId}, data:{
                lastMessageId: message.id,
                lastMessageCreatedAt: message.createdAt,
                lastMessageText: message.text,
                lastMessageSenderId: message.senderId
            }})
        return message
    })},
    getLastMessages: async(chatId: number, cursorId: number | null): Promise <Message[]> =>
        prisma.message.findMany({where:{
                chatId,
                ...(cursorId ? {id: {lt: chatId}} :{})
            },
            include:{
            user:{
                select:{
                    id: true,
                    displayName: true,
                    avatar: true
                }}
            },
            orderBy: {
                id: "desc"
            },
            take: 50
        }),
}