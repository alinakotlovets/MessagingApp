import {ContextMenu} from "./ContextMenu.tsx";
import * as React from "react";
import {getMessageClass} from "../../utils/getMessageClass.ts";
import {formatDate} from "../../utils/formatDate.ts";
import {useRef} from "react";
import "./Messages.css";
import "../ui/CustomScroll.css"
import defaultAvatar from "../../assets/defaultAvatar.png"


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
    messagesEndRef: any,
    position: string
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
                             setEditingMessageId,
                             messagesEndRef,
                             position}:MessagesProps){

    if(!currentUser) return null;
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    function handleTouchStart(e: React.TouchEvent<HTMLLIElement>, messageId: number) {
        longPressTimer.current = setTimeout(() => {
            const touch = e.touches[0];
            handleOnContext({
                preventDefault: () => {},
                clientY: touch.clientY,
                clientX: touch.clientX,
            } as React.MouseEvent<HTMLLIElement>, messageId);
        }, 500);
    }
    function handleTouchEnd() {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }
    return(
        <div className="messages custom-scroll">
            {isLoading.messages &&(
                <div className="flex-center">
                    <h2>Loading...</h2>
                </div>
            )}

            {errors.messages.length>0 &&(
                <ul>
                    {errors.messages.map((e, index)=>(
                        <li key={index}>{e}</li>
                    ))}
                </ul>
            )}

            {!isLoading.messages && selectedChatId !== null && messages.length === 0 &&(
                <div className="flex-center">
                <h3>There a no messages send one</h3>
                </div>
            )}

            {!isLoading.messages && selectedChatId !== null && messages &&(
                <>
                <ul>
                    {messages.map((message: any)=>(
                            <li  className="message-item" key={message.id}
                                 onContextMenu={(e)=>
                                handleOnContext(e, message.id)}
                                 onTouchStart={(e) => handleTouchStart(e, message.id)}
                                 onTouchEnd={handleTouchEnd}
                                 onTouchMove={handleTouchEnd}
                            >
                                {contextMenuMessageId && message.id === contextMenuMessageId &&(
                                        <ContextMenu isAdmin={isAdmin}
                                                     currentUser={currentUser}
                                                     message={message}
                                                     chat={chat}
                                                     setContextMenuMessageId={setContextMenuMessageId}
                                                     setMessages={setMessages}
                                                     messages={messages}
                                                     setInputValue={setInputValue}
                                                     setEditingMessageId={setEditingMessageId}
                                                     position={position}
                                        />
                                )}
                                {chat?.type === "GROUP" && message.senderId !== currentUser.id && (
                                    <div className="message-header">
                                        <img src={message.user.avatar || defaultAvatar} alt="avatar" className="avatar" />
                                        <span className="display-name">{message.user.displayName}</span>
                                    </div>
                                )}
                                {message.type === "MESSAGE" ?
                                    (<div className={getMessageClass(message, currentUser)}>
                                        <h3 className="message-text">{message.text}</h3>
                                        <p className="message-time">{formatDate(message.createdAt)}</p>
                                    </div>) :
                                    (<div className={getMessageClass(message, currentUser)}>
                                        <img className={getMessageClass(message, currentUser)} src={message.text}/>
                                        <p className="message-time">{formatDate(message.createdAt)}</p>
                                    </div>)}
                            </li>
                    ))}
                </ul>
                <div ref={messagesEndRef} />
                </>
            )}
        </div>
    )
}