import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { departamentosColombia } from '../data/colombia';
import {
  createEdificio,
  updateEdificio
} from '../services/edificios.services';
import { alertSuccess } from './Alert';

const EdificioModal = ({ edificio, onClose, onSaved }) => {
  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
    departamento: 'Santander',
    ciudad: 'Bucaramanga',
    telefonoAdmin: '', 
    emailAdmin: '',    
    estado: 'activo'
  });

  const [ciudadesFiltradas, setCiudadesFiltradas] = useState([]);

  useEffect(() => {
    const deptoEncontrado = departamentosColombia.find(d => d.departamento === form.departamento);
    if (deptoEncontrado) {
      setCiudadesFiltradas(deptoEncontrado.ciudades);
    }
  }, [form.departamento]);

  useEffect(() => {
    if (edificio) {
      // Si el número ya trae el 57, se lo quitamos para mostrar solo los 10 dígitos en el input
      const telLimpio = edificio.telefonoAdmin?.startsWith('57') 
        ? edificio.telefonoAdmin.slice(2) 
        : edificio.telefonoAdmin;

      setForm({
        nombre: edificio.nombre || '',
        direccion: edificio.direccion || '',
        departamento: edificio.departamento || 'Santander',
        ciudad: edificio.ciudad || '',
        telefonoAdmin: telLimpio || '',
        emailAdmin: edificio.emailAdmin || '',
        estado: edificio.estado || 'activo'
      });
    }
  }, [edificio]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Antes de enviar, nos aseguramos de que el número guardado tenga el 57
    const dataFinal = {
      ...form,
      telefonoAdmin: form.telefonoAdmin ? `57${form.telefonoAdmin}` : ''
    };

    if (edificio) {
      await updateEdificio(edificio.id, dataFinal);
      alertSuccess('Edificio actualizado', 'Los cambios se guardaron correctamente');
    } else {
      await createEdificio(dataFinal);
      alertSuccess('Edificio creado', 'El edificio fue registrado correctamente');
    }
    onSaved();
    onClose();
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg bg-slate-100 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition outline-none";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-6 text-slate-800">
          {edificio ? 'Editar edificio' : 'Nuevo edificio'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormGroup label="Nombre del edificio">
            <input
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              required
              className={inputClass}
            />
          </FormGroup>

          <FormGroup label="Dirección">
            <input
              value={form.direccion}
              onChange={e => setForm({ ...form, direccion: e.target.value })}
              required
              className={inputClass}
            />
          </FormGroup>

          <div className="grid grid-cols-2 gap-4">
            {/* INPUT DE TELÉFONO CON PREFIJO FIJO */}
            <FormGroup label="WhatsApp Admin">
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400 font-medium text-sm border-r border-slate-300 pr-2">
                  +57
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={form.telefonoAdmin}
                  onChange={e => setForm({ ...form, telefonoAdmin: e.target.value.replace(/\D/g, '') })}
                  placeholder="300 123 4567"
                  className={`${inputClass} pl-14`}
                />
              </div>
            </FormGroup>

            <FormGroup label="Email Administración">
              <input
                type="email"
                value={form.emailAdmin}
                onChange={e => setForm({ ...form, emailAdmin: e.target.value })}
                placeholder="admin@correo.com"
                className={inputClass}
              />
            </FormGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Departamento">
              <select
                value={form.departamento}
                onChange={e => setForm({ ...form, departamento: e.target.value, ciudad: '' })}
                className={inputClass}
              >
                {departamentosColombia.map(dep => (
                  <option key={dep.departamento} value={dep.departamento}>{dep.departamento}</option>
                ))}
              </select>
            </FormGroup>

            <FormGroup label="Ciudad">
              <select
                value={form.ciudad}
                onChange={e => setForm({ ...form, ciudad: e.target.value })}
                required
                className={inputClass}
              >
                <option value="">Seleccione...</option>
                {ciudadesFiltradas.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </FormGroup>
          </div>

          <FormGroup label="Estado">
            <select
              value={form.estado}
              onChange={e => setForm({ ...form, estado: e.target.value })}
              className={inputClass}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </FormGroup>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition">
              Guardar
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg font-semibold transition">
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
    <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">
      {label}
    </label>
    {children}
  </div>
);

export default EdificioModal;