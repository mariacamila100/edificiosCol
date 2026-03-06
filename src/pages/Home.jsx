import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, ArrowRight, 
  Sparkles, ShieldCheck, TrendingUp,
  Star, Phone, Mail
} from 'lucide-react';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 font-sans">
      
      {/* ================= SEO ESTRUCTURAL (NATIVO REACT 19) ================= */}
      <title>Gestión Inmobiliaria en Bucaramanga | ImmoPro Santander</title>
      <meta name="description" content="Expertos en venta, arriendo y administración de apartamentos y casas en Bucaramanga, Floridablanca y Girón. Asesoría jurídica y comercial de alto nivel." />
      <meta name="keywords" content="inmobiliaria bucaramanga, apartamentos en venta cabecera, arriendos cañaveral, bienes raices santander, immopro" />
      <link rel="canonical" href="https://tu-dominio.com/" />

      {/* ================= NAV ================= */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto relative z-20">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-all">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <Building2 size={20} strokeWidth={3} />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900 italic uppercase">
            IMMO<span className="text-blue-600">PRO</span>
          </span>
        </Link>

        <div className="hidden md:flex gap-8 items-center">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
            Santander · Colombia
          </span>
          <Link
            to="/login"
            className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
          >
            Acceso Privado
          </Link>
        </div>
      </nav>

      {/* ================= HERO (CENTRADOS SIN IMAGEN) ================= */}
      <section className="relative px-6 overflow-hidden bg-white">
        {/* Fondo decorativo suavizado */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-100 rounded-full blur-3xl opacity-50"></div>

        {/* Flex container para centrar el contenido vertical y horizontalmente */}
        <div className="max-w-5xl mx-auto flex flex-col items-center justify-center text-center min-h-[85vh] relative z-10 py-20">

          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-semibold border border-blue-100 shadow-sm mb-8">
            <Sparkles size={14} />
            Líderes en el Mercado de Santander
          </div>

          {/* H1 centrado con Keyword principal */}
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none uppercase italic">
            GESTIÓN <span className="text-blue-600 not-italic">INMOBILIARIA</span>
            <br />
            <span className="text-4xl md:text-6xl">EN BUCARAMANGA</span>
          </h1>

          <p className="text-slate-600 mt-10 text-xl leading-relaxed max-w-2xl mx-auto">
            Comercialización y administración estratégica de bienes raíces en Santander. 
            Brindamos blindaje jurídico y análisis de valorización para propietarios e inversionistas que buscan excelencia y seguridad.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-12 w-full sm:w-auto justify-center">
            <Link 
              to="/catalogo"
              className="bg-blue-600 text-white px-10 py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
            >
              Ver Catálogo de Inmuebles
              <ArrowRight size={16} />
            </Link>

            <Link 
              to="/login"
              className="bg-white text-slate-900 px-10 py-4 rounded-xl text-sm font-black uppercase tracking-widest border border-slate-200 hover:border-slate-400 transition-all flex items-center justify-center"
            >
              Portal Residentes
            </Link>
          </div>

        </div>
      </section>

      {/* ================= SERVICIOS (H2 para SEO) ================= */}
      <section className="relative px-6 py-28 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-4 uppercase italic">
              Nuestra <span className="text-blue-600 not-italic">Especialidad</span>
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Ofrecemos soluciones integrales para que vender o arrendar tu propiedad en Santander sea un proceso seguro, rápido y rentable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { 
                icon: <ShieldCheck size={36} />, 
                title: "Asesoría Legal", 
                desc: "Protegemos tu patrimonio con contratos blindados y acompañamiento jurídico especializado en cada trámite." 
              },
              { 
                icon: <TrendingUp size={36} />, 
                title: "Mercadeo Eficaz", 
                desc: "Posicionamos tu inmueble en los portales líderes y redes sociales para asegurar un cierre rápido." 
              },
              { 
                icon: <Star size={36} />, 
                title: "Gestión Premium", 
                desc: "Atención personalizada para propietarios e inversionistas que buscan maximizar la rentabilidad de sus activos." 
              }
            ].map((s, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
                  {s.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tighter">
                  {s.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CONTACTO (H2 para SEO) ================= */}
      <section className="px-6 py-32 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-6">
            ¿Buscas vender o arrendar en <span className="text-blue-600">Bucaramanga?</span>
          </h2>
          <p className="text-slate-600 mb-12 text-lg">
            Somos la inmobiliaria líder en Santander. Agenda una asesoría hoy mismo con nuestros expertos y maximiza el valor de tu propiedad.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a 
              href="tel:+573001234567"
              className="flex items-center justify-center gap-3 bg-blue-600 text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-blue-700 transition-all rounded-xl shadow-lg shadow-blue-200 w-full sm:w-auto"
            >
              <Phone size={18} />
              Llamar a un asesor
            </a>

            <a 
              href="mailto:info@immopro.com"
              className="flex items-center justify-center gap-3 border border-slate-300 px-8 py-4 font-bold uppercase tracking-widest hover:border-slate-900 transition-all rounded-xl w-full sm:w-auto"
            >
              <Mail size={18} />
              Solicitar información
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;