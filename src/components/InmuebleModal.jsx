import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Upload, Home, DollarSign, MapPin, 
  BedDouble, Bath, Maximize2, Check, Car, Sofa, Layers, Building 
} from 'lucide-react';
import { createInmueble, updateInmueble } from '../services/inmuebles.services';
import { getEdificios } from '../services/edificios.services';
import { alertSuccess } from './Alert';

const IconInput = ({ icon: Icon, ...props }) => (
  <div className="relative group">
    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
    <input 
      {...props} 
      className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500/30 transition-all ${props.className || ''}`}
    />
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
    tipo: 'venta',
    estado: 'Disponible',
    edificioId: '', // Se llenará en el useEffect
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

  // 1. Sincronizar el ID del edificio inmediatamente
  useEffect(() => {
    if (edificio?.id) {
      setForm(prev => ({ ...prev, edificioId: edificio.id }));
    }
  }, [edificio]);

  const isFormValid = () => {
    // Si viene de edificio, el ID ya está garantizado por la prop
    const hasEdificio = edificio?.id || form.edificioId !== '';
    return form.unidad.trim() !== '' && form.precio !== '' && hasEdificio;
  };

  useEffect(() => {
    const loadData = async () => {
      if (!edificio) {
        const eds = await getEdificios();
        setEdificios(eds);
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
          // Aseguramos que el edificioId se mantenga si estamos editando
          edificioId: inmueble.edificioId || edificio?.id || '',
        });
        
        if (inmueble.fotos) {
          setPreviews(inmueble.fotos);
          setFiles(inmueble.fotos);
        }
      }
    };
    loadData();
  }, [inmueble, edificio]);

  const handleImagesChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeImage = (index) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // 2. Prioridad absoluta al ID del edificio pasado por prop
    const finalEdificioId = edificio?.id || form.edificioId;
    
    if (!finalEdificioId) {
      console.error("No se puede guardar: Falta ID del edificio");
      return;
    }

    setLoading(true);
    const edificioInfo = edificio || edificios.find(ed => ed.id === finalEdificioId);

    const nombreFinal = form.titulo.trim() !== '' 
      ? form.titulo 
      : `Apartamento ${form.unidad} - ${edificioInfo?.nombre || 'Inmueble'}`;

    const dataToSend = {
      ...form,
      edificioId: String(finalEdificioId), // 3. Forzamos String para que el filtro de Firebase funcione
      titulo: nombreFinal,
      precio: Number(form.precio) || 0,
      piso: Number(form.piso) || null,
      habitaciones: Number(form.habitaciones) || 0,
      baños: Number(form.baños) || 0,
      nombreEdificio: edificioInfo?.nombre || '',
    };

    try {
      if (inmueble) {
        await updateInmueble(inmueble.id, dataToSend, files);
        alertSuccess('Actualizado', 'Inmueble actualizado correctamente');
      } else {
        await createInmueble(dataToSend, files);
        alertSuccess('Creado', 'Inmueble registrado correctamente');
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error("Error al guardar inmueble:", error);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100 bg-white">
          <div>
            <h3 className="text-xl font-black text-slate-800">
              {inmueble ? 'Editar Unidad' : 'Nueva Unidad'} {form.unidad && `#${form.unidad}`}
            </h3>
            {edificio && (
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest flex items-center gap-1 mt-1">
                <Building size={12} /> {edificio.nombre}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <form className="overflow-y-auto p-8 space-y-6">
          
          {/* GALERÍA */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Galería de fotos</h4>
            <div className="grid grid-cols-4 gap-3">
              {previews.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                  <img src={url} className="w-full h-full object-cover" alt="Preview" />
                  <button 
                    type="button" 
                    onClick={() => removeImage(index)} 
                    className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all group">
                <input type="file" multiple className="hidden" accept="image/*" onChange={handleImagesChange} />
                <Upload size={20} className="text-slate-400 group-hover:text-blue-500" />
                <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Subir</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            {/* FILA: EDIFICIO / UNIDAD / PISO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {!edificio ? (
                <div className="md:col-span-1 relative group">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <select
                    value={form.edificioId}
                    onChange={e => setForm({ ...form, edificioId: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500/30 transition-all appearance-none"
                  >
                    <option value="">Edificio *</option>
                    {edificios.map(ed => <option key={ed.id} value={ed.id}>{ed.nombre}</option>)}
                  </select>
                </div>
              ) : (
                <div className="md:col-span-1">
                   <div className="w-full px-5 py-3.5 bg-blue-50/50 border-2 border-blue-100/20 rounded-2xl text-sm font-bold text-blue-600 flex items-center gap-2">
                     <Building size={18} />
                     <span className="truncate">{edificio.nombre}</span>
                   </div>
                </div>
              )}

              <IconInput 
                icon={Home} 
                value={form.unidad} 
                onChange={e => setForm({ ...form, unidad: e.target.value })} 
                placeholder="Unidad/Apto *" 
              />
              <IconInput 
                icon={Layers} 
                type="number"
                value={form.piso} 
                onChange={e => setForm({ ...form, piso: e.target.value })} 
                placeholder="Piso" 
              />
            </div>

            <IconInput 
              icon={Home} 
              value={form.titulo} 
              onChange={e => setForm({ ...form, titulo: e.target.value })} 
              placeholder="Título del anuncio (Opcional)"
            />

            <div className="grid grid-cols-2 gap-4">
              <IconInput 
                icon={DollarSign} 
                type="number" 
                value={form.precio} 
                onChange={e => setForm({ ...form, precio: e.target.value })} 
                placeholder="Precio *"
              />
              <IconInput icon={MapPin} value={form.barrio} onChange={e => setForm({ ...form, barrio: e.target.value })} placeholder="Barrio" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <IconInput icon={BedDouble} type="number" placeholder="Hab." value={form.habitaciones} onChange={e => setForm({...form, habitaciones: e.target.value})} />
              <IconInput icon={Bath} type="number" placeholder="Baños" value={form.baños} onChange={e => setForm({...form, baños: e.target.value})} />
              <IconInput icon={Maximize2} type="number" placeholder="m²" value={form.area} onChange={e => setForm({...form, area: e.target.value})} />
            </div>

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setForm(p => ({...p, parqueadero: !p.parqueadero}))}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 transition-all font-black text-[10px] uppercase ${form.parqueadero ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400'}`}
              >
                <Car size={16} /> Parqueadero
              </button>
              <button 
                type="button" 
                onClick={() => setForm(p => ({...p, amoblado: !p.amoblado}))}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 transition-all font-black text-[10px] uppercase ${form.amoblado ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400'}`}
              >
                <Sofa size={16} /> Amoblado
              </button>
            </div>

            <textarea
              value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
              rows="3"
              placeholder="Descripción adicional del inmueble..."
              className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-blue-500/30 transition-all resize-none"
            />
          </div>
        </form>

        {/* FOOTER ACCIONES */}
        <div className="p-6 border-t border-slate-100 flex gap-3 bg-white">
          <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !isFormValid()}
            className={`flex-[2] py-4 rounded-2xl font-black flex justify-center items-center gap-2 transition-all ${
              !isFormValid() || loading 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-slate-900 text-white shadow-xl shadow-slate-200 hover:bg-black active:scale-95'
            }`}
          >
            {loading ? 'Guardando...' : <><Check size={20} /> Guardar Unidad {form.unidad}</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default InmuebleModal;