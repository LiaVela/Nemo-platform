import React from 'react';
import { Sparkles, Heart, Sun, Moon, Coffee, Star, Smile, Cloud } from 'lucide-react';

const PromptCards = () => {
  const prompts = [
    {
      id: 1,
      icon: Sun,
      title: '¿Qué me hizo feliz hoy?',
      description: 'Reflexiona sobre los momentos positivos del día',
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      id: 2,
      icon: Heart,
      title: 'Gratitud del día',
      description: 'Escribe 3 cosas por las que estás agradecido',
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      id: 3,
      icon: Cloud,
      title: '¿Qué me preocupa?',
      description: 'Libera tus pensamientos y preocupaciones',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 4,
      icon: Star,
      title: 'Logro del día',
      description: 'Celebra tus pequeñas victorias',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 5,
      icon: Coffee,
      title: 'Momento de autocuidado',
      description: '¿Qué hiciste hoy por ti mismo?',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      id: 6,
      icon: Moon,
      title: 'Reflexión nocturna',
      description: 'Resume tu día antes de dormir',
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    }
  ];

  const handlePromptClick = (prompt) => {
    // TODO: Redirect to diary with selected prompt
    console.log('Selected prompt:', prompt.title);
    // window.location.href = `/dashboard/diario/nuevo?prompt=${prompt.id}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {prompts.map((prompt) => {
        const IconComponent = prompt.icon;
        return (
          <div
            key={prompt.id}
            onClick={() => handlePromptClick(prompt)}
            className={`${prompt.bgColor} ${prompt.borderColor} border-2 rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105 group`}
          >
            <div className={`${prompt.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            
            <h4 className="text-lg font-bold text-gray-800 mb-2">
              {prompt.title}
            </h4>
            
            <p className="text-sm text-gray-600">
              {prompt.description}
            </p>

            <div className="mt-4 flex items-center text-sm font-semibold text-gray-700 group-hover:text-gray-900">
              Comenzar a escribir
              <svg 
                className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PromptCards;