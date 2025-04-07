"use client"

import { SidebarNav } from "../../components/sidebar-nav"
import { Header } from "../../components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, ShoppingBag, Users, ArrowUpRight, ArrowDownRight, Truck, RefreshCw } from "lucide-react"
import { useState } from "react"

export default function DashboardPage() {
  const [chartData] = useState({
    salesByCategory: [
      { category: "Bottled Water", value: 45 },
      { category: "Refill Service", value: 30 },
      { category: "Accessories", value: 15 },
      { category: "Other", value: 10 },
    ],
    revenueByMonth: [
      { month: "Jan", value: 4500 },
      { month: "Feb", value: 5200 },
      { month: "Mar", value: 4800 },
      { month: "Apr", value: 5800 },
      { month: "May", value: 6200 },
      { month: "Jun", value: 6800 },
    ],
    customerGrowth: [
      { month: "Jan", value: 120 },
      { month: "Feb", value: 145 },
      { month: "Mar", value: 162 },
      { month: "Apr", value: 190 },
      { month: "May", value: 210 },
      { month: "Jun", value: 235 },
    ],
  })

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Bienvenido al Sistema POS Puravida 23</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                <Droplets className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Órdenes Totales</CardTitle>
                <ShoppingBag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
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
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Clientes Totales</CardTitle>
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">567</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <span className="text-green-500 dark:text-green-400 flex items-center mr-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    15%
                  </span>
                  vs mes anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Servicios de Recarga</CardTitle>
                <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">432</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <span className="text-red-500 dark:text-red-400 flex items-center mr-1">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    3%
                  </span>
                  vs mes anterior
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Product Category</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full flex flex-col">
                  <div className="flex-1 flex items-end gap-2 pb-6">
                    {chartData.salesByCategory.map((item, index) => (
                      <div key={index} className="relative flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-blue-500 dark:bg-blue-600 rounded-t-md"
                          style={{ height: `${item.value * 2}px` }}
                        ></div>
                        <span className="absolute -top-6 text-xs font-medium">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    {chartData.salesByCategory.map((item, index) => (
                      <div key={index} className="text-xs text-center text-muted-foreground">
                        {item.category}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full flex flex-col">
                  <div className="flex-1 flex items-end gap-2 pb-6">
                    {chartData.revenueByMonth.map((item, index) => (
                      <div key={index} className="relative flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-green-500 dark:bg-green-600 rounded-t-md"
                          style={{ height: `${item.value / 100}px` }}
                        ></div>
                        <span className="absolute -top-6 text-xs font-medium">${item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    {chartData.revenueByMonth.map((item, index) => (
                      <div key={index} className="text-xs text-center text-muted-foreground">
                        {item.month}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full flex flex-col">
                  <div className="flex-1 flex items-end gap-2 pb-6">
                    {chartData.customerGrowth.map((item, index) => (
                      <div key={index} className="relative flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-purple-500 dark:bg-purple-600 rounded-t-md"
                          style={{ height: `${item.value / 2}px` }}
                        ></div>
                        <span className="absolute -top-6 text-xs font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    {chartData.customerGrowth.map((item, index) => (
                      <div key={index} className="text-xs text-center text-muted-foreground">
                        {item.month}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3 border-b pb-3 last:border-0 dark:border-gray-800">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <ShoppingBag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Order #104{i}</div>
                        <div className="text-xs text-muted-foreground">2 items • $34.98</div>
                      </div>
                      <div className="text-xs text-muted-foreground">Just now</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3 border-b pb-3 last:border-0 dark:border-gray-800">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Delivery #103{i}</div>
                        <div className="text-xs text-muted-foreground">Customer: John Doe</div>
                      </div>
                      <div className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-1 rounded-full">
                        In Transit
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

