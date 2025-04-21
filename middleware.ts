import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas que no requieren autenticación
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  // Verificar si hay cualquiera de las cookies de autenticación posibles
  const authCookie = request.cookies.get('auth_token') || request.cookies.get('token');
  
  const { pathname } = request.nextUrl;
  console.log('Middleware - ruta actual:', pathname);
  console.log('Middleware - cookies:', request.cookies.getAll());
  console.log('Middleware - authCookie:', authCookie);
  
  // Permitir acceso a rutas públicas sin token
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    console.log('Middleware - permitiendo acceso a ruta pública');
    return NextResponse.next();
  }
  
  // Si no hay cookie de autenticación y no es una ruta pública, redirigir a login
  if (!authCookie) {
    console.log('Middleware - redirigiendo a login por falta de autenticación');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Si hay token, permitir acceso
  console.log('Middleware - permitiendo acceso a ruta protegida');
  return NextResponse.next();
}

export const config = {
  // Aplicar middleware a todas las rutas excepto a los archivos estáticos y API
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}; 