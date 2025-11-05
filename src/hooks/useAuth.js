// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export const useAuth = (requireAuth = false) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // Si se requiere autenticación y no hay usuario, redirigir a login
      if (requireAuth && !currentUser) {
        router.replace('/login');
      }

      // Si NO se requiere autenticación (página de login) y hay usuario, redirigir a dashboard
      if (!requireAuth && currentUser) {
        router.replace('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [requireAuth, router]);

  return { user, loading, isAuthenticated: !!user };
};