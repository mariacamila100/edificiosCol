import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApartamentoById, getEdificios } from '../services/edificios.services';
import Footer from '../components/Footer';
import { 
    ArrowLeft, Ruler, BedDouble, MessageCircle, 
    Building2, MapPin, ShieldCheck, CheckCircle2, Navigation, AlignLeft
} from 'lucide-react';

const DetalleApartamento = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [apto, setApto] = useState(null);
    const [edificio, setEdificio] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarData = async () => {
            try {
                setLoading(true);
                const dataApto = await getApartamentoById(id);
                setApto(dataApto);

                const listaEdificios = await getEdificios();
                const infoEdificio = listaEdificios.find(e => e.id === dataApto.edificioId);
                setEdificio(infoEdificio);
            } catch (error) { 
                console.error("Error cargando datos:", error); 
            } finally { 
                setLoading(false); 
            }
        };
        if (id) cargarData();
    }, [id]);

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-900 border-t-blue-400 rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-900 italic">Edificios Colombia</p>
            </div>
        </div>
    );

    if (!apto) return <div className="p-20 text-center font-black">UNIDAD NO ENCONTRADA</div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
            
            {/* Ajuste de Margen Superior para no chocar con el Navbar */}
            <main className="max-w-7xl mx-auto px-6 pt-24 pb-20">
                
                {/* BOTÓN VOLVER (Con margen superior extra para visibilidad) */}
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* BLOQUE IZQUIERDO */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* IMAGEN PRINCIPAL */}
                        <div className="relative bg-white p-3 rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100">
                            <div className="absolute top-8 left-8 z-10 flex gap-2">
                                <span className="bg-blue-900 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                                    {edificio?.ciudad || 'Colombia'}
                                </span>
                            </div>
                            <img 
                                src={apto?.foto || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2000"} 
                                className="w-full aspect-[16/9] object-cover rounded-[2.5rem]"
                                alt="Propiedad"
                            />
                        </div>

                        {/* DESCRIPCIÓN DESTACADA (NUEVA SECCIÓN MÁS VISIBLE) */}
                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <AlignLeft size={120} />
                            </div>
                            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                <span className="w-8 h-[2px] bg-blue-500"></span>
                                Descripción de la Unidad
                            </h3>
                            <p className="text-2xl md:text-3xl font-light text-slate-700 leading-tight italic">
                                {apto?.descripcion || `Excelente oportunidad en ${edificio?.nombre || 'este exclusivo proyecto'}. Espacios diseñados para el confort y la modernidad.`}
                            </p>
                        </div>

                        {/* INFO DE UBICACIÓN */}
                        <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-2 gap-8 shadow-xl">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Sector Estratégico</p>
                                <div className="flex items-center gap-3">
                                    <Navigation className="text-white opacity-50" size={20} />
                                    <p className="font-bold text-xl uppercase tracking-tighter italic">{edificio?.barrio || 'Zona Residencial'}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Punto de Referencia</p>
                                <div className="flex items-center gap-3">
                                    <MapPin className="text-white opacity-50" size={20} />
                                    <p className="font-bold text-xl uppercase tracking-tighter italic">{edificio?.direccion}</p>
                                </div>
                            </div>
                        </div>

                        {/* CARACTERÍSTICAS TÉCNICAS */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Área Privada', val: `${apto?.area} m²`, icon: Ruler },
                                { label: 'Habitaciones', val: apto?.habitaciones, icon: BedDouble },
                                { label: 'Piso', val: apto?.piso || 'N/A', icon: Building2 },
                                { label: 'Certificación', val: 'Garantizada', icon: ShieldCheck },
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-500 transition-all group">
                                    <item.icon className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" size={24} />
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                    <p className="text-xl font-black text-blue-900">{item.val}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* BLOQUE DERECHO */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-28 space-y-6">
                            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
                                
                                <div className="mb-10">
                                    <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                                        {edificio?.nombre || 'PROYECTO EDIFICIOS COLOMBIA'}
                                    </p>
                                    <h2 className="text-6xl font-black text-blue-900 uppercase tracking-tighter leading-none italic">
                                        Apto <span className="text-blue-500">{apto?.unidad}</span>
                                    </h2>
                                </div>
                                
                                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-8">
                                    <p className="text-slate-400 text-[10px] font-black uppercase mb-2">Precio de Venta</p>
                                    <p className="text-4xl font-black text-blue-900 italic">
                                        ${apto?.precio?.toLocaleString()} 
                                        <span className="text-[10px] ml-2 font-bold opacity-40">COP</span>
                                    </p>
                                </div>

                                <ul className="space-y-4 mb-10 ml-2">
                                    {['Tradición Verificada', 'Trámite Simplificado', 'Entrega Inmediata'].map((text, i) => (
                                        <li key={i} className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            <CheckCircle2 size={16} className="text-blue-500" /> {text}
                                        </li>
                                    ))}
                                </ul>

                                <a 
                                    href={`https://wa.me/573000000000?text=Hola Edificios Colombia, deseo información del apto ${apto?.unidad} en ${edificio?.barrio}.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 w-full bg-blue-600 hover:bg-blue-900 text-white py-6 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-blue-200 active:scale-95"
                                >
                                    <MessageCircle size={20} /> Solicitar Visita
                                </a>
                            </div>

                            {/* BANNER DE SEGURIDAD */}
                            <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100">
                                <p className="text-blue-900 text-sm font-bold leading-snug">
                                    Esta propiedad cuenta con el respaldo jurídico y técnico de <span className="text-blue-600">Edificios Colombia</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default DetalleApartamento;