import React from 'react';
import { PenLine, Calendar, BarChart3, Settings } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      id: 1,
      icon: PenLine,
      title: 'Nueva Entrada',
      description: 'Escribe en tu diario',
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      link: '/dashboard/diario/nuevo'
    },
    {
      id: 2,
      icon: Calendar,
      title: 'Tracker Emocional',
      description: 'Registra tu emoción del día',
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
      link: '/dashboard/tracker'
    },
    {
      id: 3,
      icon: BarChart3,
      title: 'Ver Estadísticas',
      description: 'Análisis detallado',
      color: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
      link: '/dashboard/estadisticas'
    },
    {
      id: 4,
      icon: Settings,
      title: 'Configuración',
      description: 'Ajusta tus preferencias',
      color: 'bg-gray-600',
      hoverColor: 'hover:bg-gray-700',
      link: '/dashboard/configuracion'
    }
  ];

  const handleActionClick = (link) => {
    // TODO: Implement navigation
    console.log('Navigate to:', link);
    // window.location.href = link;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Acciones Rápidas
      </h3>
      
      <div className="space-y-3">
        {actions.map((action) => {
          const IconComponent = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.link)}
              className={`w-full ${action.color} ${action.hoverColor} text-white rounded-lg p-4 flex items-center gap-4 transition-all hover:shadow-lg group`}
            >
              <div className="bg-white bg-opacity-20 rounded-lg p-3 group-hover:scale-110 transition-transform">
                <IconComponent className="w-6 h-6" />
              </div>
              
              <div className="text-left flex-1">
                <div className="font-bold text-base">
                  {action.title}
                </div>
                <div className="text-sm opacity-90">
                  {action.description}
                </div>
              </div>

              <svg 
                className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          );
        })}
      </div>

      {/* Daily Quote */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-gray-700 italic mb-2">
            "La felicidad no es algo hecho. Viene de tus propias acciones."
          </p>
          <p className="text-xs text-gray-500 text-right">
            - Dalai Lama
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;