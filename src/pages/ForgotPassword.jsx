import React, { useState } from 'react';
import { auth, db } from '../api/firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const q = query(
        collection(db, 'usuarios'),
        where('email', '==', email.trim().toLowerCase())
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Este correo no se encuentra registrado.');
        setLoading(false);
        return;
      }

      await sendPasswordResetEmail(auth, email.trim());
      setSubmitted(true);

      setTimeout(() => {
        navigate('/login');
      }, 4000);

    } catch (err) {
      setError('Error al enviar el correo. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-x-hidden">

      {/* SECCIÓN IZQUIERDA: IDÉNTICA AL LOGIN */}
      <div className="hidden lg:flex lg:w-[40%] xl:w-[35%] bg-slate-900 relative">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1577412647305-991150c7d163?q=80&w=2070&auto=format&fit=crop"
            className="w-full h-full object-cover opacity-40 grayscale"
            alt="Seguridad"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        </div>
        <div className="relative z-10 self-end p-16">
          <div className="h-1.5 w-12 bg-orange-500 mb-6" />
          <h2 className="text-white text-3xl font-bold leading-tight mb-4 tracking-tighter">
            Protegemos el acceso <br /> a tu información.
          </h2>
          <p className="text-slate-400 text-lg font-medium">Santander, Colombia.</p>
        </div>
      </div>

      {/* SECCIÓN DERECHA: FORMULARIO */}
      <div className="w-full lg:w-[60%] xl:w-[65%] flex items-center justify-center p-6 sm:p-12 lg:p-20">
        <div className="w-full max-w-[420px] flex flex-col min-h-[550px]">

          <Link to="/login" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-12 transition-colors w-fit group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Volver al acceso
          </Link>

          {!submitted ? (
            <>
              <div className="mb-10 text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-4 uppercase">
                  Recuperar <span className="text-orange-500 italic">Acceso</span>
                </h1>
                <p className="text-slate-500 font-medium text-lg leading-relaxed">
                  Ingresa tu correo institucional o personal para restablecer tu cuenta.
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-6">
                {error && (
                  <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
                    <AlertCircle className="text-orange-600 shrink-0" size={18} />
                    <p className="text-orange-800 text-[10px] font-black uppercase tracking-widest">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Correo Registrado</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 focus:bg-white transition-all outline-none text-sm font-bold text-slate-900"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-10 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] bg-slate-900 text-white hover:bg-blue-600 transition-all duration-300 shadow-lg shadow-blue-900/10 active:scale-95 flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : (
                      <>VERIFICAR Y ENVIAR <ArrowRight size={16} /></>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="bg-white border border-slate-100 p-10 rounded-[2.5rem] text-center space-y-6 shadow-2xl shadow-slate-200/50 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-blue-200">
                <CheckCircle2 className="text-white" size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-slate-900 font-black text-xl uppercase tracking-tighter">¡Correo Enviado!</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Revisa tu bandeja de entrada. <br /> Redirigiendo al acceso en breve...
                </p>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden max-w-[200px] mx-auto">
                <div className="bg-blue-600 h-full animate-progress" />
              </div>
            </div>
          )}

          <footer className="mt-auto pt-16 flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-slate-100">
            <p className="text-slate-300 text-[9px] font-black uppercase tracking-[0.3em]">© 2026 EDIFICIOS COLOMBIA</p>
            <div className="flex gap-8">
              <a href="#" className="text-slate-400 hover:text-blue-600 text-[9px] font-black uppercase tracking-widest transition-colors">Ayuda</a>
              <a href="#" className="text-slate-400 hover:text-blue-600 text-[9px] font-black uppercase tracking-widest transition-colors">Legal</a>
            </div>
          </footer>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 4s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;