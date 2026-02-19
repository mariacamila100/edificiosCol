import { db } from '../api/firebaseConfig';
import { 
  collection, addDoc, query, where, getDocs, orderBy, Timestamp, doc, deleteDoc, updateDoc 
} from 'firebase/firestore';

// REGISTRAR (Asegúrate de que tenga el 'export')
export const registrarConsumo = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'consumos'), {
      ...data,
      fechaRegistro: Timestamp.now(),
      valor: parseFloat(data.valor),
      lectura: parseFloat(data.lectura)
    });
    return docRef.id;
  } catch (error) {
    console.error("Error al registrar:", error);
    throw error;
  }
};

// OBTENER TODOS
export const getConsumos = async (edificioId = null) => {
  try {
    let q = query(collection(db, 'consumos'), orderBy('fechaRegistro', 'desc'));
    if (edificioId && edificioId !== 'all') {
      q = query(collection(db, 'consumos'), where('edificioId', '==', edificioId), orderBy('fechaRegistro', 'desc'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) { return []; }
};

// OBTENER ESPECÍFICOS (La que usamos para Andrey)
export const getConsumosResidente = async (edificioId, unidad) => {
  try {
    const qSimple = query(
      collection(db, 'consumos'),
      where('edificioId', '==', String(edificioId)),
      where('unidad', '==', String(unidad))
    );
    const snapshot = await getDocs(qSimple);
    const resultados = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return resultados.sort((a, b) => (b.fechaRegistro?.seconds || 0) - (a.fechaRegistro?.seconds || 0));
  } catch (error) { return []; }
};

// ELIMINAR
export const eliminarConsumo = async (id) => {
  try {
    await deleteDoc(doc(db, 'consumos', id));
  } catch (error) { throw error; }
};

// ESTA ES LA QUE FALTA O TIENE ERROR DE NOMBRE
export const actualizarConsumo = async (id, data) => {
  try {
    const consumoRef = doc(db, 'consumos', id);
    await updateDoc(consumoRef, {
      ...data,
      valor: parseFloat(data.valor),
      lectura: parseFloat(data.lectura),
      ultimaModificacion: Timestamp.now()
    });
  } catch (error) {
    console.error("Error al actualizar:", error);
    throw error;
  }
};