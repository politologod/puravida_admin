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
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"

const userFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.string({
    required_error: "Please select a role.",
  }),
  status: z.boolean().default(true),
  notes: z.string().optional(),
})

type UserFormValues = z.infer<typeof userFormSchema>

const defaultValues: Partial<UserFormValues> = {
  name: "",
  email: "",
  phone: "",
  address: "",
  role: "Customer",
  status: true,
  notes: "",
}

interface UserFormProps {
  user?: any
}

export function UserForm({ user }: UserFormProps) {
  const router = useRouter()
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null)

  // Convert the user data to match our form schema
  const userValues = user
    ? {
        ...user,
        status: user.status === "active",
      }
    : defaultValues

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: userValues,
  })

  function onSubmit(data: UserFormValues) {
    toast({
      title: "User saved",
      description: "The user has been saved successfully.",
    })
    console.log(data)
    // In a real app, you would save the data to your backend here
    router.push("/users")
  }

  function handleDelete() {
    toast({
      title: "User deleted",
      description: "The user has been deleted successfully.",
      variant: "destructive",
    })
    // In a real app, you would delete the user from your backend here
    router.push("/users")
  }

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setAvatar(imageUrl)
      toast({
        title: "Avatar uploaded",
        description: "The avatar has been uploaded successfully.",
      })
    }
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
            <CardDescription>Upload a profile picture for this user</CardDescription>
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
                Upload Avatar
              </label>
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Enter the user's personal and account information</CardDescription>
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
                            <Input placeholder="Enter full name" {...field} />
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
                            <Input placeholder="Enter email address" {...field} />
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
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} />
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Admin">Admin</SelectItem>
                              <SelectItem value="Staff">Staff</SelectItem>
                              <SelectItem value="Customer">Customer</SelectItem>
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
                          <Input placeholder="Enter address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter notes about this user" className="min-h-32" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active Status</FormLabel>
                          <FormDescription>Set whether this user account is active or inactive</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
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

