import defaultAvatar from "../../assets/defaultAvatar.png";
export function getChatInfo(chat: any, currentUser: any) {
        if (!chat || !currentUser) return null;

        if (chat.type === "GROUP") {
            return {
                name: chat.name || "No Name",
                username: "",
                avatar: chat.avatar || defaultAvatar
            };
        }

        const otherUser = chat.chatUsers.find(
            (u: any) => u.userId !== currentUser.id
        );

        if (!otherUser) {
            return {
                name: "No Name",
                username: "",
                avatar: defaultAvatar
            };
        }


        return {
            name: otherUser.user.displayName,
            username: otherUser.user.username,
            avatar: otherUser.user.avatar || defaultAvatar
        };
}
