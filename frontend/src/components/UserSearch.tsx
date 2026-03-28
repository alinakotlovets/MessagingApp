import {useEffect, useState} from "react";
import Client from "../api/client.ts";
type UserSearchProps = {
    onSelect: (user: any) => void;
};
import type {User} from "../types/User.ts";

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
        <div>
            <form>
                <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />
                {searchValue && <button type="button" onClick={() => {
                    setSearchValue("");
                    setUsers([]);
                    setErrors([]);
                }}>X</button>}
            </form>

            {errors.length > 0 && (
                <ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
            )}

            {!isLoading && users.length > 0 && (
                <ul>
                    {users.map(u => (
                        <li key={u.id} onClick={() => onSelect(u)}>
                            {u.username}
                        </li>
                    ))}
                </ul>
            )}

            {!isLoading && searchValue && users.length === 0 && (
                <p>User not found</p>
            )}

            {isLoading && <p>Loading...</p>}
        </div>
    );
}