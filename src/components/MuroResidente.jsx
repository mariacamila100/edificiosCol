import React, { useState, useEffect, useMemo } from 'react';
import { 
  collection, query, where, orderBy, 
  onSnapshot, doc, getDoc, deleteDoc 
} from 'firebase/firestore';
import { db } from '../api/firebaseConfig';
import { 
  MessageCircle, Check, History, EyeOff, X, 
  Clock, User, Trash2, AlertTriangle 
} from 'lucide-react';
import { alertError, alertSuccess } from './Alert'; // Asegúrate de tener estas alertas

const MuroResidente = ({ user, edificioId }) => {
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null);
  const [userCache, setUserCache] = useState({});

  /* ===============================
     CARGAR MENSAJES (Sincronizado)
  =============================== */
  useEffect(() => {
    if (!edificioId) return;

    const q = query(
      collection(db, 'mensajes'),
      where('edificioId', '==', edificioId),
      orderBy('fecha', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const docsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      const nuevosMensajes = await Promise.all(docsData.map(async (msg) => {
        let nombre = msg.usuarioNombre || "Residente";
        
        if (msg.usuarioId && !userCache[msg.usuarioId]) {
          try {
            const uSnap = await getDoc(doc(db, 'usuarios', msg.usuarioId));
            if (uSnap.exists()) {
              nombre = uSnap.data().nombreApellido || "Residente";
              setUserCache(prev => ({ ...prev, [msg.usuarioId]: nombre }));
            }
          } catch (e) { console.error(e); }
        } else if (msg.usuarioId) {
          nombre = userCache[msg.usuarioId];
        }

        return {
          ...msg,
          usuarioNombre: nombre,
          fechaLegible: msg.fecha?.toDate().toLocaleString([], { 
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
          })
        };
      }));

      setMensajes(nuevosMensajes);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [edificioId, userCache]);

  /* ===============================
     LÓGICA PARA ELIMINAR
  =============================== */
  const handleEliminar = async (e, mensajeId, autorId) => {
    e.stopPropagation(); // Evita que se abra el modal al hacer clic en borrar

    if (autorId !== user.uid) {
      alertError("Acceso denegado", "Solo puedes eliminar tus propios reportes.");
      return;
    }

    // Aquí podrías usar un modal de confirmación personalizado de tu Alert.js
    const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este reporte? Esta acción no se puede deshacer.");
    
    if (confirmar) {
      try {
        await deleteDoc(doc(db, 'mensajes', mensajeId));
        alertSuccess("Eliminado", "El reporte ha sido borrado correctamente.");
      } catch (error) {
        console.error(error);
        alertError("Error", "No se pudo eliminar el mensaje.");
      }
    }
  };

  const mensajesFiltrados = useMemo(() => {
    return showResolved ? mensajes : mensajes.filter(m => m.status !== 'resuelto');
  }, [mensajes, showResolved]);

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col h-[650px]">
      
      {/* HEADER */}
      <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <MessageCircle size={22} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Muro de Gestión</h3>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {mensajes.filter(m => m.status !== 'resuelto').length} Activos
            </p>
          </div>
        </div>

        <button 
          onClick={() => setShowResolved(!showResolved)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all border ${
            showResolved ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-white'
          }`}
        >
          {showResolved ? <EyeOff size={14} /> : <History size={14} />}
          {showResolved ? 'Ocultar Resueltos' : 'Ver Historial'}
        </button>
      </div>

      {/* LISTADO */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : mensajesFiltrados.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
            <Check size={32} className="text-emerald-500 mb-2" />
            <h4 className="text-slate-800 font-bold">Sin novedades</h4>
          </div>
        ) : (
          mensajesFiltrados.map((m) => (
            <div
              key={m.id}
              onClick={() => setMensajeSeleccionado(m)}
              className="group cursor-pointer bg-white rounded-[1.5rem] border border-slate-200/60 p-5 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${m.status === 'resuelto' ? 'bg-emerald-400' : 'bg-indigo-500'}`} />
              
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-black text-xs ${
                    m.status === 'resuelto' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {m.status === 'resuelto' ? <Check size={16} /> : m.usuarioNombre.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 leading-none mb-1">{m.usuarioNombre}</h4>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold uppercase">Apto {m.apto}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-[10px] text-slate-400 font-bold">{m.fechaLegible}</div>
                  
                  {/* BOTÓN ELIMINAR (Solo si es dueño del mensaje) */}
                  {m.usuarioId === user.uid && (
                    <button
                      onClick={(e) => handleEliminar(e, m.id, m.usuarioId)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar mi reporte"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm text-slate-600 line-clamp-2 pl-1">
                {m.mensaje}
              </p>

              {m.respuestaAdmin && (
                <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-emerald-600 bg-emerald-50/50 p-2 rounded-lg">
                  <Check size={14} /> Gestión completada
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* MODAL DETALLE */}
      {mensajeSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
            <div className={`p-8 ${mensajeSeleccionado.status === 'resuelto' ? 'bg-emerald-50' : 'bg-indigo-50'} flex justify-between items-center`}>
              <h3 className="text-2xl font-black text-slate-900">Unidad {mensajeSeleccionado.apto}</h3>
              <div className="flex gap-2">
                {/* Botón borrar también dentro del modal para conveniencia */}
                {mensajeSeleccionado.usuarioId === user.uid && (
                  <button 
                    onClick={(e) => {
                      handleEliminar(e, mensajeSeleccionado.id, mensajeSeleccionado.usuarioId);
                      setMensajeSeleccionado(null);
                    }}
                    className="h-10 w-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <button onClick={() => setMensajeSeleccionado(null)} className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:rotate-90 transition-transform text-slate-400">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <section>
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Descripción</div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-sm text-slate-700 italic">
                  "{mensajeSeleccionado.mensaje}"
                </div>
              </section>

              {mensajeSeleccionado.respuestaAdmin && (
                <section className="animate-in slide-in-from-top-4">
                  <div className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-3">Respuesta Admin</div>
                  <div className="bg-emerald-500 text-white p-5 rounded-2xl shadow-lg text-sm font-medium">
                    {mensajeSeleccionado.respuestaAdmin}
                  </div>
                </section>
              )}

              <button onClick={() => setMensajeSeleccionado(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all">
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuroResidente;