import React, { useEffect, useState, useCallback } from 'react';
import { 
  ArrowLeft, MapPin, Building, Home, 
  Users, Layers, Search, Plus
} from 'lucide-react';
// 🔹 IMPORTANTE: Asegúrate de que esta función apunte a la colección 'inmuebles'
import { getApartamentosPorEdificio } from '../services/edificios.services';
import InmuebleModal from '../components/InmuebleModal';

const DetallesEdificio = ({ edificio, onBack }) => {
  const [apartamentos, setApartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Función para cargar datos (se usa useCallback para poder re-usarla en onSaved)
  const loadAptos = useCallback(async () => {
    if (!edificio?.id) return;
    setLoading(true);
    try {
      // Llamamos al servicio que ahora consulta la colección 'inmuebles'
      const data = await getApartamentosPorEdificio(edificio.id);
      
      // Ordenamos por piso y luego por unidad
      const sorted = data.sort((a, b) => {
        const pisoA = Number(a.piso) || 0;
        const pisoB = Number(b.piso) || 0;
        if (pisoA !== pisoB) return pisoA - pisoB;
        return String(a.unidad).localeCompare(String(b.unidad), undefined, { numeric: true });
      });
      
      setApartamentos(sorted);
    } catch (error) {
      console.error("Error al refrescar la lista:", error);
    } finally {
      setLoading(false);
    }
  }, [edificio?.id]);

  useEffect(() => {
    loadAptos();
  }, [loadAptos]);

  // Filtro de búsqueda corregido
  const filteredAptos = apartamentos.filter(ap => {
    const unidad = String(ap.unidad || "").toLowerCase();
    const piso = String(ap.piso || "").toLowerCase();
    const busqueda = searchTerm.toLowerCase();
    return unidad.includes(busqueda) || piso.includes(busqueda);
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* HEADER DINÁMICO */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all text-slate-500">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-800">{edificio?.nombre}</h2>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <MapPin size={12} className="text-blue-500" /> {edificio?.ciudad || 'Sin ubicación'}
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl text-sm font-black flex gap-2 items-center shadow-lg active:scale-95 transition-all"
        >
          <Plus size={18} /> <span>Nueva Unidad</span>
        </button>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* CARDS DE ESTADO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={<Home />} label="Total Unidades" value={apartamentos.length} color="bg-blue-50 text-blue-600" />
          <StatCard icon={<Users />} label="Ocupados" value={apartamentos.filter(a => a.estado === 'Habitado').length} color="bg-emerald-50 text-emerald-600" />
          <StatCard icon={<Layers />} label="Pisos" value={new Set(apartamentos.map(a => a.piso)).size} color="bg-orange-50 text-orange-600" />
        </div>

        {/* BUSCADOR */}
        <div className="relative max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={18} />
          <input 
            type="text"
            placeholder="Buscar unidad (ej: 101)..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* LISTADO O SKELETON */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 animate-pulse">
            {[...Array(10)].map((_, i) => <div key={i} className="h-40 bg-slate-200 rounded-[2.5rem]"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredAptos.map((apto) => (
              <div key={apto.id} className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${apto.estado === 'Habitado' ? 'bg-emerald-500' : 'bg-blue-400'}`}></div>
                <h4 className="text-3xl font-black text-slate-800 tracking-tighter">{apto.unidad}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Piso {apto.piso || '-'}</p>
                <div className={`mt-4 inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase ${apto.estado === 'Habitado' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                  {apto.estado || 'Disponible'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredAptos.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <Building className="mx-auto text-slate-200 mb-4" size={48} />
            <h3 className="font-black text-slate-800">No hay unidades</h3>
            <p className="text-slate-400 text-sm">Empieza agregando la primera unidad de este edificio.</p>
          </div>
        )}
      </div>

      {/* MODAL CON RECARGA FORZADA */}
      {isModalOpen && (
        <InmuebleModal 
          edificio={edificio} 
          onClose={() => setIsModalOpen(false)} 
          onSaved={() => {
            setIsModalOpen(false);
            // Pequeño respiro para que Firebase actualice sus índices
            setTimeout(() => loadAptos(), 600);
          }} 
        />
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4 shadow-sm">
    <div className={`p-4 rounded-2xl ${color}`}>{icon}</div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-slate-800">{value}</p>
    </div>
  </div>
);

export default DetallesEdificio;