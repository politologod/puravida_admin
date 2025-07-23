"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { isAuthenticated, checkAndRefreshToken } from '@/lib/auth';
import { login as apiLogin, logout as apiLogout } from "@/lib/api";
import { useRouter } from 'next/navigation';

// Tipo para el usuario
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
} | null;

// Tipo para el contexto de autenticación
interface AuthContextType {
  user: User;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

// Valor por defecto del contexto
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);

// Proveedor de autenticación
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Verificar la autenticación al cargar el componente
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/verify', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
  
    checkAuth();
  }, []);

  // Función para iniciar sesión
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiLogin(email, password);
      console.log("Respuesta del login:", response);
      
      // Actualizar el estado del usuario
      setUser({
        id: response.user?.id || 1,
        name: response.user?.name || 'Admin',
        email: response.user?.email || email,
        role: response.user?.role || 'admin',
      });

      // Ya no redirigimos aquí, dejamos que la página de login lo maneje
      // Retornamos la respuesta para que la página de login pueda usarla
      return response;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    setIsLoading(true);
    try {
      await apiLogout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
} 