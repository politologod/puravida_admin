"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Save, Plus, Trash2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

const deliveryFormSchema = z.object({
  enableDelivery: z.boolean().default(true),
  minOrderAmount: z.coerce.number().min(0, {
    message: "Minimum order amount must be a positive number.",
  }),
  freeDeliveryThreshold: z.coerce.number().min(0, {
    message: "Free delivery threshold must be a positive number.",
  }),
  defaultDeliveryFee: z.coerce.number().min(0, {
    message: "Default delivery fee must be a positive number.",
  }),
  maxDeliveryDistance: z.coerce.number().min(0, {
    message: "Maximum delivery distance must be a positive number.",
  }),
  deliveryTimeWindow: z.coerce.number().min(15, {
    message: "Delivery time window must be at least 15 minutes.",
  }),
  enableScheduledDelivery: z.boolean().default(true),
})

type DeliveryFormValues = z.infer<typeof deliveryFormSchema>

const defaultValues: Partial<DeliveryFormValues> = {
  enableDelivery: true,
  minOrderAmount: 10,
  freeDeliveryThreshold: 50,
  defaultDeliveryFee: 5,
  maxDeliveryDistance: 15,
  deliveryTimeWindow: 60,
  enableScheduledDelivery: true,
}

// Sample delivery zones
const deliveryZones = [
  { id: "1", name: "Zone 1 - Downtown", fee: 3.99, minOrder: 10, estimatedTime: "30-45 min" },
  { id: "2", name: "Zone 2 - Uptown", fee: 4.99, minOrder: 15, estimatedTime: "45-60 min" },
  { id: "3", name: "Zone 3 - Suburbs", fee: 6.99, minOrder: 20, estimatedTime: "60-75 min" },
]

// Sample delivery time slots
const deliveryTimeSlots = [
  { id: "1", day: "Monday", startTime: "09:00", endTime: "18:00", active: true },
  { id: "2", day: "Tuesday", startTime: "09:00", endTime: "18:00", active: true },
  { id: "3", day: "Wednesday", startTime: "09:00", endTime: "18:00", active: true },
  { id: "4", day: "Thursday", startTime: "09:00", endTime: "18:00", active: true },
  { id: "5", day: "Friday", startTime: "09:00", endTime: "18:00", active: true },
  { id: "6", day: "Saturday", startTime: "10:00", endTime: "16:00", active: true },
  { id: "7", day: "Sunday", startTime: "10:00", endTime: "14:00", active: false },
]

export function DeliverySettings() {
  const form = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliveryFormSchema),
    defaultValues,
  })

  function onSubmit(data: DeliveryFormValues) {
    toast({
      title: "Delivery settings updated",
      description: "Your delivery settings have been updated successfully.",
    })
    console.log(data)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="zones">Delivery Zones</TabsTrigger>
          <TabsTrigger value="schedule">Delivery Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Delivery Settings</CardTitle>
              <CardDescription>Configure your basic delivery options</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="enableDelivery"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Enable Delivery</FormLabel>
                          <FormDescription>Turn delivery services on or off</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("enableDelivery") && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="minOrderAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Minimum Order Amount ($)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormDescription>Minimum order amount required for delivery</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="defaultDeliveryFee"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Delivery Fee ($)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormDescription>Standard delivery fee for all orders</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="freeDeliveryThreshold"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Free Delivery Threshold ($)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormDescription>Order amount above which delivery is free</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="maxDeliveryDistance"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maximum Delivery Distance (km)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.1" {...field} />
                              </FormControl>
                              <FormDescription>Maximum distance for delivery service</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="deliveryTimeWindow"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Delivery Time Window (minutes)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormDescription>Estimated delivery time window</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="enableScheduledDelivery"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Scheduled Delivery</FormLabel>
                                <FormDescription>Allow customers to schedule deliveries</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Save Delivery Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zones">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Zones</CardTitle>
              <CardDescription>Configure delivery zones with specific fees and rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deliveryZones.map((zone) => (
                  <div key={zone.id} className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">{zone.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Min. Order: ${zone.minOrder} • Est. Time: {zone.estimatedTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">${zone.fee} Delivery Fee</Badge>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Delivery Zone
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Schedule</CardTitle>
              <CardDescription>Configure when deliveries are available</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deliveryTimeSlots.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="w-24 font-medium">{slot.day}</div>
                      <div>
                        {slot.startTime} - {slot.endTime}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch checked={slot.active} />
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

