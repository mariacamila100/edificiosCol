import React, { useState, useEffect } from 'react';
import { FileText, Download, Search, FolderOpen, Loader2, Building2, ShieldCheck } from 'lucide-react';
import { getDocumentsByBuilding } from '../services/documents.service';

const DocumentosResidente = ({ user }) => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user?.edificioId) return;

    const fetchDocs = async () => {
      try {
        setLoading(true);
        const data = await getDocumentsByBuilding(user.edificioId);
        setDocumentos(data);
      } catch (err) {
        console.error("Error al cargar documentos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [user?.edificioId]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-[2rem] border border-slate-100 shadow-sm">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-slate-500 font-medium">Sincronizando acceso...</p>
      </div>
    );
  }

  const filteredDocs = documentos.filter(doc => 
    doc.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tipo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-900/5 border border-slate-100 overflow-hidden flex flex-col min-h-[550px] animate-in fade-in duration-500">
      
      {/* HEADER CON GRADIENTE AZUL */}
      <div className="p-8 bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <Building2 size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                  {user.edificioNombre || "Mi Copropiedad"}
                </h3>
                <ShieldCheck size={18} className="text-blue-500" />
              </div>
              <p className="text-[11px] text-blue-600/70 font-bold uppercase tracking-[0.2em] mt-1">
                Repositorio Digital de Documentos
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar reglamentos, actas o circulares..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all shadow-sm placeholder:text-slate-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ÁREA DE CONTENIDO */}
      <div className="flex-1 p-8 bg-white">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <div className="relative">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <div className="absolute inset-0 bg-blue-400/10 blur-xl rounded-full"></div>
             </div>
             <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Obteniendo archivos oficiales</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <FolderOpen size={40} className="text-slate-200" />
            </div>
            <p className="text-sm font-bold text-slate-400 italic">No se encontraron documentos en esta categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <div 
                key={doc.id}
                className="group relative bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col gap-4 overflow-hidden"
              >
                {/* Decoración sutil al hacer hover */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>

                <div className="flex items-start justify-between relative z-10">
                  <div className="w-12 h-12 bg-slate-50 group-hover:bg-blue-600 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-white transition-all duration-300 shadow-inner">
                    <FileText size={22} />
                  </div>
                  
                  <a 
                    href={doc.archivourl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all duration-300 transform active:scale-90 shadow-sm"
                    title="Descargar PDF"
                  >
                    <Download size={18} />
                  </a>
                </div>

                <div className="relative z-10">
                  <h4 className="text-[15px] font-bold text-slate-700 group-hover:text-blue-900 transition-colors leading-snug h-10 line-clamp-2">
                    {doc.titulo}
                  </h4>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-[10px] font-black text-blue-700 uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                      {doc.tipo}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      • PDF
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER SUTIL */}
      <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400 font-medium">
          Sistema de Gestión Documental Protegido • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default DocumentosResidente;