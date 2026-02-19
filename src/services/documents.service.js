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
 * 📥 OBTENER TODOS LOS DOCUMENTOS (Vista Admin)
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
 * 📥 OBTENER POR EDIFICIO (Vista Residente/Detalles)
 * NOTA: Si esta consulta te da error en consola, haz clic en el link 
 * que proporciona Firebase para crear el índice compuesto automáticamente.
 */
export const getDocumentsByBuilding = async (buildingId) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('edificioId', '==', String(buildingId)), // Forzamos string para evitar errores de tipo
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    console.error("Error al obtener documentos por edificio:", error);
    return [];
  }
};

/**
 * 📤 SUBIR DOCUMENTO
 */
export const uploadDocument = async (formData) => {
  try {
    const titulo = formData.get('titulo');
    const edificioId = formData.get('edificioId');
    const tipo = formData.get('tipo');
    const año = formData.get('año');
    const file = formData.get('file');

    if (!file) throw new Error("No se ha proporcionado ningún archivo.");

    // 1. Crear referencia y subir a Firebase Storage
    const filePath = `documents/${edificioId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);
    
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    // 2. Guardar referencia en Firestore
    return await addDoc(collection(db, COLLECTION_NAME), {
      titulo,
      edificioId: String(edificioId), // Consistencia de datos
      tipo,
      año,
      archivourl: url,
      storagePath: filePath, // 🔹 Guardamos la ruta para poder borrarlo después
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error al subir documento:", error);
    throw error;
  }
};

/**
 * 🗑️ ELIMINAR DOCUMENTO
 * @param {string} id - ID del documento en Firestore
 * @param {string} storagePath - Ruta del archivo en Firebase Storage
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