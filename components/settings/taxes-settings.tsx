"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Trash2, Edit, Check, X, Percent, MoreHorizontal, PackageSearch, LinkIcon, Search, Tag } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getAllTaxes, createTax, updateTax, deleteTax, getAllProducts, updateProductTax } from "@/lib/api"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"

interface Tax {
  id: number
  name: string
  code: string
  description?: string
  rate: number
  is_percentage: boolean
  applies_to_all: boolean
  country?: string
  region?: string
  active: boolean
  created_at: string
  updated_at: string
}

interface Product {
  id: number
  name: string
  description?: string
  price: number
  stock?: number
  category?: string
  imageUrl?: string
}

export function TaxesSettings() {
  const { toast } = useToast()
  const [taxes, setTaxes] = useState<Tax[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [productSearch, setProductSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openAssignDialog, setOpenAssignDialog] = useState(false)
  const [editingTax, setEditingTax] = useState<Tax | null>(null)
  const [selectedTax, setSelectedTax] = useState<Tax | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [isExempt, setIsExempt] = useState(false)
  const [customRate, setCustomRate] = useState<number | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [isBatchApplying, setIsBatchApplying] = useState(false)
  const [openBatchDialog, setOpenBatchDialog] = useState(false)
  const [batchIsExempt, setBatchIsExempt] = useState(false)
  const [batchCustomRate, setBatchCustomRate] = useState<number | null>(null)
  const [newTax, setNewTax] = useState({
    name: "",
    code: "",
    description: "",
    rate: 0,
    is_percentage: true,
    applies_to_all: true,
    country: "",
    region: "",
    active: true,
  })

  // Cargar impuestos
  useEffect(() => {
    const fetchTaxes = async () => {
      try {
        setIsLoading(true)
        const response = await getAllTaxes()
        if (response && response.data) {
          setTaxes(response.data)
        }
      } catch (error) {
        console.error('Error al cargar impuestos:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los impuestos.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTaxes()
  }, [toast])

  // Cargar productos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        console.log("Iniciando carga de productos...");
        
        const response = await getAllProducts();
        console.log("Respuesta bruta de productos:", response);
        
        // Determinar dónde están los datos de productos
        let productsData = response;
        
        // Si la respuesta es un objeto con una propiedad que contiene los productos
        if (response && typeof response === 'object' && !Array.isArray(response)) {
          // Buscar propiedades comunes donde podrían estar los productos
          if (response.data) productsData = response.data;
          else if (response.products) productsData = response.products;
          else if (response.items) productsData = response.items;
          else if (response.results) productsData = response.results;
        }
        
        // Asegurarse de que productsData sea un array
        if (!Array.isArray(productsData)) {
          console.error("Los datos recibidos no son un array:", productsData);
          setProducts([]);
          toast({
            variant: "destructive",
            title: "Error de formato",
            description: "Los datos de productos no tienen el formato esperado.",
          });
          return;
        }
        
        console.log(`Se encontraron ${productsData.length} productos después de extraer los datos`);
        
        if (productsData.length === 0) {
          setProducts([]);
          return;
        }
        
        // Procesar los productos para asegurar formato uniforme
        const parsedProducts = productsData.map((p: any) => ({
          id: p.id_autoincrement || p.id || Math.random().toString(36).substring(2, 9),
          name: p.name || "Sin nombre",
          category: p.category || "Sin categoría",
          price: typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0,
          stock: typeof p.stock === 'number' ? p.stock : parseInt(p.stock) || 0,
        }));
        
        console.log("Productos procesados:", parsedProducts);
        setProducts(parsedProducts);
        setFilteredProducts(parsedProducts);
      } catch (error) {
        console.error('Error completo al cargar productos:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los productos. Ver consola para detalles.",
        });
        
        // Productos de ejemplo para desarrollo/testing
        const exampleProducts = [
          { id: 1, name: "Producto de ejemplo 1", category: "Ejemplo", price: 10.99, stock: 20 },
          { id: 2, name: "Producto de ejemplo 2", category: "Ejemplo", price: 15.99, stock: 15 },
          { id: 3, name: "Producto de ejemplo 3", category: "Ejemplo", price: 5.99, stock: 30 },
        ];
        setProducts(exampleProducts);
        setFilteredProducts(exampleProducts);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [toast]);

  // Filtrar productos al buscar
  useEffect(() => {
    if (products.length > 0) {
      const filtered = products.filter(
        product => 
          product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(productSearch.toLowerCase())) ||
          (product.category && product.category.toLowerCase().includes(productSearch.toLowerCase()))
      );
      setFilteredProducts(filtered);
    }
  }, [productSearch, products]);

  // Manejar apertura del diálogo para editar
  const handleEditClick = (tax: Tax) => {
    setEditingTax(tax)
    setNewTax({
      name: tax.name,
      code: tax.code,
      description: tax.description || "",
      rate: tax.rate,
      is_percentage: tax.is_percentage,
      applies_to_all: tax.applies_to_all,
      country: tax.country || "",
      region: tax.region || "",
      active: tax.active,
    })
    setOpenDialog(true)
  }

  // Manejar apertura del diálogo para crear
  const handleNewClick = () => {
    setEditingTax(null)
    setNewTax({
      name: "",
      code: "",
      description: "",
      rate: 0,
      is_percentage: true,
      applies_to_all: true,
      country: "",
      region: "",
      active: true,
    })
    setOpenDialog(true)
  }

  // Manejar apertura del diálogo para asignar impuesto a producto
  const handleAssignClick = (tax: Tax) => {
    setSelectedTax(tax)
    setSelectedProduct("")
    setIsExempt(false)
    setCustomRate(null)
    setProductSearch("")
    setFilteredProducts(products)
    console.log("Abriendo modal con", products.length, "productos")
    setOpenAssignDialog(true)
  }

  // Manejar cambio de campos del formulario
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setNewTax((prev) => ({ ...prev, [name]: value }))
  }

  // Manejar cambio de campos especiales
  const handleSpecialChange = (name: string, value: any) => {
    setNewTax((prev) => ({ ...prev, [name]: value }))
  }

  // Manejar guardar impuesto
  const handleSaveTax = async () => {
    try {
      if (newTax.name.trim() === "" || newTax.code.trim() === "") {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Nombre y código son obligatorios.",
        })
        return
      }

      if (newTax.rate < 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "La tasa debe ser un número positivo.",
        })
        return
      }

      const taxData = {
        ...newTax,
        rate: Number(newTax.rate),
      }

      let response
      if (editingTax) {
        // Actualizar impuesto existente
        response = await updateTax(editingTax.id.toString(), taxData)
        toast({
          title: "Impuesto actualizado",
          description: "El impuesto se ha actualizado correctamente.",
        })
      } else {
        // Crear nuevo impuesto
        response = await createTax(taxData)
        toast({
          title: "Impuesto creado",
          description: "El impuesto se ha creado correctamente.",
        })
      }

      // Recargar impuestos
      const updatedResponse = await getAllTaxes()
      if (updatedResponse && updatedResponse.data) {
        setTaxes(updatedResponse.data)
      }

      setOpenDialog(false)
    } catch (error) {
      console.error('Error al guardar impuesto:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el impuesto.",
      })
    }
  }

  // Manejar eliminar impuesto
  const handleDeleteTax = async (id: number) => {
    try {
      await deleteTax(id.toString())
      
      // Actualizar lista de impuestos
      setTaxes(taxes.filter(tax => tax.id !== id))
      
      toast({
        title: "Impuesto eliminado",
        description: "El impuesto se ha eliminado correctamente.",
      })
    } catch (error) {
      console.error('Error al eliminar impuesto:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el impuesto.",
      })
    }
  }

  // Manejar asignación de impuesto a producto
  const handleAssignTax = async () => {
    try {
      if (!selectedTax || !selectedProduct) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes seleccionar un impuesto y un producto.",
        })
        return
      }

      const data = {
        is_exempt: isExempt,
        custom_rate: customRate,
      }

      await updateProductTax(selectedProduct, selectedTax.id, data)
      
      toast({
        title: "Asignación exitosa",
        description: "El impuesto ha sido asignado al producto correctamente.",
      })

      setOpenAssignDialog(false)
    } catch (error) {
      console.error('Error al asignar impuesto:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo asignar el impuesto al producto.",
      })
    }
  }

  // Función para abrir el diálogo de aplicación por lotes
  const handleBatchAssignClick = (tax: Tax) => {
    setSelectedTax(tax)
    setBatchIsExempt(false)
    setBatchCustomRate(null)
    setSelectedProducts([])
    setOpenBatchDialog(true)
  }

  // Función para manejar la selección de múltiples productos
  const handleToggleProduct = (productId: number) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId)
      } else {
        return [...prev, productId]
      }
    })
  }

  // Función para seleccionar/deseleccionar todos los productos
  const handleToggleAllProducts = (checked: boolean) => {
    if (checked) {
      const allProductIds = filteredProducts.map(p => p.id as number)
      setSelectedProducts(allProductIds)
    } else {
      setSelectedProducts([])
    }
  }

  // Función para aplicar un impuesto a múltiples productos
  const handleBatchAssignTax = async () => {
    if (!selectedTax || selectedProducts.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Selecciona al menos un producto para continuar.",
      })
      return
    }

    setIsBatchApplying(true)
    try {
      // Preparar los datos para enviar
      const data: { is_exempt?: boolean; custom_rate?: number } = {}
      
      if (batchIsExempt) {
        data.is_exempt = true
      } else if (batchCustomRate !== null) {
        data.custom_rate = batchCustomRate
      }
      
      // Llamar a la API para aplicar el impuesto a múltiples productos
      await applyTaxToMultipleProducts(
        selectedTax.id,
        selectedProducts,
        data
      )
      
      toast({
        title: "Impuesto aplicado",
        description: `El impuesto se ha aplicado a ${selectedProducts.length} productos.`,
      })
      
      // Cerrar el diálogo y limpiar el estado
      setOpenBatchDialog(false)
      setSelectedProducts([])
      setBatchIsExempt(false)
      setBatchCustomRate(null)
    } catch (error) {
      console.error("Error al aplicar impuesto a múltiples productos:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo aplicar el impuesto a los productos seleccionados.",
      })
    } finally {
      setIsBatchApplying(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Impuestos</h2>
          <p className="text-muted-foreground">Administra los impuestos del sistema</p>
        </div>
        <Button onClick={handleNewClick}>
          <Plus className="mr-2 h-4 w-4" />
          Crear Impuesto
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Impuestos</CardTitle>
            <CardDescription>Lista de impuestos definidos en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <TaxTable 
              taxes={taxes} 
              isLoading={isLoading} 
              onEdit={handleEditClick} 
              onDelete={handleDeleteTax}
              onAssign={handleAssignClick}
              onBatchAssign={handleBatchAssignClick}
            />
          </CardContent>
        </Card>
      )}

      {/* Diálogo para crear/editar impuesto */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{editingTax ? "Editar" : "Crear"} Impuesto</DialogTitle>
            <DialogDescription>
              {editingTax 
                ? "Modifica la información del impuesto existente" 
                : "Ingresa la información para crear un nuevo impuesto"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  value={newTax.name}
                  onChange={handleInputChange}
                  placeholder="IVA, IGTF, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  name="code"
                  value={newTax.code}
                  onChange={handleInputChange}
                  placeholder="VAT, IGTF, etc."
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={newTax.description}
                onChange={handleInputChange}
                placeholder="Descripción detallada del impuesto"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate">Tasa</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="rate"
                    name="rate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newTax.rate}
                    onChange={handleInputChange}
                  />
                  <span className="text-lg">{newTax.is_percentage ? "%" : "$"}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Tipo de tasa</Label>
                <div className="flex h-10 items-center space-x-2">
                  <Switch
                    checked={newTax.is_percentage}
                    onCheckedChange={(checked) => 
                      handleSpecialChange("is_percentage", checked)
                    }
                  />
                  <Label>Porcentaje</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex h-10 items-center space-x-2">
                <Switch
                  checked={newTax.applies_to_all}
                  onCheckedChange={(checked) => 
                    handleSpecialChange("applies_to_all", checked)
                  }
                />
                <Label>Aplicar a todos los productos por defecto</Label>
              </div>
              {!newTax.applies_to_all && (
                <p className="text-xs text-muted-foreground">
                  Este impuesto deberá ser asignado manualmente a productos específicos desde la pestaña de Asignación.
                </p>
              )}
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  name="country"
                  value={newTax.country}
                  onChange={handleInputChange}
                  placeholder="Venezuela"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="region">Región</Label>
                <Input
                  id="region"
                  name="region"
                  value={newTax.region}
                  onChange={handleInputChange}
                  placeholder="Opcional"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex h-10 items-center space-x-2">
                <Switch
                  checked={newTax.active}
                  onCheckedChange={(checked) => 
                    handleSpecialChange("active", checked)
                  }
                />
                <Label>Activo</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveTax} disabled={newTax.name === "" || newTax.code === ""}>
              {editingTax ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para asignar impuesto a un producto */}
      <Dialog open={openAssignDialog} onOpenChange={setOpenAssignDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Asignar Impuesto a Producto</DialogTitle>
            <DialogDescription>
              {selectedTax && `Asigna el impuesto "${selectedTax.name}" a un producto específico`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <div className="flex justify-between mb-2">
                <Label>Productos disponibles: {products.length}</Label>
                <Badge variant="outline">
                  {filteredProducts.length} mostrados
                </Badge>
              </div>

              <Input
                placeholder="Buscar producto..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="mb-4"
              />

              {isLoadingProducts ? (
                <div className="p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-current border-t-transparent text-primary"></div>
                  <p className="mt-2">Cargando productos...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-12 text-center">
                  <PackageSearch className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-2" />
                  <p className="text-muted-foreground">No se encontraron productos</p>
                </div>
              ) : (
                <div className="border rounded-md h-60 overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow 
                          key={product.id}
                          className={selectedProduct === product.id.toString() ? "bg-muted" : ""}
                        >
                          <TableCell>
                            <div className="font-medium truncate">{product.name}</div>
                            <div className="text-xs text-muted-foreground">{product.category}</div>
                          </TableCell>
                          <TableCell>${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant={selectedProduct === product.id.toString() ? "default" : "outline"}
                              onClick={() => setSelectedProduct(product.id.toString())}
                            >
                              {selectedProduct === product.id.toString() ? "Seleccionado" : "Seleccionar"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex h-10 items-center space-x-2">
                <Switch
                  checked={isExempt}
                  onCheckedChange={setIsExempt}
                />
                <Label>Exento de este impuesto</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Si se marca como exento, este producto no tendrá este impuesto aplicado aunque esté asignado.
              </p>
            </div>
            
            {!isExempt && selectedTax?.is_percentage && (
              <div className="space-y-2">
                <Label htmlFor="customRate">Tasa personalizada (opcional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="customRate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={customRate !== null ? customRate : ''}
                    onChange={(e) => setCustomRate(e.target.value ? Number(e.target.value) : null)}
                    placeholder={`Tasa estándar: ${selectedTax?.rate || 0}%`}
                  />
                  <span className="text-lg">%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Deja en blanco para usar la tasa estándar del impuesto.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAssignDialog(false)}>Cancelar</Button>
            <Button onClick={handleAssignTax} disabled={!selectedProduct}>Asignar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nuevo diálogo para asignar impuesto a múltiples productos */}
      <Dialog open={openBatchDialog} onOpenChange={setOpenBatchDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Aplicar Impuesto a Múltiples Productos</DialogTitle>
            <DialogDescription>
              {selectedTax && `Aplica el impuesto "${selectedTax.name}" a varios productos simultáneamente`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-3">
              <Label>Opciones de aplicación</Label>
              <div className="flex space-x-4 items-center">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="batch-exempt"
                    checked={batchIsExempt}
                    onCheckedChange={(checked) => {
                      setBatchIsExempt(checked)
                      if (checked) setBatchCustomRate(null)
                    }}
                  />
                  <Label htmlFor="batch-exempt">Marcar como exentos</Label>
                </div>
                
                {!batchIsExempt && selectedTax?.is_percentage && (
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="batch-custom-rate">Tasa personalizada:</Label>
                    <Input
                      id="batch-custom-rate"
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-24"
                      value={batchCustomRate !== null ? batchCustomRate : ''}
                      onChange={(e) => setBatchCustomRate(e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder={selectedTax ? selectedTax.rate.toString() : ''}
                    />
                    <span>%</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Selecciona productos ({selectedProducts.length} seleccionados)</Label>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="search-products" className="text-sm">Buscar:</Label>
                  <Input 
                    id="search-products"
                    className="w-60"
                    placeholder="Nombre de producto"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="border rounded-md">
                <div className="p-3 border-b flex items-center space-x-2">
                  <Checkbox 
                    id="select-all"
                    checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                    onCheckedChange={handleToggleAllProducts}
                  />
                  <Label htmlFor="select-all">Seleccionar todos</Label>
                </div>
                
                <ScrollArea className="h-60">
                  {isLoadingProducts ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No se encontraron productos
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredProducts.map((product) => (
                        <div key={product.id} className="p-3 flex items-center space-x-2 hover:bg-muted/30">
                          <Checkbox 
                            id={`product-${product.id}`}
                            checked={selectedProducts.includes(product.id as number)}
                            onCheckedChange={() => handleToggleProduct(product.id as number)}
                          />
                          <Label htmlFor={`product-${product.id}`} className="flex flex-col cursor-pointer">
                            <span className="font-medium">{product.name}</span>
                            <span className="text-xs text-muted-foreground">
                              Precio: {product.price}{product.category ? ` • Categoría: ${product.category}` : ''}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenBatchDialog(false)}>Cancelar</Button>
            <Button 
              onClick={handleBatchAssignTax} 
              disabled={selectedProducts.length === 0 || isBatchApplying}
            >
              {isBatchApplying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2"></div>
                  Aplicando...
                </>
              ) : (
                `Aplicar a ${selectedProducts.length} productos`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface TaxTableProps {
  taxes: Tax[]
  isLoading: boolean
  onEdit: (tax: Tax) => void
  onDelete: (id: number) => void
  onAssign: (tax: Tax) => void
  onBatchAssign: (tax: Tax) => void
}

function TaxTable({ taxes, isLoading, onEdit, onDelete, onAssign, onBatchAssign }: TaxTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-muted-foreground">Cargando impuestos...</p>
      </div>
    )
  }

  if (taxes.length === 0) {
    return (
      <div className="flex justify-center items-center h-40 border rounded-md">
        <div className="text-center">
          <Percent className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No hay impuestos configurados</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Nombre</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Tasa</TableHead>
            <TableHead>Aplica a todos</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              </TableCell>
            </TableRow>
          ) : taxes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No se encontraron impuestos. Crea uno para comenzar.
              </TableCell>
            </TableRow>
          ) : (
            taxes.map((tax) => (
              <TableRow key={tax.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{tax.name}</span>
                    {tax.description && (
                      <span className="text-xs text-muted-foreground">{tax.description}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{tax.code}</TableCell>
                <TableCell>
                  {tax.rate}{tax.is_percentage ? '%' : ''}
                </TableCell>
                <TableCell>
                  {tax.applies_to_all ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Sí
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">
                      No
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {tax.active ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Activo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">
                      Inactivo
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(tax)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAssign(tax)}>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Asignar a un producto
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onBatchAssign(tax)}>
                        <PackageSearch className="mr-2 h-4 w-4" />
                        Aplicar a múltiples productos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(tax.id)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
} 