import { useState } from "react";
import "../styles/Register.css";
import "../styles/global.css";
import Modal from "../components/Modal";

interface RegisterProps {
  role: "MEDICO" | "PACIENTE";
}

export function RegisterUser({ role }: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialties, setSpecialties] = useState("");

  // controle do modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalMessage, setModalMessage] = useState("");

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
        throw new Error(errorData.message || "Erro ao registrar usuário.");
      }

      const data = await response.json();
      console.log("Usuário registrado com sucesso:", data);

      setModalType("success");
      setModalMessage("Registro realizado com sucesso!");
      setModalOpen(true);
    } catch (error) {
      console.error("Erro ao registrar:", error);

      setModalType("error");
      setModalMessage("Erro ao registrar usuário.");
      setModalOpen(true);
    }
  };

  return (
    <main className="login-container">
      <div className="title-container">
        <img src="/logo.png" alt="logo climmed" />
        <h2>Cadastro {role === "MEDICO" ? "Médico" : "Paciente"}</h2>
      </div>
      <form className="login-form" onSubmit={handleSubmit}>
        <label>Nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite seu nome"
          required
        />

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Digite seu e-mail"
          required
        />

        <label>Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Digite sua senha"
          required
        />

        {role === "MEDICO" && (
          <>
            <label>Especialidade</label>
            <input
              type="text"
              value={specialties}
              onChange={(e) => setSpecialties(e.target.value)}
              placeholder="Ex: Cardiologia, Dermatologia"
            />
          </>
        )}

        <button type="submit">Cadastrar</button>
      </form>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalType === "success" ? "Sucesso" : "Erro"}
        type={modalType}
        message={modalMessage}
      />
    </main>
  );
}

export default RegisterUser;
