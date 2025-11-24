// src/services/notificationService.js
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';

/**
 * Tipos de notificaciones disponibles
 */
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ACHIEVEMENT: 'achievement',
  REMINDER: 'reminder',
  INFO: 'info',
  WARNING: 'warning',
  STREAK: 'streak',
  GOAL: 'goal',
  MILESTONE: 'milestone'
};

/**
 * Crear una nueva notificación
 * @param {string} userId - ID del usuario
 * @param {object} notificationData - Datos de la notificación
 */
export const createNotification = async (userId, notificationData) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    
    const notification = {
      userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || NOTIFICATION_TYPES.INFO,
      unread: true,
      createdAt: serverTimestamp(),
      metadata: notificationData.metadata || null
    };

    const docRef = await addDoc(notificationsRef, notification);
    console.log('[SUCCESS] Notificación creada:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('[ERROR] Error al crear notificación:', error);
    throw error;
  }
};

/**
 * Marcar notificación como leída
 * @param {string} notificationId - ID de la notificación
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      unread: false,
      readAt: serverTimestamp()
    });
    console.log('[SUCCESS] Notificación marcada como leída');
  } catch (error) {
    console.error('[ERROR] Error al marcar como leída:', error);
    throw error;
  }
};

/**
 * Marcar todas las notificaciones como leídas
 * @param {string} userId - ID del usuario
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('unread', '==', true)
    );

    const snapshot = await getDocs(q);
    const updatePromises = snapshot.docs.map(doc =>
      updateDoc(doc.ref, {
        unread: false,
        readAt: serverTimestamp()
      })
    );

    await Promise.all(updatePromises);
    console.log(`[SUCCESS] ${snapshot.size} notificaciones marcadas como leídas`);
  } catch (error) {
    console.error('[ERROR] Error al marcar todas como leídas:', error);
    throw error;
  }
};

/**
 * Eliminar una notificación
 * @param {string} notificationId - ID de la notificación
 */
export const deleteNotification = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await deleteDoc(notificationRef);
    console.log('[SUCCESS] Notificación eliminada');
  } catch (error) {
    console.error('[ERROR] Error al eliminar notificación:', error);
    throw error;
  }
};

/**
 * Eliminar todas las notificaciones de un usuario
 * @param {string} userId - ID del usuario
 */
export const deleteAllNotifications = async (userId) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where('userId', '==', userId));
    
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    
    await Promise.all(deletePromises);
    console.log(`[SUCCESS] ${snapshot.size} notificaciones eliminadas`);
  } catch (error) {
    console.error('[ERROR] Error al eliminar todas las notificaciones:', error);
    throw error;
  }
};

/**
 * Obtener notificaciones no leídas
 * @param {string} userId - ID del usuario
 */
export const getUnreadNotifications = async (userId) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('unread', '==', true),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('[ERROR] Error al obtener notificaciones no leídas:', error);
    throw error;
  }
};

/**
 * Notificaciones predefinidas para eventos comunes
 */
export const NOTIFICATION_TEMPLATES = {
  // Racha de días
  STREAK_MILESTONE: (days) => ({
    title: `¡${days} días de racha! 🔥`,
    message: `Has mantenido tu racha de escritura por ${days} días consecutivos. ¡Sigue así!`,
    type: NOTIFICATION_TYPES.STREAK
  }),

  // Primera entrada
  FIRST_ENTRY: {
    title: '¡Bienvenido a tu diario! 📝',
    message: 'Has creado tu primera entrada. Este es el comienzo de un hermoso viaje de autoconocimiento.',
    type: NOTIFICATION_TYPES.SUCCESS
  },

  // Logro de entradas
  ENTRY_MILESTONE: (count) => ({
    title: `¡${count} entradas completadas! 🎉`,
    message: `Has escrito ${count} entradas en tu diario. Tu dedicación es admirable.`,
    type: NOTIFICATION_TYPES.ACHIEVEMENT
  }),

  // Recordatorio diario
  DAILY_REMINDER: {
    title: '⏰ Hora de escribir',
    message: 'No olvides escribir en tu diario hoy. Tus pensamientos son importantes.',
    type: NOTIFICATION_TYPES.REMINDER
  },

  // Meta alcanzada
  GOAL_ACHIEVED: (goalName) => ({
    title: `¡Meta alcanzada! 🎯`,
    message: `Has completado tu meta: ${goalName}`,
    type: NOTIFICATION_TYPES.GOAL
  }),

  // Análisis de emociones
  EMOTION_INSIGHT: (emotion) => ({
    title: '💡 Insight emocional',
    message: `Has registrado principalmente emociones de ${emotion} esta semana. ¿Quieres reflexionar sobre ello?`,
    type: NOTIFICATION_TYPES.INFO
  }),

  // Racha en riesgo
  STREAK_WARNING: {
    title: '⚠️ Tu racha está en riesgo',
    message: 'No has escrito hoy. ¡No pierdas tu racha de días consecutivos!',
    type: NOTIFICATION_TYPES.WARNING
  }
};

/**
 * Crear notificación de racha
 * @param {string} userId - ID del usuario
 * @param {number} days - Días de racha
 */
export const notifyStreakMilestone = async (userId, days) => {
  const notification = NOTIFICATION_TEMPLATES.STREAK_MILESTONE(days);
  return await createNotification(userId, notification);
};

/**
 * Crear notificación de primera entrada
 * @param {string} userId - ID del usuario
 */
export const notifyFirstEntry = async (userId) => {
  return await createNotification(userId, NOTIFICATION_TEMPLATES.FIRST_ENTRY);
};

/**
 * Crear notificación de milestone de entradas
 * @param {string} userId - ID del usuario
 * @param {number} count - Número de entradas
 */
export const notifyEntryMilestone = async (userId, count) => {
  const notification = NOTIFICATION_TEMPLATES.ENTRY_MILESTONE(count);
  return await createNotification(userId, notification);
};

/**
 * Crear recordatorio diario
 * @param {string} userId - ID del usuario
 */
export const notifyDailyReminder = async (userId) => {
  return await createNotification(userId, NOTIFICATION_TEMPLATES.DAILY_REMINDER);
};

/**
 * Crear notificación de meta alcanzada
 * @param {string} userId - ID del usuario
 * @param {string} goalName - Nombre de la meta
 */
export const notifyGoalAchieved = async (userId, goalName) => {
  const notification = NOTIFICATION_TEMPLATES.GOAL_ACHIEVED(goalName);
  return await createNotification(userId, notification);
};

/**
 * Crear notificación de insight emocional
 * @param {string} userId - ID del usuario
 * @param {string} emotion - Emoción predominante
 */
export const notifyEmotionInsight = async (userId, emotion) => {
  const notification = NOTIFICATION_TEMPLATES.EMOTION_INSIGHT(emotion);
  return await createNotification(userId, notification);
};

/**
 * Crear notificación de racha en riesgo
 * @param {string} userId - ID del usuario
 */
export const notifyStreakWarning = async (userId) => {
  return await createNotification(userId, NOTIFICATION_TEMPLATES.STREAK_WARNING);
};