import Client from "../../api/client.ts";
import type {Chat} from "../../types/Chat.ts";
import {useState} from "react";
import * as React from "react";
import type {Message} from "../../types/Message.ts";

type Props={
    chat: Chat | null,
    messages: Message[],
    setMessages: (value: any) =>void,
    setIsAddImage: (value: boolean) => void
}

export function AddPhotoForm({chat, messages, setMessages, setIsAddImage}:Props){
    const [image, setImage] = useState<File | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    async function handleSubmit(e:React.SubmitEvent<HTMLFormElement>){
        e.preventDefault();
        const formData =new FormData();
        if(image) formData.append("image", image);
        if(!chat) return null;
        const message = await Client(`/message/chat/${chat.id}/image`, "POST", formData);
        if(message.errors) setErrors(message.errors);
        if(message.message){
            const newMessages = [...messages, message.message];
            setMessages(newMessages);
            setIsAddImage(false);
        }
    }

    return(
        <form  onSubmit={(e)=>handleSubmit(e)}  encType="multipart/form-data">
            <input name="image"
                   type="file"
                   onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                    if(e.target.files && e.target.files[0]){
                    setImage(e.target.files[0]);}}}/>
            <button>Send</button>
            {errors.length>0 &&(
                <ul>
                    {errors.map((e, i)=>(
                        <li key={i}>{e}</li>
                    ))}
                </ul>
            )}
        </form>
    )
}