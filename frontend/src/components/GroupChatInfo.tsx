import type {Chat} from "../types/Chat.ts";
import {useState} from "react";
import {UserSearch} from "./UserSearch.tsx";
import type {User} from "../types/User.ts";
import Client from "../api/client.ts";

type Props ={
    chat: Chat,
    setIsSettingsOpen: (value:boolean)=>void,
    currentUser: { id: number; displayName: string, username: string, avatar:string|null } | null,
    setChat: (value: Chat|null)=> void,
    setSelectedChatId: (value: number| null)=>void,
    chats: Chat[],
    setChats: (chat:any)=>void,
    setIsEdit: (value:boolean)=>void
}
export function GroupChatInfo({
                                  chat,
                                  setIsSettingsOpen,
                                  currentUser,
                                  setChat,
                                  setSelectedChatId,
                                  chats,
                                  setChats,
                                  setIsEdit}:Props){

    const [isAddUser, setIsAddUser]=useState(false);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const admin = chat.chatUsers.find((cu)=> cu.role === "ADMIN");

    function selectUser(user:User){
        setSelectedUsers((prev: any) => {
            const exists = prev.some((c: any) => c.id === user.id);
            if (exists) return prev;
            return [user, ...prev];
        })
    }

    function removeSelectedUser(userId:number){
        const newUsers = selectedUsers.filter((user)=>user.id !== userId);
        setSelectedUsers(newUsers);
    }


    async function addUsersToGroupChat() {
        setErrors([]);
        const usersId = selectedUsers.map((user)=>user.id);
        const updatedChat = await Client("/chat/group/user", "PUT", JSON.stringify({chatId: chat.id, usersId }));
        if(updatedChat.errors) setErrors(updatedChat.errors);
        if(updatedChat.chat) setChat(updatedChat.chat);
        setIsAddUser(false);
    }

    async function deleteChat(chatId:number){
        setErrors([]);
        const response = await Client(`/chat/${chatId}`, "DELETE");
        if(response.errors) setErrors(response.errors);
        if(response.message) {
            const filteredChats = chats.filter((c)=>c.id !== chatId);
            setChats(filteredChats);
            setChat(null);
            setSelectedChatId(null);
            setIsSettingsOpen(false);
        }
    }

    async function removeUserFromChat(chatId:number, userId:number){
        setErrors([]);
        const response = await Client(`/chat/${chatId}/user/${userId}`, "DELETE");
        if(response.errors) setErrors(response.errors);
        if (response.message){
            const filteredChatUsers = chat.chatUsers.filter((u)=>u.userId !== userId);
            setChat({...chat, chatUsers: filteredChatUsers})
        }
    }

    async function leaveChat(chatId:number, userId:number){
        setErrors([]);
        const response = await Client(`/chat/${chatId}/user/${userId}`, "DELETE");
        if(response.errors) setErrors(response.errors);
        if (response.message){
            const filteredChats = chats.filter((c)=>c.id !== chatId);
            setChats(filteredChats);
            setChat(null);
            setSelectedChatId(null);
            setIsSettingsOpen(false);
        }
    }

    if (!currentUser) return null;


    function handleEdit(){
        setIsSettingsOpen(false);
        setIsEdit(true);
    }

    return(
        <div className="modal-content">
            {isAddUser &&(
                <div className="modal-overlay">
                <div className="modal-search">
                    <button onClick={()=>setIsAddUser(false)}>close</button>
                    {selectedUsers.length>0 &&(
                        <>
                            <h3>Selected users:</h3>
                            <ul>
                                {selectedUsers.map((user)=>(
                                    <li key={user.id}>
                                        <h3>{user.username}</h3>
                                        <button onClick={()=>removeSelectedUser(user.id)}>X</button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    <UserSearch onSelect={selectUser}/>
                    <button onClick={addUsersToGroupChat}>Add Users</button>
                </div>
                </div>
            )}
            <button onClick={()=>setIsSettingsOpen(false)}>close</button>
            <h2>{chat.name}</h2>
            {admin && (currentUser?.id === admin.user.id) ? (
                <div>
                    <button onClick={handleEdit}>Edit chat</button>
                    <button onClick={()=>deleteChat(chat.id)}>Delete chat</button>
                    <button onClick={(()=>setIsAddUser(true))}>Add user</button>
                </div>
            ) :
                (
                    <div>
                        <button onClick={()=>leaveChat(chat.id, currentUser.id)}>Leave chat</button>
                    </div>
                )
            }
            <h3>Users:</h3>
            <ul>
                {chat.chatUsers.map((cu)=>(
                    <li key={cu.id}>
                        <h3>{cu.user.displayName}</h3>
                        <h4>@{cu.user.username}</h4>
                        {admin && (currentUser?.id === admin.user.id) &&(
                            <button onClick={()=>removeUserFromChat(chat.id, cu.userId)}>Delete</button>
                        )}
                    </li>))}
            </ul>
            {errors.length>0 &&(
                <ul>
                    {errors.map((e:string, i:number)=>(
                        <li key={i}>{e}</li>
                    ))}
                </ul>
            )}
        </div>
)
}