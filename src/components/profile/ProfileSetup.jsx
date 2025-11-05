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

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  const cargarDatosUsuario = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      const docRef = doc(db, 'usuarios', user.uid);
      const docSnap = await getDoc(docRef);

      let datosFirestore = {};

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

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      mostrarMensaje('error', 'Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      mostrarMensaje('error', 'La imagen no debe superar los 5MB');
      return;
    }

    try {
      setSubiendoImagen(true);

      // Crear previsualización
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrevisualizacionImagen(reader.result);
      };
      reader.readAsDataURL(file);

      // Subir imagen a Firebase Storage
      const user = auth.currentUser;
      const storageRef = ref(storage, `profile-images/${user.uid}/${Date.now()}_${file.name}`);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Actualizar Firestore
      const docRef = doc(db, 'usuarios', user.uid);
      await setDoc(docRef, {
        photoURL: downloadURL,
        fechaActualizacion: new Date().toISOString(),
      }, { merge: true });

      // Actualizar estado local
      setUsuario(prev => ({
        ...prev,
        photoURL: downloadURL,
      }));

      mostrarMensaje('success', '✓ Foto de perfil actualizada');
    } catch (error) {
      console.error('Error al subir imagen:', error);
      mostrarMensaje('error', 'Error al subir la imagen');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const user = auth.currentUser;

      // Validar contraseñas si se están cambiando
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

      // Actualizar nombre en Firebase Auth
      if (formData.nombre !== usuario.nombre) {
        await updateProfile(user, {
          displayName: formData.nombre,
        });
      }

      // Actualizar email si cambió
      if (formData.email !== usuario.email) {
        await updateEmail(user, formData.email);
      }

      // Actualizar contraseña si se proporcionó
      if (formData.nuevaContrasena) {
        await updatePassword(user, formData.nuevaContrasena);
      }

      // Actualizar datos en Firestore
      const docRef = doc(db, 'usuarios', user.uid);
      const datosActualizados = {
        nombre: formData.nombre,
        email: formData.email,
        fechaActualizacion: new Date().toISOString(),
      };

      await setDoc(docRef, datosActualizados, { merge: true });

      // Recargar datos
      await cargarDatosUsuario();
      setEditando(false);
      setFormData(prev => ({
        ...prev,
        nuevaContrasena: '',
        confirmarContrasena: '',
      }));
      setPrevisualizacionImagen(null);

      mostrarMensaje('success', '✓ Perfil actualizado correctamente');
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
      }
      
      mostrarMensaje('error', mensajeError);
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!usuario) {
    return null;
  }

  const imagenMostrar = previsualizacionImagen || usuario?.photoURL;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Volver
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex flex-col items-center mb-8">
            {/* Foto de perfil */}
            <div className="relative group mb-4">
              <div 
                onClick={handleImagenClick}
                className={`relative w-32 h-32 rounded-full overflow-hidden shadow-lg ${
                  editando ? 'cursor-pointer' : ''
                }`}
              >
                {imagenMostrar ? (
                  <Image
                    src={imagenMostrar}
                    alt="Foto de perfil"
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold">
                    {usuario?.nombre?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                
                {editando && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {subiendoImagen ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    ) : (
                      <Camera size={32} className="text-white" />
                    )}
                  </div>
                )}
              </div>

              {editando && (
                <button
                  type="button"
                  onClick={handleImagenClick}
                  disabled={subiendoImagen}
                  className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                >
                  <Upload size={18} />
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

            <h1 className="text-3xl font-bold text-gray-800 mb-2">Mi Perfil</h1>
            <p className="text-gray-500">Gestiona tu información personal</p>

            {!editando && (
              <button
                onClick={() => setEditando(true)}
                className="mt-4 flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
              >
                <Edit2 size={18} />
                Editar Perfil
              </button>
            )}
          </div>

          {mensaje.texto && (
            <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${
              mensaje.tipo === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {mensaje.tipo === 'success' ? <Check size={20} /> : <X size={20} />}
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={handleGuardar} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <User size={18} />
                Nombre completo
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                disabled={!editando}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                placeholder="Tu nombre completo"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <Mail size={18} />
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!editando}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                placeholder="tu@email.com"
                required
              />
            </div>

            {editando && (
              <>
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Lock size={20} />
                    Cambiar Contraseña (opcional)
                  </h3>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    name="nuevaContrasena"
                    value={formData.nuevaContrasena}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    Confirmar contraseña
                  </label>
                  <input
                    type="password"
                    name="confirmarContrasena"
                    value={formData.confirmarContrasena}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Repite la contraseña"
                  />
                </div>
              </>
            )}

            {editando && (
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={guardando || subiendoImagen}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  {guardando ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Guardar Cambios
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleCancelar}
                  disabled={guardando || subiendoImagen}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  <X size={18} />
                  Cancelar
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de la cuenta</h3>
          <div className="space-y-3 text-gray-600">
            <p>
              <span className="font-medium">Cuenta creada:</span>{' '}
              {new Date(usuario?.fechaCreacion).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}