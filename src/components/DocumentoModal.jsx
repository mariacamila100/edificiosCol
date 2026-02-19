import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload } from 'lucide-react';
import { uploadDocument } from '../services/documents.service';
import { alertSuccess, alertError } from './Alert';

const DocumentoModal = ({ onClose, edificios, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    edificioId: '',
    tipo: 'presupuesto',
    año: new Date().getFullYear().toString()
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alertError('Error', 'Debes adjuntar un archivo PDF');
    
    setLoading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('titulo', formData.titulo);
      data.append('edificioId', formData.edificioId);
      data.append('tipo', formData.tipo);

      await uploadDocument(data);
      alertSuccess('Publicado', 'Documento cargado con éxito');
      onSaved();
      onClose();
    } catch (error) {
      alertError('Error', 'No se pudo subir el archivo');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay estándar sin el blur excesivo */}
      <div onClick={onClose} className="absolute inset-0 bg-black/50" />
      
      <div className="relative bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl animate-fadeIn">
        {/* Título con el estilo de UsuarioModal */}
        <h3 className="text-xl font-bold mb-6 text-slate-800">
          Subir Documento
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormGroup label="Título descriptivo">
            <input 
              required
              type="text"
              placeholder="Ej: Balance Financiero Anual"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-100 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition"
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
            />
          </FormGroup>

          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Asignar Edificio">
              <select 
                required
                className="w-full px-4 py-2.5 rounded-lg bg-slate-100 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition"
                onChange={(e) => setFormData({...formData, edificioId: e.target.value})}
              >
                <option value="">Seleccione...</option>
                {edificios.map(edi => (
                  <option key={edi.id} value={edi.id}>{edi.nombre}</option>
                ))}
              </select>
            </FormGroup>

            <FormGroup label="Tipo de archivo">
              <select 
                className="w-full px-4 py-2.5 rounded-lg bg-slate-100 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition"
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              >
                <option value="presupuesto">Presupuesto</option>
                <option value="acta">Acta</option>
                <option value="mantenimiento">Mantenimiento</option>
              </select>
            </FormGroup>
          </div>

          {/* Selector de archivo simplificado para que no rompa el estilo */}
          <FormGroup label="Archivo PDF">
            <div className="relative group">
              <input 
                required
                type="file" 
                accept=".pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <div className="w-full px-4 py-2.5 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex items-center gap-2 text-slate-500 group-hover:border-blue-500 transition-colors">
                <Upload size={18} />
                <span className="text-sm truncate">
                  {file ? file.name : "Seleccionar PDF..."}
                </span>
              </div>
            </div>
          </FormGroup>

          {/* Botones idénticos a los de Usuarios */}
          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Subiendo...' : 'Confirmar Carga'}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-lg font-semibold"
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

// FormGroup con el estilo exacto que usas en Usuarios
const FormGroup = ({ label, children }) => (
  <div>
    <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">
      {label}
    </label>
    {children}
  </div>
);

export default DocumentoModal;