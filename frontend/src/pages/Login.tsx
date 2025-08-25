import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import Form from "../components/Form";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalMessage, setModalMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const loginUser = { email, password };
    const API_URL = "http://localhost:3000/users/login";

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginUser),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Erro ao fazer login";
        setModalType("error");
        setModalMessage(errorMessage);
        setModalOpen(true);
        return;
      }

      const data = await response.json();
      console.log("Login realizado com sucesso:", data);

      localStorage.setItem("authtoken", data.token);
      localStorage.setItem("role", data.role);

      setModalType("success");
      setModalMessage("Login realizado com sucesso!");
      setModalOpen(true);

      setEmail("");
      setPassword("");

      setTimeout(() => {
        if (data.role === "MEDICO") {
          navigate("/dashboard/medico");
        } else {
          navigate("/dashboard/paciente");
        }
      }, 1000);
    } catch (error) {
      console.error("Erro ao logar:", error);
      setModalType("error");
      setModalMessage("Erro ao fazer login.");
      setModalOpen(true);
    }
  };

  return (
    <main className="login-container">
      <div className="login-header">
        <img src="/logo.png" alt="Logo climmed" />
        <h2>Faça seu login</h2>
      </div>
      <form onSubmit={handleSubmit} className="Login-form">
        <Form
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Form
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Entrar</button>
      </form>

      <Modal isOpen={modalOpen} type={modalType} message={modalMessage} />
    </main>
  );
};

export default Login;
