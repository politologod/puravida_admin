"use client"
import { SidebarNav } from "../../components/sidebar-nav"
import { Header } from "../../components/header"
import { Button } from "@/components/ui/button"
import { Download, UserPlus, Edit, Trash2, Eye, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/data-table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { getUser, deleteUser } from "@/lib/api"
import { useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import { add } from "date-fns"
// ... existing code ...

type User = {
  id: number
  name: string
  email: string
  role: string
  orders: number
  lastActive: string
  status: "active" | "inactive"
  avatar?: string
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        const data = await getUser()
        const parsedUsers = data.map((u: any) => ({
          id: u.id_autoincrement,
          name: u.name,
          email: u.email,
          role: u.role || "customer", 
          phone: u.phone,
          address: u.address,
        }))
        setUsers(parsedUsers)
        setError(null)
      } catch (err) {
        console.error('Error al obtener usuarios:', err)
        setError('Error al cargar los usuarios')
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  useEffect(() => {
    console.log("Usuarios actualizados:", users)
  }, [users])

  const handleDelete = async (ids: string[]) => {
    try {
      for (const id of ids) {
        await deleteUser(id)
      }
      // Actualizar la lista de usuarios después de eliminar
      const updatedUsers = await getUser()
      setUsers(updatedUsers)
      toast({
        title: "Usuarios eliminados",
        description: `${ids.length} usuario(s) han sido eliminados.`,
        variant: "destructive",
      })
    } catch (err) {
      console.error('Error al eliminar usuarios:', err)
      toast({
        title: "Error",
        description: "No se pudieron eliminar los usuarios",
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
      accessorKey: "role",
      header: "Rol",
    },
    {
      accessorKey: "phone",
      header: "Telefono",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/users/${user.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/users/${user.id}/edit`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete([user.id.toString()])}
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
              <h2 className="text-3xl font-bold tracking-tight">Usuarios</h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
                <Button size="sm" onClick={() => router.push("/users/new")}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Nuevo Usuario
                </Button>
              </div>
            </div>
            {isLoading ? (
              <div>Cargando usuarios...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <DataTable
                columns={columns}
                data={users}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}