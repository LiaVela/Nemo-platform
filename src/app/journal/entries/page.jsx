// app/journal/entries/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Smile,
  Frown,
  Heart,
  Zap,
  Cloud,
  Sun,
  Moon,
  Meh,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  X,
  Loader,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { getUserEntries, deleteJournalEntry } from '@/services/journalService';

const emotionIcons = {
  feliz: Smile,
  triste: Frown,
  enojado: Zap,
  ansioso: Cloud,
  tranquilo: Heart,
  emocionado: Sun,
  cansado: Moon,
  neutral: Meh
};

const emotionColors = {
  feliz: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  triste: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  enojado: 'text-red-500 bg-red-50 dark:bg-red-900/20',
  ansioso: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
  tranquilo: 'text-green-500 bg-green-50 dark:bg-green-900/20',
  emocionado: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  cansado: 'text-gray-500 bg-gray-50 dark:bg-gray-900/20',
  neutral: 'text-slate-500 bg-slate-50 dark:bg-slate-900/20'
};

// Modal de Vista Detallada (SIN Tags)
function ViewEntryModal({ entry, onClose }) {
  if (!entry) return null;

  const EmotionIcon = emotionIcons[entry.emotion.id] || Smile;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {entry.title || 'Sin título'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Fecha */}
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="w-5 h-5" />
            <span className="text-sm">
              {new Date(entry.entryDate).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          {/* Emoción */}
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${emotionColors[entry.emotion.id]}`}>
              <EmotionIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Emoción</p>
              <p className="font-semibold text-gray-900 dark:text-white capitalize">
                {entry.emotion.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Intensidad: {entry.emotion.intensity}/10
              </p>
            </div>
          </div>

          {/* Contenido */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contenido
            </h3>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {entry.content}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                Creada: {new Date(entry.createdAt).toLocaleDateString('es-ES')}
              </span>
              {entry.updatedAt && entry.updatedAt !== entry.createdAt && (
                <span>
                  Editada: {new Date(entry.updatedAt).toLocaleDateString('es-ES')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente Principal
function EntriesContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados de modales
  const [viewingEntry, setViewingEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);

  useEffect(() => {
    if (user?.uid) {
      loadEntries();
    }
  }, [user]);

  useEffect(() => {
    filterEntries();
  }, [entries, searchTerm, selectedEmotion]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserEntries(user.uid);
      setEntries(data);
      console.log('📚 Entradas cargadas:', data.length);
    } catch (err) {
      console.error('❌ Error al cargar entradas:', err);
      setError('Error al cargar las entradas');
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = [...entries];

    // Filtrar por búsqueda de texto
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(search) ||
        entry.content.toLowerCase().includes(search)
      );
    }

    // Filtrar por emoción
    if (selectedEmotion !== 'all') {
      filtered = filtered.filter(entry => entry.emotion.id === selectedEmotion);
    }

    setFilteredEntries(filtered);
  };

  const handleDelete = async (entryId) => {
    try {
      await deleteJournalEntry(entryId);
      setEntries(entries.filter(e => e.id !== entryId));
      setDeletingEntry(null);
      // 🆕 Disparar evento
      window.dispatchEvent(new Event('journalUpdated'));
      console.log('🗑️ Entrada eliminada');
    } catch (err) {
      console.error('❌ Error al eliminar:', err);
      setError('Error al eliminar la entrada');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando entradas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al Dashboard</span>
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Mis Entradas
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {entries.length} {entries.length === 1 ? 'entrada' : 'entradas'}
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push('/journal/new')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              <Plus className="w-5 h-5" />
              Nueva Entrada
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Búsqueda y Filtros */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-3">
            {/* Barra de búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar en tus entradas..."
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
              />
            </div>

            {/* Botón de filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                showFilters
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filtros
            </button>
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                Filtrar por emoción
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedEmotion('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedEmotion === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Todas
                </button>
                {Object.entries(emotionIcons).map(([key, Icon]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedEmotion(key)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      selectedEmotion === key
                        ? emotionColors[key]
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="capitalize">{key}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Lista de entradas */}
        {filteredEntries.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm || selectedEmotion !== 'all'
                ? 'No se encontraron entradas'
                : 'Aún no tienes entradas'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || selectedEmotion !== 'all'
                ? 'Intenta con otros filtros'
                : 'Comienza escribiendo tu primera entrada del diario'}
            </p>
            {!searchTerm && selectedEmotion === 'all' && (
              <button
                onClick={() => router.push('/journal/new')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all"
              >
                <Plus className="w-5 h-5" />
                Crear Primera Entrada
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredEntries.map((entry) => {
              const EmotionIcon = emotionIcons[entry.emotion.id] || Smile;
              
              return (
                <div
                  key={entry.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all p-4 sm:p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Contenido principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${emotionColors[entry.emotion.id]}`}>
                          <EmotionIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {entry.title || 'Sin título'}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(entry.entryDate).toLocaleDateString('es-ES')}
                            </span>
                            <span className="capitalize">
                              {entry.emotion.name}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                        {entry.content}
                      </p>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center justify-end gap-2 w-full sm:w-auto border-t border-gray-100 dark:border-gray-700 sm:border-0 pt-3 sm:pt-0">
                      <button
                        onClick={() => setViewingEntry(entry)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => router.push(`/journal/edit/${entry.id}`)}
                        className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </button>
                      <button
                        onClick={() => setDeletingEntry(entry)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de vista detallada */}
      {viewingEntry && (
        <ViewEntryModal
          entry={viewingEntry}
          onClose={() => setViewingEntry(null)}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {deletingEntry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              ¿Eliminar entrada?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Esta acción no se puede deshacer. La entrada será eliminada permanentemente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingEntry(null)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deletingEntry.id)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EntriesPage() {
  return (
    <ProtectedRoute>
      <EntriesContent />
    </ProtectedRoute>
  );
}
