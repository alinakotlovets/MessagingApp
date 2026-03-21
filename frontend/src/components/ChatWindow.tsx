import {useEffect, useState} from "react";
import Client from "../api/client.ts";
import * as React from "react";

type Props = {
    selectedChatId: number | null;
};

export function ChatWindow({ selectedChatId }: Props) {

    const [errors, setErrors] = useState({chat: [], messages: [], sendMessage:[]});
    const [isLoading, setIsLoading] = useState({chat: false, messages:false});
    const [chat, setChat] = useState<any>(null);
    const [messages, setMessages] = useState<any>([])
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        if (selectedChatId === null) return;
        setIsLoading({chat: true, messages: true});
        setChat(null);
        setMessages([]);
        setErrors({chat: [], messages: [], sendMessage:[]});
        let isActive = true;

        async function loadChat(){
                try {
                    const chat = await Client(`/chat/${selectedChatId}`, "GET");
                    if(!isActive) return;
                    if (chat.errors) setErrors((prev) => ({...prev, chat: chat.errors}));
                    if (chat.chat) setChat(chat.chat);
                } finally {
                    if(isActive){
                        setIsLoading((prev) => ({...prev, chat: false}));
                    }
                }
        }

        async function loadMessages() {
                try {
                    const msg = await Client(`/message/chat/${selectedChatId}`, "GET");
                    if(!isActive) return;
                    if (msg.errors) setErrors((prev) => ({...prev, messages: msg.errors}));
                    if (msg.messages) setMessages(msg.messages);
                } finally {
                    if(isActive){
                        setIsLoading((prev) => ({...prev, messages: false}));
                    }
                }
        }
        loadChat();
        loadMessages();

        const intervalId = setInterval( async () => {
            loadMessages()
        }, 3000);

        return () => {
            isActive = false;
            clearInterval(intervalId);
        };


    }, [selectedChatId]);


    async function handleSubmit(e:React.SubmitEvent<HTMLFormElement>){
        e.preventDefault();
        if(selectedChatId !== null){
                const response = await Client(`/message/chat/${selectedChatId}`, "POST", JSON.stringify({text: inputValue}))
                if(response.errors) {
                    setErrors((prev)=>({
                        ...prev,
                        sendMessage: response.errors
                    }));
                }
                if(response.message){
                    setMessages((prev:any) => ([...prev, response.message]));
                    setInputValue("");
                    setErrors((prev)=>(
                        {...prev, sendMessage: []}
                    ))
                }
        }
    }


    return(
        <div className="chat-window-box">
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
                    <h2>Chat name: {chat.name}</h2>
                    <h4>Users: {chat.chatUsers.length}</h4>
                </div>
            )}
            </div>
            <div>
                {isLoading.messages &&(<h2>Loading...</h2>)}

                {errors.messages.length>0 &&(
                    <ul>
                        {errors.messages.map((e, index)=>(
                            <li key={index}>{e}</li>
                        ))}
                    </ul>
                )}

                {!isLoading.messages && selectedChatId !== null && messages.length === 0 &&(
                    <h2>There a no messages send one</h2>
                )}

                {!isLoading.messages && selectedChatId !== null && messages &&(
                    <ul>
                        {messages.map((message: any)=>(
                            <li key={message.id}>{message.text}</li>
                        ))}
                    </ul>
                )}

                {!isLoading.messages && selectedChatId !== null && (
                  <form onSubmit={handleSubmit}>
                      <input type="text"
                             name="text"
                             value={inputValue}
                             onChange={(e)=>{setInputValue(e.target.value)}}/>
                      <button type="submit">Send</button>
                          {errors.sendMessage.length >0 &&(
                              <ul>
                                  {errors.sendMessage.map((e,index)=>(
                                      <li key={index}>{e}</li>
                                  ))}
                              </ul>
                          )}
                  </form>
                )}
            </div>
        </div>
    )
}