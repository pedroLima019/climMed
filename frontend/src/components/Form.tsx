import React from "react";
import "../styles/Form.css";

type InputProps = {
  label: string,
  type?: string,
  value: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
};

const Form: React.FC<InputProps> = ({
  label,
  type = "text",
  value,
  onChange,
}) => {
  return (
    <div className="form-container">
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder="Digite seu nome "
      />
    </div>
  );
};

export default Form;
