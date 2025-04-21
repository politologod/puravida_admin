"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Eye, FileText, Printer, Trash2, Truck, CheckCircle2, XCircle, CreditCard, Clock, PackageCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getOrders, getMyOrders, deleteOrder, updateOrderStatus } from "@/lib/api"

// Define the Order type according to backend model
export type Order = {
  id: string | number
  orderNumber?: string
  total: number
  status: "pendiente por pagar" | "pagado y procesando" | "enviado" | "entregado" | "cancelado"
  shippingAddress: string
  paymentMethod: string
  paymentProofUrl?: string
  paymentDate?: string
  paymentNotes?: string
  userId?: string | number
  items?: any[]
  user?: {
    name: string
    email: string
    profilePic?: string
  }
  createdAt: string
  updatedAt: string
}

interface OrdersTableProps {
  status: string
}

// Función para formatear fechas al formato dd-mm-yyyy
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Fecha inválida";
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
};

export function OrdersTable({ status }: OrdersTableProps) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Obtener las órdenes al cargar el componente
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        // Usar getMyOrders o getOrders según el perfil de usuario (si es admin o no)
        const response = await getOrders()
        
        // Determinar dónde están los datos de órdenes
        let ordersData = response;
        
        // Si la respuesta es un objeto con una propiedad que contiene las órdenes
        if (response && typeof response === 'object' && !Array.isArray(response)) {
          // Buscar propiedades comunes donde podrían estar las órdenes
          if (response.data) ordersData = response.data;
          else if (response.orders) ordersData = response.orders;
          else if (response.items) ordersData = response.items;
          else if (response.results) ordersData = response.results;
        }
        
        // Asegurarse de que ordersData sea un array
        if (!Array.isArray(ordersData)) {
          console.error("Los datos recibidos no son un array:", ordersData);
          setOrders([]);
          setError('Formato de datos no válido');
          return;
        }
        
        // Mapear y normalizar los datos de órdenes
        const parsedOrders = ordersData.map((order: any) => ({
          id: order.id || order._id || Math.random().toString(36).substring(2, 9),
          orderNumber: `ORD-${order.id || Math.floor(Math.random() * 10000)}`,
          total: order.total || 0,
          status: order.status || "pendiente por pagar",
          shippingAddress: order.shippingAddress || "Sin dirección",
          paymentMethod: order.paymentMethod || "No especificado",
          paymentProofUrl: order.paymentProofUrl || "",
          paymentDate: order.paymentDate || order.updatedAt,
          paymentNotes: order.paymentNotes || "",
          userId: order.userId,
          items: order.OrderItems || [],
          user: order.User ? {
            name: order.User.name || "Cliente sin nombre",
            email: order.User.email || "email@example.com",
            avatar: order.User.profilePicture || "/placeholder.svg?height=40&width=40",
          } : {
            name: "Cliente sin nombre",
            email: "email@example.com",
            avatar: "/placeholder.svg?height=40&width=40",
          },
          createdAt: order.createdAt || new Date().toISOString(),
          updatedAt: order.updatedAt || new Date().toISOString(),
        }))
        
        setOrders(parsedOrders)
        setError(null)
      } catch (err) {
        console.error('Error al obtener órdenes:', err)
        setError('Error al cargar las órdenes')
        toast({
          title: "Error",
          description: "No se pudieron cargar las órdenes",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Manejar la eliminación de órdenes
  const handleDeleteOrder = async (id: string) => {
    try {
      await deleteOrder(id)
      // Actualizar la lista de órdenes después de eliminar
      setOrders(orders.filter(order => order.id !== id))
      toast({
        title: "Orden eliminada",
        description: "La orden ha sido eliminada correctamente",
        variant: "destructive",
      })
    } catch (error) {
      console.error("Error al eliminar la orden:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la orden",
        variant: "destructive",
      })
    }
  }

  // Manejar la actualización de estado de órdenes
  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    try {
      await updateOrderStatus(id, newStatus)
      // Actualizar la lista de órdenes con el nuevo estado
      setOrders(orders.map(order => 
        order.id === id 
          ? { ...order, status: newStatus as Order['status'] } 
          : order
      ))
      toast({
        title: "Estado actualizado",
        description: `La orden ha sido marcada como "${newStatus}"`,
      })
    } catch (error) {
      console.error("Error al actualizar el estado de la orden:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la orden",
        variant: "destructive",
      })
    }
  }

  // Filter orders based on status
  const filteredOrders = status === "all" ? orders : orders.filter((order) => order.status === status)

  // Actualizar los textos de la tabla de órdenes al español
  const columns: ColumnDef<Order>[] = [
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
      accessorKey: "orderNumber",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Orden
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("orderNumber")}</div>,
    },
    {
      accessorKey: "user",
      header: "Cliente",
      cell: ({ row }) => {
        const user = row.original.user
        if (!user) return <div className="flex items-center gap-2">No hay cliente</div>
        
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.profilePic || "/placeholder.svg"} alt={`${user.name}'s avatar`} />
              <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Fecha
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        // Formatear la fecha al formato dd-mm-yyyy
        const dateString = row.getValue("createdAt") as string;
        return <div>{formatDate(dateString)}</div>;
      },
    },
    {
      accessorKey: "total",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Total
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("total"))
        const formatted = new Intl.NumberFormat("es-VE", {
          style: "currency",
          currency: "USD",
        }).format(amount)
        return <div className="font-medium">{formatted}</div>
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
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
        }
        
        const StatusIcon = statusMap[status]?.icon || Clock;
        
        return (
          <Badge
            variant="outline"
            className={statusMap[status]?.color || ""}
          >
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusMap[status]?.label || status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "paymentMethod",
      header: "Método de Pago",
      cell: ({ row }) => {
        const paymentMethod = row.getValue("paymentMethod") as string
        return (
          <Badge
            variant="outline"
            className={
              paymentMethod === "cash"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : paymentMethod === "card"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                  : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
            }
          >
            {paymentMethod === "cash" ? "Efectivo" : paymentMethod === "card" ? "Tarjeta" : paymentMethod}
          </Badge>
        )
      },
    },
    {
      accessorKey: "shippingAddress",
      header: "Dirección de Envío",
      cell: ({ row }) => {
        const shippingAddress = row.getValue("shippingAddress") as string
        return (
          <div className="font-medium">{shippingAddress}</div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original
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
              <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}/edit`)}>
                <FileText className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}/print`)}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
              
              {order.status !== "pendiente por pagar" && (
                <DropdownMenuItem onClick={() => handleUpdateOrderStatus(String(order.id), "pendiente por pagar")}>
                  <Clock className="mr-2 h-4 w-4" />
                  Pendiente por pagar
                </DropdownMenuItem>
              )}
              
              {order.status !== "pagado y procesando" && (
                <DropdownMenuItem onClick={() => handleUpdateOrderStatus(String(order.id), "pagado y procesando")}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pagado y procesando
                </DropdownMenuItem>
              )}
              
              {order.status !== "enviado" && (
                <DropdownMenuItem onClick={() => handleUpdateOrderStatus(String(order.id), "enviado")}>
                  <Truck className="mr-2 h-4 w-4" />
                  Enviado
                </DropdownMenuItem>
              )}
              
              {order.status !== "entregado" && (
                <DropdownMenuItem onClick={() => handleUpdateOrderStatus(String(order.id), "entregado")}>
                  <PackageCheck className="mr-2 h-4 w-4" />
                  Entregado
                </DropdownMenuItem>
              )}
              
              {order.status !== "cancelado" && (
                <DropdownMenuItem onClick={() => handleUpdateOrderStatus(String(order.id), "cancelado")}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancelado
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleDeleteOrder(String(order.id))}
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

  const table = useReactTable({
    data: filteredOrders,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  })

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer"
                  onClick={() => router.push(`/orders/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No se encontraron órdenes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de {table.getFilteredRowModel().rows.length} fila(s)
          seleccionada(s).
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}

