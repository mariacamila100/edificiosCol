import React, { useState, useEffect } from 'react';
import { 
  UserCheck, MessageCircle, Mail, CreditCard, 
  ShoppingBag, Truck, Wrench, Lightbulb, 
  DoorOpen, ArrowRight, Smartphone, Droplets 
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';

const ServiciosPage = ({ user }) => {
  const [contactoEdificio, setContactoEdificio] = useState({ whatsapp: "", email: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacto = async () => {
      if (user?.edificioId) {
        try {
          const docRef = doc(db, "edificios", user.edificioId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setContactoEdificio({
              whatsapp: data.telefonoAdmin || "573000000000", 
              email: data.emailAdmin || "admin@edificioscol.com"
            });
          }
        } catch (e) { console.error(e); } finally { setLoading(false); }
      }
    };
    fetchContacto();
  }, [user]);

  const enviarSolicitud = (tipo) => {
    const msg = encodeURIComponent(`Hola, soy ${user.nombreApellido} (Apto ${user.unidad}). Solicito apoyo con: ${tipo}.`);
    window.open(`https://wa.me/${contactoEdificio.whatsapp.replace(/\s+/g, '')}?text=${msg}`, '_blank');
  };

  if (loading) return <div className="p-20 text-center text-slate-400 font-medium tracking-tight italic">Cargando servicios...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10 animate-fadeIn">
      
      {/* HEADER: AHORA CON TEXTO SLATE-700 (Gris oscuro suave) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-700 tracking-tight">Asistencia Residencial</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">Servicios exclusivos y soporte para su unidad.</p>
        </div>
        <div className="hidden md:block">
          <span className="text-[10px] font-bold text-blue-500/80 uppercase tracking-[0.2em] bg-blue-50/50 px-4 py-1.5 rounded-full border border-blue-100/50">
            Soporte Activo
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* BLOQUE: CONSERJERÍA */}
        <div className="bg-white border border-slate-100 rounded-[1.5rem] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
              <UserCheck size={20} strokeWidth={2} />
            </div>
            <h2 className="font-semibold text-slate-600 tracking-tight">Conserjería y Diligencias</h2>
          </div>
          
          <div className="p-4 space-y-1">
            <ServiceCard 
              icon={<CreditCard size={18} />} 
              title="Pago de servicios" 
              desc="Gestión de facturas y recibos"
              onClick={() => enviarSolicitud("Pago de servicios")}
            />
            <ServiceCard 
              icon={<ShoppingBag size={18} />} 
              title="Compras de víveres" 
              desc="Mercado y artículos básicos"
              onClick={() => enviarSolicitud("Compras de víveres")}
            />
            <ServiceCard 
              icon={<Truck size={18} />} 
              title="Mensajería" 
              desc="Trámites y envío de documentos"
              onClick={() => enviarSolicitud("Mensajería")}
            />
          </div>
        </div>

        {/* BLOQUE: MANTENIMIENTO */}
        <div className="bg-white border border-slate-100 rounded-[1.5rem] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <Wrench size={20} strokeWidth={2} />
            </div>
            <h2 className="font-semibold text-slate-600 tracking-tight">Mantenimiento de Hogar</h2>
          </div>
          
          <div className="p-4 space-y-1">
            <ServiceCard 
              icon={<Droplets size={18} />} 
              title="Plomería" 
              desc="Arreglo de fugas y grifería"
              onClick={() => enviarSolicitud("Plomería")}
              color="text-emerald-500/70"
            />
            <ServiceCard 
              icon={<Lightbulb size={18} />} 
              title="Electricidad" 
              desc="Iluminación y puntos eléctricos"
              onClick={() => enviarSolicitud("Electricidad")}
              color="text-emerald-500/70"
            />
            <ServiceCard 
              icon={<DoorOpen size={18} />} 
              title="Carpintería" 
              desc="Cerraduras y ajuste de puertas"
              onClick={() => enviarSolicitud("Carpintería")}
              color="text-emerald-500/70"
            />
          </div>
        </div>

      </div>

      {/* FOOTER: MÁS SUAVE */}
      <div className="bg-slate-800 rounded-[1.5rem] p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <p className="text-blue-300 text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Contacto Directo</p>
          <h3 className="text-lg font-medium text-slate-100">¿Necesita asistencia especial?</h3>
          <p className="text-slate-400 text-sm font-light italic">Estamos para ayudarle en cualquier requerimiento adicional.</p>
        </div>
        
        <button 
          onClick={() => enviarSolicitud("Consulta General")}
          className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-3 active:scale-95 shadow-lg shadow-blue-900/20"
        >
          <MessageCircle size={18} />
          CHAT ADMIN
        </button>
      </div>
    </div>
  );
};

/* COMPONENTE DE TARJETA: TITULOS EN SLATE-600 (Gris profesional) */
const ServiceCard = ({ icon, title, desc, onClick, color="text-blue-500/70" }) => (
  <button 
    onClick={onClick}
    className="w-full group flex items-center justify-between p-4 rounded-xl border border-transparent hover:bg-slate-50/80 transition-all text-left"
  >
    <div className="flex items-center gap-4">
      <div className={`p-3 bg-white border border-slate-50 rounded-xl shadow-sm ${color} group-hover:scale-105 transition-transform`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-600 leading-none group-hover:text-slate-900 transition-colors">{title}</p>
        <p className="text-[11px] text-slate-400 mt-2 font-normal">{desc}</p>
      </div>
    </div>
    <ArrowRight size={14} className="text-slate-200 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
  </button>
);

export default ServiciosPage;