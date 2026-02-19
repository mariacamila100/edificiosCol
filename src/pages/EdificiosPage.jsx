import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, MapPin, Pencil, Trash2, ChevronLeft, 
  ChevronRight, Search, Building, Eye 
} from 'lucide-react';
import { getEdificios, inactivateEdificio } from '../services/edificios.services';
import { alertSuccess, alertConfirm } from '../components/Alert';
import EdificioModal from '../components/EdificioModal';
import DetallesEdificio from './DetallesEdificio';
import InmuebleModal from '../components/InmuebleModal';

const ITEMS_PER_PAGE = 6;

const EdificiosPage = () => {
  const [edificios, setEdificios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // MODALES INDEPENDIENTES
  const [openModalEdificio, setOpenModalEdificio] = useState(false);
  const [openModalUnidad, setOpenModalUnidad] = useState(false);
  
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [viewDetails, setViewDetails] = useState(false);
  const [edificioADetallar, setEdificioADetallar] = useState(null);

  const loadEdificios = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEdificios();
      setEdificios(data);
    } catch (error) {
      console.error("Error al cargar edificios:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    loadEdificios(); 
  }, [loadEdificios]);

  const handleDelete = async (id) => {
    const ok = await alertConfirm('¿Inactivar edificio?', 'Esta acción restringirá el acceso a la gestión de este edificio.');
    if (ok) {
      await inactivateEdificio(id);
      alertSuccess('Actualizado', 'El edificio ha sido inactivado.');
      loadEdificios();
    }
  };

  const handleVerDetalles = (edi) => {
    setEdificioADetallar(edi);
    setViewDetails(true);
  };

  const filteredEdificios = edificios.filter(edi => {
    const nombre = edi.nombre?.toLowerCase() || "";
    const ciudad = edi.ciudad?.toLowerCase() || "";
    const busqueda = searchTerm.toLowerCase();
    return nombre.includes(busqueda) || ciudad.includes(busqueda);
  });

  const totalPages = Math.ceil(filteredEdificios.length / ITEMS_PER_PAGE);
  const currentItems = filteredEdificios.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // --- VISTA DE DETALLES (CORREGIDA) ---
  if (viewDetails) {
    return (
      <DetallesEdificio 
        edificio={edificioADetallar} 
        onBack={() => setViewDetails(false)} 
        // No manejamos el modal de unidad aquí si DetallesEdificio ya lo tiene adentro
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-100">
            <Building size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Copropiedades</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{edificios.length} Registros totales</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Buscar propiedad..."
              className="w-full md:w-72 pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
          <button
            onClick={() => { 
              setSelected(null); 
              setOpenModalEdificio(true); // Solo abre el modal de edificio
            }}
            className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl text-sm font-black flex gap-2 transition-all items-center justify-center shadow-xl shadow-slate-200 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} /> Nuevo Edificio
          </button>
        </div>
      </div>

      {/* TABLA DE EDIFICIOS */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="px-8 py-5">Información del Edificio</th>
                <th className="px-8 py-5">Ubicación</th>
                <th className="px-8 py-5">Estado</th>
                <th className="px-8 py-5 text-center">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="4" className="px-8 py-6"><div className="h-10 bg-slate-100 rounded-xl w-full"></div></td>
                    </tr>
                  ))
              ) : currentItems.length > 0 ? (
                currentItems.map((edi) => (
                  <tr key={edi.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-700 text-base group-hover:text-blue-600 transition-colors">{edi.nombre}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">ID: {edi.id?.slice(0,8)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                        <MapPin size={16} className="text-blue-500" />
                        {edi.ciudad || 'No definida'}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                        edi.estado === 'Inactivo' 
                        ? 'bg-rose-50 text-rose-600 border-rose-100' 
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {edi.estado || 'Activo'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center gap-2">
                        <ActionButton 
                          icon={<Eye size={18} />} 
                          label="Ver unidades"
                          color="text-emerald-600 hover:bg-emerald-50"
                          onClick={() => handleVerDetalles(edi)} 
                        />
                        <ActionButton 
                          icon={<Pencil size={18} />} 
                          label="Editar"
                          color="text-blue-600 hover:bg-blue-50"
                          onClick={() => { setSelected(edi); setOpenModalEdificio(true); }} 
                        />
                        <ActionButton 
                          icon={<Trash2 size={18} />} 
                          label="Inactivar"
                          color="text-rose-500 hover:bg-rose-50"
                          onClick={() => handleDelete(edi.id)} 
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-24 text-center">
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-slate-50 rounded-full text-slate-200 mb-4">
                         <Building size={48} />
                      </div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No se encontraron resultados</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
            Página {page} de {totalPages || 1}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2.5 bg-white hover:bg-slate-100 rounded-xl disabled:opacity-30 border border-slate-200 transition-all"><ChevronLeft size={18} /></button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-2.5 bg-white hover:bg-slate-100 rounded-xl disabled:opacity-30 border border-slate-200 transition-all"><ChevronRight size={18} /></button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL EDIFICIO (Solo se abre con Nuevo Edificio o Editar) */}
      {openModalEdificio && createPortal(
        <EdificioModal 
          edificio={selected} 
          onClose={() => setOpenModalEdificio(false)} 
          onSaved={loadEdificios} 
        />,
        document.body
      )}
    </div>
  );
};

const ActionButton = ({ icon, onClick, color, label }) => (
  <button onClick={onClick} title={label} className={`p-2.5 rounded-xl transition-all duration-200 border border-transparent hover:border-current/10 ${color}`}>
    {icon}
  </button>
);

export default EdificiosPage;