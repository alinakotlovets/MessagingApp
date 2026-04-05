import {useNavigate} from "react-router-dom";
import {useEffect, useState, type JSX} from "react";
import Client from "../api/client.ts";

export default function VerifiedRoute({ children }: { children: JSX.Element }){
    const navigate=useNavigate();

    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function checkStatus(){
            const token = localStorage.getItem("token");
            if(!token){
                navigate("/login");
                return;
            }
            try {
                const response = await Client("/auth/status", "GET");
                if(response.errors){
                    navigate("/verify-email", { state: { error: response.errors }});
                } else {
                    setLoading(false);
                }
            } catch (e: any){
                const messages = [`${e.message}` || "Something went wrong"];
                navigate("/login", { state: { error: messages }});
            }
        }
        checkStatus();
    }, [navigate]);

    if(loading) {
        return  (
            <div className="flex-center">
                <h3>Loading...</h3>
            </div>
        )
    }
    return children;
}