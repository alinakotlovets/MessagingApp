import type {Chat} from "../../types/Chat.ts";
import {useState} from "react";
import {UserSearch} from "../ChatList/UserSearch.tsx";
import type {User} from "../../types/User.ts";
import Client from "../../api/client.ts";
import {Modal} from "../ui/Modal.tsx";
import "./ChatInfo.css";
import defaultAvatar from "../../assets/defaultAvatar.png";

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
        setSelectedUsers([]);
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

    function handleCloseAddUser() {
        setIsAddUser(false);
        setSelectedUsers([]);
    }

    return(
        <>
            {isAddUser &&(
                <Modal onClose={()=>handleCloseAddUser()} closeOnOverlayClick={false}>
                    <div className="add-user-search">
                        {selectedUsers.length>0 &&(
                            <>
                                <h3>Selected users:</h3>
                                <ul>
                                    {selectedUsers.map((user)=>(
                                        <li className="user-info-box" key={user.id}>
                                            <div className="user-info-box-left">
                                                <img className="user-avatar" src={user.avatar || defaultAvatar} alt={user.username + " avatar"}/>
                                                <div className="user-text-box">
                                                    <h3 className="font-18px">{user.displayName}</h3>
                                                    <h4 className="text-grey font-16px">@{user.username}</h4>
                                                </div>
                                            </div>
                                            <button className="close-search-btn" onClick={()=>removeSelectedUser(user.id)}>X</button>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                        <UserSearch onSelect={selectUser}/>
                        <div className="flex-center">
                            <button className="submit-btn" onClick={addUsersToGroupChat}>Add Users</button>
                        </div>
                    </div>
                </Modal>
            )}

            <div className="chat-info-box">
                <div className="chat-info-top-box">
                    <img className="chat-info-top-box-avatar"  src={chat.avatar || defaultAvatar} alt="chat avatar"/>
                    <h2>{chat.name}</h2>
                    <div className="chat-info-btns-box">
                        {admin && (currentUser?.id === admin.user.id)
                            ? (<>
                                <button className="primary-btn" onClick={handleEdit}>Edit chat</button>
                                <button className="primary-btn" onClick={()=>deleteChat(chat.id)}>Delete chat</button>
                                <button className="primary-btn" onClick={(()=>setIsAddUser(true))}>Add user</button></>)
                            :( <button className="primary-btn" onClick={()=>leaveChat(chat.id, currentUser.id)}>Leave chat</button>)}
                    </div>
                </div>
                <h3>Users:</h3>
                <ul>
                    {chat.chatUsers.map((cu)=>(
                        <li  className="user-info-box"  key={cu.id}>
                            <div className="user-info-box-left">
                            <img className="user-avatar" src={cu.user.avatar || defaultAvatar} alt={cu.user.username + " avatar"}/>
                            <div className="user-text-box">
                                <h3 className="font-18px">{cu.user.displayName}</h3>
                                <h4 className="text-grey font-16px">@{cu.user.username}</h4>
                            </div>
                            </div>
                            {admin && (currentUser?.id === admin.user.id) &&(
                                <div>
                                <button className="primary-btn"
                                        onClick={()=>removeUserFromChat(chat.id, cu.userId)}>Delete</button>
                                </div>
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
        </>
)
}