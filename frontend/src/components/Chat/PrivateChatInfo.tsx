import type {Chat} from "../../types/Chat.ts";
import {useState} from "react";
import Client from "../../api/client.ts";
import "../ui/Modal.css"
import defaultAvatar from "../../assets/defaultAvatar.png";
import "./PrivateChatInfo.css";
import type {User} from "../../types/User.ts";
import {getChatInfo} from "../../utils/getChatInfo.ts";

type Props ={
    chat: Chat,
    currentUser: User | null,
    setIsSettingsOpen: (value:boolean)=>void,
    setChat: (value: Chat|null)=> void,
    setSelectedChatId: (value: number| null)=>void,
    chats: Chat[],
    setChats: (chat:any)=>void
}
export function PrivateChatInfo({chat,
                                    currentUser,
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

    const info = getChatInfo(chat, currentUser);

    return(
        <div className="chat-info-box">
            <div>
                <img src={info?.avatar} alt="chat avatar"/>
                <h2>{info?.name}</h2>
            </div>
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
                    <li className="user-info-box" key={cu.id}>
                        <img className="user-avatar" src={cu.user.avatar || defaultAvatar} alt={cu.user.username + " avatar"}/>
                        <div className="user-text-box">
                            <h3 className="font-18px">{cu.user.displayName}</h3>
                            <h4 className="text-grey font-16px">@{cu.user.username}</h4>
                        </div>
                    </li>))}
            </ul>
        </div>
    )

}