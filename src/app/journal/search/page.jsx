// app/journal/search/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  Search, 
  Calendar,
  TrendingUp,
  X,
  ArrowLeft,
  Sparkles,
  Loader,
  Filter,
  Smile,
  Frown,
  Heart,
  Zap,
  Cloud,
  Sun,
  Moon,
  Meh,
  Eye,
  Edit,
  Trash2,
  Brain,
  Tag,
  Lightbulb,
  Target,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { getUserEntries, deleteJournalEntry } from '@/services/journalService';
import { analyzeSearchQuery, findSimilarEntries, generateSearchSuggestions } from '@/services/aiSearchService';

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

// 🆕 Modal de Vista Detallada (igual que entries/page.jsx)
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

// 🆕 Modal de Confirmación de Eliminación
function DeleteConfirmModal({ entry, onConfirm, onCancel }) {
  if (!entry) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            ¿Eliminar entrada?
          </h3>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Esta acción no se puede deshacer. Se eliminará permanentemente la entrada
          <span className="font-semibold"> "{entry.title || 'Sin título'}"</span>.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

function SearchContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiSearching, setAiSearching] = useState(false);

  // Estados de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('all');
  const [minIntensity, setMinIntensity] = useState(1);
  const [maxIntensity, setMaxIntensity] = useState(10);
  
  // Estados de UI móvil
  const [showFilters, setShowFilters] = useState(false);

  // Estados de IA
  const [searchMode, setSearchMode] = useState('basic');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [similarEntries, setSimilarEntries] = useState([]);
  const [searchInsights, setSearchInsights] = useState(null);

  // 🆕 Estados de modales
  const [viewingEntry, setViewingEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);

  // Estadísticas
  const [stats, setStats] = useState({
    totalEntries: 0,
    emotionBreakdown: {},
    averageIntensity: 0,
    dateRange: { earliest: null, latest: null }
  });

  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchMode === 'semantic' && searchTerm.trim()) {
        handleAISearch();
      } else {
        handleBasicSearch();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, startDate, endDate, selectedEmotion, minIntensity, maxIntensity, entries, searchMode]);

  const loadData = async () => {
    try {
      setLoading(true);
      const entriesData = await getUserEntries(user.uid);
      
      setEntries(entriesData);
      setSearchResults(entriesData);
      
      calculateStats(entriesData);
      
      if (entriesData.length > 0) {
        generateInitialSuggestions(entriesData);
      }
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInitialSuggestions = async (entriesData) => {
    try {
      const suggestions = await generateSearchSuggestions(entriesData);
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error generando sugerencias:', error);
    }
  };

  const calculateStats = (data) => {
    if (data.length === 0) {
      setStats({
        totalEntries: 0,
        emotionBreakdown: {},
        averageIntensity: 0,
        dateRange: { earliest: null, latest: null }
      });
      return;
    }

    const emotionBreakdown = {};
    let totalIntensity = 0;
    
    data.forEach(entry => {
      const emotion = entry.emotion.id;
      emotionBreakdown[emotion] = (emotionBreakdown[emotion] || 0) + 1;
      totalIntensity += entry.emotion.intensity || 5;
    });

    const dates = data.map(e => new Date(e.entryDate)).sort((a, b) => a - b);
    
    setStats({
      totalEntries: data.length,
      emotionBreakdown,
      averageIntensity: (totalIntensity / data.length).toFixed(1),
      dateRange: {
        earliest: dates[0],
        latest: dates[dates.length - 1]
      }
    });
  };

  const handleBasicSearch = () => {
    let results = [...entries];

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      results = results.filter(entry =>
        entry.title?.toLowerCase().includes(search) ||
        entry.content.toLowerCase().includes(search) ||
        entry.tags?.some(tag => tag.toLowerCase().includes(search))
      );
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      results = results.filter(entry => {
        const entryDate = new Date(entry.entryDate);
        return entryDate >= start && entryDate <= end;
      });
    }

    if (selectedEmotion !== 'all') {
      results = results.filter(entry => entry.emotion.id === selectedEmotion);
    }

    results = results.filter(entry => {
      const intensity = entry.emotion.intensity || 5;
      return intensity >= minIntensity && intensity <= maxIntensity;
    });

    setSearchResults(results);
    calculateStats(results);
  };

  const handleAISearch = async () => {
    if (!searchTerm.trim()) {
      handleBasicSearch();
      return;
    }

    try {
      setAiSearching(true);
      
      const analysis = await analyzeSearchQuery(searchTerm, entries);
      
      setSearchInsights(analysis.insights);
      
      let results = analysis.results;

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        results = results.filter(entry => {
          const entryDate = new Date(entry.entryDate);
          return entryDate >= start && entryDate <= end;
        });
      }

      if (selectedEmotion !== 'all') {
        results = results.filter(entry => entry.emotion.id === selectedEmotion);
      }

      results = results.filter(entry => {
        const intensity = entry.emotion.intensity || 5;
        return intensity >= minIntensity && intensity <= maxIntensity;
      });

      setSearchResults(results);
      calculateStats(results);
    } catch (error) {
      console.error('Error en búsqueda IA:', error);
      handleBasicSearch();
    } finally {
      setAiSearching(false);
    }
  };

  const handleFindSimilar = async (entry) => {
    try {
      setSelectedEntry(entry);
      setAiSearching(true);
      
      const similar = await findSimilarEntries(entry, entries);
      setSimilarEntries(similar);
      setSearchMode('similar');
      
      setShowFilters(false);
    } catch (error) {
      console.error('Error buscando similares:', error);
    } finally {
      setAiSearching(false);
    }
  };

  // 🆕 Función de eliminación
  const handleDelete = async (entryId) => {
    try {
      await deleteJournalEntry(entryId);
      setEntries(entries.filter(e => e.id !== entryId));
      setSearchResults(searchResults.filter(e => e.id !== entryId));
      setDeletingEntry(null);
      
      // Disparar evento para actualizar dashboard
      window.dispatchEvent(new Event('journalUpdated'));
      
      console.log('🗑️ Entrada eliminada');
    } catch (error) {
      console.error('❌ Error al eliminar:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setSelectedEmotion('all');
    setMinIntensity(1);
    setMaxIntensity(10);
    setSearchMode('basic');
    setSelectedEntry(null);
    setSimilarEntries([]);
    setSearchInsights(null);
    setSearchResults(entries);
    calculateStats(entries);
  };

  const hasActiveFilters = () => {
    return searchTerm || startDate || endDate || selectedEmotion !== 'all' || 
           minIntensity !== 1 || maxIntensity !== 10;
  };

  const applySuggestion = (suggestion) => {
    setSearchTerm(suggestion);
    setSearchMode('semantic');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando búsqueda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 mb-4 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Volver a Dashboard</span>
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Buscar en mi Diario
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Encuentra tus entradas con IA
                </p>
              </div>
            </div>

            {/* Selector de modo */}
            <div className="flex gap-2">
              <button
                onClick={() => setSearchMode('basic')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  searchMode === 'basic'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Search className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                Básica
              </button>
              <button
                onClick={() => setSearchMode('semantic')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  searchMode === 'semantic'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Brain className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                IA
              </button>
            </div>
          </div>
        </div>

        {/* Botón de filtros móvil */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
          >
            <span className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
              <Filter className="w-5 h-5" />
              Filtros
              {hasActiveFilters() && (
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs">
                  Activos
                </span>
              )}
            </span>
            {showFilters ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Panel de Filtros */}
          <div className={`lg:col-span-1 space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            {/* Búsqueda por texto */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
                <Search className="w-4 h-4" />
                Buscar en Entradas
                {searchMode === 'semantic' && (
                  <span className="ml-auto">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                  </span>
                )}
              </h3>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    searchMode === 'semantic' 
                      ? "Ej: días felices con mi familia" 
                      : "Palabras clave..."
                  }
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm text-gray-900 dark:text-white placeholder-gray-400"
                />
                {aiSearching && (
                  <Loader className="absolute right-3 top-2.5 w-4 h-4 text-purple-500 animate-spin" />
                )}
              </div>
            </div>

            {/* Insights de búsqueda */}
            {searchInsights && (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl shadow-md p-4 border border-purple-200 dark:border-purple-800">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-purple-900 dark:text-purple-300 mb-3">
                  <Brain className="w-4 h-4" />
                  Análisis IA
                </h3>
                <div className="space-y-2 text-xs text-purple-700 dark:text-purple-300">
                  <p><strong>Intención:</strong> {searchInsights.intent}</p>
                  {searchInsights.suggestedEmotions && searchInsights.suggestedEmotions.length > 0 && (
                    <p><strong>Emociones:</strong> {searchInsights.suggestedEmotions.join(', ')}</p>
                  )}
                  {searchInsights.keywords && searchInsights.keywords.length > 0 && (
                    <p><strong>Palabras clave:</strong> {searchInsights.keywords.join(', ')}</p>
                  )}
                </div>
              </div>
            )}

            {/* Rango de fechas */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
                <Calendar className="w-4 h-4" />
                Rango de Fechas
              </h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Filtro por emoción */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
                <Heart className="w-4 h-4" />
                Emoción
              </h3>
              <select
                value={selectedEmotion}
                onChange={(e) => setSelectedEmotion(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm text-gray-900 dark:text-white"
              >
                <option value="all">Todas</option>
                <option value="feliz">😊 Feliz</option>
                <option value="triste">😢 Triste</option>
                <option value="enojado">😠 Enojado</option>
                <option value="ansioso">😰 Ansioso</option>
                <option value="tranquilo">😌 Tranquilo</option>
                <option value="emocionado">🤩 Emocionado</option>
                <option value="cansado">😴 Cansado</option>
                <option value="neutral">😐 Neutral</option>
              </select>
            </div>

            {/* Botón de limpiar filtros */}
            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-sm font-medium"
              >
                <X className="w-4 h-4" />
                Limpiar Filtros
              </button>
            )}

            {/* Estadísticas */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl shadow-md p-4 border border-blue-200 dark:border-blue-800">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">
                <TrendingUp className="w-4 h-4" />
                Estadísticas
              </h3>
              <div className="space-y-2 text-xs text-blue-700 dark:text-blue-300">
                <div className="flex justify-between">
                  <span>Resultados:</span>
                  <span className="font-bold">{searchResults.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-bold">{stats.totalEntries}</span>
                </div>
                {stats.averageIntensity > 0 && (
                  <div className="flex justify-between">
                    <span>Intensidad:</span>
                    <span className="font-bold">{stats.averageIntensity}/10</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="lg:col-span-3">
            {searchMode === 'similar' && selectedEntry ? (
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      <span className="hidden sm:inline">Entradas similares a:</span>
                      <span className="sm:hidden">Similares:</span>
                    </h2>
                    <button
                      onClick={() => {
                        setSearchMode('basic');
                        setSelectedEntry(null);
                        setSimilarEntries([]);
                      }}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2 text-sm sm:text-base">
                      {selectedEntry.title || 'Sin título'}
                    </h3>
                    <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-400 line-clamp-2">
                      {selectedEntry.content}
                    </p>
                  </div>
                </div>

                {similarEntries.length > 0 ? (
                  <div className="space-y-4">
                    {similarEntries.map((entry) => (
                      <EntryCard 
                        key={entry.id} 
                        entry={entry}
                        onView={setViewingEntry}
                        onEdit={(entry) => router.push(`/journal/edit/${entry.id}`)}
                        onDelete={setDeletingEntry}
                        onFindSimilar={handleFindSimilar}
                        showSimilarity={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 sm:p-12 text-center border border-gray-200 dark:border-gray-700">
                    <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      No se encontraron entradas similares
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {searchResults.length > 0 ? (
                  <div className="space-y-4">
                    {searchResults.map((entry) => (
                      <EntryCard 
                        key={entry.id} 
                        entry={entry}
                        onView={setViewingEntry}
                        onEdit={(entry) => router.push(`/journal/edit/${entry.id}`)}
                        onDelete={setDeletingEntry}
                        onFindSimilar={handleFindSimilar}
                        highlightTerm={searchTerm}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 sm:p-12 text-center border border-gray-200 dark:border-gray-700">
                    <Search className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No se encontraron entradas
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                      {hasActiveFilters() 
                        ? 'Intenta ajustar los filtros o usar la búsqueda con IA'
                        : 'Comienza a buscar en tus entradas del diario'}
                    </p>
                    {hasActiveFilters() && (
                      <button
                        onClick={clearFilters}
                        className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm sm:text-base"
                      >
                        <X className="w-4 h-4" />
                        Limpiar Filtros
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      {viewingEntry && (
        <ViewEntryModal 
          entry={viewingEntry} 
          onClose={() => setViewingEntry(null)} 
        />
      )}

      {deletingEntry && (
        <DeleteConfirmModal
          entry={deletingEntry}
          onConfirm={() => handleDelete(deletingEntry.id)}
          onCancel={() => setDeletingEntry(null)}
        />
      )}
    </div>
  );
}

// 🆕 Componente de tarjeta con botones idénticos a entries/page.jsx
function EntryCard({ entry, onView, onEdit, onDelete, onFindSimilar, highlightTerm, showSimilarity }) {
  const EmotionIcon = emotionIcons[entry.emotion.id] || Meh;
  const emotionColor = emotionColors[entry.emotion.id] || emotionColors.neutral;

  const highlightText = (text) => {
    if (!highlightTerm || !text) return text;
    
    const parts = text.split(new RegExp(`(${highlightTerm})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === highlightTerm.toLowerCase() 
        ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/50">{part}</mark>
        : part
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden group">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className={`p-1.5 sm:p-2 rounded-lg ${emotionColor} flex-shrink-0`}>
                <EmotionIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {highlightText(entry.title || 'Sin título')}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{new Date(entry.entryDate).toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</span>
                  {showSimilarity && entry.similarity && (
                    <span className="ml-2 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full whitespace-nowrap">
                      {Math.round(entry.similarity * 100)}% similar
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Intensidad */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Intensidad</span>
            <div className="flex gap-0.5 sm:gap-1">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 sm:w-1.5 h-3 sm:h-4 rounded-full ${
                    i < (entry.emotion.intensity || 5)
                      ? 'bg-purple-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Contenido */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 sm:line-clamp-3">
          {highlightText(entry.content)}
        </p>

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {entry.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs flex items-center gap-1"
              >
                <Tag className="w-3 h-3" />
                {highlightText(tag)}
              </span>
            ))}
            {entry.tags.length > 3 && (
              <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">
                +{entry.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* 🆕 Acciones - IDÉNTICAS a entries/page.jsx */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => onView(entry)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Ver</span>
          </button>
          <button
            onClick={() => onEdit(entry)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Editar</span>
          </button>
          <button
            onClick={() => onDelete(entry)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Eliminar</span>
          </button>
          {onFindSimilar && (
            <button
              onClick={() => onFindSimilar(entry)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 transition-colors text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Similares</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <ProtectedRoute>
      <SearchContent />
    </ProtectedRoute>
  );
}