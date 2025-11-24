'use client';

import React, { useRef } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Brain, 
  Heart, 
  Users, 
  Calendar, 
  Target, 
  Shield, 
  AlertCircle, 
  Download, 
  Printer
} from 'lucide-react';

const ClinicalReport = ({ report, onClose }) => {
    const reportRef = useRef(null);

    if (!report) return null;

  // ============================================================================
  // FUNCIONES DE EXPORTACIÓN
  // ============================================================================

    const handlePrint = () => {
        window.print();
    };

    // Nota: En navegadores web, "Descargar PDF" usualmente invoca al diálogo de impresión
    // donde el usuario selecciona "Guardar como PDF".
    const handleDownloadPDF = () => {
        const message = document.createElement('div');
        message.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md print:hidden';
        message.innerHTML = `
            <div class="flex items-start gap-3">
            <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
                <p class="font-bold">Preparando descarga...</p>
                <p class="text-sm">Selecciona "Guardar como PDF" en la siguiente ventana.</p>
            </div>
            </div>
        `;
        document.body.appendChild(message);

        setTimeout(() => {
            window.print();
        }, 500);

        setTimeout(() => {
            if (message.parentNode) {
            document.body.removeChild(message);
            }
        }, 5000);
    };

  // ============================================================================
  // FUNCIONES DE ESTILO
  // ============================================================================

  const getRiskColor = (level) => {
    const colors = {
      bajo: 'bg-green-100 text-green-800 border-green-300',
      medio: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      alto: 'bg-orange-100 text-orange-800 border-orange-300',
      critico: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[level] || colors.bajo;
  };

  const getRiskIcon = (level) => {
    if (level === 'critico' || level === 'alto') return <AlertTriangle className="w-6 h-6" />;
    if (level === 'medio') return <AlertCircle className="w-6 h-6" />;
    return <CheckCircle className="w-6 h-6" />;
  };

  const getTrendIcon = (trend) => {
    if (trend === 'improving') return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (trend === 'declining') return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-red-100 text-red-700'
    };
    return colors[severity] || colors.low;
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      urgent: 'bg-red-600 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-white',
      low: 'bg-blue-500 text-white'
    };
    return colors[priority] || colors.low;
  };

  return (
    <>
      {/* Estilos específicos para impresión para evitar cortes */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 20mm;
            size: auto;
          }
          body {
            visibility: hidden;
            background: white;
          }
          /* Ocultar todo excepto el reporte */
          #clinical-report-container {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white;
            overflow: visible !important;
            height: auto !important;
          }
          /* Asegurar que el contenido dentro sea visible */
          #clinical-report-container * {
            visibility: visible;
          }
          /* Ocultar elementos de UI */
          .no-print {
            display: none !important;
          }
          /* Evitar cortes de página dentro de elementos importantes */
          section, .avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Cambios clave en el contenedor principal:
          print:static -> Quita la posición 'fixed' al imprimir
          print:bg-white -> Quita el fondo oscuro al imprimir
          print:p-0 -> Quita el padding externo al imprimir
      */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto print:static print:bg-white print:overflow-visible print:p-0 print:h-auto">
        <div className="min-h-screen px-4 py-8 print:min-h-0 print:p-0 print:h-auto">
          
          {/* ID Agregado para identificar el área imprimible 
              print:shadow-none -> Quita la sombra de la tarjeta
              print:max-w-none -> Usa todo el ancho disponible
          */}
          <div id="clinical-report-container" className="max-w-5xl mx-auto bg-white rounded-lg shadow-xl print:shadow-none print:max-w-none print:w-full print:rounded-none">
            
            {/* Header Web (Solo Título y Cerrar) - Botones eliminados de aquí */}
            <div className="p-6 border-b border-gray-200 no-print">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Reporte Clínico Profesional</h2>
                  <p className="text-gray-600 mt-1">
                    Análisis de {report.metadata?.analyzedEntries || 0} entradas del diario terapéutico
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 text-3xl font-light leading-none"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Contenido del reporte */}
            <div ref={reportRef} className="p-6 space-y-6 print:p-0 print:space-y-4">
              
              {/* Header para impresión (Solo visible al imprimir) */}
              <div className="hidden print:block mb-6 pb-4 border-b-2 border-gray-300">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">REPORTE CLÍNICO PROFESIONAL</h1>
                <p className="text-gray-600">Análisis de {report.metadata?.analyzedEntries || 0} entradas del diario terapéutico</p>
                <p className="text-sm text-gray-500 mt-2">
                  Generado: {new Date(report.metadata?.generatedAt).toLocaleString('es-ES')}
                </p>
              </div>

              {/* Evaluación de Riesgo */}
              {report.riskAssessment && (
                <section className={`p-6 rounded-lg border-2 avoid-break ${getRiskColor(report.riskAssessment?.level)}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getRiskIcon(report.riskAssessment?.level)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">
                        Evaluación de Riesgo: {report.riskAssessment?.level?.toUpperCase()}
                      </h3>
                      <p className="mb-4">{report.riskAssessment?.justification}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div className="bg-white bg-opacity-50 p-3 rounded">
                          <p className="text-sm font-medium">Puntuación</p>
                          <p className="text-2xl font-bold">{report.riskAssessment?.score}/100</p>
                        </div>
                        <div className="bg-white bg-opacity-50 p-3 rounded">
                          <p className="text-sm font-medium">Confianza</p>
                          <p className="text-2xl font-bold">{report.riskAssessment?.confidence}%</p>
                        </div>
                        <div className="bg-white bg-opacity-50 p-3 rounded">
                          <p className="text-sm font-medium">Atención Inmediata</p>
                          <p className="text-2xl font-bold">
                            {report.riskAssessment?.needsImmediateAttention ? 'SÍ' : 'NO'}
                          </p>
                        </div>
                      </div>

                      {report.riskAssessment?.indicators && report.riskAssessment.indicators.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold">Indicadores Identificados:</h4>
                          {report.riskAssessment.indicators.map((indicator, idx) => (
                            <div key={idx} className="bg-white bg-opacity-50 p-3 rounded avoid-break">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityBadge(indicator.severity)}`}>
                                  {indicator.severity}
                                </span>
                                <span className="font-medium">{indicator.description}</span>
                              </div>
                              {indicator.evidence && (
                                <p className="text-sm italic mt-1">&ldquo;{indicator.evidence}&rdquo;</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* Resumen Ejecutivo */}
              {report.summary && (
                <section className="bg-blue-50 p-6 rounded-lg avoid-break print:bg-transparent print:border print:border-blue-200">
                  <div className="flex items-start gap-3">
                    <Brain className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Resumen Ejecutivo</h3>
                      <p className="text-gray-700 mb-4">{report.summary?.overview}</p>
                      
                      {report.summary?.keyFindings && report.summary.keyFindings.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">Hallazgos Clave:</h4>
                          <ul className="space-y-1">
                            {report.summary.keyFindings.map((finding, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{finding}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="bg-white p-4 rounded border border-blue-200 avoid-break">
                        <h4 className="font-semibold mb-2">Pronóstico:</h4>
                        <p>{report.summary?.prognosis}</p>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Patrones Emocionales */}
              {report.emotionalPatterns && (
                <section className="bg-white border border-gray-200 p-6 rounded-lg avoid-break">
                  <div className="flex items-start gap-3">
                    <Heart className="w-6 h-6 text-pink-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Patrones Emocionales</h3>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 p-4 rounded print:border print:border-gray-200">
                          <p className="text-sm text-gray-600">Volatilidad Emocional</p>
                          <p className="text-lg font-bold capitalize">{report.emotionalPatterns?.volatility}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded flex items-center justify-between print:border print:border-gray-200">
                          <div>
                            <p className="text-sm text-gray-600">Tendencia General</p>
                            <p className="text-lg font-bold capitalize">{report.emotionalPatterns?.overallTrend}</p>
                          </div>
                          {getTrendIcon(report.emotionalPatterns?.overallTrend)}
                        </div>
                      </div>

                      {report.emotionalPatterns?.dominantEmotions && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">Emociones Dominantes:</h4>
                          <div className="space-y-2">
                            {report.emotionalPatterns.dominantEmotions.map((emotion, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded avoid-break print:border print:border-gray-100">
                                <span className="font-medium capitalize">{emotion.emotion}</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm text-gray-600">{emotion.frequency}</span>
                                  {getTrendIcon(emotion.trend)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="bg-blue-50 p-4 rounded print:bg-transparent print:border print:border-blue-100 avoid-break">
                        <h4 className="font-semibold mb-2">Análisis Detallado:</h4>
                        <p className="text-sm">{report.emotionalPatterns?.insights}</p>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Áreas de Preocupación */}
              {report.concernAreas && report.concernAreas.length > 0 && (
                <section className="bg-white border border-gray-200 p-6 rounded-lg avoid-break">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Áreas de Preocupación</h3>
                      <div className="space-y-3">
                        {report.concernAreas.map((area, idx) => (
                          <div key={idx} className="border border-gray-200 p-4 rounded avoid-break">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold capitalize text-lg">{area.area}</span>
                              <span className={`px-3 py-1 rounded text-sm font-medium ${getSeverityBadge(area.severity)}`}>
                                {area.severity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{area.description}</p>
                            <div className="text-xs text-gray-500">
                              Frecuencia de aparición: {area.frequency}/10
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Estrategias de Afrontamiento */}
              {report.copingStrategies && (
                <section className="bg-white border border-gray-200 p-6 rounded-lg avoid-break">
                  <div className="flex items-start gap-3">
                    <Target className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Estrategias de Afrontamiento</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        {report.copingStrategies?.positive && report.copingStrategies.positive.length > 0 && (
                          <div className="bg-green-50 p-4 rounded border border-green-200 print:bg-transparent">
                            <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                              <CheckCircle className="w-5 h-5" />
                              Estrategias Positivas
                            </h4>
                            <ul className="space-y-2">
                              {report.copingStrategies.positive.map((strategy, idx) => (
                                <li key={idx} className="text-sm bg-white p-2 rounded print:border print:border-gray-200">
                                  <div className="font-medium">{strategy.strategy}</div>
                                  <div className="text-gray-600 text-xs mt-1">
                                    Efectividad: {strategy.effectiveness}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {report.copingStrategies?.negative && report.copingStrategies.negative.length > 0 && (
                          <div className="bg-red-50 p-4 rounded border border-red-200 print:bg-transparent">
                            <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5" />
                              Estrategias Negativas
                            </h4>
                            <ul className="space-y-2">
                              {report.copingStrategies.negative.map((strategy, idx) => (
                                <li key={idx} className="text-sm bg-white p-2 rounded print:border print:border-gray-200">
                                  <div className="font-medium">{strategy.strategy}</div>
                                  <div className="text-gray-600 text-xs mt-1">
                                    Impacto: {strategy.impact}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Factores Protectores */}
              {report.protectiveFactors && report.protectiveFactors.length > 0 && (
                <section className="bg-green-50 border border-green-200 p-6 rounded-lg avoid-break print:bg-transparent">
                  <div className="flex items-start gap-3">
                    <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Factores Protectores</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {report.protectiveFactors.map((factor, idx) => (
                          <div key={idx} className="bg-white p-4 rounded border border-green-200 avoid-break">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{factor.factor}</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityBadge(factor.strength)}`}>
                                {factor.strength}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{factor.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Recomendaciones Terapéuticas */}
              {report.therapeuticRecommendations && report.therapeuticRecommendations.length > 0 && (
                <section className="bg-purple-50 border border-purple-200 p-6 rounded-lg avoid-break print:bg-transparent">
                  <div className="flex items-start gap-3">
                    <Users className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Recomendaciones</h3>
                      <div className="space-y-3">
                        {report.therapeuticRecommendations
                          .sort((a, b) => {
                            const priority = { urgent: 0, high: 1, medium: 2, low: 3 };
                            return priority[a.priority] - priority[b.priority];
                          })
                          .map((rec, idx) => (
                            <div key={idx} className="bg-white border border-purple-200 p-4 rounded avoid-break">
                              <div className="flex items-start justify-between mb-2">
                                <span className={`px-3 py-1 rounded text-sm font-bold ${getPriorityBadge(rec.priority)}`}>
                                  {rec.priority.toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-600 capitalize bg-gray-100 px-2 py-1 rounded">
                                  {rec.category}
                                </span>
                              </div>
                              <p className="font-semibold mb-2">{rec.recommendation}</p>
                              <p className="text-sm text-gray-600">{rec.rationale}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Metadata */}
              <section className="bg-gray-50 p-4 rounded text-sm text-gray-600 border border-gray-200 avoid-break print:bg-transparent">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-semibold">Información del Reporte</span>
                </div>
                <div className="space-y-1 ml-6">
                  <p>Entradas analizadas: {report.metadata?.analyzedEntries || 0}</p>
                  <p>Fecha de generación: {new Date(report.metadata?.generatedAt).toLocaleString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              </section>

              {/* Firma Digital */}
              <section className="border-t-2 border-gray-300 pt-4 text-center text-sm text-gray-500 avoid-break">
                <p className="font-semibold">Reporte generado con IA</p>
                <p>Este documento ha sido generado automáticamente mediante procesamiento de lenguaje natural</p>
                <p className="mt-2 text-xs">© {new Date().getFullYear()} Nemo - Todos los derechos reservados</p>
              </section>
            </div>

            {/* Footer con botones */}
            <div className="p-6 border-t border-gray-200 no-print">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors"
                >
                  <Printer className="w-5 h-5" />
                  Imprimir PDF
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-green-600 border border-green-600 rounded-lg hover:bg-green-50 font-medium transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Descargar PDF
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClinicalReport;