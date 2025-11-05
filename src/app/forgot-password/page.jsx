// src/app/forgot-password/page.jsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send, AlertCircle, CheckCircle } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import { resetPassword } from '@/services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const result = await resetPassword(email);
    
    if (result.success) {
      setSuccess(true);
      setEmail('');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <AuthLayout 
      title="Recuperar contraseña" 
      subtitle="Te enviaremos un enlace para restablecer tu contraseña"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-start gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">¡Correo enviado!</p>
              <p>Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.</p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
                setSuccess(false);
              }}
              required
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="tu@email.com"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Ingresa el correo asociado a tu cuenta
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Enviar enlace de recuperación</span>
            </>
          )}
        </button>

        <Link 
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors mt-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio de sesión</span>
        </Link>
      </form>
    </AuthLayout>
  );
}