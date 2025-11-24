// src/components/dashboard/Header.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { searchUserEntries } from '@/services/searchService';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  Menu, 
  Bell, 
  Search, 
  LogOut, 
  User, 
  Settings,
  ChevronDown,
  X,
  Loader,
  FileText,
  Trash2
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Header({ onMenuClick }) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Obtener información del usuario actual
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      }
    });
    return () => unsubscribe();
  }, []);

  // Usar el hook de notificaciones
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    deleteOne
  } = useNotifications(currentUser?.uid);

  // Manejar cambios en el término de búsqueda
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.trim().length >= 2 && currentUser?.uid) {
        handleSearch();
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300); 

    return () => clearTimeout(delaySearch);
  }, [searchTerm, currentUser]);

  // Función para realizar la búsqueda
  const handleSearch = async () => {
    if (!currentUser?.uid || searchTerm.trim().length < 2) return;

    setIsSearching(true);
    try {
      const results = await searchUserEntries(currentUser.uid, searchTerm);
      setSearchResults(results);
      setShowSearchResults(true);
      console.log('✅ Resultados encontrados:', results.length);
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Función para navegar a una entrada
  const handleSearchResultClick = (entryId) => {
    router.push(`/journal/${entryId}`);
    setShowSearchResults(false);
    setSearchTerm('');
    setShowSearchMobile(false);
  };

  // Función para limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container') && !event.target.closest('.search-container')) {
        setShowDropdown(false);
        setShowNotifications(false);
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Obtener información del usuario
  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuario';
  const userEmail = currentUser?.email || '';
  const userInitials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Avatar del usuario (Google photo o generado)
  const userPhoto = currentUser?.photoURL;

  const getNotificationIcon = (type) => {
    const icons = {
      success: '✅',
      achievement: '🏆',
      reminder: '⏰',
      info: '💡',
      warning: '⚠️',
      streak: '🔥',
      goal: '🎯',
      milestone: '🎖️'
    };
    return icons[type] || '📌';
  };

  // ✅ Formatear tiempo relativo
  const getRelativeTime = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} hora${Math.floor(diffInSeconds / 3600) > 1 ? 's' : ''}`;
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} día${Math.floor(diffInSeconds / 86400) > 1 ? 's' : ''}`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  // Función para resaltar texto
  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/50 text-gray-900 dark:text-white">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Manejar clic en notificación
  const handleNotificationClick = async (notification) => {
    if (notification.unread) {
      await markAsRead(notification.id);
    }
  };

  // Manejar eliminación de notificación
  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    await deleteOne(notificationId);
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 shadow-sm transition-colors">
        <div className="flex items-center justify-between px-4 lg:px-8 py-4">
          {/* Left Section */}
          <div className="flex items-center gap-4 flex-1">
            {/* Menu Button (Mobile) */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              aria-label="Abrir menú"
            >
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:block relative w-full max-w-md search-container">
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => searchTerm.length >= 2 && setShowSearchResults(true)}
                  placeholder="Buscar en tus entradas..."
                  className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 w-full"
                />
                {isSearching && (
                  <Loader className="w-4 h-4 text-purple-600 animate-spin" />
                )}
                {searchTerm && !isSearching && (
                  <button
                    onClick={clearSearch}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown (Desktop) */}
              {showSearchResults && searchTerm.length >= 2 && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
                  {searchResults.length > 0 ? (
                    <>
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleSearchResultClick(result.id)}
                          className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left border-b border-gray-100 dark:border-gray-700 last:border-0"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                {result.entryDate?.toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </p>
                              <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                                {highlightText(result.content.substring(0, 150), searchTerm)}
                                {result.content.length > 150 && '...'}
                              </p>
                              {result.tags && result.tags.length > 0 && (
                                <div className="flex gap-1 mt-2 flex-wrap">
                                  {result.tags.slice(0, 3).map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="p-8 text-center">
                      <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        No se encontraron resultados para "{searchTerm}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Search Button (Mobile) */}
            <button
              onClick={() => setShowSearchMobile(!showSearchMobile)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Notifications */}
            <div className="relative dropdown-container">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowDropdown(false);
                }}
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                aria-label="Notificaciones"
              >
                <Bell className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Notificaciones
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        Marcar todas como leídas
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="p-8 text-center">
                        <Loader className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          Cargando notificaciones...
                        </p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          No tienes notificaciones
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`group relative p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                            notification.unread
                              ? 'bg-purple-50 dark:bg-purple-900/10'
                              : ''
                          }`}
                        >
                          <button
                            onClick={() => handleNotificationClick(notification)}
                            className="w-full text-left"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-2xl flex-shrink-0">
                                {getNotificationIcon(notification.type)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                  {getRelativeTime(notification.createdAt)}
                                </p>
                              </div>
                              {notification.unread && (
                                <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                          </button>
                          
                          {/* Delete button */}
                          <button
                            onClick={(e) => handleDeleteNotification(e, notification.id)}
                            className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                            aria-label="Eliminar notificación"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative dropdown-container">
              <button
                onClick={() => {
                  setShowDropdown(!showDropdown);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center overflow-hidden">
                  {userPhoto ? (
                    <img
                      src={userPhoto}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-sm">
                      {userInitials}
                    </span>
                  )}
                </div>
                <ChevronDown className="hidden lg:block w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {displayName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {userEmail}
                    </p>
                  </div>

                  <div className="p-2">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Mi Perfil
                      </span>
                    </Link>

                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Configuración
                      </span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Modal */}
      {showSearchMobile && (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden">
          <div className="bg-white dark:bg-gray-900 h-full overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowSearchMobile(false);
                    clearSearch();
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <div className="flex-1 relative">
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2.5">
                    <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar en tus entradas..."
                      autoFocus
                      className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 w-full"
                    />
                    {isSearching && (
                      <Loader className="w-4 h-4 text-purple-600 animate-spin" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4">
              {searchResults.length > 0 ? (
                <>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
                  </p>
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSearchResultClick(result.id)}
                      className="w-full p-4 mb-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {result.entryDate?.toLocaleDateString('es-ES')}
                          </p>
                          <p className="text-sm text-gray-900 dark:text-white line-clamp-3">
                            {highlightText(result.content, searchTerm)}
                          </p>
                          {result.tags && result.tags.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {result.tags.slice(0, 3).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              ) : searchTerm.length >= 2 ? (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No se encontraron resultados
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Escribe al menos 2 caracteres para buscar
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}