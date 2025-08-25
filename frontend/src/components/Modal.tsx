import "../styles/Modal.css";
import React from "react";

interface ModalProps {
  isOpen: boolean;
  message: string;
  type?: "success" | "error";
}

const Modal: React.FC<ModalProps> = ({ isOpen, message, type = "sucess" }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal ${type}`}>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default Modal;
