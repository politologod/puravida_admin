"use client"
import { useEffect, useState } from "react"
import { SidebarNav } from "../../../components/sidebar-nav"
import { Header } from "../../../components/header"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2, Tag, PackageCheck, Receipt } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { getProductById, getProductTaxes, deleteProduct, getAllTaxes } from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatPrice } from "@/lib/utils"

type Product = {
  id: number | string
  name: string
  description: string
  price: string | number
  stock: number
  imageUrl?: string
  category?: string
  categories?: Array<{ id: string | number, name: string }>
  metadata?: {
    type?: string
    capacity?: string
    material?: string
    [key: string]: any
  }
  createdAt: string
  updatedAt: string
}

type ProductTax = {
  id: number | string
  name: string
  code: string
  rate: number
  is_percentage: boolean
  is_exempt: boolean
  custom_rate?: number
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [productTaxes, setProductTaxes] = useState<ProductTax[]>([])
  const [loading, setLoading] = useState(true)
  const [taxesLoading, setTaxesLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const data = await getProductById(params.id)
        console.log("Producto obtenido:", data)
        
        // Normalizar los datos del producto para manejar diferentes estructuras
        const normalizedProduct = {
          id: data.id,
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.stock,
          imageUrl: data.imageUrl,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          metadata: data.metadata || {},
          // Normalizar la forma en que accedemos a las categorías
          categories: data.Categories || data.categories || []
        }
        
        setProduct(normalizedProduct)
        setError(null)
      } catch (err) {
        console.error("Error al cargar producto:", err)
        setError("Error al cargar los detalles del producto")
        toast({
          title: "Error",
          description: "Error al cargar los detalles del producto. Por favor intente nuevamente.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    const fetchProductTaxes = async () => {
      try {
        setTaxesLoading(true)
        const data = await getProductTaxes(params.id)
        console.log("Impuestos del producto:", data)
        
        // Procesar los datos dependiendo de la estructura de la respuesta
        let taxesData = data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          if (data.data) taxesData = data.data;
          else if (data.taxes) taxesData = data.taxes;
          else if (data.items) taxesData = data.items;
        }
        
        // Si no hay impuestos o el array está vacío, cargar impuestos generales aplicables
        if (!Array.isArray(taxesData) || taxesData.length === 0) {
          console.log("No se encontraron impuestos específicos para el producto, intentando cargar impuestos generales")
          
          try {
            const generalTaxesResponse = await getAllTaxes()
            console.log("Respuesta de impuestos generales:", generalTaxesResponse)
            
            if (generalTaxesResponse && generalTaxesResponse.data) {
              // Filtrar solo impuestos activos que aplican a todos los productos
              const applicableTaxes = generalTaxesResponse.data
                .filter((tax: any) => tax.active && tax.applies_to_all)
                .map((tax: any) => ({
                  id: tax.id,
                  name: tax.name,
                  code: tax.code,
                  rate: tax.rate,
                  is_percentage: tax.is_percentage,
                  is_exempt: false, // Por defecto no exento
                  custom_rate: undefined // Sin tasa personalizada
                }));
              
              console.log("Impuestos generales aplicables:", applicableTaxes)
              setProductTaxes(applicableTaxes)
              return;
            }
          } catch (generalTaxError) {
            console.error("Error al cargar impuestos generales:", generalTaxError)
          }
        }
        
        if (Array.isArray(taxesData)) {
          // Normalizar formato de impuestos para asegurar consistencia
          const normalizedTaxes = taxesData.map((tax: any) => ({
            id: tax.id || tax.tax_id,
            name: tax.name || "Impuesto",
            code: tax.code || "TAX",
            rate: typeof tax.rate === 'number' ? tax.rate : 0,
            is_percentage: tax.is_percentage !== undefined ? tax.is_percentage : true,
            is_exempt: tax.is_exempt !== undefined ? tax.is_exempt : false,
            custom_rate: tax.custom_rate
          }));
          
          console.log("Impuestos normalizados:", normalizedTaxes)
          setProductTaxes(normalizedTaxes)
        } else {
          console.warn("No se pudieron procesar los datos de impuestos:", taxesData)
          setProductTaxes([])
        }
      } catch (err) {
        console.error("Error al cargar impuestos del producto:", err)
        // Intentar cargar impuestos generales como respaldo
        try {
          const generalTaxesResponse = await getAllTaxes()
          if (generalTaxesResponse && generalTaxesResponse.data) {
            const defaultTaxes = generalTaxesResponse.data
              .filter((tax: any) => tax.active)
              .map((tax: any) => ({
                id: tax.id,
                name: tax.name,
                code: tax.code,
                rate: tax.rate,
                is_percentage: tax.is_percentage,
                is_exempt: false,
                custom_rate: undefined
              }));
            
            console.log("Impuestos por defecto como respaldo:", defaultTaxes)
            setProductTaxes(defaultTaxes)
            return;
          }
        } catch (fallbackError) {
          console.error("Error también en la carga de respaldo:", fallbackError)
        }
        setProductTaxes([])
      } finally {
        setTaxesLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
      fetchProductTaxes()
    }
  }, [params.id])

  const handleDelete = async () => {
    if (!product) return
    
    try {
      await deleteProduct(product.id.toString())
      toast({
        title: "Producto eliminado",
        description: `${product.name} ha sido eliminado correctamente.`,
        variant: "destructive",
      })
      router.push("/products")
    } catch (err) {
      console.error("Error al eliminar producto:", err)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Function to determine category based on product data
  const getCategories = () => {
    if (product?.categories && Array.isArray(product.categories) && product.categories.length > 0) {
      return product.categories;
    }
    
    if (product?.category) {
      return [{ id: "1", name: product.category }];
    }
    
    if (product?.metadata?.type) {
      return [{ id: "1", name: product.metadata.type }];
    }

    return [];
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <SidebarNav />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto p-6 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex h-screen bg-background">
        <SidebarNav />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto p-6">
            <div className="flex items-center gap-2 mb-6">
              <Button variant="outline" onClick={() => router.push("/products")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Productos
              </Button>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error || "Producto no encontrado"}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price
  const categories = getCategories()
  const images = [product.imageUrl || "/placeholder.svg?height=400&width=400"]

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.push("/products")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Productos
              </Button>
              <h1 className="text-2xl font-bold">{product.name}</h1>
              {categories.length > 0 && (
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  {categories[0].name}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push(`/products/${product.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar Producto
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Producto
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="general">
                <PackageCheck className="mr-2 h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="categories">
                <Tag className="mr-2 h-4 w-4" />
                Categorías
              </TabsTrigger>
              <TabsTrigger value="taxes">
                <Receipt className="mr-2 h-4 w-4" />
                Impuestos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Imágenes del Producto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="aspect-square rounded-lg overflow-hidden border">
                        <img
                          src={images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {images.map((image, index) => (
                          <div key={index} className="aspect-square rounded-lg overflow-hidden border">
                            <img
                              src={image}
                              alt={`${product.name} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Detalles del Producto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">ID</h3>
                        <p>{product.id}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Descripción</h3>
                        <p>{product.description || "Sin descripción"}</p>
                      </div>

                      {product.metadata && Object.keys(product.metadata).length > 0 && (
                        <>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Especificaciones</h3>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {Object.entries(product.metadata).map(([key, value]) => (
                                typeof value !== 'object' && (
                                  <div key={key}>
                                    <span className="text-sm font-medium">{key}: </span>
                                    <span>{typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value}</span>
                                  </div>
                                )
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Precio</h3>
                          <p className="text-xl font-bold">{formatPrice(price)}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Stock</h3>
                          <p
                            className={`text-xl font-bold ${
                              product.stock === 0
                                ? "text-red-500 dark:text-red-400"
                                : product.stock < 10
                                  ? "text-amber-500 dark:text-amber-400"
                                  : "text-green-500 dark:text-green-400"
                            }`}
                          >
                            {product.stock}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Creado</h3>
                          <p>{new Date(product.createdAt).toLocaleDateString()}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Última Actualización</h3>
                          <p>{new Date(product.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <CardTitle>Categorías del Producto</CardTitle>
                  <CardDescription>Categorías asignadas a este producto</CardDescription>
                </CardHeader>
                <CardContent>
                  {categories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <Badge key={category.id} variant="secondary" className="text-base py-1 px-3">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Este producto no tiene categorías asignadas.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="taxes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Impuestos del Producto</CardTitle>
                </CardHeader>
                <CardContent>
                  {taxesLoading ? (
                    <div className="flex justify-center p-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : productTaxes.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Este producto no tiene impuestos asociados o está exento de impuestos.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {productTaxes.map((tax) => (
                        <div key={tax.id} className="flex justify-between items-center p-2 border-b">
                          <div>
                            <div className="font-medium">{tax.name}</div>
                            <div className="text-sm text-muted-foreground">Código: {tax.code}</div>
                          </div>
                          <div className="flex items-center">
                            {tax.is_exempt ? (
                              <Badge variant="outline" className="bg-green-100 text-green-800">Exento</Badge>
                            ) : (
                              <div className="font-medium">
                                {tax.custom_rate !== undefined 
                                  ? `${tax.custom_rate}${tax.is_percentage ? '%' : ''}`
                                  : `${tax.rate}${tax.is_percentage ? '%' : ''}`}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}