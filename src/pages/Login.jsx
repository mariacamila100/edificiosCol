import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../api/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ArrowRight, Loader2, Lock, Mail, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();

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

      // 1. LÓGICA DE IDENTIFICACIÓN (RESIDENTE POR UNIDAD O ADMIN POR EMAIL)
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

      // 2. AUTENTICACIÓN CON FIREBASE AUTH
      const userCredential = await signInWithEmailAndPassword(auth, emailParaAuth, password);
      const firebaseUid = userCredential.user.uid;

      // 3. BÚSQUEDA DEL PERFIL POR CAMPO 'uid'
      const qPerfil = query(
        collection(db, 'usuarios'),
        where('uid', '==', firebaseUid)
      );
      const querySnap = await getDocs(qPerfil);

      if (!querySnap.empty) {
        const finalUserData = querySnap.docs[0].data();

        // Guardamos el usuario en localStorage
        localStorage.setItem("usuario", JSON.stringify(finalUserData));

        if (finalUserData.rol === 'admin') {
          navigate('/admin');
        } else {
          navigate('/panel');
        }
      } else {
        await signOut(auth);
        throw new Error('Su perfil no está configurado correctamente en la base de datos.');
      }

    } catch (err) {
      console.error("Error en login:", err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Correo o contraseña incorrectos.');
      } else {
        setError(err.message || 'Error al intentar ingresar.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-x-hidden">

      {/* SECCIÓN IZQUIERDA: IMAGEN */}
      <div className="hidden lg:flex lg:w-[40%] xl:w-[35%] bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
            className="w-full h-full object-cover opacity-40 grayscale"
            alt="Edificios Colombia"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        </div>
        <div className="relative z-10 self-end p-16 w-full">
          <div className="h-1.5 w-12 bg-orange-500 mb-6" />
          <h2 className="text-white text-3xl font-bold leading-tight mb-4 tracking-tighter">
            Gestión inteligente para <br /> copropiedades modernas.
          </h2>
          <p className="text-slate-400 text-lg font-medium">Santander, Colombia.</p>
        </div>
      </div>

      {/* SECCIÓN DERECHA: FORMULARIO */}
      <div className="w-full lg:w-[60%] xl:w-[65%] flex items-center justify-center p-6 sm:p-12 lg:p-20">
        <div className="w-full max-w-[420px] flex flex-col">

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-4 uppercase">
              Acceso al <span className="text-orange-500 italic">Portal</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              Bienvenido de nuevo. Ingrese sus credenciales para continuar.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
                <p className="text-red-700 text-[10px] font-black uppercase tracking-widest">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Usuario o Correo</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Ej: 101 o admin@correo.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 focus:bg-white transition-all outline-none text-sm font-bold text-slate-900"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Contraseña</label>
                <Link to="/forgot-password" size={18} className="text-[10px] font-black uppercase text-blue-600 hover:text-orange-500 transition-colors tracking-widest">
                  ¿Olvidaste el acceso?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 focus:bg-white transition-all outline-none text-sm font-bold text-slate-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 px-1 py-2">
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-[11px] leading-relaxed text-slate-500 font-medium cursor-pointer">
                Acepto los <span className="text-blue-600 font-bold uppercase tracking-tighter">Términos</span> y la <span className="text-blue-600 font-bold uppercase tracking-tighter">Política de Datos</span>.
              </label>
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-10 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 shadow-lg
                  ${acceptedTerms
                    ? 'bg-slate-900 hover:bg-blue-600 text-white shadow-blue-900/10 active:scale-95'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}`}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    INGRESAR AHORA
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          <footer className="mt-auto pt-16 flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-slate-100">
            <p className="text-slate-300 text-[9px] font-black uppercase tracking-[0.3em]">© 2026 EDIFICIOS COLOMBIA</p>
            <div className="flex gap-8">
              <a href="#" className="text-slate-400 hover:text-blue-600 text-[9px] font-black uppercase tracking-widest transition-colors">Soporte</a>
              <a href="#" className="text-slate-400 hover:text-blue-600 text-[9px] font-black uppercase tracking-widest transition-colors">Privacidad</a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;