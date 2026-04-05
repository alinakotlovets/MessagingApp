import { useEffect, useState } from "react";
import Client from "../../api/client.ts";
import * as React from "react";
import type {User} from "../../types/User.ts";
import type {Chat} from "../../types/Chat.ts";
import {UserMenu} from "../User/UserMenu.tsx";
import {ChatListItem} from "./ChatListItem.tsx";
import {SearchBox} from "./SearchBox.tsx";
import defaultAvatar from "../../assets/defaultAvatar.png";
import "./ChatList.css"
import "../ui/CustomScroll.css"

type Errors = {
    chatErrors: string[];
    searchErrors: string[];
};

type Props = {
    setSelectedChatId: (id: number) => void;
    currentUser: { id: number; displayName: string; username: string; avatar: string | null } | null;
    setChats: (chat:any)=>void,
    chats:Chat[],
    setIsEditUser: (value: boolean)=>void,
    setIsGroupModalOpen: (value:boolean)=>void,
};

export function ChatList({ setSelectedChatId, currentUser, setChats, chats, setIsEditUser, setIsGroupModalOpen}: Props) {

    const [errors, setErrors] = useState<Errors>({ chatErrors: [], searchErrors: [] });
    const [isLoading, setIsLoading] = useState({ chatLoading: false, searchLoading: false });
    const [searchValue, setSearchValue] = useState("");
    const [users, setUsers] = useState<User[] | null>(null);
    const [isUserMenu, setIsUserMenu] = useState<boolean>(false);

    useEffect(() => {
        async function getUserChats(showLoading: boolean) {
            if (showLoading) setIsLoading(prev => ({ ...prev, chatLoading: true }));
            const response = await Client("/chat/User", "GET");
            if (response.errors) setErrors((prev: any) => ({ ...prev, chatErrors: response.errors }));
            if (response.chats) setChats(response.chats);
            if (showLoading) setIsLoading(prev => ({ ...prev, chatLoading: false }));
        }

        getUserChats(true);


        const intervalId = setInterval(()=>{
            getUserChats(false);
        },3000)

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    function handleClick(e: React.MouseEvent<HTMLLIElement>, chatId: number) {
        e.preventDefault();
        setSelectedChatId(chatId);
    }

    useEffect(() => {
        if (searchValue.trim() === "") {
            setUsers(null);
            return;
        }
        setIsLoading(prev => ({ ...prev, searchLoading: true }));
        const timeoutId = setTimeout(async () => {
            try {
                const searchResult = await Client(`/user/search?username=${searchValue}`, "GET");
                if (searchResult.users) setUsers(searchResult.users);
                if (searchResult.errors) setErrors(prev => ({ ...prev, searchErrors: searchResult.errors }));
            } finally {
                setIsLoading(prev => ({ ...prev, searchLoading: false }));
            }
        }, 2000);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [searchValue]);

    async function handleCreateChat(e: React.MouseEvent<HTMLLIElement>, userId: number) {
        e.preventDefault();
        setErrors(prev => ({ ...prev, searchErrors: [] }));
        const chat = await Client("/chat/private", "POST", JSON.stringify({ userId }));
        if (chat.errors) {
            setErrors(prev => ({ ...prev, searchErrors: chat.errors }));
            return;
        }
        if (chat.chat) {
            setSearchValue("");
            setUsers(null);
            setChats((prev: any) => {
                const exists = prev.some((c: any) => c.id === chat.chat.id);
                if (exists) return prev;
                return [chat.chat, ...prev];
            });
            setSelectedChatId(chat.chat.id);
        }
    }

    return (
        <div className="chat-list-box">

            {isUserMenu &&(
                <UserMenu  setIsEditUser={setIsEditUser}
                          setIsGroupModalOpen={setIsGroupModalOpen}
                          setIsUserMenu={setIsUserMenu}
                          currentUser={currentUser}
                />
            )}

            <SearchBox setIsUserMenu={setIsUserMenu}
                       searchValue={searchValue}
                       setSearchValue={setSearchValue}
                       setUsers={setUsers}
                       setErrors={setErrors}/>
            <div className="chat-list-items custom-scroll">

            {isLoading.chatLoading &&
                (<div className="flex-center">
                    <h3>Loading...</h3>
                </div>)
            }
            {isLoading.searchLoading && searchValue !== "" &&
                (<div className="flex-center">
                <h3>Loading...</h3>
                </div>)}

            {errors.chatErrors.length > 0 && (
                <ul>
                    {errors.chatErrors.map((e, i) => (
                        <li key={i}>{e}</li>
                    ))}
                </ul>
            )}

            {chats.length > 0 && searchValue === "" && (
                <ul className="chat-list-items-box">
                    {chats.map((chat: any) => (
                        <li className="chat-list-item" key={chat.id} onClick={(e) => handleClick(e, chat.id)}>
                           <ChatListItem chat={chat} currentUser={currentUser}/>
                        </li>
                    ))}
                </ul>
            )}

            {!isLoading.chatLoading && chats.length === 0 && searchValue === "" && (
                <div className="flex-center">
                    <h2>There are no chats create them</h2>
                </div>
            )}

            {errors.searchErrors.length > 0 && (
                <ul>
                    {errors.searchErrors.map((e, i) => (
                        <li key={i}>{e}</li>
                    ))}
                </ul>
            )}

                {users && users.length === 0 &&
                        <div className="flex-center">
                            User with this username not found
                        </div>
                }

            {!isLoading.searchLoading && searchValue !== "" && users && users.length>0 && (
                <ul>
                    {users && users.map((user: any) => (
                        <li key={user.id}
                            className="private-user-info-box"
                            onClick={(e) => handleCreateChat(e, user.id)}>
                                <img className="user-avatar" src={user.avatar || defaultAvatar} alt={user.username + " avatar"}/>
                                <div className="user-text-box">
                                    <h3 className="font-18px">{user.displayName}</h3>
                                    <h4 className="text-grey font-16px">@{user.username}</h4>
                                </div>
                        </li>
                    ))}
                </ul>
            )}
            </div>
        </div>
    );
}