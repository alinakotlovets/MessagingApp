import {useEffect, useState, useRef} from "react";
import Client from "../api/client.ts";
import * as React from "react";
import {getChatName} from "../utils/getChatName.ts";
import type {Chat} from "../types/Chat.ts";
import type {Message} from "../types/Message.ts";
import {GroupChatInfo} from "./GroupChatInfo.tsx";
import {PrivateChatInfo} from "./PrivateChatInfo.tsx";
import {EditGroupChatForm} from "./EditGroupChatForm.tsx";
import {ContextMenu} from "./ContextMenu.tsx";

type Props = {
    selectedChatId: number | null;
    currentUser: { id: number; displayName: string, username: string, avatar:string|null } | null;
    setSelectedChatId: (value: number|null) => void,
    setChats: (chat:any)=>void,
    chats:Chat[]
};

export function ChatWindow({ selectedChatId, currentUser, setSelectedChatId, setChats, chats}: Props) {

    const [errors, setErrors] = useState<{
        chat: string[],
        messages: string[],
        sendMessage: string[]
    }>({chat: [], messages: [], sendMessage:[]});
    const [isLoading, setIsLoading] = useState({chat: false, messages:false});
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState("");
    const [isInitialLoad, setIsInitialLoad] = useState<boolean|null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isAdmin, setIsAdmin] = useState<boolean| null>(null);
    const [contextMenuMessageId, setContextMenuMessageId] = useState<number | null>(null);
    const [editingMessageId, setEditingMessageId] =useState<number|null>(null);

    useEffect(() => {
        if (selectedChatId === null) return;
        setContextMenuMessageId(null);
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
                    if (chat.chat && currentUser) {
                        const userFromChat = chat.chat.chatUsers.find((u:any)=>u.userId === currentUser.id);
                        setIsAdmin((userFromChat && userFromChat.role=== "ADMIN"));
                        setChat(chat.chat);
                    }
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
            if(!editingMessageId){
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
            if(editingMessageId){
                const response = await Client(`/message/chat/${selectedChatId}/${editingMessageId}`, "PUT", JSON.stringify({text: inputValue}))
                if(response.errors) {
                    setErrors((prev)=>({
                        ...prev,
                        sendMessage: response.errors
                    }));
                }
                if(response.message){
                    const newMessages = messages.map((m)=> m.id === editingMessageId ? response.message : m );
                    setMessages(newMessages);
                    setInputValue("");
                    setErrors((prev)=>(
                        {...prev, sendMessage: []}
                    ))
                    setEditingMessageId(null);
                    setContextMenuMessageId(null);
                }
                }
            }
    }


    function handleOnContext(e: React.MouseEvent<HTMLLIElement>, messageId: number){
        e.preventDefault();
        setContextMenuMessageId(messageId);
    }

    function handleCloseEditMessage(){
        setContextMenuMessageId(null);
        setInputValue("");
        setEditingMessageId(null);
    }

    return(
        <div className="chat-window-box" onClick={()=>setContextMenuMessageId(null)}>
            {isSettingsOpen && chat &&(
                <div className="modal-overlay">
                    {chat.type === "GROUP" ? (
                        <GroupChatInfo chat={chat}
                                       setIsSettingsOpen={setIsSettingsOpen}
                                       currentUser={currentUser}
                                       setChat={setChat}
                                       setSelectedChatId={setSelectedChatId}
                                       chats={chats}
                                       setChats={setChats}
                                       setIsEdit={setIsEdit}
                        />
                    ):(
                        <PrivateChatInfo chat={chat}
                                         setIsSettingsOpen={setIsSettingsOpen}
                                         setChat={setChat}
                                         setSelectedChatId={setSelectedChatId}
                                         chats={chats}
                                         setChats={setChats}
                        />
                    )}
                </div>
            )}
            {isEdit && chat &&(
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button onClick={()=>setIsEdit(false)}>X</button>
                        <EditGroupChatForm chat={chat}
                                           setSelectedChatId={setSelectedChatId}
                                           setIsEdit={setIsEdit}
                                           setChats={setChats}
                                           chats={chats}
                                           setChat={setChat}
                        />
                    </div>
                </div>
            )}
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
                            <>
                                {contextMenuMessageId && message.id === contextMenuMessageId &&(
                                    <div onClick={(e)=>e.stopPropagation()}>
                                        <ContextMenu isAdmin={isAdmin}
                                                     currentUser={currentUser}
                                                     message={message}
                                                     chat={chat}
                                                     setContextMenuMessageId={setContextMenuMessageId}
                                                     setMessages={setMessages}
                                                     messages={messages}
                                                     setInputValue={setInputValue}
                                                     setEditingMessageId={setEditingMessageId}
                                        />
                                    </div>
                                )}
                                <li key={message.id} onContextMenu={(e)=> handleOnContext(e, message.id)}>{message.text}</li>
                            </>
                        ))}
                    </ul>
                )}

                {!isLoading.messages && selectedChatId !== null && (
                    <>
                        {editingMessageId &&(
                            <button onClick={handleCloseEditMessage}>X</button>
                        )}
                        <form onClick={(e)=>e.stopPropagation()} onSubmit={handleSubmit}>
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
                    </>
                )}
            </div>
        </div>
    )
}