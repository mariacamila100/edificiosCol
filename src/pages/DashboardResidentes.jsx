import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Bell, CreditCard, Droplets, LogOut, FileText, 
  ShieldCheck, Menu, UserCheck, Plus, Megaphone, ChevronRight,
  Clock, MapPin, Loader2
} from 'lucide-react';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore'; // Importamos onSnapshot
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../api/firebaseConfig';

// Componentes
import MuroResidente from '../components/MuroResidente';
import DocumentosResidente from './DocumentosResidente';
import ConsumosResidente from '../components/ConsumoResidente';
import ServiciosPage from './Consergeria';
import ModalReporteResidente from '../components/ModalReporteResidente';

const DashboardResidente = () => {
  const [user, setUser] = useState(null);
  const [nombreEdificio, setNombreEdificio] = useState('...');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('inicio');
  const [totalMensajes, setTotalMensajes] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Estado de carga
  const [saludo, setSaludo] = useState('Hola');

  const navigate = useNavigate();

  // 1. Cargar Usuario Local
  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/');
    }
  }, [navigate]);

  // 2. Lógica de Saludo Dinámico
  useEffect(() => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) setSaludo('Buenos días');
    else if (hora >= 12 && hora < 19) setSaludo('Buenas tardes');
    else setSaludo('Buenas noches');
  }, []);

  // 3. Cargar Datos con TIEMPO REAL (Listeners)
  useEffect(() => {
    if (!user?.edificioId) return;

    // A. Obtener nombre del edificio (una sola vez)
    const fetchEdificio = async () => {
      try {
        const docRef = doc(db, "edificios", user.edificioId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setNombreEdificio(docSnap.data().nombre);
      } catch (e) { console.error(e); }
    };
    fetchEdificio();

    // B. LISTENER en Tiempo Real para Mensajes (Notificaciones vivas)
    const qMensajes = query(
      collection(db, "mensajes"),
      where("edificioId", "==", user.edificioId),
      where("status", "==", "pendiente")
    );

    // onSnapshot escucha cambios en la base de datos
    const unsubscribe = onSnapshot(qMensajes, (snapshot) => {
      setTotalMensajes(snapshot.size);
      setLoading(false); // Terminamos de cargar cuando tenemos datos
    }, (error) => {
      console.error("Error escuchando mensajes:", error);
      setLoading(false);
    });

    // Limpieza al desmontar
    return () => unsubscribe();

  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('usuario');
    navigate('/');
  };

  // --- SKELETON LOADING (Mejora Visual) ---
  if (loading || !user) {
    return (
      <div className="flex h-screen bg-[#F8FAFC] items-center justify-center">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto flex items-center justify-center">
             <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
          <p className="text-slate-400 font-medium text-sm">Cargando tu hogar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans antialiased text-slate-900">
      
      <ModalReporteResidente open={isModalOpen} onClose={() => setIsModalOpen(false)} user={user} />

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-[60] w-72 bg-slate-950 text-white transform transition-all duration-500 ease-in-out lg:relative lg:translate-x-0 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <span className="text-xl font-black tracking-tight">Edificios<span className="text-blue-500">Col</span></span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavItem icon={<LayoutDashboard />} label="Panel Principal" active={activeTab === 'inicio'} onClick={() => {setActiveTab('inicio'); setIsSidebarOpen(false);}} />
          <NavItem icon={<FileText />} label="Mis Documentos" active={activeTab === 'documentos'} onClick={() => {setActiveTab('documentos'); setIsSidebarOpen(false);}} />
          <NavItem icon={<Droplets />} label="Consumos" active={activeTab === 'consumos'} onClick={() => {setActiveTab('consumos'); setIsSidebarOpen(false);}} />
          <NavItem icon={<UserCheck />} label="Servicios" active={activeTab === 'servicios'} onClick={() => {setActiveTab('servicios'); setIsSidebarOpen(false);}} />
        </nav>

        <div className="p-6">
           {/* Card de Soporte simplificada */}
           <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Clock size={16}/></div>
                <div>
                   <p className="text-xs font-bold text-white">Soporte 24/7</p>
                   <p className="text-[10px] text-slate-400">¿Dudas? Contáctanos</p>
                </div>
              </div>
           </div>
           
           <button onClick={handleLogout} className="w-full py-3 hover:bg-white/5 rounded-xl text-sm font-bold transition-all flex items-center gap-3 text-slate-400 hover:text-white px-2">
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* TOP NAVBAR */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-40 sticky top-0">
          <button className="lg:hidden p-2 text-slate-600" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-6 ml-auto">
            {/* Notificaciones Icono con Badge Funcional */}
            <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors">
              <Bell size={22} />
              {totalMensajes > 0 && (
                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
              )}
            </button>

            <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>

            <div className="flex items-center gap-3">
               <div className="hidden sm:flex flex-col items-end">
                 <span className="text-sm font-bold text-slate-800">{user.nombreApellido}</span>
                 <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Residente</span>
               </div>
               <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-[2px] shadow-md">
                 <div className="h-full w-full bg-white rounded-full flex items-center justify-center font-black text-blue-700 text-sm">
                   {user.nombreApellido?.charAt(0)}
                 </div>
               </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="max-w-6xl mx-auto p-6 lg:p-10 space-y-8">
            
            {activeTab === 'inicio' && (
              <div className="animate-fadeIn">
                {/* SALUDO DINÁMICO */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                      {saludo}, {user.nombreApellido?.split(' ')[0]}
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                      Aquí tienes el resumen de <span className="text-blue-600 font-bold">{nombreEdificio}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-sm font-bold text-slate-600">
                    <MapPin size={16} className="text-blue-500" />
                    Unidad {user.unidad}
                  </div>
                </div>

                {/* GRID DE ACCIONES */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
                  
                  {/* BOTÓN DE ACCIÓN PRINCIPAL */}
                  <div className="md:col-span-5 relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
                    <div className="absolute inset-0 bg-blue-600 rounded-[2.5rem] rotate-1 group-hover:rotate-2 transition-transform duration-300 opacity-50 blur-sm"></div>
                    <div className="relative h-full min-h-[200px] bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 overflow-hidden shadow-2xl transition-transform duration-300 group-hover:-translate-y-1">
                      <Megaphone className="absolute -right-6 -bottom-6 text-white/10 group-hover:rotate-12 transition-transform duration-500" size={180} />
                      
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-4">
                          <Plus size={24} />
                        </div>
                        <div>
                           <h3 className="text-2xl font-black text-white mb-1">Crear Reporte</h3>
                           <p className="text-blue-100 text-sm font-medium leading-relaxed">¿Algo anda mal? Notifica a la administración inmediatamente.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* KPIs */}
                  <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <StatCard 
                      icon={<CreditCard />} 
                      title="Estado de Cuenta" 
                      val="Al día" 
                      subtext="Sin deudas pendientes"
                      color="text-emerald-500"
                      bg="bg-emerald-50" 
                      onClick={() => setActiveTab('documentos')} 
                    />
                    <StatCard 
                      icon={<Bell />} 
                      title="Comunicaciones" 
                      val={`${totalMensajes} Pendientes`}
                      subtext="Revisar novedades del muro"
                      color={totalMensajes > 0 ? "text-orange-500" : "text-slate-400"}
                      bg="bg-orange-50" 
                      onClick={() => {}} 
                    />
                  </div>
                </div>

                {/* TABLÓN DE ANUNCIOS */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-800 tracking-tight">Muro de la Comunidad</h2>
                      <p className="text-sm text-slate-500 font-medium">Últimas noticias y actualizaciones.</p>
                    </div>
                    {/* Indicador de estado en vivo */}
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      En línea
                    </div>
                  </div>
                  <div className="p-4">
                    <MuroResidente edificioId={user.edificioId} user={user} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documentos' && <DocumentosResidente user={user} />}
            {activeTab === 'consumos' && <ConsumosResidente user={user} />}
            {activeTab === 'servicios' && <ServiciosPage user={user} />}

          </div>
        </div>
      </main>
    </div>
  );
};

// --- COMPONENTES AUXILIARES MEJORADOS ---

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ${
      active
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 translate-x-1'
        : 'text-slate-400 hover:text-white hover:bg-white/10'
    }`}
  >
    <span className={`${active ? 'text-white' : 'text-slate-500'} transition-colors`}>
      {React.cloneElement(icon, { size: 20 })}
    </span>
    {label}
  </button>
);

const StatCard = ({ icon, title, val, subtext, color, bg, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left group h-full flex flex-col justify-between"
  >
    <div className="flex justify-between items-start w-full mb-4">
       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${bg ? bg.replace('text', 'bg') : 'bg-slate-50'} ${color}`}>
         {React.cloneElement(icon, { size: 22 })}
       </div>
       <div className="p-2 bg-slate-50 rounded-full text-slate-300 group-hover:text-blue-500 transition-colors">
          <ChevronRight size={16} />
       </div>
    </div>
    
    <div>
      <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</h3>
      <div className={`text-xl font-black ${color} mb-1`}>{val}</div>
      <p className="text-xs text-slate-400 font-medium">{subtext}</p>
    </div>
  </button>
);

export default DashboardResidente;