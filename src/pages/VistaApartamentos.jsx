import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApartamentosPorEdificio, getEdificios } from '../services/edificios.services';
import Footer from '../components/Footer';
import {
    ArrowLeft, Layers, Maximize,
    Navigation2, Layout, Search, Building2, ChevronRight
} from 'lucide-react';

const VistaApartamentos = () => {
    const { edificioId } = useParams();
    const [apartamentosBase, setApartamentosBase] = useState([]);
    const [edificio, setEdificio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filtroTipo, setFiltroTipo] = useState('Todos');
    const [busquedaUnidad, setBusquedaUnidad] = useState('');
    const navigate = useNavigate();

    // Imágenes de Respaldo Estéticas
    const IMG_EDIFICIO_DEFAULT = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000";
    const IMG_APTO_DEFAULT = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800";

    useEffect(() => {
        const cargarTodo = async () => {
            try {
                setLoading(true);
                const [listaEdificios, data] = await Promise.all([
                    getEdificios().catch(() => []),
                    getApartamentosPorEdificio(edificioId).catch(() => [])
                ]);

                const infoEdificio = listaEdificios.find(e => e.id === edificioId);
                setEdificio(infoEdificio || {});

                if (Array.isArray(data)) {
                    const soloDisponibles = data.filter(apto => {
                        const estado = (apto?.estado || "").toLowerCase().trim();
                        const tipo = (apto?.tipo || "").toLowerCase().trim();
                        return estado !== 'entregado' && tipo !== 'entregado';
                    });
                    setApartamentosBase(soloDisponibles);
                }
            } catch (error) {
                console.error("Error crítico:", error);
            } finally {
                setLoading(false);
            }
        };
        if (edificioId) cargarTodo();
    }, [edificioId]);

    const apartamentosFiltrados = apartamentosBase.filter(apto => {
        let cumpleTipo = true;
        if (filtroTipo !== 'Todos') {
            const b = filtroTipo.toLowerCase().trim();
            const estado = (apto?.estado || "").toLowerCase().trim();
            const tipo = (apto?.tipo || "").toLowerCase().trim();
            if (b === 'renta') {
                cumpleTipo = tipo === 'renta' || tipo === 'arriendo' || estado === 'renta' || estado === 'arriendo';
            } else {
                cumpleTipo = tipo === b || estado === b;
            }
        }
        const cumpleBusqueda = (apto?.unidad || "").toString().toLowerCase().includes(busquedaUnidad.toLowerCase());
        return cumpleTipo && cumpleBusqueda;
    });

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans">

            <main className="flex-grow relative z-10 max-w-[1100px] mx-auto px-6 pt-32 pb-20">

                {/* NAVEGACIÓN SUPERIOR */}
                <div className="mb-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-900 transition-all group"
                    >
                        <div className="p-2.5 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all border border-slate-100">
                            <ArrowLeft size={18} />
                        </div>
                        Volver al catálogo
                    </button>
                </div>

                {/* HERO SECTION */}
                <section className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center mb-16">
                    <div className="md:col-span-7">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full mb-5">
                            <Navigation2 size={12} className="text-blue-600 fill-blue-600" />
                            <span className="text-[10px] font-black uppercase text-blue-600">
                                {edificio?.ciudad || 'Ubicación Premium'}
                            </span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase mb-6 text-slate-900 leading-[0.85]">
                            {edificio?.nombre || "Proyecto Arquitectónico"}
                        </h1>

                        <p className="text-sm text-slate-500 max-w-md leading-relaxed font-medium italic mb-8">
                            {edificio?.descripcion || "Diseño vanguardista fusionado con la máxima exclusividad urbana."}
                        </p>

                        <div className="flex flex-wrap gap-6 pt-6 border-t border-slate-100">
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dirección</p>
                                <p className="text-xs font-bold text-slate-700">{edificio?.direccion || "Zona Exclusiva"}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Unidades</p>
                                <p className="text-xs font-bold text-slate-700">{apartamentosBase.length} Disponibles</p>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-5 flex justify-end">
                        <div className="w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white group relative">
                            <img
                                src={edificio?.imagen || edificio?.foto || IMG_EDIFICIO_DEFAULT}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                alt="Edificio"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-60"></div>
                        </div>
                    </div>
                </section>

                {/* BARRA DE ACCIONES */}
                <div className="flex flex-col lg:flex-row items-center justify-between mb-10 gap-6 border-b border-slate-100 pb-8">
                    <div className="flex items-center gap-3 self-start">
                        <div className="p-2.5 bg-blue-600 rounded-xl text-white">
                            <Layout size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 leading-none">Unidades</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{apartamentosFiltrados.length} Resultados</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar unidad..."
                                value={busquedaUnidad}
                                onChange={(e) => setBusquedaUnidad(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-12 pr-4 text-[11px] font-bold uppercase focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                            />
                        </div>

                        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200/50 w-full sm:w-auto">
                            {['Todos', 'Venta', 'Renta'].map((tipo) => (
                                <button
                                    key={tipo}
                                    onClick={() => setFiltroTipo(tipo)}
                                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${filtroTipo === tipo ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {tipo}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* GRID DE APARTAMENTOS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {apartamentosFiltrados.map((apto) => (
                        <div
                            key={apto?.id}
                            onClick={() => navigate(`/apartamento/${apto?.id}`)}
                            className="group bg-white rounded-[2rem] border border-slate-100 hover:border-blue-600/30 transition-all p-4 shadow-sm hover:shadow-2xl cursor-pointer"
                        >
                            <div className="relative h-64 rounded-[1.5rem] overflow-hidden mb-6">
                                <img
                                    src={apto?.foto || IMG_APTO_DEFAULT}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    alt={apto?.unidad}
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[9px] font-black uppercase text-blue-600 shadow-sm">
                                        {apto?.tipo || apto?.estado || 'Disponible'}
                                    </span>
                                </div>
                            </div>

                            <div className="px-2">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <span className="text-[10px] font-bold text-blue-600 uppercase block mb-1">Piso {apto?.piso || '0'}</span>
                                        <h3 className="text-2xl font-black uppercase text-slate-900 tracking-tighter">Unidad {apto?.unidad || 'S/N'}</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Inversión</p>
                                        <p className="text-lg font-black text-slate-900">
                                            {apto?.precio ? `$${apto.precio.toLocaleString()}` : "Consulte"}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50/80 py-4 px-4 rounded-xl flex items-center justify-between">
                                        <Maximize size={16} className="text-slate-400" />
                                        <span className="text-[12px] font-bold text-slate-700">{apto?.area || '—'} m²</span>
                                    </div>
                                    <div className="bg-slate-50/80 py-4 px-4 rounded-xl flex items-center justify-between">
                                        <Layers size={16} className="text-slate-400" />
                                        <span className="text-[12px] font-bold text-slate-700">{apto?.habitaciones || '—'} Hab</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <Footer />

        </div>
    );
};

export default VistaApartamentos;