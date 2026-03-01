import { db } from '../api/firebaseConfig';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'; 
import { createUserWithEmailAndPassword, signOut, getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../api/firebaseConfig';

const collectionRef = collection(db, 'usuarios');

// Inicialización secundaria para no cerrar sesión admin
const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
const secondaryAuth = getAuth(secondaryApp);

export const getUsuarios = async () => {
  try {
    const querySnapshot = await getDocs(collectionRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw error;
  }
};

export const createUsuario = async (data) => {
  try {
    // 1️⃣ Crear usuario en Auth
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth, 
      data.email, 
      data.password
    );

    const uid = userCredential.user.uid;

    // Cerramos sesión secundaria
    await signOut(secondaryAuth);

    // 2️⃣ Guardar en Firestore (AHORA con telefono)
    const docData = {
      nombreApellido: data.nombreApellido,
      email: data.email,
      telefono: data.telefono || '', // 🔥 NUEVO CAMPO
      edificioId: data.edificioId,
      unidad: data.unidad,
      rol: data.rol || 'residente',
      estado: true,
      uid: uid,
      createdAt: serverTimestamp()
    };

    return await addDoc(collectionRef, docData);

  } catch (error) {
    console.error("Error en createUsuario:", error);
    throw error;
  }
};

export const updateUsuario = async (id, data) => {
  try {
    const docRef = doc(db, 'usuarios', id);

    // Evitamos guardar password
    const { password, ...updateData } = data;

    // 🔥 Nos aseguramos que telefono se actualice
    return await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });

  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error;
  }
};

export const toggleEstadoUsuario = async (id, estadoActual) => {
  try {
    const docRef = doc(db, 'usuarios', id);
    await updateDoc(docRef, {
      estado: !estadoActual
    });
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    throw error;
  }
};

export const generarPasswordSegura = (longitud = 10) => {
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
  let password = "";
  for (let i = 0; i < longitud; i++) {
    password += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return password;
};

export const copiarAlPortapapeles = async (texto) => {
  if (!texto) return false;
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch (err) {
    console.error("Error al copiar:", err);
    return false;
  }
};