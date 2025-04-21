"use client"

import { OrderDetails } from "@/components/orders/order-details"
import { SidebarNav } from "../../../components/sidebar-nav"
import { Header } from "../../../components/header"

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <OrderDetails orderId={params.id} />
        </div>
      </div>
    </div>
  )
}

