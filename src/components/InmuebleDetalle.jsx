import React, { useEffect } from 'react';
import { 
  X, Bed, Bath, Maximize, MapPin, Car, 
  MessageCircle, Star, Shield, TrendingUp,
  CheckCircle2, ArrowRight, Layers 
} from 'lucide-react';

const InmuebleDetalle = ({ inmueble, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  if (!inmueble) return null;

  // Lógica de color persistente: Naranja para Arriendo, Azul para Venta
  const esArriendo = inmueble.estado?.toLowerCase().includes('arriendo') || 
                     inmueble.estado?.toLowerCase().includes('renta');

  const contactarWhatsApp = () => {
    const mensaje = `¡Hola! Me encantó este inmueble en ${inmueble.estado || 'Venta'}: ${inmueble.titulo} en ${inmueble.barrio}. ¿Sigue disponible?`;
    window.open(`https://wa.me/573000000000?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-6xl md:h-[90vh] rounded-none md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in duration-300">
        
        {/* LADO IZQUIERDO (Visual) */}
        <div className="w-full md:w-[60%] relative h-[40vh] md:h-full bg-slate-100">
          <img 
            src={inmueble.foto || inmueble.fotos?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200'} 
            className="w-full h-full object-cover"
            alt={inmueble.titulo}
          />
          
          <div className="absolute top-8 left-8 flex flex-col gap-3">
            {/* TAG DINÁMICO: Azul para Venta, Naranja para Arriendo */}
            <div className={`${esArriendo ? 'bg-orange-500' : 'bg-blue-600'} text-white px-6 py-2 rounded-2xl flex items-center gap-2 shadow-xl shadow-black/20`}>
              <Star size={18} fill="currentColor" />
              <span className="font-black uppercase tracking-widest text-[11px]">
                {inmueble.estado || 'Venta'}
              </span>
            </div>
            <div className="bg-white/90 backdrop-blur-md text-slate-900 px-6 py-2 rounded-2xl flex items-center gap-2 shadow-lg">
              <Shield size={18} className={esArriendo ? "text-orange-500" : "text-blue-600"} />
              <span className="font-black uppercase tracking-widest text-[11px]">Verificado</span>
            </div>
          </div>

          {/* CAJA DE PRECIO DINÁMICA */}
          <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-[2.5rem] flex justify-between items-center text-white">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-1">
                {esArriendo ? 'Canon Mensual' : 'Precio de Venta'}
              </p>
              <h3 className="text-4xl font-black tracking-tighter">
                ${Number(inmueble.precio).toLocaleString('es-CO')}
                {esArriendo && <span className="text-xl ml-1 opacity-70">/ mes</span>}
              </h3>
            </div>
            <div className="hidden lg:block text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-1">Sector Valorizado</p>
              <p className="text-lg font-bold flex items-center justify-end gap-2 italic">
                {inmueble.barrio} <TrendingUp size={20} className={esArriendo ? "text-orange-400" : "text-blue-400"} />
              </p>
            </div>
          </div>
        </div>

        {/* LADO DERECHO (Información) */}
        <div className="w-full md:w-[40%] flex flex-col bg-white">
          <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
            
            <button onClick={onClose} className="absolute top-6 right-8 p-3 bg-slate-100 rounded-2xl hover:bg-rose-500 hover:text-white transition-all z-50">
              <X size={24} />
            </button>

            <div className="space-y-8">
              <div>
                <p className={`${esArriendo ? 'text-orange-500' : 'text-blue-600'} font-black text-[12px] uppercase tracking-[0.4em] mb-3`}>
                  {inmueble.nombreEdificio || 'Propiedad Exclusiva'}
                </p>
                <h2 className="text-4xl font-black text-slate-950 leading-[1.1] tracking-tighter">
                  {inmueble.titulo}
                </h2>
              </div>

              {/* Grid de especificaciones */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Bed />, text: `${inmueble.habitaciones} Alcobas`, label: 'Habitaciones' },
                  { icon: <Bath />, text: `${inmueble.baños} Baños`, label: 'Completos' },
                  { icon: <Maximize />, text: `${inmueble.area} m²`, label: 'Área Privada' },
                  { icon: <Layers />, text: `Piso ${inmueble.piso || 'N/A'}`, label: 'Ubicación' },
                  { icon: <Car />, text: inmueble.parqueadero ? 'Parqueadero' : 'Sin Garaje', label: 'Seguridad' }
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100 group hover:border-orange-200 transition-all">
                    <div className={`${esArriendo ? 'text-orange-500' : 'text-blue-600'} mb-2 group-hover:scale-110 transition-transform`}>{item.icon}</div>
                    <p className="font-black text-slate-900 text-[13px] leading-none mb-1">{item.text}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Sección de Info con color dinámico */}
              <div className={`${esArriendo ? 'bg-orange-50/50 border-orange-100' : 'bg-blue-50/50 border-blue-100'} border p-6 rounded-[2rem] space-y-3`}>
                <h4 className={`text-[11px] font-black ${esArriendo ? 'text-orange-900' : 'text-blue-900'} uppercase tracking-widest mb-2 flex items-center gap-2`}>
                  <CheckCircle2 size={16}/> Información de Interés
                </h4>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                  <div className={`w-1.5 h-1.5 rounded-full ${esArriendo ? 'bg-orange-500' : 'bg-blue-500'}`} />
                  Tipo: <span className={`${esArriendo ? 'text-orange-600' : 'text-blue-600'} ml-1`}>{inmueble.estado || 'Venta'}</span>
                </div>
                {['Acabados de Lujo', 'Ubicación Estratégica', 'Alta Valorización'].map((point) => (
                  <div key={point} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                    <div className={`w-1.5 h-1.5 rounded-full ${esArriendo ? 'bg-orange-500' : 'bg-blue-500'}`} />
                    {point}
                  </div>
                ))}
              </div>

              <div>
                <p className="text-slate-500 text-base leading-relaxed">
                  {inmueble.descripcion || "Un espacio diseñado para elevar tu calidad de vida en una de las mejores zonas de la ciudad."}
                </p>
              </div>
            </div>
          </div>

          {/* BOTÓN FINAL NARANJA/AZUL */}
          <div className="p-8 border-t border-slate-100">
            <button 
              onClick={contactarWhatsApp}
              className={`w-full ${esArriendo ? 'bg-orange-500 shadow-orange-500/40 hover:bg-orange-600' : 'bg-blue-600 shadow-blue-500/40 hover:bg-blue-700'} text-white font-black text-[13px] uppercase tracking-[0.2em] py-6 rounded-[2rem] transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 group`}
            >
              <MessageCircle size={22} />
              Quiero {esArriendo ? 'Arrendar' : 'Comprar'} esta Propiedad
              <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InmuebleDetalle;