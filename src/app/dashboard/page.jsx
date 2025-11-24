// src/app/dashboard/page.jsx

'use client';

import React, { useState, useEffect } from 'react';
import { Heart, TrendingUp, BookOpen, Calendar, Loader, Flame, Target } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getUserEntries } from '@/services/journalService';
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
  
  // Estados de datos reales
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar entradas y calcular estadísticas
  useEffect(() => {
    if (user?.uid) {
      loadDashboardData();
    }
  }, [user]);

  // Escuchar cambios en el diario
  useEffect(() => {
    const handleJournalUpdate = () => {
      if (user?.uid) {
        loadDashboardData();
      }
    };

    window.addEventListener('journalUpdated', handleJournalUpdate);
    return () => window.removeEventListener('journalUpdated', handleJournalUpdate);
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const entriesData = await getUserEntries(user.uid);
      setEntries(entriesData);
      
      const calculatedStats = calculateStats(entriesData);
      setStats(calculatedStats);
    } catch (error) {
      console.error('❌ Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (entriesData) => {
    if (!entriesData || entriesData.length === 0) {
      return {
        totalEntries: 0,
        currentStreak: 0,
        dominantEmotion: { name: 'neutral', emoji: '😐', count: 0 },
        thisWeekEntries: 0,
        emotionBreakdown: {},
        averageIntensity: 0,
        weeklyTrend: 'stable'
      };
    }

    const totalEntries = entriesData.length;
    const currentStreak = calculateStreak(entriesData);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekEntries = entriesData.filter(entry => 
      new Date(entry.entryDate) >= oneWeekAgo
    ).length;

    const emotionCounts = {};
    let totalIntensity = 0;

    entriesData.forEach(entry => {
      const emotion = entry.emotion.id;
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      totalIntensity += entry.emotion.intensity || 5;
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
      percentage: totalEntries > 0 
        ? Math.round((emotionCounts[dominantEmotionId] / totalEntries) * 100) 
        : 0
    };

    const averageIntensity = totalEntries > 0 
      ? (totalIntensity / totalEntries).toFixed(1) 
      : 0;

    const lastWeekEntries = entriesData.filter(entry => {
      const entryDate = new Date(entry.entryDate);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      return entryDate >= twoWeeksAgo && entryDate < oneWeekAgo;
    }).length;

    let weeklyTrend = 'stable';
    if (thisWeekEntries > lastWeekEntries) weeklyTrend = 'up';
    if (thisWeekEntries < lastWeekEntries) weeklyTrend = 'down';

    return {
      totalEntries,
      currentStreak,
      dominantEmotion,
      thisWeekEntries,
      emotionBreakdown: emotionCounts,
      averageIntensity,
      weeklyTrend,
      lastWeekEntries
    };
  };

  const calculateStreak = (entriesData) => {
    if (!entriesData || entriesData.length === 0) return 0;

    const sortedEntries = [...entriesData].sort((a, b) => 
      new Date(b.entryDate) - new Date(a.entryDate)
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let entry of sortedEntries) {
      const entryDate = new Date(entry.entryDate);
      entryDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
      } else if (diffDays > streak) {
        break;
      }
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

  if (!user) {
    return null;
  }

  const statsCards = stats ? [
    {
      title: 'Entradas Totales',
      value: stats.totalEntries,
      icon: BookOpen,
      color: 'bg-blue-500',
      trend: stats.thisWeekEntries > 0 
        ? `+${stats.thisWeekEntries} esta semana` 
        : 'Sin entradas esta semana',
      trendUp: stats.weeklyTrend === 'up'
    },
    {
      title: 'Racha Actual',
      value: stats.currentStreak > 0 ? `${stats.currentStreak} día${stats.currentStreak !== 1 ? 's' : ''}` : '0 días',
      icon: Flame,
      color: 'bg-orange-500',
      trend: stats.currentStreak >= 7 
        ? '¡Increíble!' 
        : stats.currentStreak >= 3 
          ? '¡Sigue así!' 
          : 'Comienza tu racha',
      trendUp: stats.currentStreak > 0
    },
    {
      title: 'Emoción Dominante',
      value: `${stats.dominantEmotion.emoji} ${stats.dominantEmotion.name}`,
      icon: Heart,
      color: 'bg-pink-500',
      trend: stats.dominantEmotion.count > 0 
        ? `${stats.dominantEmotion.percentage}% del tiempo` 
        : 'Sin datos',
      trendUp: ['feliz', 'tranquilo', 'emocionado'].includes(stats.dominantEmotion.id)
    },
    {
      title: 'Intensidad Promedio',
      value: `${stats.averageIntensity}/10`,
      icon: Target,
      color: 'bg-purple-500',
      trend: stats.averageIntensity >= 7 
        ? 'Emociones intensas' 
        : stats.averageIntensity >= 4 
          ? 'Nivel moderado' 
          : 'Emociones suaves',
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
            {/* Bienvenida */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                ¡Hola, {user.displayName || 'Usuario'}!
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {stats?.totalEntries > 0 
                  ? `Has registrado ${stats.totalEntries} entrada${stats.totalEntries !== 1 ? 's' : ''} en tu diario emocional`
                  : 'Comienza tu viaje de autoconocimiento escribiendo tu primera entrada'
                }
              </p>
            </div>

            {/* Stats Cards Grid - 4 columnas en desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {statsCards.map((stat, index) => (
                <StatsCard key={index} {...stat} />
              ))}
            </div>

            {/* Layout Principal: 2 columnas en desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna Izquierda (2/3) */}
              <div className="lg:col-span-2 space-y-6">
                <EmotionAnalysis entries={entries} />
                <PromptCards />
              </div>

              {/* Columna Derecha (1/3) */}
              <div className="space-y-6">
                <Insights entries={entries} stats={stats} />
                <QuickActions />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}