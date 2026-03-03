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
  query,
  where
} from 'firebase/firestore';

const inmueblesCollection = collection(db, 'inmuebles');

// Función auxiliar para subir imágenes (Galería y Logo)
const uploadFile = async (file, folder) => {
  if (!file) return null;
  // Si ya es una URL (porque estamos editando), la devolvemos tal cual
  if (typeof file === 'string' && (file.startsWith('http') || file.startsWith('blob'))) {
    return file;
  }
  try {
    const fileName = `${Date.now()}_${file.name?.replace(/\s+/g, '_') || 'img'}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error(`Error al subir archivo a ${folder}:`, error);
    return null;
  }
};

const uploadMultipleImages = async (files) => {
  if (!files || !Array.isArray(files) || files.length === 0) return [];
  const results = await Promise.all(files.map(file => uploadFile(file, 'inmuebles/galeria')));
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

// 🌟 CORRECCIÓN: Ahora acepta logoFile por separado
export const createInmueble = async (data, imageFiles, logoFile) => {
  try {
    // Subir logo y galería
    const logoUrl = await uploadFile(logoFile, 'inmuebles/portadas');
    const fotosUrls = await uploadMultipleImages(imageFiles);

    const cleanData = {
      ...data,
      // Forzamos que sea String para que getInmueblesPorEdificio lo encuentre
      edificioId: String(data.edificioId || ''), 
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
      logoUrl: logoUrl, // Guardamos la portada/logo
      fechaPublicacion: serverTimestamp(),
      estado: data.estado || 'Disponible'
    };

    return await addDoc(inmueblesCollection, cleanData);
  } catch (error) {
    console.error("Error en createInmueble:", error);
    throw error;
  }
};

export const updateInmueble = async (id, data, currentFiles = [], logoFile = null) => {
  try {
    const docRef = doc(db, 'inmuebles', id);
    
    // Subir nuevos archivos si existen
    const logoUrl = logoFile ? await uploadFile(logoFile, 'inmuebles/portadas') : data.logoUrl;
    const fotosUrls = await uploadMultipleImages(currentFiles);

    const cleanData = {
      ...data,
      edificioId: String(data.edificioId || ''),
      precio: Number(data.precio) || 0,
      fotos: fotosUrls,
      logoUrl: logoUrl
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

export const getInmueblesPorEdificio = async (edificioId) => {
  try {
    // Importante: El ID debe ser String exacto
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