import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, FileCheck, Loader2 } from 'lucide-react';
import { uploadDocument } from '../services/documents.service';
import { alertSuccess, alertError } from './Alert';

const DocumentoModal = ({ onClose, edificios, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    edificioId: '',
    tipo: 'presupuesto'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) return alertError('Archivo faltante', 'Por favor selecciona un PDF');
    if (!formData.edificioId) return alertError('Dato faltante', 'Selecciona un edificio');

    setLoading(true);
    try {
      // 🔍 Buscamos el objeto del edificio para obtener su nombre real
      const edificioSeleccionado = edificios.find(edi => edi.id === formData.edificioId);
      
      const data = new FormData();
      data.append('file', file);
      data.append('titulo', formData.titulo);
      data.append('edificioId', formData.edificioId);
      data.append('edificioNombre', edificioSeleccionado?.nombre || 'General'); // ✅ Crucial para la tabla
      data.append('tipo', formData.tipo);

      await uploadDocument(data);
      
      alertSuccess('¡Éxito!', 'Documento publicado correctamente');
      onSaved();
      onClose();
    } catch (error) {
      console.error("Error al subir:", error);
      alertError('Error de subida', 'Verifica las reglas de Storage en Firebase');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="relative bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
      >
        
        {/* Header */}
        <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Cargar Documento</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Biblioteca Digital</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Título */}
          <FormGroup label="Título del documento">
            <input 
              required
              name="titulo"
              type="text"
              value={formData.titulo}
              placeholder="Ej: Reporte Anual 2024"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
              onChange={handleChange}
            />
          </FormGroup>

          {/* Grid Edificio y Categoría */}
          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Edificio">
              <select 
                required
                name="edificioId"
                value={formData.edificioId}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium text-slate-700"
                onChange={handleChange}
              >
                <option value="">Seleccionar...</option>
                {edificios.map(edi => (
                  <option key={edi.id} value={edi.id}>{edi.nombre}</option>
                ))}
              </select>
            </FormGroup>

            <FormGroup label="Categoría">
              <select 
                name="tipo"
                value={formData.tipo}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium text-slate-700"
                onChange={handleChange}
              >
                <option value="presupuesto">Presupuesto</option>
                <option value="acta">Acta</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="circular">Circular</option>
              </select>
            </FormGroup>
          </div>

          {/* Dropzone de Archivo */}
          <FormGroup label="Archivo PDF">
            <label className={`
              relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer group
              ${file ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/30'}
            `}>
              <input 
                type="file" 
                accept=".pdf" 
                className="hidden" 
                onChange={(e) => setFile(e.target.files[0])} 
              />
              
              {file ? (
                <div className="flex flex-col items-center animate-in zoom-in duration-300">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                    <FileCheck size={24} />
                  </div>
                  <span className="text-sm font-bold text-emerald-700 text-center line-clamp-1 px-4">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-emerald-500 font-bold uppercase mt-1">Listo para subir</span>
                </div>
              ) : (
                <div className="flex flex-col items-center group-hover:scale-105 transition-transform">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 shadow-sm">
                    <Upload size={24} />
                  </div>
                  <span className="text-sm font-bold text-slate-600">Seleccionar PDF</span>
                  <span className="text-xs text-slate-400 mt-1">Peso máximo recomendado: 10MB</span>
                </div>
              )}
            </label>
          </FormGroup>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <><Loader2 className="animate-spin" size={20} /> Subiendo...</>
              ) : 'Confirmar y Publicar'}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-2xl font-bold transition-all active:scale-95"
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
  <div className="space-y-1.5">
    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">
      {label}
    </label>
    {children}
  </div>
);

export default DocumentoModal;