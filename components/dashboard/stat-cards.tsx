"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingBag, Users, RefreshCw, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface StatCardsProps {
  dashboardData: any;
  isLoading: boolean;
  formatPercent: (value: number) => string;
  getGrowthIndicator: (value: number) => JSX.Element;
}

export function StatCards({ dashboardData, isLoading, formatPercent, getGrowthIndicator }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mb-2" />
          ) : (
            <>
              <div className="text-2xl font-bold">
                {dashboardData?.current_month?.sales !== undefined 
                  ? formatCurrency(dashboardData.current_month.sales)
                  : formatCurrency(0)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                {dashboardData?.growth?.sales !== undefined 
                  ? getGrowthIndicator(dashboardData.growth.sales)
                  : <span className="text-muted-foreground">Sin datos comparativos</span>}
                vs mes anterior
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Órdenes Totales</CardTitle>
          <ShoppingBag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mb-2" />
          ) : (
            <>
              <div className="text-2xl font-bold">
                {dashboardData?.current_month?.orders !== undefined 
                  ? dashboardData.current_month.orders
                  : "0"}
              </div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                {dashboardData?.growth?.orders !== undefined 
                  ? getGrowthIndicator(dashboardData.growth.orders)
                  : <span className="text-muted-foreground">Sin datos comparativos</span>}
                vs mes anterior
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Clientes Nuevos</CardTitle>
          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mb-2" />
          ) : (
            <>
              <div className="text-2xl font-bold">
                {dashboardData?.current_month?.new_customers !== undefined 
                  ? dashboardData.current_month.new_customers
                  : "0"}
              </div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                {dashboardData?.growth?.customers !== undefined 
                  ? getGrowthIndicator(dashboardData.growth.customers)
                  : <span className="text-muted-foreground">Sin datos comparativos</span>}
                vs mes anterior
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Productos Más Vendidos</CardTitle>
          <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-28 mb-2" />
          ) : (
            <>
              <div className="text-lg font-semibold truncate">
                {dashboardData?.top_products && dashboardData.top_products.length > 0
                  ? dashboardData.top_products[0].name
                  : "Sin datos disponibles"}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData?.top_products && dashboardData.top_products.length > 0
                  ? `${dashboardData.top_products[0].total_sold} unidades vendidas`
                  : ""}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 