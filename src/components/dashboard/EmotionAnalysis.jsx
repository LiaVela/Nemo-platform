import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EmotionAnalysis = () => {
  const [viewType, setViewType] = useState('line'); // 'line' or 'bar'

  // Datos de ejemplo - En producción vendrán de Firebase
  const emotionData = [
    { day: 'Lun', felicidad: 7, ansiedad: 3, tristeza: 2, calma: 8 },
    { day: 'Mar', felicidad: 8, ansiedad: 2, tristeza: 1, calma: 9 },
    { day: 'Mié', felicidad: 6, ansiedad: 5, tristeza: 4, calma: 5 },
    { day: 'Jue', felicidad: 7, ansiedad: 4, tristeza: 3, calma: 7 },
    { day: 'Vie', felicidad: 9, ansiedad: 2, tristeza: 1, calma: 8 },
    { day: 'Sáb', felicidad: 8, ansiedad: 3, tristeza: 2, calma: 9 },
    { day: 'Dom', felicidad: 7, ansiedad: 4, tristeza: 3, calma: 7 }
  ];

  const handleShare = () => {
    // TODO: Implementar compartir con terapeuta
    alert('Funcionalidad de compartir con terapeuta');
  };

  const handleDownload = () => {
    // TODO: Implementar descarga de reporte
    alert('Descargando reporte PDF...');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Análisis Emocional Semanal
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Seguimiento de tus emociones durante los últimos 7 días
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => setViewType(viewType === 'line' ? 'bar' : 'line')}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm px-3 py-2"
          >
            {viewType === 'line' ? 'Barras' : 'Líneas'}
          </Button>
          <Button
            onClick={handleDownload}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleShare}
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-2"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {viewType === 'line' ? (
            <LineChart data={emotionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="felicidad" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="ansiedad" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ fill: '#f59e0b', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="tristeza" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="calma" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
              />
            </LineChart>
          ) : (
            <BarChart data={emotionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Bar dataKey="felicidad" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ansiedad" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tristeza" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="calma" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">7.4</div>
          <div className="text-xs text-gray-600">Felicidad Promedio</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">3.3</div>
          <div className="text-xs text-gray-600">Ansiedad Promedio</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">2.3</div>
          <div className="text-xs text-gray-600">Tristeza Promedio</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">7.6</div>
          <div className="text-xs text-gray-600">Calma Promedio</div>
        </div>
      </div>
    </div>
  );
};

export default EmotionAnalysis;