import * as React from "react";
import "./Modal.css";

type Props = {
    children: React.ReactNode;
    onClose: () => void;
    closeOnOverlayClick?: boolean
};

export function Modal({ children, onClose, closeOnOverlayClick}: Props) {
    return (
        <div className="modal-overlay" onClick={()=>{if (closeOnOverlayClick) onClose();}}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose}>X</button>
                {children}
            </div>
        </div>
    );
}