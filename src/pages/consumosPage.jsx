import React, { useState, useEffect } from 'react';
import { 
  Plus, Droplets, Zap, Flame, Search, ChevronLeft, ChevronRight, 
  Pencil, Trash2, Filter, Activity, TrendingUp, AlertCircle, Loader2 
} from 'lucide-react';
import { getConsumos, eliminarConsumo } from '../services/consumos.service';
import ConsumoModal from '../components/ConsumoModal';
import { alertSuccess, alertConfirm } from '../components/Alert';

const ITEMS_PER_PAGE = 6;

const ConsumosPage = ({ edificios = [] }) => {
  const [consumos, setConsumos] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEdificio, setFilterEdificio] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadConsumos = async () => {
    try {
      setLoading(true);
      const data = await getConsumos();
      setConsumos(data || []);
    } catch (error) {
      console.error("Error cargando consumos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadConsumos(); 
  }, []);

  const handleDelete = async (id) => {
    const ok = await alertConfirm('¿Eliminar registro?', 'Esta acción borrará el consumo permanentemente');
    if (ok) {
      await eliminarConsumo(id);
      alertSuccess('Eliminado', 'El registro ha sido borrado');
      loadConsumos();
    }
  };

  const getNombreEdificio = (id) => {
    if (!edificios) return 'No asignado';
    const edificio = edificios.find(e => e.id === id);
    return edificio ? edificio.nombre : 'No asignado';
  };

  const filteredConsumos = consumos.filter(c => {
    const nombreEdi = getNombreEdificio(c.edificioId).toLowerCase();
    const unidad = (c.unidad || "").toLowerCase();
    const busqueda = searchTerm.toLowerCase();
    const pasaFiltroEdificio = filterEdificio === "all" || c.edificioId === filterEdificio;
    const pasaBuscador = nombreEdi.includes(busqueda) || unidad.includes(busqueda);
    return pasaFiltroEdificio && pasaBuscador;
  });

  // Cálculos
  const totalValor = filteredConsumos.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
  const totalPages = Math.ceil(filteredConsumos.length / ITEMS_PER_PAGE) || 1;
  
  // Ajuste de página segura
  const safePage = page > totalPages ? 1 : page;
  const currentItems = filteredConsumos.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Cargando Consumos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* DASHBOARD RÁPIDO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Registros</p>
            <p className="text-xl font-bold text-slate-800">{filteredConsumos.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Filtrado</p>
            <p className="text-xl font-bold text-slate-800">${totalValor.toLocaleString()}</p>
          </div>
        </div>
        <button
          onClick={() => { setSelected(null); setOpen(true); }}
          className="bg-blue-600 hover:bg-slate-900 p-4 rounded-2xl shadow-lg shadow-blue-100 text-white font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 transition-all"
        >
          <Plus size={20} /> Nuevo Registro
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        
        {/* BARRA DE BÚSQUEDA Y FILTROS */}
        <div className="p-6 border-b border-slate-50 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="font-black text-slate-800 text-xs uppercase tracking-[0.2em]">Control Operativo</h3>
            
            <div className="flex flex-wrap w-full md:w-auto gap-2">
              <div className="relative flex-1 md:w-56">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <select 
                  value={filterEdificio}
                  onChange={(e) => { setFilterEdificio(e.target.value); setPage(1); }}
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="all">Todos los edificios</option>
                  {edificios.map(ed => (
                    <option key={ed.id} value={ed.id}>{ed.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text"
                  placeholder="Buscar unidad..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* TABLA */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                <th className="px-8 py-4 text-left font-black">Ubicación</th>
                <th className="px-8 py-4 text-left font-black">Servicio</th>
                <th className="px-8 py-4 text-left font-black">Lectura</th>
                <th className="px-8 py-4 text-left font-black">Valor</th>
                <th className="px-8 py-4 text-center font-black">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentItems.length > 0 ? (
                currentItems.map((c) => (
                  <tr key={c.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 text-sm">{getNombreEdificio(c.edificioId)}</span>
                        <span className="text-[10px] text-blue-600 font-black uppercase tracking-tighter">Unidad {c.unidad}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-2 w-fit border ${
                        c.tipo === 'agua' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                        c.tipo === 'electricidad' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                      }`}>
                        {c.tipo === 'agua' ? <Droplets size={12}/> : c.tipo === 'electricidad' ? <Zap size={12}/> : <Flame size={12}/>}
                        {c.tipo}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">{c.lectura}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{c.mes}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-black text-slate-800">
                      ${Number(c.valor || 0).toLocaleString()}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => { setSelected(c); setOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <AlertCircle className="mx-auto text-slate-200 mb-2" size={40} />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Sin datos registrados</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        <div className="p-6 bg-slate-50/50 flex justify-between items-center border-t border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             Pág {safePage} de {totalPages}
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button 
                disabled={safePage === 1} 
                onClick={() => setPage(p => p - 1)} 
                className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                disabled={safePage === totalPages} 
                onClick={() => setPage(p => p + 1)} 
                className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {open && (
        <ConsumoModal 
          edificios={edificios} 
          consumo={selected} 
          onClose={() => { setOpen(false); setSelected(null); }} 
          onSaved={loadConsumos} 
        />
      )}
    </div>
  );
};

export default ConsumosPage;