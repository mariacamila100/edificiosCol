import React, { useState, useEffect } from 'react';
import { 
  Droplets, Zap, Flame, Search, 
  ChevronLeft, ChevronRight, TrendingUp, Calendar 
} from 'lucide-react';
import { getConsumosResidente } from '../services/consumos.service';

const ITEMS_PER_PAGE = 5;

const ConsumosResidente = ({ user }) => {
  const [consumos, setConsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchConsumos = async () => {
      if (user?.edificioId && user?.unidad) {
        setLoading(true);
        const data = await getConsumosResidente(user.edificioId, user.unidad);
        setConsumos(data);
        setLoading(false);
      }
    };
    fetchConsumos();
  }, [user?.edificioId, user?.unidad]);

  // Filtro de búsqueda local (por mes o tipo de servicio)
  const filteredConsumos = consumos.filter(c => {
    const busqueda = searchTerm.toLowerCase();
    return c.tipo?.toLowerCase().includes(busqueda) || c.mes?.toLowerCase().includes(busqueda);
  });

  // Paginación
  const totalPages = Math.ceil(filteredConsumos.length / ITEMS_PER_PAGE);
  const currentItems = filteredConsumos.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fadeIn">
      
      {/* HEADER AL ESTILO ADMIN */}
      <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-100/70 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            Mi Historial de Consumos
          </h3>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Unidad {user?.unidad}</p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Buscar por mes o servicio..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* TABLA ESTILO ADMIN */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-bold tracking-tighter">Cargando tus lecturas...</p>
          </div>
        ) : filteredConsumos.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <Calendar className="text-slate-200" size={48} />
            <p className="text-slate-400 text-sm italic font-medium">No se encontraron registros de consumo.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/60 border-b border-slate-100">
              <tr className="text-[11px] text-slate-500 uppercase tracking-wide">
                <th className="px-8 py-4 font-semibold">Servicio</th>
                <th className="px-8 py-4 font-semibold">Mes de Facturación</th>
                <th className="px-8 py-4 font-semibold">Lectura Registrada</th>
                <th className="px-8 py-4 font-semibold">Valor a Pagar</th>
                <th className="px-8 py-4 text-center font-semibold">Estado</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white/40">
              {currentItems.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition duration-200">
                  <td className="px-8 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 w-fit shadow-sm ${
                      c.tipo === 'agua' ? 'bg-blue-100 text-blue-600' : 
                      c.tipo === 'electricidad' ? 'bg-amber-100 text-amber-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {c.tipo === 'agua' ? <Droplets size={14}/> : c.tipo === 'electricidad' ? <Zap size={14}/> : <Flame size={14}/>}
                      {c.tipo}
                    </span>
                  </td>

                  <td className="px-8 py-4 font-bold text-slate-700 uppercase text-xs">
                    {c.mes}
                  </td>

                  <td className="px-8 py-4">
                    <span className="font-black text-slate-600">{c.lectura}</span>
                    <span className="text-[10px] text-slate-400 ml-1 font-bold">m³ / kWh</span>
                  </td>

                  <td className="px-8 py-4 font-black text-slate-800 text-base">
                    ${Number(c.valor).toLocaleString()}
                  </td>

                  <td className="px-8 py-4 text-center">
                    <button className="text-[10px] font-black bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition shadow-sm uppercase tracking-tighter">
                      Ver Recibo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* FOOTER CON PAGINACIÓN */}
      <div className="p-4 bg-slate-50/60 flex justify-between items-center border-t border-slate-100">
        <span className="text-[11px] text-slate-400 font-bold uppercase ml-4">
          {filteredConsumos.length} registros encontrados
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-2 mr-4">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)} 
              className="p-2 hover:bg-white rounded-lg disabled:opacity-30 border border-transparent hover:border-slate-200 transition bg-white shadow-sm"
            >
              <ChevronLeft size={16} className="text-slate-600" />
            </button>
            <span className="text-xs font-black text-slate-600 px-2">
              {page} / {totalPages}
            </span>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)} 
              className="p-2 hover:bg-white rounded-lg disabled:opacity-30 border border-transparent hover:border-slate-200 transition bg-white shadow-sm"
            >
              <ChevronRight size={16} className="text-slate-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumosResidente;