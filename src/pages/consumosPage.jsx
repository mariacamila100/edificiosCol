import React, { useState, useEffect } from 'react';
import { Plus, Droplets, Zap, Flame, Search, ChevronLeft, ChevronRight, Pencil, Trash2, Filter } from 'lucide-react';
import { getConsumos, eliminarConsumo } from '../services/consumos.service';
import ConsumoModal from '../components/ConsumoModal';
import { alertSuccess, alertConfirm } from '../components/Alert';

const ITEMS_PER_PAGE = 5;

const ConsumosPage = ({ edificios }) => {
  const [consumos, setConsumos] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEdificio, setFilterEdificio] = useState("all");

  const loadConsumos = async () => {
    const data = await getConsumos();
    setConsumos(data);
  };

  useEffect(() => { loadConsumos(); }, []);

  const handleDelete = async (id) => {
    const ok = await alertConfirm('¿Eliminar registro?', 'Esta acción borrará el consumo permanentemente');
    if (ok) {
      await eliminarConsumo(id);
      alertSuccess('Eliminado', 'El registro ha sido borrado');
      loadConsumos();
    }
  };

  const getNombreEdificio = (id) => {
    const edificio = edificios.find(e => e.id === id);
    return edificio ? edificio.nombre : 'No asignado';
  };

  const filteredConsumos = consumos.filter(c => {
    const nombreEdi = getNombreEdificio(c.edificioId).toLowerCase();
    const unidad = c.unidad?.toLowerCase() || "";
    const busqueda = searchTerm.toLowerCase();
    const pasaFiltroEdificio = filterEdificio === "all" || c.edificioId === filterEdificio;
    const pasaBuscador = nombreEdi.includes(busqueda) || unidad.includes(busqueda);
    return pasaFiltroEdificio && pasaBuscador;
  });

  const totalPages = Math.ceil(filteredConsumos.length / ITEMS_PER_PAGE);
  const currentPage = page > totalPages ? 1 : page;
  const currentItems = filteredConsumos.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
      
      {/* HEADER */}
      <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-100/70">
        <h3 className="font-bold text-slate-800 text-lg">Control de Consumos</h3>

        <div className="flex flex-wrap w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              value={filterEdificio}
              onChange={(e) => { setFilterEdificio(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none cursor-pointer text-slate-600 font-medium shadow-sm"
            >
              <option value="all">Todos los edificios</option>
              {edificios.map(ed => (
                <option key={ed.id} value={ed.id}>{ed.nombre}</option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Buscar unidad o edificio..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
          <button
            onClick={() => { setSelected(null); setOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex gap-2 transition items-center shadow-md shadow-blue-200"
          >
            <Plus size={18} /> Nuevo Registro
          </button>
        </div>
      </div>

      {/* TABLE - Estilo exacto a Inmuebles */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/60 border-b border-slate-100">
            <tr className="text-[11px] text-slate-500 uppercase tracking-wide">
              <th className="px-8 py-4 text-left font-semibold">Edificio</th>
              <th className="px-8 py-4 text-left font-semibold">Unidad</th>
              <th className="px-8 py-4 text-left font-semibold">Servicio</th>
              <th className="px-8 py-4 text-left font-semibold">Lectura / Mes</th>
              <th className="px-8 py-4 text-left font-semibold">Valor</th>
              <th className="px-8 py-4 text-center font-semibold">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {currentItems.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/50 transition duration-200">
                <td className="px-8 py-4">
                   <span className="font-bold text-slate-700">{getNombreEdificio(c.edificioId)}</span>
                </td>
                
                <td className="px-8 py-4 text-slate-600 font-medium">
                  {c.unidad}
                </td>

                <td className="px-8 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 w-fit ${
                    c.tipo === 'agua' ? 'bg-blue-100 text-blue-600' : 
                    c.tipo === 'electricidad' ? 'bg-amber-100 text-amber-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {c.tipo === 'agua' ? <Droplets size={12}/> : c.tipo === 'electricidad' ? <Zap size={12}/> : <Flame size={12}/>}
                    {c.tipo}
                  </span>
                </td>

                <td className="px-8 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-700">{c.lectura}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{c.mes}</span>
                  </div>
                </td>

                <td className="px-8 py-4 font-bold text-slate-600">
                  ${Number(c.valor).toLocaleString()}
                </td>

                <td className="px-8 py-4 text-center">
                  <div className="flex justify-center gap-3">
                    <button 
                      onClick={() => { setSelected(c); setOpen(true); }} 
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(c.id)} 
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="p-4 bg-slate-50/60 flex justify-between items-center border-t border-slate-100">
        <span className="text-[11px] text-slate-400 font-medium ml-4">
          Mostrando {currentItems.length} de {filteredConsumos.length} resultados
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-2 mr-4">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setPage(p => p - 1)} 
              className="p-2 hover:bg-white rounded-lg disabled:opacity-30 border border-transparent hover:border-slate-200 transition"
            >
              <ChevronLeft size={16} className="text-slate-600" />
            </button>
            <span className="text-xs font-bold text-slate-600 px-2">
              {currentPage} / {totalPages}
            </span>
            <button 
              disabled={currentPage === totalPages} 
              onClick={() => setPage(p => p + 1)} 
              className="p-2 hover:bg-white rounded-lg disabled:opacity-30 border border-transparent hover:border-slate-200 transition"
            >
              <ChevronRight size={16} className="text-slate-600" />
            </button>
          </div>
        )}
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