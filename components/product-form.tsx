"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Trash2, Save, ArrowLeft, Upload, Check, ImageIcon, X, Loader2 } from "lucide-react"
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
import { createProduct, updateProduct, uploadProductImage, uploadMultipleProductImages, deleteProductImage, getAllTaxes } from "@/lib/api"

// Tipo para impuestos
interface Tax {
  id: number;
  name: string;
  code: string;
  rate: number;
  is_percentage: boolean;
  applies_to_all: boolean;
  active: boolean;
}

// Tipo para relación producto-impuesto
interface ProductTax {
  tax_id: number;
  is_exempt: boolean;
  custom_rate?: number;
}

const productFormSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre del producto debe tener al menos 2 caracteres.",
  }),
  sku: z.string().min(2, {
    message: "El SKU debe tener al menos 2 caracteres.",
  }),
  description: z.string().optional(),
  category: z.string({
    required_error: "Por favor seleccione una categoría.",
  }),
  price: z.coerce.number().min(0.01, {
    message: "El precio debe ser mayor que 0.",
  }),
  cost: z.coerce.number().min(0, {
    message: "El costo debe ser un número positivo.",
  }),
  stock: z.coerce.number().int().min(0, {
    message: "El stock debe ser un número entero positivo.",
  }),
  availableInPos: z.boolean().default(true),
  availableOnline: z.boolean().default(true),
  featured: z.boolean().default(false),
  taxable: z.boolean().default(true),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  id: z.number().optional(),
  taxes: z.array(
    z.object({
      tax_id: z.number(),
      is_exempt: z.boolean().default(false),
      custom_rate: z.number().optional(),
    })
  ).optional(),
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
  metaTitle: "",
  metaDescription: "",
  seoKeywords: "",
}

interface ProductFormProps {
  product?: ProductFormValues
}

