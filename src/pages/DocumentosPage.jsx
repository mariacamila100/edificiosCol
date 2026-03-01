import { useEffect, useState } from 'react';
import { Plus, FileText, Trash2, ChevronLeft, ChevronRight, Search, Download, Building2 } from 'lucide-react';
import { getDocuments, deleteDocument } from '../services/documents.service';
import { getEdificios } from '../services/edificios.services';
import { alertSuccess, alertError, alertConfirm } from '../components/Alert';
import DocumentoModal from '../components/DocumentoModal';

const ITEMS_PER_PAGE = 6;

const DocumentosPage = () => {
  const [documentos, setDocumentos] = useState([]);
  const [edificios, setEdificios] = useState([]);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    try {
      const [docsData, edisData] = await Promise.all([
        getDocuments(),
        getEdificios()
      ]);
      setDocumentos(docsData);
      setEdificios(edisData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (docItem) => {
    const ok = await alertConfirm(
      '¿Eliminar documento?', 
      `Se borrará "${docItem.titulo}". El archivo desaparecerá de la nube permanentemente.`
    );
    
    if (ok) {
      try {
        await deleteDocument(docItem.id, docItem.storagePath); 
        alertSuccess('Eliminado', 'Archivo y registro borrados correctamente');
        loadData();
      } catch (error) {
        alertError('Error', 'No se pudo eliminar el archivo');
      }
    }
  };

  const filteredDocs = documentos.filter(doc => {
    const titulo = doc.titulo?.toLowerCase() || "";
    const edificio = doc.edificioNombre?.toLowerCase() || "";
    const busqueda = searchTerm.toLowerCase();
    return titulo.includes(busqueda) || edificio.includes(busqueda);
  });

  const totalPages = Math.ceil(filteredDocs.length / ITEMS_PER_PAGE);
  const currentItems = filteredDocs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden animate-fadeIn">
      
      {/* HEADER DINÁMICO */}
      <div className="p-8 flex flex-col lg:flex-row justify-between items-center gap-6 bg-gradient-to-b from-slate-50 to-white">
        <div>
          <h3 className="font-extrabold text-slate-800 text-2xl tracking-tight">Gestión de Archivos</h3>
          <p className="text-slate-500 text-sm mt-1">Administra la documentación técnica y legal de tus copropiedades</p>
        </div>

        <div className="flex w-full lg:w-auto gap-3">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar por título o edificio..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
          <button
            onClick={() => setOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-sm font-bold flex gap-2 transition-all items-center shadow-lg shadow-blue-200 active:scale-95"
          >
            <Plus size={20} /> <span className="hidden sm:inline">Subir Documento</span>
          </button>
        </div>
      </div>

      {/* TABLA ESTILO DASHBOARD */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] text-slate-400 uppercase tracking-[0.15em] bg-slate-50/50 border-y border-slate-100">
              <th className="px-8 py-5 text-left font-bold">Información del Documento</th>
              <th className="px-8 py-5 text-left font-bold">Edificio Asignado</th>
              <th className="px-8 py-5 text-left font-bold">Categoría</th>
              <th className="px-8 py-5 text-center font-bold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {currentItems.map((doc) => (
              <tr key={doc.id} className="group hover:bg-blue-50/30 transition-colors duration-200">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white border border-slate-100 text-blue-600 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                      <FileText size={22} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-700 text-base">{doc.titulo}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 uppercase tracking-wider">{doc.tipo || 'General'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl w-fit border border-slate-200">
                    <Building2 size={14} className="text-slate-400" />
                    {/* ✅ AQUÍ SE MUESTRA EL NOMBRE DEL EDIFICIO */}
                    <span className="font-bold text-[12px]">{doc.edificioNombre || 'No asignado'}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase bg-blue-100/50 text-blue-700 border border-blue-200/50">
                    {doc.tipo}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex justify-center gap-2">
                    <a 
                      href={doc.archivourl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-2.5 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm bg-white border border-slate-100"
                      title="Ver Documento"
                    >
                      <Download size={18} />
                    </a>
                    <button 
                      onClick={() => handleDelete(doc)} 
                      className="p-2.5 text-rose-500 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm bg-white border border-slate-100"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      <div className="p-6 bg-slate-50/50 flex justify-between items-center border-t border-slate-100">
        <p className="text-[12px] text-slate-400 font-medium">
          Mostrando <span className="text-slate-700 font-bold">{currentItems.length}</span> de <span className="text-slate-700 font-bold">{filteredDocs.length}</span> registros
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)} 
              className="p-2.5 hover:bg-white rounded-xl disabled:opacity-30 transition-all border border-slate-200 text-slate-600 hover:shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-xs font-bold transition-all border ${
                    page === i + 1 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' 
                      : 'bg-white text-slate-500 border-slate-200 hover:border-blue-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)} 
              className="p-2.5 hover:bg-white rounded-xl disabled:opacity-30 transition-all border border-slate-200 text-slate-600 hover:shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {open && (
        <DocumentoModal 
          edificios={edificios} 
          onClose={() => setOpen(false)} 
          onSaved={loadData} 
        />
      )}
    </div>
  );
};

export default DocumentosPage;