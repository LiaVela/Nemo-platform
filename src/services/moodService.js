// src/services/moodService.js
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

// 8 Emociones con colores vibrantes
export const MOOD_LEVELS = {
  HAPPY: { 
    id: 'happy',
    label: 'Feliz', 
    color: 'bg-yellow-400',
    darkColor: 'dark:bg-yellow-500',
    gradient: 'from-yellow-400 to-orange-400',
    icon: '😊',
    textColor: 'text-yellow-600 dark:text-yellow-400'
  },
  SAD: { 
    id: 'sad',
    label: 'Triste', 
    color: 'bg-blue-500',
    darkColor: 'dark:bg-blue-600',
    gradient: 'from-blue-500 to-blue-600',
    icon: '😢',
    textColor: 'text-blue-600 dark:text-blue-400'
  },
  ANGRY: { 
    id: 'angry',
    label: 'Enojado', 
    color: 'bg-red-500',
    darkColor: 'dark:bg-red-600',
    gradient: 'from-red-500 to-red-600',
    icon: '😠',
    textColor: 'text-red-600 dark:text-red-400'
  },
  ANXIOUS: { 
    id: 'anxious',
    label: 'Ansioso', 
    color: 'bg-purple-500',
    darkColor: 'dark:bg-purple-600',
    gradient: 'from-purple-500 to-purple-600',
    icon: '😰',
    textColor: 'text-purple-600 dark:text-purple-400'
  },
  CALM: { 
    id: 'calm',
    label: 'Tranquilo', 
    color: 'bg-green-400',
    darkColor: 'dark:bg-green-500',
    gradient: 'from-green-400 to-teal-400',
    icon: '😌',
    textColor: 'text-green-600 dark:text-green-400'
  },
  EXCITED: { 
    id: 'excited',
    label: 'Emocionado', 
    color: 'bg-orange-500',
    darkColor: 'dark:bg-orange-600',
    gradient: 'from-orange-500 to-yellow-500',
    icon: '🤩',
    textColor: 'text-orange-600 dark:text-orange-400'
  },
  TIRED: { 
    id: 'tired',
    label: 'Cansado', 
    color: 'bg-gray-500',
    darkColor: 'dark:bg-gray-600',
    gradient: 'from-gray-500 to-gray-600',
    icon: '😴',
    textColor: 'text-gray-600 dark:text-gray-400'
  },
  NEUTRAL: { 
    id: 'neutral',
    label: 'Neutral', 
    color: 'bg-slate-400',
    darkColor: 'dark:bg-slate-500',
    gradient: 'from-slate-400 to-slate-500',
    icon: '😐',
    textColor: 'text-slate-600 dark:text-slate-400'
  }
};

/**
 * Guardar estado de ánimo del día
 */
export const saveDailyMood = async (userId, date, moodId, note = '') => {
  try {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const moodRef = doc(db, 'users', userId, 'moods', dateStr);

    const moodData = {
      date: dateStr,
      timestamp: date.toISOString(),
      moodId,
      note,
      updatedAt: new Date().toISOString()
    };

    await setDoc(moodRef, moodData, { merge: true });

    console.log('✅ Mood guardado:', moodData);
    return { success: true, data: moodData };
  } catch (error) {
    console.error('❌ Error guardando mood:', error);
    throw error;
  }
};

/**
 * Obtener mood de un día específico
 */
export const getMoodByDate = async (userId, date) => {
  try {
    const dateStr = date.toISOString().split('T')[0];
    const moodRef = doc(db, 'users', userId, 'moods', dateStr);
    const moodSnap = await getDoc(moodRef);

    if (moodSnap.exists()) {
      return moodSnap.data();
    }
    return null;
  } catch (error) {
    console.error('❌ Error obteniendo mood:', error);
    return null;
  }
};

/**
 * Obtener moods de un mes completo
 */
export const getMonthMoods = async (userId, year, month) => {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const moodsRef = collection(db, 'users', userId, 'moods');
    const q = query(
      moodsRef,
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc')
    );

    const snapshot = await getDocs(q);
    const moods = {};

    snapshot.forEach((doc) => {
      moods[doc.id] = doc.data();
    });

    console.log(`📅 Moods del mes ${month}/${year}:`, Object.keys(moods).length);
    return moods;
  } catch (error) {
    console.error('❌ Error obteniendo moods del mes:', error);
    return {};
  }
};

/**
 * Obtener estadísticas del mes
 */
export const getMonthStats = (moods) => {
  const moodCounts = {};
  
  Object.values(moods).forEach(mood => {
    const moodId = mood.moodId;
    moodCounts[moodId] = (moodCounts[moodId] || 0) + 1;
  });

  const total = Object.values(moods).length;
  
  // Encontrar el mood más frecuente
  let mostFrequent = null;
  let maxCount = 0;
  
  Object.entries(moodCounts).forEach(([moodId, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequent = moodId;
    }
  });

  return {
    total,
    moodCounts,
    mostFrequent,
    mostFrequentCount: maxCount
  };
};
