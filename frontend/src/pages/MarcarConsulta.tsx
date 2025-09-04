import DoctorCard from "../components/DoctorCard";
import Menu from "../components/Menu";
import SearchBar from "../components/SearchBar";
import "../styles/MarcarConsulta.css";

const MarcarConsulta = () => {
  return (
    <section className="consults-container">
      <Menu />
      <SearchBar />
      <section className="DoctorCard-section">
        <DoctorCard name={"Paulo Lopes"} speciality={"Ortopedista"} />
      </section>
    </section>
  );
};

export default MarcarConsulta;
