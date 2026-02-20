import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// --- COMPONENTES DE INTERFAZ ---
import Navbar from './components/Navbar';

// --- PÁGINAS ---
import Home from './pages/Home';
import CatalogoEdificios from './pages/CatalogoEdificios';
import VistaApartamentos from './pages/VistaApartamentos';
import DetalleApartamento from './pages/DetalleApartamento';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import DashboardResidente from './pages/DashboardResidentes'; 
import DashboardAdmin from './pages/DashboardAdmin';

/* ====================================================
    COMPONENTES AUXILIARES (Wrappers de Lógica)
   ==================================================== */

// Controla qué ve el usuario al entrar a la raíz "/"
const RootHandler = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cargando Sistema...</p>
        </div>
      </div>
    );
  }

  // Si hay sesión, lo mandamos a su panel correspondiente
  if (user) {
    return <Navigate to={user.rol === 'admin' ? '/admin' : '/panel'} replace />;
  }

  // Si no hay sesión, mostramos la Landing Page (Home)
  return <Home />;
};

// El Navbar solo se muestra si el usuario NO ha iniciado sesión (Vista Pública)
const NavbarWrapper = () => {
  const { user, loading } = useAuth();
  if (loading || user) return null; 
  return <Navbar />;
};

/* ====================================================
    ESTRUCTURA PRINCIPAL DE LA APLICACIÓN
   ==================================================== */

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* El Navbar aparecerá en Home, Catalogo, VistaApartamentos y DetalleApartamento */}
        <NavbarWrapper />
        
        <Routes>
          {/* 1. Lógica de Inicio (Redirección automática) */}
          <Route path="/" element={<RootHandler />} />

          {/* 2. Rutas Públicas de Inmuebles */}
          
          {/* Muestra todos los edificios disponibles */}
          <Route path="/catalogo" element={<CatalogoEdificios />} />
          
          {/* Muestra la lista de apartamentos de UN edificio específico */}
          <Route path="/edificio/:edificioId" element={<VistaApartamentos />} />
          
          {/* Muestra la información técnica de UN solo apartamento */}
          {/* ✅ IMPORTANTE: Se unificó a "/apartamento/:id" para coincidir con DetallesEdificio */}
          <Route path="/apartamento/:id" element={<DetalleApartamento />} />
          
          {/* 3. Autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* 4. Rutas Privadas Protegidas (Requieren Login y Rol) */}
          
          {/* Panel de Residentes (Solo consulta de pagos, anuncios, etc.) */}
          <Route
            path="/panel"
            element={
              <ProtectedRoute allowedRoles={['residente']}>
                <DashboardResidente />
              </ProtectedRoute>
            }
          />

          {/* Panel de Administración (Gestión de edificios e inmuebles) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardAdmin />
              </ProtectedRoute>
            }
          />

          {/* 5. Manejo de Rutas no encontradas */}
          {/* Cualquier URL incorrecta redirige al RootHandler */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;