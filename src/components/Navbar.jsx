import { useState, useEffect } from 'react';
import { Menu, X, Building2, User, LogOut, LayoutGrid, Home } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { auth } from '../api/firebaseConfig';
import { signOut } from 'firebase/auth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard =
    location.pathname.includes('/admin') ||
    location.pathname.includes('/panel');

  if (isDashboard) return null;

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    /* CAMBIO DEFINITIVO: 
       1. z-30 (Lo suficientemente bajo para que el modal z-50+ lo tape).
       2. isolation-auto para evitar conflictos de stacking context.
    */
    <nav className="fixed w-full z-30 top-0 backdrop-blur-md bg-white/80 border-b border-slate-200/60 shadow-sm isolation-auto">
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* ================= LOGO ================= */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-slate-900 rounded-2xl group-hover:bg-blue-600 transition-all duration-500 shadow-lg shadow-slate-200">
              <Building2 className="text-white w-5 h-5" />
            </div>
            <span className="font-black text-xl text-slate-900 tracking-tighter uppercase">
              Edificios<span className="text-blue-600">Col</span>
            </span>
          </Link>

          {/* ================= DESKTOP ================= */}
          <div className="hidden md:flex items-center gap-10">
            <Link
              to="/"
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] transition-all"
            >
              <Home size={16} className="text-blue-600" />
              Inicio
            </Link>

            {!user ? (
              <Link to="/login">
                <button className="bg-slate-900 hover:bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all duration-500 shadow-xl shadow-slate-900/10">
                  <User size={16} />
                  Acceso Privado
                </button>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to={user.role === 'admin' ? '/admin' : '/panel'}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100/80 text-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all border border-transparent hover:border-slate-200"
                >
                  <LayoutGrid size={16} className="text-blue-600" />
                  Mi Panel
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-3.5 rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white transition-all duration-500"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>

          {/* ================= MOBILE BUTTON ================= */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-3 rounded-2xl bg-slate-50 text-slate-900 transition-all"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      <div className={`
        md:hidden overflow-hidden transition-all duration-500 ease-in-out bg-white/95 backdrop-blur-lg
        ${isOpen ? 'max-h-screen border-t border-slate-100' : 'max-h-0'}
      `}>
        <div className="p-8 space-y-6">
          <Link to="/" onClick={() => setIsOpen(false)} className="block text-slate-900 font-black text-[11px] uppercase tracking-[0.3em]">
            Ver Propiedades
          </Link>

          {!user ? (
            <Link to="/login" onClick={() => setIsOpen(false)}>
              <button className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em]">
                Acceso Residentes
              </button>
            </Link>
          ) : (
            <div className="space-y-4 pt-4 border-t border-slate-50">
              <Link to={user.role === 'admin' ? '/admin' : '/panel'} onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-3 w-full bg-slate-50 text-slate-900 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em]">
                <LayoutGrid size={18} /> Ir al Panel
              </Link>
              <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full text-rose-500 font-black text-[11px] uppercase tracking-[0.3em] py-2">
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;