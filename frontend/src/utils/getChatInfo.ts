export function getChatInfo(chat:any, currentUser:any){
    if(chat.name) return chat.name;
    if (!currentUser) return "Unknown";

    const otherUser = chat.chatUsers.filter((user:any)=>user.userId !== currentUser.id);
    if (otherUser.length === 0) return "No Name";

    return otherUser[0].user.displayName
    //     {
    //     name: otherUser[0].user.displayName,
    //     lastMessageText: chat.lastMessageText,
    //     lastMessageCreatedAt: chat. lastMessageCreatedAt,
    // }
}
