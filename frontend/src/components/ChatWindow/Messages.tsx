import {ContextMenu} from "./ContextMenu.tsx";
import * as React from "react";


type MessagesProps = {
    messages: any[];
    isLoading: { chat: boolean; messages: boolean };
    errors: { messages: string[] };
    selectedChatId: number | null;
    contextMenuMessageId: number | null;
    setContextMenuMessageId: (id: number | null) => void;
    handleOnContext: (e: React.MouseEvent<HTMLLIElement>, messageId: number) => void;
    isAdmin: boolean | null;
    currentUser: { id: number; displayName: string; username: string; avatar: string | null } | null;
    chat: any;
    setMessages: (messages: any[]) => void;
    setInputValue: (value: string) => void;
    setEditingMessageId: (id: number | null) => void;
};

export function Messages({messages,
                             isLoading,
                             errors,
                             selectedChatId,
                             contextMenuMessageId,
                             setContextMenuMessageId,
                             handleOnContext,
                             isAdmin,
                             currentUser,
                             chat,
                             setMessages,
                             setInputValue,
                             setEditingMessageId}:MessagesProps){
    return(
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
                            <li key={message.id} onContextMenu={(e)=>
                                handleOnContext(e, message.id)}>
                                {message.type === "MESSAGE" ?
                                    (<h3>{message.text}</h3>) :
                                    (<img src={message.text}/>)}
                            </li>
                        </>
                    ))}
                </ul>
            )}
        </div>
    )
}