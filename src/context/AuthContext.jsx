import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../api/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore'; // Importa estos

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // CAMBIO: Buscamos por el campo 'uid' dentro de la colección
          const q = query(collection(db, "usuarios"), where("uid", "==", firebaseUser.uid));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              rol: data.rol,
              unidad: data.unidad,
              edificioId: data.edificioId,
              nombreCompleto: data.nombreApellido // Usamos el nombre del campo de tu imagen
            });
          } else {
            await signOut(auth);
            setUser(null);
          }
        } catch (error) {
          console.error("Error al obtener perfil:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);