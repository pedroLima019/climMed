import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import Form from "../components/Form";
import "../styles/Register.css";
import "../styles/global.css";

interface RegisterProps {
  role: "MEDICO" | "PACIENTE";
}

const RegisterUser = ({ role }: RegisterProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialties, setSpecialties] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalMessage, setModalMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    let timer: number;

    if (modalOpen) {
      timer = setTimeout(() => {
        setModalOpen(false);
      }, 3000);
    }

    return () => clearTimeout(timer);
  }, [modalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newUser = {
      name,
      email,
      password,
      role,
      specialties: role === "MEDICO" ? specialties : undefined,
    };

    const API_URL = "http://localhost:3000/users/register";

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Erro ao registrar usuário";
        setModalType("error");
        setModalMessage(errorMessage);
        setModalOpen(true);
        return;
      }

      const data = await response.json();
      console.log("Usuário registrado com sucesso:", data);

      setModalType("success");
      setModalMessage("Registro realizado com sucesso!");
      setModalOpen(true);

      setName("");
      setEmail("");
      setPassword("");
      setSpecialties("");

      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error("Erro ao registrar:", error);

      setModalType("error");
      setModalMessage("Erro ao registrar usuário.");
      setModalOpen(true);
    }
  };

  return (
    <main className="Register-container">
      <div className="title-container">
        <img src="/logo.png" alt="logo climmed" />
        <h2>Cadastro {role === "MEDICO" ? "Médico" : "Paciente"}</h2>
      </div>

      <form className="Register-form" onSubmit={handleSubmit}>
        <Form
          label="Nome"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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

        {role === "MEDICO" && (
          <Form
            label="Especialidade"
            type="text"
            value={specialties}
            onChange={(e) => setSpecialties(e.target.value)}
          />
        )}

        <button type="submit">Cadastrar</button>
      </form>

      <Modal isOpen={modalOpen} type={modalType} message={modalMessage} />
    </main>
  );
};

export default RegisterUser;
