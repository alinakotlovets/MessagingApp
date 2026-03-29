import {prisma} from "../../lib/prisma.js";
import type {Message} from "../../generated/prisma/client.js";


export const messageService = {
    addMessage: async(chatId: number, senderId: number, text: string): Promise<Message> =>
    { return prisma.$transaction(async (tx)=>{
        const message = await tx.message.create({
            data:{chatId,senderId, text},
            include:{
                user:{
                    select:{
                        id: true,
                        displayName: true,
                        avatar: true
                    }}
            }
        });
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
                ...(cursorId ? {id: {lt: cursorId}} :{})
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
    deleteMessage: async(messageId:number)=>
        prisma.message.delete({where:{id:messageId}}),
    editMessage: async(messageId:number, text:string):Promise<Message>=>
        prisma.message.update({
            where:{
            id:messageId},
            data:{text}
        }),
    getMessageById: async(messageId:number):Promise<Message | null>=>
        prisma.message.findUnique({where:{id:messageId}})
}