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

// 1. Asignamos VALORES para calcular el promedio
export const MOOD_LEVELS = {
  EXCITED: { 
    id: 'excited',
    label: 'Emocionado', 
    value: 5,
    color: 'bg-orange-500',
    darkColor: 'dark:bg-orange-600',
    gradient: 'from-orange-500 to-yellow-500',
    icon: '🤩',
    textColor: 'text-orange-600 dark:text-orange-400'
  },
  HAPPY: { 
    id: 'happy',
    label: 'Feliz', 
    value: 4,
    color: 'bg-yellow-400',
    darkColor: 'dark:bg-yellow-500',
    gradient: 'from-yellow-400 to-orange-400',
    icon: '😊',
    textColor: 'text-yellow-600 dark:text-yellow-400'
  },
  CALM: { 
    id: 'calm',
    label: 'Tranquilo', 
    value: 3,
    color: 'bg-green-400',
    darkColor: 'dark:bg-green-500',
    gradient: 'from-green-400 to-teal-400',
    icon: '😌',
    textColor: 'text-green-600 dark:text-green-400'
  },
  NEUTRAL: { 
    id: 'neutral',
    label: 'Neutral', 
    value: 3,
    color: 'bg-slate-400',
    darkColor: 'dark:bg-slate-500',
    gradient: 'from-slate-400 to-slate-500',
    icon: '😐',
    textColor: 'text-slate-600 dark:text-slate-400'
  },
  TIRED: { 
    id: 'tired',
    label: 'Cansado', 
    value: 2,
    color: 'bg-gray-500',
    darkColor: 'dark:bg-gray-600',
    gradient: 'from-gray-500 to-gray-600',
    icon: '😴',
    textColor: 'text-gray-600 dark:text-gray-400'
  },
  ANXIOUS: { 
    id: 'anxious',
    label: 'Ansioso', 
    value: 2,
    color: 'bg-purple-500',
    darkColor: 'dark:bg-purple-600',
    gradient: 'from-purple-500 to-purple-600',
    icon: '😰',
    textColor: 'text-purple-600 dark:text-purple-400'
  },
  SAD: { 
    id: 'sad',
    label: 'Triste', 
    value: 1,
    color: 'bg-blue-500',
    darkColor: 'dark:bg-blue-600',
    gradient: 'from-blue-500 to-blue-600',
    icon: '😢',
    textColor: 'text-blue-600 dark:text-blue-400'
  },
  ANGRY: { 
    id: 'angry',
    label: 'Enojado', 
    value: 1,
    color: 'bg-red-500',
    darkColor: 'dark:bg-red-600',
    gradient: 'from-red-500 to-red-600',
    icon: '😠',
    textColor: 'text-red-600 dark:text-red-400'
  }
};

/**
 * Obtener estadísticas simplificadas (Solo total y promedio)
 */
export const getMonthStats = (moods) => {
  const moodList = Object.values(moods);
  const total = moodList.length;

  if (total === 0) {
    return { total: 0, average: 0 };
  }

  let sumValues = 0;
  
  // Mapa auxiliar para buscar info de la emoción por ID
  const moodConfig = Object.values(MOOD_LEVELS);

  moodList.forEach(item => {
    const config = moodConfig.find(m => m.id === item.moodId);
    if (config) {
      sumValues += config.value;
    }
  });

  const average = (sumValues / total).toFixed(1);

  return {
    total,
    average
  };
};

export const saveDailyMood = async (userId, date, moodId, note = '') => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const moodRef = doc(db, 'users', userId, 'moods', dateStr);
  
      const moodData = {
        date: dateStr,
        timestamp: date.toISOString(),
        moodId,
        note,
        updatedAt: new Date().toISOString()
      };
  
      await setDoc(moodRef, moodData, { merge: true });
      return { success: true, data: moodData };
    } catch (error) {
      console.error('[ERROR] Error guardando mood:', error);
      throw error;
    }
  };
  
  export const getMoodByDate = async (userId, date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const moodRef = doc(db, 'users', userId, 'moods', dateStr);
      const moodSnap = await getDoc(moodRef);
      if (moodSnap.exists()) return moodSnap.data();
      return null;
    } catch (error) {
      console.error('[ERROR] Error obteniendo mood:', error);
      return null;
    }
  };
  
  export const getMonthMoods = async (userId, year, month) => {
    try {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
      const moodsRef = collection(db, 'users', userId, 'moods');
      const q = query(moodsRef, where('date', '>=', startDate), where('date', '<=', endDate), orderBy('date', 'asc'));
      const snapshot = await getDocs(q);
      const moods = {};
      snapshot.forEach((doc) => { moods[doc.id] = doc.data(); });
      return moods;
    } catch (error) {
      console.error('[ERROR] Error obteniendo moods del mes:', error);
      return {};
    }
  };