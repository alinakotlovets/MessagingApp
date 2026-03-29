import { useEffect, useState } from "react";
import Client from "../api/client.ts";
import * as React from "react";
import { getChatName } from "../utils/getChatName.ts";
import type {User} from "../types/User.ts";
import type {Chat} from "../types/Chat.ts";

type Props = {
    setSelectedChatId: (id: number) => void;
    currentUser: { id: number; displayName: string; username: string; avatar: string | null } | null;
    setChats: (chat:any)=>void,
    chats:Chat[]
};

export function ChatList({ setSelectedChatId, currentUser, setChats, chats}: Props) {

    const [errors, setErrors] = useState({ chatErrors: [], searchErrors: [] });
    const [isLoading, setIsLoading] = useState({ chatLoading: false, searchLoading: false });
    const [searchValue, setSearchValue] = useState("");
    const [users, setUsers] = useState<User[] | null>(null);

    useEffect(() => {
        async function getUserChats(showLoading: boolean) {
            if (showLoading) setIsLoading(prev => ({ ...prev, chatLoading: true }));
            const response = await Client("/chat/user", "GET");
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

    function handleSearch(e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) {
        e.preventDefault();
        setSearchValue(e.target.value);
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
            <h2>Chat list</h2>
            <form>
                <input
                    type="text"
                    name="searchText"
                    value={searchValue}
                    onChange={handleSearch}
                />
                {searchValue !== "" && (
                    <button
                        type="button"
                        onClick={() => {
                            setSearchValue("");
                            setUsers(null);
                            setErrors(prev => ({ ...prev, searchErrors: [] }));
                        }}
                    >
                        X
                    </button>
                )}
            </form>

            {isLoading.chatLoading && <h3>Loading...</h3>}
            {isLoading.searchLoading && searchValue !== "" && <h3>Loading...</h3>}

            {errors.chatErrors.length > 0 && (
                <ul>
                    {errors.chatErrors.map((e, i) => (
                        <li key={i}>{e}</li>
                    ))}
                </ul>
            )}

            {chats.length > 0 && searchValue === "" && (
                <ul>
                    {chats.map((chat: any) => (
                        <li key={chat.id} onClick={(e) => handleClick(e, chat.id)}>
                            {getChatName(chat, currentUser)}
                        </li>
                    ))}
                </ul>
            )}

            {!isLoading.chatLoading && chats.length === 0 && searchValue === "" && (
                <div>
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

            {!isLoading.searchLoading && searchValue !== "" && (
                <ul>
                    {users && users.length === 0 && <li>User with this username not found</li>}
                    {users && users.map((user: any) => (
                        <li key={user.id} onClick={(e) => handleCreateChat(e, user.id)}>
                            {user.username}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}