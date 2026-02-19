import { useEffect, useState, useMemo } from 'react';
import { 
  Plus, Pencil, Trash2, Home, ChevronLeft, 
  ChevronRight, Search, UserCheck, UserX, Layers 
} from 'lucide-react';
import { getUsuarios, toggleEstadoUsuario } from '../services/usuarios.service';
import { getEdificios } from '../services/edificios.services';
import { alertConfirm, alertSuccess } from '../components/Alert';
import UsuarioModal from '../components/UsuarioModal';

const ITEMS_PER_PAGE = 6;

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [edificios, setEdificios] = useState({});
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, edificiosData] = await Promise.all([getUsuarios(), getEdificios()]);
      const map = {};
      edificiosData.forEach(ed => { map[ed.id] = ed.nombre; });
      setEdificios(map);
      setUsuarios(usersData);
    } catch (e) { 
      console.error("Error loadData:", e); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleToggleEstado = async (user) => {
    const estadoTxt = user.estado ? 'inactivar' : 'activar';
    const ok = await alertConfirm(
      `¿Deseas ${estadoTxt} este usuario?`, 
      `Esta acción afectará el acceso de ${user.nombreApellido}`
    );
    if (ok) {
      await toggleEstadoUsuario(user.id, user.estado);
      alertSuccess('Completado', `Usuario ${user.estado ? 'inactivado' : 'activado'} con éxito`);
      loadData();
    }
  };

  // 🔹 Búsqueda optimizada con useMemo
  const filteredUsers = useMemo(() => {
    const busqueda = searchTerm.toLowerCase();
    return usuarios.filter(user => 
      user.nombreApellido?.toLowerCase().includes(busqueda) ||
      user.email?.toLowerCase().includes(busqueda) ||
      user.unidad?.toString().includes(busqueda) ||
      edificios[user.edificioId]?.toLowerCase().includes(busqueda)
    );
  }, [usuarios, searchTerm, edificios]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const currentItems = filteredUsers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-white animate-fadeIn">
      
      {/* HEADER */}
      <div className="p-8 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Directorio de Residentes</h3>
          <p className="text-slate-500 text-sm font-medium">Gestiona los accesos y ubicación de la copropiedad</p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Buscar por nombre, apto o edificio..."
              className="w-full lg:w-80 pl-12 pr-4 py-3 bg-slate-100/50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-500/20 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
          <button 
            onClick={() => { setSelected(null); setOpen(true); }}
            className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl text-sm font-black flex gap-2 transition-all items-center justify-center shadow-lg active:scale-95"
          >
            <Plus size={20} strokeWidth={3} /> Nuevo Residente
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto px-4">
        <table className="w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">
              <th className="px-6 py-4 text-left">Información Personal</th>
              <th className="px-6 py-4 text-left">Ubicación</th>
              <th className="px-6 py-4 text-left">Estado</th>
              <th className="px-6 py-4 text-center">Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y-0">
            {loading ? (
              // Skeleton Loader
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="4" className="px-6 py-8 bg-slate-50 rounded-2xl mb-2 h-20"></td>
                </tr>
              ))
            ) : currentItems.length > 0 ? (
              currentItems.map((user) => (
                <tr key={user.id} className="group hover:translate-x-1 transition-all duration-300">
                  <td className="px-6 py-4 bg-white group-hover:bg-blue-50/50 first:rounded-l-2xl last:rounded-r-2xl border-y border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-500 text-xs">
                        {user.nombreApellido?.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-black text-slate-700">{user.nombreApellido}</div>
                        <div className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 bg-white group-hover:bg-blue-50/50 border-y border-slate-50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Home size={14} className="text-blue-500" />
                        <span className="font-bold text-xs">{edificios[user.edificioId] || 'Sin asignar'}</span>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-black">APTO {user.unidad}</span>
                         {user.piso && (
                           <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                             <Layers size={10} /> PISO {user.piso}
                           </span>
                         )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 bg-white group-hover:bg-blue-50/50 border-y border-slate-50">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      user.estado ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.estado ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                      {user.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 bg-white group-hover:bg-blue-50/50 first:rounded-l-2xl last:rounded-r-2xl border-y border-slate-50 text-center">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => { setSelected(user); setOpen(true); }} 
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                        title="Editar Residente"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleToggleEstado(user)} 
                        className={`p-2.5 rounded-xl transition-all ${
                          user.estado 
                          ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-100' 
                          : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-100'
                        }`}
                        title={user.estado ? 'Inactivar' : 'Activar'}
                      >
                        {user.estado ? <UserX size={18} /> : <UserCheck size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-20 text-center">
                   <div className="flex flex-col items-center gap-2 opacity-40">
                      <Search size={40} />
                      <p className="font-black text-sm uppercase">No se encontraron residentes</p>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="p-6 bg-white border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em]">
          Total: <span className="text-slate-800">{filteredUsers.length}</span> residentes registrados
        </span>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)} 
              className="p-2.5 hover:bg-slate-100 rounded-xl disabled:opacity-20 transition-all border border-slate-100"
            >
              <ChevronLeft size={18} className="text-slate-600" />
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                    page === i + 1 ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-100 text-slate-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)} 
              className="p-2.5 hover:bg-slate-100 rounded-xl disabled:opacity-20 transition-all border border-slate-100"
            >
              <ChevronRight size={18} className="text-slate-600" />
            </button>
          </div>
        )}
      </div>

      {open && <UsuarioModal usuario={selected} onClose={() => setOpen(false)} onSaved={loadData} />}
    </div>
  );
};

export default UsuariosPage;