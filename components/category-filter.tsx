import { Grid, Droplets, Truck, Package, Tag, ShoppingBag } from "lucide-react"

const categories = [
  { icon: Grid, label: "All Products", items: "124 Items", active: true },
  { icon: Droplets, label: "Water Refill", items: "15 Items" },
  { icon: ShoppingBag, label: "Bottled Water", items: "42 Items" },
  { icon: Package, label: "Accessories", items: "28 Items" },
  { icon: Tag, label: "Promotions", items: "12 Items" },
  { icon: Truck, label: "Delivery", items: "27 Items" },
]

export function CategoryFilter() {
  return (
    <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
      {categories.map((category, index) => (
        <div
          key={index}
          className={`flex flex-col items-center p-3 rounded-xl min-w-[100px] ${
            category.active
              ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
              : "bg-card text-card-foreground"
          } border dark:border-gray-800 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950`}
        >
          <category.icon className="h-6 w-6 mb-1" />
          <span className="text-sm font-medium">{category.label}</span>
          <span className="text-xs text-muted-foreground">{category.items}</span>
        </div>
      ))}
    </div>
  )
}

