import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../api/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { 
  ArrowRight, Loader2, Lock, Mail, Eye, EyeOff, 
  FileText, Bell, MessageSquare, ShieldCheck, 
  MapPin, CheckCircle2, ChevronLeft
} from 'lucide-react';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();

  // Lista de beneficios (Visible en Desktop)
  const servicios = [
    { icon: FileText, title: "Gestión Documental", desc: "Acceso inmediato a actas y reglamentos." },
    { icon: Bell, title: "Comunicación Directa", desc: "Recibe anuncios importantes en tiempo real." },
    { icon: MessageSquare, title: "Módulo de PQRS", desc: "Radica y haz seguimiento a tus solicitudes." },
    { icon: CheckCircle2, title: "Transparencia", desc: "Consulta informes de gestión actualizados." }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError('Debes aceptar el tratamiento de datos para continuar.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      let emailParaAuth = identifier.trim();

      // Lógica de acceso por número de Unidad (Residentes)
      if (!identifier.includes('@')) {
        const q = query(
          collection(db, 'usuarios'),
          where('unidad', '==', identifier.trim()),
          where('rol', '==', 'residente')
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error('La unidad no existe o no tiene perfil asignado.');
        }

        const userData = querySnapshot.docs[0].data();
        // Construcción de correo virtual basado en tu lógica de Firebase
        emailParaAuth = `${userData.unidad}${userData.nombreApellido
          .toLowerCase()
          .replace(/\s/g, '')}@${userData.edificioId}.com`;
      }

      const userCredential = await signInWithEmailAndPassword(auth, emailParaAuth, password);
      
      // Verificar perfil en Firestore
      const qPerfil = query(collection(db, 'usuarios'), where('uid', '==', userCredential.user.uid));
      const querySnap = await getDocs(qPerfil);

      if (!querySnap.empty) {
        const finalUserData = querySnap.docs[0].data();
        localStorage.setItem("usuario", JSON.stringify(finalUserData));
        
        // Redirección según rol
        finalUserData.rol === 'admin' ? navigate('/admin') : navigate('/panel');
      } else {
        await signOut(auth);
        throw new Error('Su perfil no está configurado correctamente en el sistema.');
      }
    } catch (err) {
      const errorMap = {
        'auth/wrong-password': 'La contraseña ingresada es incorrecta.',
        'auth/user-not-found': 'El usuario no se encuentra registrado.',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.'
      };
      setError(errorMap[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    /* pt-32: Espacio para que el Navbar (80px) no tape el contenido.
       lg:pt-0: En escritorio usamos flex-center para que se vea equilibrado.
    */
    <div className="min-h-screen flex bg-white font-sans overflow-x-hidden pt-32 lg:pt-20 selection:bg-blue-100">
      
      {/* ================= SECCIÓN IZQUIERDA: BRANDING (Solo Desktop) ================= */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-slate-900 relative overflow-hidden flex-col">
        {/* Background con imagen y overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070"
            className="w-full h-full object-cover opacity-20 scale-110"
            alt="Arquitectura"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/30 via-slate-900/95 to-slate-900" />
        </div>

        <div className="relative z-10 flex flex-col h-full p-16 animate-in fade-in slide-in-from-left-10 duration-1000">
          {/* Badge Superior */}
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2.5 bg-blue-600 rounded-xl shadow-xl shadow-blue-600/20">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <span className="text-white font-black tracking-[0.3em] text-[10px] uppercase">Ecosistema Digital</span>
          </div>

          <div className="mb-12">
            <h2 className="text-white text-5xl font-black leading-[0.9] mb-6 tracking-tighter uppercase italic">
              Gestiona tu <br />
              <span className="text-blue-500 not-italic">propiedad.</span>
            </h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm italic">
              "La tecnología al servicio de tu tranquilidad y la de tu familia."
            </p>
          </div>

          {/* Listado de Servicios */}
          <div className="space-y-8 mb-auto">
            {servicios.map((s, i) => (
              <div key={i} className="flex items-start gap-5 group cursor-default">
                <div className="mt-1 p-3 bg-white/5 border border-white/10 rounded-2xl group-hover:bg-blue-600/20 group-hover:border-blue-500/50 transition-all duration-500">
                  <s.icon className="text-blue-500" size={20} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1 group-hover:text-blue-400 transition-colors">
                    {s.title}
                  </h4>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed max-w-[260px]">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Branding */}
          <div className="pt-8 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-blue-500" />
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Santander • Colombia</p>
            </div>
            <span className="text-white/20 font-black text-2xl tracking-tighter italic">2026</span>
          </div>
        </div>
      </div>

      {/* ================= SECCIÓN DERECHA: FORMULARIO ================= */}
      <div className="w-full lg:w-[55%] xl:w-[60%] flex items-start lg:items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-10 duration-1000">
          
          {/* Botón Volver (Móvil) */}
          <Link to="/" className="inline-flex lg:hidden items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-8 hover:text-blue-600 transition-colors">
            <ChevronLeft size={16} /> Volver al Inicio
          </Link>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tighter mb-4 uppercase italic leading-none">
              Acceso <br />
              <span className="text-blue-600 not-italic">Privado</span>
            </h1>
            <p className="text-slate-400 font-medium text-sm sm:text-base leading-relaxed">
              Ingresa tus credenciales para administrar tu unidad o consultar información de tu edificio.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-2xl animate-in zoom-in-95">
                <p className="text-rose-700 text-[10px] font-black uppercase tracking-widest">{error}</p>
              </div>
            )}

            {/* Input Identificador */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Número de Unidad o Email</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors border-r pr-4 border-slate-100">
                  <Mail size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Ej: 502 o admin@edificio.com"
                  className="w-full pl-16 pr-4 py-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600 focus:bg-white transition-all outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300 shadow-sm"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Input Contraseña */}
            <div className="space-y-2">
              <div className="flex justify-between px-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contraseña</label>
                <Link to="/forgot-password" size={18} className="text-[9px] font-black uppercase text-blue-600 tracking-tighter hover:underline transition-all">¿Olvidaste tu acceso?</Link>
              </div>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors border-r pr-4 border-slate-100">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-16 pr-14 py-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600 focus:bg-white transition-all outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300 shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Checkbox Términos */}
            <div className="flex items-start gap-3 px-2 py-1">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-slate-200 rounded-lg focus:ring-blue-500 cursor-pointer transition-all"
                />
              </div>
              <label htmlFor="terms" className="text-[10px] leading-relaxed text-slate-400 font-medium cursor-pointer select-none">
                Confirmo que he leído y acepto los <span className="text-blue-600 font-bold">Términos de Servicio</span> y la <span className="text-blue-600 font-bold">Política de Datos</span>.
              </label>
            </div>

            {/* Botón de Acción */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all duration-500 
                ${acceptedTerms 
                  ? 'bg-slate-900 hover:bg-blue-600 text-white shadow-2xl shadow-slate-900/20 active:scale-[0.97]' 
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>Iniciar Sesión <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          {/* Ayuda / Soporte */}
          <div className="mt-12 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              ¿Aún no tienes cuenta? <br className="sm:hidden" />
              <span className="text-blue-600 cursor-pointer hover:underline ml-1">Contacta a tu administración</span>
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Login;