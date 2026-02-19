import { db } from '../api/firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';

const edificiosRef = collection(db, 'edificios');

// ❌ ANTES: const apartamentosRef = collection(db, 'apartamentos');
// ✅ CORRECCIÓN: Usar 'inmuebles' que es donde guarda tu InmuebleModal
const inmueblesRef = collection(db, 'inmuebles'); 

/* ====================================================
    🏢 SERVICIOS DE EDIFICIOS
   ==================================================== */

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
    🏠 SERVICIOS DE APARTAMENTOS (INMUEBLES)
   ==================================================== */

export const getApartamentosPorEdificio = async (edificioId, filtro = 'todos') => {
  try {
    // 🔹 Aseguramos que edificioId sea String y consultamos la colección correcta
    const q = query(inmueblesRef, where('edificioId', '==', String(edificioId)));
    const snapshot = await getDocs(q);
    
    let lista = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // --- CORRECCIÓN DE FILTROS ---
    // Nota: Tu modal guarda el estado como texto ("Disponible", "Habitado")
    // Si usas booleanos aquí, los filtros de "activos/inactivos" fallarán.
    if (filtro === 'activos') {
      lista = lista.filter(ap => ap.estado === 'Disponible' || ap.estado === true);
    } else if (filtro === 'inactivos') {
      lista = lista.filter(ap => ap.estado === 'Vendido' || ap.estado === false);
    }

    return lista.sort((a, b) => 
      (a.unidad || "").toString().localeCompare((b.unidad || "").toString(), undefined, { numeric: true })
    );
  } catch (error) {
    console.error("Error cargando apartamentos desde la colección inmuebles:", error);
    return [];
  }
};

// 🔹 Si decides usar este método en lugar del de inmuebles.services
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