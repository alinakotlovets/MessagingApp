import type {Chat} from "../../types/Chat.ts";
import type {User} from "../../types/User.ts";
import defaultAvatar from "../../assets/defaultAvatar.png";

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
        <li className="chat-list-item">
            <img
                className="chat-avatar"
                src={avatar}
                alt={name}
            />

            <div className="chat-info">
                <div className="chat-header">
                    <h3 className="chat-name">{name}</h3>

                    {chat.lastMessageCreatedAt && (
                        <span className="chat-time">
                            {chat.lastMessageCreatedAt}
                        </span>
                    )}
                </div>

                {chat.lastMessageText && (
                    <div className="chat-last-message">
                        {sender && <span className="chat-sender">{sender}: </span>}
                        <span>{chat.lastMessageText}</span>
                    </div>
                )}
            </div>
        </li>
    );
}