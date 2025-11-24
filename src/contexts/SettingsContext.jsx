// src/contexts/SettingsContext.jsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// 1. Definir el contexto
const SettingsContext = createContext(undefined);

// 2. Definir el Proveedor (Provider)
export function SettingsProvider({ children }) {
  // Estados de React (SIN darkMode)
  const [fontSize, setFontSizeState] = useState('medium');
  const [pushNotifications, setPushNotifications] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // Estado de carga

  // --- EFECTO DE CARGA INICIAL ---
  useEffect(() => {
    // Cargar valores guardados (SIN darkMode)
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    const savedPushNotifications = localStorage.getItem('pushNotifications') === 'true';

    // --- Aplicar Tamaño de Fuente ---
    setFontSizeState(savedFontSize);
    document.documentElement.style.fontSize = 
      savedFontSize === 'small' ? '14px' : 
      savedFontSize === 'large' ? '18px' : '16px';

    // --- Aplicar Notificaciones ---
    setPushNotifications(savedPushNotifications);

    // Marcar como cargado
    setIsLoaded(true);
  }, []); // El array vacío [] asegura que solo se ejecute al montar

  
  // --- EFECTOS DE SINCRONIZACIÓN ---

  // Sincroniza cambios de FontSize
  useEffect(() => {
    if (!isLoaded) return; 

    localStorage.setItem('fontSize', fontSize);
    document.documentElement.style.fontSize = 
      fontSize === 'small' ? '14px' : 
      fontSize === 'large' ? '18px' : '16px';
  }, [fontSize, isLoaded]);


  // --- FUNCIONES CONTROLADORAS ---

  const setFontSize = (size) => {
    setFontSizeState(size);
  };

  const togglePushNotifications = async () => {
    // ... (Tu lógica de notificaciones existente va aquí, está perfecta)
    const newValue = !pushNotifications;
    if (newValue) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setPushNotifications(true);
          localStorage.setItem('pushNotifications', 'true');
        }
      }
    } else {
      setPushNotifications(false);
      localStorage.setItem('pushNotifications', 'false');
    }
  };

  // --- LOADER ---
  if (!isLoaded) {
    // El loader ahora respeta el modo 'media' de Tailwind
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          {/* Añadimos dark:text-gray-400 para el loader */}
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // --- RENDERIZADO FINAL ---
  return (
    <SettingsContext.Provider
      value={{
        // Ya no proveemos darkMode ni toggleDarkMode
        fontSize,
        pushNotifications,
        setFontSize,
        togglePushNotifications,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

// 3. Hook personalizado para consumir el contexto
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings debe ser usado dentro de un SettingsProvider');
  }
  return context;
}