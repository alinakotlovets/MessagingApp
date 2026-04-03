import type {ChatUser} from "./ChatUser.ts";
export type Chat = {
    id: number;
    type: "PRIVATE" | "GROUP";
    name: string | null;
    avatar: string | null;
    createdAt: string;

    lastMessageId: number | null;
    lastMessageText: string | null;
    lastMessageCreatedAt: string | null;
    lastMessageSenderId: number | null;
    lastMessageType: "MESSAGE"| "IMAGE";

    chatUsers: ChatUser[];
}