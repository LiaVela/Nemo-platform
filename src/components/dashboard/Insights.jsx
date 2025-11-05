import React from 'react';
import { Sparkles, TrendingUp, AlertCircle, Lightbulb, Heart, Brain } from 'lucide-react';

const Insights = () => {
  // Datos de ejemplo - En producción vendrán del análisis de IA
  const insights = [
    {
      id: 1,
      type: 'positive',
      icon: TrendingUp,
      title: 'Tendencia Positiva',
      message: 'Tus niveles de felicidad han aumentado un 15% esta semana. ¡Sigue así!',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 2,
      type: 'suggestion',
      icon: Lightbulb,
      title: 'Sugerencia Personalizada',
      message: 'Noté que escribes más cuando haces ejercicio por la mañana. Considera mantener esta rutina.',
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      id: 3,
      type: 'pattern',
      icon: Brain,
      title: 'Patrón Detectado',
      message: 'Los martes sueles sentir más ansiedad. Planifica actividades relajantes para ese día.',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 4,
      type: 'wellness',
      icon: Heart,
      title: 'Consejo de Bienestar',
      message: 'Has mencionado "gratitud" 12 veces esta semana. Esto está relacionado con tu mejor estado de ánimo.',
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {insights.map((insight) => {
        const IconComponent = insight.icon;
        return (
          <div
            key={insight.id}
            className={`${insight.bgColor} ${insight.borderColor} border-2 rounded-lg p-5 transition-all hover:shadow-md`}
          >
            <div className="flex items-start gap-4">
              <div className={`${insight.color} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-bold text-gray-800">
                    {insight.title}
                  </h4>
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                
                <p className="text-sm text-gray-700">
                  {insight.message}
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