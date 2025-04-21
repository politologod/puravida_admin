"use client"
import { SidebarNav } from "../../components/sidebar-nav"
import { Header } from "../../components/header"
import { Button } from "@/components/ui/button"
import { Download, UserPlus, Edit, Trash2, Eye, MoreHorizontal, Users, UserCheck, UserCog, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/data-table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { getUser, deleteUser } from "@/lib/api"
import { useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import { add } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight } from "lucide-react"

type User = {
  id: number
  name: string
  email: string
  role: string
  orders: number
  lastActive: string
  status: "active" | "inactive"
  avatar?: string
  phone?: string
  address?: string
}

function CustomerStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes Totales</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">384</div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <span className="text-green-500 dark:text-green-400 flex items-center mr-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              12%
            </span>
            vs mes anterior
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">259</div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <span className="text-green-500 dark:text-green-400 flex items-center mr-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              8%
            </span>
            vs mes anterior
          </p>
        </CardContent>
      </Card>
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nuevos Clientes</CardTitle>
          <UserPlus className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">48</div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <span className="text-green-500 dark:text-green-400 flex items-center mr-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              24%
            </span>
            este mes
          </p>
        </CardContent>
      </Card>
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Órdenes por Cliente</CardTitle>
          <ShoppingCart className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2.4</div>
          <p className="text-xs text-muted-foreground">
            promedio de órdenes por cliente
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true)
        const data = await getUser()
        // Filtramos para mostrar solo usuarios con role "customer"
        const parsedCustomers = data
          .filter((u: any) => u.role === "customer")
          .map((u: any) => ({
            id: u.id_autoincrement,
            name: u.name,
            email: u.email,
            role: u.role || "customer", 
            phone: u.phone || "No disponible",
            address: u.address || "No disponible",
          }))
        setCustomers(parsedCustomers)
        setError(null)
      } catch (err) {
        console.error('Error al obtener clientes:', err)
        setError('Error al cargar los clientes')
        toast({
          title: "Error",
          description: "No se pudieron cargar los clientes",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  useEffect(() => {
    console.log("Clientes actualizados:", customers)
  }, [customers])

  const handleDelete = async (ids: string[]) => {
    try {
      for (const id of ids) {
        await deleteUser(id)
      }
      // Actualizar la lista de clientes después de eliminar
      const data = await getUser()
      const parsedCustomers = data
        .filter((u: any) => u.role === "customer")
        .map((u: any) => ({
          id: u.id_autoincrement,
          name: u.name,
          email: u.email,
          role: u.role || "customer", 
          phone: u.phone || "No disponible",
          address: u.address || "No disponible",
        }))
      setCustomers(parsedCustomers)
      toast({
        title: "Clientes eliminados",
        description: `${ids.length} cliente(s) han sido eliminados.`,
        variant: "destructive",
      })
    } catch (err) {
      console.error('Error al eliminar clientes:', err)
      toast({
        title: "Error",
        description: "No se pudieron eliminar los clientes",
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Teléfono",
    },
    {
      accessorKey: "address",
      header: "Dirección",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const customer = row.original
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/users/${customer.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/users/${customer.id}/edit`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete([customer.id.toString()])}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="hidden flex-col md:flex">
      <Header />
      <div className="border-t">
        <div className="flex">
          <SidebarNav />
          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
                <Button size="sm" onClick={() => router.push("/users/new")}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Nuevo Cliente
                </Button>
              </div>
            </div>
            
            <div className="mb-6">
              <CustomerStats />
            </div>
            
            {isLoading ? (
              <div>Cargando clientes...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <DataTable
                columns={columns}
                data={customers}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}