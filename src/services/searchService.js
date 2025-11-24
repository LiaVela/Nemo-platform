// src/services/searchService.js
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy 
} from 'firebase/firestore';

/**
 * Buscar en las entradas del usuario
 * @param {string} userId - ID del usuario
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Promise<Array>} - Array de entradas que coinciden
 */
export const searchUserEntries = async (userId, searchTerm) => {
  if (!userId || !searchTerm || searchTerm.trim().length < 2) {
    return [];
  }

  try {
    const entriesRef = collection(db, 'journal_entries');
    const q = query(
      entriesRef,
      where('userId', '==', userId),
      orderBy('entryDate', 'desc')
    );

    const snapshot = await getDocs(q);
    const allEntries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      entryDate: doc.data().entryDate?.toDate?.() || new Date(doc.data().entryDate)
    }));

    // Filtrar por término de búsqueda (case-insensitive)
    const searchLower = searchTerm.toLowerCase();
    const filteredEntries = allEntries.filter(entry => {
      const contentMatch = entry.content?.toLowerCase().includes(searchLower);
      const titleMatch = entry.title?.toLowerCase().includes(searchLower);
      const emotionMatch = entry.emotion?.name?.toLowerCase().includes(searchLower);
      const tagsMatch = entry.tags?.some(tag => 
        tag.toLowerCase().includes(searchLower)
      );

      return contentMatch || titleMatch || emotionMatch || tagsMatch;
    });

    return filteredEntries;
  } catch (error) {
    console.error('❌ Error en búsqueda:', error);
    throw error;
  }
};

/**
 * Obtener sugerencias de búsqueda basadas en entradas recientes
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} - Objeto con sugerencias
 */
export const getSearchSuggestions = async (userId) => {
  try {
    const entriesRef = collection(db, 'journal_entries');
    const q = query(
      entriesRef,
      where('userId', '==', userId),
      orderBy('entryDate', 'desc')
    );

    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map(doc => doc.data());

    // Extraer emociones únicas
    const emotions = [...new Set(entries.map(e => e.emotion?.name).filter(Boolean))];
    
    // Extraer tags únicos
    const tags = [...new Set(entries.flatMap(e => e.tags || []))];

    // Palabras frecuentes en títulos
    const titles = entries
      .map(e => e.title)
      .filter(Boolean)
      .slice(0, 5);

    return {
      emotions: emotions.slice(0, 5),
      tags: tags.slice(0, 5),
      recentTitles: titles
    };
  } catch (error) {
    console.error('❌ Error obteniendo sugerencias:', error);
    return { emotions: [], tags: [], recentTitles: [] };
  }
};

/**
 * Resaltar texto que coincide con la búsqueda
 * @param {string} text - Texto original
 * @param {string} highlight - Término a resaltar
 * @returns {string} - Texto con marcas HTML
 */
export const highlightSearchTerm = (text, highlight) => {
  if (!highlight.trim() || !text) return text;
  
  const regex = new RegExp(`(${highlight})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-900/50">$1</mark>');
};

/**
 * Buscar con filtros adicionales
 * @param {string} userId - ID del usuario
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Array>} - Array de entradas filtradas
 */
export const searchWithFilters = async (userId, filters) => {
  const {
    searchTerm = '',
    emotion = null,
    dateFrom = null,
    dateTo = null,
    tags = []
  } = filters;

  try {
    const entriesRef = collection(db, 'journal_entries');
    const q = query(
      entriesRef,
      where('userId', '==', userId),
      orderBy('entryDate', 'desc')
    );

    const snapshot = await getDocs(q);
    let entries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      entryDate: doc.data().entryDate?.toDate?.() || new Date(doc.data().entryDate)
    }));

    // Filtrar por término de búsqueda
    if (searchTerm && searchTerm.trim().length >= 2) {
      const searchLower = searchTerm.toLowerCase();
      entries = entries.filter(entry => {
        const contentMatch = entry.content?.toLowerCase().includes(searchLower);
        const titleMatch = entry.title?.toLowerCase().includes(searchLower);
        return contentMatch || titleMatch;
      });
    }

    // Filtrar por emoción
    if (emotion) {
      entries = entries.filter(entry => entry.emotion?.name === emotion);
    }

    // Filtrar por rango de fechas
    if (dateFrom) {
      entries = entries.filter(entry => entry.entryDate >= new Date(dateFrom));
    }
    if (dateTo) {
      entries = entries.filter(entry => entry.entryDate <= new Date(dateTo));
    }

    // Filtrar por tags
    if (tags && tags.length > 0) {
      entries = entries.filter(entry => 
        entry.tags?.some(tag => tags.includes(tag))
      );
    }

    return entries;
  } catch (error) {
    console.error('❌ Error en búsqueda con filtros:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de búsqueda
 * @param {Array} results - Resultados de búsqueda
 * @returns {Object} - Estadísticas
 */
export const getSearchStats = (results) => {
  if (!results || results.length === 0) {
    return {
      total: 0,
      emotions: {},
      tags: [],
      dateRange: null
    };
  }

  // Contar emociones
  const emotionCounts = {};
  results.forEach(entry => {
    const emotion = entry.emotion?.name;
    if (emotion) {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    }
  });

  // Extraer todos los tags
  const allTags = results.flatMap(entry => entry.tags || []);
  const uniqueTags = [...new Set(allTags)];

  // Rango de fechas
  const dates = results.map(entry => entry.entryDate).sort((a, b) => a - b);
  const dateRange = dates.length > 0 ? {
    from: dates[0],
    to: dates[dates.length - 1]
  } : null;

  return {
    total: results.length,
    emotions: emotionCounts,
    tags: uniqueTags,
    dateRange
  };
};