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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Configuración de Impuestos</h2>
          <p className="text-muted-foreground">
            Administra los diferentes tipos de impuestos aplicables a productos y servicios
          </p>
        </div>
        
        <Button onClick={handleNewClick}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Impuesto
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="active">Activos</TabsTrigger>
          <TabsTrigger value="inactive">Inactivos</TabsTrigger>
          <TabsTrigger value="assign">Asignación</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <TaxTable 
            taxes={taxes} 
            isLoading={isLoading} 
            onEdit={handleEditClick} 
            onDelete={handleDeleteTax} 
            onAssign={handleAssignClick}
          />
        </TabsContent>
        
        <TabsContent value="active" className="mt-4">
          <TaxTable 
            taxes={taxes.filter(tax => tax.active)} 
            isLoading={isLoading} 
            onEdit={handleEditClick} 
            onDelete={handleDeleteTax} 
            onAssign={handleAssignClick}
          />
        </TabsContent>
        
        <TabsContent value="inactive" className="mt-4">
          <TaxTable 
            taxes={taxes.filter(tax => !tax.active)} 
            isLoading={isLoading} 
            onEdit={handleEditClick} 
            onDelete={handleDeleteTax} 
            onAssign={handleAssignClick}
          />
        </TabsContent>

        <TabsContent value="assign" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Asignación de Impuestos a Productos</CardTitle>
              <CardDescription>
                Asigna impuestos específicos a productos individuales cuando no aplican a todos los productos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {taxes.filter(tax => !tax.applies_to_all && tax.active).length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No hay impuestos específicos disponibles para asignar. Los impuestos configurados se aplican automáticamente a todos los productos.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    La siguiente tabla muestra los impuestos que pueden ser asignados a productos específicos:
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Tasa</TableHead>
                        <TableHead>País/Región</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taxes
                        .filter(tax => !tax.applies_to_all && tax.active)
                        .map((tax) => (
                          <TableRow key={tax.id}>
                            <TableCell className="font-medium">{tax.name}</TableCell>
                            <TableCell>{tax.code}</TableCell>
                            <TableCell>{tax.rate}{tax.is_percentage ? '%' : ''}</TableCell>
                            <TableCell>{tax.country || "Global"}{tax.region ? ` / ${tax.region}` : ''}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" onClick={() => handleAssignClick(tax)}>
                                <LinkIcon className="mr-2 h-4 w-4" />
                                Asignar a Producto
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo para crear/editar impuesto */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingTax ? "Editar Impuesto" : "Nuevo Impuesto"}
            </DialogTitle>
            <DialogDescription>
              {editingTax 
                ? "Actualiza la información del impuesto" 
                : "Completa los detalles para crear un nuevo impuesto"}
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
            <Button 
              variant="outline" 
              onClick={() => setOpenDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveTax}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para asignar impuesto a producto */}
      <Dialog open={openAssignDialog} onOpenChange={setOpenAssignDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Asignar Impuesto a Producto
            </DialogTitle>
            <DialogDescription>
              {selectedTax ? (
                <div>
                  Asignar <span className="font-medium">{selectedTax.name} ({selectedTax.rate}{selectedTax.is_percentage ? '%' : '$'})</span> a un producto
                </div>
              ) : "Selecciona un impuesto y un producto para asignarlos"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
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
            <Button 
              variant="outline" 
              onClick={() => setOpenAssignDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleAssignTax} disabled={!selectedProduct}>Asignar</Button>
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
}

function TaxTable({ taxes, isLoading, onEdit, onDelete, onAssign }: TaxTableProps) {
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
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Tasa</TableHead>
            <TableHead>Aplica a todos</TableHead>
            <TableHead>País/Región</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {taxes.map((tax) => (
            <TableRow key={tax.id}>
              <TableCell className="font-medium">{tax.name}</TableCell>
              <TableCell>{tax.code}</TableCell>
              <TableCell>{tax.rate}{tax.is_percentage ? '%' : ''}</TableCell>
              <TableCell>
                {tax.applies_to_all ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    <Check className="h-3 w-3 mr-1" />
                    Sí
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <X className="h-3 w-3 mr-1" />
                    No
                  </Badge>
                )}
              </TableCell>
              <TableCell>{tax.country || "Global"}{tax.region ? ` / ${tax.region}` : ''}</TableCell>
              <TableCell>
                {tax.active ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Activo
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    Inactivo
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(tax)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    {!tax.applies_to_all && tax.active && (
                      <DropdownMenuItem onClick={() => onAssign(tax)}>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Asignar a Producto
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => onDelete(tax.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 