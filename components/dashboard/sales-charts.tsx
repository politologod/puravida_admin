"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface SalesChartsProps {
  salesByCategory: any[];
  salesByMonth: any[];
  isLoading: boolean;
  formatCurrency: (value: number) => string;
}

export function SalesCharts({ salesByCategory, salesByMonth, isLoading, formatCurrency }: SalesChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>Ventas por Categoría</CardTitle>
          <CardDescription>Distribución de ventas por categoría de producto</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : salesByCategory && salesByCategory.length > 0 ? (
            <div className="h-full w-full flex flex-col">
              <div className="flex-1 flex items-end gap-2 pb-6">
                {salesByCategory.map((item, index) => {
                  // Calcular el porcentaje de la categoría sobre el total
                  const totalSales = salesByCategory.reduce((sum, cat) => sum + cat.total, 0);
                  const percentage = totalSales > 0 ? (item.total / totalSales) * 100 : 0;
                  
                  return (
                    <div key={index} className="relative flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-500 dark:bg-blue-600 rounded-t-md"
                        style={{ height: `${percentage * 2}px` }}
                      ></div>
                      <span className="absolute -top-6 text-xs font-medium">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between">
                {salesByCategory.map((item, index) => (
                  <div key={index} className="text-xs text-center text-muted-foreground">
                    {item.category}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              No hay datos disponibles para mostrar
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Ingresos</CardTitle>
          <CardDescription>Ingresos mensuales durante el año actual</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : salesByMonth && salesByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  formatter={(value) => [formatCurrency(value as number), "Ventas"]}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                    color: "var(--foreground)",
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--primary)" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              No hay datos disponibles para mostrar
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 