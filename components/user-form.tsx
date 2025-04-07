"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Trash2, Save, ArrowLeft, Upload, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { createUser, updateUser, deleteUser } from "@/lib/api"

const createUserSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, introduce una dirección de correo válida." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(["admin", "vendor", "customer"]),
})

const updateUserSchema = createUserSchema.omit({ password: true }).extend({
  password: z.string().min(6).optional().or(z.literal("")),
})

type UserFormValues = z.infer<typeof createUserSchema>

interface UserFormProps {
  user?: any
  idUser: string
}

export function UserForm({ user, idUser }: UserFormProps) {
  const router = useRouter()
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string>(user?.profilePicture || "")
  const [isUploading, setIsUploading] = useState(false)
  const form = useForm<UserFormValues>({
    resolver: zodResolver(user ? (updateUserSchema as z.ZodType<UserFormValues>) : createUserSchema),
    defaultValues: user
      ? {
          name: user.name,
          email: user.email,
          phone: user.phone || undefined,
          address: user.address || undefined,
          role: user.role,
          password: "", // opcional en actualización
        }
      : {
          name: "",
          email: "",
          password: "",
          phone: undefined,
          address: undefined,
          role: "customer",
        },
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", "your_upload_preset") // Reemplaza con tu preset
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/your_cloud_name/image/upload`, // Reemplaza con tu cloud name
        { method: "POST", body: formData }
      )
      
      const data = await response.json()
      setCloudinaryUrl(data.secure_url)
      toast({ title: "Avatar subido exitosamente" })
    } catch (error) {
      toast({
        title: "Error al subir el avatar",
        description: "No se pudo subir la imagen a Cloudinary",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: UserFormValues) => {
    try {
      const userData: any = {
        ...data,
        phone: data.phone || undefined,
        address: data.address || undefined,
      }

      if (cloudinaryUrl) {
        userData.profilePicture = cloudinaryUrl
      }

      if (user) {
        await updateUser(user.id, userData)
        toast({ title: "Usuario actualizado exitosamente" })
      } else {
        await createUser(userData)
        toast({ title: "Usuario creado exitosamente" })
      }

      router.push("/users")
    } catch (error) {
      toast({
        title: "Error al guardar el usuario",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    }
  }

  // Función para eliminar el usuario
  const handleUserDelete = async () => {
      const response = await deleteUser(idUser)
      if(!response.ok) {
        console.error("Error al eliminar el usuario: ", response)
      }
      console.log("Usuario eliminado exitosamente")
      router.push("/users")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Usuarios
        </Button>
        <div className="flex gap-2">
          {user && (
            <Button variant="destructive" onClick={handleUserDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar Usuario
            </Button>
          )}
          <Button onClick={form.handleSubmit(onSubmit)}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Usuario
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Avatar del Usuario</CardTitle>
            <CardDescription>Subir a Cloudinary</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage src={cloudinaryUrl} alt="Avatar" />
              <AvatarFallback className="text-4xl">
                {form.watch("name")?.[0] || <User />}
              </AvatarFallback>
            </Avatar>

            <Input
              type="file"
              accept="image/*"
              className="hidden"
              id="avatar-upload"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
            <Button variant="outline" asChild disabled={isUploading}>
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? "Subiendo..." : "Subir Avatar"}
              </label>
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información del Usuario</CardTitle>
              <CardDescription>Introduce los detalles del usuario</CardDescription>
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
                            <Input placeholder="Juan Pérez" {...field} />
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
                          <FormLabel>Correo Electrónico</FormLabel>
                          <FormControl>
                            <Input placeholder="correo@ejemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {!user && (
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contraseña</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 234 567 890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rol</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar rol" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="admin">Administrador</SelectItem>
                              <SelectItem value="vendor">Personal</SelectItem>
                              <SelectItem value="customer">Cliente</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Input placeholder="Calle Principal 123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={form.handleSubmit(onSubmit)}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Usuario
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
