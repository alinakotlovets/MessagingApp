import {useEffect, useState, useRef} from "react";
import Client from "../api/client.ts";
import * as React from "react";

type Props = {
    selectedChatId: number | null;
};

export function ChatWindow({ selectedChatId }: Props) {

    const [errors, setErrors] = useState<{
        chat: string[],
        messages: string[],
        sendMessage: string[]
    }>({chat: [], messages: [], sendMessage:[]});
    const [isLoading, setIsLoading] = useState({chat: false, messages:false});
    const [chat, setChat] = useState<any>(null);
    const [messages, setMessages] = useState<any>([])
    const [inputValue, setInputValue] = useState("");
    const [isInitialLoad, setIsInitialLoad] = useState<boolean|null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);

    useEffect(() => {
        if (selectedChatId === null) return;
        setIsLoading({chat: true, messages: true});
        setIsInitialLoad(true);
        setChat(null);
        setMessages([]);
        setErrors({chat: [], messages: [], sendMessage:[]});
        const controller = new AbortController();

        async function loadChat(){
                try {
                    const chat = await Client(`/chat/${selectedChatId}`, "GET", undefined, controller.signal);
                    if (chat.errors) setErrors((prev) => ({...prev, chat: chat.errors}));
                    if (chat.chat) setChat(chat.chat);
                } catch {
                    setErrors((prev)=>({...prev, chat:["Network error or request failed"]}))
                }
                finally {
                    setIsLoading((prev) => ({...prev, chat: false}));
                }
        }

        async function loadMessages() {
                try {
                    const msg = await Client(`/message/chat/${selectedChatId}`, "GET", undefined, controller.signal);
                    if (msg.errors) setErrors((prev) => ({...prev, messages: msg.errors}));
                    if (msg.messages)  setMessages((prev:any) => {
                        const normalized:any = msg.messages.sort((a:any, b:any) => a.id - b.id);
                        const merged = [...prev, ...normalized];

                        const unique = merged.filter(
                            (m, index, arr) =>
                                arr.findIndex(x => x.id === m.id) === index
                        );

                        return unique;
                    });
                } catch {
                    setErrors((prev)=>({...prev, messages:["Network error or request failed"]}))
                } finally {
                    setIsLoading((prev) => ({...prev, messages: false}));
                }
        }
        loadChat();
        loadMessages();

        const intervalId = setInterval( async () => {
            loadMessages()
        }, 3000);

        return () => {
            controller.abort();
            clearInterval(intervalId);
        };

    }, [selectedChatId]);

    useEffect(() => {
        if (messages.length>0 && isInitialLoad){
            const messagesBox = document.querySelector(".messages");
            if(messagesBox){
                messagesBox.scrollTop = messagesBox.scrollHeight;
                setIsInitialLoad(false);
            }
        }
    }, [messages]);

    const messagesRef = useRef(messages);
    const isFetchingRef = useRef(isFetching);
    const hasMoreRef = useRef(hasMoreMessages);

    useEffect(() => {
        messagesRef.current = messages;
        isFetchingRef.current = isFetching;
        hasMoreRef.current = hasMoreMessages;
    }, [messages, isFetching, hasMoreMessages]);

    useEffect(() => {
        const messagesBox = document.querySelector(".messages");
        if(!messagesBox) return;
        async function handleScroll(){
            if (messagesRef.current.length === 0) return;
            if (isFetchingRef.current) return;
            if (!hasMoreRef.current) return;
            if(!messagesBox) return;
            if(messagesBox.scrollTop >100) return;

            const prevHeight = messagesBox.scrollHeight;
            setIsFetching(true);


            const msg  = await Client(`/message/chat/${selectedChatId}?cursorId=${messagesRef.current[0].id}`, "GET");
            if (msg.messages) {
                if (msg.messages.length < 50) {
                    setHasMoreMessages(false);
                }
                setMessages((prev:any) => {
                    const normalized:any = msg.messages.sort((a:any, b:any) => a.id - b.id);
                    const existingIds = new Set(prev.map((m:any) => m.id));
                    const newUnique = normalized.filter((m: any) => !existingIds.has(m.id));
                    return [...newUnique, ...prev];
                });
            setTimeout(()=>{
                const newHeight = messagesBox.scrollHeight;
                messagesBox.scrollTop += newHeight - prevHeight;
                setIsFetching(false);
            },0)
            }
        }

        messagesBox.addEventListener("scroll", handleScroll);

        return()=>{
            messagesBox.removeEventListener("scroll", handleScroll);
        }
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
            <div className="messages">
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