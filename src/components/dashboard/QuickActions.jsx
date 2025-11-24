'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PenLine, Calendar, BarChart3, Settings, ArrowRight } from 'lucide-react';

const QuickActions = () => {
  const router = useRouter();

  const actions = [
    {
      id: 1,
      icon: PenLine,
      title: 'Nueva Entrada',
      description: 'Escribe en tu diario',
      color: 'bg-purple-500 dark:bg-purple-600',
      hoverColor: 'hover:bg-purple-600 dark:hover:bg-purple-700',
      link: '/journal/new'
    },
    {
      id: 2,
      icon: Calendar,
      title: 'Mood Tracker',
      description: 'Registra tu emoción',
      color: 'bg-indigo-500 dark:bg-indigo-600',
      hoverColor: 'hover:bg-indigo-600 dark:hover:bg-indigo-700',
      link: '/emotions/tracker'
    },
    {
      id: 3,
      icon: BarChart3,
      title: 'Ver Estadísticas',
      description: 'Análisis detallado',
      color: 'bg-sky-500 dark:bg-sky-600',
      hoverColor: 'hover:bg-sky-600 dark:hover:bg-sky-700',
      link: '/emotions/tracker'
    },
    {
      id: 4,
      icon: Settings,
      title: 'Configuración',
      description: 'Ajusta tus preferencias',
      color: 'bg-slate-500 dark:bg-slate-600',
      hoverColor: 'hover:bg-slate-600 dark:hover:bg-slate-700',
      link: '/settings'
    }
  ];

  const handleActionClick = (link) => {
    router.push(link);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-4 sm:p-6 transition-colors duration-200">
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4">
        Acciones Rápidas
      </h3>
      
      <div className="space-y-2 sm:space-y-3">
        {actions.map((action) => {
          const IconComponent = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.link)}
              className={`w-full ${action.color} ${action.hoverColor} text-white rounded-lg p-3 sm:p-4 flex items-center gap-3 sm:gap-4 transition-all duration-200 hover:shadow-lg dark:hover:shadow-gray-900/50 group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 dark:focus:ring-offset-gray-800`}
              aria-label={action.title}
            >
              {/* Icono con mayor contraste y visibilidad */}
              <div className="bg-white/30 dark:bg-white/20 rounded-lg p-2 sm:p-3 group-hover:scale-110 group-hover:bg-white/40 dark:group-hover:bg-white/30 transition-all duration-200 flex-shrink-0 flex items-center justify-center">
                <IconComponent 
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-md" 
                  strokeWidth={2.5}
                />
              </div>
              
              <div className="text-left flex-1 min-w-0">
                <div className="font-bold text-sm sm:text-base truncate">
                  {action.title}
                </div>
                <div className="text-xs sm:text-sm opacity-90 truncate">
                  {action.description}
                </div>
              </div>

              <ArrowRight 
                className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:translate-x-1 transition-transform duration-200 flex-shrink-0 drop-shadow-md" 
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>

      {/* Daily Quote */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3 sm:p-4 border border-purple-200 dark:border-purple-700/50 transition-colors duration-200">
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 italic mb-2 leading-relaxed">
            "La felicidad no es algo hecho. Viene de tus propias acciones."
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
            - Dalai Lama
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;