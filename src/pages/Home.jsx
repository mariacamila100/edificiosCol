import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, ArrowRight, 
  Sparkles, ShieldCheck, TrendingUp,
  Star, Phone, Mail
} from 'lucide-react';
import Footer from '../components/Footer';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 font-sans">

      {/* ================= NAV ================= */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <Building2 size={20} strokeWidth={3} />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900 italic uppercase">
            IMMO<span className="text-blue-600">PRO</span>
          </span>
        </div>

        <div className="hidden md:flex gap-8 items-center">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
            Santander · Colombia
          </span>
          <button
            onClick={() => navigate('/login')}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
          >
            Acceso Privado
          </button>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="relative px-6 overflow-hidden">
        
        {/* Fondo decorativo */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-40"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center min-h-[90vh] relative z-10">

          {/* ===== TEXTO 50% ===== */}
          <div className="pr-0 md:pr-16 py-16">

            <div className="inline-flex items-center gap-2 bg-white text-blue-700 px-4 py-1.5 rounded-full text-xs font-semibold border border-blue-100 shadow-sm mb-8">
              <Sparkles size={14} />
              Gestión Inmobiliaria desde ...
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none uppercase italic">
              GESTIÓN <span className="text-blue-600 not-italic">INMOBILIARIA</span>
              <br />
              <span className="text-4xl md:text-5xl">EN BUCARAMANGA</span>
            </h1>

            <p className="text-slate-600 mt-8 text-lg leading-relaxed max-w-xl">
              Comercialización y administración estratégica de bienes raíces en Santander.
              Blindaje jurídico y valorización inteligente.
            </p>

            <div className="flex gap-4 mt-10">
              <button 
                onClick={() => navigate('/catalogo')}
                className="bg-blue-600 text-white px-8 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30"
              >
                Ver Catálogo
                <ArrowRight size={16} />
              </button>

              <button 
                onClick={() => navigate('/login')}
                className="bg-white text-slate-900 px-8 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest border border-slate-200 hover:border-slate-400 transition-all"
              >
                Residentes
              </button>
            </div>
          </div>

          {/* ===== IMAGEN VERTICAL 50% ===== */}
          <div className="relative h-full flex items-center justify-center">

            <div className="relative w-full h-[80vh] rounded-[3rem] overflow-hidden shadow-[0_60px_120px_-30px_rgba(0,0,0,0.3)]">

              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1400&auto=format&fit=crop"
                alt="Apartamento moderno"
                className="w-full h-full object-cover"
              />

              {/* Overlay para integrar con marca */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 via-transparent to-transparent"></div>

              {/* Tarjeta flotante */}
              <div className="absolute bottom-10 left-10 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Proyecto Destacado
                </p>
                <p className="text-lg font-black text-slate-900">
                  Penthouse en Cabecera
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ================= SERVICIOS INTEGRADOS ================= */}
      <section className="relative px-6 py-24">

        <div className="max-w-7xl mx-auto">

          <div className="mb-16">
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-4 uppercase italic">
              Nuestra <span className="text-blue-600 not-italic">Especialidad</span>
            </h3>
            <p className="text-slate-600 max-w-xl">
              Soluciones inmobiliarias integrales con respaldo jurídico, análisis de mercado y acompañamiento estratégico.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: <ShieldCheck size={36} />, title: "Gestión Legal", desc: "Contratos blindados y asesoría jurídica especializada." },
              { icon: <TrendingUp size={36} />, title: "Valorización", desc: "Estudios de mercado para maximizar tu inversión." },
              { icon: <Star size={36} />, title: "Atención VIP", desc: "Soporte inmediato y acompañamiento personalizado." }
            ].map((s, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-md p-10 rounded-[2rem] border border-white shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
                  {s.icon}
                </div>

                <h4 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tighter">
                  {s.title}
                </h4>

                <p className="text-slate-600 text-sm leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>
         {/* ================= CONTACTO ================= */}
      <section className="px-6 py-32 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto text-center">

          <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-6">
            Hablemos de tu <span className="text-blue-600">propiedad</span>
          </h3>

          <p className="text-slate-600 mb-12">
            Agenda una asesoría personalizada y recibe acompañamiento estratégico inmediato.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-6">

            <a 
              href="tel:+573001234567"
              className="flex items-center justify-center gap-3 bg-blue-600 text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-blue-700 transition-all"
            >
              <Phone size={18} />
              Llamar Ahora
            </a>

            <a 
              href="mailto:info@immopro.com"
              className="flex items-center justify-center gap-3 border border-slate-300 px-8 py-4 font-bold uppercase tracking-widest hover:border-slate-900 transition-all"
            >
              <Mail size={18} />
              Enviar Correo
            </a>

          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;