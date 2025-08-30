import Modal from "../components/Modal";
import Form from "../components/Form";
import "../styles/Login.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalMessage, setModalMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setModalType("error");
        setModalMessage(data.message || "Credenciais inválidas.");
        setModalOpen(true);
        return;
      }

      // login bem sucedido
      setModalType("success");
      setModalMessage("Login realizado com sucesso!");
      setModalOpen(true);

      const token = data.token;
      const role = data.role;

      // salvar token/role no localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      // direcionar para dashboard após 1,5s
      setTimeout(() => {
        setModalOpen(false);
        navigate(`/dashboard/${data.role.toLowerCase()}`);
      }, 1500);
    } catch (err) {
      console.error("Erro ao logar:", err);
      setModalType("error");
      setModalMessage("Erro no servidor, tente novamente.");
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
