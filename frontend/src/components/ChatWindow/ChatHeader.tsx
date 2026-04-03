import {getChatInfo} from "../../utils/getChatInfo.ts";
import type {Chat} from "../../types/Chat.ts";
import type {User} from "../../types/User.ts";
import "./ChatHeader.css";
import Dots from "../../assets/dots.png";

type Props = {
    isLoading: { chat: boolean; messages: boolean };
    errors: { chat: string[]; messages: string[]; sendMessage:string[]};
    selectedChatId: number | null;
    chat: Chat | null;
    currentUser: User | null;
    setIsSettingsOpen: (value: boolean) => void;
}
export function ChatHeader({isLoading, errors, selectedChatId, chat, currentUser, setIsSettingsOpen}:Props) {

    const user = getChatInfo(chat, currentUser);

    return(
        <>
            {isLoading.chat &&(<h2>Loading...</h2>)}

            {errors.chat.length>0 &&(
                <ul>
                    {errors.chat.map((e, index)=>(
                        <li key={index}>{e}</li>
                    ))}
                </ul>
            )}

            {!isLoading.chat && selectedChatId === null &&(
                <div className="chat-not-chosen">
                    <h2>Chat not chosen</h2>
                </div>
            )}

            {!isLoading.chat && selectedChatId !== null && chat &&(
                <div className="chat-window-header">
                    <div className="chat-header-text-box">
                    <h2 className="font-18px">{user?.name}</h2>
                    {chat.type === "GROUP"
                        ? (<h4 className="text-grey">{chat.chatUsers.length} members</h4>)
                        : (<h4 className="text-grey">@{user?.username}</h4>)}
                    </div>
                    <button className="settings-btn" onClick={()=> setIsSettingsOpen(true)}>
                        <img src={Dots} alt="Setings"/>
                    </button>
                </div>
            )}
        </>
    )
}