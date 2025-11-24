// src/components/dashboard/Sidebar.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  X, 
  Home, 
  BookOpen, 
  Heart, 
  TrendingUp, 
  Target,
  Sparkles,
  ChevronDown,
  ChevronRight,
  PenTool,
  Calendar,
  BarChart3,
  Smile,
  MessageCircle,
  HelpCircle,
  Rocket // Agregamos Rocket si quieres un icono diferente, o reusamos Sparkles
} from 'lucide-react';
import Image from "next/image";
import { useAuth } from '@/contexts/AuthContext';
import { getUserEntries } from '@/services/journalService';

const Sidebar = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [expandedSections, setExpandedSections] = useState(['journal', 'emotions']);
  
  // 🆕 Estado para el mensaje de "Próximamente"
  const [showComingSoon, setShowComingSoon] = useState(false);

  // Estado para datos dinámicos
  const [sidebarData, setSidebarData] = useState({
    entriesCount: 0,
    goalsCount: 0,
    hasNewInsights: false,
    loading: true
  });

  // 🆕 Cargar datos reales desde Firebase
  useEffect(() => {
    const loadSidebarData = async () => {
      if (!user) {
        setSidebarData({
          entriesCount: 0,
          goalsCount: 0,
          hasNewInsights: false,
          loading: false
        });
        return;
      }

      try {
        const entries = await getUserEntries(user.uid);
        const goals = []; 
        
        const lastInsightCheck = localStorage.getItem(`last_insight_check_${user.uid}`);
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        const hasNewInsights = !lastInsightCheck || parseInt(lastInsightCheck) < oneDayAgo;

        setSidebarData({
          entriesCount: entries.length,
          goalsCount: goals.length,
          hasNewInsights: hasNewInsights && entries.length > 0,
          loading: false
        });
      } catch (error) {
        console.error('❌ Error loading sidebar data:', error);
        setSidebarData(prev => ({ ...prev, loading: false }));
      }
    };

    loadSidebarData();

    const handleUpdate = () => {
      console.log('🔄 Actualizando sidebar...');
      loadSidebarData();
    };

    window.addEventListener('journalUpdated', handleUpdate);
    window.addEventListener('goalsUpdated', handleUpdate);

    return () => {
      window.removeEventListener('journalUpdated', handleUpdate);
      window.removeEventListener('goalsUpdated', handleUpdate);
    };
  }, [user, pathname]);

  // 🆕 Manejador de clics para interceptar Insights
  const handleLinkClick = (e, item) => {
    if (item.id === 'insights') {
      e.preventDefault(); // Evita la navegación
      setShowComingSoon(true);
      
      // Ocultar el mensaje después de 3 segundos
      setTimeout(() => {
        setShowComingSoon(false);
      }, 3000);
    } else {
      if (onClose) onClose(); // Cierra el sidebar en móvil si es un link normal
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Menu items con datos dinámicos
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
        { 
          label: 'Nueva Entrada', 
          icon: PenTool, 
          href: '/journal/new', 
          badge: null 
        },
        { 
          label: 'Mis Entradas', 
          icon: Calendar, 
          href: '/journal/entries', 
          badge: sidebarData.loading ? '...' : sidebarData.entriesCount > 0 ? sidebarData.entriesCount.toString() : null
        },
        { 
          label: 'Búsqueda', 
          icon: MessageCircle, 
          href: '/journal/search', 
          badge: null 
        },
      ]
    },
    {
      id: 'emotions',
      label: 'Seguimiento Emocional',
      icon: Heart,
      expandable: true,
      subItems: [
        { label: 'Mood Tracker', icon: Smile, href: '/emotions/tracker', badge: null },
        { label: 'Análisis', icon: TrendingUp, href: '/analysis', badge: null },
      ]
    },
    {
      id: 'insights',
      label: 'Insights de IA',
      icon: Sparkles,
      href: '/insights', // Esto se bloquea en handleLinkClick
      badge: sidebarData.hasNewInsights ? 'New' : null
    }
  ];

  const bottomMenuItems = [
    { label: 'Ayuda', icon: HelpCircle, href: './help', badge: null }
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

      {/* 🆕 Notificación de "Próximamente" (Toast) */}
      {showComingSoon && (
        <div className="fixed top-24 right-4 z-[60] animate-in slide-in-from-right fade-in duration-300">
          <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border border-gray-700 dark:border-gray-200">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Próximamente</h4>
              <p className="text-xs opacity-90">Esta función llegará en futuras actualizaciones.</p>
            </div>
            <button 
              onClick={() => setShowComingSoon(false)}
              className="ml-2 text-gray-400 hover:text-white dark:hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 
          bg-white dark:bg-gray-900 
          shadow-xl z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
          border-r border-gray-200 dark:border-gray-800
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
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
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">NEMO</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tu diario emocional</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
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
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-purple-600 dark:text-purple-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${
                          isSectionActive(item.subItems) 
                            ? 'text-purple-600 dark:text-purple-400' 
                            : 'text-gray-500 dark:text-gray-400'
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
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                        {item.subItems.map((subItem, index) => (
                          <Link
                            key={index}
                            href={subItem.href}
                            onClick={onClose}
                            className={`
                              flex items-center justify-between px-4 py-2.5 rounded-lg
                              transition-all duration-200 group
                              ${isActive(subItem.href)
                                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                              }
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <subItem.icon className={`w-4 h-4 ${
                                isActive(subItem.href) 
                                  ? 'text-purple-600 dark:text-purple-400' 
                                  : 'text-gray-400 dark:text-gray-500'
                              }`} />
                              <span className="text-sm">{subItem.label}</span>
                            </div>
                            {subItem.badge && (
                              <span className={`
                                text-xs px-2 py-0.5 rounded-full font-medium
                                ${isActive(subItem.href)
                                  ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
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
                  // Single Item (Aquí aplicamos el cambio)
                  <Link
                    href={item.href}
                    onClick={(e) => handleLinkClick(e, item)}
                    className={`
                      flex items-center justify-between px-4 py-3 rounded-xl
                      transition-all duration-200 group
                      ${isActive(item.href)
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-purple-600 dark:text-purple-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${
                        isActive(item.href) 
                          ? 'text-purple-600 dark:text-purple-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`} />
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`
                        text-xs px-2 py-1 rounded-full font-medium
                        ${item.badge === 'New'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                          : isActive(item.href)
                            ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
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
        </nav>

        {/* Bottom Menu */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-3">
          {bottomMenuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200
                ${isActive(item.href)
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;