import React from 'react';
import { 
  Mail, Phone, Instagram, 
  Facebook, Linkedin, Building2, MapPin 
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-white pt-20 pb-10"> {/* Cambiado a slate-950 para más contraste */}
      
      <div className="container mx-auto px-6">
        
        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          
          {/* MARCA */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Building2 size={22} className="text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase italic">
                Edificios<span className="text-blue-500">COL</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Gestión inmobiliaria moderna con enfoque estratégico, transparencia
              legal y valorización sostenible en Bucaramanga.
            </p>
          </div>

          {/* NAVEGACIÓN */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">
              Menú
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              {['Propiedades', 'Servicios', 'Nosotros'].map(item => (
                <li key={item}>
                    <a href="#" className="hover:text-blue-400 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACTO */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">
              Contacto
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-center gap-2 hover:text-white transition-colors">
                    <Phone size={14} className="text-blue-400"/> +57 300 000 0000
                </li>
                <li className="flex items-center gap-2 hover:text-white transition-colors">
                    <Mail size={14} className="text-blue-400"/> hola@immopro.com
                </li>
            </ul>
          </div>

          {/* SOCIAL */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">
              Síguenos
            </h4>
            <div className="flex gap-3">
              {[Instagram, Facebook, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 hover:bg-blue-600/10 transition-all duration-300"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* DIVISOR Y COPYRIGHT */}
        <div className="border-t border-slate-800 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} EdificiosCol — Todos los derechos reservados.
          </p>

          <div className="flex items-center gap-2 text-slate-400">
            <MapPin size={16} className="text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Cabecera, Bucaramanga
            </span>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;