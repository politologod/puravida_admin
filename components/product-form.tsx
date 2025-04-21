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
      
      // Incluir la información de impuestos
      const formData = {
        ...data,
        taxes: productTaxes,
        // Las imágenes ya están subidas mediante los endpoints específicos
        imageUrl: realImages.length > 0 ? realImages[0].url : undefined,
      };
      
      if (product?.id) {
        // Actualizar producto existente
        updateProduct(product.id.toString(), {
          ...formData,
          // Las imágenes ya están subidas mediante los endpoints específicos
          imageUrl: realImages.length > 0 ? realImages[0].url : undefined,
        }).then(() => {
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
        createProduct({
          ...formData,
          // Pasar solo las URLs de las imágenes ya que se subieron previamente
          imageUrl: realImages.length > 0 ? realImages[0].url : undefined,
        }).then((response) => {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/products")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Productos
        </Button>
        <div className="flex gap-2">
          {product?.id && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar Producto
            </Button>
          )}
          <Button onClick={form.handleSubmit(onSubmit)}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Producto
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="inventory">Inventario y Precios</TabsTrigger>
              <TabsTrigger value="taxes">Impuestos</TabsTrigger>
              <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <TabsContent value="general" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Información General</CardTitle>
                      <CardDescription>Información básica del producto.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="inventory" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Inventario y Precios</CardTitle>
                      <CardDescription>Administrar niveles de inventario e información de precios.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Precio de Venta ($)</FormLabel>
                              <FormDescription>Precio al que se venderá el producto</FormDescription>
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
                              <FormLabel>Costo de Adquisición ($)</FormLabel>
                              <FormDescription>Lo que cuesta adquirir el producto</FormDescription>
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
                            <FormLabel>Cantidad en Stock</FormLabel>
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
                              <FormLabel className="text-base">Sujeto a Impuestos</FormLabel>
                              <FormDescription>Aplicar impuestos a este producto</FormDescription>
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

                <TabsContent value="taxes" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuración de Impuestos</CardTitle>
                      <CardDescription>Configura los impuestos aplicables a este producto</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="taxable"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Producto Gravable</FormLabel>
                              <FormDescription>Este producto está sujeto a impuestos</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {isLoadingTaxes ? (
                        <div className="py-4 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          <p className="text-sm text-muted-foreground mt-2">Cargando impuestos...</p>
                        </div>
                      ) : taxes.length === 0 ? (
                        <div className="py-4 text-center border rounded-md">
                          <p className="text-sm text-muted-foreground">No hay impuestos configurados</p>
                          <Button 
                            variant="link" 
                            onClick={() => router.push("/settings/taxes")}
                            className="mt-2"
                          >
                            Ir a configuración de impuestos
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">Impuestos aplicables</h3>
                          
                          {taxes.map(tax => {
                            const isApplied = productTaxes.some(pt => pt.tax_id === tax.id);
                            const productTax = productTaxes.find(pt => pt.tax_id === tax.id);
                            
                            return (
                              <div key={tax.id} className="border rounded-md p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium">{tax.name} ({tax.code})</h4>
                                    <p className="text-sm text-muted-foreground">
                                      Tasa: {tax.rate}% {tax.applies_to_all ? '(Aplica por defecto)' : ''}
                                    </p>
                                  </div>
                                  <Switch 
                                    checked={isApplied} 
                                    onCheckedChange={(checked) => handleTaxChange(tax.id, checked)}
                                    disabled={tax.applies_to_all}
                                  />
                                </div>
                                
                                {isApplied && (
                                  <div className="space-y-4 border-t pt-3">
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-0.5">
                                        <Label>Exento de este impuesto</Label>
                                        <p className="text-xs text-muted-foreground">
                                          Este producto no pagará este impuesto
                                        </p>
                                      </div>
                                      <Switch 
                                        checked={productTax?.is_exempt || false} 
                                        onCheckedChange={(checked) => handleExemptChange(tax.id, checked)}
                                      />
                                    </div>
                                    
                                    {!productTax?.is_exempt && (
                                      <div>
                                        <Label htmlFor={`custom-rate-${tax.id}`}>Tasa personalizada (%)</Label>
                                        <div className="flex items-center mt-1.5 space-x-2">
                                          <Input 
                                            id={`custom-rate-${tax.id}`}
                                            type="number" 
                                            step="0.01"
                                            placeholder={`Tasa estándar (${tax.rate}%)`}
                                            value={productTax?.custom_rate !== undefined ? productTax.custom_rate : ''}
                                            onChange={(e) => {
                                              const value = e.target.value ? parseFloat(e.target.value) : undefined;
                                              handleCustomRateChange(tax.id, value);
                                            }}
                                          />
                                          {productTax?.custom_rate !== undefined && (
                                            <Button 
                                              variant="ghost" 
                                              size="sm"
                                              onClick={() => handleCustomRateChange(tax.id, undefined)}
                                            >
                                              <X className="h-4 w-4" />
                                            </Button>
                                          )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Deja en blanco para usar la tasa estándar
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="availability" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Disponibilidad</CardTitle>
                      <CardDescription>Controle dónde está disponible este producto.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="availableInPos"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Disponible en POS</FormLabel>
                              <FormDescription>Hacer que este producto esté disponible en el sistema de punto de venta</FormDescription>
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
                              <FormLabel className="text-base">Disponible Online</FormLabel>
                              <FormDescription>Hacer que este producto esté disponible en la tienda en línea</FormDescription>
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
                              <FormLabel className="text-base">Producto Destacado</FormLabel>
                              <FormDescription>Destacar este producto en secciones especiales</FormDescription>
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
              <CardTitle>Imágenes del Producto</CardTitle>
              <CardDescription>Sube y administra imágenes del producto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedImage !== null && (
                <div className="aspect-square rounded-lg overflow-hidden border relative">
                  <img
                    src={images[selectedImage]?.url || "/placeholder.svg"}
                    alt="Producto seleccionado"
                    className="w-full h-full object-cover"
                  />
                  {images[selectedImage]?.isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative border rounded-md cursor-pointer overflow-hidden aspect-square">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={`Producto ${index + 1}`}
                      className="w-full h-full object-cover"
                      onClick={() => setSelectedImage(index)}
                    />
                    <div className="absolute top-1 right-1">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeImage(index)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    {image.isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      </div>
                    )}
                    {selectedImage === index && (
                      <div className="absolute bottom-1 right-1 bg-primary text-white rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Separator />

              <div
                className={`file-drop-area ${isDragging ? "active" : ""} border-2 border-dashed rounded-lg p-6 text-center ${isUploading ? "opacity-50" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <ImageIcon className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Arrastra y suelta imágenes aquí o haz clic para seleccionar
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  id="image-upload"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  disabled={isUploading}
                />
                <Label htmlFor="image-upload" asChild>
                  <Button variant="secondary" disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Subir Imágenes
                      </>
                    )}
                  </Button>
                </Label>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                Puedes subir hasta 5 imágenes. La primera imagen será la principal.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

