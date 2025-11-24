// src/services/aiSearchService.js

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

// 🆕 Modelos disponibles con fallback
const modelsToTry = [
  "gemini-2.0-flash-exp",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash",
  "gemini-1.5-pro-latest",
  "gemini-1.5-pro",
];

/**
 * 🔄 Intentar generar contenido con múltiples modelos
 */
const generateWithFallback = async (prompt) => {
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`🔄 Intentando con modelo: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      console.log(`✅ Éxito con modelo: ${modelName}`);
      return response.text();
    } catch (error) {
      console.warn(`⚠️ Fallo con ${modelName}:`, error.message);
      lastError = error;
      continue;
    }
  }

  throw lastError || new Error('Todos los modelos fallaron');
};

/**
 * 🧠 Analizar consulta de búsqueda con IA
 */
export const analyzeSearchQuery = async (query, entries) => {
  try {
    const prompt = `
Analiza esta consulta de búsqueda de un diario emocional y proporciona insights:

Consulta: "${query}"

Contexto: El usuario tiene ${entries.length} entradas en su diario.

Proporciona SOLO un objeto JSON válido (sin markdown ni texto adicional):
{
"intent": "descripción de lo que el usuario busca",
"suggestedEmotions": ["lista", "de", "emociones", "relacionadas"],
"keywords": ["palabras", "clave", "extraídas"],
"searchStrategy": "descripción de cómo buscar mejor"
}

Emociones disponibles: feliz, triste, enojado, ansioso, tranquilo, emocionado, cansado, neutral
`;

    const text = await generateWithFallback(prompt);
    
    // Extraer JSON de la respuesta (eliminar markdown si existe)
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    
    const insights = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      intent: "Búsqueda general",
      suggestedEmotions: [],
      keywords: query.split(' ').filter(w => w.length > 2),
      searchStrategy: "Búsqueda por palabras clave"
    };

    // Buscar entradas relevantes
    const results = searchEntriesSemantically(query, entries, insights);

    return {
      insights,
      results
    };
  } catch (error) {
    console.error('❌ Error en análisis IA:', error);
    
    // Fallback: búsqueda básica inteligente
    const keywords = query.toLowerCase().split(' ').filter(w => w.length > 2);
    
    return {
      insights: {
        intent: "Búsqueda por palabras clave",
        suggestedEmotions: [],
        keywords: keywords,
        searchStrategy: "Coincidencia de texto"
      },
      results: entries.filter(entry =>
        entry.title?.toLowerCase().includes(query.toLowerCase()) ||
        entry.content.toLowerCase().includes(query.toLowerCase()) ||
        entry.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
    };
  }
};

/**
 * 🔍 Búsqueda semántica de entradas
 */
const searchEntriesSemantically = (query, entries, insights) => {
  const queryLower = query.toLowerCase();
  const keywords = insights.keywords.map(k => k.toLowerCase());
  
  return entries
    .map(entry => {
      let score = 0;
      const contentLower = entry.content.toLowerCase();
      const titleLower = (entry.title || '').toLowerCase();
      
      // Coincidencia exacta en título (peso alto)
      if (titleLower.includes(queryLower)) score += 10;
      
      // Coincidencia exacta en contenido
      if (contentLower.includes(queryLower)) score += 5;
      
      // Coincidencia de keywords
      keywords.forEach(keyword => {
        if (titleLower.includes(keyword)) score += 3;
        if (contentLower.includes(keyword)) score += 2;
        
        // Palabras parciales
        const titleWords = titleLower.split(' ');
        const contentWords = contentLower.split(' ');
        
        titleWords.forEach(word => {
          if (word.includes(keyword) || keyword.includes(word)) score += 1;
        });
        
        contentWords.forEach(word => {
          if (word.includes(keyword) || keyword.includes(word)) score += 0.5;
        });
      });
      
      // Coincidencia de emociones sugeridas
      if (insights.suggestedEmotions.includes(entry.emotion.id)) {
        score += 4;
      }
      
      // Coincidencia en tags
      if (entry.tags) {
        entry.tags.forEach(tag => {
          const tagLower = tag.toLowerCase();
          if (tagLower.includes(queryLower)) score += 3;
          keywords.forEach(keyword => {
            if (tagLower.includes(keyword)) score += 2;
          });
        });
      }
      
      return { ...entry, searchScore: score };
    })
    .filter(entry => entry.searchScore > 0)
    .sort((a, b) => b.searchScore - a.searchScore);
};

/**
 * 🎯 Encontrar entradas similares
 */
export const findSimilarEntries = async (targetEntry, allEntries) => {
  try {
    // Crear resumen de la entrada objetivo
    const targetSummary = `
Título: ${targetEntry.title || 'Sin título'}
Contenido: ${targetEntry.content.substring(0, 500)}
Emoción: ${targetEntry.emotion.id}
Intensidad: ${targetEntry.emotion.intensity}
Tags: ${targetEntry.tags?.join(', ') || 'ninguno'}
`;

    const prompt = `
Analiza esta entrada de diario y dame las características clave para encontrar entradas similares:

${targetSummary}

Proporciona SOLO un objeto JSON válido (sin markdown):
{
"themes": ["tema1", "tema2", "tema3"],
"emotions": ["emocion1", "emocion2"],
"keywords": ["palabra1", "palabra2", "palabra3", "palabra4", "palabra5"],
"context": "descripción breve del contexto"
}
`;

    const text = await generateWithFallback(prompt);
    
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      themes: [],
      emotions: [targetEntry.emotion.id],
      keywords: targetEntry.content.split(' ').slice(0, 10).filter(w => w.length > 3),
      context: ""
    };

    console.log('📊 Análisis de similitud:', analysis);

    // Calcular similitud con otras entradas
    const similarEntries = allEntries
      .filter(entry => entry.id !== targetEntry.id)
      .map(entry => {
        let similarity = 0;
        
        // Similitud por emoción (30%)
        if (analysis.emotions.includes(entry.emotion.id)) {
          similarity += 0.3;
        }
        
        // Similitud por intensidad emocional (20%)
        const intensityDiff = Math.abs(
          (entry.emotion.intensity || 5) - (targetEntry.emotion.intensity || 5)
        );
        similarity += (1 - intensityDiff / 10) * 0.2;
        
        // Similitud por keywords (30%)
        const entryText = `${entry.title} ${entry.content}`.toLowerCase();
        let keywordMatches = 0;
        analysis.keywords.forEach(keyword => {
          if (entryText.includes(keyword.toLowerCase())) {
            keywordMatches++;
          }
        });
        if (analysis.keywords.length > 0) {
          similarity += (keywordMatches / analysis.keywords.length) * 0.3;
        }
        
        // Similitud por tags (20%)
        if (entry.tags && targetEntry.tags) {
          const commonTags = entry.tags.filter(tag =>
            targetEntry.tags.some(t => t.toLowerCase() === tag.toLowerCase())
          ).length;
          if (entry.tags.length > 0 || targetEntry.tags.length > 0) {
            similarity += (commonTags / Math.max(entry.tags.length, targetEntry.tags.length)) * 0.2;
          }
        }
        
        return { ...entry, similarity };
      })
      .filter(entry => entry.similarity > 0.2) // Umbral más bajo
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10);

    console.log(`✅ Encontradas ${similarEntries.length} entradas similares`);
    return similarEntries;
    
  } catch (error) {
    console.error('❌ Error buscando similares:', error);
    
    // Fallback: similitud básica por emoción e intensidad
    return allEntries
      .filter(entry => entry.id !== targetEntry.id)
      .map(entry => {
        let similarity = 0;
        
        // Misma emoción
        if (entry.emotion.id === targetEntry.emotion.id) {
          similarity += 0.5;
        }
        
        // Intensidad similar
        const intensityDiff = Math.abs(
          (entry.emotion.intensity || 5) - (targetEntry.emotion.intensity || 5)
        );
        similarity += (1 - intensityDiff / 10) * 0.3;
        
        // Tags comunes
        if (entry.tags && targetEntry.tags) {
          const commonTags = entry.tags.filter(tag =>
            targetEntry.tags.includes(tag)
          ).length;
          if (commonTags > 0) {
            similarity += 0.2;
          }
        }
        
        return { ...entry, similarity };
      })
      .filter(entry => entry.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }
};

/**
 * 💡 Generar sugerencias de búsqueda
 */
export const generateSearchSuggestions = async (entries) => {
  try {
    if (entries.length === 0) return [];

    // Analizar las últimas 10 entradas
    const recentEntries = entries.slice(0, Math.min(10, entries.length));
    const entriesSummary = recentEntries.map(e => ({
      title: e.title || 'Sin título',
      emotion: e.emotion.id,
      date: new Date(e.entryDate).toLocaleDateString('es-ES')
    }));

    const prompt = `
Basándote en estas entradas recientes de un diario emocional, sugiere 5 consultas de búsqueda interesantes que el usuario podría querer hacer:

${JSON.stringify(entriesSummary, null, 2)}

Proporciona SOLO las consultas, una por línea, sin numeración, viñetas ni formato adicional.
Ejemplos de formato correcto:
momentos de felicidad
días difíciles en el trabajo
logros personales
reflexiones sobre la familia
cambios emocionales recientes
`;

    const text = await generateWithFallback(prompt);
    
    const suggestions = text
      .split('\n')
      .map(line => line.replace(/^[-•*\d.)\]]\s*/g, '').trim())
      .filter(line => line.length > 5 && line.length < 60)
      .filter(line => !line.toLowerCase().startsWith('ejemplo'))
      .slice(0, 5);

    console.log('💡 Sugerencias generadas:', suggestions);

    return suggestions.length > 0 ? suggestions : getDefaultSuggestions(entries);
    
  } catch (error) {
    console.error('❌ Error generando sugerencias:', error);
    return getDefaultSuggestions(entries);
  }
};

/**
 * 📋 Sugerencias por defecto basadas en datos reales
 */
const getDefaultSuggestions = (entries) => {
  const suggestions = [];
  
  // Analizar emociones más frecuentes
  const emotionCount = {};
  entries.forEach(entry => {
    emotionCount[entry.emotion.id] = (emotionCount[entry.emotion.id] || 0) + 1;
  });
  
  const topEmotions = Object.entries(emotionCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([emotion]) => emotion);
  
  // Generar sugerencias basadas en datos
  if (topEmotions.includes('feliz')) {
    suggestions.push('momentos de felicidad');
  }
  if (topEmotions.includes('triste')) {
    suggestions.push('días difíciles');
  }
  if (topEmotions.includes('ansioso')) {
    suggestions.push('situaciones de ansiedad');
  }
  
  // Sugerencias genéricas útiles
  suggestions.push('logros personales');
  suggestions.push('reflexiones importantes');
  suggestions.push('cambios emocionales');
  
  return suggestions.slice(0, 5);
};

/**
 * 🏷️ Auto-generar tags con IA
 */
export const generateTags = async (title, content, emotion) => {
  try {
    const prompt = `
Analiza esta entrada de diario y genera 3-5 tags relevantes y concisos:

Título: ${title || 'Sin título'}
Contenido: ${content.substring(0, 500)}
Emoción: ${emotion}

Proporciona SOLO los tags separados por comas, sin numeración ni formato adicional.
Ejemplo: trabajo, estrés, familia, salud, ejercicio
`;

    const text = await generateWithFallback(prompt);
    
    const tags = text
      .replace(/```/g, '')
      .split(/[,\n]/)
      .map(tag => tag.replace(/^[-•*\d.)\]]\s*/g, '').trim())
      .filter(tag => tag.length > 0 && tag.length < 20)
      .filter(tag => !tag.toLowerCase().includes('ejemplo'))
      .slice(0, 5);

    console.log('🏷️ Tags generados:', tags);
    return tags;
    
  } catch (error) {
    console.error('❌ Error generando tags:', error);
    
    // Fallback: extraer palabras clave del contenido
    const words = content.toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 4)
      .slice(0, 5);
    
    return words;
  }
};