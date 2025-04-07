import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Droplets } from "lucide-react"

interface ProductCardProps {
  image: string
  title: string
  price: number
  discount?: number
  type: "Bottled" | "Refillable" | "Service" | "Accessory"
}

export function ProductCard({ image, title, price, discount, type }: ProductCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img src={image || "/placeholder.svg"} alt={title} className="w-full h-40 object-cover" />
        {discount && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-black dark:bg-yellow-500 px-2 py-1 rounded-md text-xs font-medium">
            {discount}% Off
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium mb-1">{title}</h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-blue-600 dark:text-blue-400 font-bold">${price.toFixed(2)}</span>
          <div className="flex items-center gap-1">
            <Droplets
              className={`h-3 w-3 ${
                type === "Bottled"
                  ? "text-blue-500 dark:text-blue-400"
                  : type === "Refillable"
                    ? "text-green-500 dark:text-green-400"
                    : type === "Service"
                      ? "text-purple-500 dark:text-purple-400"
                      : "text-gray-500 dark:text-gray-400"
              }`}
            />
            <span className="text-xs text-muted-foreground">{type}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" className="rounded-full">
            <Minus className="h-4 w-4" />
          </Button>
          <span className="font-medium">1</span>
          <Button variant="outline" size="icon" className="rounded-full">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

