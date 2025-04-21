"use client"

import { useState, useEffect, useCallback } from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { getAllCategories } from "@/lib/api"

// Opciones de categorías (se cargarán dinámicamente)
const initialCategories = [
  { value: "all", label: "Todas las Categorías" }
]

const availabilityOptions = [
  { value: "all", label: "Todos los Productos" },
  { value: "pos", label: "Productos POS" },
  { value: "online", label: "Productos Online" },
]

const inventoryOptions = [
  { value: "all", label: "Todo el Inventario" },
  { value: "low", label: "Inventario Bajo" },
  { value: "out", label: "Sin Existencias" },
]

const sortOptions = [
  { value: "name-asc", label: "Nombre (A-Z)" },
  { value: "name-desc", label: "Nombre (Z-A)" },
  { value: "price-asc", label: "Precio (Menor a Mayor)" },
  { value: "price-desc", label: "Precio (Mayor a Menor)" },
  { value: "stock-asc", label: "Stock (Menor a Mayor)" },
  { value: "stock-desc", label: "Stock (Mayor a Menor)" },
]

interface ProductFiltersProps {
  onFilterChange?: (filters: {
    category: string;
    availability: string;
    inventory: string;
    sort: string;
  }) => void;
}

export function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [category, setCategory] = useState("all")
  const [availability, setAvailability] = useState("all")
  const [inventory, setInventory] = useState("all")
  const [sort, setSort] = useState("name-asc")
  const [openCategory, setOpenCategory] = useState(false)
  const [openAvailability, setOpenAvailability] = useState(false)
  const [openInventory, setOpenInventory] = useState(false)
  const [openSort, setOpenSort] = useState(false)
  const [categories, setCategories] = useState(initialCategories)
  const [filtersInitialized, setFiltersInitialized] = useState(false)
  const [previousFilters, setPreviousFilters] = useState({ category: "all", availability: "all", inventory: "all", sort: "name-asc" })

  // Memoizar la notificación de cambios
  const notifyFilterChange = useCallback(() => {
    const currentFilters = {
      category,
      availability,
      inventory,
      sort
    };
    
    // Solo notificar si hay cambios reales en los filtros y ya están inicializados
    if (filtersInitialized && 
        (previousFilters.category !== currentFilters.category ||
         previousFilters.availability !== currentFilters.availability ||
         previousFilters.inventory !== currentFilters.inventory ||
         previousFilters.sort !== currentFilters.sort)) {
      
      if (onFilterChange) {
        onFilterChange(currentFilters);
      }
      // Actualizar los filtros previos
      setPreviousFilters(currentFilters);
    }
  }, [category, availability, inventory, sort, onFilterChange, filtersInitialized, previousFilters]);

  // Efecto para cargar categorías solo una vez
  useEffect(() => {
    // Cargar categorías desde la API
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories();
        let categoriesData = response;
        
        if (response && typeof response === 'object' && !Array.isArray(response)) {
          if (response.data) categoriesData = response.data;
          else if (response.categories) categoriesData = response.categories;
          else if (response.Categories) categoriesData = response.Categories;
          else if (response.items) categoriesData = response.items;
          else if (response.results) categoriesData = response.results;
        }
        
        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
          const mappedCategories = categoriesData.map(cat => ({
            value: cat.id.toString(),
            label: cat.name
          }));
          
          setCategories([
            { value: "all", label: "Todas las Categorías" },
            ...mappedCategories
          ]);
        }
        
        // Marcar los filtros como inicializados después de cargar las categorías
        setFiltersInitialized(true);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
        // Incluso en caso de error, marcamos los filtros como inicializados
        setFiltersInitialized(true);
      }
    };
    
    fetchCategories();
    // No llamar a setFiltersInitialized aquí para evitar múltiples renderizados
  }, []);

  // Simplificar notificación de cambios en los filtros
  useEffect(() => {
    notifyFilterChange();
  }, [category, availability, inventory, sort, notifyFilterChange]);

  const activeFilters = [
    category !== "all" && categories.find((c) => c.value === category)?.label,
    availability !== "all" && availabilityOptions.find((a) => a.value === availability)?.label,
    inventory !== "all" && inventoryOptions.find((i) => i.value === inventory)?.label,
  ].filter(Boolean)

  const resetFilters = () => {
    setCategory("all")
    setAvailability("all")
    setInventory("all")
    setSort("name-asc")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Popover open={openCategory} onOpenChange={setOpenCategory}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={openCategory} className="justify-between">
              {categories.find((c) => c.value === category)?.label || "Categoría"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Buscar categoría..." />
              <CommandList>
                <CommandEmpty>No se encontraron categorías.</CommandEmpty>
                <CommandGroup>
                  {categories.map((c) => (
                    <CommandItem
                      key={c.value}
                      value={c.value}
                      onSelect={(currentValue) => {
                        setCategory(currentValue)
                        setOpenCategory(false)
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", category === c.value ? "opacity-100" : "opacity-0")} />
                      {c.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover open={openAvailability} onOpenChange={setOpenAvailability}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={openAvailability} className="justify-between">
              {availabilityOptions.find((a) => a.value === availability)?.label || "Disponibilidad"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandList>
                <CommandGroup>
                  {availabilityOptions.map((a) => (
                    <CommandItem
                      key={a.value}
                      value={a.value}
                      onSelect={(currentValue) => {
                        setAvailability(currentValue)
                        setOpenAvailability(false)
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", availability === a.value ? "opacity-100" : "opacity-0")} />
                      {a.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover open={openInventory} onOpenChange={setOpenInventory}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={openInventory} className="justify-between">
              {inventoryOptions.find((i) => i.value === inventory)?.label || "Inventario"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandList>
                <CommandGroup>
                  {inventoryOptions.map((i) => (
                    <CommandItem
                      key={i.value}
                      value={i.value}
                      onSelect={(currentValue) => {
                        setInventory(currentValue)
                        setOpenInventory(false)
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", inventory === i.value ? "opacity-100" : "opacity-0")} />
                      {i.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover open={openSort} onOpenChange={setOpenSort}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={openSort} className="justify-between">
              {sortOptions.find((s) => s.value === sort)?.label || "Ordenar Por"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandList>
                <CommandGroup>
                  {sortOptions.map((s) => (
                    <CommandItem
                      key={s.value}
                      value={s.value}
                      onSelect={(currentValue) => {
                        setSort(currentValue)
                        setOpenSort(false)
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", sort === s.value ? "opacity-100" : "opacity-0")} />
                      {s.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {activeFilters.length > 0 && (
          <>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex flex-wrap gap-1">
              {activeFilters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="rounded-sm">
                  {filter}
                  <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={resetFilters}>
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {activeFilters.length > 0 && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7">
                  Limpiar todo
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

