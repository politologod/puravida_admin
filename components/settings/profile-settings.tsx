"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Save, Upload, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { getUser, updateUser } from "@/lib/api"
import { useAuth } from "@/context/auth-context"

const profileFormSchema = z
  .object({
    name: z.string().min(2, {
      message: "El nombre debe tener al menos 2 caracteres.",
    }),
    email: z.string().email({
      message: "Por favor, introduce un email válido.",
    }),
    phone: z.string().optional(),
    address: z.string().optional(),
    password: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && !data.password) {
        return false
      }
      return true
    },
    {
      message: "Se requiere la contraseña actual para establecer una nueva contraseña",
      path: ["password"],
    },
  )
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword !== data.confirmPassword) {
        return false
      }
      return true
    },
    {
      message: "Las contraseñas no coinciden",
      path: ["confirmPassword"],
    },
  )

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileSettings() {
  const { user: authUser, updateUserData } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  })

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        
        // Si ya tenemos los datos del usuario en el contexto de autenticación, los usamos
        if (authUser) {
          form.reset({
            name: authUser.name || "",
            email: authUser.email || "",
            phone: authUser.phone || "",
            address: authUser.address || "",
          })
          
          // Establecer avatar si existe
          if (authUser.profilePicture) {
            setAvatar(authUser.profilePicture)
          }
        } 
        // Si no, intentamos obtenerlos de la API
        else {
          const userData = await getUser()
          
          // Comprobar si userData es un array o un objeto
          const user = Array.isArray(userData) ? userData[0] : userData
          
          if (user) {
            form.reset({
              name: user.name || "",
              email: user.email || "",
              phone: user.phone || "",
              address: user.address || "",
            })
            
            // Establecer avatar si existe
            if (user.profilePicture) {
              setAvatar(user.profilePicture)
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del usuario",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [authUser, form])

  async function onSubmit(data: ProfileFormValues) {
    try {
      setIsLoading(true)
      
      // Preparar los datos para actualizar
      const updateData: any = {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        address: data.address || undefined,
      }
      
      // Si se proporciona una nueva contraseña, la incluimos
      if (data.newPassword) {
        updateData.password = data.newPassword
      }
      
      // Si hay un avatar nuevo, lo incluimos
      if (avatar && avatar !== authUser?.profilePicture) {
        updateData.profilePicture = avatar
      }
      
      // Obtener el ID del usuario (asumiendo que está disponible en el contexto de autenticación)
      const userId = authUser?.id
      
      if (userId) {
        await updateUser(String(userId), updateData)
        
        // Actualizar también los datos en el contexto de autenticación si está disponible
        if (updateUserData) {
          updateUserData({
            ...authUser,
            ...updateData,
          })
        }
        
        toast({
          title: "Perfil actualizado",
          description: "Tu perfil ha sido actualizado correctamente.",
        })
      } else {
        throw new Error("No se pudo obtener el ID del usuario")
      }
    } catch (error) {
      console.error("Error al actualizar el perfil:", error)
    toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
    })
    } finally {
      setIsLoading(false)
    }
  }

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setAvatar(imageUrl)
      toast({
        title: "Avatar cargado",
        description: "Tu avatar ha sido cargado correctamente. Guarda los cambios para aplicar.",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Foto de Perfil</CardTitle>
            <CardDescription>Actualiza tu foto de perfil</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage src={avatar || ""} alt="Avatar" />
              <AvatarFallback className="text-4xl">
                {form.watch("name") ? form.watch("name").charAt(0) : <User />}
              </AvatarFallback>
            </Avatar>

            <Input type="file" accept="image/*" className="hidden" id="avatar-upload" onChange={handleAvatarUpload} />
            <Button variant="outline" asChild>
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Subir Imagen
              </label>
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Actualiza tu información personal</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Introduce tu nombre" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Introduce tu email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            <Input placeholder="Introduce tu número de teléfono" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  <FormField
                    control={form.control}
                      name="address"
                    render={({ field }) => (
                      <FormItem>
                          <FormLabel>Dirección</FormLabel>
                        <FormControl>
                            <Input placeholder="Introduce tu dirección" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>Actualiza tu contraseña</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña Actual</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Introduce tu contraseña actual" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nueva Contraseña</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Introduce la nueva contraseña" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirma la nueva contraseña" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

