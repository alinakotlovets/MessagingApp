import {useEffect, useState} from "react";
import * as React from "react";
import Client from "../api/client.ts";
import {useLocation, useNavigate,} from "react-router-dom";
import "./registration.css"

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
        if(response.errors){
            setErrors(response.errors);
        } else {
            setErrors([]);
            navigate("/");
        }
    }

    async function handleResendCode(e:React.MouseEvent<HTMLButtonElement>){
        e.preventDefault();
        const response = await Client("/auth/email/resend", "GET");
        if(response.errors){
            setErrors(response.errors);
        } else {
            setErrors([]);
            alert("Code send!")
        }
    }

    return(
        <div className="register-form-box">
            <h2>Validate Email</h2>
            {errors.length > 0 && (
                <ul>
                    {errors.map((error, index)=>(
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            )}
            <form className="register-form" onSubmit={handleSubmit}>
                <label htmlFor="code">Verify code:</label>
                <input type="text"
                       name="code"
                       value={valueInput}
                       id="code"
                       onChange={(e)=>setValueInput(e.target.value)}
                />
                <div className="submit-btn-box">
                    <button className="submit-btn" type="submit">Submit</button>
                </div>
            </form>
            <h3>If you lost your code or it expires you can
                <button className="resend-code-btn" type="button" onClick={(e)=>handleResendCode(e)}>Resend Code</button>
            </h3>
        </div>
    )
}

export default VerifyEmail;