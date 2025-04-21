"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingCart, Truck, Clock, AlertTriangle, Package } from "lucide-react"
import { getDashboardStats } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

export function OrderStats() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getDashboardStats();
        if (response && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
        setError("No se pudieron cargar las estadísticas. Mostrando datos alternativos.");
        // Establecer datos alternativos para mostrar algo en caso de error
        setStats({
          current_month: {
            sales: 0,
            orders: 0,
            pending_orders: 0,
            processing_orders: 0
          },
          growth: {
            sales: 0,
            orders: 0,
            pending_orders: 0,
            processing_orders: 0
          }
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  // Formatear números como moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "USD",
    }).format(value || 0);
  };
  
  // Formatear porcentajes
  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };
  
  // Determinar si mostrar flecha hacia arriba o hacia abajo según el valor
  const getGrowthIndicator = (value: number) => {
    return value >= 0 ? (
      <span className="text-green-500 dark:text-green-400 flex items-center mr-1">
        <ArrowUpRight className="h-3 w-3 mr-1" />
        {formatPercent(value)}
      </span>
    ) : (
      <span className="text-red-500 dark:text-red-400 flex items-center mr-1">
        <ArrowDownRight className="h-3 w-3 mr-1" />
        {formatPercent(value)}
      </span>
    );
  };
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {error && (
        <div className="col-span-4 mb-2 p-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md">
          {error}
        </div>
      )}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mb-2" />
          ) : (
            <>
              <div className="text-2xl font-bold">
                {stats?.current_month?.sales !== undefined 
                  ? formatCurrency(stats.current_month.sales)
                  : formatCurrency(0)}
              </div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
                {stats?.growth?.sales !== undefined 
                  ? getGrowthIndicator(stats.growth.sales)
                  : <span className="text-muted-foreground">Sin datos comparativos</span>}
            vs mes anterior
          </p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Órdenes Totales</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mb-2" />
          ) : (
            <>
              <div className="text-2xl font-bold">
                {stats?.current_month?.orders !== undefined 
                  ? stats.current_month.orders
                  : "0"}
              </div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
                {stats?.growth?.orders !== undefined 
                  ? getGrowthIndicator(stats.growth.orders)
                  : <span className="text-muted-foreground">Sin datos comparativos</span>}
            vs mes anterior
          </p>
            </>
          )}
        </CardContent>
      </Card>
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Órdenes sin Pagar</CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mb-2" />
          ) : (
            <>
              <div className="text-2xl font-bold">
                {stats?.current_month?.pending_orders !== undefined 
                  ? stats.current_month.pending_orders
                  : stats?.order_status_counts?.pending || "0"}
              </div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
                {stats?.growth?.pending_orders !== undefined 
                  ? getGrowthIndicator(stats.growth.pending_orders)
                  : <span className="text-muted-foreground">Sin datos comparativos</span>}
            vs mes anterior
          </p>
            </>
          )}
        </CardContent>
      </Card>
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En Proceso/Envío</CardTitle>
          <Package className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mb-2" />
          ) : (
            <>
              <div className="text-2xl font-bold">
                {stats?.current_month?.processing_orders !== undefined 
                  ? stats.current_month.processing_orders
                  : stats?.order_status_counts?.processing || "0"}
              </div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
                {stats?.growth?.processing_orders !== undefined 
                  ? getGrowthIndicator(stats.growth.processing_orders)
                  : <span className="text-muted-foreground">Sin datos comparativos</span>}
                más que el mes anterior
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

