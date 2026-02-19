import React, { useState } from 'react';
import Hero from '../components/Hero';
import Catalog from '../components/Catalog';
import Footer from '../components/Footer';
import { 
  ShieldCheck, MessageCircle, Mail, Building2, Key, 
  ArrowUpRight, Star, CheckCircle2, Globe 
} from 'lucide-react';

const Home = () => {
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  const handleSearch = (val) => {
    setTerminoBusqueda(val);
    const catalogSection = document.getElementById('seccion-explorar');
    catalogSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="bg-white min-h-screen selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. HERO SECTION */}
      <section className="relative z-10">
        <Hero onSearch={handleSearch} />
      </section>

      {/* 2. AREA PRINCIPAL: CATALOGO */}
      <section id="seccion-explorar" className="relative z-30 -mt-20">
        <div className="container mx-auto px-4">
          <div className="bg-white border border-slate-100 rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-8 md:p-12">
            
            <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-slate-50 pb-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="h-[2px] w-8 bg-blue-600 rounded-full"></span>
                  <span className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-600/70">Catálogo Boutique</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                  Explorar <span className="text-slate-400">Propiedades</span>
                </h2>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                <Globe size={16} />
                <span>Bucaramanga & Área Metropolitana</span>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 xl:col-span-9">
                <Catalog filtrosHero={terminoBusqueda} />
              </div>

              <aside className="lg:col-span-4 xl:col-span-3">
                <div className="sticky top-10 space-y-8">
                  <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-8 border border-slate-100">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 leading-tight mb-4">
                        Elevamos el estándar de la <span className="text-blue-600">vida urbana.</span>
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        No solo vendemos metros cuadrados; diseñamos experiencias de convivencia.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {['Valorización Garantizada', 'Soporte 24/7 Técnico', 'Filtros de Seguridad', 'Transparencia Legal'].map((item) => (
                        <div key={item} className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                          <CheckCircle2 className="text-blue-600 shrink-0" size={18} />
                          <span className="text-[11px] font-bold text-slate-700">{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-orange-500 p-5 rounded-2xl text-white">
                        <p className="text-2xl font-black italic">10+</p>
                        <p className="text-[8px] font-bold uppercase tracking-widest opacity-80">Años de experiencia</p>
                      </div>
                      <div className="bg-slate-900 p-5 rounded-2xl text-white flex flex-col justify-center">
                        <Star className="text-orange-400 mb-1" size={16} fill="currentColor" />
                        <p className="text-[10px] font-bold leading-tight">Líderes en gestión.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SERVICIOS */}
      <section className="relative z-20 -mt-10 pt-20 pb-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              Gestión inmobiliaria <span className="text-blue-600">especializada</span>
            </h2>
            <p className="text-slate-500 mt-4 font-medium">Soluciones diseñadas para maximizar el valor de su patrimonio.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Building2 />, title: "Gestión Integral", desc: "Administración profesional con métricas claras y eficiencia operativa." },
              { icon: <Key />, title: "Renta Estratégica", desc: "Optimización de rentabilidad basada en análisis de mercado local." },
              { icon: <ShieldCheck />, title: "Blindaje Jurídico", desc: "Soporte legal estructurado para reducir riesgos contractuales." }
            ].map((service, index) => (
              <div 
                key={index}
                className="group p-10 bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl hover:shadow-2xl transition-all duration-500"
              >
                <div className="w-16 h-16 bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 rounded-2xl flex items-center justify-center mb-8">
                  {React.cloneElement(service.icon, { size: 30 })}
                </div>

                <h4 className="text-2xl font-black text-slate-900 mb-4">
                  {service.title}
                </h4>

                <p className="text-slate-500 text-sm leading-relaxed">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* 4. CONTACTO: FONDO SUAVE Y CONTENIDO DE VENTA/RENTA */}
      <section className="relative z-30 pb-10 pt-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="bg-slate-50 text-slate-900 rounded-[3rem] py-20 px-8 md:px-16 border border-slate-100 relative overflow-hidden">
            
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h3 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                ¿Busca <span className="text-blue-600">Comprar o rentar</span> su inmueble?
              </h3>

              <p className="text-slate-500 text-lg mb-12 leading-relaxed">
                Asesoría estratégica personalizada para propietarios que desean comercializar sus propiedades con éxito en Bucaramanga.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href="#"
                  className="group flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-full font-bold text-sm hover:bg-slate-900 transition-all duration-300 shadow-lg shadow-blue-200"
                >
                  <MessageCircle size={20} />
                  WhatsApp Directo
                </a>

                <a
                  href="#"
                  className="flex items-center gap-3 px-10 py-5 roundepled-full font-bold text-sm border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all duration-300"
                >
                  <Mail size={20} />
                  Email Corporativo
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Home;