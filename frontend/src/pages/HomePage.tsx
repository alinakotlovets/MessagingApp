import {ChatList} from "../components/ChatList/ChatList.tsx";
import {ChatWindow} from "../components/ChatWindow/ChatWindow.tsx";
import "./HomePage.css"
import {Modal} from "../components/ui/Modal.tsx";
import {useEffect, useState} from "react";
import {GroupChatForm} from "../components/Chat/GroupChatForm.tsx";
import type {User} from "../types/User.ts";
import Client from "../api/client.ts";
import {EditUserModal} from "../components/User/EditUserForm.tsx";
function HomePage() {

    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [chats, setChats] = useState<any[]>([]);
    const [isEditUser, setIsEditUser] = useState<boolean>(false);


    useEffect(() => {
        async function getCurrentUser(){
                try {
                    const user = await Client("/User", "GET");
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
                <Modal onClose={()=>setIsGroupModalOpen(false)} closeOnOverlayClick={false}>
                    <GroupChatForm
                        currentUser={currentUser}
                        setSelectedChatId={setSelectedChatId}
                        setIsGroupModalOpen={setIsGroupModalOpen}
                        setChats={setChats}
                    />
                </Modal>
            )}
            {isEditUser && (
                <Modal onClose={() => setIsEditUser(false)} closeOnOverlayClick={true}>
                <EditUserModal currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                    setIsEditUser={setIsEditUser}/>
                </Modal>
            )}
            <ChatList setSelectedChatId={setSelectedChatId}
                      currentUser={currentUser}
                      chats={chats}
                      setChats={setChats}
                      setIsEditUser={setIsEditUser}
                      setIsGroupModalOpen={setIsGroupModalOpen}/>
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
