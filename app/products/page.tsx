"use client"
import { SidebarNav } from "../../components/sidebar-nav"
import { Header } from "../../components/header"
import { Button } from "@/components/ui/button"
import { Plus, Download, Upload, Edit, Trash2, Eye, MoreHorizontal, Package, PackagePlus, DollarSign, AlertTriangle } from "lucide-react"
import { ProductFilters } from "@/components/product-filters"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/data-table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { getAllProducts, deleteProduct, getAllCategories, createCategory, updateCategory, deleteCategory } from "@/lib/api"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ArrowUpRight } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type Product = {
  id: number
  name: string
  price: number
  stock: number
  category: string
  sku: string
  status: "active" | "inactive"
  image?: string
  availableInPos?: boolean
  availableOnline?: boolean
  categories: Category[]
}

type Category = {
  id: string | number
  name: string
  description?: string
  metaTitle?: string
  metaDescription?: string
  seoKeywords?: string
}

type NewCategory = {
  name: string
  description: string
  metaTitle?: string
  metaDescription?: string
  seoKeywords?: string
}

function ProductStats() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAllProducts()
        // Asegurarse de que data sea un array
        if (Array.isArray(data)) {
          setProducts(data.map((p: any) => ({
            id: p.id_autoincrement || p.id || Math.random().toString(36).substring(2, 9),
            name: p.name || "Sin nombre",
            category: p.category || "Sin categoría",
            price: p.price || 0,
            stock: p.stock || 0,
            sku: p.sku || "",
            status: p.status || "active",
            availableInPos: p.availableInPos || false,
            availableOnline: p.availableOnline || false,
            image: p.images && p.images.length > 0 ? p.images[0] : "/placeholder.svg?height=40&width=40",
            categories: p.Categories || [],
          })))
        } else {
          setProducts([])
        }
      } catch (error) {
        console.error("Error al cargar estadísticas de productos:", error)
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const totalProducts = products.length
  // Usar Array.isArray para asegurarse que products es un array
  const totalValue = Array.isArray(products) 
    ? products.reduce((sum, product) => sum + (product.price * (product.stock || 0)), 0)
    : 0
  const lowStockProducts = products.filter(product => typeof product.stock === 'number' && product.stock < 10).length
  const newProducts = 24 // Valor de demostración

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Productos Totales</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : totalProducts}</div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <span className="text-green-500 dark:text-green-400 flex items-center mr-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              8%
            </span>
            vs mes anterior
          </p>
        </CardContent>
      </Card>
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor de Inventario</CardTitle>
          <DollarSign className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : formatPrice(totalValue)}</div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <span className="text-green-500 dark:text-green-400 flex items-center mr-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              12%
            </span>
            vs mes anterior
          </p>
        </CardContent>
      </Card>
      <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : lowStockProducts}</div>
          <p className="text-xs text-muted-foreground">
            productos con menos de 10 unidades
          </p>
        </CardContent>
      </Card>
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nuevos Productos</CardTitle>
          <PackagePlus className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : newProducts}</div>
          <p className="text-xs text-muted-foreground">
            añadidos este mes
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("products")
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState<NewCategory>({ name: "", description: "" })
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentFilters, setCurrentFilters] = useState(null)

  // Definir fetchProducts dentro del componente pero fuera del useEffect
  const fetchProducts = async (filters: any = null) => {
    try {
      setIsLoading(true)
      const response = await getAllProducts()
      console.log("Respuesta de productos:", response)
      
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
        setError('Formato de datos no válido');
        return;
      }
      
      if (productsData.length === 0) {
        setProducts([])
        setError(null)
        return
      }
      
      const parsedProducts = productsData.map((p: any) => ({
        id: p.id_autoincrement || p.id || Math.random().toString(36).substring(2, 9),
        name: p.name || "Sin nombre",
        category: p.category || "Sin categoría",
        price: p.price || 0,
        stock: p.stock || 0,
        sku: p.sku || "",
        status: p.status || "active",
        availableInPos: p.metadata?.availableInPos || false,
        availableOnline: p.metadata?.availableOnline || false,
        image: p.imageUrl || "/placeholder.svg?height=40&width=40",
        categories: p.Categories || [],
      }))
      
      let filteredProducts = [...parsedProducts];
      
      // Aplicar filtros si existen
      if (filters) {
        // Filtrar por categoría
        if (filters.category && filters.category !== 'all') {
          filteredProducts = filteredProducts.filter(product => {
            // Verificar si el producto tiene categorías y si alguna coincide con el filtro
            if (product.categories && product.categories.length > 0) {
              return product.categories.some((cat: any) => cat.id.toString() === filters.category);
            }
            return product.category === filters.category;
          });
        }
        
        // Filtrar por disponibilidad
        if (filters.availability && filters.availability !== 'all') {
          if (filters.availability === 'pos') {
            filteredProducts = filteredProducts.filter(p => p.availableInPos);
          } else if (filters.availability === 'online') {
            filteredProducts = filteredProducts.filter(p => p.availableOnline);
          }
        }
        
        // Filtrar por inventario
        if (filters.inventory && filters.inventory !== 'all') {
          if (filters.inventory === 'low') {
            filteredProducts = filteredProducts.filter(p => p.stock > 0 && p.stock < 10);
          } else if (filters.inventory === 'out') {
            filteredProducts = filteredProducts.filter(p => p.stock === 0);
          }
        }
        
        // Ordenar productos
        if (filters.sort) {
          switch (filters.sort) {
            case 'name-asc':
              filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
              break;
            case 'name-desc':
              filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
              break;
            case 'price-asc':
              filteredProducts.sort((a, b) => Number(a.price) - Number(b.price));
              break;
            case 'price-desc':
              filteredProducts.sort((a, b) => Number(b.price) - Number(a.price));
              break;
            case 'stock-asc':
              filteredProducts.sort((a, b) => a.stock - b.stock);
              break;
            case 'stock-desc':
              filteredProducts.sort((a, b) => b.stock - a.stock);
              break;
          }
        }
      }
      
      setProducts(filteredProducts)
      setError(null)
    } catch (err) {
      console.error('Error al obtener productos:', err)
      setError('Error al cargar los productos')
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (filters: any) => {
    // Prevenir procesar filtros idénticos para evitar ciclos infinitos
    if (JSON.stringify(filters) === JSON.stringify(currentFilters)) {
      return;
    }
    
    // Establecer los nuevos filtros
    setCurrentFilters(filters);
    
    // Aplicar filtros con un pequeño retraso para evitar múltiples llamadas
    const timeoutId = setTimeout(() => {
      fetchProducts(filters);
    }, 300);
    
    // Limpiar el timeout en la cleanup function
    return () => clearTimeout(timeoutId);
  }

  useEffect(() => {
    // Ahora solo llamamos a fetchProducts
    fetchProducts()
    
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories()
        console.log("Respuesta de categorías:", response)
        
        // Determinar dónde están los datos de categorías
        let categoriesData = response;
        
        // Si la respuesta es un objeto con una propiedad que contiene las categorías
        if (response && typeof response === 'object' && !Array.isArray(response)) {
          // Buscar propiedades comunes donde podrían estar las categorías
          if (response.data) categoriesData = response.data;
          else if (response.categories) categoriesData = response.categories;
          else if (response.items) categoriesData = response.items;
          else if (response.results) categoriesData = response.results;
        }
        
        // Asegurarse de que categoriesData sea un array
        if (!Array.isArray(categoriesData)) {
          console.error("Los datos recibidos no son un array:", categoriesData);
          setCategories([]);
          return;
        }
        
        setCategories(categoriesData)
      } catch (err) {
        console.error('Error al obtener categorías:', err)
        toast({
          title: "Error",
          description: "No se pudieron cargar las categorías",
          variant: "destructive",
        })
      }
    }

    fetchCategories()
  }, [])

  const handleDelete = async (ids: string[]) => {
    try {
      for (const id of ids) {
        await deleteProduct(id)
      }
      // Actualizar la lista de productos después de eliminar
      const response = await getAllProducts()
      
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
        return;
      }
      
      const parsedProducts = productsData.map((p: any) => ({
        id: p.id_autoincrement || p.id || Math.random().toString(36).substring(2, 9),
        name: p.name || "Sin nombre",
        category: p.category || "Sin categoría",
        price: p.price || 0,
        stock: p.stock || 0,
        sku: p.sku || "",
        status: p.status || "active",
        availableInPos: p.availableInPos || false,
        availableOnline: p.availableOnline || false,
        image: p.images && p.images.length > 0 ? p.images[0] : "/placeholder.svg?height=40&width=40",
        categories: p.Categories || [],
      }))
      setProducts(parsedProducts)
      
      toast({
        title: "Productos eliminados",
        description: `${ids.length} producto(s) han sido eliminados.`,
        variant: "destructive",
      })
    } catch (err) {
      console.error('Error al eliminar productos:', err)
      toast({
        title: "Error",
        description: "No se pudieron eliminar los productos",
        variant: "destructive",
      })
    }
  }

  const handleSaveCategory = async () => {
    try {
      if (editCategory) {
        // Actualizar categoría existente
        await updateCategory(editCategory.id.toString(), {
          name: newCategory.name,
          description: newCategory.description,
          metaTitle: newCategory.metaTitle,
          metaDescription: newCategory.metaDescription,
          seoKeywords: newCategory.seoKeywords
        })
        toast({
          title: "Categoría actualizada",
          description: "La categoría ha sido actualizada exitosamente",
        })
      } else {
        // Crear nueva categoría
        await createCategory({
          name: newCategory.name,
          description: newCategory.description,
          metaTitle: newCategory.metaTitle,
          metaDescription: newCategory.metaDescription,
          seoKeywords: newCategory.seoKeywords
        })
        toast({
          title: "Categoría creada",
          description: "La categoría ha sido creada exitosamente",
        })
      }
      
      // Actualizar lista de categorías
      const response = await getAllCategories()
      let categoriesData = response;
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        if (response.data) categoriesData = response.data;
        else if (response.categories) categoriesData = response.categories;
        else if (response.items) categoriesData = response.items;
        else if (response.results) categoriesData = response.results;
      }
      
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData);
      }
      
      // Limpiar formulario
      setNewCategory({ name: "", description: "", metaTitle: "", metaDescription: "", seoKeywords: "" })
      setEditCategory(null)
      setIsDialogOpen(false)
    } catch (err) {
      console.error('Error al guardar categoría:', err)
      toast({
        title: "Error",
        description: "No se pudo guardar la categoría",
        variant: "destructive",
      })
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditCategory(category)
    setNewCategory({
      name: category.name,
      description: category.description || "",
      metaTitle: category.metaTitle || "",
      metaDescription: category.metaDescription || "",
      seoKeywords: category.seoKeywords || ""
    })
    setIsDialogOpen(true)
  }

  const handleDeleteCategory = async (id: string | number) => {
    try {
      await deleteCategory(id.toString())
      
      // Actualizar lista de categorías
      const response = await getAllCategories()
      let categoriesData = response;
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        if (response.data) categoriesData = response.data;
        else if (response.categories) categoriesData = response.categories;
        else if (response.items) categoriesData = response.items;
        else if (response.results) categoriesData = response.results;
      }
      
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData);
      }
      
      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada exitosamente",
        variant: "destructive",
      })
    } catch (err) {
      console.error('Error al eliminar categoría:', err)
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría",
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<Product>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <img 
            src={row.original.image || "/placeholder.svg?height=40&width=40"} 
            alt={row.original.name} 
            width={40} 
            height={40} 
            className="rounded-md object-cover border"
          />
          <span className="line-clamp-2">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "sku",
      header: "SKU",
    },
    {
      accessorKey: "price",
      header: "Precio",
      cell: ({ row }) => {
        const price = parseFloat(row.original.price.toString())
        const formatted = formatPrice(price)
        return <div>{formatted}</div>
      },
    },
    {
      accessorKey: "stock",
      header: "Inventario",
      cell: ({ row }) => {
        const stock = row.original.stock
        const bgClass = stock === 0
          ? "bg-red-100 text-red-800"
          : stock < 10
            ? "bg-yellow-100 text-yellow-800"
            : "bg-green-100 text-green-800"
        
        return (
          <Badge variant="outline" className={`${bgClass} font-medium`}>
            {stock}
          </Badge>
        )
      }
    },
    {
      accessorKey: "categories",
      header: "Categorías",
      cell: ({ row }) => {
        const categories = row.original.categories || []
        if (categories.length === 0) {
          return <span className="text-muted-foreground text-sm">Sin categoría</span>
        }
        return (
          <div className="flex flex-wrap gap-1">
            {categories.slice(0, 2).map((category, i) => (
              <Badge key={i} variant="outline" className="bg-blue-50 text-blue-800">
                {category.name}
              </Badge>
            ))}
            {categories.length > 2 && (
              <Badge variant="outline">+{categories.length - 2}</Badge>
            )}
          </div>
        )
      }
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const product = row.original
        
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menú</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => router.push(`/products/${product.id}`)}
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalles
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(`/products/${product.id}/edit`)}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete([product.id.toString()])}
                  className="cursor-pointer text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    }
  ]

  const categoryColumns: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
    },
    {
      accessorKey: "description",
      header: "Descripción",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const category = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleDeleteCategory(category.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Productos</h1>
              <p className="text-muted-foreground">Administra tu inventario, productos y categorías</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Importar
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <Button className="flex items-center gap-2" onClick={() => router.push("/products/new")}>
                <Plus className="h-4 w-4" />
                Añadir Producto
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <ProductStats />
          </div>

          <div className="mb-6">
            <ProductFilters onFilterChange={handleFilterChange} />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="products">Productos</TabsTrigger>
              <TabsTrigger value="categories">Categorías</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <div className="space-y-4 mb-6">
                {/* Eliminando el duplicado de ProductFilters */}
              </div>
              <DataTable columns={columns} data={products} searchKey="name" onDelete={handleDelete} />
            </TabsContent>

            <TabsContent value="categories">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Gestión de Categorías</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditCategory(null)
                      setNewCategory({ 
                        name: "", 
                        description: "",
                        metaTitle: "",
                        metaDescription: "",
                        seoKeywords: ""
                      })
                    }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nueva Categoría
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editCategory ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
                      <DialogDescription>
                        {editCategory ? "Actualiza los detalles de la categoría" : "Añade una nueva categoría para tus productos"}
                      </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="general" className="py-4">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="seo">SEO</TabsTrigger>
                      </TabsList>
                      <TabsContent value="general" className="mt-4">
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input
                              id="name"
                              value={newCategory.name}
                              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                              placeholder="Ej: Agua Embotellada"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                              id="description"
                              value={newCategory.description}
                              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                              placeholder="Descripción breve de la categoría"
                            />
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="seo" className="mt-4">
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="metaTitle">Título SEO</Label>
                            <Input
                              id="metaTitle"
                              value={newCategory.metaTitle || ""}
                              onChange={(e) => setNewCategory({ ...newCategory, metaTitle: e.target.value })}
                              placeholder="Ej: Ropa Ecológica | Puravida Store"
                            />
                            <p className="text-xs text-muted-foreground">
                              Recomendado: 50-60 caracteres para mejor visibilidad en resultados de búsqueda
                            </p>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="metaDescription">Descripción SEO</Label>
                            <Textarea
                              id="metaDescription"
                              value={newCategory.metaDescription || ""}
                              onChange={(e) => setNewCategory({ ...newCategory, metaDescription: e.target.value })}
                              placeholder="Descripción optimizada para motores de búsqueda"
                            />
                            <p className="text-xs text-muted-foreground">
                              Recomendado: 150-160 caracteres para mejor visibilidad en resultados de búsqueda
                            </p>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="seoKeywords">Palabras clave</Label>
                            <Input
                              id="seoKeywords"
                              value={newCategory.seoKeywords || ""}
                              onChange={(e) => setNewCategory({ ...newCategory, seoKeywords: e.target.value })}
                              placeholder="Ej: ropa ecológica, sostenible, algodón orgánico"
                            />
                            <p className="text-xs text-muted-foreground">
                              Palabras clave separadas por comas relevantes para esta categoría
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                      <Button onClick={handleSaveCategory}>{editCategory ? "Actualizar" : "Crear"}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <DataTable
                columns={categoryColumns}
                data={categories}
                searchKey="name"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

