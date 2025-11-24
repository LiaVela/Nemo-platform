// src/app/legal/terms/page.jsx
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
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
            Términos y Condiciones
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Última actualización: {new Date().toLocaleDateString('es-ES')}
          </p>

          <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                1. Aceptación de Términos
              </h2>
              <p>
                Al acceder y usar NEMO, aceptas estar sujeto a estos Términos y Condiciones. 
                Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestra aplicación.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                2. Uso del Servicio
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Debes ser mayor de 10 años para usar Nemo</li>
                <li>Solo puedes crear una cuenta por persona</li>
                <li>No debes compartir tus credenciales de acceso</li>
                <li>Eres responsable de mantener la seguridad de tu cuenta</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                3. Contenido del Usuario
              </h2>
              <p>
                Eres el propietario exclusivo de todas las entradas y contenido que crees en Nemo. 
                Mantenemos tu privacidad, no compartimos, ni vendemos, ni utilizamos tu contenido 
                personal para ningún propósito sin tu consentimiento explícito.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                4. Privacidad y Seguridad
              </h2>
              <p>
                Tus datos están protegidos mediante encriptación y almacenados de forma segura.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                5. Limitación de Responsabilidad
              </h2>
              <p>
                Nemo es una herramienta de diario personal y no sustituye el consejo, diagnóstico o 
                tratamiento médico profesional. Si experimentas problemas de salud mental, 
                busca ayuda de un profesional calificado.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                6. Modificaciones del Servicio
              </h2>
              <p>
                Nos reservamos el derecho de modificar o discontinuar el servicio en cualquier momento, 
                con o sin previo aviso. No seremos responsables ante ti ni ante terceros por cualquier 
                modificación, suspensión o discontinuación del servicio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                7. Terminación
              </h2>
              <p>
                Puedes eliminar tu cuenta en cualquier momento desde la configuración. 
                Nos reservamos el derecho de suspender o terminar tu acceso si violas estos términos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                8. Cambios en los Términos
              </h2>
              <p>
                Podemos actualizar estos términos ocasionalmente. Te notificaremos sobre cambios 
                significativos mediante un aviso en la aplicación o por correo electrónico.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                9. Ley Aplicable
              </h2>
              <p>
                Estos términos se rigen por las leyes de México. Cualquier disputa será resuelta 
                en los tribunales competentes de México.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                10. Contacto
              </h2>
              <p>
                Si tienes preguntas sobre estos Términos y Condiciones, contáctanos en:
                <br />
                <strong className="text-blue-600 dark:text-blue-400">platformnemo@gmail.com</strong>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}