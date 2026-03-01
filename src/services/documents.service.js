import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  doc,
  deleteDoc 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../api/firebaseConfig';

const COLLECTION_NAME = 'documents';

/**
 * 📥 OBTENER TODOS LOS DOCUMENTOS (Vista Administrador)
 * Retorna todos los documentos de la colección ordenados por fecha.
 */
export const getDocuments = async () => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    return [];
  }
};

/**
 * 📥 OBTENER POR EDIFICIO (Vista Residente)
 * Filtra los documentos según el ID del edificio asignado al usuario.
 */
export const getDocumentsByBuilding = async (buildingId) => {
  try {
    if (!buildingId) return [];

    // 1. Limpiamos el ID: nos aseguramos que sea String y sin espacios
    const idLimpio = String(buildingId).trim();
    console.log("Servicio: Buscando documentos con ID exacto:", idLimpio);

    const colRef = collection(db, 'documents');
    
    // 2. Consulta SIMPLE (sin orderBy para evitar errores de índices)
    const q = query(
      colRef,
      where('edificioId', '==', idLimpio)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.warn("Servicio: No se encontraron documentos en Firestore para este ID.");
      return [];
    }

    const resultados = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));

    // 3. Ordenamos manualmente por fecha aquí para no romper la consulta de Firebase
    return resultados.sort((a, b) => {
      const fechaA = a.createdAt?.seconds || 0;
      const fechaB = b.createdAt?.seconds || 0;
      return fechaB - fechaA;
    });

  } catch (error) {
    console.error("Error en getDocumentsByBuilding:", error);
    return [];
  }
};

/**
 * 📤 SUBIR DOCUMENTO
 * Sube el archivo a Storage y crea el registro en Firestore con metadatos.
 */
export const uploadDocument = async (formData) => {
  try {
    const titulo = formData.get('titulo');
    const edificioId = formData.get('edificioId');
    const edificioNombre = formData.get('edificioNombre'); 
    const tipo = formData.get('tipo');
    const año = formData.get('año');
    const file = formData.get('file');

    if (!file) throw new Error("No se ha proporcionado ningún archivo.");

    // 1. Definir ruta en Storage: documentos/ID_EDIFICIO/nombre_archivo
    const filePath = `documents/${edificioId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const storageRef = ref(storage, filePath);
    
    // 2. Subir el archivo físico
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    // 3. Guardar la referencia en Firestore
    return await addDoc(collection(db, COLLECTION_NAME), {
      titulo,
      edificioId: String(edificioId).trim(),
      edificioNombre: edificioNombre || 'Sin nombre', 
      tipo,
      año: año || new Date().getFullYear().toString(),
      archivourl: url,
      storagePath: filePath, 
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error al subir documento:", error);
    throw error;
  }
};

/**
 * 🗑️ ELIMINAR DOCUMENTO
 * Borra el registro de la base de datos y el archivo de Storage.
 */
export const deleteDocument = async (id, storagePath) => {
  try {
    // 1. Eliminar de Firestore
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);

    // 2. Eliminar de Storage si existe la ruta
    if (storagePath) {
      const fileRef = ref(storage, storagePath);
      await deleteObject(fileRef);
    }

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar documento:", error);
    throw error;
  }
};