import {useEffect, useState, useRef} from "react";
import Client from "../api/client.ts";
import * as React from "react";
import type {Chat} from "../types/Chat.ts";
import {GroupChatInfo} from "./GroupChatInfo.tsx";
import {PrivateChatInfo} from "./PrivateChatInfo.tsx";
import {EditGroupChatForm} from "./EditGroupChatForm.tsx";
import {useChat} from "../hooks/useChat.ts";
import {ChatHeader} from "./ChatHeader.tsx";
import {MessageForm} from "./MessageForm.tsx";
import {Messages} from "./Messages.tsx";
import type {UiStateChatWindow} from "../types/UiStateChatWindow.ts";

type Props = {
    selectedChatId: number | null;
    currentUser: { id: number; displayName: string, username: string, avatar:string|null } | null;
    setSelectedChatId: (value: number|null) => void,
    setChats: (chat:any)=>void,
    chats:Chat[]
};

export function ChatWindow({ selectedChatId,
                               currentUser,
                               setSelectedChatId,
                               setChats,
                               chats}: Props) {



    const [inputValue, setInputValue] = useState("");
    const [isFetching, setIsFetching] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [uiState, setUiState] = useState<UiStateChatWindow>({
        isSettingsOpen: false,
        isEdit: false,
        contextMenuMessageId: null,
        isAddImage: false,
    });
    const [editingMessageId, setEditingMessageId] =useState<number|null>(null);


    const {
        isInitialLoad,
        setIsInitialLoad,
        isLoading,
        chat,
        setChat,
        messages,
        setMessages,
        isAdmin,
        errors,
        setErrors
    } = useChat({
        selectedChatId,
        currentUser
    });


    useEffect(() => {
        setUiState((prev)=>({...prev, сontextMenuMessageId: null}))
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
                    setUiState((prev)=>({...prev, сontextMenuMessageId: null}))
                }
                }
            }
    }


    function handleOnContext(e: React.MouseEvent<HTMLLIElement>, messageId: number){
        e.preventDefault();
        setUiState((prev)=>({...prev, contextMenuMessageId: messageId}));
    }

    function handleAddImage(e:React.MouseEvent<HTMLButtonElement>){
        e.preventDefault();
        setUiState((prev)=>({...prev, isAddImage: true}))
    }

    function handleCloseEditMessage(){
        setUiState((prev)=>({...prev, contextMenuMessageId: null}))
        setInputValue("");
        setEditingMessageId(null);
    }

    return(
        <div className="chat-window-box" onClick={()=>
            setUiState((prev)=>({...prev, contextMenuMessageId: null}))
           }>
            {uiState.isSettingsOpen && chat &&(
                <div className="modal-overlay">
                    {chat.type === "GROUP" ? (
                        <GroupChatInfo chat={chat}
                                       setIsSettingsOpen={(value: boolean) => setUiState(prev => ({ ...prev, isSettingsOpen: value }))}
                                       currentUser={currentUser}
                                       setChat={setChat}
                                       setSelectedChatId={setSelectedChatId}
                                       chats={chats}
                                       setChats={setChats}
                                       setIsEdit={(value: boolean) => setUiState(prev => ({ ...prev, isEdit: value }))}
                        />
                    ):(
                        <PrivateChatInfo chat={chat}
                                         setIsSettingsOpen={(value: boolean) => setUiState(prev => ({ ...prev, isSettingsOpen: value }))}
                                         setChat={setChat}
                                         setSelectedChatId={setSelectedChatId}
                                         chats={chats}
                                         setChats={setChats}
                        />
                    )}
                </div>
            )}
            {uiState.isEdit && chat &&(
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button onClick={()=>setUiState((prev)=>({...prev, isEdit:false}))}>X</button>
                        <EditGroupChatForm chat={chat}
                                           setSelectedChatId={setSelectedChatId}
                                           setIsEdit={(value: boolean) => setUiState(prev => ({ ...prev, isEdit: value }))}
                                           setChats={setChats}
                                           chats={chats}
                                           setChat={setChat}
                        />
                    </div>
                </div>
            )}
            <ChatHeader isLoading={isLoading}
                        errors={errors}
                        selectedChatId={selectedChatId}
                        chat={chat}
                        currentUser={currentUser}
                        setIsSettingsOpen={(value: boolean) => setUiState(prev => ({ ...prev, isSettingsOpen: value }))}/>

            <Messages messages={messages}
                      isLoading={isLoading}
                      errors={errors}
                      selectedChatId={selectedChatId}
                      contextMenuMessageId={uiState.contextMenuMessageId}
                      setContextMenuMessageId={(value: number| null) => setUiState(prev => ({ ...prev, contextMenuMessageId: value }))}
                      handleOnContext={handleOnContext}
                      isAdmin={isAdmin}
                      currentUser={currentUser}
                      chat={chat}
                      setMessages={setMessages}
                      setInputValue={setInputValue}
                      setEditingMessageId={setEditingMessageId}/>

            <MessageForm chat={chat}
                         isAddImage={uiState.isAddImage}
                         setIsAddImage={(value: boolean) => setUiState(prev => ({ ...prev, isAddImage: value }))}
                         selectedChatId={selectedChatId}
                         isLoading={isLoading}
                         inputValue={inputValue}
                         setInputValue={setInputValue}
                         errors={errors}
                         handlers={{ handleSubmit, handleAddImage, handleCloseEditMessage }}
                         messageState={{ messages, setMessages, editingMessageId }}/>
        </div>
    )
}