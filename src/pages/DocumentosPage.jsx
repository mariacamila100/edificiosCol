import { useEffect, useState } from 'react';
import { Plus, FileText, Trash2, ChevronLeft, ChevronRight, Search, Download } from 'lucide-react';
import { getDocuments, deleteDocument } from '../services/documents.service';
import { getEdificios } from '../services/edificios.services';
import { alertSuccess, alertConfirm } from '../components/Alert';
import DocumentoModal from '../components/DocumentoModal';

const ITEMS_PER_PAGE = 5;

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

  const handleDelete = async (id) => {
    const ok = await alertConfirm('Eliminar documento', 'Esta acción no se puede deshacer');
    if (ok) {
      await deleteDocument(id);
      alertSuccess('Eliminado', 'El archivo ha sido borrado');
      loadData();
    }
  };

  const filteredDocs = documentos.filter(doc => {
    const titulo = doc.titulo?.toLowerCase() || "";
    const edificio = doc.edificioNombre?.toLowerCase() || "";
    const busqueda = searchTerm.toLowerCase();
    return titulo.includes(busqueda) || edificio.includes(busqueda);
  });

  const totalPages = Math.ceil(filteredDocs.length / ITEMS_PER_PAGE);
  const currentPage = page > totalPages ? 1 : page;
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredDocs.slice(start, start + ITEMS_PER_PAGE);

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm overflow-hidden animate-fadeIn">

      {/* HEADER - Estilo idéntico a Edificios */}
      <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-100/70">
        <h3 className="font-bold text-slate-800 whitespace-nowrap text-lg">Documentación</h3>

        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Buscar por título o edificio..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
          <button
            onClick={() => setOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex gap-2 transition items-center shadow-md shadow-blue-200"
          >
            <Plus size={18} /> Subir archivo
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/60 border-b border-slate-100">
            <tr className="text-[11px] text-slate-500 uppercase tracking-wide">
              <th className="px-8 py-4 text-left font-semibold">Documento</th>
              <th className="px-8 py-4 text-left font-semibold">Edificio</th>
              <th className="px-8 py-4 text-left font-semibold">Tipo</th>
              <th className="px-8 py-4 text-center font-semibold">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {currentItems.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50/50 transition duration-200">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <FileText size={18} />
                    </div>
                    <span className="font-bold text-slate-700">{doc.titulo}</span>
                  </div>
                </td>
                <td className="px-8 py-4 text-slate-500 font-medium">
                  {doc.edificioNombre || 'General'}
                </td>
                <td className="px-8 py-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                    {doc.tipo}
                  </span>
                </td>
                <td className="px-8 py-4 text-center">
                  <div className="flex justify-center gap-3">
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Descargar"
                    >
                      <Download size={18} />
                    </a>
                    <button 
                      onClick={() => handleDelete(doc.id)} 
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
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

      {/* FOOTER */}
      <div className="p-4 bg-slate-50/60 flex justify-between items-center border-t border-slate-100">
        <span className="text-[11px] text-slate-400 font-medium ml-4">
          Mostrando {currentItems.length} de {filteredDocs.length} documentos
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-2 mr-4">
            <button disabled={currentPage === 1} onClick={() => setPage(p => p - 1)} className="p-2 hover:bg-white rounded-lg disabled:opacity-30 transition border border-transparent hover:border-slate-200">
              <ChevronLeft size={16} className="text-slate-600" />
            </button>
            <span className="text-xs font-bold text-slate-600 px-2">
              {currentPage} / {totalPages}
            </span>
            <button disabled={currentPage === totalPages} onClick={() => setPage(p => p + 1)} className="p-2 hover:bg-white rounded-lg disabled:opacity-30 transition border border-transparent hover:border-slate-200">
              <ChevronRight size={16} className="text-slate-600" />
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