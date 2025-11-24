// src/services/journalService.js
import { 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc, 
  getDoc,
  getDocs,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { analyzeJournalEntry } from './aiService'; // Asegúrate de haber agregado el alias en aiService.js
import { notifyFirstEntry, notifyEntryMilestone } from './notificationService';

const COLLECTION_NAME = 'journal_entries';

/**
 * Crear una nueva entrada del diario (CON análisis IA automático y notificaciones)
 */
export async function createJournalEntry(entryData) {
  try {
    if (!entryData) {
      throw new Error('Los datos de la entrada son requeridos');
    }

    if (!entryData.userId) {
      throw new Error('El userId es requerido');
    }

    if (!entryData.content || !entryData.content.trim()) {
      throw new Error('El contenido es requerido');
    }

    if (!entryData.emotion) {
      throw new Error('La emoción es requerida');
    }

    // Preparar el documento
    const newEntry = {
      userId: entryData.userId,
      title: entryData.title?.trim() || 'Sin título',
      content: entryData.content.trim(),
      emotion: {
        id: entryData.emotion.id,
        name: entryData.emotion.name,
        intensity: entryData.emotion.intensity || 5
      },
      entryDate: entryData.entryDate || new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // 1. Crear la entrada primero
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newEntry);
    console.log('[SUCCESS] Entrada creada con ID:', docRef.id);

    // 2. Analizar con IA en segundo plano (no bloquea la creación)
    analyzeAndSave(docRef.id, {
      ...newEntry,
      id: docRef.id
    });

    // 3. Verificar y enviar notificaciones (Hitos y Primera entrada)
    checkAndSendNotifications(entryData.userId);

    return docRef.id;
  } catch (error) {
    console.error('[ERROR] Error al crear entrada:', error);
    throw error;
  }
}

/**
 * Función auxiliar para verificar hitos y enviar notificaciones
 */
async function checkAndSendNotifications(userId) {
  try {
    // Obtenemos el conteo total de entradas
    const entries = await getUserEntries(userId);
    const count = entries.length;

    // Notificación de Primera Entrada
    if (count === 1) {
      await notifyFirstEntry(userId);
      console.log('[NOTIFICATION] Notificación de primera entrada enviada');
    }
    
    // Notificación de Hitos (5, 10, 50, 100 entradas)
    else if ([5, 10, 50, 100].includes(count)) {
      await notifyEntryMilestone(userId, count);
      console.log(`[NOTIFICATION] Notificación de hito (${count} entradas) enviada`);
    }

  } catch (error) {
    console.warn('[WARNING] Error al verificar notificaciones:', error);
    // No lanzamos error para no interrumpir el flujo principal
  }
}

/**
 * Analizar entrada con IA y guardar resultado (función auxiliar)
 */
async function analyzeAndSave(entryId, entryData) {
  try {
    console.log('[AI] Iniciando análisis IA...');
    const analysis = await analyzeJournalEntry(entryData);
    
    // Guardar análisis en la entrada
    const entryRef = doc(db, COLLECTION_NAME, entryId);
    await updateDoc(entryRef, {
      aiAnalysis: analysis,
      analyzedAt: serverTimestamp()
    });
    
    console.log('[SUCCESS] Análisis IA guardado');
  } catch (error) {
    console.error('[WARNING] Error en análisis IA (no crítico):', error);
    // No lanzar error, el análisis es opcional
  }
}

/**
 * Actualizar una entrada existente (CON re-análisis IA)
 */
export async function updateJournalEntry(entryId, updates) {
  try {
    if (!entryId) {
      throw new Error('El ID de la entrada es requerido');
    }

    const entryRef = doc(db, COLLECTION_NAME, entryId);
    const entrySnap = await getDoc(entryRef);

    if (!entrySnap.exists()) {
      throw new Error('La entrada no existe');
    }

    const dataToUpdate = {
      updatedAt: serverTimestamp()
    };

    if (updates.title !== undefined) {
      dataToUpdate.title = updates.title.trim() || 'Sin título';
    }

    if (updates.content !== undefined) {
      if (!updates.content.trim()) {
        throw new Error('El contenido no puede estar vacío');
      }
      dataToUpdate.content = updates.content.trim();
    }

    if (updates.emotion) {
      dataToUpdate.emotion = {
        id: updates.emotion.id,
        name: updates.emotion.name,
        intensity: updates.emotion.intensity || 5
      };
    }

    if (updates.entryDate) {
      dataToUpdate.entryDate = updates.entryDate;
    }

    await updateDoc(entryRef, dataToUpdate);
    console.log('[SUCCESS] Entrada actualizada:', entryId);

    // Re-analizar con IA si el contenido cambió
    if (updates.content || updates.emotion) {
      const updatedEntry = await getEntryById(entryId);
      analyzeAndSave(entryId, updatedEntry);
    }

    return { success: true, id: entryId };
  } catch (error) {
    console.error('[ERROR] Error al actualizar entrada:', error);
    throw error;
  }
}

/**
 * Obtener una entrada por ID
 */
export async function getEntryById(entryId) {
  try {
    if (!entryId) {
      throw new Error('El ID de la entrada es requerido');
    }

    const entryRef = doc(db, COLLECTION_NAME, entryId);
    const entrySnap = await getDoc(entryRef);

    if (!entrySnap.exists()) {
      throw new Error('La entrada no existe');
    }

    const data = entrySnap.data();
    
    return {
      id: entrySnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date()
    };
  } catch (error) {
    console.error('[ERROR] Error al obtener entrada:', error);
    throw error;
  }
}

/**
 * Obtener todas las entradas de un usuario
 */
export async function getUserEntries(userId) {
  try {
    if (!userId) {
      throw new Error('El userId es requerido');
    }

    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('entryDate', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const entries = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date()
      });
    });

    console.log(`[INFO] ${entries.length} entradas encontradas`);
    return entries;
  } catch (error) {
    console.error('[ERROR] Error al obtener entradas:', error);
    throw error;
  }
}

