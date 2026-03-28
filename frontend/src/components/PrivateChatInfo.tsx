import type {Chat} from "../types/Chat.ts";
import {useState} from "react";
import Client from "../api/client.ts";

type Props ={
    chat: Chat,
    setIsSettingsOpen: (value:boolean)=>void,
    setChat: (value: Chat|null)=> void,
    setSelectedChatId: (value: number| null)=>void,
    chats: Chat[],
    setChats: (chat:any)=>void
}
export function PrivateChatInfo({
                                    chat,
                                    setIsSettingsOpen,
                                    setChat,
                                    setSelectedChatId,
                                    chats,
                                    setChats}:Props){

    const [errors, setErrors] = useState<string[]>([]);
    async function deleteChat(chatId:number){
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

    return(
        <div className="modal-content">
            <button onClick={()=>setIsSettingsOpen(false)}>close</button>
            <h2>{chat.name}</h2>
            <div>
                <button onClick={()=>deleteChat(chat.id)}>Delete Chat</button>
            </div>
            {errors.length>0 &&(
                <ul>
                    {errors.map((e:string, i:number)=>(
                        <li key={i}>{e}</li>
                    ))}
                </ul>
            )}
            <h3>Users:</h3>
            <ul>
                {chat.chatUsers.map((cu)=>(
                    <li key={cu.id}>
                        <h3>{cu.user.displayName}</h3>
                        <h4>@{cu.user.username}</h4>
                    </li>))}
            </ul>
        </div>
    )

}