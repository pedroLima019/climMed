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

    // 1. Verificação de autenticação: o usuário tem um token?
    if (token) {
      setIsAuthenticated(true);

      // 2. Verificação de role: a rota precisa de um role específico?
      if (role) {
        // Se a rota exige um role, verifique se o role do usuário corresponde
        setHasRole(userRole?.toLowerCase() === role.toLowerCase());
      } else {
        // Se a rota não exige um role específico, o acesso é permitido
        setHasRole(true);
      }
    }

    // Sinaliza que a verificação de autenticação terminou
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
