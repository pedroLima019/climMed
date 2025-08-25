import "./styles/global.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/welcome";
import RegisterUser from "./pages/RegisterUser";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/register/medico"
          element={<RegisterUser role="MEDICO" />}
        />
        <Route
          path="/register/paciente"
          element={<RegisterUser role="PACIENTE" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
