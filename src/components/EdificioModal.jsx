import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { departamentosColombia } from '../data/colombia';
import { createEdificio, updateEdificio } from '../services/edificios.services';
import { alertSuccess } from './Alert';
import { 
  Building2, MapPin, Phone, Mail, 
  Globe, Activity, X, Check, ArrowRight, Map
} from 'lucide-react';

const EdificioModal = ({ edificio, onClose, onSaved }) => {
  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
    departamento: 'Santander',
    ciudad: 'Bucaramanga',
    barrio: '', // Nuevo campo
    telefonoAdmin: '',
    emailAdmin: '',
    estado: 'activo'
  });

  const [ciudadesFiltradas, setCiudadesFiltradas] = useState([]);
  const [barriosFiltrados, setBarriosFiltrados] = useState([]);

  // Filtrar Ciudades cuando cambia el Departamento
  useEffect(() => {
    const deptoEncontrado = departamentosColombia.find(d => d.departamento === form.departamento);
    if (deptoEncontrado) {
      setCiudadesFiltradas(deptoEncontrado.ciudades);
    }
  }, [form.departamento]);

  // Filtrar Barrios cuando cambia la Ciudad (Asumiendo que ciudades es un array de objetos)
  useEffect(() => {
    // Si tu data de ciudades tiene objetos con barrios:
    const ciudadEncontrada = ciudadesFiltradas.find(c => (c.nombre || c) === form.ciudad);
    if (ciudadEncontrada && ciudadEncontrada.barrios) {
      setBarriosFiltrados(ciudadEncontrada.barrios);
    } else {
      setBarriosFiltrados([]); // Fallback si no hay barrios cargados
    }
  }, [form.ciudad, ciudadesFiltradas]);

  useEffect(() => {
    if (edificio) {
      const telLimpio = edificio.telefonoAdmin?.startsWith('57') 
        ? edificio.telefonoAdmin.slice(2) 
        : edificio.telefonoAdmin;

      setForm({
        nombre: edificio.nombre || '',
        direccion: edificio.direccion || '',
        departamento: edificio.departamento || 'Santander',
        ciudad: edificio.ciudad || '',
        barrio: edificio.barrio || '',
        telefonoAdmin: telLimpio || '',
        emailAdmin: edificio.emailAdmin || '',
        estado: edificio.estado || 'activo'
      });
    }
  }, [edificio]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataFinal = {
      ...form,
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
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" />

      <div className="relative bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden animate-slideUp">
        
        {/* Header */}
        <div className="bg-slate-50/50 px-10 py-8 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
              <Building2 className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800">
                {edificio ? 'Editar Edificio' : 'Nuevo Edificio'}
              </h3>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Configuración Regional</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          <FormGroup label="Nombre Comercial" icon={<Building2 size={16} />}>
            <input
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              required
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-slate-700 font-medium"
            />
          </FormGroup>

          {/* Ubicación Triple: Depto, Ciudad, Barrio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup label="Departamento" icon={<Globe size={16} />}>
              <select
                value={form.departamento}
                onChange={e => setForm({ ...form, departamento: e.target.value, ciudad: '', barrio: '' })}
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none appearance-none cursor-pointer"
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
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none appearance-none cursor-pointer"
              >
                <option value="">Seleccione Ciudad...</option>
                {ciudadesFiltradas.map(c => (
                  <option key={c.nombre || c} value={c.nombre || c}>{c.nombre || c}</option>
                ))}
              </select>
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup label="Barrio / Sector" icon={<Map size={16} />}>
              {barriosFiltrados.length > 0 ? (
                <select
                  value={form.barrio}
                  onChange={e => setForm({ ...form, barrio: e.target.value })}
                  required
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none appearance-none cursor-pointer"
                >
                  <option value="">Seleccione Barrio...</option>
                  {barriosFiltrados.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
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
                    ? 'bg-blue-900 border-blue-900 text-white shadow-lg' 
                    : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </FormGroup>
        </form>

        <div className="p-10 pt-0 flex gap-4">
          <button onClick={onClose} type="button" className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all">
            Descartar
          </button>
          <button 
            onClick={handleSubmit}
            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2"
          >
            <Check size={20} />
            <span>{edificio ? 'Guardar Cambios' : 'Registrar Edificio'}</span>
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