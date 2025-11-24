// src/components/journal/EmotionSelector.jsx
'use client';

import React, { useState } from 'react';
import { 
  Smile, 
  Frown, 
  Heart, 
  Zap, 
  Cloud, 
  Sun, 
  Moon, 
  Meh,
  Check
} from 'lucide-react';

const emotions = [
  { id: 'feliz', name: 'Feliz', icon: Smile, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', hoverBg: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30' },
  { id: 'triste', name: 'Triste', icon: Frown, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900/30' },
  { id: 'enojado', name: 'Enojado', icon: Zap, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', hoverBg: 'hover:bg-red-100 dark:hover:bg-red-900/30' },
  { id: 'ansioso', name: 'Ansioso', icon: Cloud, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', hoverBg: 'hover:bg-purple-100 dark:hover:bg-purple-900/30' },
  { id: 'tranquilo', name: 'Tranquilo', icon: Heart, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', hoverBg: 'hover:bg-green-100 dark:hover:bg-green-900/30' },
  { id: 'emocionado', name: 'Emocionado', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', hoverBg: 'hover:bg-orange-100 dark:hover:bg-orange-900/30' },
  { id: 'cansado', name: 'Cansado', icon: Moon, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-900/20', hoverBg: 'hover:bg-gray-100 dark:hover:bg-gray-900/30' },
  { id: 'neutral', name: 'Neutral', icon: Meh, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-900/20', hoverBg: 'hover:bg-slate-100 dark:hover:bg-slate-900/30' }
];

export default function EmotionSelector({ selectedEmotion, onEmotionSelect }) {
  const [currentEmotion, setCurrentEmotion] = useState(selectedEmotion?.id || null);
  const [currentIntensity, setCurrentIntensity] = useState(selectedEmotion?.intensity || 5);

  const handleEmotionClick = (emotionId) => {
    setCurrentEmotion(emotionId);
  };

  const handleConfirm = () => {
    if (currentEmotion) {
      const emotion = emotions.find(e => e.id === currentEmotion);
      onEmotionSelect({
        id: currentEmotion,
        name: emotion.name,
        intensity: currentIntensity
      });
    }
  };

  const getSelectedEmotion = () => {
    return emotions.find(e => e.id === currentEmotion);
  };

  const selectedEmotionData = getSelectedEmotion();

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 block">
          ¿Cómo te sientes hoy? *
        </label>
        
        {/* Grid de Emociones */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {emotions.map((emotion) => {
            const Icon = emotion.icon;
            const isSelected = currentEmotion === emotion.id;
            
            return (
              <button
                key={emotion.id}
                type="button"
                onClick={() => handleEmotionClick(emotion.id)}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? `${emotion.bg} border-current ${emotion.color} shadow-lg scale-105`
                    : `bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 ${emotion.hoverBg}`
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon className={`w-8 h-8 ${isSelected ? emotion.color : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${
                    isSelected 
                      ? `${emotion.color}` 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {emotion.name}
                  </span>
                </div>
                
                {isSelected && (
                  <div className={`absolute top-2 right-2 w-6 h-6 ${emotion.bg} rounded-full flex items-center justify-center`}>
                    <Check className={`w-4 h-4 ${emotion.color}`} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Intensidad */}
        {currentEmotion && selectedEmotionData && (
          <div className={`p-6 rounded-xl ${selectedEmotionData.bg} border-2 border-current ${selectedEmotionData.color} transition-all`}>
            <div className="flex items-center justify-between mb-4">
              <label className={`text-sm font-medium ${selectedEmotionData.color}`}>
                Intensidad de la emoción
              </label>
              <span className={`text-2xl font-bold ${selectedEmotionData.color}`}>
                {currentIntensity}/10
              </span>
            </div>
            
            <input
              type="range"
              min="1"
              max="10"
              value={currentIntensity}
              onChange={(e) => setCurrentIntensity(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-current"
              style={{ accentColor: 'currentColor' }}
            />
            
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>Leve</span>
              <span>Moderada</span>
              <span>Intensa</span>
            </div>

            {/* Botón de Confirmar */}
            <button
              type="button"
              onClick={handleConfirm}
              className={`w-full mt-4 px-4 py-3 ${selectedEmotionData.bg} ${selectedEmotionData.color} border-2 border-current rounded-xl font-medium hover:opacity-80 transition-all flex items-center justify-center gap-2`}
            >
              <Check className="w-5 h-5" />
              Confirmar Emoción
            </button>
          </div>
        )}

        {/* Emoción Seleccionada Confirmada */}
        {selectedEmotion && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Emoción confirmada
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  {selectedEmotion.name} • Intensidad: {selectedEmotion.intensity}/10
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}