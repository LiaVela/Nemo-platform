// src/components/emotions/MoodCalendar.jsx
'use client';

import React from 'react';
import { Smile, Frown, Meh, Zap, Moon, Sun, Heart } from 'lucide-react';
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

const MoodCalendar = ({ year, month, moods, onDateClick }) => {
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = [];
  
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const getMoodForDay = (day) => {
    if (!day) return null;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return moods[dateStr];
  };

  const getMoodStyle = (moodId) => {
    return Object.values(MOOD_LEVELS).find(m => m.id === moodId) || null;
  };

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
      
      {/* Header con días de la semana */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map((day, index) => (
          <div
            key={`weekday-${index}`}
            className={`text-center text-sm font-bold py-2 ${
              index === 0 || index === 6 
                ? 'text-purple-600 dark:text-purple-400' 
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const mood = getMoodForDay(day);
          const moodStyle = mood ? getMoodStyle(mood.moodId) : null;
          const Icon = moodStyle ? MOOD_ICONS[moodStyle.id] : null;
          const isToday = day && 
            new Date().getDate() === day && 
            new Date().getMonth() === month && 
            new Date().getFullYear() === year;

          return (
            <button
              key={`day-${index}-${day || 'empty'}`}
              onClick={() => day && onDateClick(day)}
              disabled={!day}
              className={`
                aspect-square rounded-xl flex flex-col items-center justify-center
                transition-all duration-300 relative group
                ${day ? 'cursor-pointer hover:scale-110 hover:shadow-lg active:scale-95' : 'cursor-default'}
                ${isToday ? 'ring-4 ring-purple-500 ring-offset-2 dark:ring-offset-gray-800 shadow-lg' : ''}
                ${!day ? 'invisible' : ''}
                ${moodStyle 
                  ? `${moodStyle.color} ${moodStyle.darkColor} shadow-md` 
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              {day && (
                <>
                  {moodStyle && Icon ? (
                    <div className="flex flex-col items-center gap-1">
                      <Icon className="w-6 h-6 text-gray-800 dark:text-white" strokeWidth={2.5} />
                      <span className="text-xs font-bold text-gray-800 dark:text-white">
                        {day}
                      </span>
                    </div>
                  ) : (
                    <span className="text-base font-semibold text-gray-600 dark:text-gray-300">
                      {day}
                    </span>
                  )}
                  
                  {/* Tooltip mejorado */}
                  {moodStyle && (
                    <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 
                      bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg
                      opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                      whitespace-nowrap z-10 shadow-xl font-semibold">
                      {moodStyle.label}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full 
                        w-2 h-2 bg-gray-900 dark:bg-gray-700"></div>
                    </div>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Nota informativa */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          Haz clic en cualquier día para registrar o editar tu emoción
        </p>
      </div>
    </div>
  );
};

export default MoodCalendar;