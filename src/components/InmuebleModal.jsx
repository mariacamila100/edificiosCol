import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Upload, Home, MapPin, 
  BedDouble, Bath, Maximize2, Check, Building,
  Image as ImageIcon, Layers, Activity, Camera, Trash2, Plus
} from 'lucide-react';
import { createInmueble, updateInmueble } from '../services/inmuebles.service';
import { getEdificios } from '../services/edificios.services';
import { alertSuccess } from './Alert';

// Componente de Input base optimizado
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
          className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors ${themes[theme]?.split(' ')[0]}`} 
          size={18} 
        />
        <input 
          {...props} 
          className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300 ${themes[theme]?.split(' ')[1]} ${props.className || ''}`}
        />
      </div>
    </div>
  );
};

const InmuebleModal = ({ inmueble, edificio, onClose, onSaved }) => {
  const [edificios, setEdificios] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // ESTADOS PARA IMÁGENES
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [galleryFiles, setGalleryFiles] = useState([]);

  const [form, setForm] = useState({
    titulo: '',
    precio: '',
    estado: 'Venta',
    edificioId: '',
    unidad: '',
    piso: '',
    habitaciones: '',
    baños: '',
    area: '',
    descripcion: '',
    barrio: '',
    estrato: '',
    parqueadero: false,
    amoblado: false,
  });

  const theme = form.estado === 'Arriendo' ? 'orange' : form.estado === 'Entrega' ? 'emerald' : 'blue';
  const themeConfig = {
    blue: { bg: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-500', shadow: 'shadow-blue-100' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-500', light: 'bg-orange-50', border: 'border-orange-500', shadow: 'shadow-orange-100' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-500', shadow: 'shadow-emerald-100' }
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
            edificioId: inmueble.edificioId || edificio?.id || '',
          });
          if (inmueble.logoUrl) setLogoPreview(inmueble.logoUrl);
          if (inmueble.fotos) setGalleryPreviews(inmueble.fotos);
        } else if (edificio) {
          setForm(prev => ({ ...prev, edificioId: edificio.id }));
        }
      } catch (err) { console.error(err); }
    };
    loadData();
  }, [inmueble, edificio]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    const sFiles = Array.from(e.target.files);
    setGalleryPreviews(prev => [...prev, ...sFiles.map(f => URL.createObjectURL(f))]);
    setGalleryFiles(prev => [...prev, ...sFiles]);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    // LIMPIEZA DE DATOS: Si están en blanco, se envían como null o 0 para evitar errores
    const dataToSend = {
      ...form,
      precio: Number(form.precio) || 0,
      piso: form.piso ? Number(form.piso) : null,
      habitaciones: form.habitaciones ? Number(form.habitaciones) : null,
      baños: form.baños ? Number(form.baños) : null,
      area: form.area ? Number(form.area) : null,
      estrato: form.estrato ? Number(form.estrato) : null, // <--- CORRECCIÓN ESTRATO
      edificioId: String(edificio?.id || form.edificioId),
    };

    try {
      if (inmueble) {
        await updateInmueble(inmueble.id, dataToSend, galleryFiles, logoFile);
        alertSuccess('Actualizado', 'Registro modificado');
      } else {
        await createInmueble(dataToSend, galleryFiles, logoFile);
        alertSuccess('Creado', 'Registro completado');
      }
      onSaved();
      onClose();
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-5xl rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in duration-300">
        
        {/* HEADER */}
        <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-white">
          <div className="flex items-center gap-5">
            <div className={`p-4 rounded-2xl ${themeConfig[theme].bg} text-white shadow-xl`}>
              <Building size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">
                {inmueble ? 'Editar Unidad' : 'Registrar Propiedad'}
              </h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Módulo de Inventario</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-slate-100 rounded-full transition-all text-slate-400"><X size={28} /></button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/30 p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* IZQUIERDA: IMÁGENES */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100 flex gap-2">
                {['Venta', 'Arriendo', 'Entrega'].map((mode) => (
                  <button key={mode} type="button" onClick={() => setForm({ ...form, estado: mode })}
                    className={`flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${
                      form.estado === mode ? `${themeConfig[theme].bg} text-white shadow-lg` : 'text-slate-400 hover:bg-slate-50'
                    }`}>
                    {mode === 'Entrega' ? 'Entregado' : mode}
                  </button>
                ))}
              </div>

              {/* LOGO / PORTADA */}
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-4">
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Camera size={16} className={themeConfig[theme].text}/> Logo / Portada
                </h4>
                <div className="relative aspect-video rounded-[2rem] overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 group">
                  {logoPreview ? (
                    <>
                      <img src={logoPreview} className="w-full h-full object-cover" alt="Logo" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-all backdrop-blur-sm">
                        <label className="p-3 bg-white text-slate-900 rounded-xl cursor-pointer"><Upload size={20} /><input type="file" className="hidden" accept="image/*" onChange={handleLogoChange}/></label>
                        <button type="button" onClick={() => {setLogoPreview(null); setLogoFile(null);}} className="p-3 bg-rose-500 text-white rounded-xl"><Trash2 size={20}/></button>
                      </div>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-full cursor-pointer text-slate-400 hover:text-blue-500 transition-colors">
                      <Upload size={40} strokeWidth={1} className="mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Subir Imagen Principal</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                    </label>
                  )}
                </div>
              </div>

              {/* GALERÍA */}
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-4">
                 <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><ImageIcon size={16} className={themeConfig[theme].text}/> Galería de Fotos</h4>
                 <div className="grid grid-cols-3 gap-3">
                    {galleryPreviews.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 group">
                        <img src={url} className="w-full h-full object-cover" alt="Preview" />
                        <button type="button" onClick={() => {
                          setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index));
                          setGalleryFiles(galleryFiles.filter((_, i) => i !== index));
                        }} className="absolute inset-0 bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><X size={20}/></button>
                      </div>
                    ))}
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all text-slate-300">
                      <Plus size={24} /><input type="file" multiple className="hidden" accept="image/*" onChange={handleGalleryChange} />
                    </label>
                 </div>
              </div>
            </div>

            {/* DERECHA: FORMULARIO */}
            <div className="lg:col-span-7 space-y-8">
              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black ${themeConfig[theme].text} uppercase tracking-widest ml-4`}>Unidad / Apto</label>
                    <div className="relative group">
                      <Home className={`absolute left-5 top-1/2 -translate-y-1/2 ${themeConfig[theme].text}`} size={22} />
                      <input value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })} placeholder="Ej: 402-A" 
                        className={`w-full pl-14 pr-6 py-6 border-2 border-transparent rounded-[1.5rem] text-2xl font-black outline-none transition-all ${themeConfig[theme].light} ${themeConfig[theme].text} focus:bg-white focus:border-current`} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black ${themeConfig[theme].text} uppercase tracking-widest ml-4`}>Precio</label>
                    <div className="relative group">
                      <span className={`absolute left-5 top-1/2 -translate-y-1/2 font-black text-2xl ${themeConfig[theme].text}`}>$</span>
                      <input type="number" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} placeholder="0" 
                        className={`w-full pl-12 pr-6 py-6 border-2 border-transparent rounded-[1.5rem] text-2xl font-black outline-none transition-all ${themeConfig[theme].light} ${themeConfig[theme].text} focus:bg-white focus:border-current`} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <IconInput icon={Layers} theme={theme} label="Piso" type="number" value={form.piso} onChange={e => setForm({ ...form, piso: e.target.value })} />
                  <IconInput icon={BedDouble} theme={theme} label="Hab." type="number" value={form.habitaciones} onChange={e => setForm({ ...form, habitaciones: e.target.value })} />
                  <IconInput icon={Bath} theme={theme} label="Baños" type="number" value={form.baños} onChange={e => setForm({ ...form, baños: e.target.value })} />
                  <IconInput icon={Maximize2} theme={theme} label="m²" type="number" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} />
                  <IconInput icon={Activity} theme={theme} label="Estrato" type="number" value={form.estrato} onChange={e => setForm({ ...form, estrato: e.target.value })} />
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setForm(p => ({...p, parqueadero: !p.parqueadero}))} 
                  className={`flex-1 py-5 rounded-[1.5rem] border-2 font-black text-[10px] tracking-widest uppercase transition-all ${form.parqueadero ? `${themeConfig[theme].bg} text-white border-transparent shadow-lg` : 'bg-white text-slate-400 border-slate-100'}`}>PARQUEADERO</button>
                <button type="button" onClick={() => setForm(p => ({...p, amoblado: !p.amoblado}))} 
                  className={`flex-1 py-5 rounded-[1.5rem] border-2 font-black text-[10px] tracking-widest uppercase transition-all ${form.amoblado ? `${themeConfig[theme].bg} text-white border-transparent shadow-lg` : 'bg-white text-slate-400 border-slate-100'}`}>AMOBLADO</button>
              </div>

              <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} rows="4" placeholder="Notas adicionales o descripción comercial..."
                className={`w-full p-8 bg-white border border-slate-100 rounded-[2.5rem] text-sm font-bold outline-none transition-all resize-none focus:border-${themeConfig[theme].text.split('-')[1]}-500`} />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-10 border-t border-slate-50 flex gap-4 bg-white">
          <button type="button" onClick={onClose} className="flex-1 py-6 bg-slate-50 text-slate-500 rounded-[2rem] font-black text-[11px] tracking-widest uppercase hover:bg-slate-100 transition-all">Descartar</button>
          <button type="button" onClick={handleSubmit} disabled={loading || !form.unidad}
            className={`flex-[2] py-6 rounded-[2rem] font-black text-[11px] tracking-widest uppercase flex items-center justify-center gap-3 transition-all ${
              !form.unidad || loading ? 'bg-slate-200 text-slate-400' : `${themeConfig[theme].bg} text-white shadow-2xl ${themeConfig[theme].shadow}`
            }`}>
            {loading ? <Activity className="animate-spin" size={20} /> : <><Check size={20} /> <span>{inmueble ? 'Actualizar Registro' : 'Confirmar Registro'}</span></>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default InmuebleModal;