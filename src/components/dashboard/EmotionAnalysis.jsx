// src/components/dashboard/EmotionAnalysis.jsx

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

const EmotionAnalysis = ({ entries }) => {
  const [timeRange, setTimeRange] = useState('week');
  const [emotionDistribution, setEmotionDistribution] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);

  const emotionColors = {
    feliz: '#FCD34D',
    triste: '#60A5FA',
    enojado: '#F87171',
    ansioso: '#FB923C',
    tranquilo: '#34D399',
    emocionado: '#A78BFA',
    cansado: '#9CA3AF',
    neutral: '#CBD5E1'
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

  useEffect(() => {
    if (entries && entries.length > 0) {
      filterEntriesByTimeRange();
    }
  }, [entries, timeRange]);

  useEffect(() => {
    if (filteredEntries.length > 0) {
      processEmotionDistribution();
    } else {
      setEmotionDistribution([]);
    }
  }, [filteredEntries]);

  const filterEntriesByTimeRange = () => {
    if (!entries || entries.length === 0) {
      setFilteredEntries([]);
      return;
    }

    let filtered = [...entries];
    const now = new Date();

    if (timeRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = entries.filter(e => new Date(e.entryDate) >= weekAgo);
    } else if (timeRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = entries.filter(e => new Date(e.entryDate) >= monthAgo);
    }

    setFilteredEntries(filtered);
  };

  const processEmotionDistribution = () => {
    const emotionCounts = {};

    filteredEntries.forEach(entry => {
      const emotion = entry.emotion.id;
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    const distribution = Object.entries(emotionCounts).map(([emotion, count]) => ({
      name: emotionNames[emotion] || emotion,
      value: count,
      color: emotionColors[emotion] || '#CBD5E1',
      percentage: Math.round((count / filteredEntries.length) * 100)
    }));

    distribution.sort((a, b) => b.value - a.value);
    setEmotionDistribution(distribution);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">
            {data.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.value} entrada{data.value !== 1 ? 's' : ''} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (!entries || entries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
              Análisis Emocional
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Últimos 7 días
            </p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            No hay datos suficientes para mostrar
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Escribe algunas entradas para ver tu análisis emocional
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
              Análisis Emocional
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {timeRange === 'week' && 'Últimos 7 días'}
              {timeRange === 'month' && 'Últimos 30 días'}
              {timeRange === 'all' && 'Todas las entradas'}
            </p>
          </div>
        </div>
        
        {/* Selector de rango */}
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
        >
          <option value="week">7 días</option>
          <option value="month">30 días</option>
          <option value="all">Todo</option>
        </select>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            No hay entradas en este período
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Selecciona otro rango de tiempo
          </p>
        </div>
      ) : (
        <>
          {/* Título de sección */}
          <div className="mb-4">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white">
              Distribución de Emociones
            </h4>
          </div>

          {/* Grid: Gráfico + Lista */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gráfico Circular */}
            <div className="flex items-center justify-center">
              <div className="w-full h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={emotionDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius="80%"
                      innerRadius="50%"
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {emotionDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Lista de Emociones */}
            <div className="space-y-3">
              {emotionDistribution.map((emotion, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: emotion.color }}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                      {emotion.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {emotion.value}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[45px] text-right">
                      ({emotion.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmotionAnalysis;