import Modal from "../components/Modal";
import Form from "../components/Form";
import "../styles/Login.css";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useState, useEffect } from "react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { user, setUser } = useUser();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    if (user) {
      navigate(`/dashboard/${user.role.toLowerCase()}`);
    }
  }, [user, navigate]);

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

      setModalType("success");
      setModalMessage("Login realizado com sucesso!");
      setModalOpen(true);

      const { token, role, name } = data;

      setUser({ name, role });

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("name", name);

      setTimeout(() => {
        setModalOpen(false);
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
