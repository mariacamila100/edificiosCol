import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Mientras Firebase verifica la sesión, no mostramos nada para evitar saltos
  if (loading) return null;

  // REQUISITO: Si intenta entrar a una ruta protegida sin sesión -> Al Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el rol no coincide (ej: residente intentando entrar a /admin) -> Al Home
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
};