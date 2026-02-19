import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Upload, Home, MapPin, 
  BedDouble, Bath, Maximize2, Check, Building,
  Image as ImageIcon, Layers, Activity
} from 'lucide-react';
import { createInmueble, updateInmueble } from '../services/inmuebles.service';
import { getEdificios } from '../services/edificios.services';
import { alertSuccess } from './Alert';

// Componente de Input base optimizado para 3 colores
const IconInput = ({ icon: Icon, label, theme, ...props }) => {
  const themes = {
    blue: 'group-focus-within:text-blue-500 focus:border-blue-500/30',
    orange: 'group-focus-within:text-orange-500 focus:border-orange-500/30',
    emerald: 'group-focus-within:text-emerald-500 focus:border-emerald-500/30'
  };

  return (
    <div className="space-y-1.5 group w-full">
      {label && <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>}
      <div className="relative">
        <Icon 
          className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors ${themes[theme].split(' ')[0]}`} 
          size={18} 
        />
        <input 
          {...props} 
          className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300 ${themes[theme].split(' ')[1]} ${props.className || ''}`}
        />
      </div>
    </div>
  );
};

const InmuebleModal = ({ inmueble, edificio, onClose, onSaved }) => {
  const [edificios, setEdificios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);

  const [form, setForm] = useState({
    titulo: '',
    precio: '',
    estado: 'Venta', // Venta, Arriendo, Entrega
    edificioId: '',
    unidad: '',
    piso: '',
    habitaciones: '',
    baños: '',
    area: '',
    descripcion: '',
    destacado: false,
    barrio: '',
    estrato: '',
    parqueadero: false,
    amoblado: false,
  });

  // Lógica de Temas Dinámicos
  const getTheme = () => {
    if (form.estado === 'Arriendo') return 'orange';
    if (form.estado === 'Entrega') return 'emerald';
    return 'blue';
  };

  const theme = getTheme();
  
  const themeConfig = {
    blue: { bg: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-500', shadow: 'shadow-blue-100' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-500', light: 'bg-orange-50', border: 'border-orange-500', shadow: 'shadow-orange-100' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-500', shadow: 'shadow-emerald-100' }
  };

  const formatDisplayPrice = (val) => {
    if (!val) return '';
    const num = val.toString().replace(/\D/g, '');
    return new Intl.NumberFormat('es-CO').format(num);
  };

  const handlePriceChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setForm({ ...form, precio: rawValue });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!edificio) {
          const eds = await getEdificios();
          setEdificios(eds || []);
        }
        if (inmueble) {
          setForm({
            ...inmueble,
            precio: inmueble.precio?.toString() || '',
            piso: inmueble.piso?.toString() || '',
            habitaciones: inmueble.habitaciones?.toString() || '',
            baños: inmueble.baños?.toString() || '',
            area: inmueble.area?.toString() || '',
            estrato: inmueble.estrato?.toString() || '',
            estado: inmueble.estado || 'Venta',
            edificioId: inmueble.edificioId || edificio?.id || '',
          });
          if (inmueble.fotos) {
            setPreviews(inmueble.fotos);
            setFiles(inmueble.fotos);
          }
        } else if (edificio) {
          setForm(prev => ({ ...prev, edificioId: edificio.id }));
        }
      } catch (err) { console.error(err); }
    };
    loadData();
  }, [inmueble, edificio]);

  const isFormValid = () => (edificio?.id || form.edificioId) && form.unidad && form.precio;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    const finalId = edificio?.id || form.edificioId;
    const edificioInfo = edificio || edificios.find(ed => ed.id === finalId);

    const dataToSend = {
      ...form,
      edificioId: String(finalId),
      titulo: form.titulo || `Apto ${form.unidad} - ${edificioInfo?.nombre || 'Inmueble'}`,
      precio: Number(form.precio) || 0,
      nombreEdificio: edificioInfo?.nombre || '',
    };

    try {
      if (inmueble) {
        await updateInmueble(inmueble.id, dataToSend, files);
        alertSuccess('Actualizado', 'Registro modificado con éxito');
      } else {
        await createInmueble(dataToSend, files);
        alertSuccess('Creado', 'Registro completado');
      }
      onSaved();
      onClose();
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-0 md:p-6 bg-slate-900/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-5xl md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-screen md:max-h-[95vh] animate-in fade-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-2xl ${themeConfig[theme].bg} text-white shadow-lg transition-all duration-500`}>
              <Building size={22} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">
                {inmueble ? 'Editar Unidad' : 'Registrar Propiedad'}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Módulo de Inventario</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/30">
          <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* IZQUIERDA: SELECTOR Y FOTOS */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100 flex gap-2">
                {['Venta', 'Arriendo', 'Entrega'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setForm({ ...form, estado: mode })}
                    className={`flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${
                      form.estado === mode 
                      ? `${themeConfig[theme].bg} text-white shadow-lg` 
                      : 'text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {mode === 'Entrega' ? 'Entregado' : mode}
                  </button>
                ))}
              </div>

              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                 <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><ImageIcon size={16}/> Galería</h4>
                 <div className="grid grid-cols-3 gap-3">
                    {previews.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 group">
                        <img src={url} className="w-full h-full object-cover" alt="Preview" />
                        <button type="button" onClick={() => {
                          setPreviews(previews.filter((_, i) => i !== index));
                          setFiles(files.filter((_, i) => i !== index));
                        }} className="absolute inset-0 bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><X size={20}/></button>
                      </div>
                    ))}
                    <label className={`aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-slate-50`}>
                      <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => {
                        const sFiles = Array.from(e.target.files);
                        setPreviews(prev => [...prev, ...sFiles.map(f => URL.createObjectURL(f))]);
                        setFiles(prev => [...prev, ...sFiles]);
                      }} />
                      <Upload size={20} className="text-slate-300" />
                    </label>
                 </div>
              </div>
            </div>

            {/* DERECHA: FORMULARIO */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* UNIDAD */}
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black ${themeConfig[theme].text} uppercase tracking-widest ml-2`}>Unidad / Apto</label>
                    <div className="relative group">
                      <Home className={`absolute left-4 top-1/2 -translate-y-1/2 ${themeConfig[theme].text}`} size={20} />
                      <input 
                        value={form.unidad} 
                        onChange={e => setForm({ ...form, unidad: e.target.value })} 
                        placeholder="Ej: 402-A" 
                        className={`w-full pl-12 pr-4 py-5 border-2 border-transparent rounded-2xl text-lg font-black text-slate-800 outline-none transition-all ${themeConfig[theme].light} focus:bg-white ${themeConfig[theme].border.replace('border-', 'focus:border-')}`}
                      />
                    </div>
                  </div>

                  {/* PRECIO CON FORMATEO */}
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black ${themeConfig[theme].text} uppercase tracking-widest ml-2`}>
                      {form.estado === 'Arriendo' ? 'Precio Canon' : form.estado === 'Entrega' ? 'Precio Final Venta' : 'Precio de Venta'}
                    </label>
                    <div className="relative group">
                      <span className={`absolute left-5 top-1/2 -translate-y-1/2 font-bold text-xl ${themeConfig[theme].text}`}>$</span>
                      <input 
                        type="text" 
                        value={formatDisplayPrice(form.precio)} 
                        onChange={handlePriceChange}
                        placeholder="0" 
                        className={`w-full pl-10 pr-4 py-5 border-2 border-transparent rounded-2xl text-xl font-black text-slate-800 outline-none transition-all ${themeConfig[theme].light} focus:bg-white ${themeConfig[theme].border.replace('border-', 'focus:border-')}`}
                      />
                      {form.estado === 'Arriendo' && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-60">/ MES</span>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-50">
                  <IconInput icon={Layers} theme={theme} label="Piso" type="number" value={form.piso} onChange={e => setForm({ ...form, piso: e.target.value })} />
                  <IconInput icon={BedDouble} theme={theme} label="Hab." type="number" value={form.habitaciones} onChange={e => setForm({ ...form, habitaciones: e.target.value })} />
                  <IconInput icon={Bath} theme={theme} label="Baños" type="number" value={form.baños} onChange={e => setForm({ ...form, baños: e.target.value })} />
                  <IconInput icon={Maximize2} theme={theme} label="m²" type="number" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Ubicación (Edificio)</label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <select
                        value={form.edificioId}
                        onChange={e => setForm({ ...form, edificioId: e.target.value })}
                        className={`w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-[1.25rem] text-sm font-bold outline-none transition-all appearance-none focus:border-${theme === 'blue' ? 'blue' : theme === 'orange' ? 'orange' : 'emerald'}-500`}
                      >
                        <option value="">Seleccionar...</option>
                        {edificios.map(ed => <option key={ed.id} value={ed.id}>{ed.nombre}</option>)}
                      </select>
                    </div>
                  </div>
                  <IconInput icon={MapPin} theme={theme} label="Barrio" value={form.barrio} onChange={e => setForm({ ...form, barrio: e.target.value })} />
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={() => setForm(p => ({...p, parqueadero: !p.parqueadero}))} 
                    className={`flex-1 py-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${
                      form.parqueadero 
                      ? `${themeConfig[theme].border} ${themeConfig[theme].light} ${themeConfig[theme].text}` 
                      : 'bg-white text-slate-400 border-slate-100'
                    }`}>PARQUEADERO</button>
                  
                  <button type="button" onClick={() => setForm(p => ({...p, amoblado: !p.amoblado}))} 
                    className={`flex-1 py-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${
                      form.amoblado 
                      ? `${themeConfig[theme].border} ${themeConfig[theme].light} ${themeConfig[theme].text}` 
                      : 'bg-white text-slate-400 border-slate-100'
                    }`}>AMOBLADO</button>
                </div>

                <textarea
                  value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  rows="3"
                  placeholder="Notas adicionales o descripción comercial..."
                  className={`w-full p-6 bg-white border border-slate-100 rounded-[2rem] text-sm font-medium outline-none transition-all resize-none focus:border-${theme === 'blue' ? 'blue' : theme === 'orange' ? 'orange' : 'emerald'}-500`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-8 border-t border-slate-50 flex gap-4 bg-white">
          <button type="button" onClick={onClose} className="flex-1 py-5 bg-slate-50 text-slate-500 rounded-[1.5rem] font-bold text-[11px] tracking-widest uppercase hover:bg-slate-100 transition-colors">Descartar</button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !isFormValid()}
            className={`flex-[2] py-5 rounded-[1.5rem] font-black transition-all text-[11px] tracking-widest uppercase flex items-center justify-center gap-2 ${
              !isFormValid() || loading 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : `${form.estado === 'Entrega' ? 'bg-slate-900' : themeConfig[theme].bg} text-white shadow-xl ${themeConfig[theme].shadow}`
            }`}
          >
            {loading ? (
              <Activity className="animate-spin" size={18} />
            ) : (
              <>
                <Check size={18} />
                <span>{inmueble ? 'Actualizar Registro' : (form.estado === 'Entrega' ? 'Cerrar y Guardar' : 'Confirmar Registro')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default InmuebleModal;