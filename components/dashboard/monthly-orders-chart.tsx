"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface MonthlyOrdersChartProps {
  ordersByMonth: any[];
  isLoading: boolean;
}

export function MonthlyOrdersChart({ ordersByMonth, isLoading }: MonthlyOrdersChartProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Resumen de Órdenes Mensuales</CardTitle>
        <CardDescription>Número de órdenes por mes durante el año actual</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : ordersByMonth && ordersByMonth.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ordersByMonth}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  borderRadius: "var(--radius)",
                  color: "var(--foreground)",
                }}
              />
              <Bar dataKey="completed" name="Completadas" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name="Pendientes" fill="var(--warning)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
            No hay datos disponibles para mostrar
          </div>
        )}
      </CardContent>
    </Card>
  )
} 