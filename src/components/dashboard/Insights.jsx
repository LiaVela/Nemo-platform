// src/components/dashboard/Insights.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Lightbulb, Target, Brain, AlertCircle } from 'lucide-react';
import { generateDashboardInsights } from '@/services/aiService';

const Insights = ({ entries }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadInsights = async () => {
      if (!entries || entries.length === 0) {
        setLoading(false);
        return;
      }

      // 1. Generar una "firma" única de los datos actuales
      // Usamos la longitud y la fecha de la última entrada (que es la más reciente si está ordenado)
      // Asumimos que entries[0] es la más reciente o entries[entries.length-1]. 
      // Para mayor seguridad usamos la longitud y el ID de la primera.
      const lastEntry = entries[0] || {}; 
      const dataSignature = `${entries.length}-${lastEntry.id}-${lastEntry.updatedAt || lastEntry.createdAt}`;
      
      const CACHE_KEY = 'cached_insights_data';
      const SIGNATURE_KEY = 'cached_insights_signature';

      // 2. Verificar caché
      const cachedSignature = localStorage.getItem(SIGNATURE_KEY);
      const cachedData = localStorage.getItem(CACHE_KEY);

      if (cachedSignature === dataSignature && cachedData) {
        console.log('⚡ Usando Insights en caché (no ha cambiado la data)');
        if (isMounted) {
          setInsights(JSON.parse(cachedData));
          setLoading(false);
        }
        return;
      }

      // 3. Si no hay caché válido, llamar a la IA
      console.log('🤖 Generando nuevos Insights con IA...');
      setLoading(true);
      try {
        const aiInsights = await generateDashboardInsights(entries);
        
        if (isMounted) {
          if (aiInsights && aiInsights.length > 0) {
            setInsights(aiInsights);
            // Guardar en caché
            localStorage.setItem(CACHE_KEY, JSON.stringify(aiInsights));
            localStorage.setItem(SIGNATURE_KEY, dataSignature);
          }
        }
      } catch (error) {
        console.error("Error fetching insights:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Debounce pequeño
    const timeoutId = setTimeout(() => {
      loadInsights();
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [entries]); // Se ejecuta solo cuando 'entries' cambia

  const getIcon = (type) => {
    switch (type) {
      case 'positive': return TrendingUp;
      case 'attention': return AlertCircle;
      case 'pattern': return Target;
      case 'wellness': return Brain;
      case 'suggestion': return Lightbulb;
      default: return Sparkles;
    }
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl shadow-sm p-4 border border-gray-100 dark:border-gray-800 animate-pulse bg-white dark:bg-gray-800">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!entries || entries.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Insights IA
        </span>
      </div>
      
      {insights.map((insight, index) => {
        const Icon = getIcon(insight.type);
        return (
          <div
            key={index}
            className={`rounded-2xl shadow-sm p-4 border ${getColorClasses(insight.color)} transition-all hover:shadow-md`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl flex-shrink-0 ${getIconColorClasses(insight.color)}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-bold mb-0.5 ${getTextColorClasses(insight.color)} line-clamp-1`}>
                  {insight.title}
                </h4>
                <p className={`text-xs ${getTextColorClasses(insight.color)} opacity-90 line-clamp-2 leading-relaxed`}>
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Insights;