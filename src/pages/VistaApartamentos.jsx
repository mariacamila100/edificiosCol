import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApartamentosPorEdificio, getEdificios } from '../services/edificios.services';
import Footer from '../components/Footer';
import {
    ArrowLeft, Layers, Maximize,
    Navigation2, Layout, Building2, MapPin,
    Filter, Bath, BedDouble, ChevronDown, Eraser, DollarSign
} from 'lucide-react';

const VistaApartamentos = () => {
    const { edificioId } = useParams();
    const [apartamentosBase, setApartamentosBase] = useState([]);
    const [edificio, setEdificio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filtroTipo, setFiltroTipo] = useState('Todos');

    // NUEVOS ESTADOS DE FILTROS
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        habitaciones: "",
        banos: "",
        precioMax: "",
        areaMin: ""
    });

    const navigate = useNavigate();

    const IMG_EDIFICIO_DEFAULT = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000";
    const IMG_APTO_DEFAULT = "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=800";

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
                console.error("Error cargando datos:", error);
            } finally {
                setLoading(false);
            }
        };
        if (edificioId) cargarTodo();
    }, [edificioId]);

    // LÓGICA DE FILTRADO DINÁMICA
    const apartamentosFiltrados = apartamentosBase.filter(apto => {
        // Filtro de Pestaña (Todos/Venta/Renta)
        const matchesTab = filtroTipo === 'Todos' ||
            (apto?.tipo || "").toLowerCase().trim() === filtroTipo.toLowerCase().trim() ||
            (apto?.estado || "").toLowerCase().trim() === filtroTipo.toLowerCase().trim();

        // Filtros de Selects
        const matchesHab = filters.habitaciones ? Number(apto.habitaciones) >= Number(filters.habitaciones) : true;
        const matchesBanos = filters.banos ? Number(apto.banos) >= Number(filters.banos) : true;
        const matchesArea = filters.areaMin ? Number(apto.area) >= Number(filters.areaMin) : true;
        const matchesPrecio = filters.precioMax ? Number(apto.precio) <= Number(filters.precioMax) : true;

        return matchesTab && matchesHab && matchesBanos && matchesArea && matchesPrecio;
    });

    const resetFilters = () => {
        setFilters({ habitaciones: "", banos: "", precioMax: "", areaMin: "" });
        setFiltroTipo('Todos');
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-[#FDFDFD] text-slate-800 font-sans">
            <main className="flex-grow relative z-10 max-w-[1200px] mx-auto px-6 pt-32 pb-20 w-full">

                {/* 1. BOTÓN VOLVER */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-900 transition-all group"
                    >
                        <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow-md border border-slate-100">
                            <ArrowLeft size={16} />
                        </div>
                        Regresar
                    </button>
                </div>

                {/* 2. HERO */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
                    <div className="lg:col-span-7 order-2 lg:order-1">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full mb-6">
                            <Navigation2 size={12} className="text-blue-600 fill-blue-600" />
                            <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">
                                {edificio?.ciudad || 'Colombia'}
                            </span>
                        </div>
                        <h1 className="text-6xl lg:text-7xl font-black tracking-tighter uppercase mb-6 text-slate-900 leading-[0.8]">
                            {edificio?.nombre || "Proyecto"}
                        </h1>
                        <div className="flex items-center gap-2 text-slate-400 mb-8 font-medium">
                            <MapPin size={16} className="text-blue-500" />
                            <span className="text-sm uppercase tracking-wider">{edificio?.direccion}</span>
                        </div>
                        <p className="text-lg text-slate-500 max-w-xl leading-relaxed italic">
                            {edificio?.descripcion || "Diseño vanguardista fusionado con la máxima exclusividad urbana."}
                        </p>
                    </div>

                    <div className="lg:col-span-5 order-1 lg:order-2">
                        <div className="relative w-full aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-white bg-slate-100">
                            <img
                                src={edificio?.logoUrl || edificio?.imagen || edificio?.foto || IMG_EDIFICIO_DEFAULT}
                                className="w-full h-full object-cover"
                                alt="Fachada del Edificio"
                            />
                        </div>
                    </div>
                </section>

                {/* 3. BARRA DE FILTROS REFINADA */}
                <section className="mb-16">
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm">
                        <div className="flex flex-col xl:flex-row gap-8 items-center justify-between">

                            {/* Tabs Principales */}
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] uppercase tracking-wider text-slate-400 ml-1 font-medium">Operación</span>
                                <div className="flex gap-1 bg-slate-50 p-1 rounded-xl">
                                    {['Todos', 'Venta', 'Renta'].map((tipo) => (
                                        <button
                                            key={tipo}
                                            onClick={() => setFiltroTipo(tipo)}
                                            className={`px-5 py-2 rounded-lg text-[11px] uppercase tracking-widest transition-all ${filtroTipo === tipo
                                                    ? 'bg-white text-blue-600 shadow-sm font-medium'
                                                    : 'text-slate-400 hover:text-slate-600 font-normal'
                                                }`}
                                        >
                                            {tipo}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Características rápidas */}
                            <div className="flex gap-8 items-center">
                                <QuickFilter
                                    label="Habitaciones"
                                    value={filters.habitaciones}
                                    onChange={(val) => setFilters({ ...filters, habitaciones: val })}
                                    options={["1", "2", "3", "4+"]}
                                />
                                <QuickFilter
                                    label="Baños"
                                    value={filters.banos}
                                    onChange={(val) => setFilters({ ...filters, banos: val })}
                                    options={["1", "2", "3+"]}
                                />
                            </div>

                            {/* Inputs de Rango */}
                            <div className="flex flex-wrap md:flex-nowrap gap-4 flex-grow max-w-2xl">
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <span className="text-[10px] uppercase tracking-wider text-slate-400 ml-1 font-medium">Área Mínima</span>
                                    <div className="relative">
                                        <Maximize size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input
                                            type="number"
                                            placeholder="m²"
                                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl text-[12px] outline-none focus:bg-white focus:border-blue-100 transition-all font-normal"
                                            value={filters.areaMin}
                                            onChange={(e) => setFilters({ ...filters, areaMin: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <span className="text-[10px] uppercase tracking-wider text-slate-400 ml-1 font-medium">Precio Máximo</span>
                                    <div className="relative">
                                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input
                                            type="number"
                                            placeholder="Monto"
                                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl text-[12px] outline-none focus:bg-white focus:border-blue-100 transition-all font-normal"
                                            value={filters.precioMax}
                                            onChange={(e) => setFilters({ ...filters, precioMax: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Botón de Limpiar */}
                            <div className="pt-5 lg:pt-0">
                                <button
                                    onClick={resetFilters}
                                    className="p-3 text-slate-300 hover:text-red-400 transition-colors border border-transparent hover:border-red-50"
                                    title="Limpiar filtros"
                                >
                                    <Eraser size={20} strokeWidth={1.5} />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. TÍTULO DE RESULTADOS */}
                <div className="flex items-center gap-4 mb-10">
                    <div className="h-[1px] flex-grow bg-slate-100"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                        {apartamentosFiltrados.length} Unidades Encontradas
                    </p>
                    <div className="h-[1px] flex-grow bg-slate-100"></div>
                </div>

                {/* 5. GRID DE APARTAMENTOS */}
                {apartamentosFiltrados.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {apartamentosFiltrados.map((apto) => {
                            const fotoApartamento =
                                apto?.foto || apto?.fotoUrl || apto?.fotosUrls?.[0] || apto?.fotos?.[0] ||
                                apto?.imagen || apto?.imagenUrl || apto?.url || apto?.logoUrl || IMG_APTO_DEFAULT;

                            return (
                                <div
                                    key={apto?.id}
                                    onClick={() => navigate(`/apartamento/${apto?.id}`)}
                                    className="group bg-white rounded-[2.5rem] border border-slate-100 hover:border-blue-600/20 transition-all p-5 shadow-sm hover:shadow-2xl cursor-pointer"
                                >
                                    <div className="relative h-72 rounded-[2rem] overflow-hidden mb-6 bg-slate-100">
                                        <img
                                            src={fotoApartamento}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                            alt={`Unidad ${apto?.unidad}`}
                                            onError={(e) => { if (e.target.src !== IMG_APTO_DEFAULT) e.target.src = IMG_APTO_DEFAULT; }}
                                        />
                                        <div className="absolute top-5 left-5">
                                            <div className="bg-white/95 backdrop-blur px-4 py-1.5 rounded-xl shadow-sm">
                                                <p className="text-[9px] font-black uppercase text-blue-600 tracking-tighter">
                                                    {apto?.tipo || apto?.estado || 'Disponible'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-2">
                                        <div className="flex justify-between items-end mb-8">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Piso {apto?.piso || '0'}</p>
                                                <h3 className="text-4xl font-black text-slate-900 uppercase italic leading-none tracking-tighter">
                                                    Apto {apto?.unidad}
                                                </h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Desde</p>
                                                <p className="text-2xl font-black text-blue-600 leading-none">
                                                    ${apto?.precio ? Number(apto.precio).toLocaleString() : '---'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <Maximize size={18} className="text-slate-400" />
                                                <span className="text-sm font-black text-slate-700">{apto?.area || '0'} m²</span>
                                            </div>
                                            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <Layers size={18} className="text-slate-400" />
                                                <span className="text-sm font-black text-slate-700">{apto?.habitaciones || '0'} Hab</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-100">
                        <Layout className="mx-auto text-slate-200 mb-4" size={48} />
                        <h3 className="font-black text-slate-900 uppercase italic">Sin coincidencias</h3>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Prueba ajustando los filtros de búsqueda</p>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

// COMPONENTE PARA LOS SELECTS DE FILTROS
const QuickFilter = ({ label, options, value, onChange }) => (
    <div className="flex flex-col gap-1.5">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 ml-1 font-medium">
            {label}
        </span>
        <div className="flex gap-1.5">
            {options.map((opt) => (
                <button
                    key={opt}
                    onClick={() => onChange(value === opt ? "" : opt)}
                    className={`h-9 w-9 rounded-xl text-[12px] transition-all border ${
                        value === opt
                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                            : "bg-white border-slate-100 text-slate-500 hover:border-slate-300 font-normal"
                    }`}
                >
                    {opt}
                </button>
            ))}
        </div>
    </div>
);

export default VistaApartamentos;