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
import { getAllProducts, deleteProduct } from "@/lib/api"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight } from "lucide-react"
import { formatPrice } from "@/lib/utils"

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

  useEffect(() => {
    const fetchProducts = async () => {
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
          availableInPos: p.availableInPos || false,
          availableOnline: p.availableOnline || false,
          image: p.images && p.images.length > 0 ? p.images[0] : "/placeholder.svg?height=40&width=40",
        }))
        
        setProducts(parsedProducts)
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

    fetchProducts()
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

  const columns: ColumnDef<Product>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todo"
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
      accessorKey: "image",
      header: "Imagen",
      cell: ({ row }) => (
        <img
          src={row.getValue("image") || "/placeholder.svg"}
          alt={row.getValue("name")}
          className="w-10 h-10 rounded-md object-cover"
        />
      ),
    },
    {
      accessorKey: "name",
      header: "Nombre",
    },
    {
      accessorKey: "category",
      header: "Categoría",
      cell: ({ row }) => {
        const category = row.getValue("category") as string
        return (
          <Badge
            variant="outline"
            className={
              category === "Bottled"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                : category === "Refillable"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : category === "Service"
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
            }
          >
            {category}
          </Badge>
        )
      },
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const stock = row.getValue("stock")
        return typeof stock === "number" ? (
          <span
            className={
              stock === 0
                ? "text-red-500 dark:text-red-400"
                : (stock as number) < 10
                  ? "text-amber-500 dark:text-amber-400"
                  : "text-green-500 dark:text-green-400"
            }
          >
            {stock}
          </span>
        ) : (
          <span className="text-red-500 dark:text-red-400">N/A</span>
        )
      },
    },
    {
      accessorKey: "price",
      header: "Precio",
      cell: ({ row }) => {
        return formatPrice(row.original.price)
      },
    },
    {
      id: "availability",
      header: "Disponibilidad",
      cell: ({ row }) => {
        return (
          <div className="flex flex-col gap-1">
            {row.original.availableInPos && (
              <Badge variant="secondary" className="w-fit text-xs">
                POS
              </Badge>
            )}
            {row.original.availableOnline && (
              <Badge variant="secondary" className="w-fit text-xs">
                Online
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original
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
              <DropdownMenuItem onClick={() => router.push(`/products/${product.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/products/${product.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleDelete([product.id.toString()])}
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
              <p className="text-muted-foreground">Administra tu inventario y productos de e-commerce</p>
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

          <div className="space-y-4 mb-6">
            <ProductFilters />
          </div>

          <DataTable columns={columns} data={products} searchKey="name" onDelete={handleDelete} />
        </div>
      </div>
    </div>
  )
}

