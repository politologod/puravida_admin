"use client"

import { Button } from "@/components/ui/button"
import { User, ShoppingCart, DollarSign, Clock, Truck, AlertTriangle, Users, Image } from "lucide-react"

interface SettingsSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const settingsTabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "ecommerce", label: "E-commerce", icon: ShoppingCart },
  { id: "currency", label: "Currency", icon: DollarSign },
  { id: "timezone", label: "Timezone", icon: Clock },
  { id: "delivery", label: "Delivery", icon: Truck },
  { id: "maintenance", label: "Maintenance Mode", icon: AlertTriangle },
  { id: "users", label: "Users & Permissions", icon: Users },
  { id: "hero", label: "Hero & Carousel", icon: Image },
]

export function SettingsSidebar({ activeTab, setActiveTab }: SettingsSidebarProps) {
  return (
    <div className="w-full md:w-64 border-r md:h-[calc(100vh-4rem)] p-4 space-y-2">
      {settingsTabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => setActiveTab(tab.id)}
        >
          <tab.icon className="mr-2 h-4 w-4" />
          {tab.label}
        </Button>
      ))}
    </div>
  )
}

