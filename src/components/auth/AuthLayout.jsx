// src/components/auth/AuthLayout.jsx
'use client';

import React from 'react';
import {Sparkles } from 'lucide-react';
import Image from "next/image";

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-80 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-80 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-80 animate-blob animation-delay-4000"></div>
      </div>

      {/* Contenedor principal */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-lg">
            <Image
              src="/logo.png"
              alt="Logo del sitio"
              width={256}
              height={256}
              className="rounded-lg"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            {title}
            <Sparkles className="w-6 h-6 text-purple-500" />
          </h1>
          {subtitle && (
            <p className="text-gray-600">{subtitle}</p>
          )}
        </div>

        {/* Tarjeta de contenido */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Tu espacio seguro para el bienestar emocional
        </p>
      </div>

      {/* Estilos para animación */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;