"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarNav } from "../../../components/sidebar-nav"
import { Header } from "../../../components/header"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Printer,
  Download,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Truck,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  ShoppingBag,
  Package,
  MessageSquare,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { OrderDeliveryTimeline } from "@/components/orders/order-delivery-timeline"

// Sample order data
const order = {
  id: "1",
  orderNumber: "ORD-1042",
  customer: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, Anytown, USA",
    avatar: "/placeholder.svg?height=128&width=128",
  },
  date: "2025-04-01",
  total: 42.97,
  subtotal: 38.97,
  tax: 4.0,
  status: "delivered",
  paymentStatus: "paid",
  paymentMethod: "Credit Card",
  items: [
    {
      id: "1",
      name: "Puravida 5 Gallon Water Bottle",
      price: 15.99,
      quantity: 1,
      total: 15.99,
      image: "/placeholder.svg?height=64&width=64",
    },
    {
      id: "2",
      name: "Puravida Water Refill Service (5 Gallon)",
      price: 8.99,
      quantity: 2,
      total: 17.98,
      image: "/placeholder.svg?height=64&width=64",
    },
    {
      id: "3",
      name: "Water Bottle Carrier",
      price: 5.0,
      quantity: 1,
      total: 5.0,
      image: "/placeholder.svg?height=64&width=64",
    },
  ],
  source: "pos",
  deliveryMethod: "delivery",
  deliveryStatus: "delivered",
  deliveryAddress: "123 Main St, Anytown, USA",
  deliveryDate: "2025-04-01",
  deliveryNotes: "Leave at the front door",
  notes: "Customer requested delivery before noon",
  history: [
    {
      date: "2025-04-01 14:30",
      action: "Order delivered",
      user: "Delivery Driver",
    },
    {
      date: "2025-04-01 10:15",
      action: "Order out for delivery",
      user: "Warehouse Staff",
    },
    {
      date: "2025-04-01 08:30",
      action: "Order processed",
      user: "System",
    },
    {
      date: "2025-03-31 16:45",
      action: "Payment received",
      user: "System",
    },
    {
      date: "2025-03-31 16:42",
      action: "Order created",
      user: "Sales Associate",
    },
  ],
}

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [note, setNote] = useState("")

  const handleAddNote = () => {
    if (note.trim()) {
      toast({
        title: "Note added",
        description: "Your note has been added to the order.",
      })
      setNote("")
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.push("/orders")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Button>
              <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
              <Badge
                variant="outline"
                className={
                  order.status === "delivered"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : order.status === "processing"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      : order.status === "pending"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                }
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="flex items-center gap-2" onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => router.push(`/orders/${params.id}/edit`)}
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                className="flex items-center gap-2"
                onClick={() => {
                  toast({
                    title: "Order deleted",
                    description: "The order has been deleted.",
                    variant: "destructive",
                  })
                  router.push("/orders")
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Order Details</CardTitle>
                    <CardDescription>
                      Order {order.orderNumber} • {order.date}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {order.status !== "delivered" && order.status !== "cancelled" && (
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => {
                          toast({
                            title: "Order status updated",
                            description: "Order has been marked as delivered.",
                          })
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Mark as Delivered
                      </Button>
                    )}
                    {order.status !== "cancelled" && (
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 text-destructive"
                        onClick={() => {
                          toast({
                            title: "Order cancelled",
                            description: "Order has been cancelled.",
                            variant: "destructive",
                          })
                        }}
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                className="h-12 w-12 rounded-md object-cover"
                              />
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-muted-foreground">SKU: PRD-{item.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right font-medium">${item.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={3}>Subtotal</TableCell>
                        <TableCell className="text-right">${order.subtotal.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3}>Tax</TableCell>
                        <TableCell className="text-right">${order.tax.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell className="text-right font-bold">${order.total.toFixed(2)}</TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </CardContent>
              </Card>

              <Tabs defaultValue="delivery">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="delivery">Delivery</TabsTrigger>
                  <TabsTrigger value="history">Order History</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="delivery">
                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Information</CardTitle>
                      <CardDescription>Tracking and delivery details</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {order.deliveryMethod.charAt(0).toUpperCase() + order.deliveryMethod.slice(1)}
                          </Badge>
                          {order.deliveryStatus && (
                            <Badge
                              variant="outline"
                              className={
                                order.deliveryStatus === "delivered"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : order.deliveryStatus === "in_transit"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              }
                            >
                              {order.deliveryStatus === "in_transit"
                                ? "In Transit"
                                : order.deliveryStatus.charAt(0).toUpperCase() + order.deliveryStatus.slice(1)}
                            </Badge>
                          )}
                        </div>
                        {order.deliveryMethod === "delivery" && order.deliveryStatus !== "delivered" && (
                          <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => router.push(`/orders/${params.id}/delivery`)}
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            Update Delivery
                          </Button>
                        )}
                      </div>

                      {order.deliveryMethod === "delivery" && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-muted-foreground">Delivery Address</div>
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>{order.deliveryAddress}</div>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="text-sm font-medium text-muted-foreground">Delivery Date</div>
                              <div className="flex items-start gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>{order.deliveryDate}</div>
                              </div>
                            </div>
                          </div>

                          {order.deliveryNotes && (
                            <div className="space-y-1 mb-6">
                              <div className="text-sm font-medium text-muted-foreground">Delivery Notes</div>
                              <div className="p-3 bg-muted rounded-md">{order.deliveryNotes}</div>
                            </div>
                          )}

                          <OrderDeliveryTimeline />
                        </>
                      )}

                      {order.deliveryMethod === "pickup" && (
                        <div className="text-center p-6">
                          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <h3 className="text-lg font-medium mb-1">Pickup Order</h3>
                          <p className="text-muted-foreground">This order is set for customer pickup at the store.</p>
                        </div>
                      )}

                      {order.deliveryMethod === "refill" && (
                        <div className="text-center p-6">
                          <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <h3 className="text-lg font-medium mb-1">Refill Service</h3>
                          <p className="text-muted-foreground">This order is for our water refill service.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="history">
                  <Card>
                    <CardHeader>
                      <CardTitle>Order History</CardTitle>
                      <CardDescription>Timeline of order events</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {order.history.map((event, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="relative mt-1">
                              <div className="h-2 w-2 rounded-full bg-primary"></div>
                              {index !== order.history.length - 1 && (
                                <div className="absolute top-2 bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-border"></div>
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="text-sm font-medium">{event.action}</div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{event.date}</span>
                                <span>•</span>
                                <span>{event.user}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notes">
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Notes</CardTitle>
                      <CardDescription>Notes and comments for this order</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {order.notes ? (
                        <div className="space-y-4">
                          <div className="p-4 border rounded-md">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">System Note</div>
                              <div className="text-xs text-muted-foreground">{order.date}</div>
                            </div>
                            <p>{order.notes}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-6">
                          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <h3 className="text-lg font-medium mb-1">No Notes</h3>
                          <p className="text-muted-foreground">There are no notes for this order yet.</p>
                        </div>
                      )}

                      <div className="mt-6 space-y-2">
                        <div className="font-medium">Add a Note</div>
                        <Textarea
                          placeholder="Type your note here..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                        />
                        <Button onClick={handleAddNote}>Add Note</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={order.customer.avatar} alt={order.customer.name} />
                      <AvatarFallback>{order.customer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{order.customer.name}</div>
                      <div className="text-sm text-muted-foreground">Customer since 2024</div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">{order.customer.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">{order.customer.phone}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">{order.customer.address}</div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => router.push(`/users/${order.customer.name.toLowerCase().replace(" ", "-")}`)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    View Customer Profile
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-muted-foreground">Payment Method</div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>{order.paymentMethod}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-muted-foreground">Payment Status</div>
                      <Badge
                        variant="outline"
                        className={
                          order.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : order.paymentStatus === "unpaid"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }
                      >
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-muted-foreground">Order Source</div>
                      <Badge
                        variant="outline"
                        className={
                          order.source === "pos"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                        }
                      >
                        {order.source === "pos" ? "POS" : "E-commerce"}
                      </Badge>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Subtotal</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Tax</span>
                      <span>${order.tax.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {order.paymentStatus === "unpaid" && (
                    <Button className="w-full mt-4">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Process Payment
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Related Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6">
                    <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium mb-1">No Related Orders</h3>
                    <p className="text-muted-foreground">This customer has no other related orders.</p>
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

