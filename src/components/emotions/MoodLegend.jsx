// src/components/emotions/MoodLegend.jsx
'use client';

import React, { useState } from 'react';
import { ChevronDown, Heart, Smile, Frown, Meh, Zap, Sun, Info, Moon } from 'lucide-react';
import { MOOD_LEVELS } from '@/services/moodService';

const MOOD_ICONS = {
  happy: Smile,
  sad: Frown,
  angry: Zap,
  anxious: Meh,
  calm: Heart,
  excited: Sun,
  tired: Moon,
  neutral: Meh
};

const MOOD_DESCRIPTIONS = {
  happy: 'Te sientes alegre, optimista y con energía positiva',
  sad: 'Experimentas tristeza o melancolía en este momento',
  angry: 'Sientes ira, frustración o enojo',
  anxious: 'Tienes preocupación, nerviosismo o ansiedad',
  calm: 'Te sientes tranquilo, relajado y en paz',
  neutral: 'Te sientes neutral, sin emociones fuertes',
  excited: 'Estás emocionado, entusiasmado y lleno de energía',
  tired: 'Te sientes cansado, agotado o sin energía'
};

export default function MoodLegend() {
  const [expandedMood, setExpandedMood] = useState(null);

  const moodArray = Object.values(MOOD_LEVELS);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-400 rounded-xl flex items-center justify-center shadow-md">
          <Info className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            Leyenda de emociones
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Conoce todas las emociones disponibles
          </p>
        </div>
      </div>

      {/* Grid de emociones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {moodArray.map((mood) => {
          const Icon = MOOD_ICONS[mood.id];
          const isExpanded = expandedMood === mood.id;
          const description = MOOD_DESCRIPTIONS[mood.id] || '';

          return (
            <div key={mood.id} className="group">
              <button
                onClick={() => setExpandedMood(isExpanded ? null : mood.id)}
                className={`
                  w-full p-4 rounded-xl transition-all duration-300
                  ${isExpanded
                    ? `${mood.color} ${mood.darkColor} shadow-lg`
                    : `${mood.color} ${mood.darkColor} opacity-70 hover:opacity-90 shadow-md hover:shadow-lg`
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-left">
                    {Icon && (
                      <div className="w-10 h-10 bg-white/30 dark:bg-black/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-gray-800 dark:text-white" strokeWidth={2.5} />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-800 dark:text-white text-sm">
                        {mood.label}
                      </p>
                      {!isExpanded && (
                        <p className="text-xs text-gray-700 dark:text-white/70 line-clamp-1">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-800 dark:text-white transition-transform flex-shrink-0 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    strokeWidth={2.5}
                  />
                </div>

                {/* Descripción expandida */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-white/30 dark:border-black/20">
                    <p className="text-sm text-gray-800 dark:text-white font-medium">
                      {description}
                    </p>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Consejo útil */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-700">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          <span className="font-semibold">💡 Consejo:</span> Registra tus emociones diariamente para identificar patrones y mejorar tu bienestar emocional.
        </p>
      </div>
    </div>
  );
}