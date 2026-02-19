import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { registrarConsumo, actualizarConsumo } from '../services/consumos.service'; // Asegúrate de tener actualizarConsumo en tu servicio
import { alertSuccess } from './Alert';
import { X } from 'lucide-react';

const ConsumoModal = ({ edificios, onClose, onSaved, consumo }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    edificioId: '',
    unidad: '',
    tipo: 'agua',
    mes: 'Febrero 2026',
    lectura: '',
    valor: ''
  });

  // Efecto para cargar los datos si se va a editar
  useEffect(() => {
    if (consumo) {
      setForm({
        edificioId: consumo.edificioId || '',
        unidad: consumo.unidad || '',
        tipo: consumo.tipo || 'agua',
        mes: consumo.mes || '',
        lectura: consumo.lectura || '',
        valor: consumo.valor || ''
      });
    }
  }, [consumo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (consumo?.id) {
        // Lógica de Edición
        await actualizarConsumo(consumo.id, form);
        alertSuccess('Actualizado', 'El registro se actualizó correctamente');
      } else {
        // Lógica de Creación
        await registrarConsumo(form);
        alertSuccess('Completado', 'El consumo se registró correctamente');
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error("Error al guardar consumo:", error);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      <div className="relative bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl animate-fadeIn border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">
            {consumo ? 'Editar Consumo' : 'Registrar Consumo'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormGroup label="Copropiedad / Edificio">
            <select
              value={form.edificioId}
              onChange={e => setForm({ ...form, edificioId: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-slate-100 border border-slate-200 focus:bg-white focus:border-blue-500 transition outline-none text-sm text-slate-700"
            >
              <option value="">Seleccione edificio...</option>
              {edificios.map(ed => (
                <option key={ed.id} value={ed.id}>{ed.nombre}</option>
              ))}
            </select>
          </FormGroup>

          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Unidad (Apto/Casa)">
              <input
                placeholder="Ej: 402"
                value={form.unidad}
                onChange={e => setForm({ ...form, unidad: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-slate-100 border border-slate-200 focus:bg-white focus:border-blue-500 transition outline-none text-sm"
              />
            </FormGroup>

            <FormGroup label="Tipo de Servicio">
              <select
                value={form.tipo}
                onChange={e => setForm({ ...form, tipo: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-100 border border-slate-200 focus:bg-white focus:border-blue-500 transition outline-none text-sm"
              >
                <option value="agua">Agua 💧</option>
                <option value="electricidad">Energía ⚡</option>
                <option value="gas">Gas 🔥</option>
              </select>
            </FormGroup>
          </div>

          <FormGroup label="Periodo de Facturación">
            <input
              value={form.mes}
              onChange={e => setForm({ ...form, mes: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-slate-100 border border-slate-200 focus:bg-white focus:border-blue-500 transition outline-none text-sm"
            />
          </FormGroup>

          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Lectura Actual">
              <input
                type="number"
                value={form.lectura}
                onChange={e => setForm({ ...form, lectura: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-slate-100 border border-slate-200 focus:bg-white focus:border-blue-500 transition outline-none text-sm"
              />
            </FormGroup>

            <FormGroup label="Monto a Cobrar ($)">
              <input
                type="number"
                value={form.valor}
                onChange={e => setForm({ ...form, valor: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-slate-100 border border-slate-200 focus:bg-white focus:border-blue-500 transition outline-none text-sm"
              />
            </FormGroup>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold transition shadow-md shadow-blue-200 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : consumo ? 'Actualizar' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

const FormGroup = ({ label, children }) => (
  <div>
    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
      {label}
    </label>
    {children}
  </div>
);

export default ConsumoModal;