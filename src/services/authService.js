// src/services/authService.js
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// Registrar nuevo usuario
export const registerUser = async (email, password, displayName) => {
  try {
    // Crear usuario en Authentication
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
      role: 'patient',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      settings: {
        theme: 'blue',
        fontSize: 'medium',
        notifications: true,
        darkMode: false
      },
      stats: {
        totalEntries: 0,
        currentStreak: 0,
        longestStreak: 0
      }
    });

    return { success: true, user };
  } catch (error) {
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// Iniciar sesión
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// Iniciar sesión con Google
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Verificar si el usuario ya existe en Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Si es nuevo, crear documento
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: 'patient',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        settings: {
          theme: 'blue',
          fontSize: 'medium',
          notifications: true,
          darkMode: false
        },
        stats: {
          totalEntries: 0,
          currentStreak: 0,
          longestStreak: 0
        }
      });
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// Cerrar sesión
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// Recuperar contraseña
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// Mensajes de error en español
const getErrorMessage = (errorCode) => {
  const errors = {
    'auth/email-already-in-use': 'Este correo ya está registrado',
    'auth/invalid-email': 'Correo electrónico inválido',
    'auth/operation-not-allowed': 'Operación no permitida',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/user-not-found': 'No existe una cuenta con este correo',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
    'auth/popup-closed-by-user': 'Inicio de sesión cancelado',
    'auth/cancelled-popup-request': 'Inicio de sesión cancelado'
  };
  
  return errors[errorCode] || 'Ocurrió un error. Intenta nuevamente';
};

// Obtener datos del usuario desde Firestore
export const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return null;
  }
};
