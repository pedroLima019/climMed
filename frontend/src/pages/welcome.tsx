import "../styles/global.css";
import "../styles/welcome.css";
import { useNavigate } from "react-router-dom";

export function Welcome() {
  const navigation = useNavigate();

  const handleSelectRole = (role: "MEDICO" | "PACIENTE") => {
    if (role === "MEDICO") {
      navigation("/register/medico");
    } else {
      navigation("/register/paciente");
    }
  };

  return (
    <main>
      <div className="welcome-container">
        <div className="logo-content">
          <img src="/logo.png" alt="logo climmed" />
          <h1 className="title">Bem vindo ao ClimMed</h1>
        </div>
        <div className="typeUser_container">
          <p>Você se indentifica como ?</p>
          <div className="form-container">
            <div className="user">
              <input
                type="radio"
                id="medico"
                name="tipoUsuario"
                onChange={() => handleSelectRole("MEDICO")}
              />
              <label htmlFor="medico">Médico</label>
            </div>
            <div className="user">
              <input
                type="radio"
                id="paciente"
                name="tipoUsuario"
                onChange={() => handleSelectRole("PACIENTE")}
              />
              <label htmlFor="paciente">Paciente</label>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Welcome;
