import {useEffect, useState} from "react";
import * as React from "react";
import Client from "../api/client.ts";
import {useLocation, useNavigate,} from "react-router-dom";

function VerifyEmail(){

    const location = useLocation();

    const navigate = useNavigate();
    const [valueInput, setValueInput] = useState("");

    const [errors, setErrors] = useState<string[]>([]);


    useEffect(() => {
        if (location.state?.error) {
            setErrors(location.state.error as string[]);
        }
    }, [location.state]);
    async function handleSubmit(e:React.SubmitEvent<HTMLFormElement>){
        e.preventDefault();
        const response = await Client("/auth/email", "POST", JSON.stringify({code: valueInput}));
        if(response.messages){
            let messages;
            if(typeof response.messages === "string"){
                messages = [response.messages];
            } else {
                messages = response.messages.map((m: {message: string})=> m.message);
            }
            setErrors(messages);
        } else {
            setErrors([]);
            navigate("/");
        }
    }

    async function handleResendCode(e:React.MouseEvent<HTMLButtonElement>){
        e.preventDefault();
        const response = await Client("/auth/email/resend", "GET");
        if(response.messages){
            let messages;
            if(typeof response.messages === "string"){
                messages = [response.messages];
            } else {
                messages = response.messages.map((m: {message: string})=> m.message);
            }
            setErrors(messages);
        } else {
            setErrors([]);
            alert("Code send!")
        }
    }

    return(
        <>
            <h2>Validate Email</h2>
            {errors.length > 0 && (
                <ul>
                    {errors.map((error, index)=>(
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            )}
            <form onSubmit={handleSubmit}>
                <label htmlFor="code">Verify code:</label>
                <input type="text"
                       name="code"
                       value={valueInput}
                       id="code"
                       onChange={(e)=>setValueInput(e.target.value)}
                />
                <button type="submit">Submit</button>
            </form>
            <h3>If you lost your code or it expires you can <button type="button" onClick={(e)=>handleResendCode(e)}>Resend Code</button></h3>
        </>
    )
}

export default VerifyEmail;