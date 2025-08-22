import "../styles/global.css";
import "../styles/welcome.css";

export function Welcome() {
  return (
    <main>
      <div className="welcome-container">
        <div className="logo-content">
          <img src="/logo.png" alt="logo climmed" />
          <h1 className="title">Bem vindo ao ClimMed</h1>
        </div>
        <div className="typeUser_container">
          <p>Você se indentifica como ?</p>
          <form className="form-container">
            <div className="user">
              <input type="radio" id="medico" name="tipoUsuario" />
              <label htmlFor="medico">Médico</label>
            </div>
            <div className="user">
              <input type="radio" id="paciente" name="tipoUsuario" />
              <label htmlFor="paciente">Paciente</label>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Welcome;
