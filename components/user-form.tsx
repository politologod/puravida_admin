"use client"

import type React from "react"
import { useState } from "react"
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
import { createUser, updateUser } from "@/lib/api"

// Esquema para creación de usuario
const createUserSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(["admin", "vendor", "customer"]),
})

// Esquema para actualización de usuario (sin password obligatorio)
const updateUserSchema = createUserSchema.omit({ password: true }).extend({
  password: z.string().min(6).optional().or(z.literal("")),
})

type UserFormValues = z.infer<typeof createUserSchema>

interface UserFormProps {
  user?: any
}

export function UserForm({ user }: UserFormProps) {
  const router = useRouter()
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string>(user?.profilePicture || "")
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(user ? updateUserSchema : createUserSchema),
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
      toast({ title: "Avatar uploaded successfully" })
    } catch (error) {
      toast({
        title: "Error uploading avatar",
        description: "Could not upload image to Cloudinary",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: UserFormValues) => {
    try {
      // Armamos el payload sin incluir campos vacíos
      const userData: any = {
        ...data,
        phone: data.phone || undefined,
        address: data.address || undefined,
      }

      // Solo incluimos profilePicture si se subió una imagen
      if (cloudinaryUrl) {
        userData.profilePicture = cloudinaryUrl
      }

      if (user) {
        await updateUser(user.id, userData)
        toast({ title: "User updated successfully" })
      } else {
        await createUser(userData)
        toast({ title: "User created successfully" })
      }

      router.push("/users")
    } catch (error) {
      toast({
        title: "Error saving user",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    // Implementa la lógica de eliminación según necesites
    router.push("/users")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <div className="flex gap-2">
          {user && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </Button>
          )}
          <Button onClick={form.handleSubmit(onSubmit)}>
            <Save className="mr-2 h-4 w-4" />
            Save User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Avatar</CardTitle>
            <CardDescription>Upload to Cloudinary</CardDescription>
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
                {isUploading ? "Uploading..." : "Upload Avatar"}
              </label>
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Enter user details</CardDescription>
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
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
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
                            <Input placeholder="email@example.com" {...field} />
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
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                              />
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
                          <FormLabel>Phone</FormLabel>
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
                          <FormLabel>Role</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="vendor">Staff</SelectItem>
                              <SelectItem value="customer">Customer</SelectItem>
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
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
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
                Save User
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
