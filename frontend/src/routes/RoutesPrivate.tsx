import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

interface RoutesPrivateProps {
  role?: string;
}

const RoutesPrivate = ({ role }: RoutesPrivateProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasRole, setHasRole] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    if (token) {
      setIsAuthenticated(true);

      if (role) {
        setHasRole(userRole?.toLowerCase() === role.toLowerCase());
      } else {
        setHasRole(true);
      }
    }

    setIsLoading(false);
  }, [role]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && !hasRole) {
    return <Navigate to="/sem-acesso" replace />;
  }

  return <Outlet />;
};

export default RoutesPrivate;
