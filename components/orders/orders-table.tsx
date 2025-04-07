"use client"

import { useState } from "react"
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
import { MoreHorizontal, ArrowUpDown, Eye, FileText, Printer, Trash2, Truck, CheckCircle2, XCircle } from "lucide-react"
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

// Define the Order type
export type Order = {
  id: string
  orderNumber: string
  customer: {
    name: string
    email: string
    avatar?: string
  }
  date: string
  total: number
  status: "pending" | "processing" | "delivered" | "cancelled"
  paymentStatus: "paid" | "unpaid" | "refunded"
  paymentMethod: string
  items: number
  source: "pos" | "ecommerce"
  deliveryMethod: "pickup" | "delivery" | "refill"
  deliveryStatus?: "pending" | "in_transit" | "delivered" | null
  deliveryAddress?: string
  deliveryDate?: string
}

// Sample data
const orders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-1042",
    customer: {
      name: "John Doe",
      email: "john@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2025-04-01",
    total: 42.97,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Credit Card",
    items: 3,
    source: "pos",
    deliveryMethod: "delivery",
    deliveryStatus: "delivered",
    deliveryAddress: "123 Main St, Anytown, USA",
    deliveryDate: "2025-04-01",
  },
  {
    id: "2",
    orderNumber: "ORD-1041",
    customer: {
      name: "Jane Smith",
      email: "jane@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2025-04-01",
    total: 23.98,
    status: "processing",
    paymentStatus: "paid",
    paymentMethod: "PayPal",
    items: 2,
    source: "ecommerce",
    deliveryMethod: "delivery",
    deliveryStatus: "in_transit",
    deliveryAddress: "456 Oak St, Somewhere, USA",
    deliveryDate: "2025-04-02",
  },
  {
    id: "3",
    orderNumber: "ORD-1040",
    customer: {
      name: "Robert Johnson",
      email: "robert@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2025-03-31",
    total: 134.95,
    status: "pending",
    paymentStatus: "unpaid",
    paymentMethod: "Cash",
    items: 5,
    source: "pos",
    deliveryMethod: "pickup",
    deliveryStatus: null,
  },
  {
    id: "4",
    orderNumber: "ORD-1039",
    customer: {
      name: "Emily Davis",
      email: "emily@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2025-03-31",
    total: 8.99,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Credit Card",
    items: 1,
    source: "ecommerce",
    deliveryMethod: "refill",
    deliveryStatus: "delivered",
    deliveryDate: "2025-03-31",
  },
  {
    id: "5",
    orderNumber: "ORD-1038",
    customer: {
      name: "Michael Wilson",
      email: "michael@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2025-03-30",
    total: 56.96,
    status: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "Credit Card",
    items: 4,
    source: "ecommerce",
    deliveryMethod: "delivery",
    deliveryStatus: null,
    deliveryAddress: "789 Pine St, Nowhere, USA",
  },
  {
    id: "6",
    orderNumber: "ORD-1037",
    customer: {
      name: "Sarah Brown",
      email: "sarah@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2025-03-30",
    total: 29.98,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "PayPal",
    items: 2,
    source: "ecommerce",
    deliveryMethod: "delivery",
    deliveryStatus: "delivered",
    deliveryAddress: "101 Maple St, Anywhere, USA",
    deliveryDate: "2025-03-30",
  },
  {
    id: "7",
    orderNumber: "ORD-1036",
    customer: {
      name: "David Miller",
      email: "david@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2025-03-29",
    total: 38.97,
    status: "processing",
    paymentStatus: "paid",
    paymentMethod: "Cash",
    items: 3,
    source: "pos",
    deliveryMethod: "refill",
    deliveryStatus: "pending",
  },
]

interface OrdersTableProps {
  status: string
}

export function OrdersTable({ status }: OrdersTableProps) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

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
      accessorKey: "customer",
      header: "Cliente",
      cell: ({ row }) => {
        const customer = row.original.customer
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={customer.avatar} alt={customer.name} />
              <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{customer.name}</div>
              <div className="text-xs text-muted-foreground">{customer.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Fecha
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("date")}</div>,
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
        const statusMap: Record<string, string> = {
          delivered: "Entregada",
          processing: "En Proceso",
          pending: "Pendiente",
          cancelled: "Cancelada",
        }
        return (
          <Badge
            variant="outline"
            className={
              status === "delivered"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : status === "processing"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                  : status === "pending"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            }
          >
            {statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      },
    },
    {
      accessorKey: "paymentStatus",
      header: "Pago",
      cell: ({ row }) => {
        const paymentStatus = row.getValue("paymentStatus") as string
        const paymentStatusMap: Record<string, string> = {
          paid: "Pagado",
          unpaid: "No Pagado",
          refunded: "Reembolsado",
        }
        return (
          <Badge
            variant="outline"
            className={
              paymentStatus === "paid"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : paymentStatus === "unpaid"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            }
          >
            {paymentStatusMap[paymentStatus] || paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
          </Badge>
        )
      },
    },
    {
      accessorKey: "deliveryMethod",
      header: "Entrega",
      cell: ({ row }) => {
        const deliveryMethod = row.getValue("deliveryMethod") as string
        const deliveryStatus = row.original.deliveryStatus

        const deliveryMethodMap: Record<string, string> = {
          pickup: "Recogida",
          delivery: "Entrega",
          refill: "Recarga",
        }

        const deliveryStatusMap: Record<string, string> = {
          delivered: "Entregado",
          in_transit: "En Tránsito",
          pending: "Pendiente",
        }

        return (
          <div className="flex flex-col gap-1">
            <Badge variant="secondary">
              {deliveryMethodMap[deliveryMethod] || deliveryMethod.charAt(0).toUpperCase() + deliveryMethod.slice(1)}
            </Badge>
            {deliveryStatus && (
              <Badge
                variant="outline"
                className={
                  deliveryStatus === "delivered"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : deliveryStatus === "in_transit"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                }
              >
                {deliveryStatusMap[deliveryStatus] || deliveryStatus.charAt(0).toUpperCase() + deliveryStatus.slice(1)}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "source",
      header: "Origen",
      cell: ({ row }) => {
        const source = row.getValue("source") as string
        return (
          <Badge
            variant="outline"
            className={
              source === "pos"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
            }
          >
            {source === "pos" ? "POS" : "E-commerce"}
          </Badge>
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
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}/edit`)}>
                <FileText className="mr-2 h-4 w-4" />
                Editar Orden
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir Factura
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {order.status !== "delivered" && order.status !== "cancelled" && (
                <DropdownMenuItem
                  onClick={() => {
                    toast({
                      title: "Estado de orden actualizado",
                      description: "La orden ha sido marcada como entregada.",
                    })
                  }}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Marcar como Entregada
                </DropdownMenuItem>
              )}
              {order.status !== "cancelled" && (
                <DropdownMenuItem
                  onClick={() => {
                    toast({
                      title: "Orden cancelada",
                      description: "La orden ha sido cancelada.",
                      variant: "destructive",
                    })
                  }}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancelar Orden
                </DropdownMenuItem>
              )}
              {order.deliveryMethod === "delivery" && order.deliveryStatus !== "delivered" && (
                <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}/delivery`)}>
                  <Truck className="mr-2 h-4 w-4" />
                  Actualizar Entrega
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  toast({
                    title: "Orden eliminada",
                    description: "La orden ha sido eliminada.",
                    variant: "destructive",
                  })
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Orden
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
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

