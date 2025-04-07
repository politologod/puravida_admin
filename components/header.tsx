"use client"

import { Search, Bell, Link } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"

export function Header() {
  return (
    <div className="bg-background p-4 flex items-center gap-4 border-b dark:border-gray-800">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input type="text" placeholder="Buscar productos, clientes, órdenes..." className="pl-10 w-full" />
      </div>
      <Button variant="outline" className="flex items-center gap-2">
        <Link className="h-4 w-4" />
        Conectar a E-commerce
      </Button>
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
      </Button>
      <ThemeToggle />
      <div className="flex items-center gap-2">
        <img src="/placeholder.svg?height=32&width=32" alt="Usuario" className="h-8 w-8 rounded-full" />
        <span className="font-semibold">Admin</span>
      </div>
    </div>
  )
}

