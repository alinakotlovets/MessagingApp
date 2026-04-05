import {useEffect, useState} from "react";
import Client from "../../api/client.ts";
type UserSearchProps = {
    onSelect: (user: any) => void;
};
import type {User} from "../../types/User.ts";
import defaultAvatar from "../../assets/defaultAvatar.png";

export function UserSearch({onSelect}:UserSearchProps) {
    const [searchValue, setSearchValue] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        if (searchValue.trim() === "") {
            setUsers([]);
            return;
        }
        setIsLoading(true);
        const timeoutId = setTimeout(async () => {
            try {
                const result = await Client(`/user/search?username=${searchValue}`, "GET");
                if (result.users) setUsers(result.users);
                if (result.errors) setErrors(result.errors);
            } finally {
                setIsLoading(false);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchValue]);

    return (
        <div className="search-box">
            <form className="search-form">
                <input
                    type="text"
                    className="chat-list-search-input"
                    placeholder="Search"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />
                {searchValue && <button className="close-search-btn" type="button" onClick={() => {
                    setSearchValue("");
                    setErrors([]);
                }}>X</button>}
            </form>

            {errors.length > 0 && (
                <ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
            )}

            {!isLoading && users.length > 0 && (
                <ul>
                    {users.map(u => (
                        <li className="private-user-info-box" key={u.id} onClick={() => onSelect(u)}>
                            <img className="user-avatar" src={u.avatar || defaultAvatar} alt={u.username + " avatar"}/>
                            <div className="user-text-box">
                                <h3 className="font-18px">{u.displayName}</h3>
                                <h4 className="text-grey font-16px">@{u.username}</h4>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {!isLoading && searchValue && users.length === 0 && (
                <div className="flex-center"><p>User not found</p></div>
            )}

            {isLoading && (<div className="flex-center"><p>Loading...</p></div>)}
        </div>
    );
}