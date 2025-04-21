"use client"
import { useEffect, useState } from "react"
import { SidebarNav } from "../../../../components/sidebar-nav"
import { Header } from "../../../../components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { getProductById, updateProduct, getProductTaxes, updateProductTax, getAllCategories } from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { PackageCheck, Tag, Receipt, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

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

type Category = {
  id: string | number
  name: string
  description?: string
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [taxesLoading, setTaxesLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("general")
  const [productTaxes, setProductTaxes] = useState<ProductTax[]>([])
  const [availableCategories, setAvailableCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: "",
    stock: 0,
    metadata: {}
  })

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const data = await getProductById(params.id)
        console.log("Producto obtenido:", data)
        
        // Normalizar los datos
        setFormData({
          id: data.id,
          name: data.name || "",
          description: data.description || "",
          price: data.price || "",
          stock: data.stock || 0,
          category: data.category || "",
          imageUrl: data.imageUrl || "",
          metadata: data.metadata || {}
        })
        
        // Inicializar categorías seleccionadas - Mejorado para manejar diferentes formatos
        console.log("Analizando datos de categorías del producto:", {
          categories: data.categories,
          Categories: data.Categories,
          category: data.category
        })
        
        // Intentar varias estructuras posibles para las categorías
        let categoriesArray = [];
        
        if (data.Categories && Array.isArray(data.Categories)) {
          console.log("Usando Categories (mayúscula):", data.Categories)
          categoriesArray = data.Categories;
        } else if (data.categories && Array.isArray(data.categories)) {
          console.log("Usando categories (minúscula):", data.categories)
          categoriesArray = data.categories;
        } else if (data.category) {
          console.log("Usando categoría individual:", data.category)
          // Si solo hay una categoría como string o objeto
          if (typeof data.category === 'object' && data.category.id) {
            categoriesArray = [data.category];
          } else if (typeof data.category === 'string') {
            // Busca esta categoría en availableCategories para obtener su ID
            const foundCategory = availableCategories.find(c => c.name === data.category);
            if (foundCategory) {
              categoriesArray = [foundCategory];
            }
          }
        }
        
        if (categoriesArray.length > 0) {
          setSelectedCategories(categoriesArray.map(c => (c.id || c).toString()));
        } else {
          console.log("No se encontraron categorías en los datos del producto")
          setSelectedCategories([]);
        }
        
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
        
        if (Array.isArray(taxesData)) {
          setProductTaxes(taxesData)
        } else {
          setProductTaxes([])
        }
      } catch (err) {
        console.error("Error al cargar impuestos del producto:", err)
        setProductTaxes([])
      } finally {
        setTaxesLoading(false)
      }
    }

    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true)
        const data = await getAllCategories()
        console.log("Respuesta bruta de categorías:", data)
        
        // Procesar los datos dependiendo de la estructura de la respuesta
        let categoriesData = data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          // Intentar diferentes estructuras de datos conocidas
          if (data.data) {
            console.log("Usando data.data para categorías:", data.data);
            categoriesData = data.data;
          } else if (data.categories) {
            console.log("Usando data.categories para categorías:", data.categories);
            categoriesData = data.categories;
          } else if (data.Categories) {
            console.log("Usando data.Categories para categorías:", data.Categories);
            categoriesData = data.Categories;
          } else if (data.items) {
            console.log("Usando data.items para categorías:", data.items);
            categoriesData = data.items;
          } else if (data.results) {
            console.log("Usando data.results para categorías:", data.results);
            categoriesData = data.results;
          }
        }
        
        if (Array.isArray(categoriesData)) {
          console.log(`Se encontraron ${categoriesData.length} categorías disponibles`);
          
          // Normalizar formato para garantizar que cada categoría tenga un id y name
          const normalizedCategories = categoriesData.map(cat => {
            if (typeof cat === 'string') {
              return { id: cat, name: cat };
            } else if (typeof cat === 'object' && cat !== null) {
              return {
                id: cat.id || '',
                name: cat.name || cat.label || cat.id || '',
                description: cat.description || ''
              };
            }
            return cat;
          });
          
          setAvailableCategories(normalizedCategories);
        } else {
          console.log("No se encontraron categorías en formato de array");
          setAvailableCategories([]);
        }
      } catch (err) {
        console.error("Error al cargar categorías:", err);
        setAvailableCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    }

    if (params.id) {
      fetchProduct()
      fetchProductTaxes()
      fetchCategories()
    }
  }, [params.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === "price" ? value : parseInt(value) || 0
    }))
  }

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [name]: value
      }
    }))
  }

  const handleSwitchChange = (checked: boolean, name: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [name]: checked
      }
    }))
  }

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  const handleTaxExemptToggle = async (taxId: string | number, isExempt: boolean) => {
    try {
      await updateProductTax(params.id, taxId, { is_exempt: isExempt })
      
      // Actualizar el estado local
      setProductTaxes(prev => 
        prev.map(tax => 
          tax.id === taxId ? { ...tax, is_exempt: isExempt } : tax
        )
      )
      
      toast({
        title: isExempt ? "Producto exento de impuesto" : "Exención eliminada",
        description: `El estado de exención ha sido ${isExempt ? 'aplicado' : 'removido'} correctamente.`,
      })
    } catch (err) {
      console.error("Error al actualizar exención de impuesto:", err)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de exención del impuesto.",
        variant: "destructive",
      })
    }
  }

  const handleTaxRateUpdate = async (taxId: string | number, newRate: number) => {
    try {
      await updateProductTax(params.id, taxId, { custom_rate: newRate })
      
      // Actualizar el estado local
      setProductTaxes(prev => 
        prev.map(tax => 
          tax.id === taxId ? { ...tax, custom_rate: newRate } : tax
        )
      )
      
      toast({
        title: "Tasa personalizada actualizada",
        description: "La tasa de impuesto personalizada ha sido actualizada correctamente.",
      })
    } catch (err) {
      console.error("Error al actualizar tasa personalizada:", err)
      toast({
        title: "Error",
        description: "No se pudo actualizar la tasa personalizada.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      // Verificar datos básicos
      if (!formData.name || !formData.price) {
        toast({
          title: "Error",
          description: "El nombre y precio son obligatorios",
          variant: "destructive",
        })
        setSaving(false)
        return
      }
      
      // Configurar metadatos y datos a actualizar
      const metadata = {
        ...formData.metadata,
        taxable: formData.metadata?.taxable || false,
        availableInPos: formData.metadata?.availableInPos || false,
        availableOnline: formData.metadata?.availableOnline || false,
        featured: formData.metadata?.featured || false
      }
      
      // Preparar los datos para actualizar
      const updateData = {
        ...formData,
        metadata,
        categoryIds: selectedCategories.map(id => parseInt(id))
      }
      
      // Eliminar propiedades innecesarias o no existentes en el API
      delete updateData.category
      delete updateData.categories
      delete updateData.createdAt
      delete updateData.updatedAt
      
      console.log("Actualizando producto con datos:", updateData)
      
      const response = await updateProduct(params.id, updateData)
      console.log("Respuesta de actualización:", response)
      
      toast({
        title: "Éxito",
        description: "Producto actualizado correctamente",
      })
      
      router.push(`/products/${params.id}`)
    } catch (error) {
      console.error("Error al actualizar producto:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
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

  if (error) {
    return (
      <div className="flex h-screen bg-background">
        <SidebarNav />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Editar Producto</h1>
              <p className="text-muted-foreground">Actualizar información del producto</p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Editar Producto</h1>
            <p className="text-muted-foreground">Actualizar información del producto</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
              <TabsList className="grid grid-cols-3 mb-4">
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

              <TabsContent value="general">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Información Básica</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nombre del Producto</Label>
                          <Input 
                            id="name" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleInputChange} 
                            required 
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="price">Precio (USD)</Label>
                          <Input 
                            id="price" 
                            name="price" 
                            type="number" 
                            step="0.01" 
                            min="0" 
                            value={formData.price} 
                            onChange={handleNumberInputChange} 
                            required 
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea 
                          id="description" 
                          name="description" 
                          rows={4} 
                          value={formData.description} 
                          onChange={handleInputChange} 
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Inventario</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="stock">Cantidad en Stock</Label>
                        <Input 
                          id="stock" 
                          name="stock" 
                          type="number" 
                          min="0" 
                          value={formData.stock} 
                          onChange={handleNumberInputChange} 
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="imageUrl">URL de la Imagen</Label>
                        <Input 
                          id="imageUrl" 
                          name="imageUrl" 
                          value={formData.imageUrl || ''} 
                          onChange={handleInputChange} 
                          placeholder="https://ejemplo.com/imagen.jpg" 
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Especificaciones del Producto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Tipo</Label>
                        <Input 
                          id="type" 
                          name="type" 
                          value={formData.metadata?.type || ''} 
                          onChange={handleMetadataChange} 
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="capacity">Capacidad</Label>
                        <Input 
                          id="capacity" 
                          name="capacity" 
                          value={formData.metadata?.capacity || ''} 
                          onChange={handleMetadataChange} 
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="material">Material</Label>
                        <Input 
                          id="material" 
                          name="material" 
                          value={formData.metadata?.material || ''} 
                          onChange={handleMetadataChange} 
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Visibilidad y Configuración</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="availableInPos">Disponible en POS</Label>
                        <Switch 
                          id="availableInPos" 
                          checked={Boolean(formData.metadata?.availableInPos)} 
                          onCheckedChange={(checked) => handleSwitchChange(checked, 'availableInPos')} 
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="availableOnline">Disponible Online</Label>
                        <Switch 
                          id="availableOnline" 
                          checked={Boolean(formData.metadata?.availableOnline)} 
                          onCheckedChange={(checked) => handleSwitchChange(checked, 'availableOnline')} 
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="featured">Producto Destacado</Label>
                        <Switch 
                          id="featured" 
                          checked={Boolean(formData.metadata?.featured)} 
                          onCheckedChange={(checked) => handleSwitchChange(checked, 'featured')} 
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="taxable">Sujeto a Impuestos</Label>
                        <Switch 
                          id="taxable" 
                          checked={Boolean(formData.metadata?.taxable)} 
                          onCheckedChange={(checked) => handleSwitchChange(checked, 'taxable')} 
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="categories">
                <Card>
                  <CardHeader>
                    <CardTitle>Gestión de Categorías</CardTitle>
                    <CardDescription>Asigna este producto a categorías</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {categoriesLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : availableCategories.length > 0 ? (
                      <div className="space-y-4">
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground">Categorías seleccionadas: {selectedCategories.length}</p>
                          {selectedCategories.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedCategories.map(catId => {
                                const catName = availableCategories.find(c => c.id.toString() === catId)?.name || catId;
                                return (
                                  <Badge key={catId} variant="secondary" className="flex items-center gap-1">
                                    {catName}
                                    <X 
                                      className="h-3 w-3 cursor-pointer" 
                                      onClick={() => handleCategoryToggle(catId)}
                                    />
                                  </Badge>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {availableCategories.map((category) => (
                            <div 
                              key={category.id} 
                              className={`flex items-center space-x-2 border p-3 rounded-md hover:bg-muted transition-colors
                                ${selectedCategories.includes(category.id.toString()) 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-input'}`}
                            >
                              <Checkbox 
                                id={`category-${category.id}`}
                                checked={selectedCategories.includes(category.id.toString())}
                                onCheckedChange={() => handleCategoryToggle(category.id.toString())}
                              />
                              <Label 
                                htmlFor={`category-${category.id}`}
                                className="flex flex-col cursor-pointer w-full"
                              >
                                <span className="font-medium">{category.name}</span>
                                {category.description && (
                                  <span className="text-xs text-muted-foreground">{category.description}</span>
                                )}
                              </Label>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-6">
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Información</AlertTitle>
                            <AlertDescription>
                              Las categorías se guardarán cuando actualices el producto. Verifica que las categorías estén correctamente seleccionadas antes de guardar.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-muted-foreground mb-4">No hay categorías disponibles.</p>
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Sin categorías</AlertTitle>
                          <AlertDescription>
                            No se encontraron categorías. Debes crear categorías en la sección de configuración antes de asignarlas a productos.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="taxes">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración de Impuestos</CardTitle>
                    <CardDescription>Gestiona los impuestos aplicables a este producto</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {taxesLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : productTaxes.length > 0 ? (
                      <div className="space-y-4">
                        {productTaxes.map((tax) => (
                          <div key={tax.id} className="p-4 border rounded-lg">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                              <div>
                                <h3 className="font-medium">{tax.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Código: {tax.code}
                                </p>
                              </div>
                              
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <Checkbox 
                                    id={`exempt-${tax.id}`}
                                    checked={tax.is_exempt}
                                    onCheckedChange={(checked) => 
                                      handleTaxExemptToggle(tax.id, Boolean(checked))
                                    }
                                  />
                                  <Label htmlFor={`exempt-${tax.id}`}>Exento de este impuesto</Label>
                                </div>
                                
                                {!tax.is_exempt && (
                                  <div className="grid grid-cols-2 gap-2 items-center">
                                    <Label htmlFor={`custom-rate-${tax.id}`}>Tasa personalizada:</Label>
                                    <div className="flex items-center">
                                      <Input 
                                        id={`custom-rate-${tax.id}`}
                                        type="number"
                                        min="0"
                                        step={tax.is_percentage ? "0.01" : "1"}
                                        value={tax.custom_rate !== undefined ? tax.custom_rate : tax.rate}
                                        onChange={(e) => handleTaxRateUpdate(tax.id, parseFloat(e.target.value))}
                                        className="w-20 mr-2"
                                      />
                                      <span>{tax.is_percentage ? '%' : ''}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No hay impuestos asociados a este producto.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push(`/products/${params.id}`)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}