// src/components/dashboard/PromptCards.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Heart, Sun, Moon, Coffee, Star, Smile, Cloud, Brain, Lightbulb, TrendingUp, Compass } from 'lucide-react';
import { generateDailyPrompts } from '@/services/aiService';

const PromptCards = ({ entries = [] }) => {
  const [prompts, setPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Default simplificado
  const defaultPrompts = [
    {
      icon: Sun,
      title: 'Tu día',
      description: 'Reflexiona sobre tu jornada',
      color: 'from-yellow-600 to-orange-500',
      prompt: '¿Cómo fue tu día hoy?',
      isPersonalized: false
    },
    {
      icon: Heart,
      title: 'Gratitud',
      description: 'Algo bueno de hoy',
      color: 'from-pink-500 to-rose-600',
      prompt: '¿Por qué estás agradecido hoy?',
      isPersonalized: false
    }
  ];

  // Función auxiliar para asignar estilos e iconos según el tono
  // Esta función se usará tanto para datos frescos como para datos en caché
  const processPromptsData = (rawPrompts) => {
    return rawPrompts.map(p => {
      const style = getStyleForTone(p.tone);
      return {
        ...p,
        icon: style.icon, // Aquí asignamos el componente React
        color: style.color,
        isPersonalized: true
      };
    });
  };

  const getStyleForTone = (tone) => {
    const styles = {
      reflective: { icon: Brain, color: 'from-violet-500 to-purple-600' },
      gratitude: { icon: Heart, color: 'from-pink-500 to-rose-600' },
      growth: { icon: TrendingUp, color: 'from-green-500 to-teal-600' },
      calm: { icon: Moon, color: 'from-blue-500 to-indigo-600' },
      default: { icon: Sparkles, color: 'from-fuchsia-500 to-purple-600' }
    };
    return styles[tone] || styles.default;
  };

  useEffect(() => {
    let isMounted = true;

    const loadPrompts = async () => {
      if (!entries || entries.length === 0) {
        if (isMounted) {
          setPrompts(defaultPrompts);
          setIsLoading(false);
        }
        return;
      }

      // 1. Generar firma de datos
      const lastEntry = entries[0] || {}; 
      const dataSignature = `${entries.length}-${lastEntry.id}-${lastEntry.updatedAt || lastEntry.createdAt}`;
      
      const CACHE_KEY = 'cached_prompts_raw_data'; // Cambié nombre para enfatizar que es RAW
      const SIGNATURE_KEY = 'cached_prompts_signature';

      // 2. Verificar caché
      const cachedSignature = localStorage.getItem(SIGNATURE_KEY);
      const cachedRawData = localStorage.getItem(CACHE_KEY);

      if (cachedSignature === dataSignature && cachedRawData) {
        console.log('⚡ Usando Prompts en caché');
        if (isMounted) {
          try {
            const rawPrompts = JSON.parse(cachedRawData);
            // IMPORTANTE: Re-hidratar los datos con los íconos (componentes) aquí
            const processedPrompts = processPromptsData(rawPrompts);
            setPrompts(processedPrompts);
          } catch (e) {
            console.error('Error parsing cache, fetching new:', e);
            // Si falla el caché, seguimos a buscar nuevos
          } finally {
            setIsLoading(false);
            // Si tuvimos éxito con el caché, salimos. Si hubo error, dejamos que continúe el fetch.
            if (prompts.length > 0) return; 
          }
        }
        if (prompts.length > 0) return;
      }

      // 3. Generar con IA
      setIsLoading(true);
      try {
        const aiGeneratedPrompts = await generateDailyPrompts(entries);
        
        if (isMounted) {
          if (aiGeneratedPrompts && aiGeneratedPrompts.length > 0) {
            // Procesamos para la vista
            const mappedPrompts = processPromptsData(aiGeneratedPrompts);
            setPrompts(mappedPrompts);
            
            // Guardamos en caché los DATOS CRUDOS (sin componentes React)
            localStorage.setItem(CACHE_KEY, JSON.stringify(aiGeneratedPrompts));
            localStorage.setItem(SIGNATURE_KEY, dataSignature);
          } else {
            setPrompts(defaultPrompts);
          }
        }
      } catch (err) {
        console.error('Error prompts AI:', err);
        if (isMounted) setPrompts(defaultPrompts);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      loadPrompts();
    }, 1000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [entries]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {prompts.some(p => p.isPersonalized) && (
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">
            Sugerencias IA
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {prompts.map((prompt, index) => {
          const Icon = prompt.icon || Sparkles; // Fallback por seguridad
          return (
            <Link
              key={index}
              href={`/journal/new?prompt=${encodeURIComponent(prompt.prompt)}`}
              className="group"
            >
              <div className="relative overflow-hidden rounded-xl shadow-sm hover:shadow-md dark:shadow-gray-900/50 transition-all duration-300 transform hover:-translate-y-1 h-32">
                <div className={`bg-gradient-to-br ${prompt.color} p-4 h-full flex flex-col justify-between`}>
                  
                  {prompt.isPersonalized && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-1">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}

                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 w-fit">
                    <Icon className="w-5 h-5 text-white drop-shadow-sm" strokeWidth={2.5} />
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="text-white font-bold text-sm leading-tight drop-shadow-sm line-clamp-1">
                      {prompt.title}
                    </h3>
                    <p className="text-white/90 text-xs leading-snug drop-shadow-sm line-clamp-2">
                      {prompt.description}
                    </p>
                    <p className="text-white/90 text-xs leading-snug drop-shadow-sm line-clamp-2">
                      {prompt.prompt}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PromptCards;