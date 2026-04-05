import {useState} from "react";
import {UserSearch} from "../ChatList/UserSearch.tsx";
import type {User} from "../../types/User.ts";
import * as React from "react";
import Client from "../../api/client.ts";
import defaultAvatar from "../../assets/defaultAvatar.png";


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
                   id="avatar"
                   className="file-input-hidden"
                   type="file"
                   onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                       if(e.target.files && e.target.files[0]){
                           setAvatar(e.target.files[0]);
                       }
                   }}/>
            {selectedUsers.length > 0 &&(
                <>
                    <label>Selected users:</label>
                <ul className="search-selected-users">
                    {selectedUsers.map((user)=>(
                        <li className="user-info-box" key={user.id}>
                            <div className="user-info-box-left">
                            <img className="user-avatar" src={user.avatar || defaultAvatar} alt={user.username + " avatar"}/>
                            <div className="user-text-box">
                                <h3 className="font-18px">{user.displayName}</h3>
                                <h4 className="text-grey font-16px">@{user.username}</h4>
                            </div>
                            </div>
                            <button className="close-search-btn" onClick={()=>removeSelectedUser(user.id)}>X</button>
                        </li>
                    ))}
                </ul>
                </>
            )}
            <label>Search users:</label>
            <UserSearch onSelect={selectUser}/>
            <div className="submit-btn-box">
                <button className="submit-btn" type="submit">Submit</button>
            </div>
            {errors.length>0 &&(
                <div className="flex-center">
                    <ul>
                        {errors.map((e,index)=>(<li key={index}>{e}</li>))}
                    </ul>
                </div>
            )}
        </form>
    )
}