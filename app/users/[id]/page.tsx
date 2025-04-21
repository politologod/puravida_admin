"use client"
import React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { SidebarNav } from "../../../components/sidebar-nav"
import { Header } from "../../../components/header"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, ShoppingBag, Clock, CheckCircle, XCircle, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUserById, deleteUser, getOrders } from "@/lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { formatPrice } from "@/lib/utils"
import {
  UserRound,
  AtSign,
  Calendar,
  DollarSign,
  ShoppingCart,
  TruckIcon,
  AlertTriangle
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  profilePic?: string
  role?: string
}

interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  user_id?: string;
  total_amount: number;
  status: string;
  created_at: string;
  items?: any[];
}

interface ApiResponse {
  data?: Order[];
  orders?: Order[];
  items?: Order[];
  results?: Order[];
  [key: string]: any;
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("info");
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [totalOrdersValue, setTotalOrdersValue] = useState(0);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalValue: 0,
    averageOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const obtenerUsuario = async () => {
    try {
      setLoading(true);
      const userData = await getUserById(id);
      const parsedUser = {
        id: userData.id_autoincrement,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        profilePic: userData.profilePic,
        role: userData.role || "cliente",
      };
      setUser(parsedUser);
      console.log("Datos del usuario:", parsedUser);
      await obtenerOrdenes(parsedUser.id);
      return userData;
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
      setError("No se pudo cargar la información del usuario.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const obtenerOrdenes = async (userId: string) => {
    try {
      setIsLoadingOrders(true);
      const allOrders: Order[] | ApiResponse = await getOrders();
      console.log("Todas las órdenes:", allOrders);
      
      let ordersData: Order[] = Array.isArray(allOrders) ? allOrders : [];
      // Comprobar si la respuesta tiene un formato específico
      if (allOrders && typeof allOrders === 'object' && !Array.isArray(allOrders)) {
        const response = allOrders as ApiResponse;
        if (response.data && Array.isArray(response.data)) {
          ordersData = response.data;
        } else if (response.orders && Array.isArray(response.orders)) {
          ordersData = response.orders;
        } else if (response.items && Array.isArray(response.items)) {
          ordersData = response.items;
        } else if (response.results && Array.isArray(response.results)) {
          ordersData = response.results;
        }
      }
      
      // Filtrar órdenes del usuario actual
      const userOrders: Order[] = ordersData
        .filter((order: any) => order.customer_id === userId || order.user_id === userId)
        .map((order: any) => ({
          id: order.id || order._id,
          order_number: order.order_number || `ORD-${order.id}`,
          customer_id: order.customer_id || order.user_id,
          user_id: order.user_id,
          total_amount: order.total_amount || 0,
          status: order.status || "pendiente",
          created_at: order.created_at || new Date().toISOString(),
          items: order.items || []
        }));
      
      setOrders(userOrders);
      
      // Calcular valor total de todas las órdenes
      const total = userOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      setTotalOrdersValue(total);
      
      // Calcular estadísticas
      if (userOrders.length > 0) {
        const totalValue = userOrders.reduce((sum, order) => {
          const amount = typeof order.total_amount === 'number' 
            ? order.total_amount 
            : parseFloat(String(order.total_amount) || '0');
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
        
        setOrderStats({
          totalOrders: userOrders.length,
          totalValue: totalValue,
          averageOrderValue: totalValue / userOrders.length
        });
      }
      
    } catch (error) {
      console.error("Error al obtener las órdenes:", error);
      setError("No se pudieron cargar las órdenes del usuario.");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (id) {
      obtenerUsuario();
    }
  }, [id])

  const manejarEliminarUsuario = async () => {
    try {
      await deleteUser(id);
      console.log("Usuario eliminado con éxito");

      // Redirigir o mostrar mensaje de éxito
      window.location.href = "/users";
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
    }
  }

  // Función para obtener el icono según el estado de la orden
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'entregado':
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
      case 'en proceso':
      case 'preparando':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
      case 'cancelado':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'shipped':
      case 'enviado':
        return <TruckIcon className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    }
  };

  // Función para obtener el texto de estado de la orden
  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'entregado':
      case 'delivered':
        return "Entregado";
      case 'processing':
      case 'en proceso':
      case 'preparando':
        return "En proceso";
      case 'cancelled':
      case 'cancelado':
        return "Cancelado";
      case 'shipped':
      case 'enviado':
        return "Enviado";
      default:
        return status || "Desconocido";
    }
  };

  // Función para dar color al badge según el estado
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'entregado':
      case 'delivered':
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case 'processing':
      case 'en proceso':
      case 'preparando':
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case 'cancelled':
      case 'cancelado':
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case 'shipped':
      case 'enviado':
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      default:
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Fecha desconocida";
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return <UserProfileSkeleton />;
  }

  if (error || !user) {
    return <div className="p-4">{error || "Usuario no encontrado"}</div>;
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <a href="/users">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a Usuarios
                </a>
              </Button>
              <h1 className="text-2xl font-bold">Perfil del Usuario</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/users/${user.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Usuario
                </Link>
              </Button>
              <Button variant="destructive" onClick={manejarEliminarUsuario}>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Usuario
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={user.profilePic} alt={user.name} />
                  <AvatarFallback className="text-4xl">
                    {user.name?.charAt(0)}
                    {user.name?.split(" ")[1]?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <Badge
                  variant="outline"
                  className={
                    user.role === "admin"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 mt-2"
                      : user.role === "vendor"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 mt-2"
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 mt-2"
                  }
                >
                  {user.role}
                </Badge>

                <Separator className="my-4" />

                <div className="w-full space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{user.address}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Órdenes del Usuario</CardTitle>
                  <CardDescription>Historial de órdenes realizadas por este usuario</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingOrders ? (
                    <div className="text-center py-4">Cargando órdenes...</div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">Este usuario no tiene órdenes registradas</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold">{orders.length}</div>
                          <div className="text-sm text-muted-foreground">Órdenes Totales</div>
                        </div>
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold">${totalOrdersValue.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">Valor Total</div>
                        </div>
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold">${orders.length > 0 ? (totalOrdersValue / orders.length).toFixed(2) : '0.00'}</div>
                          <div className="text-sm text-muted-foreground">Valor Promedio por Orden</div>
                        </div>
                      </div>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Orden #</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell>{order.order_number}</TableCell>
                              <TableCell>{formatDate(order.created_at)}</TableCell>
                              <TableCell>
                                <Badge className={`flex items-center gap-1 ${getStatusColor(order.status)}`}>
                                  {getStatusIcon(order.status)}
                                  {getStatusText(order.status)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-medium">${order.total_amount.toFixed(2)}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/orders/${order.id}`}>
                                    Ver detalles
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </>
                  )}
                  
                  <div className="mt-4 text-center">
                    <Button variant="outline" asChild>
                      <a href="/orders">Ver Todas las Órdenes</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function UserProfileSkeleton() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-4 flex-1">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-5" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-48" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-5" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-64" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-5" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-36" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-5" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-36" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-5 w-10" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between py-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
