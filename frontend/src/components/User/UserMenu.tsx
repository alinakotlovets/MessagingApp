import * as React from "react";
import {useNavigate} from "react-router-dom";
import type {User} from "../../types/User.ts";
import defaultAvatar from "../../assets/defaultAvatar.png";
import "./UserMenu.css";

type Props = {
    setIsEditUser: (value: boolean)=>void,
    setIsGroupModalOpen: (value:boolean)=>void,
    setIsUserMenu: (value:boolean)=>void,
    currentUser: User | null
}
export function UserMenu({setIsEditUser, setIsGroupModalOpen, setIsUserMenu, currentUser}:Props){
    const navigate = useNavigate();
    function handleLogout(e:React.MouseEvent<HTMLButtonElement>){
        e.preventDefault();
        window.localStorage.clear()
        navigate("/login");
    }

    function handleEdit() {
        setIsEditUser(true);
        setIsUserMenu(false);
    }

    function handleCreateGroupChat(){
        setIsGroupModalOpen(true);
        setIsEditUser(false);
        setIsUserMenu(false);
    }

    if(!currentUser) return null;
    return(
        <div className="user-menu">
            <button className="close-btn" onClick={()=>setIsUserMenu(false)}>X</button>
            <div className="user-info">
                <img className="user-menu-avatar" src={currentUser.avatar || defaultAvatar} alt={currentUser.username} />
                <h2>{currentUser.displayName}</h2>
                <h4>@{currentUser.username}</h4>
            </div>
            <div className="menu-actions">
                <button onClick={handleEdit}>Edit info</button>
                <button onClick={handleCreateGroupChat}>Create group chat</button>
                <button onClick={handleLogout}>Log out</button>
            </div>
        </div>
    )
}