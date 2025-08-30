import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/welcome";

import RegisterUser from "./pages/RegisterUser";
import Login from "./pages/Login";
import RoutesPrivate from "./routes/RoutesPrivate";
import DashboardPaciente from "./pages/DashboardPaciente";
import DashboardMedico from "./pages/DashboardMedico";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/register/:role" element={<RegisterUser />} />
        <Route path="/login" element={<Login />} />

        <Route element={<RoutesPrivate role="patient" />}>
          <Route path="/dashboard/patient" element={<DashboardPaciente />} />
        </Route>
        <Route element={<RoutesPrivate role="doctor" />}>
          <Route path="/dashboard/doctor" element={<DashboardMedico />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
