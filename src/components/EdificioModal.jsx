import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { departamentosColombia } from '../data/colombia';
import { createEdificio, updateEdificio } from '../services/edificios.services';
import { alertSuccess } from './Alert';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Importar Storage
import { storage } from '../api/firebaseConfig'; // Tu config de Firebase
import { 
  Building2, MapPin, Phone, Mail, 
  Globe, Activity, X, Check, ArrowRight, Map, Camera, Loader2, Image as ImageIcon
} from 'lucide-react';

const EdificioModal = ({ edificio, onClose, onSaved }) => {
  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
    departamento: 'Santander',
    ciudad: 'Bucaramanga',
    barrio: '',
    telefonoAdmin: '',
    emailAdmin: '',
    estado: 'activo',
    logoUrl: '' // Campo para la imagen
  });

  const [ciudadesFiltradas, setCiudadesFiltradas] = useState([]);
  const [barriosFiltrados, setBarriosFiltrados] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Filtrar Ciudades
  useEffect(() => {
    const deptoEncontrado = departamentosColombia.find(d => d.departamento === form.departamento);
    if (deptoEncontrado) setCiudadesFiltradas(deptoEncontrado.ciudades);
  }, [form.departamento]);

  // Filtrar Barrios
  useEffect(() => {
    const ciudadEncontrada = ciudadesFiltradas.find(c => (c.nombre || c) === form.ciudad);
    setBarriosFiltrados(ciudadEncontrada?.barrios || []);
  }, [form.ciudad, ciudadesFiltradas]);

  // Cargar datos si es edición
  useEffect(() => {
    if (edificio) {
      const telLimpio = edificio.telefonoAdmin?.startsWith('57') ? edificio.telefonoAdmin.slice(2) : edificio.telefonoAdmin;
      setForm({ ...edificio, telefonoAdmin: telLimpio || '' });
      setImagePreview(edificio.logoUrl || null);
    }
  }, [edificio]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Crear previsualización temporal
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return form.logoUrl;
    const storageRef = ref(storage, `edificios/logos/${Date.now()}_${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      
      // 1. Subir imagen si existe una nueva
      const urlFinal = await uploadImage();

      const dataFinal = {
        ...form,
        logoUrl: urlFinal,
        telefonoAdmin: form.telefonoAdmin ? `57${form.telefonoAdmin}` : ''
      };

      if (edificio) {
        await updateEdificio(edificio.id, dataFinal);
        alertSuccess('Actualizado', 'Edificio modificado con éxito');
      } else {
        await createEdificio(dataFinal);
        alertSuccess('Creado', 'Nuevo edificio registrado');
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setUploading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />

      <div className="relative bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden animate-slideUp">
        
        {/* Header */}
        <div className="bg-slate-50/50 px-10 py-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
              <Building2 className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">{edificio ? 'Editar Edificio' : 'Nuevo Edificio'}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Información y Logo</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* SECCIÓN DE IMAGEN / LOGO */}
          <div className="flex flex-col items-center justify-center pb-4">
            <label className="relative group cursor-pointer">
              <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center transition-all group-hover:border-blue-400">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center">
                    <ImageIcon size={30} strokeWidth={1.5} />
                    <span className="text-[10px] font-bold mt-1">SUBIR LOGO</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera size={24} />
                </div>
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            <p className="text-[9px] text-slate-400 font-bold mt-3 uppercase tracking-tighter text-center">
              Recomendado: Logo cuadrado (PNG/JPG)
            </p>
          </div>

          <FormGroup label="Nombre Comercial" icon={<Building2 size={16} />}>
            <input
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              required
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-slate-700 font-medium"
            />
          </FormGroup>

          {/* Ubicación (Triple Select) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup label="Departamento" icon={<Globe size={16} />}>
              <select
                value={form.departamento}
                onChange={e => setForm({ ...form, departamento: e.target.value, ciudad: '', barrio: '' })}
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none appearance-none"
              >
                {departamentosColombia.map(dep => (
                  <option key={dep.departamento} value={dep.departamento}>{dep.departamento}</option>
                ))}
              </select>
            </FormGroup>

            <FormGroup label="Ciudad" icon={<ArrowRight size={16} />}>
              <select
                value={form.ciudad}
                onChange={e => setForm({ ...form, ciudad: e.target.value, barrio: '' })}
                required
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none appearance-none"
              >
                <option value="">Seleccione Ciudad...</option>
                {ciudadesFiltradas.map(c => (
                  <option key={c.nombre || c} value={c.nombre || c}>{c.nombre || c}</option>
                ))}
              </select>
            </FormGroup>
          </div>

          {/* Barrio y Dirección */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup label="Barrio / Sector" icon={<Map size={16} />}>
              {barriosFiltrados.length > 0 ? (
                <select
                  value={form.barrio}
                  onChange={e => setForm({ ...form, barrio: e.target.value })}
                  required
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none appearance-none"
                >
                  <option value="">Seleccione Barrio...</option>
                  {barriosFiltrados.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              ) : (
                <input
                  value={form.barrio}
                  onChange={e => setForm({ ...form, barrio: e.target.value })}
                  placeholder="Escriba el barrio..."
                  required
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none"
                />
              )}
            </FormGroup>

            <FormGroup label="Dirección Exacta" icon={<MapPin size={16} />}>
              <input
                value={form.direccion}
                onChange={e => setForm({ ...form, direccion: e.target.value })}
                required
                placeholder="Ej: Calle 45 # 12-30"
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none"
              />
            </FormGroup>
          </div>

          {/* Contacto Admin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup label="WhatsApp Admin" icon={<Phone size={16} />}>
              <div className="relative flex items-center">
                <span className="absolute left-5 text-slate-400 font-bold text-sm">+57</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={form.telefonoAdmin}
                  onChange={e => setForm({ ...form, telefonoAdmin: e.target.value.replace(/\D/g, '') })}
                  className="w-full pl-14 pr-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none"
                />
              </div>
            </FormGroup>

            <FormGroup label="E-mail Admin" icon={<Mail size={16} />}>
              <input
                type="email"
                value={form.emailAdmin}
                onChange={e => setForm({ ...form, emailAdmin: e.target.value })}
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none"
              />
            </FormGroup>
          </div>

          <FormGroup label="Estado Operativo" icon={<Activity size={16} />}>
            <div className="flex gap-4">
              {['activo', 'inactivo'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setForm({...form, estado: status})}
                  className={`flex-1 py-3 rounded-2xl font-bold capitalize transition-all border ${
                    form.estado === status 
                    ? 'bg-blue-900 border-blue-900 text-white shadow-lg shadow-blue-100' 
                    : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </FormGroup>
        </form>

        <div className="p-10 pt-4 flex gap-4">
          <button 
            disabled={uploading}
            onClick={onClose} 
            type="button" 
            className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
          >
            Cancelar
          </button>
          <button 
            disabled={uploading}
            onClick={handleSubmit}
            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Check size={20} />
                <span>{edificio ? 'Guardar Cambios' : 'Registrar Edificio'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const FormGroup = ({ label, icon, children }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
      <span className="text-blue-500">{icon}</span>
      {label}
    </label>
    {children}
  </div>
);

export default EdificioModal;