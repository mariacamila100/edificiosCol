import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, User, Mail, Phone, Lock, Building, Home, Check 
} from 'lucide-react';
import { createUsuario, updateUsuario } from '../services/usuarios.service';
import { getEdificios, getApartamentosPorEdificio } from '../services/edificios.services';
import { alertSuccess } from './Alert';

const UsuarioModal = ({ usuario, onClose, onSaved }) => {
  const [edificios, setEdificios] = useState([]);
  const [apartamentos, setApartamentos] = useState([]);
  const [loadingAptos, setLoadingAptos] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nombreApellido: '',
    telefono: '',
    email: '',
    password: '',
    edificioId: '',
    unidad: '',
  });

  // Cargar apartamentos de forma memorizada para evitar re-renders innecesarios
  const cargarApartamentos = useCallback(async (edificioId) => {
    if (!edificioId) {
      setApartamentos([]);
      return;
    }
    setLoadingAptos(true);
    try {
      const data = await getApartamentosPorEdificio(edificioId, 'activos');
      // Ordenamos las unidades numéricamente
      const sortedAptos = data.sort((a, b) => a.unidad.localeCompare(b.unidad, undefined, {numeric: true}));
      setApartamentos(sortedAptos);
    } catch (error) {
      console.error("Error cargando apartamentos:", error);
    } finally {
      setLoadingAptos(false);
    }
  }, []);

  useEffect(() => {
    getEdificios().then(setEdificios);

    if (usuario) {
      setForm({
        nombreApellido: usuario.nombreApellido || '',
        telefono: usuario.telefono || '',
        email: usuario.email || '',
        edificioId: usuario.edificioId || '',
        unidad: usuario.unidad || '',
        password: '*****'
      });
      cargarApartamentos(usuario.edificioId);
    }
  }, [usuario, cargarApartamentos]);

  const handleEdificioChange = (e) => {
    const id = e.target.value;
    setForm(prev => ({ ...prev, edificioId: id, unidad: '' }));
    cargarApartamentos(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (usuario) {
        await updateUsuario(usuario.id, {
          nombreApellido: form.nombreApellido,
          telefono: form.telefono,
          edificioId: form.edificioId,
          unidad: form.unidad
        });
        alertSuccess('Actualizado', 'Residente modificado con éxito');
      } else {
        await createUsuario(form);
        alertSuccess('Registrado', 'Nuevo residente creado con éxito');
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-fadeIn">
        
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black text-slate-800">
              {usuario ? 'Editar Residente' : 'Nuevo Residente'}
            </h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Información de cuenta y ubicación</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto max-h-[80vh]">
          
          <IconInput 
            label="Nombre y Apellido"
            icon={User}
            placeholder="Nombre completo"
            value={form.nombreApellido}
            onChange={e => setForm({ ...form, nombreApellido: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <IconInput 
              label="Email / Usuario"
              icon={Mail}
              type="email"
              placeholder="correo@ejemplo.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              disabled={!!usuario}
            />
            <IconInput 
              label="Teléfono"
              icon={Phone}
              type="tel"
              placeholder="Ej: 3001234567"
              value={form.telefono}
              onChange={e => setForm({ ...form, telefono: e.target.value })}
            />
          </div>

          {!usuario && (
            <IconInput 
              label="Contraseña"
              icon={Lock}
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          )}

          <hr className="border-slate-50 my-2" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Selector de Edificios */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Edificio Asignado
              </label>
              <div className="relative group">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <select
                  value={form.edificioId}
                  onChange={handleEdificioChange}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500/30 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Seleccionar...</option>
                  {edificios.map(edi => (
                    <option key={edi.id} value={edi.id}>{edi.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selector de Apartamentos (Dependiente) */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {loadingAptos ? 'Cargando Unidades...' : 'Unidad / Apto'}
              </label>
              <div className="relative group">
                <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <select
                  value={form.unidad}
                  onChange={e => setForm({ ...form, unidad: e.target.value })}
                  required
                  disabled={!form.edificioId || loadingAptos}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500/30 transition-all appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">
                    {!form.edificioId ? 'Elija edificio' : 'Seleccionar...'}
                  </option>
                  {apartamentos.map(ap => (
                    <option key={ap.id} value={ap.unidad}>
                      {ap.unidad}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black flex justify-center items-center gap-2 hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : <><Check size={20} /> Guardar Residente</>}
            </button>
          </div>

        </form>
      </div>
    </div>,
    document.body
  );
};

// Subcomponente para Inputs con Icono
const IconInput = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-1">
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative group">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
      <input 
        {...props} 
        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500/30 transition-all disabled:opacity-50"
      />
    </div>
  </div>
);

export default UsuarioModal;