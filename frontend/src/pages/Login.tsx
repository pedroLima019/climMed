import { useState } from "react";
import "../styles/Login.css";
import "../styles/global.css";

interface LoginProps {
  role: "MEDICO" | "PACIENTE";
}

export function Login({ role }: LoginProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password, role });
  };

  return (
    <main className="login-container">
      <div className="title-container">
        <img src="/logo.png" alt="logo climmed" />
        <h2>Login {role === "MEDICO" ? "Médico" : "Paciente"}</h2>
      </div>
      <form className="login-form" onSubmit={handleSubmit}>
        <label>Nome</label>
        <input
          type="email"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite seu nome"
          required
        ></input>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Digite seu e-mail"
          required
        />

        <label> Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Digite sua senha"
          required
        />

        <a href="http://" target="_blank" rel="/">
          Esqueceu a senha ?
        </a>

        <button type="submit">Entrar</button>
      </form>
    </main>
  );
}

export default Login;
