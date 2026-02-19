import { db, storage } from '../api/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query, // 👈 AGREGADO
  where  // 👈 AGREGADO
} from 'firebase/firestore';

const inmueblesCollection = collection(db, 'inmuebles');

// --- TUS FUNCIONES ORIGINALES (SE MANTIENEN IGUAL) ---

const uploadMultipleImages = async (files) => {
  if (!files || !Array.isArray(files) || files.length === 0) return [];
  const uploadPromises = files.map(async (file) => {
    if (typeof file === 'string' && (file.startsWith('http') || file.startsWith('blob'))) {
      return file;
    }
    try {
      const fileName = `${Date.now()}_${file.name?.replace(/\s+/g, '_') || 'img'}`;
      const storageRef = ref(storage, `inmuebles/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error("Error al subir imagen individual:", error);
      return null;
    }
  });
  const results = await Promise.all(uploadPromises);
  return results.filter(url => url !== null);
};

export const getInmuebles = async () => {
  try {
    const snapshot = await getDocs(inmueblesCollection);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Error al obtener inmuebles:", error);
    throw error;
  }
};

export const createInmueble = async (data, imageFiles) => {
  try {
    const fotosUrls = await uploadMultipleImages(imageFiles);
    const cleanData = {
      ...data,
      edificioId: data.edificioId ? String(data.edificioId) : '',
      precio: Number(data.precio) || 0,
      habitaciones: Number(data.habitaciones) || 0,
      baños: Number(data.baños) || 0,
      area: String(data.area || ''),
      barrio: data.barrio || '',
      estrato: Number(data.estrato) || null,
      parqueadero: Boolean(data.parqueadero),
      amoblado: Boolean(data.amoblado),
      destacado: Boolean(data.destacado),
      fotos: fotosUrls, 
      fechaPublicacion: serverTimestamp(),
      estado: data.estado || 'Disponible'
    };
    return await addDoc(inmueblesCollection, cleanData);
  } catch (error) {
    console.error("Error en createInmueble:", error);
    throw error;
  }
};

export const updateInmueble = async (id, data, currentFiles = []) => {
  try {
    const docRef = doc(db, 'inmuebles', id);
    const fotosUrls = await uploadMultipleImages(currentFiles);
    const cleanData = {
      ...data,
      edificioId: data.edificioId ? String(data.edificioId) : '',
      precio: Number(data.precio) || 0,
      fotos: fotosUrls
    };
    return await updateDoc(docRef, cleanData);
  } catch (error) {
    console.error("Error en updateInmueble:", error);
    throw error;
  }
};

export const deleteInmueble = async (id) => {
  try {
    const docRef = doc(db, 'inmuebles', id);
    return await deleteDoc(docRef);
  } catch (error) {
    console.error("Error al eliminar inmueble:", error);
    throw error;
  }
};

// --- 🌟 LA FUNCIÓN QUE FALTABA Y CAUSABA EL ERROR 🌟 ---

/**
 * Obtiene solo los inmuebles de un edificio específico
 */
export const getInmueblesPorEdificio = async (edificioId) => {
  try {
    const q = query(
      inmueblesCollection, 
      where('edificioId', '==', String(edificioId))
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error filtrando inmuebles:", error);
    return [];
  }
};