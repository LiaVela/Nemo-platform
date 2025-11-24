// src/components/profile/ProfileSetup.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { auth, db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { User, Mail, Lock, Edit2, X, Check, ArrowLeft, Camera, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Profile() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  
  const [usuario, setUsuario] = useState(null);
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [previsualizacionImagen, setPrevisualizacionImagen] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    nuevaContrasena: '',
    confirmarContrasena: '',
  });

  // ✅ FIX: Usar onAuthStateChanged para esperar autenticación
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        cargarDatosUsuario(user);
      } else {
        setCargando(false);
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!editando) {
      setPrevisualizacionImagen(null);
    }
  }, [editando]);

  // ✅ FIX: Recibir user como parámetro y cambiar 'usuarios' a 'users'
  const cargarDatosUsuario = async (user) => {
    try {
      setCargando(true);

      // ✅ Cambiar 'usuarios' a 'users'
      const docRef = doc(db, 'users', user.uid);
      
      let datosFirestore = {};

      // ✅ Manejo de errores mejorado
      try {
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          const nuevosDatos = {
            nombre: user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL || '',
            fechaCreacion: user.metadata.creationTime,
            fechaActualizacion: new Date().toISOString(),
          };
          
          await setDoc(docRef, nuevosDatos);
          datosFirestore = nuevosDatos;
        } else {
          datosFirestore = docSnap.data();
        }
      } catch (firestoreError) {
        console.warn('⚠️ Error de Firestore, usando datos de Auth:', firestoreError);
        datosFirestore = {
          nombre: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
        };
      }

      const datosUsuario = {
        uid: user.uid,
        nombre: user.displayName || datosFirestore.nombre || '',
        email: user.email || '',
        photoURL: datosFirestore.photoURL || user.photoURL || '',
        fechaCreacion: user.metadata.creationTime,
        ...datosFirestore,
      };

      setUsuario(datosUsuario);
      setFormData({
        nombre: datosUsuario.nombre,
        email: datosUsuario.email,
        nuevaContrasena: '',
        confirmarContrasena: '',
      });
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      
      if (error.code === 'permission-denied') {
        mostrarMensaje('error', 'Error de permisos. Verifica las reglas de Firestore.');
      } else {
        mostrarMensaje('error', 'Error al cargar los datos del usuario');
      }
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);
  };

  const handleImagenClick = () => {
    if (editando) {
      fileInputRef.current?.click();
    }
  };

  const handleImagenChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      mostrarMensaje('error', 'Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      mostrarMensaje('error', 'La imagen no debe superar los 5MB');
      return;
    }

    try {
      setSubiendoImagen(true);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPrevisualizacionImagen(reader.result);
      };
      reader.readAsDataURL(file);

      const user = auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');

      // ✅ FIX: Cambiar ruta de Storage según tus reglas
      const storageRef = ref(storage, `users/${user.uid}/profile/${Date.now()}_${file.name}`);
      
      console.log('📤 Subiendo imagen a Storage...');
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      console.log('✅ URL obtenida:', downloadURL);

      await updateProfile(user, {
        photoURL: downloadURL
      });
      console.log('✅ Firebase Auth actualizado');

      await user.reload();

      // ✅ Cambiar 'usuarios' a 'users'
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, {
        photoURL: downloadURL,
        fechaActualizacion: new Date().toISOString(),
      }, { merge: true });
      console.log('✅ Firestore actualizado');

      setUsuario(prev => ({
        ...prev,
        photoURL: downloadURL,
      }));

      setPrevisualizacionImagen(null);

      mostrarMensaje('success', 'Foto de perfil actualizada');
    } catch (error) {
      console.error('❌ Error al subir imagen:', error);
      mostrarMensaje('error', `Error al subir la imagen: ${error.message}`);
    } finally {
      setSubiendoImagen(false);
    }
  };

  const handleEditarClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🖊️ Modo edición activado');
    setEditando(true);
    setMensaje({ tipo: '', texto: '' });
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('💾 Iniciando guardado...');
    setGuardando(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      if (formData.nuevaContrasena) {
        if (formData.nuevaContrasena.length < 6) {
          mostrarMensaje('error', 'La contraseña debe tener al menos 6 caracteres');
          setGuardando(false);
          return;
        }
        if (formData.nuevaContrasena !== formData.confirmarContrasena) {
          mostrarMensaje('error', 'Las contraseñas no coinciden');
          setGuardando(false);
          return;
        }
      }

      console.log('🔄 Actualizando perfil...');

      if (formData.nombre !== usuario.nombre) {
        await updateProfile(user, {
          displayName: formData.nombre,
        });
        console.log('✅ Nombre actualizado en Auth');
      }

      if (formData.email !== usuario.email) {
        await updateEmail(user, formData.email);
        console.log('✅ Email actualizado en Auth');
      }

      if (formData.nuevaContrasena) {
        await updatePassword(user, formData.nuevaContrasena);
        console.log('✅ Contraseña actualizada');
      }

      await user.reload();

      // ✅ Cambiar 'usuarios' a 'users'
      const docRef = doc(db, 'users', user.uid);
      const datosActualizados = {
        nombre: formData.nombre,
        email: formData.email,
        fechaActualizacion: new Date().toISOString(),
      };

      await setDoc(docRef, datosActualizados, { merge: true });
      console.log('✅ Firestore actualizado');

      await cargarDatosUsuario(user);
      setEditando(false);
      setFormData(prev => ({
        ...prev,
        nuevaContrasena: '',
        confirmarContrasena: '',
      }));
      setPrevisualizacionImagen(null);

      mostrarMensaje('success', 'Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar:', error);
      
      let mensajeError = 'Error al actualizar el perfil';
      if (error.code === 'auth/requires-recent-login') {
        mensajeError = 'Por seguridad, debes cerrar sesión y volver a iniciar para cambiar estos datos';
      } else if (error.code === 'auth/email-already-in-use') {
        mensajeError = 'Este email ya está en uso';
      } else if (error.code === 'auth/weak-password') {
        mensajeError = 'La contraseña es muy débil';
      } else if (error.code === 'permission-denied') {
        mensajeError = 'Error de permisos. Verifica las reglas de Firestore.';
      } else if (error.code === 'auth/invalid-email') {
        mensajeError = 'El email no es válido';
      } else {
        mensajeError = `Error: ${error.message}`;
      }
      
      mostrarMensaje('error', mensajeError);
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('❌ Edición cancelada');
    setEditando(false);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      nuevaContrasena: '',
      confirmarContrasena: '',
    });
    setPrevisualizacionImagen(null);
    setMensaje({ tipo: '', texto: '' });
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!usuario) {
    return null;
  }

  const imagenMostrar = previsualizacionImagen || usuario?.photoURL;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Volver
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex flex-col items-center mb-8">
            <div className="relative group mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-200 dark:border-purple-700 shadow-lg">
                {imagenMostrar ? (
                  <Image
                    src={imagenMostrar}
                    alt="Foto de perfil"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 dark:from-purple-600 dark:to-pink-600 flex items-center justify-center">
                    <User size={48} className="text-white" />
                  </div>
                )}
              </div>
              
              {editando && (
                <button
                  type="button"
                  onClick={handleImagenClick}
                  disabled={subiendoImagen}
                  className="absolute bottom-0 right-0 bg-purple-600 dark:bg-purple-700 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 dark:hover:bg-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {subiendoImagen ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Camera size={20} />
                  )}
                </button>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImagenChange}
                className="hidden"
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
              {usuario.nombre || 'Usuario'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">{usuario.email}</p>
          </div>

          {mensaje.texto && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                mensaje.tipo === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}
            >
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={handleGuardar} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User size={16} className="inline mr-2" />
                Nombre completo
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                disabled={!editando}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                placeholder="Tu nombre completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail size={16} className="inline mr-2" />
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!editando}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                placeholder="tu@email.com"
              />
            </div>

            {editando && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Lock size={16} className="inline mr-2" />
                    Nueva contraseña (opcional)
                  </label>
                  <input
                    type="password"
                    name="nuevaContrasena"
                    value={formData.nuevaContrasena}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Lock size={16} className="inline mr-2" />
                    Confirmar nueva contraseña
                  </label>
                  <input
                    type="password"
                    name="confirmarContrasena"
                    value={formData.confirmarContrasena}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    placeholder="Repite la contraseña"
                  />
                </div>
              </>
            )}

            <div className="flex gap-4 pt-4">
              {!editando ? (
                <button
                  type="button"
                  onClick={handleEditarClick}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 dark:hover:from-purple-800 dark:hover:to-pink-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Edit2 size={20} />
                  Editar Perfil
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancelar}
                    disabled={guardando}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <X size={20} />
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardando}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 dark:hover:from-green-800 dark:hover:to-emerald-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {guardando ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Check size={20} />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}