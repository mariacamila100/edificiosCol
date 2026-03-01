import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApartamentoById, getEdificios } from '../services/edificios.services';
import Footer from '../components/Footer';
import { 
    ArrowLeft, Ruler, BedDouble, MessageCircle, 
    Building2, MapPin, ShieldCheck, CheckCircle2, Navigation, 
    AlignLeft, Bath, Car, Activity
} from 'lucide-react';

const DetalleApartamento = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [apto, setApto] = useState(null);
    const [edificio, setEdificio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const cargarData = async () => {
            try {
                setLoading(true);
                const dataApto = await getApartamentoById(id);
                setApto(dataApto);

                // --- DETECCIÓN DINÁMICA DE IMÁGENES ---
                // Buscamos primero en 'logoUrl' (que es la principal del modal)
                // y luego en el primer elemento de 'fotosUrls'
                const fotoPrincipal = 
                    dataApto.logoUrl || 
                    (dataApto.fotosUrls && dataApto.fotosUrls[0]) ||
                    (dataApto.fotos && dataApto.fotos[0]);
                
                setSelectedImage(fotoPrincipal || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2000");

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

    if (!apto) return <div className="p-20 text-center font-black text-blue-900">UNIDAD NO ENCONTRADA</div>;

    // --- CONSTRUCCIÓN DE GALERÍA REAL ---
    // Unificamos logoUrl y el array fotosUrls que viene de Firebase
    const galeriaFinal = [
        apto.logoUrl,
        ...(Array.isArray(apto.fotosUrls) ? apto.fotosUrls : []),
        ...(Array.isArray(apto.fotos) ? apto.fotos : [])
    ].filter(img => img && typeof img === 'string'); // Eliminamos nulos y duplicados

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
            <main className="max-w-7xl mx-auto px-6 pt-24 pb-20">
                
                {/* BOTÓN VOLVER */}
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
                    
                    {/* BLOQUE IZQUIERDO: GALERÍA */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        <div className="space-y-6">
                            {/* Imagen Principal */}
                            <div className="relative bg-white p-3 rounded-[3.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100">
                                <div className="absolute top-8 left-8 z-10 flex gap-2">
                                    <span className="bg-blue-900/90 backdrop-blur-md text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                                        {edificio?.ciudad || 'Propiedad Verificada'}
                                    </span>
                                </div>
                                <img 
                                    src={selectedImage} 
                                    className="w-full aspect-[16/9] object-cover rounded-[2.8rem] transition-all duration-500 bg-slate-100"
                                    alt="Vista Principal"
                                />
                            </div>

                            {/* Miniaturas de Firebase */}
                            {galeriaFinal.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar">
                                    {[...new Set(galeriaFinal)].map((img, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => setSelectedImage(img)}
                                            className={`relative flex-shrink-0 w-32 h-20 rounded-2xl overflow-hidden border-4 transition-all ${
                                                selectedImage === img ? 'border-blue-600 scale-95 shadow-lg' : 'border-white opacity-80'
                                            }`}
                                        >
                                            <img src={img} className="w-full h-full object-cover" alt={`Miniatura ${idx}`} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* DESCRIPCIÓN */}
                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                <span className="w-8 h-[2px] bg-blue-500"></span>
                                Reseña de la Unidad
                            </h3>
                            <p className="text-2xl md:text-3xl font-light text-slate-700 leading-tight italic">
                                {apto?.descripcion || `Excelente oportunidad en ${edificio?.nombre || 'este exclusivo proyecto'}.`}
                            </p>
                        </div>

                        {/* CARACTERÍSTICAS TÉCNICAS */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Área Privada', val: `${apto?.area} m²`, icon: Ruler },
                                { label: 'Habitaciones', val: apto?.habitaciones, icon: BedDouble },
                                { label: 'Baños', val: apto?.baños || '1', icon: Bath },
                                { label: 'Estrato', val: apto?.estrato || 'N/A', icon: Activity },
                                { label: 'Piso', val: apto?.piso || 'N/A', icon: Building2 },
                                { label: 'Parqueadero', val: apto?.parqueadero ? 'Sí' : 'No', icon: Car },
                                { label: 'Ubicación', val: edificio?.barrio, icon: MapPin },
                                { label: 'Legalidad', val: 'Tradición', icon: ShieldCheck },
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:border-blue-500 transition-all">
                                    <item.icon className="text-blue-500 mb-3" size={20} />
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                    <p className="text-lg font-black text-blue-900 truncate">{item.val}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* BLOQUE DERECHO */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-28 space-y-6">
                            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
                                <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{edificio?.nombre}</p>
                                <h2 className="text-6xl font-black text-blue-900 uppercase italic leading-none mb-10">
                                    Apto <span className="text-blue-500">{apto?.unidad}</span>
                                </h2>
                                
                                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-8">
                                    <p className="text-slate-400 text-[10px] font-black uppercase mb-2">Precio de Venta</p>
                                    <p className="text-4xl font-black text-blue-900 italic">
                                        ${Number(apto?.precio).toLocaleString()} <span className="text-xs opacity-40">COP</span>
                                    </p>
                                </div>

                                <a 
                                    href={`https://wa.me/573000000000?text=Hola Edificios Colombia, deseo información del apto ${apto?.unidad}.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 w-full bg-blue-600 hover:bg-blue-900 text-white py-6 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-blue-200 active:scale-95"
                                >
                                    <MessageCircle size={20} /> Solicitar Visita
                                </a>
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