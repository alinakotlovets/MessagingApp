import {ChatList} from "../components/ChatList.tsx";
import {ChatWindow} from "../components/ChatWindow.tsx";
import "../HomePage.css"
import {useEffect, useState} from "react";
import * as React from "react";
import {useNavigate} from "react-router-dom";
import {GroupChatForm} from "../components/GroupChatForm.tsx";
import type {User} from "../types/User.ts";
function HomePage() {

    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [chats, setChats] = useState<any[]>([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payloadBase64 = token.split(".")[1];
                const userInfo = JSON.parse(atob(payloadBase64));
                setCurrentUser(userInfo);
            } catch {
                setCurrentUser(null);
            }
        }
    }, []);

    const navigate = useNavigate();
    function handleLogout(e:React.MouseEvent<HTMLButtonElement>){
        e.preventDefault();
        window.localStorage.clear()
        navigate("/login");
    }
    return (
        <div className="content-box">
            {isGroupModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setIsGroupModalOpen(false)}>Close</button>
                        <GroupChatForm currentUser={currentUser} setSelectedChatId={setSelectedChatId} setIsGroupModalOpen={setIsGroupModalOpen} setChats={setChats}/>
                    </div>
                </div>
            )}
            <button onClick={() => setIsGroupModalOpen(true)}>Create group chat</button>
            <button onClick={handleLogout}>Log out</button>
            <ChatList setSelectedChatId={setSelectedChatId}
                      currentUser={currentUser}
                      chats={chats}
                      setChats={setChats}/>
            <ChatWindow selectedChatId={selectedChatId}
                        currentUser={currentUser}
                        setSelectedChatId={setSelectedChatId}
                        chats={chats}
                        setChats={setChats}
            />
        </div>
    )
}

export default HomePage;
