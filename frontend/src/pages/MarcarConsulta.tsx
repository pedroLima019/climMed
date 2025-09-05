import { useState, useEffect } from "react";
import DoctorCard from "../components/DoctorCard";
import Menu from "../components/Menu";
import SearchBar from "../components/SearchBar";
import "../styles/MarcarConsulta.css";

interface Doctor {
  id: number;
  name: string;
  consultationDuration?: number;
  specialties?: { name: string }[];
  role: "DOCTOR" | "PATIENT";
}

const MarcarConsulta = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/users/doctors")
      .then((res) => res.json())
      .then((data: Doctor[]) => setDoctors(data))
      .catch((err) => console.error("Erro ao buscar médicos:", err));
  }, []);

  return (
    <section className="consults-container">
      <Menu />
      <SearchBar />
      <section className="DoctorCard-section">
        {doctors.length > 0 ? (
          doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              name={doctor.name}
              speciality={
                doctor.specialties
                  ? doctor.specialties.map((s) => s.name).join(", ")
                  : "Sem especialidade"
              }
            />
          ))
        ) : (
          <p>Nenhum médico encontrado.</p>
        )}
      </section>
    </section>
  );
};

export default MarcarConsulta;
