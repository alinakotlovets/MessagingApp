import {useState} from "react";
import * as React from "react";
import Client from "../api/client.ts";
import {Link, useNavigate} from "react-router-dom";
import "./registration.css"

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
        <div className="register-form-box">
            <h2>Login</h2>
        <form className="register-form" onSubmit={handleSubmit}>
            <label htmlFor="login">Login:</label>
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
                   type="password"
                   onChange={handleChange}/>
            <div className="submit-btn-box">
                <button className="submit-btn" type="submit">Submit</button>
            </div>
            {errors.length>0 && (
                <ul>
                    {errors.map((error, index)=>(
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            )}
        </form>
            <h4>Dont have account yet, <Link className="register-link" to="/register">Register</Link></h4>
        </div>
    )
}

export default LoginPage;