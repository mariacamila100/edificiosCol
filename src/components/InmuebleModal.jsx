import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Upload, Home, BedDouble, Bath, Maximize2, 
  Check, Building, Image as ImageIcon, Layers, 
  Activity, Camera, Trash2, Plus, CheckCircle
} from 'lucide-react';
import { createInmueble, updateInmueble } from '../services/inmuebles.service';
import { getEdificios } from '../services/edificios.services';
import { alertSuccess } from './Alert';

const IconInput = ({ icon: Icon, label, theme, ...props }) => {
  const themes = {
    blue: 'group-focus-within:text-blue-500 focus:border-blue-500/30',
    orange: 'group-focus-within:text-orange-500 focus:border-orange-500/30',
    emerald: 'group-focus-within:text-emerald-500 focus:border-emerald-500/30'
  };

  return (
    <div className="space-y-2 group w-full">
      {label && <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest ml-2">{label}</label>}
      <div className="relative">
        <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 transition-colors ${themes[theme]?.split(' ')[0]}`} size={18} />
        <input 
          {...props} 
          className={`w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-sm font-medium text-slate-700 outline-none transition-all focus:bg-white ${themes[theme]?.split(' ')[1]} ${props.className || ''}`}
        />
      </div>
    </div>
  );
};

const InmuebleModal = ({ inmueble, edificio, onClose, onSaved }) => {
  const [edificiosList, setEdificiosList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [galleryFiles, setGalleryFiles] = useState([]);

  const [form, setForm] = useState({
    titulo: '', precio: '', estado: 'Venta', edificioId: '', unidad: '',
    piso: '', habitaciones: '', baños: '', area: '', descripcion: '',
    barrio: '', estrato: '', parqueadero: false, amoblado: false,
  });

  // El tema visual depende del estado ("Entregado" ahora usa esmeralda directamente)
  const theme = form.estado === 'Arriendo' ? 'orange' : form.estado === 'Entregado' ? 'emerald' : 'blue';
  const themeConfig = {
    blue: { bg: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-50', shadow: 'shadow-blue-100' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-500', light: 'bg-orange-50', shadow: 'shadow-orange-100' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', light: 'bg-emerald-50', shadow: 'shadow-emerald-100' }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const eds = await getEdificios();
        setEdificiosList(eds || []);

        if (inmueble) {
          setForm({
            ...inmueble,
            // Aseguramos que si viene como "Entrega" desde la BD vieja, lo mostremos como "Entregado"
            estado: inmueble.estado === 'Entrega' ? 'Entregado' : inmueble.estado,
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
          setForm(prev => ({ ...prev, edificioId: edificio.id, barrio: edificio.barrio || '' }));
        }
      } catch (err) { console.error(err); }
    };
    loadData();
  }, [inmueble, edificio]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); }
  };

  const handleGalleryChange = (e) => {
    const sFiles = Array.from(e.target.files);
    setGalleryPreviews(prev => [...prev, ...sFiles.map(f => URL.createObjectURL(f))]);
    setGalleryFiles(prev => [...prev, ...sFiles]);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    const edEncontrado = edificio || edificiosList.find(ed => ed.id === form.edificioId);
    const nombreEdificio = edEncontrado ? edEncontrado.nombre : 'Propiedad';
    
    const tituloFinal = form.titulo.trim() !== '' 
      ? form.titulo 
      : `Apt-${form.unidad} ${nombreEdificio}`;

    const dataToSend = {
      ...form,
      titulo: tituloFinal,
      nombreEdificio: nombreEdificio,
      precio: Number(form.precio) || 0,
      piso: form.piso ? Number(form.piso) : null,
      habitaciones: form.habitaciones ? Number(form.habitaciones) : null,
      baños: form.baños ? Number(form.baños) : null,
      area: String(form.area || ''),
      estrato: form.estrato ? Number(form.estrato) : null,
      edificioId: String(edificio?.id || form.edificioId),
    };

    try {
      if (inmueble) {
        await updateInmueble(inmueble.id, dataToSend, galleryFiles, logoFile);
      } else {
        await createInmueble(dataToSend, galleryFiles, logoFile);
      }
      
      setSaveSuccess(true);
      alertSuccess('Éxito', 'Inmueble guardado correctamente');
      
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1500);

    } catch (error) { 
      console.error(error); 
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in duration-300">
        
        {/* HEADER */}
        <div className="px-10 py-7 border-b border-slate-50 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-2xl ${themeConfig[theme].bg} text-white shadow-lg`}>
              <Building size={22} />
            </div>
            <div>
              <h3 className="text-xl font-medium text-slate-900 tracking-tight">
                {inmueble ? 'Editar Inmueble' : 'Nueva Propiedad'}
              </h3>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Unidad Residencial</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-300 hover:text-slate-600"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white p-10 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* LADO IZQUIERDO: IMÁGENES Y ESTADO */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-slate-50 p-1.5 rounded-2xl flex gap-1">
                {['Venta', 'Arriendo', 'Entregado'].map((mode) => (
                  <button key={mode} type="button" onClick={() => setForm({ ...form, estado: mode })}
                    className={`flex-1 py-3 rounded-xl font-medium text-[10px] uppercase tracking-wider transition-all ${
                      form.estado === mode ? `${themeConfig[theme].bg} text-white shadow-md` : 'text-slate-400 hover:text-slate-600'
                    }`}>
                    {mode}
                  </button>
                ))}
              </div>

              {/* ... Resto de la UI de imágenes se mantiene igual ... */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2"><Camera size={14} /> Portada Principal</h4>
                <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50 group">
                  {logoPreview ? (
                    <>
                      <img src={logoPreview} className="w-full h-full object-cover" alt="Logo" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all backdrop-blur-[2px]">
                        <label className="p-3 bg-white text-slate-700 rounded-xl cursor-pointer"><Upload size={18} /><input type="file" className="hidden" accept="image/*" onChange={handleLogoChange}/></label>
                        <button type="button" onClick={() => {setLogoPreview(null); setLogoFile(null);}} className="p-3 bg-white text-rose-500 rounded-xl"><Trash2 size={18}/></button>
                      </div>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-full cursor-pointer text-slate-300 hover:text-blue-500">
                      <Upload size={32} strokeWidth={1.5} className="mb-2" />
                      <span className="text-[10px] font-medium uppercase tracking-widest">Subir Imagen</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                 <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2"><ImageIcon size={14}/> Galería de Fotos</h4>
                 <div className="grid grid-cols-4 gap-3">
                    {galleryPreviews.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 group">
                        <img src={url} className="w-full h-full object-cover" alt="Preview" />
                        <button type="button" onClick={() => {
                          setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index));
                          setGalleryFiles(galleryFiles.filter((_, i) => i !== index));
                        }} className="absolute inset-0 bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><X size={16}/></button>
                      </div>
                    ))}
                    <label className="aspect-square rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 text-slate-300">
                      <Plus size={20} /><input type="file" multiple className="hidden" accept="image/*" onChange={handleGalleryChange} />
                    </label>
                 </div>
              </div>
            </div>

            {/* LADO DERECHO: FORMULARIO */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-2">
                <label className={`text-[10px] font-medium ${themeConfig[theme].text} uppercase tracking-widest ml-4`}>Título Personalizado (Opcional)</label>
                <input 
                  value={form.titulo} 
                  onChange={e => setForm({ ...form, titulo: e.target.value })} 
                  placeholder={`Ej: Apt-${form.unidad || '000'} ${edificio?.nombre || 'Nombre Edificio'}`} 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-blue-200" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`text-[10px] font-medium ${themeConfig[theme].text} uppercase tracking-widest ml-4`}>Unidad / Apto</label>
                  <div className="relative group">
                    <Home className={`absolute left-5 top-1/2 -translate-y-1/2 ${themeConfig[theme].text} opacity-50`} size={20} />
                    <input value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })} placeholder="Ej: 403" 
                      className={`w-full pl-14 pr-6 py-5 border border-transparent rounded-2xl text-xl font-medium outline-none transition-all ${themeConfig[theme].light} ${themeConfig[theme].text} focus:bg-white focus:border-current`} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={`text-[10px] font-medium ${themeConfig[theme].text} uppercase tracking-widest ml-4`}>Precio de {form.estado}</label>
                  <div className="relative group">
                    <span className={`absolute left-5 top-1/2 -translate-y-1/2 font-medium text-xl ${themeConfig[theme].text} opacity-50`}>$</span>
                    <input type="number" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} placeholder="0" 
                      className={`w-full pl-12 pr-6 py-5 border border-transparent rounded-2xl text-xl font-medium outline-none transition-all ${themeConfig[theme].light} ${themeConfig[theme].text} focus:bg-white focus:border-current`} />
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

              <div className="flex gap-4">
                <button type="button" onClick={() => setForm(p => ({...p, parqueadero: !p.parqueadero}))} 
                  className={`flex-1 py-4 rounded-xl border font-medium text-[10px] tracking-widest uppercase transition-all ${form.parqueadero ? `${themeConfig[theme].bg} text-white border-transparent shadow-md` : 'bg-white text-slate-400 border-slate-100'}`}>PARQUEADERO</button>
                <button type="button" onClick={() => setForm(p => ({...p, amoblado: !p.amoblado}))} 
                  className={`flex-1 py-4 rounded-xl border font-medium text-[10px] tracking-widest uppercase transition-all ${form.amoblado ? `${themeConfig[theme].bg} text-white border-transparent shadow-md` : 'bg-white text-slate-400 border-slate-100'}`}>AMOBLADO</button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest ml-4">Descripción del Inmueble</label>
                <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} rows="3" placeholder="Describe los acabados, vista, etc..."
                  className={`w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none transition-all resize-none focus:bg-white focus:border-blue-200`} />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-8 border-t border-slate-50 flex gap-4 bg-white">
          <button type="button" onClick={onClose} className="px-8 py-5 bg-white text-slate-400 rounded-2xl font-medium text-[11px] tracking-widest uppercase hover:bg-slate-50 transition-all">Descartar</button>
          
          <button 
            type="button" 
            onClick={handleSubmit} 
            disabled={loading || !form.unidad || saveSuccess}
            className={`flex-1 py-5 rounded-2xl font-medium text-[11px] tracking-widest uppercase flex items-center justify-center gap-3 transition-all ${
              saveSuccess 
                ? 'bg-emerald-500 text-white shadow-lg' 
                : !form.unidad || loading 
                  ? 'bg-slate-100 text-slate-300' 
                  : `${themeConfig[theme].bg} text-white shadow-lg ${themeConfig[theme].shadow} hover:scale-[1.01]`
            }`}
          >
            {loading ? (
              <Activity className="animate-spin" size={18} />
            ) : saveSuccess ? (
              <><CheckCircle size={18} /> <span>Guardado con éxito</span></>
            ) : (
              <><Check size={18} /> <span>{inmueble ? 'Actualizar Registro' : 'Confirmar Registro'}</span></>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default InmuebleModal;