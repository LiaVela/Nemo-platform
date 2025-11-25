// src/services/aiService.js

import { GoogleGenerativeAI } from '@google/generative-ai';

// ============================================================================
// INICIALIZACIÓN DE GEMINI AI
// ============================================================================

let genAI = null;
let isInitialized = false;

/**
 * Inicializar cliente de Gemini AI
 */
function initializeAI() {
  if (isInitialized && genAI) {
    return genAI;
  }

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    console.error('[ERROR] NEXT_PUBLIC_GEMINI_API_KEY no está configurada');
    throw new Error('API Key de Gemini no configurada');
  }

  try {
    genAI = new GoogleGenerativeAI(apiKey);
    isInitialized = true;
    console.log('[SUCCESS] Gemini AI inicializado correctamente');
    return genAI;
  } catch (error) {
    console.error('[ERROR] Error al inicializar Gemini AI:', error);
    throw error;
  }
}

/**
 * Obtener instancia de Gemini AI
 */
function getAI() {
  if (!genAI) {
    return initializeAI();
  }
  return genAI;
}

/**
 * Encontrar modelo disponible
 */
async function findWorkingModel() {
  const ai = getAI();
  
  // Modelos en orden de preferencia
  const models = [
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5-pro-latest",
    "gemini-1.5-pro",
  ];

  for (const modelName of models) {
    try {
      console.log(`[INFO] Probando modelo: ${modelName}`);
      const model = ai.getGenerativeModel({ model: modelName });
      
      // Test simple
      const result = await model.generateContent('test');
      const text = result.response.text();
      
      if (text) {
        console.log(`[SUCCESS] Modelo ${modelName} disponible`);
        return modelName;
      }
    } catch (error) {
      console.warn(`[WARNING] Modelo ${modelName} no disponible:`, error.message);
    }
  }

  throw new Error('No hay modelos de Gemini disponibles');
}

/**
 * Limpiar respuesta JSON de Gemini
 */
function cleanJSONResponse(text) {
  // Remover markdown code blocks
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  
  // Remover comentarios
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
  cleaned = cleaned.replace(/\/\/.*/g, '');
  
  // Encontrar el primer { y el último }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  return cleaned.trim();
}

// ============================================================================
// ANÁLISIS DE EMOCIONES (Función existente)
// ============================================================================

/**
 * Analizar emoción de un texto usando Gemini
 */
