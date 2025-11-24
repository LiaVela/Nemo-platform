// src/components/dashboard/Insights.jsx

import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Lightbulb, Target, Brain } from 'lucide-react';

const Insights = ({ entries, stats }) => {
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    if (entries && entries.length > 0 && stats) {
      generateInsights();
    }
  }, [entries, stats]);

  const generateInsights = () => {
    const newInsights = [];

    // Insight 1: Tendencia Positiva/Negativa
    if (stats.dominantEmotion) {
      const positiveEmotions = ['feliz', 'tranquilo', 'emocionado'];
      const isPositive = positiveEmotions.includes(stats.dominantEmotion.id);
      
      newInsights.push({
        type: isPositive ? 'positive' : 'attention',
        icon: TrendingUp,
        title: isPositive ? 'Tendencia Positiva' : 'Área de Atención',
        description: isPositive
          ? `Tus niveles de ${stats.dominantEmotion.name.toLowerCase()} han aumentado un ${stats.dominantEmotion.percentage}% esta semana. ¡Sigue así!`
          : `Has experimentado ${stats.dominantEmotion.name.toLowerCase()} en el ${stats.dominantEmotion.percentage}% de tus entradas. Considera hablar con alguien de confianza.`,
        color: isPositive ? 'green' : 'orange'
      });
    }

    // Insight 2: Patrón de escritura
    if (entries.length >= 3) {
      const morningEntries = entries.filter(e => {
        const hour = new Date(e.createdAt).getHours();
        return hour >= 6 && hour < 12;
      }).length;

      const afternoonEntries = entries.filter(e => {
        const hour = new Date(e.createdAt).getHours();
        return hour >= 12 && hour < 18;
      }).length;

      const eveningEntries = entries.filter(e => {
        const hour = new Date(e.createdAt).getHours();
        return hour >= 18 || hour < 6;
      }).length;

      const maxTime = Math.max(morningEntries, afternoonEntries, eveningEntries);
      let timeOfDay = 'por la mañana';
      if (maxTime === afternoonEntries) timeOfDay = 'por la tarde';
      if (maxTime === eveningEntries) timeOfDay = 'por la noche';

      if (maxTime > 0) {
        newInsights.push({
          type: 'suggestion',
          icon: Lightbulb,
          title: 'Sugerencia Personalizada',
          description: `Noté que escribes más ${timeOfDay}. Considera mantener esta rutina para mejores resultados.`,
          color: 'yellow'
        });
      }
    }

    // Insight 3: Patrón detectado
    if (stats.currentStreak >= 3) {
      newInsights.push({
        type: 'pattern',
        icon: Target,
        title: 'Patrón Detectado',
        description: `Llevas ${stats.currentStreak} días consecutivos escribiendo. La consistencia es clave para el autoconocimiento.`,
        color: 'purple'
      });
    }

    // Insight 4: Consejo de bienestar
    if (stats.averageIntensity >= 7) {
      newInsights.push({
        type: 'wellness',
        icon: Brain,
        title: 'Consejo de Bienestar',
        description: 'Tus emociones han sido intensas últimamente. Recuerda practicar técnicas de respiración y mindfulness.',
        color: 'blue'
      });
    }

    setInsights(newInsights.slice(0, 4)); // Máximo 4 insights
  };

  const getColorClasses = (color) => {
    const colors = {
      green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
      yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    };
    return colors[color] || colors.purple;
  };

  const getIconColorClasses = (color) => {
    const colors = {
      green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
      orange: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30',
      yellow: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
      purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
      blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
    };
    return colors[color] || colors.purple;
  };

  const getTextColorClasses = (color) => {
    const colors = {
      green: 'text-green-900 dark:text-green-100',
      orange: 'text-orange-900 dark:text-orange-100',
      yellow: 'text-yellow-900 dark:text-yellow-100',
      purple: 'text-purple-900 dark:text-purple-100',
      blue: 'text-blue-900 dark:text-blue-100'
    };
    return colors[color] || colors.purple;
  };

  if (!entries || entries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            Insights de IA
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Escribe algunas entradas para recibir insights personalizados
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <div
          key={index}
          className={`rounded-2xl shadow-lg p-4 border ${getColorClasses(insight.color)} transition-all hover:shadow-xl`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl flex-shrink-0 ${getIconColorClasses(insight.color)}`}>
              <insight.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-bold mb-1 ${getTextColorClasses(insight.color)}`}>
                {insight.title}
              </h4>
              <p className={`text-xs ${getTextColorClasses(insight.color)} opacity-90`}>
                {insight.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Insights;