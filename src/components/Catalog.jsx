import React, { useState, useEffect } from 'react';
import { 
  MapPin, Loader2, Ruler, ChevronLeft, ChevronRight, Search, 
  Sofa, Car, Tag 
} from 'lucide-react';
import { getInmuebles } from '../services/inmuebles.service';
import InmuebleDetalle from './InmuebleDetalle';

const Catalog = ({ filtrosHero }) => {
  const [inmuebles, setInmuebles] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInmueble, setSelectedInmueble] = useState(null);
  
  // Estados de Filtros
  const [tipo, setTipo] = useState(''); // '' (Todos), 'Venta' o 'Arriendo'
  const [areaMin, setAreaMin] = useState('');
  const [soloAmoblado, setSoloAmoblado] = useState(false);
  const [conParqueadero, setConParqueadero] = useState(false);
  
  // Paginación
  const [pagina, setPagina] = useState(1);
  const itemsPorPagina = 4;

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getInmuebles();
        setInmuebles(res || []);
        setFiltrados(res || []);
      } catch (error) { 
        console.error("Error cargando inmuebles:", error); 
      } finally { 
        setLoading(false); 
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    let res = inmuebles.filter(i => {
      const estadoLimpio = i.estado?.toLowerCase() || '';

      // 🚫 REGLA DE ORO: Solo mostrar lo que está disponible para el público
      // Filtramos fuera "Entregado" y cualquier cosa que no sea Venta o Arriendo
      const esVenta = estadoLimpio === 'venta';
      const esArriendo = estadoLimpio === 'arriendo';
      
      if (estadoLimpio === 'entregado') return false;
      if (!esVenta && !esArriendo) return false; // Esto quita basura o estados internos

      // 1. Buscador (Hero)
      const busqueda = filtrosHero?.toLowerCase() || '';
      const matchTexto = !filtrosHero || 
        i.titulo?.toLowerCase().includes(busqueda) || 
        i.barrio?.toLowerCase().includes(busqueda) ||
        i.nombreEdificio?.toLowerCase().includes(busqueda);
      
      // 2. Filtro de Tipo (Botones: Todos / Venta / Arriendo)
      const matchTipo = !tipo || estadoLimpio === tipo.toLowerCase();

      // 3. Otros filtros
      const matchArea = !areaMin || Number(i.area) >= Number(areaMin);
      const matchAmoblado = !soloAmoblado || i.amoblado === true;
      const matchParqueo = !conParqueadero || i.parqueadero === true;
      
      return matchTexto && matchTipo && matchArea && matchAmoblado && matchParqueo;
    });

    setFiltrados(res);
    setPagina(1);
  }, [filtrosHero, tipo, areaMin, soloAmoblado, conParqueadero, inmuebles]);

  const totalPaginas = Math.ceil(filtrados.length / itemsPorPagina);
  const inicio = (pagina - 1) * itemsPorPagina;
  const itemsAMostrar = filtrados.slice(inicio, inicio + itemsPorPagina);

  const cambiarPagina = (num) => {
    setPagina(num);
    document.getElementById('catalog-start')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Actualizando Inventario</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4" id="catalog-start">
      
      {/* ⚡ PANEL DE FILTROS */}
      <div className="mb-12 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit">
            {[
              { label: 'Todos', value: '' },
              { label: 'En Venta', value: 'Venta' },
              { label: 'En Arriendo', value: 'Arriendo' }
            ].map((opcion) => (
              <button 
                key={opcion.value}
                onClick={() => setTipo(opcion.value)}
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  tipo === opcion.value ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {opcion.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setSoloAmoblado(!soloAmoblado)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                soloAmoblado ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              <Sofa size={14} /> Amoblado
            </button>

            <button 
              onClick={() => setConParqueadero(!conParqueadero)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                conParqueadero ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              <Car size={14} /> Parking
            </button>
          </div>
        </div>
      </div>

      {/* 🏠 GRID DE RESULTADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        {itemsAMostrar.length > 0 ? itemsAMostrar.map(item => {
          const estadoFinal = item.estado || 'Venta';
          const esArriendo = estadoFinal.toLowerCase().includes('arriendo');

          return (
            <div 
              key={item.id}
              onClick={() => setSelectedInmueble(item)}
              className="group relative bg-white rounded-[3.5rem] p-4 border border-slate-100 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 cursor-pointer"
            >
              <div className="relative aspect-[16/10] rounded-[2.8rem] overflow-hidden mb-8">
                <img 
                  src={item.fotos?.[0] || item.foto || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800"} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                  alt="Apartamento"
                />
                
                <div className="absolute top-5 right-5">
                  <div className={`flex items-center gap-2 px-5 py-2.5 ${esArriendo ? 'bg-orange-500' : 'bg-blue-600'} text-white rounded-2xl shadow-xl shadow-black/20`}>
                    <Tag size={12} fill="currentColor" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {estadoFinal}
                    </span>
                  </div>
                </div>

                <div className="absolute top-5 left-5">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm">
                    <MapPin size={12} className="text-blue-600" />
                    <span className="text-[10px] font-black uppercase text-slate-900">{item.barrio}</span>
                  </div>
                </div>
              </div>

              <div className="px-4 pb-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className={`text-[10px] font-black ${esArriendo ? 'text-orange-500' : 'text-blue-600'} uppercase tracking-[0.25em]`}>
                      {item.nombreEdificio || 'Edificio Real'}
                    </p>
                    
                    <h3 className="text-2xl font-bold text-slate-900 leading-none group-hover:text-blue-600 transition-colors">
                      Apartamento
                    </h3>
                    
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        <Ruler size={16} /> {item.area}m²
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">
                      ${Number(item.precio).toLocaleString('es-CO')}
                    </p>
                    <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${esArriendo ? 'text-orange-500' : 'text-slate-400'}`}>
                      {esArriendo ? 'Canon Mensual' : 'Precio Venta'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-32 text-center bg-slate-50/50 rounded-[4rem] border-2 border-dashed border-slate-200">
            <Search className="mx-auto text-slate-200 mb-6" size={50} />
            <p className="text-slate-400 font-black uppercase text-xs tracking-[0.4em]">Sin propiedades disponibles</p>
          </div>
        )}
      </div>

      {/* 🔢 PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-12 border-t border-slate-100">
          <button 
            disabled={pagina === 1}
            onClick={() => cambiarPagina(pagina - 1)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all
              disabled:opacity-30 disabled:cursor-not-allowed bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <ChevronLeft size={18} /> Anterior
          </button>

          <div className="flex items-center gap-2">
            {[...Array(totalPaginas)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => cambiarPagina(i + 1)}
                className={`w-12 h-12 rounded-2xl text-xs font-black transition-all duration-300 flex items-center justify-center
                  ${pagina === i + 1 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110' 
                    : 'bg-white text-slate-400 border border-slate-100 hover:text-blue-600'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button 
            disabled={pagina === totalPaginas}
            onClick={() => cambiarPagina(pagina + 1)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all
              disabled:opacity-30 bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-slate-900"
          >
            Siguiente <ChevronRight size={18} />
          </button>
        </div>
      )}

      {selectedInmueble && (
        <InmuebleDetalle 
          inmueble={selectedInmueble} 
          onClose={() => setSelectedInmueble(null)} 
        />
      )}
    </div>
  );
};

export default Catalog;