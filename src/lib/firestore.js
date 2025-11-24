import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';

// ===== ENTRIES (Entradas del diario) =====

export const createEntry = async (entryData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const docRef = await addDoc(collection(db, 'entries'), {
      userId: user.uid,
      content: entryData.content,
      title: entryData.title || '',
      emotion: entryData.emotion || null,
      moodScore: entryData.moodScore || null,
      tags: entryData.tags || [],
      isPrivate: entryData.isPrivate !== false,
      aiAnalysis: null, // Se llenará después con Cloud Function
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { id: docRef.id, ...entryData };
  } catch (error) {
    console.error('Error al crear entrada:', error);
    throw error;
  }
};

export const getUserEntries = async (userId, limitCount = 50) => {
  try {
    const q = query(
      collection(db, 'entries'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));
  } catch (error) {
    console.error('Error al obtener entradas:', error);
    throw error;
  }
};

export const getEntryById = async (entryId) => {
  try {
    const docRef = doc(db, 'entries', entryId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Entrada no encontrada');
    }

    const data = docSnap.data();
    
    // Verificar ownership
    if (data.userId !== auth.currentUser?.uid) {
      throw new Error('No tienes permiso para ver esta entrada');
    }

    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    };
  } catch (error) {
    console.error('Error al obtener entrada:', error);
    throw error;
  }
};

export const updateEntry = async (entryId, updates) => {
  try {
    const docRef = doc(db, 'entries', entryId);
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return { id: entryId, ...updates };
  } catch (error) {
    console.error('Error al actualizar entrada:', error);
    throw error;
  }
};

export const deleteEntry = async (entryId) => {
  try {
    const docRef = doc(db, 'entries', entryId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error al eliminar entrada:', error);
    throw error;
  }
};

// ===== EMOTIONS =====

export const logEmotion = async (emotionData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const docRef = await addDoc(collection(db, 'emotions'), {
      userId: user.uid,
      emotion: emotionData.emotion,
      intensity: emotionData.intensity || 5,
      trigger: emotionData.trigger || '',
      notes: emotionData.notes || '',
      timestamp: serverTimestamp()
    });

    return { id: docRef.id, ...emotionData };
  } catch (error) {
    console.error('Error al registrar emoción:', error);
    throw error;
  }
};

// ===== GOALS =====

export const createGoal = async (goalData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const docRef = await addDoc(collection(db, 'goals'), {
      userId: user.uid,
      title: goalData.title,
      description: goalData.description || '',
      category: goalData.category || 'other',
      status: 'active',
      progress: 0,
      milestones: goalData.milestones || [],
      targetDate: goalData.targetDate ? Timestamp.fromDate(new Date(goalData.targetDate)) : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { id: docRef.id, ...goalData };
  } catch (error) {
    console.error('Error al crear meta:', error);
    throw error;
  }
};

export const getUserGoals = async (userId) => {
  try {
    const q = query(
      collection(db, 'goals'),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      targetDate: doc.data().targetDate?.toDate()
    }));
  } catch (error) {
    console.error('Error al obtener metas:', error);
    throw error;
  }
};

// ===== NOTIFICATIONS =====

export const getUserNotifications = async (userId, unreadOnly = false) => {
  try {
    let q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    if (unreadOnly) {
      q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      readAt: doc.data().readAt?.toDate()
    }));
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const docRef = doc(db, 'notifications', notificationId);
    await updateDoc(docRef, {
      read: true,
      readAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    throw error;
  }
};

// ===== USER STATS =====

export const getUserStats = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return {
        totalEntries: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalWords: 0
      };
    }

    return userDoc.data().stats || {
      totalEntries: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalWords: 0
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};