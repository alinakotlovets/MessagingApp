import {useState} from "react";
import * as React from "react";
import Client from "../api/client.ts";
import {useNavigate} from "react-router-dom";

function LoginPage(){

    const navigate = useNavigate();

    const [inputValue, setInputValue] = useState({
        login: "",
        password: ""
    })


    function handleChange(e: React.ChangeEvent<HTMLInputElement>){
        const {name, value} = e.target;
        setInputValue(prev=>({
            ...prev,
            [name]:value
        }))
    }

    const [errors, setErrors] = useState<string[]>([]);
    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>){
        e.preventDefault();
        const body = JSON.stringify(inputValue);
        const response =  await Client("/auth/login", "POST", body);
        if(response.errors){
            setErrors(response.errors);
        } else {
            setErrors([]);
            window.localStorage.setItem("token", `${response.token}`);
            navigate("/");
        }
    }

    return(
        <>
        <form onSubmit={handleSubmit}>
            <label htmlFor="login">Login</label>
            <input id="login"
                   name="login"
                   value={inputValue.login}
                   placeholder="Write your username or email"
                   onChange={handleChange}
            />
            <label htmlFor="password">Password:</label>
            <input id="password"
                   value={inputValue.password}
                   name="password"
                   onChange={handleChange}/>
            <button type="submit">Submit</button>
            {errors.length>0 && (
                <ul>
                    {errors.map((error, index)=>(
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            )}
        </form>
        </>
    )
}

export default LoginPage;