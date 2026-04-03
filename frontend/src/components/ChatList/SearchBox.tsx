import menuIcon from "../../assets/menu-icon.png";
import * as React from "react";
import type {User} from "../../types/User.ts";
import "./SearchBox.css";

type SearchBoxProps = {
    setIsUserMenu: (value: boolean)=>void;
    searchValue: string;
    setSearchValue: (value:string)=>void;
    setUsers: (value: User[] | null) => void;
    setErrors: React.Dispatch<React.SetStateAction<{ chatErrors: string[]; searchErrors: string[] }>>;
}
export function SearchBox({setIsUserMenu,
                              searchValue,
                              setSearchValue,
                              setUsers,
                              setErrors}:SearchBoxProps){

    function handleSearch(e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) {
        e.preventDefault();
        setSearchValue(e.target.value);
    }

    return(
        <form className="chat-list-search-form">
            <button type="button" className="user-menu-btn" onClick={()=>setIsUserMenu(true)}>
                    <img src={menuIcon} alt="menu icon image" width="20"/>
            </button>
            <input
                className="chat-list-search-input"
                type="text"
                placeholder="Search"
                name="searchText"
                value={searchValue}
                onChange={handleSearch}
            />
            {searchValue !== "" && (
                <button
                    className="close-search-btn"
                    type="button"
                    onClick={() => {
                        setSearchValue("");
                        setUsers(null);
                        setErrors((prev) => ({ ...prev, searchErrors: [] }));
                    }}
                >X</button>
            )}
        </form>
    )
}