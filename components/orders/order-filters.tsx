"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePickerWithRange } from "@/components/date-picker-with-range"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { DollarSign, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { addDays } from "date-fns"

export function OrderFilters() {
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: addDays(new Date(), 7),
  })
  const [priceRange, setPriceRange] = useState([0, 100])
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const addFilter = (filter: string) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters([...activeFilters, filter])
    }
  }

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter))
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="order-number">Número de Orden</Label>
            <Input
              id="order-number"
              placeholder="Buscar por # de orden"
              onChange={() => addFilter("Número de Orden")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer">Cliente</Label>
            <Input id="customer" placeholder="Buscar por cliente" onChange={() => addFilter("Cliente")} />
          </div>

          <div className="space-y-2">
            <Label>Rango de Fechas</Label>
            <DatePickerWithRange
              date={dateRange}
              setDate={(range) => {
                setDateRange(range)
                addFilter("Rango de Fechas")
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-method">Método de Pago</Label>
            <Select onValueChange={() => addFilter("Método de Pago")}>
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="Seleccionar método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Métodos</SelectItem>
                <SelectItem value="credit_card">Tarjeta de Crédito</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="cash">Efectivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-status">Estado de Pago</Label>
            <Select onValueChange={() => addFilter("Estado de Pago")}>
              <SelectTrigger id="payment-status">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                <SelectItem value="paid">Pagado</SelectItem>
                <SelectItem value="unpaid">No Pagado</SelectItem>
                <SelectItem value="refunded">Reembolsado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery-method">Método de Entrega</Label>
            <Select onValueChange={() => addFilter("Método de Entrega")}>
              <SelectTrigger id="delivery-method">
                <SelectValue placeholder="Seleccionar método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Métodos</SelectItem>
                <SelectItem value="pickup">Recogida</SelectItem>
                <SelectItem value="delivery">Entrega</SelectItem>
                <SelectItem value="refill">Servicio de Recarga</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery-status">Estado de Entrega</Label>
            <Select onValueChange={() => addFilter("Estado de Entrega")}>
              <SelectTrigger id="delivery-status">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in_transit">En Tránsito</SelectItem>
                <SelectItem value="delivered">Entregado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Origen</Label>
            <Select onValueChange={() => addFilter("Origen")}>
              <SelectTrigger id="source">
                <SelectValue placeholder="Seleccionar origen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Orígenes</SelectItem>
                <SelectItem value="pos">POS</SelectItem>
                <SelectItem value="ecommerce">E-commerce</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Rango de Precio</Label>
            <div className="pt-4 px-1">
              <Slider
                defaultValue={[0, 100]}
                max={500}
                step={10}
                value={priceRange}
                onValueChange={(value) => {
                  setPriceRange(value)
                  addFilter("Rango de Precio")
                }}
              />
              <div className="flex items-center justify-between mt-2 text-sm">
                <div className="flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  <span>{priceRange[0]}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  <span>{priceRange[1]}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mostrar Solo</Label>
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center space-x-2">
                <Switch id="has-notes" onCheckedChange={() => addFilter("Tiene Notas")} />
                <Label htmlFor="has-notes">Tiene Notas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="has-refunds" onCheckedChange={() => addFilter("Tiene Reembolsos")} />
                <Label htmlFor="has-refunds">Tiene Reembolsos</Label>
              </div>
            </div>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="mt-6">
            <Label>Filtros Activos</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                  {filter}
                  <Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1" onClick={() => removeFilter(filter)}>
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setActiveFilters([])}>
                Limpiar Todo
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6 gap-2">
          <Button variant="outline" onClick={() => setActiveFilters([])}>
            Reiniciar
          </Button>
          <Button>Aplicar Filtros</Button>
        </div>
      </CardContent>
    </Card>
  )
}

