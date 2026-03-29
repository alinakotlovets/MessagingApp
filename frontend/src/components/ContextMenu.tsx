import type {User} from "../types/User.ts";
import type {Message} from "../types/Message.ts";
import Client from "../api/client.ts";
import {useState} from "react";
import * as React from "react";

type Props ={
    isAdmin: boolean | null,
    currentUser: User |null,
    message: Message,
    chat:any,
    setContextMenuMessageId: (value: number|null)=> void
    setMessages: any,
    messages: Message[],
    setInputValue: (value:string)=>void,
    setEditingMessageId: (value: number|null)=>void
}
export function ContextMenu({
                                isAdmin,
                                currentUser,
                                message,
                                chat,
                                setContextMenuMessageId,
                                setMessages,
                                messages,
                                setInputValue,
                                setEditingMessageId}:Props){
    if(!currentUser) return null;

    const [errors, setErrors]= useState<string[]>([]);

    async function deleteUser(){
        setErrors([]);
        const response = await Client(`/message/chat/${chat.id}/${message.id}`, "DELETE");
        if(response.errors) setErrors(response.errors);
        if(response.message) {
            const newMessages = messages.filter((m)=>m.id !== message.id);
            setMessages(newMessages);
            setContextMenuMessageId(null);
        }
    }

    function isErrors(){
        if(errors.length > 0) return (<ul> {errors.map((e, i) => (
                    <li key={i}>{e}</li> ))} </ul>)
    }

    function editUser(e: React.MouseEvent<HTMLButtonElement>){
        e.stopPropagation()
        setInputValue(message.text);
        setContextMenuMessageId(null);
        setEditingMessageId(message.id);
    }



    if(currentUser.id === message.senderId){
        return (
            <div>
                <button onClick={(e)=>editUser(e)}>Edit message</button>
                <button onClick={deleteUser}>Delete message</button>
                {isErrors()}
            </div>
        )
    }
    if(isAdmin && currentUser.id !== message.senderId){
        return (
            <div>
                <button onClick={deleteUser}>Delete message</button>
                {isErrors()}
            </div>
        )
    }

    return  null;
}