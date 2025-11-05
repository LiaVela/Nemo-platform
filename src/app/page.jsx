// src/app/page.jsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Usuario autenticado -> Dashboard
        router.replace('/dashboard');
      } else {
        // Usuario no autenticado -> Login
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Mostrar loading mientras redirige
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">NEMO</h2>
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  );
}