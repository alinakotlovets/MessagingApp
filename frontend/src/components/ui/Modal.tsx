import * as React from "react";
import "./Modal.css";
import "../ui/CustomScroll.css"

type Props = {
    children: React.ReactNode;
    onClose: () => void;
    closeOnOverlayClick?: boolean
};

export function Modal({ children, onClose, closeOnOverlayClick}: Props) {
    return (
        <div className="modal-overlay" onClick={()=>{if (closeOnOverlayClick) onClose();}}>
            <div
                className="modal-content custom-scroll"
                onClick={(e) => e.stopPropagation()}
            >
                <button className="close-btn" onClick={onClose}>X</button>
                {children}
            </div>
        </div>
    );
}