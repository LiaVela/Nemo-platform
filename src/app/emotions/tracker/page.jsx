// src/app/emotions/tracker/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import MoodCalendar from '@/components/emotions/MoodCalendar';
import MoodSelector from '@/components/emotions/MoodSelector';
import MoodLegend from '@/components/emotions/MoodLegend';
import { 
  getMonthMoods, 
  saveDailyMood, 
  getMonthStats,
  MOOD_LEVELS 
} from '@/services/moodService';

export default function MoodTrackerPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [moods, setMoods] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showSelector, setShowSelector] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Cargar moods del mes
  useEffect(() => {
    const loadMoods = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const monthMoods = await getMonthMoods(user.uid, year, month + 1);
        setMoods(monthMoods);

        const monthStats = getMonthStats(monthMoods);
        setStats(monthStats);

        console.log('📊 Stats del mes:', monthStats);
      } catch (error) {
        console.error('Error cargando moods:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMoods();
  }, [user, year, month]);

  // Protección de ruta
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    const today = new Date();
    const nextMonth = new Date(year, month + 1, 1);
    
    // No permitir ir al futuro
    if (nextMonth <= today) {
      setCurrentDate(nextMonth);
    }
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // No permitir fechas futuras
    if (clickedDate > today) {
      alert('No puedes registrar emociones de días futuros');
      return;
    }

    setSelectedDate(clickedDate);
    setShowSelector(true);
  };

  const handleSaveMood = async (moodLevel, note) => {
    if (!user || !selectedDate) return;

    try {
      await saveDailyMood(user.uid, selectedDate, moodLevel, note);

      // Recargar moods
      const monthMoods = await getMonthMoods(user.uid, year, month + 1);
      setMoods(monthMoods);
      setStats(getMonthStats(monthMoods));

      console.log('✅ Mood guardado exitosamente');
    } catch (error) {
      console.error('Error guardando mood:', error);
      throw error;
    }
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const getMoodEmoji = (value) => {
    const mood = Object.values(MOOD_LEVELS).find(m => m.value === value);
    return mood?.emoji || '❓';
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const currentMood = selectedDate ? moods[selectedDate.toISOString().split('T')[0]] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Mood Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Registra cómo te sientes cada día
          </p>
        </div>

        {/* Navegación de mes */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>

            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {monthNames[month]} {year}
              </h2>
            </div>

            <button
              onClick={handleNextMonth}
              disabled={month === new Date().getMonth() && year === new Date().getFullYear()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Estadísticas */}
          {stats && stats.total > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Días registrados</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.total}
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Promedio</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.average} {getMoodEmoji(Math.round(parseFloat(stats.average)))}
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Mejor día</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {getMoodEmoji(stats.best)}
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Día difícil</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {getMoodEmoji(stats.worst)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Calendario */}
        <MoodCalendar
          year={year}
          month={month}
          moods={moods}
          onDateClick={handleDateClick}
        />

        <MoodLegend />

        {/* Modal Selector */}
        {showSelector && selectedDate && (
          <MoodSelector
            date={selectedDate}
            currentMood={currentMood}
            onSave={handleSaveMood}
            onClose={() => setShowSelector(false)}
          />
        )}
      </div>
    </div>
  );
}