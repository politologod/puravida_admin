"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarNav } from "../../../../components/sidebar-nav"
import { Header } from "../../../../components/header"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, MapPin, Clock, User, Phone, CheckCircle2, Package, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
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
  },
  date: "2025-04-01",
  total: 42.97,
  status: "processing",
  deliveryMethod: "delivery",
  deliveryStatus: "pending",
  deliveryAddress: "123 Main St, Anytown, USA",
  deliveryDate: "2025-04-01",
  deliveryNotes: "Leave at the front door",
}

export default function UpdateDeliveryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [deliveryStatus, setDeliveryStatus] = useState(order.deliveryStatus)
  const [trackingNumber, setTrackingNumber] = useState("")
  const [driverName, setDriverName] = useState("")
  const [driverPhone, setDriverPhone] = useState("")
  const [estimatedDelivery, setEstimatedDelivery] = useState("")
  const [deliveryNotes, setDeliveryNotes] = useState(order.deliveryNotes || "")

  const handleUpdateDelivery = () => {
    toast({
      title: "Delivery updated",
      description: "The delivery information has been updated successfully.",
    })

    router.push(`/orders/${params.id}`)
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.push(`/orders/${params.id}`)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Order
              </Button>
              <h1 className="text-2xl font-bold">Update Delivery</h1>
              <Badge variant="outline">Order {order.orderNumber}</Badge>
            </div>
            <Button onClick={handleUpdateDelivery}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Status</CardTitle>
                  <CardDescription>Update the current status of this delivery</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="delivery-status">Current Status</Label>
                      <Select defaultValue={deliveryStatus} onValueChange={setDeliveryStatus}>
                        <SelectTrigger id="delivery-status" className="mt-1">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_transit">In Transit</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {deliveryStatus === "in_transit" && (
                      <div className="p-4 border rounded-md bg-yellow-50 dark:bg-yellow-950 flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        <div>
                          <h4 className="font-medium text-yellow-600 dark:text-yellow-400">In Transit</h4>
                          <p className="text-sm text-yellow-600 dark:text-yellow-400">
                            This order is currently being delivered.
                          </p>
                        </div>
                      </div>
                    )}

                    {deliveryStatus === "delivered" && (
                      <div className="p-4 border rounded-md bg-green-50 dark:bg-green-950 flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <div>
                          <h4 className="font-medium text-green-600 dark:text-green-400">Delivered</h4>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            This order has been successfully delivered.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tracking-number">Tracking Number</Label>
                        <Input
                          id="tracking-number"
                          placeholder="Enter tracking number"
                          className="mt-1"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="estimated-delivery">Estimated Delivery</Label>
                        <Input
                          id="estimated-delivery"
                          type="datetime-local"
                          className="mt-1"
                          value={estimatedDelivery}
                          onChange={(e) => setEstimatedDelivery(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="driver-name">Driver Name</Label>
                        <Input
                          id="driver-name"
                          placeholder="Enter driver name"
                          className="mt-1"
                          value={driverName}
                          onChange={(e) => setDriverName(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="driver-phone">Driver Phone</Label>
                        <Input
                          id="driver-phone"
                          placeholder="Enter driver phone"
                          className="mt-1"
                          value={driverPhone}
                          onChange={(e) => setDriverPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="delivery-notes">Delivery Notes</Label>
                      <Textarea
                        id="delivery-notes"
                        placeholder="Enter delivery notes"
                        className="mt-1"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delivery Timeline</CardTitle>
                  <CardDescription>Track the progress of this delivery</CardDescription>
                </CardHeader>
                <CardContent>
                  <OrderDeliveryTimeline />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
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

                    <Separator />

                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Customer</div>
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>{order.customer.name}</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Contact</div>
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>{order.customer.phone}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open("https://maps.google.com", "_blank")}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    View on Map
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">Puravida 5 Gallon Water Bottle</div>
                        <div className="text-sm text-muted-foreground">Quantity: 1</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">Puravida Water Refill Service</div>
                        <div className="text-sm text-muted-foreground">Quantity: 2</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">Water Bottle Carrier</div>
                        <div className="text-sm text-muted-foreground">Quantity: 1</div>
                      </div>
                    </div>
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

