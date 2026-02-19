import React from 'react';
import { 
  Mail, Phone, Instagram, 
  Facebook, Linkedin, Building2, MapPin 
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#020617] text-white pt-5 pb-20">
      
      <div className="container mx-auto px-6">
        
        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-14 mb-20">
          
          {/* MARCA */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center">
                <Building2 size={22} className="text-blue-500" />
              </div>
              <span className="text-2xl font-black tracking-tight">
                EDIFICIOS<span className="text-blue-500">COL</span>
              </span>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Gestión inmobiliaria moderna con enfoque estratégico, transparencia
              legal y valorización sostenible en Bucaramanga.
            </p>
          </div>

          {/* NAVEGACIÓN */}
          <div className="space-y-8">
            <h4 className="text-[11px] font-black uppercase tracking-[0.35em] text-blue-500">
              Navegación
            </h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li>
                <a href="#" className="hover:text-white transition-colors duration-300">
                  Propiedades
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-300">
                  Servicios
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-300">
                  Sobre Nosotros
                </a>
              </li>
            </ul>
          </div>

          {/* LEGAL */}
          <div className="space-y-8">
            <h4 className="text-[11px] font-black uppercase tracking-[0.35em] text-blue-500">
              Legal
            </h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li>
                <a href="#" className="hover:text-white transition-colors duration-300">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-300">
                  Política de Privacidad
                </a>
              </li>
            </ul>
          </div>

          {/* SOCIAL */}
          <div className="space-y-8">
            <h4 className="text-[11px] font-black uppercase tracking-[0.35em] text-blue-500">
              Síguenos
            </h4>

            <div className="flex gap-4">
              {[Instagram, Facebook, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 transition-all duration-300"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* DIVISOR */}
        <div className="border-t border-slate-900 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest text-center md:text-left">
            © {new Date().getFullYear()} EdificiosCol — Todos los derechos reservados.
          </p>

          <div className="flex items-center gap-2 text-slate-500">
            <MapPin size={14} />
            <span className="text-[11px] font-bold uppercase tracking-widest">
              Cabecera, Bucaramanga
            </span>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
