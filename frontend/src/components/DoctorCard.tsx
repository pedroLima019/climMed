import { FaUserCircle } from "react-icons/fa";
import "../styles/DoctorCard.css";

interface CardDoctor {
  name: string;
  speciality: string;
}
const CardDoctor = (props: CardDoctor) => {
  return (
    <div className="card-container">
      <div className="infoCard">
        <FaUserCircle className="DoctorAvatar" />
        <h3>
          <strong>Nome: </strong>
          {props.name}
        </h3>
        <p>
          <strong>Especialidade: </strong> {props.speciality}
        </p>
        <button>Agendar Consulta</button>
      </div>
    </div>
  );
};

export default CardDoctor;
