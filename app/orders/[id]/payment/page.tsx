"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { PaymentDetails } from "@/components/orders/payment-details"
import { getOrderById } from "@/lib/api"

export default function OrderPaymentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true)
        const data = await getOrderById(params.id)
        
        // Construir objeto de orden normalizado
        const normalizedOrder = {
          id: data.id || data._id || params.id,
          orderNumber: data.orderNumber || `ORD-${data.id || params.id}`,
          total: data.total || 0,
          status: data.status || "pendiente por pagar",
          shippingAddress: data.shippingAddress || data.address || "Sin dirección",
          paymentMethod: data.paymentMethod || "",
          paymentProofUrl: data.paymentProofUrl || "",
          paymentDate: data.paymentDate || data.updatedAt,
          paymentNotes: data.paymentNotes || "",
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          
          // Extraer detalles de pago si existen
          paymentDetails: {
            payerName: data.payerName || data.payerDetails?.payerName,
            payerCedula: data.payerCedula || data.payerDetails?.payerCedula,
            payerBankAccount: data.payerBankAccount || data.payerDetails?.payerBankAccount,
            payerBank: data.payerBank || data.payerDetails?.payerBank,
            payerPhone: data.payerPhone || data.payerDetails?.payerPhone,
            transactionLastDigits: data.transactionLastDigits || data.payerDetails?.transactionLastDigits,
          }
        }
        
        setOrder(normalizedOrder)
        setError(null)
      } catch (err) {
        console.error("Error al cargar detalles de la orden:", err)
        setError("Error al cargar los detalles de la orden")
        toast({
          title: "Error",
          description: "No se pudieron cargar los detalles de la orden. Por favor intente nuevamente.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchOrderDetails()
    }
  }, [params.id])

  const handlePaymentProcessed = () => {
    toast({
      title: "Pago procesado",
      description: "El pago ha sido procesado exitosamente",
    })
    
    // Redirigir al detalle de la orden
    router.push(`/orders/${params.id}`)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <SidebarNav />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto p-6 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => router.push(`/orders/${params.id}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Procesar Pago</h1>
              <p className="text-muted-foreground">
                {order ? `Orden ${order.orderNumber || `#${order.id}`}` : `Orden #${params.id}`}
              </p>
            </div>
          </div>

          {error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : (
            <PaymentDetails 
              orderId={params.id}
              currentPaymentProofUrl={order?.paymentProofUrl}
              currentPaymentMethod={order?.paymentMethod}
              currentPaymentNotes={order?.paymentNotes}
              currentPaymentDetails={order?.paymentDetails}
              onPaymentProcessed={handlePaymentProcessed}
            />
          )}
        </div>
      </div>
    </div>
  )
} 