export async function analyzeEmotion(text) {
  try {
    console.log('[INFO] Analizando emoción con Gemini...');
    
    const ai = getAI();
    const modelName = await findWorkingModel();
    const model = ai.getGenerativeModel({ model: modelName });

    const prompt = `
Analiza la emoción principal del siguiente texto.
IMPORTANTE: Tu respuesta debe estar completamente en ESPAÑOL.
Responde SOLO con un JSON válido (sin markdown):

Texto: "${text}"

Formato de respuesta:
{
"emotion": "nombre de la emoción en español",
"intensity": número del 1 al 10,
"confidence": número del 0 al 100,
"reasoning": "breve explicación en español"
}

Emociones válidas (usa estas palabras exactas): feliz, triste, ansioso, enojado, tranquilo, confundido, esperanzado, frustrado, nostálgico, motivado
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    console.log('[DEBUG] Respuesta de Gemini:', response);

    const cleaned = cleanJSONResponse(response);
    const analysis = JSON.parse(cleaned);

    console.log('[SUCCESS] Emoción analizada:', analysis.emotion);

    return {
      emotion: analysis.emotion || 'neutral',
      intensity: analysis.intensity || 5,
      confidence: analysis.confidence || 50,
      reasoning: analysis.reasoning || 'Análisis automático'
    };

  } catch (error) {
    console.error('[ERROR] Error al analizar emoción:', error);
    
    // Fallback: análisis básico por palabras clave
    return analyzeEmotionFallback(text);
  }
}

/**
 * Análisis de emoción fallback (sin IA)
 */
function analyzeEmotionFallback(text) {
  const lowerText = text.toLowerCase();
  
  const emotionKeywords = {
    feliz: ['feliz', 'alegre', 'contento', 'bien', 'genial', 'excelente', 'maravilloso'],
    triste: ['triste', 'deprimido', 'mal', 'llorar', 'dolor', 'pérdida'],
    ansioso: ['ansioso', 'nervioso', 'preocupado', 'estrés', 'miedo', 'pánico'],
    enojado: ['enojado', 'furioso', 'molesto', 'irritado', 'rabia'],
    tranquilo: ['tranquilo', 'relajado', 'paz', 'calma', 'sereno'],
  };

  let maxScore = 0;
  let detectedEmotion = 'neutral';

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    const score = keywords.filter(keyword => lowerText.includes(keyword)).length;
    if (score > maxScore) {
      maxScore = score;
      detectedEmotion = emotion;
    }
  }

  return {
    emotion: detectedEmotion,
    intensity: Math.min(maxScore * 2 + 3, 10),
    confidence: maxScore > 0 ? 60 : 30,
    reasoning: 'Análisis basado en palabras clave (fallback)'
  };
}

// ============================================================================
// ANÁLISIS CLÍNICO COMPLETO CON GEMINI
// ============================================================================

/**
 * Analizar múltiples entradas para generar reporte clínico
 */
export async function analyzeClinicalReport(entries) {
  try {
    console.log('[INFO] Iniciando análisis clínico de', entries.length, 'entradas...');
    
    const ai = getAI();

    if (!entries || entries.length === 0) {
      throw new Error('No hay entradas para analizar');
    }

    // Limitar a últimas 30 entradas
    const entriesToAnalyze = entries.slice(-10);

    // Preparar texto de entradas
    const entriesText = entriesToAnalyze.map((entry, index) => {
      let date;
      if (entry.entryDate?.toDate) {
        date = entry.entryDate.toDate();
      } else if (entry.entryDate) {
        date = new Date(entry.entryDate);
      } else if (entry.createdAt?.toDate) {
        date = entry.createdAt.toDate();
      } else {
        date = new Date();
      }
      
      const dateStr = date.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      return `
═══════════════════════════════════════════════════════
ENTRADA #${index + 1}
Fecha: ${dateStr}
Hora: ${date.toLocaleTimeString('es-ES')}
Emoción: ${entry.emotion?.name || entry.emotion || 'No especificada'}
Intensidad: ${entry.emotion?.intensity || entry.intensity || 'N/A'}/10
Título: ${entry.title || 'Sin título'}

Contenido:
${entry.content}
═══════════════════════════════════════════════════════
`;
    }).join('\n');

    const modelName = await findWorkingModel();
    const model = ai.getGenerativeModel({ model: modelName });

    // Prompt especializado con instrucciones estrictas de idioma
    const prompt = `
Eres un psicólogo clínico experto especializado en análisis de salud mental. Analiza las siguientes ${entriesToAnalyze.length} entradas de diario terapéutico.

⚠️ INSTRUCCIÓN OBLIGATORIA DE IDIOMA:
TODA TU RESPUESTA DEBE ESTAR ESCRITA ESTRICTAMENTE EN ESPAÑOL (Neutro o de Latinoamérica).
NO generes descripciones, justificaciones ni análisis en inglés.
Si hay términos técnicos, tradúcelos o explícalos en español.

Entradas a analizar:
${entriesText}

═══════════════════════════════════════════════════════
INSTRUCCIONES DE ANÁLISIS CLÍNICO
═══════════════════════════════════════════════════════

Realiza un análisis profesional considerando:
1. EVALUACIÓN DE RIESGO
2. PATRONES EMOCIONALES
3. DESENCADENANTES (TRIGGERS)
4. ÁREAS DE PREOCUPACIÓN
5. ESTRATEGIAS DE AFRONTAMIENTO
6. FACTORES PROTECTORES

RESPONDE EN FORMATO JSON VÁLIDO (sin markdown). Asegúrate que todos los valores de texto sean en español:

{
"riskAssessment": {
  "level": "bajo|medio|alto|critico",
  "score": 0-100,
  "confidence": 0-100,
  "needsImmediateAttention": true|false,
  "justification": "Explicación detallada del riesgo (EN ESPAÑOL)",
  "indicators": [
    {
      "type": "protective|risk",
      "severity": "low|medium|high",
      "description": "Descripción del indicador (EN ESPAÑOL)",
      "evidence": "Cita textual de la entrada"
    }
  ]
},
"emotionalPatterns": {
  "dominantEmotions": [
    {
      "emotion": "nombre de la emoción (EN ESPAÑOL)",
      "frequency": "porcentaje",
      "trend": "increasing|stable|decreasing"
    }
  ],
  "volatility": "low|medium|high",
  "overallTrend": "improving|stable|declining",
  "insights": "Análisis detallado de los patrones emocionales (EN ESPAÑOL)"
},
"triggers": {
  "people": [{"trigger": "nombre o rol (EN ESPAÑOL)", "frequency": 0-10, "impact": "low|medium|high"}],
  "places": [{"trigger": "lugar (EN ESPAÑOL)", "frequency": 0-10, "impact": "low|medium|high"}],
  "activities": [{"trigger": "actividad (EN ESPAÑOL)", "frequency": 0-10, "impact": "low|medium|high"}],
  "temporalPatterns": {
    "worstDays": ["día de la semana en español"],
    "worstTimes": ["momento del día en español"],
    "insights": "Análisis de patrones temporales (EN ESPAÑOL)"
  }
},
"concernAreas": [
  {
    "area": "relaciones|trabajo|salud|autoestima",
    "severity": "low|medium|high",
    "frequency": 0-10,
    "description": "Descripción detallada (EN ESPAÑOL)",
    "examples": ["Ejemplo citado"]
  }
],
"copingStrategies": {
  "positive": [
    {
      "strategy": "nombre de la estrategia (EN ESPAÑOL)",
      "frequency": 0-10,
      "effectiveness": "low|medium|high"
    }
  ],
  "negative": [
    {
      "strategy": "nombre de la estrategia (EN ESPAÑOL)",
      "frequency": 0-10,
      "impact": "low|medium|high"
    }
  ],
  "recommendations": ["Recomendación práctica (EN ESPAÑOL)"]
},
"protectiveFactors": [
  {
    "factor": "factor protector (EN ESPAÑOL)",
    "strength": "low|medium|high",
    "description": "Descripción de cómo ayuda (EN ESPAÑOL)"
  }
],
"progressIndicators": {
  "trend": "improving|stable|declining",
  "strengths": ["Fortaleza identificada (EN ESPAÑOL)"],
  "improvements": ["Área de mejora observada (EN ESPAÑOL)"],
  "concerns": ["Preocupación persistente (EN ESPAÑOL)"]
},
"therapeuticRecommendations": [
  {
    "priority": "urgent|high|medium|low",
    "category": "safety|therapy|medication|lifestyle|support",
    "recommendation": "Recomendación terapéutica detallada (EN ESPAÑOL)",
    "rationale": "Justificación clínica (EN ESPAÑOL)"
  }
],
"summary": {
  "overview": "Resumen ejecutivo completo (EN ESPAÑOL)",
  "keyFindings": ["Hallazgo clave 1 (EN ESPAÑOL)", "Hallazgo clave 2 (EN ESPAÑOL)"],
  "prognosis": "Pronóstico clínico (EN ESPAÑOL)",
  "nextSteps": ["Siguiente paso recomendado (EN ESPAÑOL)"]
},
"metadata": {
  "analyzedEntries": ${entriesToAnalyze.length},
  "dateRange": {
    "start": "${entriesToAnalyze[0]?.entryDate || new Date()}",
    "end": "${entriesToAnalyze[entriesToAnalyze.length - 1]?.entryDate || new Date()}"
  },
  "generatedAt": "${new Date().toISOString()}"
}
}
`;

    console.log('[INFO] Enviando solicitud a Gemini...');

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    console.log('[INFO] Respuesta recibida');

    // Limpiar y parsear
    const cleaned = cleanJSONResponse(response);
    
    let analysis;
    try {
      analysis = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('[ERROR] Error al parsear JSON:', parseError);
      console.log('Respuesta limpia:', cleaned);
      throw new Error('Error al procesar respuesta de IA');
    }

    // Agregar metadata si no existe
    if (!analysis.metadata) {
      analysis.metadata = {
        analyzedEntries: entriesToAnalyze.length,
        dateRange: {
          start: entriesToAnalyze[0]?.entryDate || new Date(),
          end: entriesToAnalyze[entriesToAnalyze.length - 1]?.entryDate || new Date()
        },
        generatedAt: new Date().toISOString()
      };
    }

    console.log('[SUCCESS] Análisis clínico completado');
    console.log('[INFO] Nivel de riesgo:', analysis.riskAssessment?.level);

    return analysis;

  } catch (error) {
    console.error('[ERROR] Error en análisis clínico:', error);
    throw error;
  }
}

// ============================================================================
// ANÁLISIS RÁPIDO DE RIESGO
// ============================================================================

/**
 * Análisis rápido de riesgo para una sola entrada
 */
export async function quickRiskAssessment(entry) {
  try {
    console.log('[INFO] Análisis rápido de riesgo...');
    
    const ai = getAI();
    const modelName = await findWorkingModel();
    const model = ai.getGenerativeModel({ model: modelName });

    const prompt = `
Analiza el riesgo de esta entrada de diario. 
IMPORTANTE: Responde SOLO con JSON válido y usa ESPAÑOL para los textos.

Contenido: "${entry.content}"
Emoción: ${entry.emotion?.name || 'no especificada'}
Intensidad: ${entry.emotion?.intensity || 'N/A'}/10

{
"riskLevel": "bajo|medio|alto|critico",
"score": 0-100,
"needsAttention": true|false,
"reasoning": "Explicación breve en ESPAÑOL",
"redFlags": ["señal de alerta si existe (en español)"]
}
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const cleaned = cleanJSONResponse(response);
    const assessment = JSON.parse(cleaned);

    return assessment;

  } catch (error) {
    console.error('[ERROR] Error en análisis rápido:', error);
    
    // Fallback básico
    return {
      riskLevel: 'bajo',
      score: 20,
      needsAttention: false,
      reasoning: 'Análisis no disponible',
      redFlags: []
    };
  }
}

