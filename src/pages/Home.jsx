import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, UserCircle2, ArrowRight, 
  Sparkles, ShieldCheck, TrendingUp,
  Zap, Mail, MessageCircle, Star,
  MapPin, Phone, Instagram, Facebook,
  ArrowUpRight
} from 'lucide-react';
import Footer from '../components/Footer';
const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100">
      
      {/* --- 1. NAVEGACIÓN --- */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <Building2 size={20} strokeWidth={3} />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900 italic uppercase">
            IMMO<span className="text-blue-600">PRO</span>
          </span>
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Santander · Colombia</span>
          <button onClick={() => navigate('/login')} className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">Acceso Privado</button>
        </div>
      </nav>

      {/* --- 2. HERO SECTION REDISEÑADO (MÁS COMPACTO) --- */}
      <section className="pt-10 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Título de Bienvenida */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none uppercase italic">
              GESTIÓN <span className="text-blue-600 not-italic">INMOBILIARIA</span> <br />
              DE ALTO NIVEL.
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* BOTÓN CATÁLOGO (Ahora más estilizado y menos alto) */}
            <button 
              onClick={() => navigate('/catalogo')}
              className="group relative flex flex-col justify-between h-[380px] bg-blue-600 rounded-[3rem] p-10 text-left transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(37,99,235,0.3)] border-none overflow-hidden"
            >
              <div className="relative z-10 flex justify-between items-start">
                <div className="bg-white p-4 rounded-2xl shadow-xl">
                  <TrendingUp size={28} className="text-blue-600" strokeWidth={3} />
                </div>
                <div className="bg-blue-500/30 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full flex items-center gap-2">
                  <Sparkles size={12} className="text-white" />
                  <span className="text-[9px] font-black uppercase text-white tracking-widest">Catálogo 2026</span>
                </div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-4xl font-black text-white leading-tight tracking-tighter mb-6 uppercase">
                  Explora <br /> Inmuebles <span className="text-blue-200">Exclusivos</span>
                </h2>
                <div className="flex items-center gap-3 text-white font-black uppercase text-[10px] tracking-[0.2em]">
                  <span>Comenzar búsqueda</span>
                  <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center group-hover:translate-x-2 transition-transform">
                    <ArrowRight size={16} strokeWidth={3} />
                  </div>
                </div>
              </div>
              {/* Decoración sutil */}
              <div className="absolute -bottom-10 -right-10 text-white/5 font-black text-[12rem] italic select-none">PRO</div>
            </button>

            {/* BOTÓN PORTAL (Más sobrio) */}
            <button 
              onClick={() => navigate('/login')}
              className="group relative flex flex-col justify-between h-[380px] bg-slate-900 rounded-[3rem] p-10 text-left transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border-none overflow-hidden"
            >
              <div className="relative z-10 flex justify-between items-start">
                <div className="bg-blue-600 p-4 rounded-2xl shadow-xl group-hover:bg-white group-hover:text-blue-600 transition-colors">
                  <UserCircle2 size={28} strokeWidth={3} />
                </div>
                <div className="bg-slate-800 border border-slate-700 px-4 py-1.5 rounded-full">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Residentes</span>
                </div>
              </div>

              <div className="relative z-10">
                <h2 className="text-4xl font-black text-white leading-tight tracking-tighter mb-6 uppercase">
                  Portal de <br /> <span className="text-blue-500">Propietarios</span>
                </h2>
                <div className="flex items-center gap-3 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] group-hover:text-white transition-colors">
                  <span>Acceso al sistema</span>
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <Zap size={14} fill="currentColor" />
                  </div>
                </div>
              </div>
            </button>

          </div>
        </div>
      </section>

      {/* --- 3. SECCIÓN DE SERVICIOS (Igual pero ajustada) --- */}
      <section className="py-24 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-4 uppercase italic">Nuestra <span className="text-blue-600 not-italic">Especialidad</span></h3>
              <p className="text-slate-500 font-medium text-md">Soluciones inmobiliarias integrales con respaldo jurídico.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <ShieldCheck size={28} />, title: "Gestión Legal", desc: "Contratos blindados y asesoría jurídica de alto nivel para tu tranquilidad." },
              { icon: <TrendingUp size={28} />, title: "Valorización", desc: "Análisis de mercado para asegurar que tu inversión crezca año tras año." },
              { icon: <Star size={28} />, title: "Atención VIP", desc: "Soporte técnico y administrativo inmediato para cualquier requerimiento." }
            ].map((s, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-blue-200 transition-all group shadow-sm">
                <div className="w-14 h-14 bg-slate-50 text-slate-900 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {s.icon}
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tighter">{s.title}</h4>
                <p className="text-slate-500 text-xs leading-relaxed font-medium">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

        <Footer />
    </div>
  );
};

export default Home;