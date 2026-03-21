import {useEffect, useState} from "react";
import Client from "../api/client.ts";
import * as React from "react";

type Props = {
    setSelectedChatId: (id: number) => void;
};

export function ChatList({ setSelectedChatId }: Props) {

    const [errors, setErrors] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [chats, setChats] = useState([]);

        useEffect(() => {
            setIsLoading(true);
            async function getUserChats(){
                try {
                    const response = await Client("/chat/user", "GET");
                    if(response.errors) setErrors(response.errors);
                    if(response.chats) setChats(response.chats);
                } finally {
                    setIsLoading(false)
                }
            }
            getUserChats();
        }, []);

        function handleClick(e: React.MouseEvent<HTMLLIElement>, chatId: number) {
            e.preventDefault();
            setSelectedChatId(chatId);
        }

    
    return(
        <div className="chat-list-box">
            <h2>Chat list</h2>
            {isLoading && (<h3>Loading...</h3>)}
            {errors.length>0 &&(
                <ul>
                    {errors.map((e, i)=>(
                        <li key={i}>{e}</li>
                    ))}
                </ul>
            )}
            {chats.length>0 && (
                <ul>
                    {chats.map((chat :any)=>(
                        <li key={chat.id} onClick={(e)=> handleClick(e, chat.id)}>{chat.name}</li>
                    ))}
                </ul>
            )}
            {!isLoading && chats.length === 0 &&(
                <div>
                    <h2>There are no chats create them</h2>
                </div>
            )}
        </div>
    )
}