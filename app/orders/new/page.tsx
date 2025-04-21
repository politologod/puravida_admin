"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarNav } from "../../../components/sidebar-nav"
import { Header } from "../../../components/header"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Search,
  ShoppingCart,
  User,
  CreditCard,
  Truck,
  Package,
  Store,
  Phone,
  MapPin,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createOrder, getAllProducts, getUser } from "@/lib/api"

export default function NewOrderPage() {
  const router = useRouter()
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [deliveryMethod, setDeliveryMethod] = useState("pickup")
  const [paymentMethod, setPaymentMethod] = useState("credit_card")
  const [notes, setNotes] = useState("")
  const [products, setProducts] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const tax = subtotal * 0.05 // 5% tax
  const total = subtotal + tax

  // Cargar productos y clientes al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Obtener productos
        const productsResponse = await getAllProducts()
        console.log("Productos obtenidos:", productsResponse)
        
        let productsData = productsResponse;
        if (productsResponse && typeof productsResponse === 'object' && !Array.isArray(productsResponse)) {
          if (productsResponse.data) productsData = productsResponse.data;
          else if (productsResponse.products) productsData = productsResponse.products;
          else if (productsResponse.items) productsData = productsResponse.items;
          else if (productsResponse.results) productsData = productsResponse.results;
        }
        
        if (!Array.isArray(productsData)) {
          console.error("Los datos de productos recibidos no son un array:", productsData);
          setProducts([]);
        } else {
          // Mapear y normalizar los datos de productos
          const parsedProducts = productsData.map((product: any) => ({
            id: product.id || product._id || Math.random().toString(36).substring(2, 9),
            name: product.name || "Producto sin nombre",
            price: product.price || 0,
            image: product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg?height=64&width=64",
            category: product.category || "Sin categoría",
            stock: product.stock || 0,
          }))
          
          setProducts(parsedProducts)
        }
        
        // Obtener clientes (usuarios)
        const usersResponse = await getUser()
        console.log("Usuarios obtenidos:", usersResponse)
        
        let usersData = usersResponse;
        if (usersResponse && typeof usersResponse === 'object' && !Array.isArray(usersResponse)) {
          if (usersResponse.data) usersData = usersResponse.data;
          else if (usersResponse.users) usersData = usersResponse.users;
          else if (usersResponse.items) usersData = usersResponse.items;
          else if (usersResponse.results) usersData = usersResponse.results;
        }
        
        if (!Array.isArray(usersData)) {
          console.error("Los datos de usuarios recibidos no son un array:", usersData);
          setCustomers([]);
        } else {
          // Mapear y normalizar los datos de usuarios
          const parsedUsers = usersData.map((user: any) => ({
            id: user.id || user._id || Math.random().toString(36).substring(2, 9),
            name: user.name || "Usuario sin nombre",
            email: user.email || "sin@email.com",
            phone: user.phone || "Sin teléfono",
            address: user.address || "Sin dirección",
            avatar: user.profilePicture || "/placeholder.svg?height=40&width=40",
          }))
          
          setCustomers(parsedUsers)
        }
        
        setError(null)
      } catch (err) {
        console.error('Error al cargar datos:', err)
        setError('Error al cargar los datos necesarios')
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos necesarios",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const addToCart = (product: any) => {
    const existingItem = cartItems.find((item) => item.id === product.id)

    if (existingItem) {
      setCartItems(cartItems.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }])
    }

    setIsProductDialogOpen(false)

    toast({
      title: "Product added",
      description: `${product.name} has been added to the order.`,
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(cartItems.filter((item) => item.id !== id))
    } else {
      setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
    }
  }

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id))

    toast({
      title: "Product removed",
      description: "The product has been removed from the order.",
    })
  }

  const selectCustomer = (customer: any) => {
    setSelectedCustomer(customer)
    setIsCustomerDialogOpen(false)

    toast({
      title: "Customer selected",
      description: `${customer.name} has been selected for this order.`,
    })
  }

  const handleCreateOrder = async () => {
    if (!selectedCustomer) {
      toast({
        title: "Cliente requerido",
        description: "Por favor, selecciona un cliente para esta orden.",
        variant: "destructive",
      })
      return
    }

    if (cartItems.length === 0) {
      toast({
        title: "Orden vacía",
        description: "Por favor, agrega al menos un producto a la orden.",
        variant: "destructive",
      })
      return
    }

    try {
      // Crear estructura de datos para la API
      const orderData = {
        customer: {
          id: selectedCustomer.id,
          name: selectedCustomer.name,
          email: selectedCustomer.email,
          phone: selectedCustomer.phone,
          address: selectedCustomer.address,
        },
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        })),
        total: total,
        paymentMethod: paymentMethod,
        paymentStatus: "unpaid" as "unpaid" | "paid" | "refunded",
        status: "pending" as "pending" | "processing" | "delivered" | "cancelled",
        deliveryMethod: deliveryMethod as "pickup" | "delivery" | "refill",
        deliveryAddress: deliveryMethod === "delivery" ? selectedCustomer.address : "",
        notes: notes,
      };

      // Llamar a la API para crear la orden
      const response = await createOrder(orderData);
      
      // Mostrar mensaje de éxito
    toast({
        title: "Orden creada",
        description: "La orden ha sido creada exitosamente.",
      });
      
      // Redireccionar a la página de órdenes
      router.push("/orders");
    } catch (error) {
      console.error("Error al crear la orden:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la orden. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.push("/orders")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Button>
              <h1 className="text-2xl font-bold">New Order</h1>
            </div>
            <Button onClick={handleCreateOrder}>
              <Save className="mr-2 h-4 w-4" />
              Create Order
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                  <CardDescription>Add products to this order</CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Add Product</DialogTitle>
                        <DialogDescription>Search and select products to add to the order</DialogDescription>
                      </DialogHeader>

                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input placeholder="Search products..." className="pl-9" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                        {products.map((product) => (
                          <Card
                            key={product.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => addToCart(product)}
                          >
                            <CardContent className="p-4 flex items-center gap-3">
                              <img
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                className="h-12 w-12 rounded-md object-cover"
                              />
                              <div className="flex-1">
                                <div className="font-medium">{product.name}</div>
                                <div className="flex items-center justify-between mt-1">
                                  <div className="text-sm text-muted-foreground">{product.category}</div>
                                  <div className="font-medium text-blue-600 dark:text-blue-400">
                                    ${product.price.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {cartItems.length > 0 ? (
                    <Table className="mt-4">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cartItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  className="h-10 w-10 rounded-md object-cover"
                                />
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-xs text-muted-foreground">{item.category}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                  -
                                </Button>
                                <span>{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  +
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${(item.price * item.quantity).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={3}>Subtotal</TableCell>
                          <TableCell className="text-right">${subtotal.toFixed(2)}</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={3}>Tax (5%)</TableCell>
                          <TableCell className="text-right">${tax.toFixed(2)}</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={3}>Total</TableCell>
                          <TableCell className="text-right font-bold">${total.toFixed(2)}</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  ) : (
                    <div className="text-center p-6 mt-4 border rounded-md">
                      <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium mb-1">No Products Added</h3>
                      <p className="text-muted-foreground mb-4">Add products to create this order</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                  <CardDescription>Additional order information</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="delivery">
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="delivery">Delivery</TabsTrigger>
                      <TabsTrigger value="payment">Payment</TabsTrigger>
                      <TabsTrigger value="notes">Notes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="delivery">
                      <div className="space-y-4">
                        <div>
                          <Label>Delivery Method</Label>
                          <RadioGroup
                            defaultValue="pickup"
                            className="grid grid-cols-3 gap-4 mt-2"
                            value={deliveryMethod}
                            onValueChange={setDeliveryMethod}
                          >
                            <div>
                              <RadioGroupItem value="pickup" id="pickup" className="peer sr-only" />
                              <Label
                                htmlFor="pickup"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <Store className="mb-3 h-6 w-6" />
                                <span className="text-sm font-medium">Pickup</span>
                              </Label>
                            </div>

                            <div>
                              <RadioGroupItem value="delivery" id="delivery" className="peer sr-only" />
                              <Label
                                htmlFor="delivery"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <Truck className="mb-3 h-6 w-6" />
                                <span className="text-sm font-medium">Delivery</span>
                              </Label>
                            </div>

                            <div>
                              <RadioGroupItem value="refill" id="refill" className="peer sr-only" />
                              <Label
                                htmlFor="refill"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <Package className="mb-3 h-6 w-6" />
                                <span className="text-sm font-medium">Refill Service</span>
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {deliveryMethod === "delivery" && (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="delivery-address">Delivery Address</Label>
                              <Textarea
                                id="delivery-address"
                                placeholder="Enter delivery address"
                                className="mt-1"
                                defaultValue={selectedCustomer?.address || ""}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="delivery-date">Delivery Date</Label>
                                <Input
                                  id="delivery-date"
                                  type="date"
                                  className="mt-1"
                                  defaultValue={new Date().toISOString().split("T")[0]}
                                />
                              </div>

                              <div>
                                <Label htmlFor="delivery-time">Delivery Time</Label>
                                <Select defaultValue="morning">
                                  <SelectTrigger id="delivery-time" className="mt-1">
                                    <SelectValue placeholder="Select time" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="morning">Morning (9AM - 12PM)</SelectItem>
                                    <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                                    <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="delivery-notes">Delivery Notes</Label>
                              <Textarea
                                id="delivery-notes"
                                placeholder="Enter any special delivery instructions"
                                className="mt-1"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="payment">
                      <div className="space-y-4">
                        <div>
                          <Label>Payment Method</Label>
                          <RadioGroup
                            defaultValue="credit_card"
                            className="grid grid-cols-3 gap-4 mt-2"
                            value={paymentMethod}
                            onValueChange={setPaymentMethod}
                          >
                            <div>
                              <RadioGroupItem value="credit_card" id="credit_card" className="peer sr-only" />
                              <Label
                                htmlFor="credit_card"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <CreditCard className="mb-3 h-6 w-6" />
                                <span className="text-sm font-medium">Credit Card</span>
                              </Label>
                            </div>

                            <div>
                              <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
                              <Label
                                htmlFor="cash"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <svg
                                  className="mb-3 h-6 w-6"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12C22 15.7712 22 17.6569 20.8284 18.8284C19.6569 20 17.7712 20 14 20H10C6.22876 20 4.34315 20 3.17157 18.8284C2 17.6569 2 15.7712 2 12Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                  />
                                  <path
                                    d="M12 10C13.1046 10 14 9.10457 14 8C14 6.89543 13.1046 6 12 6C10.8954 6 10 6.89543 10 8C10 9.10457 10.8954 10 12 10Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                  />
                                  <path d="M18 9H18.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                  <path d="M6 9H6.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                  <path
                                    d="M18 15H18.01"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                  />
                                  <path d="M6 15H6.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                  <path d="M14 15H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                <span className="text-sm font-medium">Cash</span>
                              </Label>
                            </div>

                            <div>
                              <RadioGroupItem value="paypal" id="paypal" className="peer sr-only" />
                              <Label
                                htmlFor="paypal"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <svg
                                  className="mb-3 h-6 w-6"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M6.5 14C5.67157 14 5 13.3284 5 12.5C5 11.6716 5.67157 11 6.5 11C7.32843 11 8 11.6716 8 12.5C8 13.3284 7.32843 14 6.5 14Z"
                                    fill="currentColor"
                                  />
                                  <path
                                    d="M17.5 14C16.6716 14 16 13.3284 16 12.5C16 11.6716 16.6716 11 17.5 11C18.3284 11 19 11.6716 19 12.5C19 13.3284 18.3284 14 17.5 14Z"
                                    fill="currentColor"
                                  />
                                  <path
                                    d="M12 14C11.1716 14 10.5 13.3284 10.5 12.5C10.5 11.6716 11.1716 11 12 11C12.8284 11 13.5 11.6716 13.5 12.5C13.5 13.3284 12.8284 14 12 14Z"
                                    fill="currentColor"
                                  />
                                  <path
                                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <span className="text-sm font-medium">PayPal</span>
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {paymentMethod === "credit_card" && (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="card-number">Card Number</Label>
                              <Input id="card-number" placeholder="Enter card number" className="mt-1" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="expiry-date">Expiry Date</Label>
                                <Input id="expiry-date" placeholder="MM/YY" className="mt-1" />
                              </div>

                              <div>
                                <Label htmlFor="cvv">CVV</Label>
                                <Input id="cvv" placeholder="CVV" className="mt-1" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="notes">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="order-notes">Order Notes</Label>
                          <Textarea
                            id="order-notes"
                            placeholder="Enter any notes for this order"
                            className="mt-1 min-h-32"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer</CardTitle>
                  <CardDescription>Select a customer for this order</CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">{selectedCustomer ? "Change Customer" : "Select Customer"}</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Select Customer</DialogTitle>
                        <DialogDescription>Search and select a customer for this order</DialogDescription>
                      </DialogHeader>

                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input placeholder="Search customers..." className="pl-9" />
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
                          Cancel
                        </Button>
                        <Button onClick={() => router.push("/users/new")}>
                          <User className="mr-2 h-4 w-4" />
                          New Customer
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {selectedCustomer ? (
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={selectedCustomer.avatar} alt={selectedCustomer.name} />
                          <AvatarFallback>{selectedCustomer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{selectedCustomer.name}</div>
                          <div className="text-sm text-muted-foreground">{selectedCustomer.email}</div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div className="text-sm">{selectedCustomer.phone}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div className="text-sm">{selectedCustomer.address}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6 mt-4 border rounded-md">
                      <User className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium mb-1">No Customer Selected</h3>
                      <p className="text-muted-foreground mb-4">Select a customer for this order</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (5%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>

                    <div className="pt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Items</span>
                        <span>{cartItems.reduce((acc, item) => acc + item.quantity, 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Delivery</span>
                        <Badge variant="outline">
                          {deliveryMethod.charAt(0).toUpperCase() + deliveryMethod.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Payment</span>
                        <Badge variant="outline">
                          {paymentMethod === "credit_card"
                            ? "Credit Card"
                            : paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handleCreateOrder}>
                    <Save className="mr-2 h-4 w-4" />
                    Create Order
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

