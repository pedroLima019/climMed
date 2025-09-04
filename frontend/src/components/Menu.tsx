import "../styles/Menu.css";
import { useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { RiLogoutBoxLine } from "react-icons/ri";
import { FaUserCircle } from "react-icons/fa";
import { useUser } from "../contexts/UserContext";
import { useNavigate, Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const Menu: React.FC = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isPatient = user.role.toLowerCase() === "patient";

  return (
    <nav className="navContainer">
      <div className="nav-header">
        <div className="avatarContainer">
          <FaUserCircle className="avatarIcon" />
          <div className="avatarLegend">
            <h4>{user.name}</h4>
            <p>{user.role}</p>
          </div>
        </div>
        <button className="menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <div className={`menu-content ${isMenuOpen ? "open" : ""}`}>
        <ul className="navLinks">
          {isPatient ? (
            <>
              <li>
                <Link
                  className="link"
                  to="/marcar-consulta"
                  onClick={toggleMenu}
                >
                  Marcar Consulta
                </Link>
              </li>
              <li>
                <Link
                  className="link"
                  to="/minhas-consultas"
                  onClick={toggleMenu}
                >
                  Minhas Consultas
                </Link>
              </li>
              <li>
                <Link className="link" to="/historico" onClick={toggleMenu}>
                  Histórico de Consultas
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link className="link" to="/agenda" onClick={toggleMenu}>
                  Agenda de Consultas
                </Link>
              </li>
              <li>
                <Link
                  className="link"
                  to="/historico-medico"
                  onClick={toggleMenu}
                >
                  Histórico de Consultas
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className="configContainer">
          <IoSettingsSharp className="settings" />
          <RiLogoutBoxLine className="logout" onClick={handleLogout} />
        </div>
      </div>
    </nav>
  );
};

export default Menu;
