import * as React from "react";
import {useNavigate} from "react-router-dom";

type Props = {
    setIsEditUser: (value: boolean)=>void,
    setIsGroupModalOpen: (value:boolean)=>void,
    setIsUserMenu: (value:boolean)=>void
}
export function UserMenu({setIsEditUser, setIsGroupModalOpen, setIsUserMenu}:Props){
    const navigate = useNavigate();
    function handleLogout(e:React.MouseEvent<HTMLButtonElement>){
        e.preventDefault();
        window.localStorage.clear()
        navigate("/login");
    }

    function handleEdit() {
        setIsEditUser(true)
        setIsUserMenu(false);
    }

    function handleCreateGroupChat(){
        setIsGroupModalOpen(true)
        setIsEditUser(false);
    }

    return(
        <div>
            <button onClick={()=>setIsUserMenu(false)}>X</button>
            <div>
                <button onClick={handleEdit}>Edit info</button>
                <button onClick={handleCreateGroupChat}>Create group chat</button>
                <button onClick={handleLogout}>Log out</button>
            </div>
        </div>
    )
}