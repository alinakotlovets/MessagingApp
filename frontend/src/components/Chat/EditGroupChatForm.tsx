import {useState} from "react";
import * as React from "react";
import Client from "../../api/client.ts";
import type {Chat} from "../../types/Chat.ts";


type Props = {
    chat: Chat,
    setSelectedChatId: (id: number) => void;
    setIsEdit: (value: boolean) => void;
    setChats: (chat:any)=>void,
    chats: Chat[],
    setChat: (value: Chat)=>void
};

export function EditGroupChatForm({setSelectedChatId, setIsEdit, setChats, chat, chats, setChat}:Props){
    const [inputValue, setInputValue] = useState<string>(`${chat.name}`);
    const [avatar, setAvatar] = useState<File | null>(null);
    const [errors, setErrors] = useState<string[]>([]);


    async function handleSubmit (e: React.SubmitEvent<HTMLFormElement>){
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", inputValue)
        if(avatar){
            formData.append("avatar", avatar)
        }

        const groupChat = await Client(`/chat/group/${chat.id}`, "PUT", formData);
        if(groupChat.errors) setErrors(groupChat.errors);
        if(groupChat.chat) {
            setChat(groupChat.chat);
            setSelectedChatId(groupChat.chat.id);
            setIsEdit(false);
            const newChats = chats.map((c)=> c.id === chat.id ? groupChat.chat : c);
            setChats(newChats);
        }
    }

    return(
        <form onSubmit={handleSubmit}  encType="multipart/form-data">
            <label htmlFor="groupName">Group name:</label>
            <input type="text"
                   value={inputValue}
                   id="groupName"
                   name="groupName"
                   onChange={(e)=>setInputValue(e.target.value)}/>
            {avatar && (
                <div className="image-preview">
                    <p>Preview image:</p>
                    <img src={URL.createObjectURL(avatar)} alt="preview" />
                </div>
            )}
            <label>Group avatar:</label>
            <label className="file-label" htmlFor="avatar">
                {avatar ? avatar.name : "Choose image"}
            </label>
            <input name="avatar"
                   className="file-input-hidden"
                   id="avatar"
                   type="file"
                   onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                       if(e.target.files && e.target.files[0]){
                           setAvatar(e.target.files[0]);
                       }
                   }}/>
            <div className="submit-btn-box">
                <button className="submit-btn" type="submit">Submit</button>
            </div>
            {errors.length>0 &&(
                <ul>
                    {errors.map((e,index)=>(<li key={index}>{e}</li>))}
                </ul>
            )}
        </form>
    )
}