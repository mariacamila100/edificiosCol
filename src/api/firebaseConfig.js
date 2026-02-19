import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Agregamos el export aquí para que usuarios.service.js pueda usarlo
export const firebaseConfig = {
  apiKey: "AIzaSyB0VIJw1KCRzFsdUKvukUUOgsva7bWz-IQ",
  authDomain: "edificioscolombia-b26d6.firebaseapp.com",
  projectId: "edificioscolombia-b26d6",
  storageBucket: "edificioscolombia-b26d6.firebasestorage.app",
  messagingSenderId: "36382541137",
  appId: "1:36382541137:web:4c1795f59a369b4b903f70"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);