"use client"

import { useState } from "react"
import { SidebarNav } from "../../components/sidebar-nav"
import { Header } from "../../components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Plus, Minus, Trash2, CreditCard, QrCode, Banknote, Edit2, LinkIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Productos disponibles para vender
const products = [
  {
    id: "1",
    name: "Botella de Agua Puravida 5 Galones",
    price: 15.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Agua Embotellada",
    stock: 45,
  },
  {
    id: "2",
    name: "Servicio de Recarga Puravida (5 Galones)",
    price: 8.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Servicio",
    stock: "Ilimitado",
  },
  {
    id: "3",
    name: "Agua Purificada Puravida 1 Galón",
    price: 4.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Agua Embotellada",
    stock: 120,
  },
  {
    id: "4",
    name: "Porta Botella de Agua",
    price: 5.0,
    image: "/placeholder.svg?height=200&width=200",
    category: "Accesorio",
    stock: 30,
  },
  {
    id: "5",
    name: "Dispensador de Agua - De Pie",
    price: 89.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Accesorio",
    stock: 12,
  },
  {
    id: "6",
    name: "Agua Alcalina Puravida 1L (6-Pack)",
    price: 10.59,
    image: "/placeholder.svg?height=200&width=200",
    category: "Agua Embotellada",
    stock: 65,
  },
  {
    id: "7",
    name: "Agua Mineral Puravida 500ml (24-Pack)",
    price: 14.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Agua Embotellada",
    stock: 92,
  },
  {
    id: "8",
    name: "Servicio de Limpieza de Dispensador",
    price: 24.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Servicio",
    stock: "Ilimitado",
  },
]

// Categorías de productos
const categories = [
  { id: "all", name: "Todos los Productos" },
  { id: "bottled", name: "Agua Embotellada" },
  { id: "service", name: "Servicios" },
  { id: "accessory", name: "Accesorios" },
  { id: "promotion", name: "Promociones" },
]