// ============================================================================
// SUGERENCIAS DE ESCRITURA
// ============================================================================

/**
 * Generar sugerencias para continuar escribiendo
 */
export async function generateWritingSuggestions(currentText) {
  try {
    const ai = getAI();
    const modelName = await findWorkingModel();
    const model = ai.getGenerativeModel({ model: modelName });

    const prompt = `
Eres un terapeuta que ayuda a las personas a explorar sus emociones. 
El usuario está escribiendo: "${currentText}"

Genera 3 preguntas reflexivas para ayudarle a profundizar. 
Las preguntas deben estar estrictamente en ESPAÑOL.
Responde en JSON:

{
"suggestions": [
  "¿Pregunta reflexiva 1?",
  "¿Pregunta reflexiva 2?",
  "¿Pregunta reflexiva 3?"
]
}
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const cleaned = cleanJSONResponse(response);
    const data = JSON.parse(cleaned);

    return data.suggestions || [];

  } catch (error) {
    console.error('[ERROR] Error al generar sugerencias:', error);
    return [
      '¿Cómo te hace sentir esta situación?',
      '¿Qué podrías hacer diferente?',
      '¿Qué necesitas en este momento?'
    ];
  }
}

/**
 * Analiza una entrada 
 */
export async function analyzeJournalEntry(entryData) {
  const content = entryData.content || '';
  const analysis = await analyzeEmotion(content);

  return {
    ...analysis, // emotion, intensity, confidence, reasoning
    keywords: [], 
    themes: []    
  };
}

// Exportar también la función de inicialización por si se necesita
export { initializeAI, getAI };