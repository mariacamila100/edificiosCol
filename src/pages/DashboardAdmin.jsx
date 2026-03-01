import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard, Building2, Users, Home,
  ShieldCheck, CheckCircle, AlertCircle,
  FileText, Droplets, LogOut, Search, Bell, ChevronRight, Menu, X
} from 'lucide-react';

// Importación de tus componentes
import EdificiosPage from './EdificiosPage.jsx';
import UsuariosPage from './UsuariosPage.jsx';
import InmueblePage from './InmueblePage.jsx';
import DocumentsPage from './DocumentosPage.jsx';
import ConsumosPage from './consumosPage.jsx';
import MuroComunidad from '../components/MuroComunidad.jsx';

import { getUsuarios } from '../services/usuarios.service.js';
import { getEdificios } from '../services/edificios.services.js';
import { auth, db } from '../api/firebaseConfig.js';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const DashboardAdmin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [edificios, setEdificios] = useState([]);
  const [selectedEdificio, setSelectedEdificio] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Estado para el menú móvil
  
  const [today] = useState(new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalEdificios: 0,
    totalUsuarios: 0,
    activos: 0,
    pendientes: 0
  });

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData = [], buildingsData = []] = await Promise.all([
          getUsuarios().catch(() => []),
          getEdificios().catch(() => [])
        ]);

        const edificiosArray = Array.isArray(buildingsData) ? buildingsData : [];
        const usuariosArray = Array.isArray(usersData) ? usersData : [];

        setEdificios(edificiosArray);
        setStats({
          totalEdificios: edificiosArray.length,
          totalUsuarios: usuariosArray.length,
          activos: usuariosArray.filter(u => u?.estado === true).length,
          pendientes: usuariosArray.filter(u => u?.estado === false).length
        });
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    loadData();
  }, []);

  // --- AUTH CHECK ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return navigate("/");
      try {
        const snap = await getDoc(doc(db, "usuarios", user.uid));
        if (!snap.exists() || snap.data()?.rol !== "admin") return navigate("/");
        setCurrentUser({ uid: user.uid, ...snap.data() });
      } catch (error) {
        navigate("/");
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-medium animate-pulse">Cargando panel de control...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden relative">
      
      {/* 📱 OVERLAY MÓVIL */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[50] lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 🌑 SIDEBAR RESPONSIVO */}
      <aside className={`
        fixed inset-y-0 left-0 z-[60] w-72 bg-slate-950 text-slate-400 flex flex-col shadow-2xl 
        transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand & Close Button for mobile */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-slate-800/50">
          <div className="flex items-center gap-3 text-white">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-lg shadow-lg">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Admin<span className="text-blue-500">Panel</span></span>
          </div>
          <button className="lg:hidden text-slate-400" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Principal</p>
          <NavItem icon={<LayoutDashboard />} label="Resumen" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setSelectedEdificio(null); setIsSidebarOpen(false); }} />
          
          <p className="px-4 text-xs font-bold text-slate-600 uppercase tracking-widest mt-6 mb-2">Gestión</p>
          <NavItem icon={<Building2 />} label="Edificios" active={activeTab === 'edificios'} onClick={() => { setActiveTab('edificios'); setIsSidebarOpen(false); }} />
          <NavItem icon={<Users />} label="Usuarios" active={activeTab === 'usuarios'} onClick={() => { setActiveTab('usuarios'); setIsSidebarOpen(false); }} />
          <NavItem icon={<Home />} label="Inmuebles" active={activeTab === 'inmuebles'} onClick={() => { setActiveTab('inmuebles'); setIsSidebarOpen(false); }} />
          
          <p className="px-4 text-xs font-bold text-slate-600 uppercase tracking-widest mt-6 mb-2">Finanzas</p>
          <NavItem icon={<Droplets />} label="Consumos" active={activeTab === 'consumos'} onClick={() => { setActiveTab('consumos'); setIsSidebarOpen(false); }} />
          <NavItem icon={<FileText />} label="Documentos" active={activeTab === 'documentos'} onClick={() => { setActiveTab('documentos'); setIsSidebarOpen(false); }} />
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-900/30">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
            <LogOut size={18} className="group-hover:text-red-400 transition-colors" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ☀️ MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {/* Hamburger Button */}
            <button 
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-lg md:text-xl font-bold text-slate-800 truncate max-w-[200px] md:max-w-none">
                {activeTab === 'dashboard' && !selectedEdificio ? 'Panel de Control' : 
                 selectedEdificio ? selectedEdificio.nombre :
                 activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
              <p className="text-[10px] md:text-xs text-slate-400 font-medium capitalize">{today}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
              <Bell size={20} />
            </button>
            
            <div className="flex items-center gap-3 pl-4 md:pl-6 border-l border-slate-200 h-10">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-bold text-slate-700">{currentUser?.nombre} {currentUser?.apellido}</p>
                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Admin</p>
              </div>
              <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shadow-md">
                {currentUser?.nombre?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fadeIn">

            {activeTab === 'dashboard' && (
              <>
                {!selectedEdificio ? (
                  <div className="space-y-8 md:space-y-10">
                    {/* KPI CARDS - Responsivo 1, 2 o 4 columnas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                      <KPICard title="Edificios" value={stats.totalEdificios} icon={<Building2 size={22} />} color="blue" trend="+2 este mes" />
                      <KPICard title="Residentes" value={stats.totalUsuarios} icon={<Users size={22} />} color="indigo" trend="Global" />
                      <KPICard title="Activos" value={stats.activos} icon={<CheckCircle size={22} />} color="emerald" trend="Acceso OK" />
                      <KPICard title="Pendientes" value={stats.pendientes} icon={<AlertCircle size={22} />} color="amber" trend="Por aprobar" />
                    </div>

                    {/* SECCIÓN EDIFICIOS */}
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                        <h3 className="text-lg font-bold text-slate-800">Muros de la Comunidad</h3>
                        <div className="relative w-full sm:w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input 
                            type="text" 
                            placeholder="Buscar edificio..." 
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {edificios.map((edificio) => (
                          <div 
                            key={edificio.id}
                            onClick={() => setSelectedEdificio(edificio)}
                            className="group bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
                          >
                            <div className="flex items-start justify-between mb-4 relative z-10">
                              <div className="p-3 bg-slate-50 text-slate-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Building2 size={24} />
                              </div>
                              <ChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors" size={20} />
                            </div>
                            <h4 className="font-bold text-slate-800 mb-1 truncate group-hover:text-blue-600 transition-colors">{edificio.nombre}</h4>
                            <p className="text-xs text-slate-400 truncate">{edificio.direccion || 'Sin dirección'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="animate-fadeIn">
                    <button onClick={() => setSelectedEdificio(null)} className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600">
                      <ChevronRight className="rotate-180" size={16} /> Volver
                    </button>
                    <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                      <div className="bg-slate-50 px-6 py-4 md:px-8 md:py-6 border-b border-slate-100">
                        <h3 className="text-lg md:text-xl font-black text-slate-800">{selectedEdificio.nombre}</h3>
                        <p className="text-xs md:text-sm text-slate-500 font-medium">Panel de comunicaciones</p>
                      </div>
                      <div className="p-2 md:p-4">
                        <MuroComunidad edificios={[selectedEdificio]} currentUser={currentUser} />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* OTRAS PÁGINAS */}
            <div className={activeTab === 'dashboard' ? 'hidden' : 'block animate-fadeIn'}>
               {activeTab === 'edificios' && <EdificiosPage />}
               {activeTab === 'usuarios' && <UsuariosPage />}
               {activeTab === 'inmuebles' && <InmueblePage />}
               {activeTab === 'documentos' && <DocumentsPage />}
               {activeTab === 'consumos' && <ConsumosPage edificios={edificios} />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- COMPONENTES UI ---

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
      active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    <span className={active ? 'text-white' : 'text-slate-500 group-hover:text-white'}>
      {React.cloneElement(icon, { size: 18 })}
    </span>
    {label}
  </button>
);

const KPICard = ({ title, value, icon, color, trend }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>{icon}</div>
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{trend}</span>
      </div>
      <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</h4>
      <p className="text-2xl font-black text-slate-800">{value}</p>
    </div>
  );
};

export default DashboardAdmin;