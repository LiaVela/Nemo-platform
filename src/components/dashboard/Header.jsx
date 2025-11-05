'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Menu, 
  Bell, 
  Search, 
  LogOut, 
  User, 
  Settings,
  ChevronDown,
  X
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Header({ onMenuClick }) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Obtener información del usuario actual
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      }
    });
    return () => unsubscribe();
  }, []);

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
      if (!event.target.closest('.dropdown-container')) {
        setShowDropdown(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, text: 'Nueva entrada guardada exitosamente', time: 'Hace 5 min', unread: true, type: 'success' },
    { id: 2, text: 'Alcanzaste 7 días de racha', time: 'Hace 1 hora', unread: true, type: 'achievement' },
    { id: 3, text: 'Recordatorio: Escribe tu entrada diaria', time: 'Hace 2 horas', unread: false, type: 'reminder' },
    { id: 4, text: 'Nuevo insight de IA disponible', time: 'Ayer', unread: false, type: 'info' },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

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
      info: '💡'
    };
    return icons[type] || '📌';
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1">
          {/* Menu Button (Mobile) */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 w-full max-w-md hover:bg-gray-100 transition-colors">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en tus entradas..."
              className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
            />
          </div>

          {/* Search Button (Mobile) */}
          <button
            onClick={() => setShowSearchMobile(!showSearchMobile)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Buscar"
          >
            <Search className="w-5 h-5 text-gray-700" />
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
              className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Notificaciones"
            >
              <Bell className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-in">
                <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                        {unreadCount} nuevas
                      </span>
                    )}
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${
                          notification.unread 
                            ? 'bg-blue-50 border-blue-500' 
                            : 'border-transparent'
                        }`}
                      >
                        <div className="flex gap-3">
                          <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1">
                            <p className={`text-sm ${notification.unread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                              {notification.text}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No tienes notificaciones</p>
                    </div>
                  )}
                </div>
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <Link 
                    href="/notifications"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium block text-center"
                    onClick={() => setShowNotifications(false)}
                  >
                    Ver todas las notificaciones
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative dropdown-container">
            <button
              onClick={() => {
                setShowDropdown(!showDropdown);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 lg:gap-3 hover:bg-gray-50 rounded-xl px-2 lg:px-3 py-2 transition-colors"
            >
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt={displayName}
                  className="w-9 h-9 lg:w-10 lg:h-10 rounded-full object-cover ring-2 ring-gray-200"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center ring-2 ring-white shadow-md"
                style={{ display: userPhoto ? 'none' : 'flex' }}
              >
                <span className="text-white font-bold text-sm lg:text-base">
                  {userInitials}
                </span>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-gray-900 max-w-[150px] truncate">
                  {displayName}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform hidden lg:block ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* User Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-in">
                {/* User Info Header */}
                <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    {userPhoto ? (
                      <img
                        src={userPhoto}
                        alt={displayName}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-md"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center ring-2 ring-white shadow-md"
                      style={{ display: userPhoto ? 'none' : 'flex' }}
                    >
                      <span className="text-white font-bold text-xl">
                        {userInitials}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {userEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <Link 
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors"
                  >
                    <User size={20} />
                    <div>
                      <div className="font-medium">Mi Perfil</div>
                      <div className="text-sm text-gray-500">Ver y editar información</div>
                    </div>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <Settings className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Configuración</p>
                      <p className="text-xs text-gray-500">Preferencias y privacidad</p>
                    </div>
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 w-full transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Cerrar Sesión</p>
                      <p className="text-xs text-red-500">Salir de tu cuenta</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showSearchMobile && (
        <div className="md:hidden px-4 pb-4 animate-slide-in">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en tus entradas..."
              className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
              autoFocus
            />
            <button
              onClick={() => setShowSearchMobile(false)}
              className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}