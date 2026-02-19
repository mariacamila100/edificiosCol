import { db } from '../api/firebaseConfig';
import { 
  collection, addDoc, query, where, getDocs, orderBy, Timestamp, doc, deleteDoc, updateDoc 
} from 'firebase/firestore';

// REGISTRAR
export const registrarConsumo = async (data) => {
  try {
    // Limpiamos el objeto de IDs innecesarios antes de guardar
    const { id, ...cleanData } = data; 
    
    const docRef = await addDoc(collection(db, 'consumos'), {
      ...cleanData,
      edificioId: String(cleanData.edificioId), // Aseguramos string para consultas consistentes
      unidad: String(cleanData.unidad),
      fechaRegistro: Timestamp.now(),
      valor: parseFloat(cleanData.valor || 0),
      lectura: parseFloat(cleanData.lectura || 0)
    });
    return docRef.id;
  } catch (error) {
    console.error("Error al registrar:", error);
    throw error;
  }
};

// OBTENER TODOS (ADMIN)
export const getConsumos = async (edificioId = null) => {
  try {
    let q = query(collection(db, 'consumos'), orderBy('fechaRegistro', 'desc'));
    
    if (edificioId && edificioId !== 'all') {
      q = query(
        collection(db, 'consumos'), 
        where('edificioId', '==', String(edificioId)), 
        orderBy('fechaRegistro', 'desc')
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) { 
    console.error("Error al obtener consumos:", error);
    return []; 
  }
};

// OBTENER ESPECÍFICOS (RESIDENTE)
export const getConsumosResidente = async (edificioId, unidad) => {
  try {
    // Importante: En Firestore, si usas varios 'where' y un 'orderBy', necesitas un índice.
    // Usamos una consulta simple y ordenamos en memoria para evitar errores de índice.
    const qSimple = query(
      collection(db, 'consumos'),
      where('edificioId', '==', String(edificioId)),
      where('unidad', '==', String(unidad))
    );
    
    const snapshot = await getDocs(qSimple);
    const resultados = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));

    // Ordenar por fecha de registro (descendente)
    return resultados.sort((a, b) => {
      const dateA = a.fechaRegistro?.seconds || 0;
      const dateB = b.fechaRegistro?.seconds || 0;
      return dateB - dateA;
    });
  } catch (error) { 
    console.error("Error en getConsumosResidente:", error);
    return []; 
  }
};

// ACTUALIZAR
export const actualizarConsumo = async (id, data) => {
  try {
    if (!id) throw new Error("ID no proporcionado para actualizar");
    
    const consumoRef = doc(db, 'consumos', id);
    // Extraemos id para que no se guarde redundantemente dentro de los campos
    const { id: _, ...updateData } = data;

    await updateDoc(consumoRef, {
      ...updateData,
      edificioId: String(updateData.edificioId),
      unidad: String(updateData.unidad),
      valor: parseFloat(updateData.valor || 0),
      lectura: parseFloat(updateData.lectura || 0),
      ultimaModificacion: Timestamp.now()
    });
  } catch (error) {
    console.error("Error al actualizar:", error);
    throw error;
  }
};

// ELIMINAR
export const eliminarConsumo = async (id) => {
  try {
    await deleteDoc(doc(db, 'consumos', id));
  } catch (error) { 
    console.error("Error al eliminar:", error);
    throw error; 
  }
};