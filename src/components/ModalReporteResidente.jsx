import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../api/firebaseConfig";
import { 
  X, Send, Home, Loader2, AlertTriangle, 
  MessageSquareQuote, ChevronDown, Phone 
} from "lucide-react";
import { alertError, alertSuccess } from "./Alert";

const ModalReporteResidente = ({ open, onClose, user }) => {
  const [inmuebles, setInmuebles] = useState([]);
  const [inmuebleSeleccionado, setInmuebleSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [cargando, setCargando] = useState(true);

  /* =============================================
     1. CARGA DE INMUEBLES DEL EDIFICIO
  ============================================= */
  useEffect(() => {
    if (!open || !user?.edificioId) return;

    // Traemos los inmuebles asociados al edificio del usuario
    const q = query(
      collection(db, 'inmuebles'),
      where('edificioId', '==', String(user.edificioId))
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const lista = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Normalizamos el identificador (Apto/Unidad)
            identificador: data.nombreInmueble || data.unidad || data.apartamento || "S/N",
            // Normalizamos el teléfono del inmueble
            telefonoContacto: data.telefono || data.celular || data.telefonoPropietario || "No registrado"
          };
        });

        // Excluimos al usuario actual de la lista de posibles reportados
        const miIdentificador = user.unidad || user.nombreInmueble || "";
        const listaFiltrada = lista.filter(inm => 
          inm.identificador.toString().toLowerCase() !== miIdentificador.toString().toLowerCase()
        );
        
        // Orden numérico ascendente
        const listaOrdenada = listaFiltrada.sort((a, b) => 
          a.identificador.toString().localeCompare(b.identificador.toString(), undefined, { numeric: true })
        );

        setInmuebles(listaOrdenada);
        setCargando(false);
      } catch (err) {
        console.error("Error cargando inmuebles:", err);
        setCargando(false);
      }
    });

    return () => unsubscribe();
  }, [open, user]);

  /* =============================================
     2. LÓGICA DE ENVÍO AL ADMIN
  ============================================= */
  const handleEnviar = async () => {
    if (!inmuebleSeleccionado || !mensaje.trim()) {
      alertError("Atención", "Selecciona una unidad y describe la situación.");
      return;
    }

    try {
      setLoading(true);

      // Enviamos el reporte con toda la metadata interna para el admin
      await addDoc(collection(db, "mensajes"), {
        edificioId: user.edificioId,
        usuarioId: user.uid,
        usuarioNombre: user.nombreApellido || "Residente",
        
        // DATOS DEL INFRACTOR (A quien reportan)
        apto: inmuebleSeleccionado.identificador,
        telefonoDestino: inmuebleSeleccionado.telefonoContacto,
        
        // DATOS DEL DENUNCIANTE (Quien reporta)
        aptoOrigen: user.unidad || "N/A",
        telefonoOrigen: user.telefono || user.celular || "No registrado",
        
        mensaje: mensaje,
        status: "pendiente",
        tipo: "reporte",
        fecha: serverTimestamp(),
        numeroReporte: `REP-${Math.floor(1000 + Math.random() * 9000)}`
      });

      alertSuccess("Reporte Enviado", `Administración ha recibido el reporte contra el inmueble ${inmuebleSeleccionado.identificador}`);
      
      // Limpiar y cerrar
      setMensaje("");
      setInmuebleSeleccionado(null);
      onClose();
    } catch (error) {
      console.error("Error Firebase:", error);
      alertError("Error", "No se pudo procesar el reporte. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay Blur */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* Card Modal */}
      <div className="relative bg-white w-full max-w-[500px] rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
        
        {/* Header con gradiente sutil */}
        <div className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100/80 relative overflow-hidden">
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
                <AlertTriangle size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Nuevo Reporte</h2>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.2em] mt-1">
                  Incidencia de Convivencia
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body del Formulario */}
        <div className="p-8 sm:p-10 space-y-8">
          
          {/* Selector de Inmueble */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
              <Home size={14} className="text-amber-500" /> Unidad a reportar
            </label>
            <div className="relative group">
              <select
                value={inmuebleSeleccionado?.id || ""}
                onChange={(e) => {
                  const item = inmuebles.find(i => i.id === e.target.value);
                  setInmuebleSeleccionado(item);
                }}
                disabled={cargando}
                className="w-full pl-6 pr-12 py-5 bg-slate-50 border-2 border-slate-50 rounded-[2rem] text-sm font-bold text-slate-700 focus:bg-white focus:border-amber-400 focus:ring-[8px] focus:ring-amber-500/10 outline-none transition-all appearance-none cursor-pointer shadow-inner"
              >
                {cargando ? (
                  <option>Cargando lista de vecinos...</option>
                ) : (
                  <>
                    <option value="">Seleccionar unidad...</option>
                    {inmuebles.map(inm => (
                      <option key={inm.id} value={inm.id}>
                        🏠 Inmueble {inm.identificador}
                      </option>
                    ))}
                  </>
                )}
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-amber-500 transition-colors" size={20} />
            </div>
            
            {/* Visualización del contacto (Opcional, para confirmar que existe) */}
            {inmuebleSeleccionado && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-bold animate-in slide-in-from-top-2">
                <Phone size={12} /> Contacto vinculado correctamente
              </div>
            )}
          </div>

          {/* Área de Mensaje */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
              <MessageSquareQuote size={14} className="text-amber-500" /> ¿Qué está sucediendo?
            </label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows="4"
              placeholder="Describe detalladamente la situación para que el administrador pueda intervenir..."
              className="w-full p-7 bg-slate-50 border-2 border-slate-50 rounded-[2.5rem] text-sm font-medium text-slate-700 focus:bg-white focus:border-amber-400 focus:ring-[8px] focus:ring-amber-500/10 outline-none transition-all resize-none shadow-inner"
            />
          </div>

          {/* Botón de Acción */}
          <button
            onClick={handleEnviar}
            disabled={loading || !mensaje.trim() || !inmuebleSeleccionado}
            className={`group w-full py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300
              ${loading || !mensaje.trim() || !inmuebleSeleccionado 
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none' 
                : 'bg-slate-900 text-white hover:bg-amber-500 hover:shadow-xl hover:shadow-amber-200 active:scale-95'
              }`}
          >
            {loading ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              <>
                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                <span>Firmar y Enviar</span>
              </>
            )}
          </button>
        </div>

        {/* Footer Legal/Sutil */}
        <div className="p-6 bg-slate-50/50 text-center border-t border-slate-100">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Los datos de contacto se adjuntan automáticamente
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalReporteResidente;