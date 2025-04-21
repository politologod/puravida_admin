"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Save, Wallet, DollarSign, CreditCard, CircleDollarSign, Truck, Store, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"

// Lista de métodos de pago válidos
const VALID_PAYMENT_METHODS = [
  "transferencia",
  "pago_movil",
  "punto_venta",
  "efectivo_divisa_USD",
  "tarjeta",
  "zelle",
  "paypal",
  "efectivo_bolivares",
  "efectivo_divisa_EUR"
];

// Lista de métodos de envío válidos
const VALID_SHIPPING_METHODS = [
  "delivery_moto",
  "pickup_tienda",
  "encomienda_nacional"
];

const paymentsFormSchema = z.object({
  paymentMethods: z.array(z.string()).optional(),
  shippingMethods: z.array(z.string()).optional(),
})

type PaymentsFormValues = z.infer<typeof paymentsFormSchema>

const defaultValues: Partial<PaymentsFormValues> = {
  paymentMethods: ["transferencia", "pago_movil", "punto_venta", "efectivo_divisa_USD"],
  shippingMethods: ["delivery_moto", "pickup_tienda", "encomienda_nacional"],
}

export function EcommerceSettings() {
  const form = useForm<PaymentsFormValues>({
    resolver: zodResolver(paymentsFormSchema),
    defaultValues,
  })

  function onSubmit(data: PaymentsFormValues) {
    toast({
      title: "Configuración de pagos actualizada",
      description: "La configuración de pagos y encomiendas ha sido actualizada correctamente.",
    })
    console.log(data)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pagos y Encomiendas</CardTitle>
          <CardDescription>Configura los métodos de pago y opciones de encomienda</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-4">Métodos de Pago</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Activa o desactiva los métodos de pago que deseas ofrecer en tu tienda. 
                  Esto solo afecta a la visibilidad en la tienda, los métodos siempre estarán disponibles en el backend.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center gap-3">
                      <Wallet className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Transferencia</h4>
                        <p className="text-sm text-muted-foreground">Pago por transferencia bancaria</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center gap-3">
                      <Wallet className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Pago Móvil</h4>
                        <p className="text-sm text-muted-foreground">Pago a través de aplicación móvil</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Punto de Venta</h4>
                        <p className="text-sm text-muted-foreground">Pago con datafono o terminal de punto de venta</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Efectivo Divisa (USD)</h4>
                        <p className="text-sm text-muted-foreground">Pago en efectivo con dólares americanos</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Tarjeta</h4>
                        <p className="text-sm text-muted-foreground">Pago con tarjeta de crédito o débito</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Zelle</h4>
                        <p className="text-sm text-muted-foreground">Pago a través de Zelle</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">PayPal</h4>
                        <p className="text-sm text-muted-foreground">Pago a través de PayPal</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center gap-3">
                      <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Efectivo Bolívares</h4>
                        <p className="text-sm text-muted-foreground">Pago en efectivo con bolívares</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center gap-3">
                      <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Efectivo Divisa (EUR)</h4>
                        <p className="text-sm text-muted-foreground">Pago en efectivo con euros</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="text-sm font-medium mb-4">Métodos de Envío</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Activa o desactiva los métodos de envío disponibles para tu tienda.
                  El costo de envío se calcula manualmente en cada pedido.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Entrega en Moto</h4>
                        <p className="text-sm text-muted-foreground">Servicio de entrega por motorizado</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center gap-3">
                      <Store className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Retiro en Tienda</h4>
                        <p className="text-sm text-muted-foreground">Cliente retira su pedido en la tienda</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Encomienda Nacional</h4>
                        <p className="text-sm text-muted-foreground">Envío por servicio de encomienda a nivel nacional</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Guardar Configuración
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

