import { SidebarNav } from "../../../components/sidebar-nav"
import { Header } from "../../../components/header"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Calendar, ShoppingBag, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// This would normally fetch the user data from an API
const getUserData = (id: string) => {
  return {
    id: id,
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, Anytown, USA",
    role: "Customer",
    status: "active",
    joinDate: "January 15, 2025",
    orders: 12,
    lastActive: "2 hours ago",
    avatar: "/placeholder.svg?height=128&width=128",
    recentOrders: [
      { id: "ORD-1042", date: "2025-03-30", items: 3, total: 42.97, status: "Delivered" },
      { id: "ORD-1036", date: "2025-03-25", items: 2, total: 29.98, status: "Processing" },
      { id: "ORD-1028", date: "2025-03-18", items: 1, total: 15.99, status: "Delivered" },
    ],
    notes: "Prefers delivery on weekends. Has water dispenser subscription.",
  }
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const user = getUserData(params.id)

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
                  Back to Users
                </a>
              </Button>
              <h1 className="text-2xl font-bold">User Profile</h1>
              <Badge variant={user.status === "active" ? "default" : "secondary"}>
                {user.status === "active" ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <a href={`/users/${user.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit User
                </a>
              </Button>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-4xl">
                    {user.name.charAt(0)}
                    {user.name.split(" ")[1]?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <Badge
                  variant="outline"
                  className={
                    user.role === "Admin"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 mt-2"
                      : user.role === "Staff"
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
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined: {user.joinDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    <span>Orders: {user.orders}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Last active: {user.lastActive}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="orders">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="notes">Notes & Preferences</TabsTrigger>
                </TabsList>

                <TabsContent value="orders" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Orders</CardTitle>
                      <CardDescription>The user's most recent orders</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {user.recentOrders.map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                          >
                            <div>
                              <div className="font-medium">{order.id}</div>
                              <div className="text-sm text-muted-foreground">
                                {order.date} • {order.items} items
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="font-medium">${order.total.toFixed(2)}</div>
                              <Badge
                                variant="outline"
                                className={
                                  order.status === "Delivered"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : order.status === "Processing"
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                }
                              >
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 text-center">
                        <Button variant="outline" asChild>
                          <a href="/orders">View All Orders</a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Order Statistics</CardTitle>
                      <CardDescription>Overview of user's ordering patterns</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold">{user.orders}</div>
                          <div className="text-sm text-muted-foreground">Total Orders</div>
                        </div>
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold">$349.85</div>
                          <div className="text-sm text-muted-foreground">Lifetime Value</div>
                        </div>
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold">$29.15</div>
                          <div className="text-sm text-muted-foreground">Avg. Order Value</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notes</CardTitle>
                      <CardDescription>Customer notes and preferences</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>{user.notes}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Preferences</CardTitle>
                      <CardDescription>User's product and service preferences</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Preferred Products</h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">5 Gallon Water Bottle</Badge>
                            <Badge variant="secondary">Water Dispenser</Badge>
                            <Badge variant="secondary">Alkaline Water</Badge>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Delivery Preferences</h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">Weekend Delivery</Badge>
                            <Badge variant="secondary">Afternoon (2-5pm)</Badge>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Communication Preferences</h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">Email</Badge>
                            <Badge variant="secondary">SMS Notifications</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

