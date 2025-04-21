"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, Truck, Printer, AlertTriangle, CheckCircle2, ShieldCheck, Banknote, CreditCard, Bug, Clock, PackageCheck, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heading } from "@/components/ui/heading"
import { toast } from "@/components/ui/use-toast"
import { type Order } from "@/components/orders/orders-table"
import { getOrderById, updateOrderStatus } from "@/lib/api"

interface OrderDetailsProps {
  orderId: string
}

export function OrderDetails({ orderId }: OrderDetailsProps) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rawData, setRawData] = useState<any>(null) // Para depuración

  // Obtener los detalles de la orden
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true)
        const response = await getOrderById(orderId)
        
        // Guardar los datos sin procesar para depuración
        setRawData(response)
        console.log('Respuesta completa de la API:', response)
        
        // Normalizar la estructura de datos
        let orderData = response;
        if (response && typeof response === 'object' && !Array.isArray(response)) {
          if (response.data) orderData = response.data;
          else if (response.order) orderData = response.order;
          else if (response.result) orderData = response.result;
        }
        
        console.log('Datos de orden normalizados:', orderData)
        
        // Construir objeto de orden normalizado
        const normalizedOrder: Order = {
          id: orderData.id || orderData._id || orderId,
          orderNumber: orderData.orderNumber || `ORD-${orderData.id || orderId}`,
          total: orderData.total || 0,
          status: orderData.status || "pendiente por pagar",
          shippingAddress: orderData.shippingAddress || orderData.address || "Sin dirección",
          paymentMethod: orderData.paymentMethod || "No especificado",
          paymentProofUrl: orderData.paymentProofUrl || "",
          paymentDate: orderData.paymentDate || orderData.updatedAt,
          paymentNotes: orderData.paymentNotes || "",
          createdAt: orderData.createdAt || new Date().toISOString(),
          updatedAt: orderData.updatedAt || new Date().toISOString(),
          
          // Mapear información del usuario
          user: orderData.User || orderData.user || orderData.customer || {
            name: "Cliente sin nombre",
            email: "email@example.com",
            profilePic: "/placeholder.svg?height=40&width=40"
          },
          
          // Mapear items de la orden
          items: orderData.OrderItems || orderData.orderItems || orderData.items || []
        }
        
        // Asegurarnos de que user tenga la estructura correcta
        if (normalizedOrder.user) {
          normalizedOrder.user = {
            name: normalizedOrder.user.name || normalizedOrder.user.name || "Cliente sin nombre",
            email: normalizedOrder.user.email || "email@example.com",
            profilePic: normalizedOrder.user.profilePic || normalizedOrder.user.profilePic || "/placeholder.svg?height=40&width=40"
          }
        }
        
        // Asegurarnos de que los items tengan la estructura correcta
        if (normalizedOrder.items && Array.isArray(normalizedOrder.items)) {
          normalizedOrder.items = normalizedOrder.items.map((item: any) => ({
            id: item.id || item._id || Math.random().toString(),
            productId: item.productId || item.ProductId || item.product_id || "",
            name: item.name || item.productName || item.Product?.name || "Producto sin nombre",
            price: item.price || item.unitPrice || 0,
            quantity: item.quantity || 1,
            total: (item.price || 0) * (item.quantity || 1)
          }))
        }
        
        console.log('Orden completamente normalizada:', normalizedOrder)
        setOrder(normalizedOrder)
        setError(null)
      } catch (err) {
        console.error('Error al obtener detalles de la orden:', err)
        setError('Error al cargar los detalles de la orden')
        toast({
          title: "Error",
          description: "No se pudieron cargar los detalles de la orden",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  // Función para actualizar el estado de la orden
  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      
      // Actualizar el estado local
      if (order) {
        setOrder({
          ...order,
          status: newStatus as any
        })
      }
      
      toast({
        title: "Estado actualizado",
        description: "El estado de la orden ha sido actualizado correctamente",
      })
    } catch (error) {
      console.error("Error al actualizar el estado:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la orden",
        variant: "destructive",
      })
    }
  }

  // Función para formatear fechas al formato dd-mm-yyyy
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Sin fecha";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha inválida";
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  };

  // Estados traducidos para mostrar en la interfaz
  const statusMap: Record<string, { label: string, color: string, icon: any }> = {
    "pendiente por pagar": { 
      label: "Pendiente de pago", 
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      icon: Clock
    },
    "pagado y procesando": { 
      label: "Pagado y procesando", 
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      icon: CreditCard
    },
    "enviado": { 
      label: "Enviado", 
      color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      icon: Truck
    },
    "entregado": { 
      label: "Entregado", 
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      icon: PackageCheck
    },
    "cancelado": { 
      label: "Cancelado", 
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      icon: XCircle
    },
  };

  // Mapeo de métodos de pago
  const paymentMethodMap: Record<string, { label: string, icon: any }> = {
    "cash": { label: "Efectivo", icon: Banknote },
    "card": { label: "Tarjeta", icon: CreditCard },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-medium">{error || "No se encontró la orden"}</p>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>
    )
  }

  // Mostrar datos crudos para depuración si hay problemas
  const showDebugInfo = !order.items?.length || !order.user || Object.keys(order.user).length === 0;

  const StatusIcon = order.status ? statusMap[order.status]?.icon : AlertTriangle;
  const PaymentIcon = order.paymentMethod ? paymentMethodMap[order.paymentMethod]?.icon || CreditCard : CreditCard;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Heading 
            title={`Orden ${order.orderNumber || `#${order.id}`}`} 
            description={`Creada el ${formatDate(order.createdAt)}`} 
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/orders/${order.id}/print`)}
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          
          {/* Botones de cambio de estado */}
          <div className="flex items-center space-x-2">
            <Card className="p-4 border-dashed">
              <div className="flex flex-wrap gap-2">
                {order.status !== "pendiente por pagar" && (
                  <Button 
                    variant="outline"
                    size="sm"
                    className="h-9 px-2 lg:px-3"
                    onClick={() => handleUpdateStatus("pendiente por pagar")}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="hidden md:inline">Pendiente</span>
                  </Button>
                )}
                
                {order.status !== "pagado y procesando" && (
                  <Button 
                    variant="outline"
                    size="sm"
                    className="h-9 px-2 lg:px-3"
                    onClick={() => handleUpdateStatus("pagado y procesando")}
                  >
                    <CreditCard className="h-4 w-4 mr-1" />
                    <span className="hidden md:inline">Pagado</span>
                  </Button>
                )}
                
                {order.status !== "enviado" && (
                  <Button 
                    variant="outline"
                    size="sm"
                    className="h-9 px-2 lg:px-3"
                    onClick={() => handleUpdateStatus("enviado")}
                  >
                    <Truck className="h-4 w-4 mr-1" />
                    <span className="hidden md:inline">Enviado</span>
                  </Button>
                )}
                
                {order.status !== "entregado" && (
                  <Button 
                    variant="outline"
                    size="sm"
                    className="h-9 px-2 lg:px-3"
                    onClick={() => handleUpdateStatus("entregado")}
                  >
                    <PackageCheck className="h-4 w-4 mr-1" />
                    <span className="hidden md:inline">Entregado</span>
                  </Button>
                )}
                
                {order.status !== "cancelado" && (
                  <Button 
                    variant="outline"
                    size="sm"
                    className="h-9 px-2 lg:px-3 hover:bg-red-100 hover:text-red-800"
                    onClick={() => handleUpdateStatus("cancelado")}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    <span className="hidden md:inline">Cancelar</span>
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Sección de depuración (solo se muestra si faltan datos) */}
      {showDebugInfo && (
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Información de depuración
            </CardTitle>
            <CardDescription>
              Se detectaron problemas con los datos recibidos de la API
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[300px] overflow-auto">
            <pre className="text-xs whitespace-pre-wrap bg-amber-100 p-4 rounded-md">
              {JSON.stringify(rawData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información de la orden</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Estado:</span>
              <Badge 
                variant="outline"
                className={order.status ? statusMap[order.status]?.color : ""}
              >
                {StatusIcon && <StatusIcon className="mr-1 h-3 w-3" />}
                {order.status ? statusMap[order.status]?.label || order.status : "Desconocido"}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Método de pago:</span>
              <div className="flex items-center">
                {PaymentIcon && <PaymentIcon className="mr-1 h-3 w-3" />}
                <span>{
                  order.paymentMethod 
                    ? paymentMethodMap[order.paymentMethod]?.label || order.paymentMethod 
                    : "No especificado"
                }</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Fecha de pago:</span>
              <span>{formatDate(order.paymentDate)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total:</span>
              <span className="font-bold">{
                new Intl.NumberFormat("es-VE", {
                  style: "currency",
                  currency: "USD",
                }).format(order.total || 0)
              }</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Información del cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.user && Object.keys(order.user).length > 0 ? (
              <>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={order.user.profilePic || "/placeholder.svg"} alt={`${order.user.name}'s avatar`} />
                    <AvatarFallback>{order.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{order.user.name}</p>
                    <p className="text-sm text-muted-foreground">{order.user.email}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">Dirección de envío:</p>
                  <p className="text-sm text-muted-foreground">{order.shippingAddress || "No especificada"}</p>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No hay información disponible del cliente
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent>
          {order.items && order.items.length > 0 ? (
            <div className="space-y-4">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <p className="font-medium">{item.name || item.productName || `Producto ${index + 1}`}</p>
                    <p className="text-sm text-muted-foreground">Cantidad: {item.quantity || 1}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{
                      new Intl.NumberFormat("es-VE", {
                        style: "currency",
                        currency: "USD",
                      }).format(item.price || 0)
                    }</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity && item.price ? 
                        new Intl.NumberFormat("es-VE", {
                          style: "currency",
                          currency: "USD",
                        }).format(item.quantity * item.price) : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No hay productos disponibles
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <span className="font-medium">Total</span>
          <span className="font-bold text-lg">{
            new Intl.NumberFormat("es-VE", {
              style: "currency",
              currency: "USD",
            }).format(order.total || 0)
          }</span>
        </CardFooter>
      </Card>
      
      {order.paymentNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Notas de pago</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{order.paymentNotes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 