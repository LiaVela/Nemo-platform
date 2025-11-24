// src/app/help/page.jsx
'use client';

import { useState } from 'react';
import { ArrowLeft, Search, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import Link from 'next/link';

const faqs = [
  {
    category: 'Cuenta',
    questions: [
      {
        q: '¿Cómo creo una cuenta?',
        a: 'Haz clic en "Registrarse" en la página principal, ingresa tu email y contraseña, y sigue las instrucciones.'
      },
      {
        q: '¿Olvidé mi contraseña, qué hago?',
        a: 'En la página de login, haz clic en "¿Olvidaste tu contraseña?" y sigue las instrucciones para restablecerla.'
      },
      {
        q: '¿Cómo elimino mi cuenta?',
        a: 'Ve a Configuración → Cuenta → Eliminar Cuenta. Esta acción es permanente e irreversible.'
      }
    ]
  },
  {
    category: 'Entradas',
    questions: [
      {
        q: '¿Cómo creo una entrada?',
        a: 'Desde el dashboard o menú lateral, haz clic en el botón "Nueva Entrada", escribe tu contenido y guarda.'
      },
      {
        q: '¿Puedo editar una entrada después de crearla?',
        a: 'Sí, abre la entrada y haz clic en el botón "Editar". Puedes modificar el contenido en cualquier momento.'
      },
      {
        q: '¿Mis entradas son privadas?',
        a: 'Sí, todas tus entradas son completamente privadas. Solo tú puedes verlas.'
      }
    ]
  },
  {
    category: 'Privacidad',
    questions: [
      {
        q: '¿Quién puede ver mis entradas?',
        a: 'Solo tú. Tus entradas están encriptadas y almacenadas de forma segura. Ni siquiera nosotros podemos leerlas.'
      },
      {
        q: '¿Venden mis datos?',
        a: 'No. Nunca vendemos, compartimos ni utilizamos tus datos personales para ningún propósito comercial.'
      },
    ]
  },
  {
    category: 'Funcionalidades',
    questions: [
      {
        q: '¿Cómo activo/desativo el modo oscuro?',
        a: 'El Modo Oscuro se activa automáticamente según la configuración de tu sistema. Puedes cambiarlo en Configuración → Apariencia.'
      },
      {
        q: '¿Puedo usar NEMO sin conexión?',
        a: 'Por ahora esa función no está disponible. Procura tener una conexión cercana.'
      },
      {
        q: '¿Cómo funcionan las notificaciones?',
        a: 'En la página de Inicio, haz clic en el ícono de campana para ver las notificaciones recientes.'
      }
    ]
  }
];

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
           q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/settings"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Configuración
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Centro de Ayuda
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Encuentra respuestas a las preguntas más frecuentes
          </p>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar en preguntas frecuentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* FAQs */}
          <div className="space-y-6">
            {filteredFaqs.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {category.category}
                </h2>
                <div className="space-y-3">
                  {category.questions.map((faq, faqIndex) => {
                    const globalIndex = categoryIndex * 100 + faqIndex;
                    const isOpen = openIndex === globalIndex;
                    
                    return (
                      <div
                        key={faqIndex}
                        className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className="text-left font-medium text-gray-900 dark:text-white">
                            {faq.q}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t-2 border-gray-200 dark:border-gray-600">
                            <p className="text-gray-700 dark:text-gray-300">
                              {faq.a}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No se encontraron resultados para &quot;{searchTerm}&quot;
              </p>
            </div>
          )}

          {/* Contact Support */}
          <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  ¿No encontraste lo que buscabas?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Contáctanos y te ayudaremos en menos de 48 horas
                </p>
                <a
                  href="mailto:platformnemo@gmail.com"
                  className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                >
                  platformnemo@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}