import {getChatName} from "../utils/getChatName.ts";
import type {Chat} from "../types/Chat.ts";
import type {User} from "../types/User.ts";


type Props = {
    isLoading: { chat: boolean; messages: boolean };
    errors: { chat: string[]; messages: string[]; sendMessage:string[]};
    selectedChatId: number | null;
    chat: Chat | null;
    currentUser: User | null;
    setIsSettingsOpen: (value: boolean) => void;
}
export function ChatHeader({isLoading, errors, selectedChatId, chat, currentUser, setIsSettingsOpen}:Props) {

    return(
        <div>
            {isLoading.chat &&(<h2>Loading...</h2>)}

            {errors.chat.length>0 &&(
                <ul>
                    {errors.chat.map((e, index)=>(
                        <li key={index}>{e}</li>
                    ))}
                </ul>
            )}

            {!isLoading.chat && selectedChatId === null &&(
                <h2>Chat not chosen</h2>
            )}

            {!isLoading.chat && selectedChatId !== null && chat &&(
                <div>
                    <h2>Chat name: {getChatName(chat, currentUser)}</h2>
                    {chat.type === "GROUP" ? ( <div>
                            <h4>{chat.chatUsers.length} users</h4>
                        </div>
                    ): null}
                    <button onClick={()=> setIsSettingsOpen(true)}>Settings</button>
                </div>
            )}
        </div>
    )
}