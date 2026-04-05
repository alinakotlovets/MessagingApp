import {AddPhotoForm} from "./AddPhotoForm.tsx";
import type {Chat} from "../../types/Chat.ts";
import type {Message} from "../../types/Message.ts";
import * as React from "react";
import {useRef, useEffect} from "react";
import "../ui/Modal.css"
import Image from "../../assets/image.png"
import './MessageForm.css';
import "../ui/CustomScroll.css"
import Send from "../../assets/send.png";
import {Modal} from "../ui/Modal.tsx";

type MessageFormProps = {
    chat: Chat | null;
    isAddImage: boolean;
    setIsAddImage: (value:boolean)=>void;
    selectedChatId: number | null;
    isLoading: { chat:boolean; messages:boolean };
    inputValue: string;
    setInputValue: (value:string)=>void;
    errors: { sendMessage: string[] };
    messageState: { messages: Message[],
        setMessages: (messages:any[])=>void;
        editingMessageId: number | null;};
    handlers: { handleSubmit: (e:React.SubmitEvent<HTMLFormElement>)=>void;
        handleAddImage: (e:React.MouseEvent<HTMLButtonElement>)=>void;
        handleCloseEditMessage: ()=>void;}
};
export function MessageForm({ chat,
                                isAddImage,
                                setIsAddImage,
                                selectedChatId,
                                isLoading,
                                inputValue,
                                setInputValue,
                                errors,
                                messageState,
                                handlers}:MessageFormProps){

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = "auto";

        const maxHeight = 120;
        const scrollHeight = textarea.scrollHeight;

        if (scrollHeight <= maxHeight) {
            textarea.style.height = scrollHeight + "px";
            textarea.style.overflowY = "hidden";
        } else {
            textarea.style.height = maxHeight + "px";
            textarea.style.overflowY = "auto";
        }
    }, [inputValue]);

    return(
        <>
            {isAddImage && (
                <Modal
                    onClose={() => setIsAddImage(false)}
                    closeOnOverlayClick={true}
                >
                    <AddPhotoForm chat={chat} messages={messageState.messages} setMessages={messageState.setMessages} setIsAddImage={setIsAddImage}/>
                </Modal>
            )}

            {!isLoading.messages && selectedChatId !== null && (
                <div className="message-form-box">
                    {messageState.editingMessageId &&(
                        <button onClick={handlers.handleCloseEditMessage}>X</button>
                    )}
                    <form className="message-form" onClick={(e)=>e.stopPropagation()} onSubmit={handlers.handleSubmit}>
                        <button className="message-image-btn" type="button" onClick={(e)=>handlers.handleAddImage(e)}>
                            <img src={Image} alt="Add imagge button icon"/>
                        </button>
                        <div className="textarea-wrapper">
                        <textarea ref={textareaRef}
                                  className="custom-scroll"
                                  name="text"
                                  placeholder="Message"
                                  value={inputValue}
                                  onChange={(e)=>{setInputValue(e.target.value)}}
                                  onKeyDown={(e) => {
                                      if (e.key === "Enter" && !e.shiftKey) {
                                          e.preventDefault();
                                          e.currentTarget.form?.requestSubmit();
                                      }
                                  }}/>
                        </div>
                        <button className="send-message-btn" type="submit"><img src={Send} alt="Send message button icon"/></button>
                        {errors.sendMessage.length >0 &&(
                            <ul>
                                {errors.sendMessage.map((e,index)=>(
                                    <li key={index}>{e}</li>
                                ))}
                            </ul>
                        )}
                    </form>
                </div>
            )}
        </>
    )
}