// app/journal/edit/[id]/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import EmotionSelector from '@/components/journal/EmotionSelector';
import { 
  Save, 
  Calendar,
  Sparkles,
  ArrowLeft,
  Loader,
  AlertCircle
} from 'lucide-react';
import { getEntryById, updateJournalEntry } from '@/services/journalService';

function EditEntryContent() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Estados del formulario (SIN tags)
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [entryDate, setEntryDate] = useState('');
  const [originalEntry, setOriginalEntry] = useState(null);

  useEffect(() => {
    if (params.id && user?.uid) {
      loadEntry();
    }
  }, [params.id, user]);

  const loadEntry = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const entry = await getEntryById(params.id);
      
      if (entry.userId !== user.uid) {
        setError('No tienes permiso para editar esta entrada');
        setTimeout(() => router.push('/journal/entries'), 2000);
        return;
      }

      setOriginalEntry(entry);
      setTitle(entry.title || '');
      setContent(entry.content || '');
      setSelectedEmotion(entry.emotion);
      setEntryDate(new Date(entry.entryDate).toISOString().split('T')[0]);
      
      console.log('📖 Entrada cargada:', entry);
    } catch (err) {
      console.error('❌ Error al cargar entrada:', err);
      setError('Error al cargar la entrada: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmotionSelect = (emotion) => {
    setSelectedEmotion(emotion);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage('');

      if (!content.trim()) {
        setError('El contenido no puede estar vacío');
        return;
      }

      if (!selectedEmotion) {
        setError('Debes seleccionar una emoción');
        return;
      }

      const updates = {
        title: title.trim() || 'Sin título',
        content: content.trim(),
        emotion: selectedEmotion,
        entryDate: entryDate ? new Date(entryDate).toISOString() : originalEntry.entryDate
      };

      console.log('💾 Guardando entrada:', updates);

      await updateJournalEntry(params.id, updates);

      // Disparar evento
      window.dispatchEvent(new Event('journalUpdated'));

      console.log('✅ Entrada actualizada correctamente');
      setSuccessMessage('¡Entrada actualizada correctamente!');

      setTimeout(() => {
        router.push('/journal/entries');
      }, 1000);

    } catch (err) {
      console.error('❌ Error guardando:', err);
      setError('Error al guardar la entrada: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('¿Deseas descartar los cambios?')) {
      router.push('/journal/entries');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando entrada...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/journal/entries')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver a mis entradas</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Editar Entrada
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Actualiza tu entrada del diario
              </p>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Fecha de la entrada
            </label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
            />
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título (opcional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Un día especial..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>

          {/* Contenido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contenido *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe sobre tu día, tus pensamientos, tus sentimientos..."
              rows={8}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none text-gray-900 dark:text-white placeholder-gray-400"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {content.length} caracteres
            </p>
          </div>

          {/* Selector de Emoción */}
          <div>
            <EmotionSelector
              selectedEmotion={selectedEmotion}
              onEmotionSelect={handleEmotionSelect}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !content.trim() || !selectedEmotion}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditEntryPage() {
  return (
    <ProtectedRoute>
      <EditEntryContent />
    </ProtectedRoute>
  );
}
