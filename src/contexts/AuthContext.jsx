// src/contexts/AuthContext.jsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// 1. Crear el contexto
const AuthContext = createContext(undefined);

// 2. Proveedor del contexto
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- EFECTO DE AUTENTICACIÓN ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Usuario autenticado
          setUser(firebaseUser);
          
          // Cargar datos adicionales del usuario desde Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } else {
          // Usuario no autenticado
          setUser(null);
          setUserData(null);
        }
      } catch (err) {
        console.error('Error en onAuthStateChanged:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup
    return () => unsubscribe();
  }, []);

  // --- REGISTRO CON EMAIL ---
  const signup = async (email, password, displayName) => {
    try {
      setError(null);
      setLoading(true);

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Actualizar perfil con nombre
      await updateProfile(user, { displayName });

      // Crear documento en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        settings: {
          fontSize: 'medium',
          pushNotifications: false,
          emailNotifications: true
        },
        stats: {
          totalEntries: 0,
          currentStreak: 0,
          longestStreak: 0
        }
      });

      return { success: true, user };
    } catch (err) {
      console.error('Error en signup:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIN CON EMAIL ---
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (err) {
      console.error('Error en login:', err);
      
      // Mensajes de error personalizados
      let errorMessage = 'Error al iniciar sesión';
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No existe una cuenta con este correo';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Correo electrónico inválido';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'Esta cuenta ha sido deshabilitada';
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIN CON GOOGLE ---
  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);

      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Verificar si el usuario ya existe en Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Crear documento para nuevo usuario de Google
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          settings: {
            fontSize: 'medium',
            pushNotifications: false,
            emailNotifications: true
          },
          stats: {
            totalEntries: 0,
            currentStreak: 0,
            longestStreak: 0
          }
        });
      }

      return { success: true, user };
    } catch (err) {
      console.error('Error en loginWithGoogle:', err);
      
      let errorMessage = 'Error al iniciar sesión con Google';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Inicio de sesión cancelado';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup bloqueado por el navegador';
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // --- CERRAR SESIÓN ---
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
      setUserData(null);
      return { success: true };
    } catch (err) {
      console.error('Error en logout:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // --- RECUPERAR CONTRASEÑA ---
  const resetPassword = async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Correo de recuperación enviado' };
    } catch (err) {
      console.error('Error en resetPassword:', err);
      
      let errorMessage = 'Error al enviar correo de recuperación';
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No existe una cuenta con este correo';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Correo electrónico inválido';
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // --- ACTUALIZAR PERFIL ---
  const updateUserProfile = async (updates) => {
    try {
      setError(null);
      
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }

      // Actualizar en Firebase Auth
      if (updates.displayName || updates.photoURL) {
        await updateProfile(user, {
          displayName: updates.displayName || user.displayName,
          photoURL: updates.photoURL || user.photoURL
        });
      }

      // Actualizar en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...updates,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Recargar datos del usuario
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }

      return { success: true };
    } catch (err) {
      console.error('Error en updateUserProfile:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // --- LOADER ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // --- VALOR DEL CONTEXTO ---
  const value = {
    user,
    userData,
    loading,
    error,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

// 4. Hook para verificar si el usuario está autenticado
export function useRequireAuth(redirectUrl = '/login') {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectUrl);
    }
  }, [user, loading, router, redirectUrl]);

  return { user, loading };
}