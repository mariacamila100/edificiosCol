import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { registrarConsumo, actualizarConsumo } from '../services/consumos.service'; 
import { getInmueblesPorEdificio } from "../services/inmuebles.service"; 
import { X, Loader2, Info } from 'lucide-react';

const ConsumoModal = ({ edificios = [], onClose, onSaved, consumo }) => {
  const [loading, setLoading] = useState(false);
  const [unidades, setUnidades] = useState([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);

  const [form, setForm] = useState({
    edificioId: '',
    unidad: '',
    tipo: 'agua',
    mes: 'Febrero 2026',
    lectura: '',
    valor: ''
  });

  useEffect(() => {
    if (!form.edificioId) {
      setUnidades([]);
      return;
    }
    const cargar = async () => {
      setLoadingUnidades(true);
      try {
        if (typeof getInmueblesPorEdificio === 'function') {
          const data = await getInmueblesPorEdificio(form.edificioId);
          setUnidades(data || []);
        }
      } catch (e) { console.error(e); }
      finally { setLoadingUnidades(false); }
    };
    cargar();
  }, [form.edificioId]);

  useEffect(() => {
    if (consumo) setForm({ ...consumo });
  }, [consumo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (consumo?.id) await actualizarConsumo(consumo.id, form);
      else await registrarConsumo(form);
      if (onSaved) onSaved();
      onClose();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px]">
      
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Minimalista */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-blue-600 rounded-full" />
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
              {consumo ? 'Editar Registro' : 'Nuevo Registro'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
          
          {/* Selector de Edificio Estilo Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Propiedad Horizontal</label>
            <select
              value={form.edificioId}
              onChange={e => setForm({ ...form, edificioId: e.target.value, unidad: '' })}
              required
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-600/20 transition-all"
            >
              <option value="">Seleccionar edificio...</option>
              {edificios.map(ed => <option key={ed.id} value={ed.id}>{ed.nombre}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Unidad</label>
              <select
                value={form.unidad}
                onChange={e => setForm({ ...form, unidad: e.target.value })}
                disabled={!form.edificioId || loadingUnidades}
                required
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-600/20 disabled:opacity-50 outline-none"
              >
                <option value="">{loadingUnidades ? "..." : "Elegir..."}</option>
                {unidades.map(u => <option key={u.id} value={u.unidad}>{u.unidad}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Servicio</label>
              <select
                value={form.tipo}
                onChange={e => setForm({ ...form, tipo: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 outline-none"
              >
                <option value="agua">Agua 💧</option>
                <option value="electricidad">Energía ⚡</option>
                <option value="gas">Gas 🔥</option>
              </select>
            </div>
          </div>

          {/* Input de Periodo con Icono Sutil */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Mes de Facturación</label>
            <div className="relative">
              <input
                value={form.mes}
                onChange={e => setForm({ ...form, mes: e.target.value })}
                required
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 outline-none"
              />
              <Info size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
            </div>
          </div>

          {/* Bloque de Valores Destacados */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase">Lectura</span>
              <input
                type="number"
                value={form.lectura}
                onChange={e => setForm({ ...form, lectura: e.target.value })}
                placeholder="0.00"
                className="w-full bg-transparent text-xl font-bold text-slate-700 outline-none border-b border-slate-200 focus:border-blue-600 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase">Total Cobro</span>
              <div className="flex items-center gap-1 border-b border-slate-200 focus-within:border-blue-600 transition-colors">
                <span className="text-blue-600 font-bold">$</span>
                <input
                  type="number"
                  value={form.valor}
                  onChange={e => setForm({ ...form, valor: e.target.value })}
                  placeholder="0"
                  className="w-full bg-transparent text-xl font-black text-blue-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-slate-900 hover:bg-black text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ConsumoModal;