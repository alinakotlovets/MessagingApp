import {ChatList} from "../components/ChatList.tsx";
import {ChatWindow} from "../components/ChatWindow.tsx";
import "../HomePage.css"
import {useState} from "react";
import * as React from "react";
import {useNavigate} from "react-router-dom";
function HomePage() {

    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);

    const navagate = useNavigate();
    function handleLogout(e:React.MouseEvent<HTMLButtonElement>){
        e.preventDefault();
        window.localStorage.clear()
        navagate("/login");
    }
    return (
        <div className="content-box">
            <button onClick={handleLogout}>Log out</button>
            <ChatList setSelectedChatId={setSelectedChatId} />
            <ChatWindow selectedChatId={selectedChatId} />
        </div>
    )
}

export default HomePage;
