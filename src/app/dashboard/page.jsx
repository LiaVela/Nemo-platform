// src/app/dashboard/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Heart, TrendingUp, BookOpen, Calendar, Loader, Flame, Target } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getUserEntries } from '@/services/journalService';
import { getAllUserMoods, MOOD_LEVELS } from '@/services/moodService'; 
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import StatsCard from '@/components/dashboard/StatsCard';
import EmotionAnalysis from '@/components/dashboard/EmotionAnalysis';
import PromptCards from '@/components/dashboard/PromptCards';
import Insights from '@/components/dashboard/Insights';
import QuickActions from '@/components/dashboard/QuickActions';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [journalEntries, setJournalEntries] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mapeo para traducir IDs de inglés (Mood Tracker) a español (Diario)
  const MOOD_TRANSLATION = {
    happy: 'feliz',
    sad: 'triste',
    angry: 'enojado',
    anxious: 'ansioso',
    calm: 'tranquilo',
    excited: 'emocionado',
    tired: 'cansado',
    neutral: 'neutral'
  };

  useEffect(() => {
    if (user?.uid) {
      loadDashboardData();
    }
  }, [user]);

  useEffect(() => {
    const handleUpdate = () => {
      if (user?.uid) loadDashboardData();
    };
    window.addEventListener('journalUpdated', handleUpdate);
    return () => window.removeEventListener('journalUpdated', handleUpdate);
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. Obtener Entradas de Diario
      const journalData = await getUserEntries(user.uid);
      setJournalEntries(journalData);
      
      // 2. Obtener Moods
      const moodData = await getAllUserMoods(user.uid);

      // 3. Normalizar Moods al formato del Diario (traduciendo IDs)
      const normalizedMoods = moodData.map(mood => {
        const moodConfigKey = Object.keys(MOOD_LEVELS).find(key => MOOD_LEVELS[key].id === mood.moodId);
        const moodConfig = MOOD_LEVELS[moodConfigKey] || MOOD_LEVELS.NEUTRAL;

        // Traducir el ID al español para que coincida con el diario
        const spanishId = MOOD_TRANSLATION[mood.moodId] || mood.moodId;

        return {
          id: `mood-${mood.id}`,
          type: 'mood',
          content: mood.note || '',
          entryDate: mood.timestamp,
          createdAt: new Date(mood.timestamp),
          emotion: {
            id: spanishId, // ID normalizado (ej: 'feliz' en vez de 'happy')
            name: moodConfig.label,
            intensity: moodConfig.value * 2 
          }
        };
      });

      const allData = [...journalData, ...normalizedMoods];
      allData.sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate));
      setCombinedData(allData);
      
      const calculatedStats = calculateStats(journalData, allData);
      setStats(calculatedStats);

    } catch (error) {
      console.error('❌ Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (journalData, combinedData) => {
    
    // --- ESTADÍSTICAS BASADAS SOLO EN ENTRADAS (Journal) ---
    const totalEntries = journalData.length;
    const currentStreak = calculateStreak(journalData);
    
    let totalIntensity = 0;
    journalData.forEach(entry => {
        totalIntensity += entry.emotion.intensity || 5;
    });
    const averageIntensity = totalEntries > 0 
      ? (totalIntensity / totalEntries).toFixed(1) 
      : 0;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const thisWeekEntries = journalData.filter(entry => 
      new Date(entry.entryDate) >= oneWeekAgo
    ).length;

    const lastWeekEntries = journalData.filter(entry => {
        const entryDate = new Date(entry.entryDate);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        return entryDate >= twoWeeksAgo && entryDate < oneWeekAgo;
    }).length;

    let weeklyTrend = 'stable';
    if (thisWeekEntries > lastWeekEntries) weeklyTrend = 'up';
    if (thisWeekEntries < lastWeekEntries) weeklyTrend = 'down';


    // --- ESTADÍSTICAS BASADAS EN DATOS COMBINADOS ---
    const emotionCounts = {};
    const totalCombined = combinedData.length;

    combinedData.forEach(entry => {
      const emotion = entry.emotion.id;
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    const dominantEmotionId = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

    const emotionEmojis = {
      feliz: '😊',
      triste: '😢',
      enojado: '😠',
      ansioso: '😰',
      tranquilo: '😌',
      emocionado: '🤩',
      cansado: '😴',
      neutral: '😐'
    };

    const emotionNames = {
      feliz: 'Felicidad',
      triste: 'Tristeza',
      enojado: 'Enojo',
      ansioso: 'Ansiedad',
      tranquilo: 'Tranquilidad',
      emocionado: 'Emoción',
      cansado: 'Cansancio',
      neutral: 'Neutral'
    };

    const dominantEmotion = {
      id: dominantEmotionId,
      name: emotionNames[dominantEmotionId] || 'Neutral',
      emoji: emotionEmojis[dominantEmotionId] || '😐',
      count: emotionCounts[dominantEmotionId] || 0,
      percentage: totalCombined > 0 
        ? Math.round((emotionCounts[dominantEmotionId] / totalCombined) * 100) 
        : 0
    };

    return {
      totalEntries,
      currentStreak,
      averageIntensity,
      thisWeekEntries,
      weeklyTrend,
      dominantEmotion
    };
  };

  const calculateStreak = (data) => {
    if (!data || data.length === 0) return 0;
    const uniqueDates = new Set(data.map(e => new Date(e.entryDate).toDateString()));
    const sortedDates = Array.from(uniqueDates).map(d => new Date(d)).sort((a, b) => b - a);
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const lastEntryDate = sortedDates[0];
    const diffToLast = Math.floor((currentDate - lastEntryDate) / (1000 * 60 * 60 * 24));
    if (diffToLast > 1) return 0;
    for (let i = 0; i < sortedDates.length; i++) {
        const date = sortedDates[i];
        const expectedDate = new Date(lastEntryDate);
        expectedDate.setDate(lastEntryDate.getDate() - i);
        if (date.toDateString() === expectedDate.toDateString()) streak++;
        else break;
    }
    return streak;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 text-purple-600 dark:text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 text-lg">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const statsCards = stats ? [
    {
      title: 'Entradas Totales',
      value: stats.totalEntries,
      icon: BookOpen,
      color: 'bg-blue-500',
      trend: stats.thisWeekEntries > 0 
        ? `+${stats.thisWeekEntries} esta semana` 
        : 'Sin actividad reciente',
      trendUp: stats.weeklyTrend === 'up'
    },
    {
      title: 'Racha Actual',
      value: stats.currentStreak > 0 ? `${stats.currentStreak} día${stats.currentStreak !== 1 ? 's' : ''}` : '0 días',
      icon: Flame,
      color: 'bg-orange-500',
      trend: stats.currentStreak >= 3 ? '¡Vas genial!' : '¡Tú puedes!',
      trendUp: stats.currentStreak > 0
    },
    {
      title: 'Emoción Dominante',
      value: `${stats.dominantEmotion.emoji} ${stats.dominantEmotion.name}`,
      icon: Heart,
      color: 'bg-pink-500',
      trend: stats.dominantEmotion.count > 0 
        ? `${stats.dominantEmotion.percentage}% de tu actividad` 
        : 'Sin datos',
      trendUp: true
    },
    {
      title: 'Intensidad Promedio',
      value: `${stats.averageIntensity}/10`,
      icon: Target,
      color: 'bg-purple-500',
      trend: 'En tus escritos',
      trendUp: stats.averageIntensity >= 5
    }
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <Header onMenuClick={() => setIsSidebarOpen(true)} user={user} />

        <main className="pt-4 lg:p-8 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                ¡Hola, {user.displayName || 'Usuario'}!
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {stats?.totalEntries > 0 
                  ? `Has escrito ${stats.totalEntries} entrada${stats.totalEntries !== 1 ? 's' : ''} en tu diario`
                  : 'Comienza tu viaje de autoconocimiento'
                }
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {statsCards.map((stat, index) => (
                <StatsCard key={index} {...stat} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Ahora combinedData tiene los IDs normalizados en español */}
                <EmotionAnalysis entries={combinedData} />
                <PromptCards entries={combinedData} />
              </div>

              <div className="space-y-6">
                <Insights entries={journalEntries} stats={stats} />
                <QuickActions />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}