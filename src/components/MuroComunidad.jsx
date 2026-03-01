import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, Send, Trash2, Building2, Clock, 
  CheckCircle2, Phone, User, ChevronRight,
  ShieldAlert, Layout, Eye, EyeOff // <-- Asegurados aquí
} from 'lucide-react';
import { getMensajesEnVivo, responderMensaje, eliminarMensaje } from '../services/mensajes.service';
import ConfirmModal from "./ConfirmModal";
import { alertSuccess } from './Alert';

const MuroComunidad = ({ edificios = [] }) => {
  const [mensajes, setMensajes] = useState([]);
  const [filtroEdificio, setFiltroEdificio] = useState('');
  const [showResolved, setShowResolved] = useState(false);
  const [respuestaTexto, setRespuestaTexto] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [mensajeAEliminar, setMensajeAEliminar] = useState(null);

  useEffect(() => {
    if (edificios?.length > 0 && !filtroEdificio) {
      setFiltroEdificio(edificios[0].id);
    }
  }, [edificios, filtroEdificio]);

  useEffect(() => {
    if (!filtroEdificio) return;
    const unsubscribe = getMensajesEnVivo(filtroEdificio, (data) => {
      setMensajes(data || []);
    });
    return () => unsubscribe && unsubscribe();
  }, [filtroEdificio]);

  // FILTRO CORREGIDO CON VALIDACIÓN DE NULOS
  const mensajesFiltrados = useMemo(() => {
    if (!mensajes) return [];
    return showResolved 
      ? mensajes 
      : mensajes.filter(m => m.status !== 'resuelto' && !m.respuesta);
  }, [mensajes, showResolved]);

  const handleResponder = async (id) => {
    const texto = respuestaTexto[id];
    if (!texto?.trim()) return;
    try {
      await responderMensaje(id, texto);
      alertSuccess('Sistema', 'Incidencia marcada como resuelta.');
      setRespuestaTexto(prev => ({ ...prev, [id]: '' }));
    } catch (error) {
      console.error("Error al responder:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-80 bg-white border-r border-slate-200 hidden xl:flex flex-col sticky top-0 h-screen shadow-sm">
        <div className="p-8 flex-grow">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <ShieldAlert size={20} />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-slate-800">AdminPanel</h1>
          </div>

          <div className="space-y-8">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Propiedad</label>
              <div className="relative group">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  value={filtroEdificio}
                  onChange={(e) => setFiltroEdificio(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                >
                  {edificios.map(ed => <option key={ed.id} value={ed.id}>{ed.nombre}</option>)}
                </select>
              </div>
            </div>

            {/* TOGGLE FILTRO */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Estado de vista</label>
              <div 
                onClick={() => setShowResolved(!showResolved)}
                className="cursor-pointer bg-slate-100 p-1 rounded-2xl flex items-center relative border border-slate-200"
              >
                <div className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase z-10 transition-colors ${!showResolved ? 'text-indigo-600' : 'text-slate-500'}`}>
                  <EyeOff size={14} /> PENDIENTES
                </div>
                <div className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase z-10 transition-colors ${showResolved ? 'text-indigo-600' : 'text-slate-500'}`}>
                  <Eye size={14} /> TODOS
                </div>
                <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm border border-slate-200 transition-all duration-300 transform ${showResolved ? 'translate-x-full' : 'translate-x-0'}`} />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* --- CONTENIDO --- */}
      <main className="flex-1 p-6 lg:p-12 max-w-6xl mx-auto w-full">
        <header className="mb-12">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Incidencias</h2>
          <p className="text-slate-500 font-medium italic">Monitor de convivencia en tiempo real.</p>
        </header>

        <div className="grid gap-6">
          {mensajesFiltrados.map((m) => {
            const atendido = m.respuesta && m.respuesta.trim() !== '';
            
            return (
              <div key={m.id} className="relative transition-all duration-500">
                <div className={`bg-white rounded-[2rem] overflow-hidden border transition-all duration-300 ${
                  atendido ? 'border-emerald-200 bg-[#F0FDF4]' : 'border-slate-200 shadow-xl shadow-slate-200/40 hover:border-slate-300'
                }`}>
                  
                  <div className="flex flex-col lg:flex-row">
                    {/* IZQUIERDA: REPORTE */}
                    <div className="flex-[1.2] p-8 lg:border-r border-slate-100">
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-black text-lg transition-colors ${
                          atendido ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'
                        }`}>
                          {m.apto || m.unidad}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 uppercase flex items-center gap-2">
                            {m.usuarioNombre || 'Anónimo'}
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Clock size={12} /> {m.fecha?.toDate ? m.fecha.toDate().toLocaleTimeString() : 'Reciente'}
                          </span>
                        </div>
                      </div>

                      <div className={`p-5 rounded-2xl border mb-6 ${atendido ? 'bg-white/80 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                        <p className={`text-sm font-medium leading-relaxed italic ${atendido ? 'text-emerald-900' : 'text-slate-600'}`}>
                          "{m.mensaje}"
                        </p>
                      </div>

                      <a href={`https://wa.me/${m.telefonoOrigen}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase hover:underline">
                        <User size={12} /> Contactar Reportante
                      </a>
                    </div>

                    {/* DERECHA: ACCIÓN */}
                    <div className={`flex-1 p-8 flex flex-col justify-between ${atendido ? 'bg-emerald-50/30' : 'bg-slate-50/30'}`}>
                      <div className="space-y-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Protocolo de acción</span>

                        {/* WHATSAPP DEL REPORTADO (SIEMPRE VISIBLE) */}
                        <a 
                          href={`https://wa.me/${m.telefonoDestino}`} 
                          target="_blank" rel="noreferrer"
                          className={`w-full flex items-center justify-between px-5 py-3.5 border rounded-2xl text-[11px] font-black transition-all ${
                            atendido 
                            ? 'bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white shadow-sm' 
                            : 'bg-white border-slate-200 text-rose-500 hover:bg-rose-500 hover:text-white shadow-sm'
                          }`}
                        >
                          <span className="flex items-center gap-3"><Phone size={14} /> WSP REPORTADO</span>
                          <ChevronRight size={14} />
                        </a>

                        {atendido ? (
                          <div className="p-5 bg-white rounded-2xl border-l-4 border-emerald-400 shadow-sm border-emerald-100">
                            <p className="text-[9px] font-black text-emerald-500 uppercase mb-1">Resolución:</p>
                            <p className="text-sm font-bold text-slate-700">{m.respuesta}</p>
                          </div>
                        ) : (
                          <div className="relative">
                            <textarea 
                              rows="2"
                              placeholder="Escribir resolución..."
                              value={respuestaTexto[m.id] || ''}
                              onChange={(e) => setRespuestaTexto({...respuestaTexto, [m.id]: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded-2xl p-4 pr-14 text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-300 outline-none transition-all resize-none shadow-inner"
                            />
                            <button onClick={() => handleResponder(m.id)} className="absolute right-3 bottom-3 p-3 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all">
                              <Send size={16} />
                            </button>
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={() => { setMensajeAEliminar(m.id); setModalOpen(true); }}
                        className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-300 hover:text-red-500 transition-colors uppercase"
                      >
                        <Trash2 size={12} /> Borrar registro
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={async () => {
          await eliminarMensaje(mensajeAEliminar);
          setModalOpen(false);
        }}
        mensaje="¿Seguro que desea eliminar este registro?"
      />
    </div>
  );
};

export default MuroComunidad;