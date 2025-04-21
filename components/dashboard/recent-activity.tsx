"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingBag, Truck } from "lucide-react"

interface RecentActivityProps {
  dashboardData: any;
  isLoading: boolean;
  formatCurrency: (value: number) => string;
}

export function RecentActivity({ dashboardData, isLoading, formatCurrency }: RecentActivityProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>Órdenes Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          ) : dashboardData?.recent_orders && dashboardData.recent_orders.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recent_orders.map((order: any, i: number) => (
                <div key={i} className="flex items-center gap-3 border-b pb-3 last:border-0 dark:border-gray-800">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Orden #{order.id}</div>
                    <div className="text-xs text-muted-foreground">
                      {order.items_count} items • {formatCurrency(order.total)}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : "Reciente"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              No hay órdenes recientes para mostrar
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado de Entregas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          ) : dashboardData?.recent_deliveries && dashboardData.recent_deliveries.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recent_deliveries.map((delivery: any, i: number) => (
                <div key={i} className="flex items-center gap-3 border-b pb-3 last:border-0 dark:border-gray-800">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Entrega #{delivery.id}</div>
                    <div className="text-xs text-muted-foreground">Para: {delivery.customer_name || "Cliente"}</div>
                  </div>
                  <Badge
                    variant={delivery.status === "completed" ? "outline" : 
                            delivery.status === "in_transit" ? "default" : "outline"}
                    className={
                      delivery.status === "completed" 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                        : ""
                    }
                  >
                    {delivery.status === "completed" ? "Entregado" : 
                     delivery.status === "in_transit" ? "En tránsito" : 
                     delivery.status === "pending" ? "Pendiente" : 
                     delivery.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              No hay entregas recientes para mostrar
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 