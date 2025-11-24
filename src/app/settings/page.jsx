// src/app/settings/page.jsx
'use client';

import { useState } from 'react';
import { 
  Moon, Sun, Bell, Shield, Info, 
  LogOut, Trash2, ChevronRight, Smartphone,
  ArrowLeft  // ✅ Nuevo ícono
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { SettingsSection, SettingItem } from '@/components/settings/SettingsSection';
import { DeleteAccountModal } from '@/components/settings/DeleteAccountModal';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  
  const { 
    fontSize, 
    pushNotifications,
    setFontSize, 
    togglePushNotifications 
  } = useSettings();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // ✅ Función para volver al inicio
  const handleGoBack = () => {
    router.push('/'); // Siempre va al inicio
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (confirm('¿Cerrar sesión en todos los dispositivos?')) {
      await handleLogout();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 transition-colors">
      <div className="max-w-4xl mx-auto">
        
        {/* ✅ BOTÓN DE RETROCESO */}
        <button
          onClick={handleGoBack}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center group-hover:shadow-lg transition-shadow">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="font-medium">Volver al Inicio</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Configuración
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Personaliza tu experiencia en NEMO
          </p>
        </div>

        <div className="space-y-6">
          
          {/* APARIENCIA */}
          <SettingsSection title="Apariencia" icon={Sun}> 
            
            <SettingItem
              label="Tamaño de Fuente"
              description="Ajusta el tamaño del texto"
            >
              <div className="flex gap-2">
                {['small', 'medium', 'large'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`
                      px-3 py-1 rounded-lg text-xs font-medium transition-colors
                      ${fontSize === size 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    {size === 'small' && 'Pequeño'}
                    {size === 'medium' && 'Mediano'}
                    {size === 'large' && 'Grande'}
                  </button>
                ))}
              </div>
            </SettingItem>
          </SettingsSection>
          
          {/* NOTIFICACIONES */}
          <SettingsSection title="Notificaciones" icon={Bell}>
            <SettingItem
              label="Permitir Notificaciones Push"
              description="Recibe recordatorios y alertas"
            >
              <button
                onClick={togglePushNotifications}
                className={`
                  relative w-14 h-7 rounded-full transition-colors duration-300
                  ${pushNotifications ? 'bg-blue-500' : 'bg-gray-300'}
                `}
              >
                <span className={`
                  absolute top-1 left-1 w-5 h-5 bg-white rounded-full
                  transition-transform duration-300
                  ${pushNotifications ? 'translate-x-7' : 'translate-x-0'}
                `} />
              </button>
            </SettingItem>
          </SettingsSection>

          {/* LEGAL */}
          <SettingsSection title="Legal" icon={Shield}>
            <Link href="/legal/terms">
              <SettingItem label="Términos y Condiciones">
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </SettingItem>
            </Link>
          </SettingsSection>

          {/* ACERCA DE */}
          <SettingsSection title="Acerca de" icon={Info}>
            <SettingItem
              label="Versión de la Aplicación"
              description="Actual"
            >
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                v1.0.0
              </span>
            </SettingItem>
            <Link href="/help">
              <SettingItem
                label="Centro de Ayuda"
                description="Preguntas frecuentes y soporte"
              >
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </SettingItem>
            </Link>
          </SettingsSection>

          {/* CUENTA - ZONA DE PELIGRO */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl shadow-lg overflow-hidden border-2 border-red-200 dark:border-red-800">
            <div className="px-6 py-4 bg-red-100 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-red-900 dark:text-red-200">
                  Cuenta
                </h2>
              </div>
            </div>
            <div className="px-6 py-4 space-y-3">
              <button
                onClick={handleLogoutAllDevices}
                disabled={logoutLoading}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Smartphone className="w-5 h-5" />
                Cerrar Sesión en Todos los Dispositivos
              </button>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="w-full px-4 py-3 bg-red-600 dark:bg-red-700 text-white font-medium rounded-xl hover:bg-red-700 dark:hover:bg-red-800 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Eliminar Cuenta Permanentemente
              </button>
            </div>
          </div>

          {/* Botón de Cerrar Sesión Simple */}
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="w-full px-6 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <LogOut className="w-5 h-5" />
            {logoutLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
          </button>
        </div>
      </div>

      <DeleteAccountModal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)} 
      />
    </div>
  );
}