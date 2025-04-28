"use client"

import { useState } from "react"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { 
  CreditCard, Banknote, Wallet, DollarSign, QrCode, 
  CheckCircle2, AlertTriangle, Upload, ImageIcon 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsItem, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { processPayment, uploadPaymentProof } from "@/lib/api"

// Definición del esquema de validación
const paymentFormSchema = z.object({
  paymentMethod: z.string({
    required_error: "Selecciona un método de pago",
  }),
  payerName: z.string().optional(),
  payerCedula: z.string().optional(),
  payerBankAccount: z.string().optional(),
  payerBank: z.string().optional(),
  payerPhone: z.string().optional(),
  transactionLastDigits: z.string().optional(),
  paymentNotes: z.string().optional(),
})

type PaymentFormValues = z.infer<typeof paymentFormSchema>

// Opciones de métodos de pago
const paymentMethods = [
  { value: "transferencia", label: "Transferencia bancaria", icon: Wallet },
  { value: "pago_movil", label: "Pago móvil", icon: QrCode },
  { value: "punto_venta", label: "Punto de venta", icon: CreditCard },
  { value: "efectivo_divisa_USD", label: "Efectivo (USD)", icon: DollarSign },
  { value: "efectivo_bolivares", label: "Efectivo (Bolívares)", icon: Banknote },
  { value: "tarjeta", label: "Tarjeta de crédito/débito", icon: CreditCard },
  { value: "zelle", label: "Zelle", icon: DollarSign },
  { value: "paypal", label: "PayPal", icon: CreditCard },
  { value: "efectivo_divisa_EUR", label: "Efectivo (EUR)", icon: DollarSign },
]

interface PaymentDetailsProps {
  orderId: string
  currentPaymentProofUrl?: string
  currentPaymentMethod?: string
  currentPaymentNotes?: string
  currentPaymentDetails?: {
    payerName?: string
    payerCedula?: string
    payerBankAccount?: string
    payerBank?: string
    payerPhone?: string
    transactionLastDigits?: string
  }
  onPaymentProcessed?: () => void
}

export function PaymentDetails({
  orderId,
  currentPaymentProofUrl,
  currentPaymentMethod,
  currentPaymentNotes,
  currentPaymentDetails,
  onPaymentProcessed
}: PaymentDetailsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPaymentProofUrl || null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  
  // Encontrar el método de pago actual para mostrar en el formulario
  const defaultMethod = currentPaymentMethod ? 
    paymentMethods.find(m => m.value === currentPaymentMethod)?.value : 
    undefined
  
  // Configurar el formulario con valores actuales si existen
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentMethod: defaultMethod || "",
      payerName: currentPaymentDetails?.payerName || "",
      payerCedula: currentPaymentDetails?.payerCedula || "",
      payerBankAccount: currentPaymentDetails?.payerBankAccount || "",
      payerBank: currentPaymentDetails?.payerBank || "",
      payerPhone: currentPaymentDetails?.payerPhone || "",
      transactionLastDigits: currentPaymentDetails?.transactionLastDigits || "",
      paymentNotes: currentPaymentNotes || "",
    },
  })

  const selectedPaymentMethod = form.watch("paymentMethod")
  
  // Manejar carga de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validar tipo y tamaño
    if (!file.type.includes('image/')) {
      setUploadError("Por favor, sube solo imágenes (JPG, PNG, etc.)")
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("La imagen no debe superar los 5MB")
      return
    }
    
    setPaymentProofFile(file)
    setUploadError(null)
    
    // Crear vista previa
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }
  
  // Procesar pago
  const onSubmit = async (data: PaymentFormValues) => {
    setIsSubmitting(true)
    try {
      let paymentProofUrl = currentPaymentProofUrl
      
      // Si hay un nuevo archivo, subirlo primero
      if (paymentProofFile) {
        const uploadResult = await uploadPaymentProof(orderId, paymentProofFile)
        paymentProofUrl = uploadResult.url || uploadResult.imageUrl || uploadResult.paymentProofUrl
      }
      
      // Procesar el pago con todos los datos
      await processPayment(orderId, {
        paymentMethod: data.paymentMethod,
        paymentProofUrl: paymentProofUrl,
        paymentNotes: data.paymentNotes,
        // Incluir detalles adicionales como se necesite en tu API
        payerDetails: {
          payerName: data.payerName,
          payerCedula: data.payerCedula,
          payerBankAccount: data.payerBankAccount,
          payerBank: data.payerBank,
          payerPhone: data.payerPhone,
          transactionLastDigits: data.transactionLastDigits,
        }
      })
      
      toast({
        title: "Pago procesado correctamente",
        description: "Los detalles del pago han sido registrados",
      })
      
      // Notificar al componente padre si es necesario
      if (onPaymentProcessed) {
        onPaymentProcessed()
      }
    } catch (error) {
      console.error("Error al procesar el pago:", error)
      toast({
        variant: "destructive",
        title: "Error al procesar el pago",
        description: error instanceof Error ? error.message : "Ocurrió un error al procesar el pago",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Renderizar el componente apropiado para el método de pago seleccionado
  const renderPaymentMethodFields = () => {
    // Campos comunes para transferencia y pago móvil
    if (["transferencia", "pago_movil"].includes(selectedPaymentMethod)) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="payerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del pagador</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="payerCedula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cédula/RIF</FormLabel>
                  <FormControl>
                    <Input placeholder="V-12345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="payerBank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banco</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del banco" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="transactionLastDigits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Últimos dígitos/referencia</FormLabel>
                  <FormControl>
                    <Input placeholder="Últimos 4 dígitos o ref." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {selectedPaymentMethod === "pago_movil" && (
            <FormField
              control={form.control}
              name="payerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="04XX-1234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      )
    }
    
    // Campos para pagos en efectivo
    if (["efectivo_divisa_USD", "efectivo_bolivares", "efectivo_divisa_EUR"].includes(selectedPaymentMethod)) {
      return (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="payerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de quien entrega</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )
    }
    
    // Campos para tarjeta, zelle, paypal, etc.
    return (
      <div className="space-y-4">
        {["zelle", "paypal"].includes(selectedPaymentMethod) && (
          <FormField
            control={form.control}
            name="payerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre en la cuenta</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {selectedPaymentMethod === "punto_venta" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="payerBank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banco</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del banco" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="transactionLastDigits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Últimos 4 dígitos</FormLabel>
                  <FormControl>
                    <Input placeholder="Últimos 4 dígitos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Detalles del Pago
          </CardTitle>
          <CardDescription>
            Visualiza o procesa el pago para esta orden
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={previewUrl ? "view" : "process"}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="view">Ver comprobante</TabsTrigger>
              <TabsTrigger value="process">Procesar pago</TabsTrigger>
            </TabsList>
            
            <TabsContent value="view" className="mt-4">
              {previewUrl ? (
                <div className="space-y-4">
                  <div className="aspect-square max-h-[400px] rounded-md overflow-hidden border relative">
                    <Image
                      src={previewUrl}
                      alt="Comprobante de pago"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  
                  {currentPaymentMethod && (
                    <div className="mt-4">
                      <Badge variant="outline" className="mb-2">
                        {paymentMethods.find(m => m.value === currentPaymentMethod)?.label || currentPaymentMethod}
                      </Badge>
                      
                      {currentPaymentDetails && Object.values(currentPaymentDetails).some(v => v) && (
                        <div className="mt-2 space-y-2">
                          <h4 className="text-sm font-medium">Detalles del pago:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {currentPaymentDetails.payerName && (
                              <div>
                                <span className="font-medium">Pagador:</span> {currentPaymentDetails.payerName}
                              </div>
                            )}
                            {currentPaymentDetails.payerCedula && (
                              <div>
                                <span className="font-medium">Cédula/RIF:</span> {currentPaymentDetails.payerCedula}
                              </div>
                            )}
                            {currentPaymentDetails.payerBank && (
                              <div>
                                <span className="font-medium">Banco:</span> {currentPaymentDetails.payerBank}
                              </div>
                            )}
                            {currentPaymentDetails.payerPhone && (
                              <div>
                                <span className="font-medium">Teléfono:</span> {currentPaymentDetails.payerPhone}
                              </div>
                            )}
                            {currentPaymentDetails.transactionLastDigits && (
                              <div>
                                <span className="font-medium">Ref/Últimos dígitos:</span> {currentPaymentDetails.transactionLastDigits}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {currentPaymentNotes && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium">Notas:</h4>
                          <p className="text-sm mt-1">{currentPaymentNotes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <ImageIcon className="h-6 w-6 text-muted-foreground"/>
                  </div>
                  <h3 className="text-lg font-medium">No hay comprobante disponible</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    No se ha subido ningún comprobante de pago para esta orden.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="process" className="mt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método de pago</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un método de pago" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem key={method.value} value={method.value}>
                                <div className="flex items-center">
                                  {method.icon && <method.icon className="mr-2 h-4 w-4" />}
                                  {method.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {selectedPaymentMethod && renderPaymentMethodFields()}
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <Label htmlFor="payment-proof">Comprobante de pago</Label>
                    <div className="border rounded-md p-4">
                      {previewUrl ? (
                        <div className="relative">
                          <div className="aspect-video max-h-[200px] rounded-md overflow-hidden">
                            <Image
                              src={previewUrl}
                              alt="Vista previa"
                              layout="fill"
                              objectFit="cover"
                            />
                          </div>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setPreviewUrl(null)
                              setPaymentProofFile(null)
                            }}
                          >
                            Cambiar
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4">
                          <Label 
                            htmlFor="payment-proof-upload" 
                            className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md hover:bg-muted/50 cursor-pointer"
                          >
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-sm font-medium">Haz clic para subir</span>
                            <span className="text-xs text-muted-foreground mt-1">
                              PNG, JPG o JPEG (máx. 5MB)
                            </span>
                          </Label>
                          <Input
                            id="payment-proof-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </div>
                      )}
                      
                      {uploadError && (
                        <div className="mt-2 text-sm text-destructive flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {uploadError}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="paymentNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas adicionales</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Escribe cualquier información adicional sobre el pago..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Procesando..." : "Procesar pago"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 