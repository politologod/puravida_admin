"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Droplets, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // En una aplicación real, aquí se conectaría con una API para enviar el correo de recuperación
      // Por ahora, simulamos un envío exitoso después de una breve pausa
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsSubmitted(true)
      toast({
        title: "Correo enviado",
        description: "Se ha enviado un enlace de recuperación a tu correo electrónico",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al enviar el correo de recuperación",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-blue-600 dark:bg-blue-700 flex items-center justify-center">
              <Droplets className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Recuperar Contraseña</CardTitle>
          <CardDescription>
            {isSubmitted
              ? "Revisa tu correo electrónico para obtener un enlace de recuperación"
              : "Ingresa tu correo electrónico para recuperar tu contraseña"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar Enlace de Recuperación"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Hemos enviado un correo electrónico a <strong>{email}</strong> con instrucciones para recuperar tu
                contraseña.
              </p>
              <p className="text-muted-foreground">
                Si no recibes el correo en unos minutos, revisa tu carpeta de spam o intenta nuevamente.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setIsSubmitted(false)}>
                Intentar con otro correo
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            <Link
              href="/login"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

