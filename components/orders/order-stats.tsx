"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingCart, Truck, Clock } from "lucide-react"

// Sample data for the chart
const data = [
  { name: "Mon", orders: 12 },
  { name: "Tue", orders: 18 },
  { name: "Wed", orders: 15 },
  { name: "Thu", orders: 20 },
  { name: "Fri", orders: 25 },
  { name: "Sat", orders: 22 },
  { name: "Sun", orders: 14 },
]

export function OrderStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$12,345.67</div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <span className="text-green-500 dark:text-green-400 flex items-center mr-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              12%
            </span>
            vs mes anterior
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Órdenes Totales</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">126</div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <span className="text-green-500 dark:text-green-400 flex items-center mr-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              8%
            </span>
            vs mes anterior
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Entregas Pendientes</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">18</div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <span className="text-red-500 dark:text-red-400 flex items-center mr-1">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              3%
            </span>
            vs mes anterior
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tiempo Promedio de Procesamiento</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1.5 días</div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <span className="text-green-500 dark:text-green-400 flex items-center mr-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              15%
            </span>
            más rápido que el mes anterior
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Resumen de Órdenes</CardTitle>
          <CardDescription>Número de órdenes por día para la semana actual</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  borderRadius: "var(--radius)",
                  color: "var(--foreground)",
                }}
              />
              <Bar dataKey="orders" fill="var(--primary)" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 4 ? "var(--primary)" : "var(--primary-light)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

