import {useState} from "react";
import * as React from "react";
import Client from "../api/client.ts";
import {Link, useNavigate} from "react-router-dom";
import "./registration.css"
import "../components/ui/CustomScroll.css";

function RegisterPage(){

    const navigate = useNavigate();

    const [inputValue, setInputValue] = useState({
        displayName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    })

    const [avatar, setAvatar] = useState<File | null>(null);


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
        const formData = new FormData();
        formData.append("displayName", inputValue.displayName);
        formData.append("username", inputValue.username);
        formData.append("email", inputValue.email);
        formData.append("password", inputValue.password);
        formData.append("confirmPassword", inputValue.confirmPassword);

        if (avatar) {
            formData.append("avatar", avatar);
        }
        const response = await Client("/auth/register", "POST", formData);
        if(response.errors){
            setErrors(response.errors);
        } else {
            setErrors([]);
            window.localStorage.setItem("token", `${response.token}`);
            navigate("/verify-email");
        }
    }

    return(
        <div className="register-form-box custom-scroll">
            <h2>Register</h2>
            <form className="register-form" onSubmit={handleSubmit} encType="multipart/form-data">
                <label htmlFor="login">Display name:</label>
                <input id="displayName"
                       name="displayName"
                       type="text"
                       value={inputValue.displayName}
                       onChange={handleChange}
                />
                <label htmlFor="username">Username:</label>
                <input id="username"
                       name="username"
                       type="text"
                       value={inputValue.username}
                       onChange={handleChange}
                />
                <label htmlFor="email">Email:</label>
                <input id="email"
                       name="email"
                       type="email"
                       value={inputValue.email}
                       onChange={handleChange}
                />
                <label htmlFor="password">Password:</label>
                <input id="password"
                       value={inputValue.password}
                       name="password"
                       type="password"
                       onChange={handleChange}/>
                <label htmlFor="confirmPassword">Confirm password:</label>
                <input id="confirmPassword"
                       type="password"
                       value={inputValue.confirmPassword}
                       name="confirmPassword"
                       onChange={handleChange}/>
                <label htmlFor="avatar">Avatar:</label>
                <label className="file-label" htmlFor="avatar">
                    {avatar ? avatar.name : "Choose image"}
                </label>
                <input id="avatar"
                       className="file-input-hidden"
                       type="file"
                       name="avatar"
                       onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                           if(e.target.files && e.target.files[0]){
                            setAvatar(e.target.files[0]);
                           }
                       }}/>
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
            <h4>Already have account <Link className="register-link" to="/login">Login</Link></h4>
        </div>
    )
}

export default RegisterPage;