interface ProductImage {
  file?: File;
  url: string;
  publicId?: string;
  isUploading?: boolean;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("general")
  const [images, setImages] = useState<ProductImage[]>([
    { url: "/placeholder.svg?height=200&width=200" },
    { url: "/placeholder.svg?height=200&width=200" },
    { url: "/placeholder.svg?height=200&width=200" },
  ])
  const [selectedImage, setSelectedImage] = useState<number | null>(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [taxes, setTaxes] = useState<Tax[]>([])
  const [productTaxes, setProductTaxes] = useState<ProductTax[]>([])
  const [isLoadingTaxes, setIsLoadingTaxes] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      ...defaultValues,
      ...product,
      availableInPos: product?.availableInPos ?? defaultValues.availableInPos,
      availableOnline: product?.availableOnline ?? defaultValues.availableOnline,
      featured: product?.featured ?? defaultValues.featured,
      taxable: product?.taxable ?? defaultValues.taxable,
    },
  })
  useEffect(() => {
    const fetchTaxes = async () => {
      try {
        setIsLoadingTaxes(true)
        const response = await getAllTaxes()
        if (response && response.data) {
          setTaxes(response.data.filter((tax: Tax) => tax.active))
          
          // Si estamos editando un producto, cargar sus impuestos
          if (product?.id && response.data) {
            // En este punto deberíamos tener los impuestos del producto,
            // pero como no tenemos esa información directamente, inicializamos
            // con los impuestos generales que aplican a todos los productos
            const initialProductTaxes = response.data
              .filter((tax: Tax) => tax.applies_to_all)
              .map((tax: Tax) => ({
                tax_id: tax.id,
                is_exempt: false,
                custom_rate: undefined
              }))
            setProductTaxes(initialProductTaxes)
          }
        }
      } catch (error) {
        console.error('Error al cargar impuestos:', error)
      } finally {
        setIsLoadingTaxes(false)
      }
    }

    fetchTaxes()
  }, [product?.id])

  async function onSubmit(data: ProductFormValues) {
    try {
      // Filtrar imágenes de placeholder
      const realImages = images.filter(img => !img.url.includes('placeholder.svg'));
      
      // Validar que haya al menos una imagen
      if (realImages.length === 0) {
        toast({
          title: "Advertencia",
          description: "Por favor, agrega al menos una imagen para el producto.",
          variant: "destructive",
        });
        return;
      }
      
      // Verificar si hay imágenes pendientes de subir
      const pendingUploads = realImages.some(img => img.isUploading);
      if (pendingUploads) {
        toast({
          title: "Imágenes en proceso",
          description: "Por favor, espera a que todas las imágenes terminen de subir.",
          variant: "destructive",
        });
        return;
      }
      
      // Mostrar indicador de carga
      toast({
        title: "Procesando",
        description: "Guardando información del producto...",
      });
      
      // Convertir la categoría a categoryIds (array de números)
      const categoryIds = data.category ? [parseInt(data.category)] : [];
      
      // Incluir la información de impuestos y SEO
      const formData = {
        ...data,
        taxes: productTaxes,
        categoryIds, // Agregar categoryIds como array
        // Las imágenes ya están subidas mediante los endpoints específicos
        imageUrl: realImages.length > 0 ? realImages[0].url : undefined,
        metaTitle: data.metaTitle || "",
        metaDescription: data.metaDescription || "",
        seoKeywords: data.seoKeywords || ""
      };
      
      // Eliminar la propiedad category para no enviarla junto con categoryIds
      delete formData.category;
      
      if (product?.id) {
        // Actualizar producto existente
        updateProduct(product.id.toString(), formData).then(() => {
          toast({
            title: "Producto actualizado",
            description: "El producto ha sido actualizado correctamente.",
          })
          router.push("/products")
        }).catch(error => {
          console.error("Error detallado:", error);
          toast({
            title: "Error",
            description: error.message || "No se pudo actualizar el producto",
            variant: "destructive",
          })
        })
      } else {
        // Crear nuevo producto
        createProduct(formData).then((response) => {
          toast({
            title: "Producto guardado",
            description: "El producto ha sido guardado correctamente.",
          })
          router.push("/products")
        }).catch(error => {
          console.error("Error detallado:", error);
          toast({
            title: "Error",
            description: error.message || "No se pudo crear el producto",
            variant: "destructive",
          })
        })
      }
    } catch (error) {
      console.error("Error al guardar el producto:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el producto",
        variant: "destructive",
      })
    }
  }

  function handleDelete() {
    toast({
      title: "Producto eliminado",
      description: "El producto ha sido eliminado correctamente.",
      variant: "destructive",
    })
    // En una aplicación real, aquí eliminarías el producto de tu backend
    router.push("/products")
  }

  async function uploadImage(file: File, productId?: number) {
    // Si no hay ID de producto, solo agregamos la imagen a la lista temporal
    if (!productId) {
      const imageUrl = URL.createObjectURL(file);
      
      setImages(prev => [
        ...prev,
        { 
          url: imageUrl, 
          file: file,
          isUploading: false
        }
      ]);
      
      return;
    }
    
    // Si hay un ID de producto, subimos la imagen al servidor
    try {
      const imageIndex = images.length;
      
      // Agregar imagen con estado de carga
      setImages(prev => [
        ...prev,
        { 
          url: URL.createObjectURL(file), 
          file: file,
          isUploading: true 
        }
      ]);
      
      // Subir la imagen
      const response = await uploadProductImage(productId, file);
      
      // Actualizar el estado con la imagen subida
      setImages(prev => {
        const updated = [...prev];
        updated[imageIndex] = {
          url: response.imageUrl,
          publicId: response.imagePublicId || response.public_id,
          isUploading: false
        };
        return updated;
      });
      
      return response;
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      
      // Marcar la imagen como fallida
      setImages(prev => {
        const updated = [...prev];
        if (updated[images.length - 1]) {
          updated[images.length - 1].isUploading = false;
        }
        return updated;
      });
      
      toast({
        title: "Error al subir imagen",
        description: error instanceof Error ? error.message : "No se pudo subir la imagen",
        variant: "destructive",
      });
    }
  }

  async function uploadMultipleImages(files: File[], productId?: number) {
    // Si no hay ID de producto, solo agregamos las imágenes a la lista temporal
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      if (!productId) {
        // Agregar imágenes temporalmente con URL de objeto
        const newImages = Array.from(files).map(file => ({
          url: URL.createObjectURL(file),
          file: file,
          isUploading: false
        }));
        
        setImages(prev => [
          ...prev.filter(img => !img.url.includes('placeholder.svg')),
          ...newImages
        ]);
        
        setIsUploading(false);
        return;
      }
      
      // Si hay ID de producto, subir al servidor
      const filesToUpload = Array.from(files);
      
      // Agregar imágenes con estado de carga
      const newImageIndexes: number[] = [];
      
      setImages(prev => {
        const filtered = prev.filter(img => !img.url.includes('placeholder.svg'));
        
        const newImages = filesToUpload.map(file => {
          newImageIndexes.push(filtered.length + newImages.length);
          return {
            url: URL.createObjectURL(file),
            file: file,
            isUploading: true
          };
        });
        
        return [...filtered, ...newImages];
      });
      
      // Subir imágenes en lotes de 5 (máximo permitido por el servidor)
      for (let i = 0; i < filesToUpload.length; i += 5) {
        const batch = filesToUpload.slice(i, i + 5);
        const response = await uploadMultipleProductImages(productId, batch);
        
        // Actualizar estado de las imágenes
        if (response && response.images) {
          setImages(prev => {
            const updated = [...prev];
            
            response.images.forEach((img: any, index: number) => {
              const targetIndex = newImageIndexes[i + index];
              if (updated[targetIndex]) {
                updated[targetIndex] = {
                  url: img.url,
                  publicId: img.publicId,
                  isUploading: false
                };
              }
            });
            
            return updated;
          });
        }
      }
      
      toast({
        title: "Imágenes subidas",
        description: `${filesToUpload.length} imagen(es) subidas correctamente.`,
      });
    } catch (error) {
      console.error("Error al subir imágenes:", error);
      
      // Marcar todas las imágenes como no cargando
      setImages(prev => 
        prev.map(img => ({...img, isUploading: false}))
      );
      
      toast({
        title: "Error al subir imágenes",
        description: error instanceof Error ? error.message : "No se pudieron subir las imágenes",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    await uploadMultipleImages(Array.from(files), product?.id);
    
    // Limpiar el input para permitir subir el mismo archivo nuevamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    // Filtrar solo archivos de imagen
    const imageFiles = Array.from(files).filter(file => file.type.startsWith("image/"));
    
    if (imageFiles.length > 0) {
      await uploadMultipleImages(imageFiles, product?.id);
    }
  }

  async function removeImage(index: number) {
    const imageToRemove = images[index];
    
    // Si es una imagen de placeholder, solo eliminarla del array
    if (imageToRemove.url.includes('placeholder.svg')) {
      const newImages = [...images];
      newImages.splice(index, 1);
      setImages(newImages);
      if (selectedImage === index) {
        setSelectedImage(newImages.length > 0 ? 0 : null);
      } else if (selectedImage !== null && selectedImage > index) {
        setSelectedImage(selectedImage - 1);
      }
      return;
    }
    
    // Si la imagen tiene ID público y producto ID, eliminarla del servidor
    if (imageToRemove.publicId && product?.id) {
      try {
        await deleteProductImage(product.id, imageToRemove.publicId);
        
        // Eliminar del array local
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
        
        if (selectedImage === index) {
          setSelectedImage(newImages.length > 0 ? 0 : null);
        } else if (selectedImage !== null && selectedImage > index) {
          setSelectedImage(selectedImage - 1);
        }
        
        toast({
          title: "Imagen eliminada",
          description: "La imagen ha sido eliminada correctamente.",
        });
      } catch (error) {
        console.error("Error al eliminar la imagen:", error);
        toast({
          title: "Error",
          description: "No se pudo eliminar la imagen",
          variant: "destructive",
        });
      }
    } else {
      // Si no tiene ID público, solo eliminarla del array local
      const newImages = [...images];
      newImages.splice(index, 1);
      setImages(newImages);
      
      if (selectedImage === index) {
        setSelectedImage(newImages.length > 0 ? 0 : null);
      } else if (selectedImage !== null && selectedImage > index) {
        setSelectedImage(selectedImage - 1);
      }
    }
  }

  // Manejar cambios en los impuestos
  const handleTaxChange = (taxId: number, isApplied: boolean) => {
    if (isApplied) {
      // Agregar impuesto
      setProductTaxes(prev => [
        ...prev, 
        { tax_id: taxId, is_exempt: false }
      ])
    } else {
      // Eliminar impuesto
      setProductTaxes(prev => prev.filter(pt => pt.tax_id !== taxId))
    }
  }

  // Manejar cambios en la exención de impuestos
  const handleExemptChange = (taxId: number, isExempt: boolean) => {
    setProductTaxes(prev => 
      prev.map(pt => 
        pt.tax_id === taxId 
          ? { ...pt, is_exempt: isExempt } 
          : pt
      )
    )
  }

  // Manejar cambios en la tasa personalizada
  const handleCustomRateChange = (taxId: number, rate: number | undefined) => {
    setProductTaxes(prev => 
      prev.map(pt => 
        pt.tax_id === taxId 
          ? { ...pt, custom_rate: rate } 
          : pt
      )
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          className="gap-1" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
        <div className="flex gap-2">
          {product && product.id && (
            <Button 
              onClick={handleDelete} 
              variant="destructive" 
              className="gap-1"
            >
              <Trash2 className="h-4 w-4" /> Eliminar
            </Button>
          )}
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            className="gap-1"
          >
            <Save className="h-4 w-4" /> Guardar
          </Button>
        </div>
      </div>

      <Form {...form}>
        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
            <TabsTrigger value="images" className="flex-1">Imágenes</TabsTrigger>
            <TabsTrigger value="attributes" className="flex-1">Atributos</TabsTrigger>
            <TabsTrigger value="taxes" className="flex-1">Impuestos</TabsTrigger>
            <TabsTrigger value="inventory" className="flex-1">Inventario</TabsTrigger>
          </TabsList>
          
          {/* Contenido de la pestaña General */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
                <CardDescription>
                  Información básica del producto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Producto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingrese nombre del producto" {...field} />
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
                        <Input placeholder="Ingrese SKU" {...field} />
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
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Ingrese descripción del producto" className="min-h-32" {...field} />
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
                      <FormLabel>Categoría</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bottled">Agua Embotellada</SelectItem>
                          <SelectItem value="refill">Recarga de Agua</SelectItem>
                          <SelectItem value="accessories">Accesorios</SelectItem>
                          <SelectItem value="services">Servicios</SelectItem>
                          <SelectItem value="promotions">Promociones</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Nueva tarjeta para SEO */}
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle>Información SEO</CardTitle>
                    <CardDescription>
                      Optimiza tu producto para motores de búsqueda
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="metaTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título SEO</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: Agua Purificada Premium | Puravida Store" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Recomendado: 50-60 caracteres para mejor visibilidad en resultados de búsqueda
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="metaDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción SEO</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Breve descripción optimizada para motores de búsqueda" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Recomendado: 150-160 caracteres para mejor visibilidad en resultados de búsqueda
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="seoKeywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Palabras clave</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: agua purificada, agua embotellada, hidratación" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Palabras clave separadas por comas relevantes para este producto
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Contenido de la pestaña de impuestos */}
          <TabsContent value="taxes">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Impuestos</CardTitle>
                <CardDescription>
                  Administra los impuestos aplicables a este producto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 py-4">
                  <div className="flex items-center gap-4">
                    <FormField
                      control={form.control}
                      name="taxable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-full">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Producto Gravable</FormLabel>
                            <FormDescription>
                              Define si este producto está sujeto a impuestos
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {form.watch("taxable") && (
                    <>
                      <Separator className="my-2" />
                      
                      {isLoadingTaxes ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          <span className="ml-2 text-muted-foreground">Cargando impuestos...</span>
                        </div>
                      ) : taxes.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-6 text-center">
                          <h3 className="text-lg font-medium">No hay impuestos configurados</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Debes crear impuestos antes de poder asignarlos a productos
                          </p>
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => router.push('/settings/taxes')}
                          >
                            Ir a Configuración de Impuestos
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Impuestos Aplicables</h3>
                          
                          {taxes.map((tax) => {
                            // Buscar si este impuesto está en la lista de impuestos del producto
                            const productTax = productTaxes.find(pt => pt.tax_id === tax.id);
                            const isApplied = !!productTax;
                            const isExempt = productTax?.is_exempt || false;
                            
                            return (
                              <div key={tax.id} className="rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="font-medium">{tax.name} ({tax.code})</span>
                                    <span className="text-sm text-muted-foreground">
                                      Tasa: {tax.rate}{tax.is_percentage ? '%' : ''}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        id={`tax-${tax.id}`}
                                        checked={isApplied}
                                        onCheckedChange={(checked) => handleTaxChange(tax.id, checked)}
                                      />
                                      <Label htmlFor={`tax-${tax.id}`}>Aplicar</Label>
                                    </div>
                                  </div>
                                </div>
                                
                                {isApplied && (
                                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-l-muted">
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        id={`exempt-${tax.id}`}
                                        checked={isExempt}
                                        onCheckedChange={(checked) => handleExemptChange(tax.id, checked)}
                                      />
                                      <Label htmlFor={`exempt-${tax.id}`}>Exento</Label>
                                    </div>
                                    
                                    {!isExempt && tax.is_percentage && (
                                      <div className="flex items-center space-x-2">
                                        <Label htmlFor={`custom-${tax.id}`}>Tasa personalizada:</Label>
                                        <Input
                                          id={`custom-${tax.id}`}
                                          type="number"
                                          placeholder={`Tasa por defecto (${tax.rate}%)`}
                                          className="w-32"
                                          value={productTax?.custom_rate !== undefined ? productTax.custom_rate : ''}
                                          onChange={(e) => {
                                            const value = e.target.value ? parseFloat(e.target.value) : undefined;
                                            handleCustomRateChange(tax.id, value);
                                          }}
                                        />
                                        <span>%</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* ... existing code ... */}
        </Tabs>
      </Form>
    </div>
  );
}

