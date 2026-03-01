import React, { useEffect, useState } from 'react';
import { 
  Plus, Pencil, Trash2, ChevronLeft, ChevronRight, 
  Search, Filter, Building2, BedDouble, Bath, 
  Maximize2, MoreVertical, ArrowUpDown, Calendar,
  Tag, Download
} from 'lucide-react';
import { getInmuebles, deleteInmueble } from '../services/inmuebles.service';
import { getEdificios } from '../services/edificios.services';
import { alertSuccess, alertConfirm } from '../components/Alert';
import InmuebleModal from '../components/InmuebleModal';

const ITEMS_PER_PAGE = 12;

const InmueblesPage = () => {
  const [inmuebles, setInmuebles] = useState([]);
  const [edificios, setEdificios] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEdificio, setFilterEdificio] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [inmueblesData, edificiosData] = await Promise.all([
        getInmuebles(),
        getEdificios()
      ]);
      setInmuebles(Array.isArray(inmueblesData) ? inmueblesData : []);
      setEdificios(Array.isArray(edificiosData) ? edificiosData : []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id) => {
    const ok = await alertConfirm('Confirmar acción', '¿Eliminar permanentemente este inmueble?');
    if (ok) {
      try {
        await deleteInmueble(id);
        alertSuccess('Registro eliminado', 'La base de datos ha sido actualizada.');
        loadData();
      } catch (error) { console.error(error); }
    }
  };

  const filtered = inmuebles.filter(i => {
    const matchesSearch = i?.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          i?.barrio?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEdificio = filterEdificio === "" || i?.edificioId === filterEdificio;
    return matchesSearch && matchesEdificio;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-10 min-h-screen bg-[#fafafa]">
      
      {/* 🟢 HEADER DE GESTIÓN */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventario de Inmuebles</h1>
          <p className="text-sm text-slate-500 font-medium">Panel de administración y control de activos.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">
            <Download size={16} /> Exportar
          </button>
          <button 
            onClick={() => { setSelected(null); setOpen(true); }}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 shadow-sm transition-all"
          >
            <Plus size={18} /> Nuevo Inmueble
          </button>
        </div>
      </div>

      {/* 🔍 ÁREA DE FILTROS */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all">
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
            <input 
              placeholder="Buscar por ID, título o ubicación..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:border-slate-300 rounded-lg text-sm transition-all outline-none"
              value={searchTerm} 
              onChange={(e) => {setSearchTerm(e.target.value); setPage(1);}}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={filterEdificio}
                onChange={(e) => {setFilterEdificio(e.target.value); setPage(1);}}
                className="pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 outline-none hover:border-slate-400 appearance-none cursor-pointer"
              >
                <option value="">Todas las Copropiedades</option>
                {edificios.map(ed => <option key={ed.id} value={ed.id}>{ed.nombre}</option>)}
              </select>
            </div>
            <button className="p-2.5 text-slate-400 border border-slate-200 rounded-lg hover:bg-slate-50">
                <Filter size={18} />
            </button>
          </div>
        </div>

        {/* 📊 TABLA PROFESIONAL (SIN IMÁGENES) */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] text-left">Título y Ubicación</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] text-center">Hab.</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] text-center">Baños</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] text-center">Área (m²)</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] text-center">Estado</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] text-right">Precio Unitario</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {currentItems.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-all group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 line-clamp-1">{item.titulo}</span>
                      <span className="text-[11px] text-slate-500 font-medium mt-0.5">{item.barrio} {item.nombreEdificio ? `· ${item.nombreEdificio}` : ''}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-xs font-semibold text-slate-600">{item.habitaciones}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-xs font-semibold text-slate-600">{item.baños}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-xs font-mono font-medium text-slate-500">{item.area} m²</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      item.estado === 'Disponible' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.estado}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right font-mono text-sm font-bold text-slate-900">
                    ${Number(item.precio).toLocaleString()}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => { setSelected(item); setOpen(true); }}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🧭 PAGINACIÓN TIPO FOOTER */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500 italic">
            Mostrando registros del {(page - 1) * ITEMS_PER_PAGE + 1} al {Math.min(page * ITEMS_PER_PAGE, filtered.length)}
          </p>
          <div className="flex items-center gap-1.5">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="p-2 border border-slate-200 rounded-lg disabled:opacity-20 hover:bg-white transition-all text-slate-600 shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-1 px-2">
                {[...Array(totalPages)].map((_, i) => (
                    <button 
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`w-8 h-8 text-xs font-bold rounded-lg transition-all ${page === i + 1 ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-200'}`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)}
              className="p-2 border border-slate-200 rounded-lg disabled:opacity-20 hover:bg-white transition-all text-slate-600 shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {open && (
        <InmuebleModal 
          inmueble={selected} 
          onClose={() => { setOpen(false); setSelected(null); }} 
          onSaved={loadData} 
        />
      )}
    </div>
  );
};

export default InmueblesPage;