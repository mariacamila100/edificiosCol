import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, User, Mail, Phone, Lock, Building, Home, Check, Loader2, Eye, EyeOff, RefreshCw, Copy 
} from 'lucide-react';
// IMPORTAMOS DESDE TU SERVICIO
import { createUsuario, updateUsuario, generarPasswordSegura, copiarAlPortapapeles } from '../services/usuarios.service';
import { getEdificios, getApartamentosPorEdificio } from '../services/edificios.services';
import { alertSuccess } from './Alert';

const UsuarioModal = ({ usuario, onClose, onSaved }) => {
  const [edificios, setEdificios] = useState([]);
  const [apartamentos, setApartamentos] = useState([]);
  const [loadingAptos, setLoadingAptos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const [form, setForm] = useState({
    nombreApellido: '',
    telefono: '',
    email: '',
    password: '',
    edificioId: '',
    unidad: '',
  });

  const cargarApartamentos = useCallback(async (idEdificio) => {
    if (!idEdificio) {
      setApartamentos([]);
      return;
    }
    setLoadingAptos(true);
    try {
      const data = await getApartamentosPorEdificio(idEdificio);
      const listaLimpia = Array.isArray(data) ? data : (data?.apartamentos || []);
      const sorted = listaLimpia.sort((a, b) => {
        const valA = String(a.unidad || a.titulo || '');
        const valB = String(b.unidad || b.titulo || '');
        return valA.localeCompare(valB, undefined, { numeric: true });
      });
      setApartamentos(sorted);
    } catch (error) {
      console.error("Error en cargarApartamentos:", error);
      setApartamentos([]);
    } finally {
      setLoadingAptos(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const eds = await getEdificios();
      setEdificios(eds || []);

      if (usuario) {
        setForm({
          nombreApellido: usuario.nombreApellido || '',
          telefono: usuario.telefono || '',
          email: usuario.email || '',
          edificioId: usuario.edificioId || '',
          unidad: usuario.unidad || '',
          password: '*****'
        });
        if (usuario.edificioId) cargarApartamentos(usuario.edificioId);
      } else {
        // GENERAR PASSWORD AUTOMÁTICO AL INICIO
        setForm(prev => ({ ...prev, password: generarPasswordSegura() }));
      }
    };
    init();
  }, [usuario, cargarApartamentos]);

  const handleRegenerarPassword = () => {
    setForm(prev => ({ ...prev, password: generarPasswordSegura() }));
    setCopiado(false);
  };

  const handleCopiarPassword = async () => {
    const exito = await copiarAlPortapapeles(form.password);
    if (exito) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const handleEdificioChange = (e) => {
    const id = e.target.value;
    setForm(prev => ({ ...prev, edificioId: id, unidad: '' }));
    cargarApartamentos(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.edificioId || !form.unidad) return;
    
    setLoading(true);
    try {
      if (usuario) {
        await updateUsuario(usuario.id, {
          nombreApellido: form.nombreApellido,
          telefono: form.telefono,
          edificioId: form.edificioId,
          unidad: form.unidad
        });
        alertSuccess('Actualizado', 'Datos guardados correctamente');
      } else {
        await createUsuario(form);
        alertSuccess('Éxito', 'Residente creado correctamente');
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-50">
          <div>
            <h3 className="text-xl font-black text-slate-800">
              {usuario ? 'Editar Residente' : 'Nuevo Residente'}
            </h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Asignación de Unidad</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto max-h-[80vh]">
          
          <IconInput 
            label="Nombre Completo"
            icon={User}
            value={form.nombreApellido}
            onChange={e => setForm({ ...form, nombreApellido: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <IconInput 
              label="Email / Usuario"
              icon={Mail}
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              disabled={!!usuario}
            />
            <IconInput 
              label="Teléfono"
              icon={Phone}
              value={form.telefono}
              onChange={e => setForm({ ...form, telefono: e.target.value })}
            />
          </div>

          {!usuario && (
            <div className="relative">
              <IconInput 
                label="Contraseña Sugerida"
                icon={Lock}
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                rightElement={
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button type="button" onClick={handleRegenerarPassword} className="p-2 text-slate-400 hover:text-green-600 transition-colors" title="Generar otra">
                      <RefreshCw size={18} />
                    </button>
                    <button type="button" onClick={handleCopiarPassword} className={`p-2 transition-colors ${copiado ? 'text-green-500' : 'text-slate-400 hover:text-orange-500'}`} title="Copiar clave">
                      {copiado ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                }
              />
              <p className="text-[9px] text-blue-500 font-bold mt-1 ml-1 uppercase">Generada automáticamente</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Edificio</label>
              <div className="relative group">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <select
                  value={form.edificioId}
                  onChange={handleEdificioChange}
                  required
                  className="w-full pl-12 pr-10 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500/30 transition-all appearance-none"
                >
                  <option value="">Seleccionar...</option>
                  {edificios.map(ed => (
                    <option key={ed.id} value={ed.id}>{ed.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unidad</label>
              <div className="relative group">
                <Home className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${loadingAptos ? 'text-blue-500' : 'text-slate-400'}`} size={18} />
                <select
                  value={form.unidad}
                  onChange={e => setForm({ ...form, unidad: e.target.value })}
                  required
                  disabled={!form.edificioId || loadingAptos}
                  className="w-full pl-12 pr-10 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500/30 transition-all appearance-none disabled:opacity-50"
                >
                  <option value="">
                    {loadingAptos ? 'Cargando...' : !form.edificioId ? 'Elige edificio' : 'Seleccionar...'}
                  </option>
                  {apartamentos.map(ap => (
                    <option key={ap.id || ap._id} value={ap.unidad || ap.titulo}>
                      {ap.unidad || ap.titulo}
                    </option>
                  ))}
                </select>
                {loadingAptos && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 className="animate-spin text-blue-500" size={16} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">
              Cerrar
            </button>
            <button type="submit" disabled={loading || !form.unidad} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black flex justify-center items-center gap-2 hover:bg-black shadow-xl shadow-slate-200 transition-all disabled:opacity-40">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><Check size={20} /> Guardar</>}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

const IconInput = ({ label, icon: Icon, rightElement, ...props }) => (
  <div className="space-y-1.5">
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
      <input 
        {...props} 
        className={`w-full ${rightElement ? 'pr-32' : 'pr-4'} pl-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500/30 transition-all disabled:bg-slate-100 disabled:text-slate-400`}
      />
      {rightElement && rightElement}
    </div>
  </div>
);

export default UsuarioModal;