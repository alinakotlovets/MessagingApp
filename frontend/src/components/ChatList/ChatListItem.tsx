import type {Chat} from "../../types/Chat.ts";
import type {User} from "../../types/User.ts";
import defaultAvatar from "../../assets/defaultAvatar.png";
import {formatDate} from "../../utils/formatDate.ts";
import "./ChatListItem.css";

type ChatListItemProps = {
    chat: Chat,
    currentUser: User | null
}


export function ChatListItem({ chat, currentUser }: ChatListItemProps) {
    if (!currentUser) return null;
    let name = "Unknown";
    let avatar = defaultAvatar;
    let sender: string | null = null;

    if (chat.type === "PRIVATE") {
        const otherUser = chat.chatUsers.find(
            (user: any) => user.userId !== currentUser.id
        );

        if (otherUser) {
            name = otherUser.user.displayName;
            avatar = otherUser.user.avatar || defaultAvatar;
        }
    }

    if (chat.type === "GROUP") {
        name = chat.name || "No name";
        avatar = chat.avatar || defaultAvatar;

        if (chat.lastMessageText) {
            const chatUser = chat.chatUsers.find(
                (u) => u.userId === chat.lastMessageSenderId
            );
            sender = chatUser?.user.displayName || "No name";
        }
    }

    return (
        <>
            <img
                className="chat-avatar"
                src={avatar}
                alt={name}
            />

            <div className="chat-info">
                <div className="chat-header">
                    <h3 className="chat-name">{name}</h3>

                    {chat.lastMessageCreatedAt && (
                        <p className="chat-time">
                            {formatDate(chat.lastMessageCreatedAt)}
                        </p>
                    )}
                </div>

                {chat.lastMessageText && (
                    <div className="chat-last-message">
                        {sender && <p className="chat-sender">{sender}: </p>}
                        {chat.lastMessageType === "IMAGE"
                            ? (<>
                                <img className="chat-last-message-img" src={chat.lastMessageText} alt="last message image"/>
                                <p>Photo</p>
                            </>)
                            :(<span className="last-message">{chat.lastMessageText}</span>)
                        }
                    </div>
                )}
            </div>
        </>
    );
}