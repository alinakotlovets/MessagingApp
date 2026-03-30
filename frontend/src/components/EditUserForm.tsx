import type {User} from "../types/User.ts";
import {useState} from "react";
import * as React from "react";
import Client from "../api/client.ts";

type Props = {
    currentUser: User | null,
    setCurrentUser: (value: User)=>void,
    setIsEditUser: (value:boolean)=>void
}
export function EditUserModal({currentUser, setCurrentUser, setIsEditUser}:Props){
    const [inputValue, setInputValue] = useState<string>(`${currentUser?.displayName}`);
    const [avatar, setAvatar] = useState<File | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    if(!currentUser) return null;

    async function handleSubmit (e: React.SubmitEvent<HTMLFormElement>){
        e.preventDefault();
        const formData = new FormData();
        formData.append("displayName", inputValue)
        if(avatar){
            formData.append("avatar", avatar)
        }
        if(!currentUser) return null;
        const user = await Client(`/user/${currentUser.id}`, "PUT", formData);
        if(user.errors) setErrors(user.errors);
        if(user.user) {
            setCurrentUser(user.user);
            setIsEditUser(false);
        }
    }

    return(
        <form onSubmit={handleSubmit}  encType="multipart/form-data">
            <label htmlFor="displayName">Display name:</label>
            <input type="text"
                   value={inputValue}
                   id="displayName"
                   name="displayName"
                   onChange={(e)=>setInputValue(e.target.value)}/>
            <label htmlFor="avatar">Avatar:</label>
            <input name="avatar"
                   id="avatar"
                   type="file"
                   onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                       if(e.target.files && e.target.files[0]){
                           setAvatar(e.target.files[0]);
                       }
                   }}/>
            <button type="submit">Submit</button>
            {errors.length>0 &&(
                <ul>
                    {errors.map((e,index)=>(<li key={index}>{e}</li>))}
                </ul>
            )}
        </form>
    )
}