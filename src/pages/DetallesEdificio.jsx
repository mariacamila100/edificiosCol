import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, MapPin, Plus, Search, 
    ChevronRight 
} from 'lucide-react';
import { getApartamentosPorEdificio } from '../services/edificios.services';
import InmuebleModal from '../components/InmuebleModal';

const DetallesEdificio = ({ edificio, onBack }) => {
    const [apartamentos, setApartamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // ESTADOS PARA EL MODAL
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedApto, setSelectedApto] = useState(null); // Nuevo: para editar
    
    const navigate = useNavigate();

    const loadAptos = useCallback(async () => {
        if (!edificio?.id) return;
        setLoading(true);
        try {
            const data = await getApartamentosPorEdificio(edificio.id);
            const validData = Array.isArray(data) ? data : [];
            setApartamentos(validData.sort((a, b) => Number(a.piso) - Number(b.piso)));
        } catch (error) {
            console.error("Error:", error);
            setApartamentos([]);
        } finally {
            setLoading(false);
        }
    }, [edificio?.id]);

    useEffect(() => { loadAptos(); }, [loadAptos]);

    // Función para abrir creación
    const handleAddClick = () => {
        setSelectedApto(null);
        setIsModalOpen(true);
    };

    // Función para abrir edición
    const handleEditClick = (apto) => {
        setSelectedApto(apto); // Pasamos los datos del apto al estado
        setIsModalOpen(true);
    };

    const filteredAptos = apartamentos.filter(ap => 
        String(ap.unidad).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fallbackImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800';

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans antialiased pb-10">
            {/* HEADER */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-blue-600">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="h-4 w-[1px] bg-slate-200" />
                        <div>
                            <h1 className="text-xs font-bold tracking-[0.15em] uppercase text-slate-800">
                                {edificio?.nombre}
                            </h1>
                            <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                <MapPin size={10} /> {edificio?.ciudad || 'Ubicación'}
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleAddClick}
                        className="bg-slate-900 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm"
                    >
                        <Plus size={14} /> <span>Nueva Unidad</span>
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 mt-8 space-y-6">
                {/* TOOLBAR */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input 
                            type="text"
                            placeholder="Buscar unidad..."
                            className="w-full bg-transparent border-none py-2 pl-8 pr-4 text-sm outline-none placeholder:text-slate-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge label={`${apartamentos.length} TOTAL`} color="bg-slate-50 text-slate-500 border border-slate-100" />
                        <Badge label={`${apartamentos.filter(a => ['Habitado', 'Vendido'].includes(a.estado)).length} OCUPADOS`} color="bg-blue-50 text-blue-600 border border-blue-100" />
                    </div>
                </div>

                {/* GRID DE INMUEBLES */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {[...Array(10)].map((_, i) => <div key={i} className="aspect-square bg-slate-50 rounded-3xl animate-pulse" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
                        {filteredAptos.map((apto) => (
                            <div 
                                key={apto.id}
                                onClick={() => handleEditClick(apto)} // CLIC PARA EDITAR
                                className="group cursor-pointer"
                            >
                                <div className="relative aspect-square mb-4 bg-slate-100 rounded-3xl overflow-hidden border border-slate-100 transition-all group-hover:shadow-2xl group-hover:shadow-blue-500/15 group-hover:-translate-y-1">
                                    <img 
                                        src={apto.logoUrl || (apto.fotos && apto.fotos[0]) || edificio?.imagen || fallbackImage} 
                                        alt={apto.unidad}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => { e.target.src = fallbackImage }}
                                    />
                                    <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[9px] font-bold text-slate-800 shadow-sm">
                                        PISO {apto.piso}
                                    </div>
                                    <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Editar</span>
                                            <ChevronRight size={14} className="text-blue-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1 px-1">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-base font-bold text-slate-900">Apartamento {apto.unidad}</h3>
                                        <span className="text-[10px] font-bold text-slate-400">{apto.area}m²</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${['Habitado', 'Vendido'].includes(apto.estado) ? 'bg-blue-600' : 'bg-emerald-500'}`} />
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                            {apto.estado || 'Disponible'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* MODAL CONFIGURADO PARA CREAR Y EDITAR */}
            {isModalOpen && (
                <InmuebleModal 
                    edificio={edificio} 
                    inmueble={selectedApto} // Pasamos el apto seleccionado (si es null, el modal debe entender que es "Crear")
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedApto(null);
                    }} 
                    onSaved={() => { 
                        setIsModalOpen(false); 
                        setSelectedApto(null);
                        loadAptos(); 
                    }} 
                />
            )}
        </div>
    );
};

const Badge = ({ label, color }) => (
    <span className={`px-3 py-1 rounded-md text-[9px] font-black tracking-tight whitespace-nowrap ${color}`}>
        {label}
    </span>
);

export default DetallesEdificio;