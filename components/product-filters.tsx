"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const categories = [
  { value: "all", label: "All Categories" },
  { value: "bottled", label: "Bottled Water" },
  { value: "refill", label: "Water Refill" },
  { value: "accessories", label: "Accessories" },
  { value: "services", label: "Services" },
  { value: "promotions", label: "Promotions" },
]

const availabilityOptions = [
  { value: "all", label: "All Products" },
  { value: "pos", label: "POS Products" },
  { value: "online", label: "Online Products" },
]

const inventoryOptions = [
  { value: "all", label: "All Inventory" },
  { value: "low", label: "Low Inventory" },
  { value: "out", label: "Out of Stock" },
]

const sortOptions = [
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "price-asc", label: "Price (Low to High)" },
  { value: "price-desc", label: "Price (High to Low)" },
  { value: "stock-asc", label: "Stock (Low to High)" },
  { value: "stock-desc", label: "Stock (High to Low)" },
]

export function ProductFilters() {
  const [category, setCategory] = useState("all")
  const [availability, setAvailability] = useState("all")
  const [inventory, setInventory] = useState("all")
  const [sort, setSort] = useState("name-asc")
  const [openCategory, setOpenCategory] = useState(false)
  const [openAvailability, setOpenAvailability] = useState(false)
  const [openInventory, setOpenInventory] = useState(false)
  const [openSort, setOpenSort] = useState(false)

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
              {categories.find((c) => c.value === category)?.label || "Category"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search category..." />
              <CommandList>
                <CommandEmpty>No category found.</CommandEmpty>
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
              {availabilityOptions.find((a) => a.value === availability)?.label || "Availability"}
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
              {inventoryOptions.find((i) => i.value === inventory)?.label || "Inventory"}
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
              {sortOptions.find((s) => s.value === sort)?.label || "Sort By"}
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
                  Clear all
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

