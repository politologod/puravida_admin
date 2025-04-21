"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export function useRequireAuth(redirectUrl = '/login') {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Esperar a que se complete la verificación de autenticación
    if (!isLoading && !user) {
      // Si no está autenticado y no está cargando, redirigir a login
      router.push(`${redirectUrl}?returnUrl=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [user, isLoading, router, redirectUrl]);

  return { user, isLoading };
} 