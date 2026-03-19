import {useState} from "react";
import * as React from "react";
import Client from "../api/client.ts";
import {useNavigate} from "react-router-dom";

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
        if(response.messages){
            let messages;
            if(typeof response.messages === "string"){
                messages = [response.messages];
            } else{
                messages = response.messages.map(( m:{message: string})=> m.message);
            }
            setErrors(messages);
        } else {
            setErrors([]);
            window.localStorage.setItem("token", `${response.token}`);
            navigate("/verify");
        }
    }

    return(
        <>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <label htmlFor="login">Display name</label>
                <input id="displayName"
                       name="displayName"
                       type="text"
                       value={inputValue.displayName}
                       onChange={handleChange}
                />
                <label htmlFor="username">Username</label>
                <input id="username"
                       name="username"
                       type="text"
                       value={inputValue.username}
                       onChange={handleChange}
                />
                <label htmlFor="email">Email</label>
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
                <input id="avatar"
                       type="file"
                       name="avatar"
                       onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                           if(e.target.files && e.target.files[0]){
                            setAvatar(e.target.files[0]);
                           }
                       }}/>
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

export default RegisterPage;