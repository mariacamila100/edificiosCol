import React, { useState, useEffect } from 'react';
import { FileText, Download, Search, Calendar, FolderOpen } from 'lucide-react';
import { getDocumentsByBuilding } from '../services/documents.service';

const DocumentosResidente = ({ user }) => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDocs = async () => {
      if (user?.edificioId) {
        const data = await getDocumentsByBuilding(user.edificioId);
        setDocumentos(data);
        setLoading(false);
      }
    };
    fetchDocs();
  }, [user?.edificioId]);

  const filteredDocs = documentos.filter(doc => 
    doc.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tipo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col min-h-[500px]">
      
      {/* HEADER */}
      <div className="p-8 bg-white border-b border-slate-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
              <FolderOpen size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">Biblioteca de Documentos</h3>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                Archivos oficiales del edificio
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Buscar reglamento, actas..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* LISTADO */}
      <div className="flex-1 p-6 bg-[#FBFBFF]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
             <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
             <p className="text-slate-400 text-sm font-bold">Cargando archivos...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 opacity-60">
            <FileText size={48} className="mb-4 text-slate-200" />
            <p className="text-sm font-semibold italic">No se encontraron documentos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.map((doc) => (
              <div 
                key={doc.id}
                className="group bg-white p-5 rounded-[2rem] border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 group-hover:bg-emerald-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                      {doc.titulo}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                       <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-md">
                        {doc.tipo}
                       </span>
                       <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                         <Calendar size={10} /> {doc.año || 'N/A'}
                       </span>
                    </div>
                  </div>
                </div>

                <a 
                  href={doc.archivourl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-3 bg-slate-50 text-slate-400 hover:bg-emerald-500 hover:text-white rounded-xl transition-all duration-300 shadow-sm"
                  title="Descargar"
                >
                  <Download size={18} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentosResidente;