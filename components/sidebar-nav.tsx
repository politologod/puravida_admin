"use client"

import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  Store,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

// Actualizar el sidebar: eliminar pestañas innecesarias, arreglar el botón de logout y traducir al español
const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", color: "text-blue-600 dark:text-blue-400" },
  { icon: ShoppingCart, label: "Vender", href: "/vender", color: "text-blue-600 dark:text-blue-400" },
  { icon: Store, label: "Productos", href: "/products", color: "text-gray-600 dark:text-gray-400" },
  { icon: Users, label: "Usuarios", href: "/users", color: "text-gray-600 dark:text-gray-400" },
  { icon: ClipboardList, label: "Órdenes", href: "/orders", color: "text-gray-600 dark:text-gray-400" },
  { icon: Settings, label: "Configuración", href: "/settings", color: "text-gray-600 dark:text-gray-400" },
  
]

export function SidebarNav() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "relative h-screen border-r transition-all duration-300 ease-in-out bg-white dark:bg-gray-950 dark:border-gray-800",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border bg-background dark:border-gray-800"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <div className="p-4 flex flex-col h-full">
        <div className={cn("flex items-center gap-2 mb-8", collapsed && "justify-center")}>
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-01-12%20at%2012.32.42%20PM-QicgA83ZI0TfZlOynDOqlhOGnbwzEv.jpeg"
            alt="Puravida 23 Logo"
            className="w-8 h-8"
          />
          {!collapsed && <span className="font-semibold text-blue-600 dark:text-blue-400">PURAVIDA 23</span>}
        </div>
        <nav className="space-y-2 flex-1">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href
            return (
              <Button
                key={index}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full",
                  collapsed ? "justify-center px-2" : "justify-start",
                  isActive
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-950 dark:text-blue-400 dark:hover:bg-blue-900"
                    : "",
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                  {!collapsed && item.label}
                </Link>
              </Button>
            )
          })}
        </nav>
        <Button
          variant="ghost"
          className={cn(
            "w-full mt-4 text-gray-600 dark:text-gray-400",
            collapsed ? "justify-center px-2" : "justify-start",
          )}
        >
          <LogOut className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
          {!collapsed && "Cerrar sesión"}
        </Button>
      </div>
    </div>
  )
}

