import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard, Building2, Users, Home,
  ShieldCheck, CheckCircle, AlertCircle,
  FileText, Droplets, LogOut, Search, Bell, ChevronRight
} from 'lucide-react';

// Importación de tus componentes (Mantenemos tu lógica)
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
  
  // Estado para la fecha actual
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
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">

      {/* 🌑 SIDEBAR PROFESIONAL */}
      <aside className="w-72 bg-slate-950 text-slate-400 flex flex-col shadow-2xl z-20 transition-all duration-300">
        {/* Brand */}
        <div className="h-20 flex items-center px-8 border-b border-slate-800/50">
          <div className="flex items-center gap-3 text-white">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-lg shadow-lg shadow-blue-500/20">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Admin<span className="text-blue-500">Panel</span></span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Principal</p>
          <NavItem icon={<LayoutDashboard />} label="Resumen General" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setSelectedEdificio(null); }} />
          
          <p className="px-4 text-xs font-bold text-slate-600 uppercase tracking-widest mt-6 mb-2">Gestión</p>
          <NavItem icon={<Building2 />} label="Edificios" active={activeTab === 'edificios'} onClick={() => setActiveTab('edificios')} />
          <NavItem icon={<Users />} label="Usuarios" active={activeTab === 'usuarios'} onClick={() => setActiveTab('usuarios')} />
          <NavItem icon={<Home />} label="Inmuebles" active={activeTab === 'inmuebles'} onClick={() => setActiveTab('inmuebles')} />
          
          <p className="px-4 text-xs font-bold text-slate-600 uppercase tracking-widest mt-6 mb-2">Finanzas & Docs</p>
          <NavItem icon={<Droplets />} label="Consumos" active={activeTab === 'consumos'} onClick={() => setActiveTab('consumos')} />
          <NavItem icon={<FileText />} label="Documentación" active={activeTab === 'documentos'} onClick={() => setActiveTab('documentos')} />
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
        
        {/* Top Header Glassmorphism */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800 capitalize">
              {activeTab === 'dashboard' && !selectedEdificio ? 'Panel de Control' : 
               selectedEdificio ? `Gestión: ${selectedEdificio.nombre}` :
               activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            <p className="text-xs text-slate-400 font-medium capitalize">{today}</p>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200 h-10">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-700">{currentUser?.nombre} {currentUser?.apellido}</p>
                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Administrador</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center font-bold shadow-md ring-2 ring-white">
                {currentUser?.nombre?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">

            {activeTab === 'dashboard' && (
              <>
                {!selectedEdificio ? (
                  <div className="space-y-10">
                    {/* KPI CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <KPICard 
                        title="Total Edificios" 
                        value={stats.totalEdificios} 
                        icon={<Building2 size={24} />} 
                        color="blue"
                        trend="+2 este mes"
                      />
                      <KPICard 
                        title="Residentes Totales" 
                        value={stats.totalUsuarios} 
                        icon={<Users size={24} />} 
                        color="indigo"
                        trend="Base de datos global"
                      />
                      <KPICard 
                        title="Usuarios Activos" 
                        value={stats.activos} 
                        icon={<CheckCircle size={24} />} 
                        color="emerald"
                        trend="Acceso permitido"
                      />
                      <KPICard 
                        title="Pendientes" 
                        value={stats.pendientes} 
                        icon={<AlertCircle size={24} />} 
                        color="amber"
                        trend="Requieren aprobación"
                      />
                    </div>

                    {/* BUILDING SELECTOR GRID */}
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-800">Comunicaciones y Muros</h3>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input 
                            type="text" 
                            placeholder="Buscar edificio..." 
                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none w-64 transition-all"
                          />
                        </div>
                      </div>

                      {edificios.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                          <Building2 size={48} className="mx-auto text-slate-200 mb-4" />
                          <p className="text-slate-400 font-medium">No hay edificios registrados aún.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {edificios.map((edificio) => (
                            <div 
                              key={edificio.id}
                              onClick={() => setSelectedEdificio(edificio)}
                              className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
                            >
                              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[4rem] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                              
                              <div className="relative z-10 flex items-start justify-between mb-4">
                                <div className="p-3 bg-slate-50 text-slate-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                  <Building2 size={24} />
                                </div>
                                <span className="p-2 bg-slate-50 rounded-full text-slate-300 group-hover:text-blue-500 transition-colors">
                                  <ChevronRight size={16} />
                                </span>
                              </div>
                              
                              <h4 className="relative z-10 text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                                {edificio.nombre}
                              </h4>
                              <p className="relative z-10 text-xs text-slate-400 font-medium">
                                {edificio.direccion || 'Ubicación no registrada'}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // VISTA DETALLE DE MURO
                  <div className="animate-fadeIn">
                    <button 
                      onClick={() => setSelectedEdificio(null)}
                      className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
                    >
                      <ChevronRight className="rotate-180" size={16} /> Volver al tablero
                    </button>
                    
                    <div className="bg-white rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
                      <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-black text-slate-800">{selectedEdificio.nombre}</h3>
                          <p className="text-sm text-slate-500">Muro de comunicaciones y reportes</p>
                        </div>
                        <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                          En vivo
                        </span>
                      </div>
                      <div className="p-2">
                        <MuroComunidad edificios={[selectedEdificio]} currentUser={currentUser} />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* OTRAS PÁGINAS RENDERIZADAS AQUÍ */}
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

// --- COMPONENTES UI REUTILIZABLES ---

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
      active
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
    }`}
  >
    <span className={`transition-colors ${active ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>
      {React.cloneElement(icon, { size: 20 })}
    </span>
    {label}
    {active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>}
  </button>
);

const KPICard = ({ title, value, icon, color, trend }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorMap[color].split(' ')[0]} ${colorMap[color].split(' ')[1]}`}>
          {icon}
        </div>
        {/* Placeholder chart sparkline */}
        <div className="flex gap-0.5 items-end h-8 opacity-30">
           <div className={`w-1 bg-current rounded-t ${colorMap[color].split(' ')[1]} h-3`}></div>
           <div className={`w-1 bg-current rounded-t ${colorMap[color].split(' ')[1]} h-5`}></div>
           <div className={`w-1 bg-current rounded-t ${colorMap[color].split(' ')[1]} h-4`}></div>
           <div className={`w-1 bg-current rounded-t ${colorMap[color].split(' ')[1]} h-7`}></div>
        </div>
      </div>
      <div>
        <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</h4>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-800">{value}</span>
        </div>
        <p className="text-xs text-slate-400 mt-2 font-medium">{trend}</p>
      </div>
    </div>
  );
};

export default DashboardAdmin;