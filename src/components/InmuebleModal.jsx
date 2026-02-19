import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Upload, Home, DollarSign, MapPin, 
  BedDouble, Bath, Maximize2, Check, Car, Sofa, Layers, Building,
  Tag, Info, Image as ImageIcon
} from 'lucide-react';
import { createInmueble, updateInmueble } from '../services/inmuebles.services';
import { getEdificios } from '../services/edificios.services';
import { alertSuccess } from './Alert';

// Componente de Input base actualizado con color dinámico
const IconInput = ({ icon: Icon, label, color, ...props }) => (
  <div className="space-y-1.5 group w-full">
    {label && <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>}
    <div className="relative">
      <Icon 
        className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors ${
          color === 'orange' ? 'group-focus-within:text-orange-500' : 'group-focus-within:text-blue-500'
        }`} 
        size={18} 
      />
      <input 
        {...props} 
        className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300 ${
          color === 'orange' ? 'focus:bg-white focus:border-orange-500/30' : 'focus:bg-white focus:border-blue-500/30'
        } ${props.className || ''}`}
      />
    </div>
  </div>
);

const InmuebleModal = ({ inmueble, edificio, onClose, onSaved }) => {
  const [edificios, setEdificios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);

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
    destacado: false,
    barrio: '',
    estrato: '',
    parqueadero: false,
    amoblado: false,
  });

  const esArriendo = form.estado === 'Arriendo';
  const colorTema = esArriendo ? 'orange' : 'blue';

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
        alertSuccess('Actualizado', 'Unidad modificada');
      } else {
        await createInmueble(dataToSend, files);
        alertSuccess('Creado', 'Nueva unidad registrada');
      }
      onSaved();
      onClose();
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-0 md:p-6 bg-slate-900/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-5xl md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-screen md:max-h-[95vh]">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-2xl ${esArriendo ? 'bg-orange-500' : 'bg-blue-600'} text-white shadow-lg transition-all duration-500`}>
              <Building size={22} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">
                {inmueble ? 'Editar Unidad' : 'Registrar Propiedad'}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/30">
          <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* IZQUIERDA: SELECTOR Y FOTOS */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100 flex gap-2">
                {['Venta', 'Arriendo'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setForm({ ...form, estado: mode })}
                    className={`flex-1 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all ${
                      form.estado === mode 
                      ? (mode === 'Venta' ? 'bg-blue-600 text-white shadow-lg' : 'bg-orange-500 text-white shadow-lg') 
                      : 'text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {mode}
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
                    <label className={`aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer transition-all ${esArriendo ? 'hover:bg-orange-50' : 'hover:bg-blue-50'}`}>
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
                    <label className={`text-[10px] font-black ${esArriendo ? 'text-orange-500' : 'text-blue-600'} uppercase tracking-widest ml-2`}>Unidad</label>
                    <div className="relative group">
                      <Home className={`absolute left-4 top-1/2 -translate-y-1/2 ${esArriendo ? 'text-orange-500' : 'text-blue-500'}`} size={20} />
                      <input 
                        value={form.unidad} 
                        onChange={e => setForm({ ...form, unidad: e.target.value })} 
                        placeholder="Ej: 402-A" 
                        className={`w-full pl-12 pr-4 py-5 border-2 border-transparent rounded-2xl text-lg font-black text-slate-800 outline-none transition-all ${
                          esArriendo ? 'bg-orange-50/30 focus:bg-white focus:border-orange-500' : 'bg-blue-50/30 focus:bg-white focus:border-blue-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* PRECIO CON FORMATEO */}
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black ${esArriendo ? 'text-emerald-600' : 'text-emerald-500'} uppercase tracking-widest ml-2`}>
                      {esArriendo ? 'Precio Canon' : 'Precio de Venta'}
                    </label>
                    <div className="relative group">
                      <span className={`absolute left-5 top-1/2 -translate-y-1/2 font-bold text-xl ${esArriendo ? 'text-emerald-600' : 'text-emerald-500'}`}>$</span>
                      <input 
                        type="text" 
                        value={formatDisplayPrice(form.precio)} 
                        onChange={handlePriceChange}
                        placeholder="0" 
                        className={`w-full pl-10 pr-4 py-5 border-2 border-transparent rounded-2xl text-xl font-black text-slate-800 outline-none transition-all ${
                          esArriendo ? 'bg-orange-50/30 focus:bg-white focus:border-orange-500' : 'bg-emerald-50/30 focus:bg-white focus:border-emerald-500'
                        }`}
                      />
                      {esArriendo && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-600">/ MES</span>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-50">
                  <IconInput icon={Layers} color={colorTema} label="Piso" type="number" value={form.piso} onChange={e => setForm({ ...form, piso: e.target.value })} />
                  <IconInput icon={BedDouble} color={colorTema} label="Hab." type="number" value={form.habitaciones} onChange={e => setForm({ ...form, habitaciones: e.target.value })} />
                  <IconInput icon={Bath} color={colorTema} label="Baños" type="number" value={form.baños} onChange={e => setForm({ ...form, baños: e.target.value })} />
                  <IconInput icon={Maximize2} color={colorTema} label="m²" type="number" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Edificio</label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <select
                        value={form.edificioId}
                        onChange={e => setForm({ ...form, edificioId: e.target.value })}
                        className={`w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-[1.25rem] text-sm font-bold outline-none transition-all appearance-none ${
                          esArriendo ? 'focus:border-orange-500' : 'focus:border-blue-500'
                        }`}
                      >
                        <option value="">Seleccionar...</option>
                        {edificios.map(ed => <option key={ed.id} value={ed.id}>{ed.nombre}</option>)}
                      </select>
                    </div>
                  </div>
                  <IconInput icon={MapPin} color={colorTema} label="Barrio" value={form.barrio} onChange={e => setForm({ ...form, barrio: e.target.value })} />
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={() => setForm(p => ({...p, parqueadero: !p.parqueadero}))} 
                    className={`flex-1 py-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${
                      form.parqueadero 
                      ? (esArriendo ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-blue-500 bg-blue-50 text-blue-700') 
                      : 'bg-white text-slate-400 border-slate-100'
                    }`}>PARQUEADERO</button>
                  
                  <button type="button" onClick={() => setForm(p => ({...p, amoblado: !p.amoblado}))} 
                    className={`flex-1 py-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${
                      form.amoblado 
                      ? (esArriendo ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-blue-500 bg-blue-50 text-blue-700') 
                      : 'bg-white text-slate-400 border-slate-100'
                    }`}>AMOBLADO</button>
                </div>

                <textarea
                  value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  rows="3"
                  placeholder="Descripción comercial..."
                  className={`w-full p-6 bg-white border border-slate-100 rounded-[2rem] text-sm font-medium outline-none transition-all resize-none ${
                    esArriendo ? 'focus:border-orange-500' : 'focus:border-blue-500'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-8 border-t border-slate-50 flex gap-4 bg-white">
          <button type="button" onClick={onClose} className="flex-1 py-5 bg-slate-50 text-slate-500 rounded-[1.5rem] font-bold text-[11px] tracking-widest uppercase">Cancelar</button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !isFormValid()}
            className={`flex-[2] py-5 rounded-[1.5rem] font-black transition-all text-[11px] tracking-widest uppercase ${
              !isFormValid() || loading 
              ? 'bg-slate-200 text-slate-400' 
              : (esArriendo ? 'bg-orange-600 text-white shadow-xl shadow-orange-100' : 'bg-slate-900 text-white shadow-xl shadow-slate-200')
            }`}
          >
            {loading ? 'Guardando...' : 'Guardar Propiedad'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default InmuebleModal;