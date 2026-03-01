import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEdificios } from '../services/edificios.services';
import Footer from '../components/Footer';
import {
  MapPin,
  Building2,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Search,
  ArrowUpRight,
  Globe
} from 'lucide-react';

const CatalogoEdificios = () => {
  const [edificios, setEdificios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // --- PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const edificiosPerPage = 6;

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const data = await getEdificios();
        setEdificios(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al cargar catálogo:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  // --- LÓGICA DE FILTRADO MULTI-CRITERIO ---
  const edificiosFiltrados = edificios.filter(ed => {
    const busqueda = searchTerm.toLowerCase();
    return (
      ed.nombre.toLowerCase().includes(busqueda) ||
      (ed.barrio && ed.barrio.toLowerCase().includes(busqueda)) ||
      (ed.ciudad && ed.ciudad.toLowerCase().includes(busqueda))
    );
  });

  const indexOfLastEdificio = currentPage * edificiosPerPage;
  const indexOfFirstEdificio = indexOfLastEdificio - edificiosPerPage;
  const currentEdificios = edificiosFiltrados.slice(indexOfFirstEdificio, indexOfLastEdificio);
  const totalPages = Math.ceil(edificiosFiltrados.length / edificiosPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative">
          <Loader2 className="animate-spin text-blue-600" size={60} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-900 rounded-full"></div>
          </div>
        </div>
        <p className="mt-6 text-slate-900 font-black uppercase tracking-[0.3em] text-[10px] italic">Edificios Colombia</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans selection:bg-blue-100">

      {/* HEADER SECTION */}
      <header className="relative pt-32 pb-20 px-6 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900 text-white rounded-md mb-6">
                <Sparkles size={12} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Portafolio 2026</span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.85] uppercase italic">
                Explora   <br />
                <span className="text-blue-600 not-italic">nuestros edificios.</span>
              </h1>

              {/* TEXTO DE EXPLORACIÓN AÑADIDO */}
              <div className="mt-8 flex items-start gap-4 max-w-lg">
                <div className="w-[2px] h-12 bg-blue-600 mt-1"></div>
                <p className="text-slate-500 font-medium text-lg leading-tight italic">
                  Tu próximo gran paso merece una <span className="text-slate-900 font-black not-italic">ubicación estratégica</span>. Conoce nuestras unidades disponibles en los sectores de mayor valorización del país.
                </p>
              </div>
            </div>
            {/* BARRA DE BÚSQUEDA MULTI-CRITERIO */}
            <div className="w-full md:w-[450px] relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400 group-focus-within:text-blue-600 transition-colors border-r pr-3 border-slate-200">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Busca por nombre, barrio o ciudad..."
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-6 pl-20 pr-6 text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all shadow-sm"
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reiniciar a la primera página al buscar
                }}
              />
              {searchTerm === "" && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex gap-2">
                  <span className="text-[8px] font-black bg-slate-200 text-slate-500 px-2 py-1 rounded"></span>
                  <span className="text-[8px] font-black bg-slate-200 text-slate-500 px-2 py-1 rounded"></span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-6 pb-32 w-full">

        {edificiosFiltrados.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-slate-50 shadow-inner">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="text-slate-300" size={32} />
            </div>
            <h3 className="text-slate-900 font-black uppercase text-xl italic">Sin resultados para "{searchTerm}"</h3>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Intenta buscando una ciudad diferente como 'Bucaramanga' o 'Bogotá'</p>
          </div>
        ) : (
          <>
            {/* GRID DE RESULTADOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
              {currentEdificios.map((edificio) => (
                <div
                  key={edificio.id}
                  onClick={() => navigate(`/edificio/${edificio.id}`)}
                  className="group cursor-pointer"
                >
                  {/* IMAGEN CON BADGE DE CIUDAD DINÁMICO */}
                  {/* IMAGEN CON BADGE DE CIUDAD DINÁMICO */}
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-slate-100 mb-6 shadow-2xl shadow-slate-200/50 group-hover:shadow-blue-200/50 transition-all duration-500">
                    <img
                      // Prioridad: logoUrl > imagen > foto > placeholder
                      src={edificio.logoUrl || edificio.imagen || edificio.foto || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800'}
                      alt={edificio.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />

                    {/* Efecto de cristal sobre la imagen si es un logo con transparencia */}
                    {edificio.logoUrl && (
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    )}

                    {/* Badge de Ciudad & Localización */}
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                      <div className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 self-start">
                        <Globe size={10} />
                        {edificio.ciudad || 'Colombia'}
                      </div>
                      <div className="bg-white/95 backdrop-blur-md text-slate-900 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 self-start border border-slate-100">
                        <MapPin size={10} className="text-blue-600" />
                        {edificio.barrio || 'Sector Premium'}
                      </div>
                    </div>

                    {/* Overlay degradado al hacer hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="absolute bottom-8 right-8 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="bg-white text-blue-900 p-4 rounded-full shadow-2xl transform hover:scale-110 transition-transform">
                        <ArrowUpRight size={24} />
                      </div>
                    </div>
                  </div>

                  {/* INFO TEXTO */}
                  <div className="px-2">
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none group-hover:text-blue-600 transition-colors">
                      {edificio.nombre}
                    </h3>
                    <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ver Unidades Disponibles</span>
                      </div>
                      <div className="h-[2px] w-12 bg-slate-100 group-hover:w-20 group-hover:bg-blue-600 transition-all duration-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINACIÓN */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-32">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-16 h-16 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-600 disabled:opacity-30 transition-all shadow-sm"
                >
                  <ChevronLeft size={24} />
                </button>

                <div className="flex gap-3 bg-slate-50 p-2 rounded-full border border-slate-100">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`w-12 h-12 rounded-full font-black text-xs transition-all ${currentPage === i + 1
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110'
                        : 'text-slate-400 hover:text-blue-900'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-16 h-16 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-600 disabled:opacity-30 transition-all shadow-sm"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CatalogoEdificios;