/**
 * Eliminar una entrada
 */
export async function deleteJournalEntry(entryId) {
  try {
    if (!entryId) {
      throw new Error('El ID de la entrada es requerido');
    }

    const entryRef = doc(db, COLLECTION_NAME, entryId);
    await deleteDoc(entryRef);
    
    console.log('[SUCCESS] Entrada eliminada:', entryId);
    return { success: true };
  } catch (error) {
    console.error('[ERROR] Error al eliminar entrada:', error);
    throw error;
  }
}

/**
 * Buscar entradas por texto (búsqueda básica)
 */
export async function searchEntriesByText(userId, searchText) {
  try {
    if (!userId || !searchText) {
      return [];
    }

    const entries = await getUserEntries(userId);
    
    const searchLower = searchText.toLowerCase();
    return entries.filter(entry => 
      entry.title.toLowerCase().includes(searchLower) ||
      entry.content.toLowerCase().includes(searchLower) ||
      entry.aiAnalysis?.keywords?.some(k => k.toLowerCase().includes(searchLower)) ||
      entry.aiAnalysis?.themes?.some(t => t.toLowerCase().includes(searchLower))
    );
  } catch (error) {
    console.error('[ERROR] Error al buscar entradas:', error);
    throw error;
  }
}

/**
 * Obtener estadísticas de emociones del usuario
 */
export async function getEmotionStats(userId) {
  try {
    const entries = await getUserEntries(userId);
    
    if (entries.length === 0) {
      return {};
    }

    const stats = {};
    entries.forEach(entry => {
      const emotion = entry.emotion.id;
      if (!stats[emotion]) {
        stats[emotion] = {
          count: 0,
          totalIntensity: 0,
          name: entry.emotion.name
        };
      }
      stats[emotion].count++;
      stats[emotion].totalIntensity += entry.emotion.intensity;
    });

    // Calcular promedios
    Object.keys(stats).forEach(emotion => {
      stats[emotion].avgIntensity = (stats[emotion].totalIntensity / stats[emotion].count).toFixed(1);
    });

    return stats;
  } catch (error) {
    console.error('[ERROR] Error al obtener estadísticas:', error);
    return {};
  }
}