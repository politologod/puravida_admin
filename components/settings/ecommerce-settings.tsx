"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Save, Link, ShoppingCart, CreditCard, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

const ecommerceFormSchema = z.object({
  storeName: z.string().min(2, {
    message: "Store name must be at least 2 characters.",
  }),
  storeUrl: z.string().url({
    message: "Please enter a valid URL.",
  }),
  apiKey: z.string().min(5, {
    message: "API key must be at least 5 characters.",
  }),
  apiSecret: z.string().min(5, {
    message: "API secret must be at least 5 characters.",
  }),
  syncProducts: z.boolean().default(true),
  syncOrders: z.boolean().default(true),
  syncCustomers: z.boolean().default(true),
  syncInterval: z.string(),
  orderPrefix: z.string().optional(),
  defaultTax: z.coerce.number().min(0).max(100, {
    message: "Tax rate must be between 0 and 100.",
  }),
  shippingMethods: z.array(z.string()).optional(),
  paymentMethods: z.array(z.string()).optional(),
})

type EcommerceFormValues = z.infer<typeof ecommerceFormSchema>

const defaultValues: Partial<EcommerceFormValues> = {
  storeName: "Puravida 23 E-commerce",
  storeUrl: "https://puravida23.com",
  apiKey: "pk_test_123456789",
  apiSecret: "sk_test_123456789",
  syncProducts: true,
  syncOrders: true,
  syncCustomers: true,
  syncInterval: "15min",
  orderPrefix: "PV-",
  defaultTax: 5,
  shippingMethods: ["standard", "express"],
  paymentMethods: ["credit_card", "paypal", "cash_on_delivery"],
}

export function EcommerceSettings() {
  const form = useForm<EcommerceFormValues>({
    resolver: zodResolver(ecommerceFormSchema),
    defaultValues,
  })

  function onSubmit(data: EcommerceFormValues) {
    toast({
      title: "E-commerce settings updated",
      description: "Your e-commerce settings have been updated successfully.",
    })
    console.log(data)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="payment">Payment & Shipping</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General E-commerce Settings</CardTitle>
              <CardDescription>Configure your e-commerce store settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="storeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter store name" {...field} />
                          </FormControl>
                          <FormDescription>The name of your e-commerce store</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="storeUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store URL</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-9" placeholder="Enter store URL" {...field} />
                            </div>
                          </FormControl>
                          <FormDescription>The URL of your e-commerce website</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="orderPrefix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Prefix</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter order prefix" {...field} />
                        </FormControl>
                        <FormDescription>Prefix for order numbers (e.g., PV- will result in PV-1001)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="defaultTax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Tax Rate (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" max="100" {...field} />
                        </FormControl>
                        <FormDescription>Default tax rate applied to products</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Save General Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration">
          <Card>
            <CardHeader>
              <CardTitle>E-commerce Integration</CardTitle>
              <CardDescription>Configure integration with your e-commerce platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter API key" {...field} />
                          </FormControl>
                          <FormDescription>API key for e-commerce platform integration</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="apiSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Secret</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter API secret" {...field} />
                          </FormControl>
                          <FormDescription>API secret for e-commerce platform integration</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Synchronization Settings</h3>

                    <FormField
                      control={form.control}
                      name="syncProducts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Sync Products</FormLabel>
                            <FormDescription>Synchronize products with e-commerce platform</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="syncOrders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Sync Orders</FormLabel>
                            <FormDescription>Synchronize orders with e-commerce platform</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="syncCustomers"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Sync Customers</FormLabel>
                            <FormDescription>Synchronize customers with e-commerce platform</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="syncInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sync Interval</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sync interval" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="5min">Every 5 minutes</SelectItem>
                            <SelectItem value="15min">Every 15 minutes</SelectItem>
                            <SelectItem value="30min">Every 30 minutes</SelectItem>
                            <SelectItem value="1hour">Every hour</SelectItem>
                            <SelectItem value="manual">Manual sync only</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>How often to synchronize with e-commerce platform</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Save Integration Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment & Shipping</CardTitle>
              <CardDescription>Configure payment and shipping methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-4">Payment Methods</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">Credit Card</h4>
                          <p className="text-sm text-muted-foreground">Accept credit card payments</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center gap-3">
                        <svg
                          className="h-5 w-5 text-muted-foreground"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6.5 14C5.67157 14 5 13.3284 5 12.5C5 11.6716 5.67157 11 6.5 11C7.32843 11 8 11.6716 8 12.5C8 13.3284 7.32843 14 6.5 14Z"
                            fill="currentColor"
                          />
                          <path
                            d="M17.5 14C16.6716 14 16 13.3284 16 12.5C16 11.6716 16.6716 11 17.5 11C18.3284 11 19 11.6716 19 12.5C19 13.3284 18.3284 14 17.5 14Z"
                            fill="currentColor"
                          />
                          <path
                            d="M12 14C11.1716 14 10.5 13.3284 10.5 12.5C10.5 11.6716 11.1716 11 12 11C12.8284 11 13.5 11.6716 13.5 12.5C13.5 13.3284 12.8284 14 12 14Z"
                            fill="currentColor"
                          />
                          <path
                            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div>
                          <h4 className="font-medium">PayPal</h4>
                          <p className="text-sm text-muted-foreground">Accept PayPal payments</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">Cash on Delivery</h4>
                          <p className="text-sm text-muted-foreground">Accept cash payments on delivery</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <Button className="w-full mt-2">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Payment Method
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-4">Shipping Methods</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <h4 className="font-medium">Standard Shipping</h4>
                        <p className="text-sm text-muted-foreground">3-5 business days</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">$5.99</span>
                        <Switch defaultChecked />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <h4 className="font-medium">Express Shipping</h4>
                        <p className="text-sm text-muted-foreground">1-2 business days</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">$12.99</span>
                        <Switch defaultChecked />
                      </div>
                    </div>

                    <Button className="w-full mt-2">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Shipping Method
                    </Button>
                  </div>
                </div>

                <Button onClick={form.handleSubmit(onSubmit)}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Payment & Shipping Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

