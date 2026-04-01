import {AddPhotoForm} from "./AddPhotoForm.tsx";
import type {Chat} from "../../types/Chat.ts";
import type {Message} from "../../types/Message.ts";
import * as React from "react";
import "../ui/Modal.css"

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
    return(
        <div>
            {isAddImage && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button onClick={() => setIsAddImage(false)}>Close</button>
                        <AddPhotoForm chat={chat} messages={messageState.messages} setMessages={messageState.setMessages} setIsAddImage={setIsAddImage}/>
                    </div>
                </div>
            )}

            {!isLoading.messages && selectedChatId !== null && (
                <>
                    {messageState.editingMessageId &&(
                        <button onClick={handlers.handleCloseEditMessage}>X</button>
                    )}
                    <form onClick={(e)=>e.stopPropagation()} onSubmit={handlers.handleSubmit}>
                        <button type="button" onClick={(e)=>handlers.handleAddImage(e)}>Add image</button>
                        <input type="text"
                               name="text"
                               value={inputValue}
                               onChange={(e)=>{setInputValue(e.target.value)}}/>
                        <button type="submit">Send</button>
                        {errors.sendMessage.length >0 &&(
                            <ul>
                                {errors.sendMessage.map((e,index)=>(
                                    <li key={index}>{e}</li>
                                ))}
                            </ul>
                        )}
                    </form>
                </>
            )}
        </div>
    )
}