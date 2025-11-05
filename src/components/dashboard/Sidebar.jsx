// src/components/dashboard/Sidebar.jsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  X, 
  Home, 
  BookOpen, 
  Heart, 
  TrendingUp, 
  Target,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  PenTool,
  Calendar,
  BarChart3,
  Smile,
  MessageCircle,
  Award,
  Bell,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Image from "next/image";

const Sidebar = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState(['journal', 'emotions']);

  const toggleSection = (section) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      href: '/dashboard',
      badge: null
    },
    {
      id: 'journal',
      label: 'Diario Emocional',
      icon: BookOpen,
      expandable: true,
      subItems: [
        { label: 'Nueva Entrada', icon: PenTool, href: '/journal/new', badge: null },
        { label: 'Mis Entradas', icon: Calendar, href: '/journal/entries', badge: '24' },
        { label: 'Búsqueda', icon: MessageCircle, href: '/journal/search', badge: null },
      ]
    },
    {
      id: 'emotions',
      label: 'Seguimiento Emocional',
      icon: Heart,
      expandable: true,
      subItems: [
        { label: 'Registro Rápido', icon: Smile, href: '/emotions/quick', badge: null },
        { label: 'Historial', icon: BarChart3, href: '/emotions/history', badge: null },
        { label: 'Análisis', icon: TrendingUp, href: '/emotions/analysis', badge: null },
      ]
    },
    {
      id: 'goals',
      label: 'Metas y Hábitos',
      icon: Target,
      href: '/goals',
      badge: '3'
    },
    {
      id: 'insights',
      label: 'Insights de IA',
      icon: Sparkles,
      href: '/insights',
      badge: 'New'
    },
    {
      id: 'community',
      label: 'Comunidad',
      icon: Users,
      href: '/community',
      badge: null
    },
    {
      id: 'achievements',
      label: 'Logros',
      icon: Award,
      href: '/achievements',
      badge: '12'
    }
  ];

  const bottomMenuItems = [
    { label: 'Notificaciones', icon: Bell, href: '/notifications', badge: '5' },
    { label: 'Ayuda', icon: HelpCircle, href: '/help', badge: null },
    { label: 'Configuración', icon: Settings, href: '/settings', badge: null },
  ];

  const isActive = (href) => pathname === href;
  const isSectionActive = (subItems) => subItems?.some(item => pathname === item.href);

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="rounded-xl flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Logo del sitio"
                width={64}
                height={64}
                className="rounded-lg"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">NEMO</h1>
              <p className="text-xs text-gray-500">Tu diario emocional</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.id}>
                {item.expandable ? (
                  // Expandable Section
                  <div>
                    <button
                      onClick={() => toggleSection(item.id)}
                      className={`
                        w-full flex items-center justify-between px-4 py-3 rounded-xl
                        transition-all duration-200 group
                        ${isSectionActive(item.subItems)
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-purple-600'
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${
                          isSectionActive(item.subItems) ? 'text-purple-600' : 'text-gray-500'
                        }`} />
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                      {expandedSections.includes(item.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {/* Sub Items */}
                    {expandedSections.includes(item.id) && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                        {item.subItems.map((subItem, index) => (
                          <Link
                            key={index}
                            href={subItem.href}
                            onClick={onClose}
                            className={`
                              flex items-center justify-between px-4 py-2.5 rounded-lg
                              transition-all duration-200 group
                              ${isActive(subItem.href)
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <subItem.icon className={`w-4 h-4 ${
                                isActive(subItem.href) ? 'text-white' : 'text-gray-400'
                              }`} />
                              <span className="text-sm font-medium">{subItem.label}</span>
                            </div>
                            {subItem.badge && (
                              <span className={`
                                text-xs px-2 py-0.5 rounded-full font-semibold
                                ${isActive(subItem.href)
                                  ? 'bg-white bg-opacity-20 text-white'
                                  : 'bg-purple-100 text-purple-600'
                                }
                              `}>
                                {subItem.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Regular Link
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`
                      flex items-center justify-between px-4 py-3 rounded-xl
                      transition-all duration-200 group
                      ${isActive(item.href)
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${
                        isActive(item.href) ? 'text-white' : 'text-gray-500'
                      }`} />
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`
                        text-xs px-2 py-1 rounded-full font-semibold
                        ${isActive(item.href)
                          ? 'bg-white bg-opacity-20 text-white'
                          : item.badge === 'New'
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                            : 'bg-purple-100 text-purple-600'
                        }
                      `}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-gray-200"></div>

          {/* Bottom Menu Items */}
          <div className="space-y-1">
            {bottomMenuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-xl
                  transition-all duration-200 group
                  ${isActive(item.href)
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${
                    isActive(item.href) ? 'text-white' : 'text-gray-500'
                  }`} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t border-gray-200 p-4">
          {/* User Info */}
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {auth.currentUser?.displayName?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {auth.currentUser?.displayName || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {auth.currentUser?.email}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;