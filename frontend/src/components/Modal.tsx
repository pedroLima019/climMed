import "../styles/Modal.css";
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "sucess" | "error";
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = "sucess",
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal ${type}`}>
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
};

export default Modal;
