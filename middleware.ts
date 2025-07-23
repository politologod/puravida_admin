import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas que no requieren autenticación
const publicRoutes = ['/login', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Comprobar si es una ruta pública
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Verificar si hay cualquiera de las cookies de autenticación posibles
  const authCookie = request.cookies.get('auth_token')?.value || request.cookies.get('token')?.value;
  
  // Si no hay cookie de autenticación, redirigir a login
  if (!authCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Si hay token, permitir acceso
  return NextResponse.next();
}

// Configuración de matcher para App Router de Next.js
export const config = {
  matcher: [
    /*
     * Match specific routes that require authentication
     * Exclude API routes, static files, and public routes
     */
    '/((?!_next/|api/|login|forgot-password|reset-password|favicon.ico).*)',
  ],
}; 