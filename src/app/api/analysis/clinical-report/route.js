// src/app/api/analysis/clinical-report/route.js

import { NextResponse } from 'next/server';
import { analyzeClinicalReport } from '@/services/aiService';
import { 
  saveClinicalReport, 
  getLastClinicalReport,
  getUserJournalEntries 
} from '@/lib/clinicalReports';

/**
 * POST /api/analysis/clinical-report
 * Generar nuevo reporte clínico con IA
 */
export async function POST(request) {
  try {
    console.log('[INFO] Solicitud de reporte clínico recibida');

    // Obtener token de autenticación del header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verificar token con Firebase Admin (necesitas configurar esto)
    // Por ahora, asumimos que el frontend envía el userId en el body
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requerido' },
        { status: 400 }
      );
    }

    console.log(`[INFO] Obteniendo entradas del usuario ${userId}...`);

    // Obtener entradas del usuario desde Firebase
    const entries = await getUserJournalEntries(userId);

    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { error: 'No hay entradas para analizar' },
        { status: 400 }
      );
    }

    console.log(`[SUCCESS] ${entries.length} entradas obtenidas`);
    console.log('[PROCESSING] Generando análisis con IA...');

    // Generar reporte clínico con IA (Gemini)
    // NOTA: La instrucción de "Hablar en español" debe estar dentro de esta función
    const clinicalReport = await analyzeClinicalReport(entries);

    console.log('[INFO] Guardando reporte en Firebase...');

    // Guardar reporte en Firestore
    const reportId = await saveClinicalReport(userId, clinicalReport);

    console.log('[SUCCESS] Reporte generado y guardado exitosamente');

    return NextResponse.json({
      success: true,
      reportId,
      report: clinicalReport
    });

  } catch (error) {
    console.error('[ERROR] Error al generar reporte clínico:', error);
    
    return NextResponse.json(
      { 
        error: 'Error al generar reporte clínico',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analysis/clinical-report
 * Obtener último reporte clínico guardado
 */
export async function GET(request) {
  try {
    // Obtener userId de query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requerido' },
        { status: 400 }
      );
    }

    console.log(`[INFO] Obteniendo último reporte de ${userId}...`);

    // Obtener último reporte desde Firebase
    const report = await getLastClinicalReport(userId);

    if (!report) {
      return NextResponse.json(
        { report: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      report: report.report,
      createdAt: report.createdAt,
      reportId: report.id
    });

  } catch (error) {
    console.error('[ERROR] Error al obtener reporte:', error);
    
    return NextResponse.json(
      { error: 'Error al obtener reporte' },
      { status: 500 }
    );
  }
}