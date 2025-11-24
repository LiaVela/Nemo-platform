'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Heart, Sun, Moon, Coffee, Star, Smile, Cloud, Brain, Lightbulb, TrendingUp, Compass } from 'lucide-react';

const PromptCards = () => {
  const [personalizedPrompts, setPersonalizedPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Prompts por defecto con colores relacionados al tipo de insight
  const defaultPrompts = [
    {
      icon: Sun,
      title: '¿Cómo fue tu día?',
      description: 'Reflexiona sobre tu jornada',
      color: 'from-yellow-600 to-orange-500',
      prompt: '¿Cómo fue tu día hoy?'
    },
    {
      icon: Heart,
      title: 'Gratitud',
      description: '¿Por qué estás agradecido/a?',
      color: 'from-pink-500 to-rose-600',
      prompt: '¿Por qué cosas estás agradecido/a hoy?'
    },
    {
      icon: Star,
      title: 'Logros',
      description: 'Celebra tus victorias',
      color: 'from-purple-500 to-indigo-600',
      prompt: '¿Qué lograste hoy que te hace sentir orgulloso/a?'
    },
    {
      icon: Moon,
      title: 'Reflexión Nocturna',
      description: 'Cierra el día con calma',
      color: 'from-indigo-500 to-blue-600',
      prompt: '¿Qué aprendiste hoy?'
    },
    {
      icon: Coffee,
      title: 'Momento Presente',
      description: '¿Cómo te sientes ahora?',
      color: 'from-emerald-500 to-teal-600',
      prompt: 'Describe cómo te sientes en este momento'
    },
    {
      icon: Smile,
      title: 'Momento Feliz',
      description: 'Recuerda algo que te hizo sonreír',
      color: 'from-yellow-500 to-yellow-600',
      prompt: '¿Qué te hizo sonreír hoy?'
    }
  ];

  // Cargar prompts personalizados basados en entradas previas
  useEffect(() => {
    const loadPersonalizedPrompts = async () => {
      try {
        setIsLoading(true);
        
        // Obtener entradas recientes del usuario desde localStorage
        const recentEntries = getRecentEntries();
        
        if (recentEntries.length === 0) {
          // Si no hay entradas, usar prompts por defecto
          setPersonalizedPrompts(defaultPrompts);
          setIsLoading(false);
          return;
        }

        // Generar prompts personalizados con IA
        const aiPrompts = await generateAIPrompts(recentEntries);
        
        if (aiPrompts && aiPrompts.length > 0) {
          setPersonalizedPrompts(aiPrompts);
        } else {
          setPersonalizedPrompts(defaultPrompts);
        }
        
      } catch (err) {
        console.error('Error cargando prompts:', err);
        setError('No se pudieron cargar prompts personalizados');
        setPersonalizedPrompts(defaultPrompts);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersonalizedPrompts();
  }, []); // Solo ejecutar al montar el componente

  // Función para obtener entradas recientes
  const getRecentEntries = () => {
    try {
      const entries = localStorage.getItem('journalEntries');
      if (!entries) return [];
      
      const parsed = JSON.parse(entries);
      // Obtener las últimas 5 entradas
      return parsed.slice(-5).map(entry => ({
        content: entry.content,
        emotion: entry.emotion,
        themes: entry.analysis?.themes || [],
        emotions: entry.analysis?.emotions || []
      }));
    } catch (error) {
      console.error('Error leyendo entradas:', error);
      return [];
    }
  };

  // Función para generar prompts con IA
  const generateAIPrompts = async (recentEntries) => {
    try {
      // Analizar patrones en las entradas
      const allThemes = recentEntries.flatMap(e => e.themes);
      const allEmotions = recentEntries.flatMap(e => e.emotions);
      
      // Contar frecuencias
      const themeFreq = countFrequency(allThemes);
      const emotionFreq = countFrequency(allEmotions);
      
      // Temas y emociones más comunes
      const topThemes = Object.entries(themeFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([theme]) => theme);
      
      const topEmotions = Object.entries(emotionFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([emotion]) => emotion);

      // Generar prompts basados en patrones
      const aiGeneratedPrompts = [];

      // Prompt basado en emoción más frecuente
      if (topEmotions[0]) {
        const emotionData = getEmotionData(topEmotions[0]);
        aiGeneratedPrompts.push({
          icon: emotionData.icon,
          title: `Explora tu ${topEmotions[0]}`,
          description: 'Basado en tus escritos recientes',
          color: emotionData.color,
          prompt: `Has estado sintiendo ${topEmotions[0]} últimamente. ¿Qué situaciones específicas provocan esta emoción en ti?`,
          isPersonalized: true
        });
      }

      // Prompt basado en tema más frecuente
      if (topThemes[0]) {
        aiGeneratedPrompts.push({
          icon: Brain,
          title: `Reflexiona sobre ${topThemes[0]}`,
          description: 'Un tema recurrente en tu diario',
          color: 'from-cyan-500 to-blue-600', // Color de reflexión/pensamiento
          prompt: `Has escrito mucho sobre ${topThemes[0]}. ¿Qué cambios has notado en esta área de tu vida?`,
          isPersonalized: true
        });
      }

      // Prompt de crecimiento personal
      aiGeneratedPrompts.push({
        icon: TrendingUp,
        title: 'Progreso Personal',
        description: 'Observa tu evolución',
        color: 'from-green-500 to-emerald-600', // Color de crecimiento
        prompt: '¿Qué patrones has notado en tus emociones esta semana? ¿Hay algo que te gustaría cambiar?',
        isPersonalized: true
      });

      // Prompt de introspección profunda
      aiGeneratedPrompts.push({
        icon: Lightbulb,
        title: 'Momento de Insight',
        description: 'Descubre algo nuevo sobre ti',
        color: 'from-yellow-500 to-amber-600', // Color de iluminación/ideas
        prompt: 'Si pudieras darle un consejo a tu yo del pasado basándote en lo que has aprendido, ¿qué le dirías?',
        isPersonalized: true
      });

      // Prompt de segunda emoción
      if (topEmotions[1]) {
        const emotionData = getEmotionData(topEmotions[1]);
        aiGeneratedPrompts.push({
          icon: Compass,
          title: `Navega tu ${topEmotions[1]}`,
          description: 'Otra emoción importante',
          color: emotionData.color,
          prompt: `También has experimentado ${topEmotions[1]}. ¿Cómo se relaciona esta emoción con ${topEmotions[0]}?`,
          isPersonalized: true
        });
      }

      // Prompt de segundo tema
      if (topThemes[1]) {
        aiGeneratedPrompts.push({
          icon: Cloud,
          title: `Explora ${topThemes[1]}`,
          description: 'Otro aspecto de tu vida',
          color: 'from-slate-500 to-gray-600', // Color neutro para exploración
          prompt: `${topThemes[1]} también ha sido importante para ti. ¿Qué te gustaría mejorar en esta área?`,
          isPersonalized: true
        });
      }

      // Si no hay suficientes prompts personalizados, agregar algunos por defecto
      if (aiGeneratedPrompts.length < 6) {
        const remaining = 6 - aiGeneratedPrompts.length;
        aiGeneratedPrompts.push(...defaultPrompts.slice(0, remaining));
      }

      return aiGeneratedPrompts.slice(0, 6);

    } catch (error) {
      console.error('Error generando prompts con IA:', error);
      return defaultPrompts;
    }
  };

  // Función auxiliar para contar frecuencias
  const countFrequency = (arr) => {
    return arr.reduce((acc, item) => {
      if (item) {
        acc[item] = (acc[item] || 0) + 1;
      }
      return acc;
    }, {});
  };

  // Obtener datos de emoción (icono y color relacionado)
  const getEmotionData = (emotion) => {
    const emotionMap = {
      'feliz': {
        icon: Smile,
        color: 'from-yellow-500 to-orange-600' // Cálido y alegre
      },
      'triste': {
        icon: Cloud,
        color: 'from-blue-500 to-indigo-600' // Azul melancólico
      },
      'ansioso': {
        icon: Heart,
        color: 'from-red-500 to-pink-600' // Rojo/rosa intenso
      },
      'calmado': {
        icon: Moon,
        color: 'from-indigo-500 to-purple-600' // Púrpura tranquilo
      },
      'emocionado': {
        icon: Star,
        color: 'from-orange-500 to-red-600' // Naranja-rojo energético
      },
      'reflexivo': {
        icon: Brain,
        color: 'from-violet-500 to-purple-600' // Violeta pensativo
      },
      'agradecido': {
        icon: Heart,
        color: 'from-pink-500 to-rose-600' // Rosa cálido
      },
      'motivado': {
        icon: TrendingUp,
        color: 'from-green-500 to-teal-600' // Verde energético
      },
      'confundido': {
        icon: Compass,
        color: 'from-gray-500 to-slate-600' // Gris neutro
      },
      'esperanzado': {
        icon: Sun,
        color: 'from-amber-500 to-yellow-600' // Amarillo brillante
      },
      'default': {
        icon: Sparkles,
        color: 'from-fuchsia-500 to-purple-600' // Fucsia mágico
      }
    };
    
    return emotionMap[emotion?.toLowerCase()] || emotionMap.default;
  };

  // Renderizado de loading
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-gray-200 dark:bg-gray-700 rounded-xl h-40 animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Renderizado de error
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <p className="text-sm text-red-500 dark:text-red-500 mt-2">
          Mostrando prompts por defecto
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con indicador de personalización */}
      {personalizedPrompts.some(p => p.isPersonalized) && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700/50 rounded-lg p-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500 dark:text-purple-400 flex-shrink-0" />
          <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
            Prompts personalizados basados en tus escritos recientes
          </p>
        </div>
      )}

      {/* Grid de prompts - ALTURA FIJA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {personalizedPrompts.map((prompt, index) => {
          const Icon = prompt.icon;
          return (
            <Link
              key={index}
              href={`/journal/new?prompt=${encodeURIComponent(prompt.prompt)}`}
              className="group"
            >
              <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-xl dark:shadow-gray-900/50 transition-all duration-300 transform hover:-translate-y-1 h-40">
                {/* Fondo con gradiente - ALTURA FIJA */}
                <div className={`bg-gradient-to-br ${prompt.color} p-5 h-full flex flex-col justify-between`}>
                  {/* Badge de personalizado */}
                  {prompt.isPersonalized && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-white/30 dark:bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-white" />
                        <span className="text-xs text-white font-medium">IA</span>
                      </div>
                    </div>
                  )}

                  {/* Icono */}
                  <div className="bg-white/30 dark:bg-white/20 backdrop-blur-sm rounded-lg p-2.5 w-fit group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-white drop-shadow-md" strokeWidth={2.5} />
                  </div>

                  {/* Contenido - FLEX PARA DISTRIBUIR ESPACIO */}
                  <div className="space-y-1 flex-1 flex flex-col justify-end">
                    <h3 className="text-white font-bold text-base leading-tight drop-shadow-md line-clamp-2">
                      {prompt.title}
                    </h3>
                    <p className="text-white/90 text-sm leading-snug drop-shadow line-clamp-2">
                      {prompt.description}
                    </p>
                  </div>

                  {/* Decoración de hover */}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer informativo */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Los prompts se actualizan automáticamente según tus escritos
        </p>
      </div>
    </div>
  );
};

export default PromptCards;