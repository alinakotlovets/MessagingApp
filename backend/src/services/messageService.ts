import {prisma} from "../../lib/prisma.js";
import type {Message, User, MessageType} from "../../generated/prisma/client.js";
import {publicUserSelect} from "../utils/publicUserSelect.js";
type MessageWithUser = Message & {
    user: Pick<User, 'id' | 'displayName' | 'username' | 'avatar'>
};

export const messageService = {
    addMessage: async(chatId: number, senderId: number, text: string, type: MessageType): Promise<MessageWithUser> =>
    { return prisma.$transaction(async (tx)=>{
        const message = await tx.message.create({
            data:{chatId,senderId, text, type},
            include:{
                user:{
                    select: publicUserSelect
                }
            }
        });
        await tx.chat.update({where:{id: chatId}, data:{
                lastMessageId: message.id,
                lastMessageCreatedAt: message.createdAt,
                lastMessageText: message.text,
                lastMessageSenderId: message.senderId,
                lastMessageType: message.type
            }})
        return message
    })},
    getLastMessages: async(chatId: number, cursorId: number | null): Promise <MessageWithUser[]> =>
        prisma.message.findMany({where:{
                chatId,
                ...(cursorId ? {id: {lt: cursorId}} :{})
            },
            include:{
            user:{
                select:publicUserSelect}
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
    getMessageById: async(messageId:number):Promise<MessageWithUser | null>=>
        prisma.message.findUnique({where: {id:messageId},
                include:{
                user:{
                    select:publicUserSelect}
            }
        }
        ),
    getPrevMessage: async(chatId: number, messageId:number): Promise<MessageWithUser | null>=>
        prisma.message.findFirst({where:{
            chatId: chatId,
                id:{lt: messageId}
        },
            orderBy: { id: 'desc' },
            include: { user: { select: publicUserSelect} }
        })
}