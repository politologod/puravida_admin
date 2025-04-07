"use client"

import { useState } from "react"
import { SidebarNav } from "../../components/sidebar-nav"
import { Header } from "../../components/header"
import { Button } from "@/components/ui/button"
import { Download, Filter, Plus, RefreshCw, Search, LinkIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { OrdersTable } from "@/components/orders/orders-table"
import { OrderFilters } from "@/components/orders/order-filters"
import { OrderStats } from "@/components/orders/order-stats"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

export default function OrdersPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [isFiltersVisible, setIsFiltersVisible] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold">Órdenes</h1>
              <p className="text-muted-foreground">Gestionar y seguir órdenes de clientes</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Sincronizar con E-commerce
              </Button>
              <Button className="flex items-center gap-2" onClick={() => router.push("/orders/new")}>
                <Plus className="h-4 w-4" />
                Nueva Orden
              </Button>
            </div>
          </div>

          <OrderStats />

          <div className="my-6">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <TabsList className="grid grid-cols-5">
                  <TabsTrigger value="all">Todas las Órdenes</TabsTrigger>
                  <TabsTrigger value="pending">Pendientes</TabsTrigger>
                  <TabsTrigger value="processing">En Proceso</TabsTrigger>
                  <TabsTrigger value="delivered">Entregadas</TabsTrigger>
                  <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input placeholder="Buscar órdenes..." className="pl-9" />
                  </div>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                  >
                    <Filter className="h-4 w-4" />
                    Filtros
                  </Button>
                  <Button variant="ghost" size="icon">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {isFiltersVisible && <OrderFilters />}

              <TabsContent value="all">
                <OrdersTable status="all" />
              </TabsContent>
              <TabsContent value="pending">
                <OrdersTable status="pending" />
              </TabsContent>
              <TabsContent value="processing">
                <OrdersTable status="processing" />
              </TabsContent>
              <TabsContent value="delivered">
                <OrdersTable status="delivered" />
              </TabsContent>
              <TabsContent value="cancelled">
                <OrdersTable status="cancelled" />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

