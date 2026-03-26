import {ChatList} from "../components/ChatList.tsx";
import {ChatWindow} from "../components/ChatWindow.tsx";
import "../HomePage.css"
import {useEffect, useState} from "react";
import * as React from "react";
import {useNavigate} from "react-router-dom";
function HomePage() {

    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
    const [currentUser, setCurrentUser] = useState<{id: number, displayName: string, username: string, avatar:string|null} | null>(null);

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
            <button onClick={handleLogout}>Log out</button>
            <ChatList setSelectedChatId={setSelectedChatId} currentUser={currentUser} />
            <ChatWindow selectedChatId={selectedChatId} currentUser={currentUser} />
        </div>
    )
}

export default HomePage;
