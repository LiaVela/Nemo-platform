'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useClinicalReport } from '@/hooks/useClinicalReport';
import ClinicalReport from '@/components/analysis/ClinicalReport';
import { 
  Brain, 
  FileText, 
  AlertCircle, 
  Loader2, 
  Lock, 
  Shield, 
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';

export default function ClinicalAnalysisPage() {
  const { user } = useAuth();
  const { report, loading, error, progress, generateReport, clearReport } = useClinicalReport();
  const [showReport, setShowReport] = useState(false);

  const handleGenerate = async () => {
    try {
      await generateReport();
      setShowReport(true);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleCloseReport = () => {
    setShowReport(false);
  };

  const handleViewReport = () => {
    setShowReport(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md text-center border border-gray-100 dark:border-gray-700">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Autenticación Requerida
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Debes iniciar sesión para acceder al análisis clínico.
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors"
          >
            Iniciar Sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* 1. Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-purple-600 rounded-full shadow-lg shadow-purple-600/20">
              <Brain className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Análisis Clínico con IA
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Obtén un reporte profesional basado en tus entradas de diario
          </p>
        </div>

        {/* 2. Aviso Importante (Prioridad Alta) - Movido arriba para informar antes de actuar */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 dark:border-amber-600/50 p-6 rounded-lg shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-7 h-7 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-2 text-lg flex items-center gap-2">
                <span>AVISO IMPORTANTE</span>
              </h3>
              <p className="text-sm text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
                Este reporte es una herramienta de apoyo generada mediante análisis automatizado y{' '}
                <strong className="text-amber-950 dark:text-amber-50">NO SUSTITUYE una evaluación clínica profesional</strong>. 
                Debe ser interpretado únicamente por profesionales de la salud mental calificados en el 
                contexto de una evaluación integral del paciente.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Main Card (Acción Principal) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 transition-colors">
          {!loading && !report && !error && (
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Genera tu Reporte Clínico
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Analizaremos tus entradas de diario para identificar patrones emocionales,
                factores de riesgo y brindarte recomendaciones personalizadas.
              </p>
              <button
                onClick={handleGenerate}
                className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:shadow-purple-600/20"
              >
                Generar Análisis
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-purple-600 dark:text-purple-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Analizando tus entradas...
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{progress}</p>
              <div className="mt-6 max-w-md mx-auto bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div className="bg-purple-600 dark:bg-purple-500 h-3 rounded-full animate-pulse transition-all duration-500" style={{ width: '70%' }}></div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                    Error al generar reporte
                  </h3>
                  <p className="text-red-700 dark:text-red-200 mb-4">{error}</p>
                  <button
                    onClick={() => {
                      clearReport();
                      handleGenerate();
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium transition-colors"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              </div>
            </div>
          )}

          {report && !showReport && !loading && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ¡Reporte Generado Exitosamente!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Tu análisis clínico está listo para ser revisado
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleViewReport}
                  className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Ver Reporte Completo
                </button>
                <button
                  onClick={() => {
                    clearReport();
                    setShowReport(false);
                  }}
                  className="px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
                >
                  Generar Nuevo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. Info Cards (Valor) */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700">
            <div className="text-purple-600 dark:text-purple-400 mb-2 text-2xl">📊</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Análisis Profundo</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Evaluación detallada de patrones emocionales y comportamentales
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700">
            <div className="text-purple-600 dark:text-purple-400 mb-2 text-2xl">🛡️</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Evaluación de Riesgo</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Identificación de factores protectores y áreas de atención
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700">
            <div className="text-purple-600 dark:text-purple-400 mb-2 text-2xl">💡</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Recomendaciones</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sugerencias terapéuticas personalizadas y accionables
            </p>
          </div>
        </div>

        {/* 5. Avisos Profesionales y Confidencialidad */}
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 dark:border-blue-500 p-6 rounded-r-lg shadow-sm">
            <div className="flex items-start gap-3">
              <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2 text-lg">INFORMACIÓN CONFIDENCIAL</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                  Este documento contiene información médica confidencial protegida por las leyes de privacidad. 
                  Los datos presentados están basados en el análisis automatizado de las entradas del diario 
                  personal del paciente y deben ser tratados con la máxima confidencialidad profesional.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-600 dark:border-purple-500 p-6 rounded-r-lg shadow-sm">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-2 text-lg">PARA PROFESIONALES DE LA SALUD MENTAL</h3>
                <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed mb-3">
                  Este reporte clínico ha sido diseñado específicamente para profesionales de la salud mental. 
                  Incluye evaluación de riesgo, análisis de patrones emocionales, identificación de 
                  desencadenantes, estrategias de afrontamiento, factores protectores y recomendaciones 
                  terapéuticas basadas en el análisis longitudinal de las entradas del paciente.
                </p>
                <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed">
                  El análisis utiliza técnicas de procesamiento de lenguaje natural e inteligencia artificial 
                  para identificar patrones que pueden no ser evidentes en una revisión manual.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 pb-8">
          <p>© {new Date().getFullYear()} Nemo - Todos los derechos reservados</p>
        </div>
      </div>

      {showReport && report && (
        <ClinicalReport
          report={report}
          onClose={handleCloseReport}
        />
      )}
    </div>
  );
}