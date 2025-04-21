"use client"

import { useState, useEffect } from "react"
import { Plus, MoreHorizontal, Edit, Trash2, Eye, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getUser } from "@/lib/api"

type User = {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive"
  avatar?: string
  lastActive: string
}

type ApiUser = {
  id_autoincrement: number
  name: string
  email: string
  role: string
  status?: string
  profilePic?: string
  lastLogin?: string
  phone?: string
  address?: string
}

type Role = {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
}

export function UserManagementSettings() {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)
  const [apiUsers, setApiUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        const userData = await getUser()
        console.log("Usuarios obtenidos:", userData)
        
        // Añadir log para ver cada usuario y su rol
        if (Array.isArray(userData)) {
          userData.forEach(user => {
            console.log(`Usuario: ${user.name}, Email: ${user.email}, Rol: ${user.role}, ID: ${user.id_autoincrement}`);
          });
        }
        
        // Filtrar solo usuarios con roles vendor o admin (insensible a mayúsculas/minúsculas)
        const filteredUsers = userData
          .filter((user: ApiUser) => {
            if (!user || user === null) return false;
            
            // Si no tiene rol, mostrar de todas formas para verificación
            if (user.role === undefined || user.role === null) {
              console.log(`Usuario sin rol definido: ${user.name}, Email: ${user.email}`);
              return true;
            }
            
            const role = user.role?.toLowerCase();
            return role === 'vendor' || role === 'admin';
          })
          .map((user: ApiUser) => ({
            id: user.id_autoincrement?.toString() || Math.random().toString(),
            name: user.name || "Sin nombre",
            email: user.email || "Sin email",
            role: user.role || "desconocido",
            status: user.status || "active",
            lastActive: user.lastLogin || "N/A",
            avatar: user.profilePic
          }))
        
        console.log("Usuarios filtrados:", filteredUsers);
        setApiUsers(filteredUsers)
      } catch (error) {
        console.error("Error al obtener usuarios:", error)
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

  const users: User[] = [
    {
      id: "U001",
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40",
      lastActive: "2 hours ago",
    },
    {
      id: "U002",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Manager",
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40",
      lastActive: "1 day ago",
    },
    {
      id: "U003",
      name: "Robert Johnson",
      email: "robert@example.com",
      role: "Staff",
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40",
      lastActive: "Just now",
    },
    {
      id: "U004",
      name: "Emily Davis",
      email: "emily@example.com",
      role: "Staff",
      status: "inactive",
      avatar: "/placeholder.svg?height=40&width=40",
      lastActive: "3 days ago",
    },
    {
      id: "U005",
      name: "Michael Wilson",
      email: "michael@example.com",
      role: "Staff",
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40",
      lastActive: "5 hours ago",
    },
  ]

  const roles: Role[] = [
    {
      id: "R001",
      name: "Admin",
      description: "Full access to all system features",
      permissions: ["manage_users", "manage_products", "manage_orders", "manage_settings", "view_reports"],
      userCount: 1,
    },
    {
      id: "R002",
      name: "Manager",
      description: "Can manage most aspects of the system",
      permissions: ["manage_products", "manage_orders", "view_reports"],
      userCount: 2,
    },
    {
      id: "R003",
      name: "Staff",
      description: "Basic access for daily operations",
      permissions: ["view_products", "manage_orders"],
      userCount: 5,
    },
  ]

  const handleDeleteUsers = (ids: string[]) => {
    toast({
      title: "Users deleted",
      description: `${ids.length} user(s) have been deleted.`,
      variant: "destructive",
    })
  }

  const userColumns: ColumnDef<User>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "avatar",
      header: "",
      cell: ({ row }) => {
        const user = row.original
        return (
          <Avatar>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>
              {user.name.charAt(0)}
              {user.name.split(" ")[1]?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        )
      },
    },
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string
        return (
          <Badge
            variant="outline"
            className={
              role === "Admin"
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                : role === "Manager"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            }
          >
            {role}
          </Badge>
        )
      },
    },
    {
      accessorKey: "lastActive",
      header: "Last Active",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge variant={status === "active" ? "default" : "secondary"}>
            {status === "active" ? "Active" : "Inactive"}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleDeleteUsers([user.id])}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="admins">Admins & Vendors</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage users and their access to the system</CardDescription>
              </div>
              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>Create a new user account with specific role and permissions.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="Enter full name" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Enter email address" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        toast({
                          title: "User created",
                          description: "The user has been created successfully.",
                        })
                        setIsAddUserOpen(false)
                      }}
                    >
                      Create User
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <DataTable columns={userColumns} data={users} searchKey="name" onDelete={handleDeleteUsers} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Roles & Permissions</CardTitle>
                <CardDescription>Manage roles and their associated permissions</CardDescription>
              </div>
              <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Role
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Role</DialogTitle>
                    <DialogDescription>Create a new role with specific permissions.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="role-name">Role Name</Label>
                      <Input id="role-name" placeholder="Enter role name" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role-description">Description</Label>
                      <Input id="role-description" placeholder="Enter role description" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Permissions</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="perm-users" />
                          <label
                            htmlFor="perm-users"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Manage Users
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="perm-products" />
                          <label
                            htmlFor="perm-products"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Manage Products
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="perm-orders" />
                          <label
                            htmlFor="perm-orders"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Manage Orders
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="perm-settings" />
                          <label
                            htmlFor="perm-settings"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Manage Settings
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="perm-reports" />
                          <label
                            htmlFor="perm-reports"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            View Reports
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddRoleOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        toast({
                          title: "Role created",
                          description: "The role has been created successfully.",
                        })
                        setIsAddRoleOpen(false)
                      }}
                    >
                      Create Role
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map((role) => (
                  <Card key={role.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle>{role.name}</CardTitle>
                          <Badge variant="outline">{role.userCount} users</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          {role.name !== "Admin" && (
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                      <CardDescription>{role.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.map((permission) => (
                          <Badge key={permission} variant="secondary">
                            {permission.replace("_", " ")}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="admins">
          <Card>
            <CardHeader>
              <CardTitle>Administradores y Vendedores</CardTitle>
              <CardDescription>Lista de usuarios con roles de administrador o vendedor</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <p>Cargando usuarios...</p>
                </div>
              ) : apiUsers.length > 0 ? (
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rol
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {apiUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <Avatar>
                                  <AvatarImage src={user.avatar} alt={user.name} />
                                  <AvatarFallback>
                                    {user.name.charAt(0)}
                                    {user.name.split(" ")[1]?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className={
                                user.role?.toLowerCase().includes("admin")
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              }
                            >
                              {user.role?.toLowerCase().includes("admin") ? "Administrador" : "Vendedor"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={user.status === "active" ? "default" : "secondary"}>
                              {user.status === "active" ? "Activo" : "Inactivo"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p>No se encontraron usuarios con roles de administrador o vendedor.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

