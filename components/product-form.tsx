"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Trash2, Save, ArrowLeft, Upload, Check, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"

const productFormSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  sku: z.string().min(2, {
    message: "SKU must be at least 2 characters.",
  }),
  description: z.string().optional(),
  category: z.string({
    required_error: "Please select a category.",
  }),
  price: z.coerce.number().min(0.01, {
    message: "Price must be greater than 0.",
  }),
  cost: z.coerce.number().min(0, {
    message: "Cost must be a positive number.",
  }),
  stock: z.coerce.number().int().min(0, {
    message: "Stock must be a positive integer.",
  }),
  availableInPos: z.boolean().default(true),
  availableOnline: z.boolean().default(true),
  featured: z.boolean().default(false),
  taxable: z.boolean().default(true),
})

type ProductFormValues = z.infer<typeof productFormSchema>

const defaultValues: Partial<ProductFormValues> = {
  name: "",
  sku: "",
  description: "",
  category: "",
  price: 0,
  cost: 0,
  stock: 0,
  availableInPos: true,
  availableOnline: true,
  featured: false,
  taxable: true,
}

interface ProductFormProps {
  product?: ProductFormValues
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("general")
  const [images, setImages] = useState<string[]>([
    "/placeholder.svg?height=200&width=200",
    "/placeholder.svg?height=200&width=200",
    "/placeholder.svg?height=200&width=200",
  ])
  const [selectedImage, setSelectedImage] = useState<number | null>(0)
  const [isDragging, setIsDragging] = useState(false)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product || defaultValues,
  })

  function onSubmit(data: ProductFormValues) {
    toast({
      title: "Product saved",
      description: "The product has been saved successfully.",
    })
    console.log(data)
    // In a real app, you would save the data to your backend here
    router.push("/products")
  }

  function handleDelete() {
    toast({
      title: "Product deleted",
      description: "The product has been deleted successfully.",
      variant: "destructive",
    })
    // In a real app, you would delete the product from your backend here
    router.push("/products")
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (files && files.length > 0) {
      const newImages = [...images]
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const imageUrl = URL.createObjectURL(file)
        newImages.push(imageUrl)
      }
      setImages(newImages)
      toast({
        title: "Images uploaded",
        description: `${files.length} image(s) uploaded successfully.`,
      })
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const newImages = [...images]
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.type.startsWith("image/")) {
          const imageUrl = URL.createObjectURL(file)
          newImages.push(imageUrl)
        }
      }
      setImages(newImages)
      toast({
        title: "Images uploaded",
        description: `${files.length} image(s) uploaded successfully.`,
      })
    }
  }

  function removeImage(index: number) {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
    if (selectedImage === index) {
      setSelectedImage(newImages.length > 0 ? 0 : null)
    } else if (selectedImage !== null && selectedImage > index) {
      setSelectedImage(selectedImage - 1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/products")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Product
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)}>
            <Save className="mr-2 h-4 w-4" />
            Save Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="inventory">Inventory & Pricing</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <TabsContent value="general" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>General Information</CardTitle>
                      <CardDescription>Basic information about the product.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter product name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SKU</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter SKU" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter product description" className="min-h-32" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="bottled">Bottled Water</SelectItem>
                                <SelectItem value="refill">Water Refill</SelectItem>
                                <SelectItem value="accessories">Accessories</SelectItem>
                                <SelectItem value="services">Services</SelectItem>
                                <SelectItem value="promotions">Promotions</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="inventory" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Inventory & Pricing</CardTitle>
                      <CardDescription>Manage inventory levels and pricing information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price ($)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cost ($)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock Quantity</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="taxable"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Taxable</FormLabel>
                              <FormDescription>Apply taxes to this product</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="availability" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Availability</CardTitle>
                      <CardDescription>Control where this product is available.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="availableInPos"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Available in POS</FormLabel>
                              <FormDescription>Make this product available in the point of sale system</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="availableOnline"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Available Online</FormLabel>
                              <FormDescription>Make this product available in the online store</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="featured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Featured Product</FormLabel>
                              <FormDescription>Highlight this product in featured sections</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </form>
            </Form>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>Upload and manage product images</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedImage !== null && (
                <div className="aspect-square rounded-lg overflow-hidden border">
                  <img
                    src={images[selectedImage] || "/placeholder.svg"}
                    alt="Selected product"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="image-grid">
                {images.map((image, index) => (
                  <div key={index} className="image-item">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Product ${index + 1}`}
                      onClick={() => setSelectedImage(index)}
                    />
                    <div className="overlay">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeImage(index)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {selectedImage === index && (
                      <div className="selected-overlay">
                        <div className="check">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Separator />

              <div
                className={`file-drop-area ${isDragging ? "active" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <ImageIcon className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">Drag and drop images here or click to browse</p>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  id="image-upload"
                  onChange={handleImageUpload}
                />
                <Label htmlFor="image-upload" asChild>
                  <Button variant="secondary">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Images
                  </Button>
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

