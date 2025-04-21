"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Droplets } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/dashboard'
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, isLoading, user } = useAuth()

  // Efecto para redirigir si ya está autenticado
  useEffect(() => {
    // Si el usuario ya está autenticado, redirigir al dashboard o returnUrl
    if (user) {
      console.log("Usuario autenticado, redirigiendo a:", returnUrl);
      router.push(returnUrl);
    }
  }, [user, router, returnUrl]);

  const handleLogin = async () => {
    try {
      // Validaciones básicas
      if (!email || !password) {
        toast({
          title: "Error de inicio de sesión",
          description: "Por favor ingresa tu correo y contraseña",
          variant: "destructive",
        });
        return;
      }

      // Usamos la función login del contexto de autenticación
      await login(email, password);
      
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema POS Puravida 23",
      });
      
      // Usamos setTimeout para asegurar que la redirección ocurra después de que el estado se actualice
      setTimeout(() => {
        console.log("Redirigiendo a:", returnUrl);
        router.push(returnUrl);
      }, 500);
      
    } catch (error) {
      console.error("Error de inicio de sesión:", error);
      if (error instanceof Error) {
        toast({
          title: "Error de inicio de sesión",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error de inicio de sesión",
          description: "Ocurrió un error inesperado",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-blue-600 dark:bg-blue-700 flex items-center justify-center">
              <Droplets className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">PURAVIDA 23</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder al sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            ¿No tienes una cuenta?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Regístrate
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

