import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../api/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { 
  ArrowRight, Loader2, Lock, Mail, Eye, EyeOff, 
  FileText, CreditCard, Bell, MessageSquare, ShieldCheck 
} from 'lucide-react';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();

  // SERVICIOS A MOSTRAR
  const servicios = [
    { icon: FileText, title: "Documentos", desc: "Descarga actas y reglamentos" },

    { icon: Bell, title: "Anuncios", desc: "Notificaciones en tiempo real" },
    { icon: MessageSquare, title: "PQRS", desc: "Atención directa con administración" }
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
        emailParaAuth = `${userData.unidad}${userData.nombreApellido
          .toLowerCase()
          .replace(/\s/g, '')}@${userData.edificioId}.com`;
      }

      const userCredential = await signInWithEmailAndPassword(auth, emailParaAuth, password);
      const firebaseUid = userCredential.user.uid;

      const qPerfil = query(
        collection(db, 'usuarios'),
        where('uid', '==', firebaseUid)
      );
      const querySnap = await getDocs(qPerfil);

      if (!querySnap.empty) {
        const finalUserData = querySnap.docs[0].data();
        localStorage.setItem("usuario", JSON.stringify(finalUserData));
        finalUserData.rol === 'admin' ? navigate('/admin') : navigate('/panel');
      } else {
        await signOut(auth);
        throw new Error('Su perfil no está configurado correctamente.');
      }
    } catch (err) {
      setError(err.code === 'auth/wrong-password' ? 'Contraseña incorrecta.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      
      {/* SECCIÓN IZQUIERDA: SERVICIOS Y VITRINA */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-slate-900 relative overflow-hidden flex-col">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070"
            className="w-full h-full object-cover opacity-20"
            alt="Edificio"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 via-slate-900/90 to-slate-900" />
        </div>

        <div className="relative z-10 flex flex-col h-full p-16">
          <div className="flex items-center gap-3 mb-12">
            <div className="p-2 bg-blue-600 rounded-lg">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <span className="text-white font-black tracking-[0.3em] text-xs uppercase">Portal Residente</span>
          </div>

          <div className="mb-auto">
            <h2 className="text-white text-4xl font-black leading-tight mb-6 tracking-tighter uppercase">
              Todo lo que necesitas <br /> en un solo <span className="text-blue-500">Lugar.</span>
            </h2>
            <p className="text-slate-400 text-lg font-medium max-w-sm">
              Simplifica tu vida en la copropiedad con herramientas diseñadas para tu comodidad.
            </p>
          </div>

          {/* LISTA DE SERVICIOS */}
          <div className="grid grid-cols-1 gap-6 mb-10">
            {servicios.map((s, i) => (
              <div key={i} className="flex items-center gap-5 group">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl group-hover:bg-blue-600/20 group-hover:border-blue-500/50 transition-all duration-300">
                  <s.icon className="text-blue-500" size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm uppercase tracking-wider">{s.title}</h4>
                  <p className="text-slate-500 text-xs font-medium">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/10">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
              Bucaramanga • Santander • Colombia
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: FORMULARIO */}
      <div className="w-full lg:w-[55%] xl:w-[60%] flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-[400px]">
          
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 uppercase">
              Iniciar <span className="text-blue-600 italic">Sesión</span>
            </h1>
            <p className="text-slate-400 font-medium text-sm">
              Digita tus datos para acceder a los beneficios de tu unidad.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl animate-shake">
                <p className="text-red-700 text-[10px] font-black uppercase tracking-widest">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Unidad o Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Ej: 403 o correo@app.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all outline-none text-sm font-bold text-slate-900"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between px-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contraseña</label>
                <Link to="/forgot-password" size={18} className="text-[9px] font-black uppercase text-blue-600 tracking-tighter">¿Problemas?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all outline-none text-sm font-bold text-slate-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 px-1 py-1">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label className="text-[10px] text-slate-500 font-medium cursor-pointer">
                Acepto el tratamiento de <span className="text-blue-600 font-bold">Datos Personales</span>.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 
                ${acceptedTerms ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Entrar al Portal <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;