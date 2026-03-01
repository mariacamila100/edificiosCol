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
                    <StatCard icon={<Home size={20} />} label="Total Unidades" value={apartamentos.length} color="bg-blue-50 text-blue-600" />
                    <StatCard icon={<Users size={20} />} label="Vendidos / Habitados" value={apartamentos.filter(a => a.estado === 'Habitado' || a.estado === 'Vendido').length} color="bg-slate-900 text-white" />
                    <StatCard icon={<Layers size={20} />} label="Pisos del Proyecto" value={new Set(apartamentos.map(a => a.piso)).size} color="bg-blue-50 text-blue-600" />
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {filteredAptos.map((apto) => (
                            <div
                                key={apto.id}
                                onClick={() => navigate(`/apartamento/${apto.id}`)}
                                className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden cursor-pointer flex flex-col"
                            >
                                {/* CONTENEDOR DE IMAGEN */}
                                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                                    <img
                                        // Prioridad: Imagen principal (logoUrl) > Primera foto de galería > Imagen edificio > Placeholder
                                        src={apto.logoUrl || (apto.fotos && apto.fotos[0]) || edificio?.imagen || 'https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=800'}
                                        alt={`Unidad ${apto.unidad}`}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />

                                    {/* BADGE DE ESTADO SOBRE LA IMAGEN */}
                                    <div className="absolute top-4 left-4">
                                        <div className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${apto.estado === 'Habitado' || apto.estado === 'Vendido'
                                                ? 'bg-slate-900/80 text-white'
                                                : 'bg-blue-600/90 text-white'
                                            }`}>
                                            {apto.estado || 'Disponible'}
                                        </div>
                                    </div>

                                    {/* OVERLAY AL HACER HOVER */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                                        <p className="text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                            Ver Detalles <ExternalLink size={12} />
                                        </p>
                                    </div>
                                </div>

                                {/* INFO DE LA UNIDAD */}
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="text-3xl font-black text-slate-900 tracking-tighter italic">
                                            {apto.unidad}
                                        </h4>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Piso</p>
                                            <p className="text-lg font-black text-blue-600 tracking-tighter">{apto.piso || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-50 flex gap-4">
                                        {apto.habitaciones && (
                                            <div className="flex items-center gap-1 text-slate-400">
                                                <Home size={12} />
                                                <span className="text-[10px] font-bold">{apto.habitaciones}H</span>
                                            </div>
                                        )}
                                        {apto.area && (
                                            <div className="flex items-center gap-1 text-slate-400">
                                                <Layers size={12} />
                                                <span className="text-[10px] font-bold">{apto.area}m²</span>
                                            </div>
                                        )}
                                    </div>
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