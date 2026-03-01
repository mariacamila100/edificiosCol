import React, { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import imagenFondo from '../assets/edi.jpeg';

const Hero = ({ onSearch }) => {
  const [busqueda, setBusqueda] = useState('');

  return (
    <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
      {/* Fondo con Overlay Sólido */}
      <div className="absolute inset-0 z-0">
        <img src={imagenFondo} alt="Fondo" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-slate-900/60" /> 
      </div>

      <div className="relative z-10 text-center px-4 w-full max-w-5xl -mt-0.1">
        <h1 className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tighter uppercase">
          Encuentra tu <span className="text-orange-500">Hogar</span>
        </h1>
        <p className="text-slate-200 text-lg md:text-xl font-medium mb-10 max-w-2xl mx-auto leading-relaxed opacity-90 mt-11">
          La plataforma integral para vivir, invertir y conectar con tu comunidad en Santander.
        </p>
        
        {/* Buscador: Ultra Redondeado y Limpio */}
       <div className="bg-white rounded-full p-2 max-w-2xl mx-auto flex items-center shadow-2xl border border-white/20 mt-10">
          <div className="flex-1 flex items-center gap-3 px-6">
            <MapPin className="text-orange-500" size={20} />
            <input
              type="text"
              placeholder="Barrio o nombre del edificio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-semibold py-4 text-base"
            />
          </div>
          
          {/* Botón Circular con Lupa */}
          <button
            onClick={() => onSearch(busqueda)}
            className="bg-slate-900 hover:bg-orange-500 text-white h-14 w-14 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg group"
          >
            <Search size={22} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;