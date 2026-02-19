import { useState } from 'react';
import {
  Menu, X, Building2, User,
  LogOut, LayoutGrid, Home
} from 'lucide-react';

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
    <nav className="fixed w-full z-50 top-0 backdrop-blur-2xl bg-white/70 border-b border-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* ================= LOGO ================= */}
          <Link to="/" className="flex items-center gap-3 group">

            <div className="p-2 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
              <Building2 className="text-white w-6 h-6" />
            </div>

            <span className="font-black text-2xl text-slate-900 tracking-tight">
              Edificios<span className="text-blue-600">Col</span>
            </span>

          </Link>

          {/* ================= DESKTOP ================= */}
          <div className="hidden md:flex items-center gap-8">

            <Link
              to="/"
              className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-semibold text-sm transition-all"
            >
              <Home size={18} />
              Venta / Renta
            </Link>

            {!user ? (

              <Link to="/login">
                <button
                  className="
                    bg-blue-600 hover:bg-blue-700
                    text-white px-7 py-3
                    rounded-2xl font-black text-xs
                    uppercase tracking-widest
                    flex items-center gap-2
                    transition-all
                    shadow-lg shadow-blue-600/30
                    hover:scale-[1.03]
                  "
                >
                  <User size={18} />
                  Acceso Residentes
                </button>
              </Link>

            ) : (

              <div className="flex items-center gap-4">

                {/* PANEL */}
                <Link
                  to={user.role === 'admin' ? '/admin' : '/panel'}
                  className="
                    flex items-center gap-2
                    px-6 py-3
                    rounded-2xl
                    bg-white/60 backdrop-blur-xl
                    border border-white/50
                    text-slate-800 font-semibold text-sm
                    hover:bg-white/80
                    transition-all
                    shadow-sm
                  "
                >
                  <LayoutGrid size={18} />
                  Panel
                </Link>

                {/* LOGOUT */}
                <button
                  onClick={handleLogout}
                  className="
                    p-3
                    rounded-2xl
                    bg-slate-100 text-slate-600
                    hover:bg-red-500 hover:text-white
                    transition-all
                  "
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
              className="p-2 rounded-xl hover:bg-white/60 text-slate-700 transition-all"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      <div className={`
        md:hidden overflow-hidden transition-all duration-300
        ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
      `}>

        <div className="backdrop-blur-2xl bg-white/80 border-t border-white/40 p-6 space-y-4">

          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block text-slate-700 font-semibold py-2"
          >
            Venta / Renta
          </Link>

          {!user ? (

            <Link to="/login" onClick={() => setIsOpen(false)}>
              <button
                className="
                  w-full bg-blue-600 text-white
                  py-4 rounded-2xl
                  font-black text-xs uppercase tracking-widest
                  shadow-lg shadow-blue-600/30
                "
              >
                Acceso Residentes
              </button>
            </Link>

          ) : (

            <div className="space-y-3">

              <Link
                to={user.role === 'admin' ? '/admin' : '/panel'}
                onClick={() => setIsOpen(false)}
                className="
                  block w-full text-center
                  bg-white/60 backdrop-blur-xl
                  border border-white/40
                  text-slate-800
                  py-4 rounded-2xl
                  font-semibold text-sm
                "
              >
                Panel
              </Link>

              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="
                  w-full bg-red-500/10 text-red-600
                  hover:bg-red-500 hover:text-white
                  py-4 rounded-2xl
                  font-bold text-xs uppercase tracking-widest
                  transition-all
                "
              >
                Salir
              </button>

            </div>

          )}

        </div>

      </div>

    </nav>
  );
};

export default Navbar;
