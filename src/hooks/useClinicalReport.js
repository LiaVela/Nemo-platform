// src/hooks/useClinicalReport.js
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserJournalEntries, saveClinicalReport, getLastClinicalReport } from '@/lib/clinicalReports';
import { analyzeClinicalReport } from '@/services/aiService';

export function useClinicalReport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [progress, setProgress] = useState('');
  const { user } = useAuth();

  const generateReport = async () => {
    if (!user) {
      const errorMsg = 'Usuario no autenticado';
      console.error('[ERROR]', errorMsg);
      setError(errorMsg);
      return null;
    }

    console.log('[INFO] Usuario autenticado:', user.uid);
    console.log('[INFO] Email:', user.email);

    setLoading(true);
    setError(null);
    setProgress('Iniciando análisis...');

    try {
      // 1. Obtener entradas
      setProgress('Obteniendo entradas del diario...');
      console.log('[INFO] Buscando entradas para userId:', user.uid);
      
      const entries = await getUserJournalEntries(user.uid);
      
      console.log('[INFO] Resultado:', {
        total: entries?.length || 0,
        hayEntradas: entries && entries.length > 0
      });

      if (!entries || entries.length === 0) {
        const errorMsg = 'No hay entradas en tu diario para analizar. Escribe al menos una entrada primero.';
        console.warn('[WARNING]', errorMsg);
        throw new Error(errorMsg);
      }

      console.log(`[SUCCESS] ${entries.length} entradas obtenidas exitosamente`);
      console.log('[INFO] Primera entrada:', entries[0]?.entryDate);
      console.log('[INFO] Última entrada:', entries[entries.length - 1]?.entryDate);

      // 2. Analizar con IA
      setProgress(`Analizando ${entries.length} entradas con IA...`);
      console.log('[AI] Enviando a Gemini AI...');
      
      const clinicalReport = await analyzeClinicalReport(entries);
      
      console.log('[SUCCESS] Análisis completado');
      console.log('[INFO] Nivel de riesgo:', clinicalReport.riskAssessment?.level);

      // 3. Guardar en Firebase
      setProgress('Guardando reporte...');
      console.log('[DB] Guardando en Firestore...');
      
      const reportId = await saveClinicalReport(user.uid, clinicalReport);
      
      console.log('[SUCCESS] Reporte guardado con ID:', reportId);

      setReport(clinicalReport);
      setProgress('Reporte generado exitosamente');

      return clinicalReport;

    } catch (err) {
      console.error('[ERROR] Error completo:', err);
      console.error('Tipo de error:', err.constructor.name);
      console.error('Código:', err.code);
      console.error('Mensaje:', err.message);
      
      let errorMessage = err.message;
      
      if (err.code === 'permission-denied') {
        errorMessage = 'No tienes permisos para acceder a tus entradas. Verifica las reglas de Firestore.';
      } else if (err.message?.includes('insufficient permissions')) {
        errorMessage = 'Permisos insuficientes. Verifica tu autenticación y las reglas de Firebase.';
      }
      
      setError(errorMessage);
      setProgress('');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getLastReport = async () => {
    if (!user) {
      setError('Usuario no autenticado');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[INFO] Obteniendo último reporte...');
      const lastReport = await getLastClinicalReport(user.uid);
      
      if (lastReport) {
        console.log('[SUCCESS] Reporte obtenido');
        setReport(lastReport.report);
      } else {
        console.log('[INFO] No hay reportes previos');
        setReport(null);
      }

      return lastReport?.report || null;

    } catch (err) {
      console.error('[ERROR] Al obtener reporte:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearReport = () => {
    setReport(null);
    setError(null);
    setProgress('');
  };

  return {
    report,
    loading,
    error,
    progress,
    generateReport,
    getLastReport,
    clearReport,
  };
}