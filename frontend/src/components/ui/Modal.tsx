import * as React from "react";
import {useEffect} from "react";
import "./Modal.css";

type Props = {
    children: React.ReactNode;
    onClose: () => void;
    closeOnOverlayClick?: boolean
};

export function Modal({ children, onClose, closeOnOverlayClick}: Props) {

    useEffect(() => {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = "hidden";
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        return () => {
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
        };
    }, []);
    return (
        <div className="modal-overlay" onClick={()=>{if (closeOnOverlayClick) onClose();}}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                <button className="close-btn" onClick={onClose}>X</button>
                {children}
            </div>
        </div>
    );
}