import {useEffect, useState} from "react";
import type {Chat} from "../types/Chat.ts";
import type {Message} from "../types/Message.ts";
import Client from "../api/client.ts";
import type {User} from "../types/User.ts";

type Props = {
    currentUser: User | null,
    selectedChatId: number | null,
}
export function useChat({selectedChatId, currentUser}:Props){
    const [isInitialLoad, setIsInitialLoad] = useState<boolean|null>(null);
    const [isLoading, setIsLoading] = useState({chat: false, messages:false});
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isAdmin, setIsAdmin] = useState<boolean| null>(null);
    const [errors, setErrors] = useState<{
        chat: string[],
        messages: string[],
        sendMessage: string[]
    }>({chat: [], messages: [], sendMessage:[]});

    async function loadChat(signal?: AbortSignal){
        if (selectedChatId === null) return;
        try {
            const chat = await Client(`/chat/${selectedChatId}`, "GET", undefined, signal);
            if (chat.errors) setErrors((prev) => ({...prev, chat: chat.errors}));
            if (chat.chat && currentUser) {
                const userFromChat = chat.chat.chatUsers.find((u:any)=>u.userId === currentUser.id);
                setIsAdmin((userFromChat && userFromChat.role=== "ADMIN"));
                setChat(chat.chat);
            }
        } catch(e:any) {
            if (signal?.aborted) return;
            setErrors((prev)=>({...prev, chat:["Network error or request failed"]}))
        }
        finally {
            setIsLoading((prev) => ({...prev, chat: false}));
        }
    }

    async function loadMessages(signal?: AbortSignal) {
        if (selectedChatId === null) return;
        try {
            const msg = await Client(`/message/chat/${selectedChatId}`, "GET", undefined, signal);
            if (msg.errors) setErrors((prev) => ({...prev, messages: msg.errors}));
            if (msg.messages)  setMessages((prev:any) => {
                const normalized:any = msg.messages.sort((a:any, b:any) => a.id - b.id);
                const merged = [...prev, ...normalized];
                const unique = merged.filter(
                    (m, index, arr) =>
                        arr.findIndex(x => x.id === m.id) === index
                );

                return unique;
            });
        } catch(e:any) {
            if (signal?.aborted) return;
            setErrors((prev)=>({...prev, messages:["Network error or request failed"]}))
        } finally {
            setIsLoading((prev) => ({...prev, messages: false}));
        }
    }


    useEffect(() => {
        if (selectedChatId === null) return;
        setIsLoading({chat: true, messages: true});
        setIsInitialLoad(true);
        setChat(null);
        setMessages([]);
        setErrors({chat: [], messages: [], sendMessage:[]});

        const controller = new AbortController();

        loadChat(controller.signal);
        loadMessages(controller.signal);

        return () => controller.abort();
    }, [selectedChatId]);



    useEffect(()=>{
        if (selectedChatId === null) return;
        const intervalId = setInterval( async () => {
            loadMessages();
            loadChat();
        }, 3000);

        return () => {
            clearInterval(intervalId);
        };
    }, [selectedChatId])


    return {
        isInitialLoad,
        setIsInitialLoad,
        isLoading,
        setIsLoading,
        chat,
        setChat,
        messages,
        setMessages,
        isAdmin,
        setIsAdmin,
        errors,
        setErrors
    }
}