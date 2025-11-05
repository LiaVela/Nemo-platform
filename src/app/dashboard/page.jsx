'use client';

import React, { useState } from 'react';
import { Heart, TrendingUp, BookOpen, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import StatsCard from '@/components/dashboard/StatsCard';
import EmotionAnalysis from '@/components/dashboard/EmotionAnalysis';
import PromptCards from '@/components/dashboard/PromptCards';
import Insights from '@/components/dashboard/Insights';
import QuickActions from '@/components/dashboard/QuickActions';

export default function DashboardPage() {
  const { user, loading } = useAuth(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const stats = [
    {
      title: 'Entradas Totales',
      value: 24,
      icon: BookOpen,
      color: 'bg-blue-500',
      trend: '+3 esta semana'
    },
    {
      title: 'Racha Actual',
      value: '7 días',
      icon: TrendingUp,
      color: 'bg-green-500',
      trend: '¡Sigue así!'
    },
    {
      title: 'Bienestar Semanal',
      value: '75%',
      icon: Heart,
      color: 'bg-purple-500',
      trend: '+5% vs semana pasada'
    },
    {
      title: 'Días Registrados',
      value: '28/30',
      icon: Calendar,
      color: 'bg-orange-500',
      trend: 'Este mes'
    }
  ];

  const displayName = user.displayName || user.email?.split('@')[0] || 'Usuario';

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="p-4 lg:p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              ¡Bienvenid@ de nuevo, {displayName}! 👋
            </h1>
            <p className="text-gray-600">
              Aquí está tu resumen emocional y sugerencias
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <EmotionAnalysis />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>

          {/* AI Insights Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                Insights de IA
              </h2>
            </div>
            <Insights />
          </div>

          {/* Prompt Cards Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Comienza a Escribir
            </h2>
            <PromptCards />
          </div>
        </main>
      </div>
    </div>
  );
}