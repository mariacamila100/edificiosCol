import { db } from '../api/firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  getDoc, // Crucial para el detalle
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';

// Definición de referencias a colecciones
const edificiosRef = collection(db, 'edificios');
const inmueblesRef = collection(db, 'inmuebles'); 

/* ====================================================
    🏢 SERVICIOS DE EDIFICIOS
   ==================================================== */

// Obtener todos los edificios activos para el catálogo
export const getEdificios = async () => {
  try {
    const q = query(edificiosRef, where('estado', '==', 'activo'));
    const snapshot = await getDocs(q);
    const lista = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return lista.sort((a, b) => {
      const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error cargando edificios:", error);
    return [];
  }
};

export const createEdificio = async (data) => {
  return await addDoc(edificiosRef, {
    ...data,
    estado: 'activo',
    createdAt: serverTimestamp()
  });
};

export const updateEdificio = async (id, data) => {
  return await updateDoc(doc(db, 'edificios', id), {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const inactivateEdificio = async (id) => {
  return await updateDoc(doc(db, 'edificios', id), {
    estado: 'inactivo',
    inactivatedAt: serverTimestamp()
  });
};


/* ====================================================
    🏠 SERVICIOS DE INMUEBLES (APARTAMENTOS)
   ==================================================== */

/**
 * 🔥 ESTA FUNCIÓN SOLUCIONA LA PANTALLA EN BLANCO
 * Obtiene la información de un solo apartamento por su ID único.
 */
export const getApartamentoById = async (id) => {
  try {
    if (!id) return null;
    
    // Limpieza total del ID
    const cleanId = String(id).trim(); 
    
    const docRef = doc(db, 'inmuebles', cleanId);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error("Error en Firebase:", error);
    return null;
  }
};

// Obtener lista de apartamentos filtrados por edificio
export const getApartamentosPorEdificio = async (edificioId, filtro = 'todos') => {
  try {
    const q = query(inmueblesRef, where('edificioId', '==', String(edificioId)));
    const snapshot = await getDocs(q);
    
    let lista = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Lógica de filtros basada en tus estados de texto ("Disponible", "Habitado", "Vendido")
    if (filtro === 'activos') {
      lista = lista.filter(ap => ap.estado === 'Disponible' || ap.estado === true);
    } else if (filtro === 'inactivos') {
      lista = lista.filter(ap => ap.estado === 'Vendido' || ap.estado === 'Habitado' || ap.estado === false);
    }

    // Ordenar por número de unidad de forma numérica
    return lista.sort((a, b) => 
      (a.unidad || "").toString().localeCompare((b.unidad || "").toString(), undefined, { numeric: true })
    );
  } catch (error) {
    console.error("Error cargando apartamentos desde la colección inmuebles:", error);
    return [];
  }
};

export const createApartamento = async (edificioId, data) => {
  return await addDoc(inmueblesRef, {
    ...data,
    edificioId: String(edificioId),
    estado: 'Disponible', 
    createdAt: serverTimestamp()
  });
};

export const toggleEstadoApartamento = async (aptoId, nuevoEstado) => {
  const docRef = doc(db, 'inmuebles', aptoId);
  return await updateDoc(docRef, {
    estado: nuevoEstado,
    updatedAt: serverTimestamp()
  });
};