import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../components/Modal";
import Form from "../components/Form";
import "../styles/Register.css";
import "../styles/global.css";

const RegisterUser = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialties, setSpecialties] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalMessage, setModalMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedRole = role ? role.toLowerCase() : "";

    const newUser = {
      name,
      email,
      password,
      role: role,
      specialties: normalizedRole === "medico" ? specialties : undefined,
    };

    try {
      const response = await fetch("http://localhost:3000/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setModalType("error");
        setModalMessage(errorData.message || "Erro ao cadastrar");
        setModalOpen(true);
        return;
      }

      setModalType("success");
      setModalMessage("Cadastro realizado com sucesso!");
      setModalOpen(true);

      setName("");
      setEmail("");
      setPassword("");
      setSpecialties("");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Erro ao cadastrar:", err);
      setModalType("error");
      setModalMessage("Erro no servidor, tente novamente.");
      setModalOpen(true);
    }
  };

  return (
    <main className="Register-container">
      <div className="title-container">
        <img src="/logo.png" alt="logo climmed" />
        <h2>Cadastro {role === "medico" ? "Médico" : "Paciente"}</h2>
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

        {role === "medico" && (
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
