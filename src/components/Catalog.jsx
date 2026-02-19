import React, { useState, useEffect } from 'react';
import { 
  MapPin, Loader2, Ruler, ChevronLeft, ChevronRight, Search, 
  ArrowUpRight, SlidersHorizontal, X, Sofa, Car 
} from 'lucide-react';
import { getInmuebles } from '../services/inmuebles.services';
import InmuebleDetalle from './InmuebleDetalle';

const Catalog = ({ filtrosHero }) => {
  const [inmuebles, setInmuebles] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInmueble, setSelectedInmueble] = useState(null);
  
  // Estados de Filtros
  const [tipo, setTipo] = useState('');
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
        setInmuebles(res);
        setFiltrados(res);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    loadData();
  }, []);

  useEffect(() => {
    let res = inmuebles.filter(i => {
      const matchTexto = !filtrosHero || i.titulo?.toLowerCase().includes(filtrosHero.toLowerCase()) || i.barrio?.toLowerCase().includes(filtrosHero.toLowerCase());
      const matchTipo = !tipo || i.tipo === tipo;
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

  if (loading) return <div className="flex justify-center py-40"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      
      {/* ⚡ PANEL DE FILTROS INTUITIVO */}
      <div className="mb-12 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Selector de Operación (Chips) */}
          <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
            {['', 'renta', 'venta'].map((t) => (
              <button 
                key={t}
                onClick={() => setTipo(t)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tipo === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t === '' ? 'Todos' : t}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Input Área Minimalista */}
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-2 focus-within:border-blue-500 transition-all">
              <span className="text-[10px] font-black text-slate-400 uppercase mr-2">Área Min</span>
              <input 
                type="number" 
                value={areaMin}
                onChange={(e) => setAreaMin(e.target.value)}
                placeholder="0"
                className="w-12 text-sm font-bold outline-none"
              />
              <span className="text-xs font-bold text-slate-300 ml-1">m²</span>
            </div>

            {/* Toggle Amoblado */}
            <button 
              onClick={() => setSoloAmoblado(!soloAmoblado)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${soloAmoblado ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
            >
              <Sofa size={14} /> Amoblado
            </button>

            {/* Toggle Parqueadero */}
            <button 
              onClick={() => setConParqueadero(!conParqueadero)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${conParqueadero ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
            >
              <Car size={14} /> Parking
            </button>

            {/* Botón Reset */}
            {(tipo || areaMin || soloAmoblado || conParqueadero) && (
              <button onClick={() => { setTipo(''); setAreaMin(''); setSoloAmoblado(false); setConParqueadero(false); }} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 🏠 GRID DE 4 RESULTADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
        {itemsAMostrar.length > 0 ? itemsAMostrar.map(item => (
          <div 
            key={item.id}
            onClick={() => setSelectedInmueble(item)}
            className="group relative bg-white rounded-[3rem] p-4 border border-slate-100 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 cursor-pointer"
          >
            <div className="relative aspect-[16/10] rounded-[2.2rem] overflow-hidden mb-6">
              <img 
                src={item.fotos?.[0] || item.foto || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800"} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]"
                alt=""
              />
              <div className="absolute top-4 left-4">
                <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-tighter text-slate-900">
                  {item.barrio}
                </span>
              </div>
            </div>

            <div className="px-3 pb-2">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2">{item.titulo}</h3>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400"><Ruler size={14} className="text-blue-500"/> {item.area}m²</span>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{item.tipo}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900 tracking-tighter">
                    ${Number(item.precio).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-24 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <Search className="mx-auto text-slate-300 mb-4" size={40} />
            <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.3em]">Sin resultados</p>
          </div>
        )}
      </div>

      {/* 🔢 PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-10 py-6 border-t border-slate-50">
          <button 
            disabled={pagina === 1}
            onClick={() => setPagina(p => p - 1)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 disabled:opacity-0 transition-all group"
          >
            <ChevronLeft size={18} /> Anterior
          </button>
          
          <div className="flex gap-4">
            {[...Array(totalPaginas)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPagina(i + 1)}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  pagina === i + 1 ? 'bg-blue-600 scale-[1.8] shadow-lg shadow-blue-200' : 'bg-slate-200 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>

          <button 
            disabled={pagina === totalPaginas}
            onClick={() => setPagina(p => p + 1)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 disabled:opacity-0 transition-all group"
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