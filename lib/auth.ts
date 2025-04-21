// Funciones de utilidad para la autenticación

import axios from 'axios';
import { login as apiLogin, logout as apiLogout } from './api';

// Función para verificar si el usuario está autenticado
export const isAuthenticated = (): boolean => {
  // En el cliente, verificamos si existe la cookie
  if (typeof window !== 'undefined') {
    // Obtener todas las cookies
    const cookies = document.cookie.split(';');
    console.log('Todas las cookies:', cookies);
    
    // Buscar la cookie de autenticación
    const hasAuthCookie = cookies.some(cookie => {
      const trimmedCookie = cookie.trim();
      console.log('Verificando cookie:', trimmedCookie);
      return trimmedCookie.startsWith('auth_token=') || trimmedCookie.startsWith('token=');
    });
    
    console.log('¿Autenticado?', hasAuthCookie);
    return hasAuthCookie;
  }
  return false;
};

// Función para obtener el token desde las cookies
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const cookies = document.cookie.split(';');
    
    // Primero intentamos con auth_token
    let tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
    
    // Si no encontramos auth_token, intentamos con token
    if (!tokenCookie) {
      tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
    }
    
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }
  }
  return null;
};

// Función para manejar el inicio de sesión
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await apiLogin(email, password);
    console.log('Respuesta de login:', response);
    // La cookie se establece automáticamente por el backend
    return response;
  } catch (error) {
    console.error('Error durante el inicio de sesión:', error);
    throw error;
  }
};

// Función para cerrar sesión
export const logoutUser = async () => {
  try {
    await apiLogout();
    // La cookie se eliminará automáticamente por el backend
    // Redirigir a la página de inicio de sesión
    window.location.href = '/login';
  } catch (error) {
    console.error('Error durante el cierre de sesión:', error);
    throw error;
  }
};

// Función para verificar y renovar el token si es necesario
export const checkAndRefreshToken = async () => {
  try {
    // Esto dependerá de tu implementación de backend
    // Aquí puedes verificar si el token está a punto de expirar y renovarlo
    const response = await axios.post(
      'http://localhost:2300/api/auth/refresh',
      {},
      { withCredentials: true }
    );
    console.log('Token refrescado:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al renovar el token:', error);
    // Si hay un error, redirigir a login
    window.location.href = '/login';
  }
}; 