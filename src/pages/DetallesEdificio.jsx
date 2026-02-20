import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 Importamos navegación
import { 
    ArrowLeft, MapPin, Building, Home, 
    Users, Layers, Search, Plus, ExternalLink
} from 'lucide-react';
import { getApartamentosPorEdificio } from '../services/edificios.services';
import InmuebleModal from '../components/InmuebleModal';

const DetallesEdificio = ({ edificio, onBack }) => {
    const [apartamentos, setApartamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate(); // 👈 Hook para ir al detalle público

    const loadAptos = useCallback(async () => {
        if (!edificio?.id) return;
        setLoading(true);
        try {
            const data = await getApartamentosPorEdificio(edificio.id);
            
            // Verificamos que data sea un array antes de ordenar
            const validData = Array.isArray(data) ? data : [];
            
            const sorted = validData.sort((a, b) => {
                const pisoA = Number(a.piso) || 0;
                const pisoB = Number(b.piso) || 0;
                if (pisoA !== pisoB) return pisoA - pisoB;
                return String(a.unidad).localeCompare(String(b.unidad), undefined, { numeric: true });
            });
            
            setApartamentos(sorted);
        } catch (error) {
            console.error("Error al refrescar la lista:", error);
            setApartamentos([]);
        } finally {
            setLoading(false);
        }
    }, [edificio?.id]);

    useEffect(() => {
        loadAptos();
    }, [loadAptos]);

    const filteredAptos = apartamentos.filter(ap => {
        const unidad = String(ap.unidad || "").toLowerCase();
        const piso = String(ap.piso || "").toLowerCase();
        const busqueda = searchTerm.toLowerCase();
        return unidad.includes(busqueda) || piso.includes(busqueda);
    });

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
            {/* HEADER DINÁMICO */}
            <div className="bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all text-slate-500">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">
                            {edificio?.nombre || 'Cargando Edificio...'}
                        </h2>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            <MapPin size={12} className="text-blue-600" /> {edificio?.ciudad || 'Bucaramanga'}
                        </div>
                    </div>
                </div>
                
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest flex gap-2 items-center shadow-lg shadow-blue-100 active:scale-95 transition-all"
                >
                    <Plus size={18} strokeWidth={3} /> <span>Añadir Unidad</span>
                </button>
            </div>

            <div className="p-6 max-w-7xl mx-auto space-y-8">
                {/* CARDS DE ESTADO */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard icon={<Home size={20}/>} label="Total Unidades" value={apartamentos.length} color="bg-blue-50 text-blue-600" />
                    <StatCard icon={<Users size={20}/>} label="Vendidos / Habitados" value={apartamentos.filter(a => a.estado === 'Habitado' || a.estado === 'Vendido').length} color="bg-slate-900 text-white" />
                    <StatCard icon={<Layers size={20}/>} label="Pisos del Proyecto" value={new Set(apartamentos.map(a => a.piso)).size} color="bg-blue-50 text-blue-600" />
                </div>

                {/* BUSCADOR */}
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                        type="text"
                        placeholder="Buscar por unidad o piso..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[1.5rem] font-bold text-sm focus:ring-4 focus:ring-blue-600/5 outline-none transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* LISTADO DE UNIDADES */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="h-44 bg-white border border-slate-50 rounded-[2.5rem] animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {filteredAptos.map((apto) => (
                            <div 
                                key={apto.id} 
                                onClick={() => navigate(`/apartamento/${apto.id}`)} // 👈 Navega al detalle
                                className="group bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-2 transition-all relative cursor-pointer"
                            >
                                <div className={`absolute top-0 left-0 w-full h-1.5 ${
                                    apto.estado === 'Habitado' || apto.estado === 'Vendido' ? 'bg-slate-200' : 'bg-blue-600'
                                }`}></div>
                                
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-4xl font-black text-slate-900 tracking-tighter group-hover:text-blue-600 transition-colors italic">
                                        {apto.unidad}
                                    </h4>
                                    <ExternalLink size={14} className="text-slate-200 group-hover:text-blue-400" />
                                </div>
                                
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Piso {apto.piso || '-'}</p>
                                
                                <div className={`mt-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                                    apto.estado === 'Habitado' || apto.estado === 'Vendido' 
                                    ? 'bg-slate-100 text-slate-500' 
                                    : 'bg-blue-50 text-blue-700'
                                }`}>
                                    {apto.estado || 'Disponible'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* EMPTY STATE */}
                {!loading && filteredAptos.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
                        <Building className="mx-auto text-slate-100 mb-4" size={64} />
                        <h3 className="font-black text-slate-900 uppercase italic">No hay registros</h3>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Agrega unidades para comenzar el inventario</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <InmuebleModal 
                    edificio={edificio} 
                    onClose={() => setIsModalOpen(false)} 
                    onSaved={() => {
                        setIsModalOpen(false);
                        setTimeout(() => loadAptos(), 500);
                    }} 
                />
            )}
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex items-center gap-5 shadow-sm">
        <div className={`p-4 rounded-[1.2rem] ${color}`}>{icon}</div>
        <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
        </div>
    </div>
);

export default DetallesEdificio;