// Clientes
const customers = [
  {
    id: "1",
    name: "Juan Pérez",
    email: "juan@ejemplo.com",
    phone: "+58 412 123 4567",
    address: "Calle Principal 123, Caracas",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "María González",
    email: "maria@ejemplo.com",
    phone: "+58 414 987 6543",
    address: "Avenida Libertador 456, Caracas",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "Carlos Rodríguez",
    email: "carlos@ejemplo.com",
    phone: "+58 416 456 7890",
    address: "Calle Bolívar 789, Caracas",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function VenderPage() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
  const [serviceType, setServiceType] = useState("tienda") // tienda, delivery, recarga

  // Filtrar productos por categoría y búsqueda
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "all" ||
      (activeCategory === "bottled" && product.category === "Agua Embotellada") ||
      (activeCategory === "service" && product.category === "Servicio") ||
      (activeCategory === "accessory" && product.category === "Accesorio") ||
      (activeCategory === "promotion" && product.category === "Promoción")

    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  // Agregar producto al carrito
  const addToCart = (product: any) => {
    const existingItem = cart.find((item) => item.id === product.id)

    if (existingItem) {
      setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }

    toast({
      title: "Producto agregado",
      description: `${product.name} ha sido agregado al carrito.`,
    })
  }

  // Actualizar cantidad de producto en el carrito
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.id !== id))
    } else {
      setCart(cart.map((item) => (item.id === id ? { ...item, quantity } : item)))
    }
  }

  // Eliminar producto del carrito
  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id))

    toast({
      title: "Producto eliminado",
      description: "El producto ha sido eliminado del carrito.",
    })
  }

  // Seleccionar cliente
  const selectCustomer = (customer: any) => {
    setSelectedCustomer(customer)
    setIsCustomerDialogOpen(false)

    toast({
      title: "Cliente seleccionado",
      description: `${customer.name} ha sido seleccionado para esta venta.`,
    })
  }

  // Calcular subtotal, impuestos y total
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const tax = subtotal * 0.16 // 16% IVA
  const total = subtotal + tax

  // Completar venta
  const completeSale = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agregue productos al carrito para completar la venta.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Venta completada",
      description: `Venta por $${total.toFixed(2)} procesada exitosamente.`,
    })

    // Reiniciar carrito y cliente
    setCart([])
    setSelectedCustomer(null)
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-auto p-4">
            <div className="mb-4">
              <h1 className="text-2xl font-bold">Punto de Venta</h1>
              <p className="text-muted-foreground">Vender productos y servicios de agua</p>
            </div>

            {/* Búsqueda de productos */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar productos..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Categorías */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "secondary" : "outline"}
                  onClick={() => setActiveCategory(category.id)}
                  className={
                    activeCategory === category.id
                      ? "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-950 dark:text-blue-400 dark:hover:bg-blue-900"
                      : ""
                  }
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Productos */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => addToCart(product)}
                >
                  <div className="aspect-square relative">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {typeof product.stock === "number" && product.stock < 10 && (
                      <Badge
                        variant="secondary"
                        className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                      >
                        Stock bajo: {product.stock}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm line-clamp-2 h-10">{product.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">${product.price.toFixed(2)}</span>
                      <Badge variant="outline">{product.category}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center p-8">
                  <p className="text-muted-foreground">No se encontraron productos que coincidan con su búsqueda.</p>
                </div>
              )}
            </div>
          </main>

          {/* Carrito */}
          <div className="w-[380px] bg-card border-l dark:border-gray-800 flex flex-col h-full">
            <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{selectedCustomer ? selectedCustomer.name : "Cliente"}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedCustomer ? selectedCustomer.email : "Cliente no seleccionado"}
                </p>
              </div>
              <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Edit2 className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Seleccionar Cliente</DialogTitle>
                    <DialogDescription>Busque y seleccione un cliente para esta venta</DialogDescription>
                  </DialogHeader>

                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input placeholder="Buscar clientes..." className="pl-9" />
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {customers.map((customer) => (
                      <Card
                        key={customer.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => selectCustomer(customer)}
                      >
                        <CardContent className="p-4 flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={customer.avatar} alt={customer.name} />
                            <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">{customer.email}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCustomerDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button>Nuevo Cliente</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="p-4 border-b dark:border-gray-800">
              <div className="flex gap-2 mb-4">
                <Button
                  variant={serviceType === "tienda" ? "secondary" : "outline"}
                  className="flex-1 rounded-full"
                  onClick={() => setServiceType("tienda")}
                >
                  En tienda
                </Button>
                <Button
                  variant={serviceType === "delivery" ? "secondary" : "outline"}
                  className="flex-1 rounded-full"
                  onClick={() => setServiceType("delivery")}
                >
                  Delivery
                </Button>
                <Button
                  variant={serviceType === "recarga" ? "secondary" : "outline"}
                  className="flex-1 rounded-full"
                  onClick={() => setServiceType("recarga")}
                >
                  Recarga
                </Button>
              </div>
              <Button variant="outline" className="w-full flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Vincular a Orden E-commerce
              </Button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {cart.length > 0 ? (
                cart.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 mb-4">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium mb-1">{item.name}</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">${item.price.toFixed(2)}</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm w-6 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay productos en el carrito</p>
                  <p className="text-sm mt-1">Haga clic en un producto para agregarlo</p>
                </div>
              )}
            </div>

            <div className="border-t dark:border-gray-800 p-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA 16%</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button variant="outline" className="flex flex-col items-center py-2">
                  <Banknote className="h-5 w-5 mb-1" />
                  <span className="text-xs">Efectivo</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center py-2">
                  <CreditCard className="h-5 w-5 mb-1" />
                  <span className="text-xs">Tarjeta</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center py-2">
                  <QrCode className="h-5 w-5 mb-1" />
                  <span className="text-xs">Código QR</span>
                </Button>
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 dark:bg-blue-700 dark:hover:bg-blue-800"
                onClick={completeSale}
              >
                Completar Venta
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

