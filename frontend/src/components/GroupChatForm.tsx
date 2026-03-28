import {useState} from "react";
import {UserSearch} from "./UserSearch.tsx";
import type {User} from "../types/User.ts";
import * as React from "react";
import Client from "../api/client.ts";


type Props = {
    setSelectedChatId: (id: number) => void;
    currentUser: { id: number; displayName: string; username: string; avatar: string | null } | null;
    setIsGroupModalOpen: (value: boolean) => void;
    setChats: (chat:any)=>void
};

export function GroupChatForm({currentUser, setSelectedChatId, setIsGroupModalOpen, setChats}:Props){
    const [inputValue, setInputValue] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [avatar, setAvatar] = useState<File | null>(null);
    const [errors, setErrors] = useState<string[]>([]);


    function selectUser(user:User){
       setSelectedUsers((prev: any) => {
           const exists = prev.some((c: any) => c.id === user.id);
           if (exists) return prev;
           return [user, ...prev];
       })
    }

    function removeSelectedUser(userId:number){
        const newUsers = selectedUsers.filter((user)=>user.id !== userId);
        setSelectedUsers(newUsers);
    }

    async function handleSubmit (e: React.SubmitEvent<HTMLFormElement>){
        e.preventDefault();
        const formData = new FormData();
        const usersId = selectedUsers.map((user)=>user.id);
        const unique = [...new Set(usersId)];
        const notCurrentUser = unique.filter(i => i !== currentUser?.id);
        console.log(notCurrentUser)
        formData.append("usersId", JSON.stringify(notCurrentUser));

        formData.append("name", inputValue)
        if(avatar){
            formData.append("avatar", avatar)
        }

        const groupChat = await Client("/chat/group", "POST", formData);
        if(groupChat.errors) setErrors(groupChat.errors);
        if(groupChat.chat) {
            setSelectedChatId(groupChat.chat.id);
            setIsGroupModalOpen(false);
            setChats((prev:any)=>([...prev, groupChat.chat]));
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
            <label htmlFor="avatar">Group avatar:</label>
            <input name="avatar"
                   id="avatar"
                   type="file"
                   onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                       if(e.target.files && e.target.files[0]){
                           setAvatar(e.target.files[0]);
                       }
                   }}/>
            {selectedUsers.length > 0 &&(
                <ul>
                    {selectedUsers.map((user)=>(
                        <li key={user.id}>
                            <h3>{user.username}</h3>
                            <button onClick={()=>removeSelectedUser(user.id)}>X</button>
                        </li>
                    ))}
                </ul>
            )}
            <label>Selected users:</label>
            <UserSearch onSelect={selectUser}/>
            <button type="submit">Submit</button>
            {errors.length>0 &&(
                <ul>
                    {errors.map((e,index)=>(<li key={index}>{e}</li>))}
                </ul>
            )}
        </form>
    )
}