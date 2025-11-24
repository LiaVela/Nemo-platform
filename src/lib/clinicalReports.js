// src/lib/clinicalReports.js

import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc,
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * ✅ Obtener entradas del diario del usuario
 */
export async function getUserJournalEntries(userId) {
  try {
    console.log('📚 Obteniendo entradas de:', userId);

    if (!userId) {
      throw new Error('userId es requerido');
    }

    // Crear query con where para filtrar por userId
    const q = query(
      collection(db, 'journal_entries'),
      where('userId', '==', userId),
      orderBy('entryDate', 'asc')
    );

    console.log('🔍 Ejecutando query en Firestore...');
    const querySnapshot = await getDocs(q);

    console.log(`✅ ${querySnapshot.size} entradas obtenidas`);

    if (querySnapshot.empty) {
      console.warn('⚠️ No se encontraron entradas para este usuario');
      return [];
    }

    const entries = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convertir Timestamps a Date objects
      let entryDate = new Date();
      if (data.entryDate?.toDate) {
        entryDate = data.entryDate.toDate();
      } else if (data.entryDate) {
        entryDate = new Date(data.entryDate);
      }

      let createdAt = new Date();
      if (data.createdAt?.toDate) {
        createdAt = data.createdAt.toDate();
      } else if (data.createdAt) {
        createdAt = new Date(data.createdAt);
      }

      return {
        id: doc.id,
        ...data,
        entryDate,
        createdAt,
      };
    });

    console.log('✅ Entradas procesadas correctamente');
    return entries;

  } catch (error) {
    console.error('❌ Error al obtener entradas:', error);
    console.error('Código:', error.code);
    console.error('Mensaje:', error.message);
    
    if (error.code === 'permission-denied') {
      console.error('🔒 ERROR DE PERMISOS:');
      console.error('1. Verifica que el usuario esté autenticado');
      console.error('2. Verifica las reglas de Firestore');
      console.error('3. Asegúrate de que userId sea correcto:', userId);
      throw new Error('No tienes permisos para acceder a estas entradas. Verifica tu autenticación.');
    }
    
    throw error;
  }
}

/**
 * Guardar reporte clínico en Firestore
 */
export async function saveClinicalReport(userId, report) {
  try {
    console.log('💾 Guardando reporte para:', userId);

    if (!userId || !report) {
      throw new Error('userId y report son requeridos');
    }

    const reportData = {
      userId,
      report,
      entriesAnalyzed: report.metadata?.analyzedEntries || 0,
      riskLevel: report.riskAssessment?.level || 'bajo',
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(db, 'clinical_reports'),
      reportData
    );

    console.log('✅ Reporte guardado con ID:', docRef.id);
    return docRef.id;

  } catch (error) {
    console.error('❌ Error al guardar reporte:', error);
    throw error;
  }
}

/**
 * Obtener último reporte clínico del usuario
 */
export async function getLastClinicalReport(userId) {
  try {
    console.log('📥 Obteniendo último reporte de:', userId);

    if (!userId) {
      throw new Error('userId es requerido');
    }

    const q = query(
      collection(db, 'clinical_reports'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('ℹ️ No hay reportes previos');
      return null;
    }

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();

    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate().toISOString()
    };

  } catch (error) {
    console.error('❌ Error al obtener último reporte:', error);
    throw error;
  }
}

/**
 * Obtener todos los reportes clínicos del usuario
 */
export async function getAllClinicalReports(userId) {
  try {
    if (!userId) {
      throw new Error('userId es requerido');
    }

    const q = query(
      collection(db, 'clinical_reports'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString()
      };
    });

  } catch (error) {
    console.error('❌ Error al obtener reportes:', error);
    throw error;
  }
}

/**
 * Eliminar reporte clínico
 */
export async function deleteClinicalReport(reportId) {
  try {
    await deleteDoc(doc(db, 'clinical_reports', reportId));
    console.log('✅ Reporte eliminado:', reportId);
    return true;

  } catch (error) {
    console.error('❌ Error al eliminar reporte:', error);
    throw error;
  }
}