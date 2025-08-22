import "./styles/global.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login/medico" element={<Login role="MEDICO" />} />
        <Route path="/login/paciente" element={<Login role="PACIENTE" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
