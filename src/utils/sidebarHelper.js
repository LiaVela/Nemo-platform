// src/utils/sidebarHelper.js

/**
 * Actualiza el sidebar
 */
export const updateSidebar = () => {
  console.log('Actualizando sidebar...');
  window.dispatchEvent(new Event('journalUpdated'));
};

/**
 * Notifica cambio en el sidebar
 */
export const notifySidebarChange = (type = 'journal') => {
  const eventMap = {
    journal: 'journalUpdated',
    goals: 'goalsUpdated',
    all: 'journalUpdated' // Actualiza todo
  };
  
  const eventName = eventMap[type] || 'journalUpdated';
  window.dispatchEvent(new Event(eventName));
};

export const useSidebarUpdate = () => {
  return {
    updateJournal: updateSidebar,
    updateGoals: updateGoalsSidebar,
    updateAll: () => {
      updateSidebar();
      updateGoalsSidebar();
    }
  };
};