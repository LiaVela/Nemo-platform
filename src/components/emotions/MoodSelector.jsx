// src/components/emotions/MoodSelector.jsx
'use client';

import React, { useState } from 'react';
import { X, Save, Heart, Smile, Frown, Meh, Zap, Sun, Moon } from 'lucide-react';
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

const MoodSelector = ({ date, currentMood, onSave, onClose }) => {
  const [selectedMood, setSelectedMood] = useState(currentMood?.moodLevel || null);
  const [note, setNote] = useState(currentMood?.note || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedMood) {
      alert('Por favor selecciona un estado de ánimo');
      return;
    }

    setSaving(true);
    try {
      await onSave(selectedMood, note);
      onClose();
    } catch (error) {
      console.error('Error guardando mood:', error);
      alert('Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const moodArray = Object.values(MOOD_LEVELS);
  const selectedMoodData = moodArray.find(m => m.id === selectedMood);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      {/* CORRECCIÓN PRINCIPAL: 
         1. max-h-[90vh]: Limita la altura al 90% de la pantalla
         2. flex flex-col: Organiza header y contenido verticalmente
         3. Eliminado overflow-hidden general, gestionado por secciones
      */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header con gradiente - flex-shrink-0 evita que se aplaste */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 p-6 sm:p-8 relative overflow-hidden rounded-t-3xl flex-shrink-0">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative flex items-start justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                ¿Cómo te sientes hoy?
              </h2>
              <p className="text-purple-100 text-sm">
                {formatDate(date)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-all active:scale-95"
            >
              <X className="w-6 h-6 text-white" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* CORRECCIÓN CONTENIDO:
           1. overflow-y-auto: Permite scroll SOLO en el contenido
           2. p-4 sm:p-8: Padding más pequeño en móviles
        */}
        <div className="p-4 sm:p-8 overflow-y-auto">
          
          {/* Selector de emociones visual */}
          <div className="mb-6 sm:mb-8">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4 uppercase tracking-wide">
              Selecciona tu emoción
            </p>
            
            {/* Grid ajustado para móviles: 2 columnas, iconos más pequeños si es necesario */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {moodArray.map((mood) => {
                const Icon = MOOD_ICONS[mood.id];
                const isSelected = selectedMood === mood.id;
                
                return (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    className={`
                      relative p-3 sm:p-4 rounded-2xl transition-all duration-300 group
                      ${isSelected 
                        ? `${mood.color} ${mood.darkColor} shadow-lg scale-105 ring-2 sm:ring-4 ring-white dark:ring-gray-700` 
                        : `${mood.color} ${mood.darkColor} opacity-60 hover:opacity-80 hover:scale-105 shadow-md`
                      }
                    `}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {Icon && (
                        <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-800 dark:text-white transition-transform group-hover:scale-110" strokeWidth={2.5} />
                      )}
                      <span className="text-xs font-bold text-gray-800 dark:text-white text-center leading-tight">
                        {mood.label}
                      </span>
                    </div>
                    
                    {/* Checkmark para seleccionado */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Descripción de la emoción seleccionada */}
          {selectedMoodData && (
            <div className={`${selectedMoodData.color} ${selectedMoodData.darkColor} rounded-2xl p-4 mb-6 shadow-md border-2 border-white/20 dark:border-white/10`}>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                Has seleccionado: <span className="font-bold">{selectedMoodData.label}</span>
              </p>
              <p className="text-xs text-gray-700 dark:text-white/80 mt-1">
                Añade una nota para recordar por qué te sientes así
              </p>
            </div>
          )}

          {/* Campo de nota */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Nota (opcional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="¿Qué te hizo sentir así? ¿Algo especial pasó hoy?"
              className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 
                bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                resize-none transition-all text-sm sm:text-base"
              rows="3"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {note.length}/500 caracteres
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="w-full sm:flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600
                text-gray-700 dark:text-gray-300 font-semibold
                hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-95 text-sm sm:text-base order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedMood || saving}
              className="w-full sm:flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500
                text-white font-semibold shadow-lg
                hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
                transition-all active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-2"
            >
              <Save className="w-5 h-5" strokeWidth={2.5} />
              {saving ? 'Guardando...' : 'Guardar emoción'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodSelector;