import {ChatList} from "../components/ChatList.tsx";
import {ChatWindow} from "../components/ChatWindow.tsx";
import "../HomePage.css"
import {useEffect, useState} from "react";
import {GroupChatForm} from "../components/GroupChatForm.tsx";
import type {User} from "../types/User.ts";
import Client from "../api/client.ts";
import {EditUserModal} from "../components/EditUserForm.tsx";
import {UserMenu} from "../components/UserMenu.tsx";
function HomePage() {

    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [chats, setChats] = useState<any[]>([]);
    const [isEditUser, setIsEditUser] = useState<boolean>(false);
    const [isUserMenu, setIsUserMenu] = useState<boolean>(false);


    useEffect(() => {
        async function getCurrentUser(){
                try {
                    const user = await Client("/user", "GET");
                    if(user.user) setCurrentUser(user.user);

                } catch {
                    setCurrentUser(null);
                }
        }
        getCurrentUser();
    }, []);


    return (
        <div className="content-box">
            {isGroupModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setIsGroupModalOpen(false)}>Close</button>
                        <GroupChatForm currentUser={currentUser}
                                       setSelectedChatId={setSelectedChatId}
                                       setIsGroupModalOpen={setIsGroupModalOpen}
                                       setChats={setChats}/>
                    </div>
                </div>
            )}
            {isEditUser && (
                <div className="modal-overlay">
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setIsEditUser(false)}>Close</button>
                        <EditUserModal currentUser={currentUser}
                                       setCurrentUser={setCurrentUser}
                                       setIsEditUser={setIsEditUser}/>
                    </div>
                </div>
            )}
            {isUserMenu &&(
                <UserMenu setIsEditUser={setIsEditUser}
                          setIsGroupModalOpen={setIsGroupModalOpen}
                          setIsUserMenu={setIsUserMenu}/>
            )}

            {!isUserMenu &&(
                <button onClick={()=>setIsUserMenu(true)}>Menu</button>
            )}
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
