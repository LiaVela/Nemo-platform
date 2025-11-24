// src/components/settings/DeleteAccountModal.jsx
'use client';

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { deleteUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export function DeleteAccountModal({ isOpen, onClose }) {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmText !== 'ELIMINAR') {
      setError('Debes escribir "ELIMINAR" para confirmar');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No hay usuario autenticado');

      // 1. Eliminar todas las entradas del usuario
      const entriesRef = collection(db, 'entries');
      const q = query(entriesRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // 2. Eliminar el usuario de Firebase Auth
      await deleteUser(user);

      // 3. Limpiar localStorage
      localStorage.clear();

      // 4. Redirigir al login
      router.push('/login');
    } catch (err) {
      console.error('Error al eliminar cuenta:', err);
      
      if (err.code === 'auth/requires-recent-login') {
        setError('Por seguridad, debes iniciar sesión nuevamente antes de eliminar tu cuenta');
      } else {
        setError('Error al eliminar la cuenta. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Eliminar Cuenta
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Esta acción es <strong>permanente e irreversible</strong>. Se eliminarán:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <li>Todas tus entradas del diario</li>
            <li>Tu perfil y configuración</li>
            <li>Tus estadísticas y datos</li>
            <li>Tu cuenta de usuario</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Para confirmar, escribe <strong className="text-red-600">ELIMINAR</strong> en el campo:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            placeholder="Escribe ELIMINAR"
            className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-red-500 dark:bg-gray-700 dark:text-white"
          />
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={loading || confirmText !== 'ELIMINAR'}
            className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Eliminando...' : 'Eliminar Cuenta'}
          </button>
        </div>
      </div>
    </div>
  );
}