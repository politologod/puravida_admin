import { ProductCard } from "./product-card"

const waterProducts = [
  {
    image: "/placeholder.svg?height=200&width=200",
    title: "Puravida 5 Gallon Water Bottle",
    price: 15.99,
    discount: 10,
    type: "Refillable",
  },
  {
    image: "/placeholder.svg?height=200&width=200",
    title: "Puravida 1 Gallon Purified Water",
    price: 4.99,
    type: "Bottled",
  },
  {
    image: "/placeholder.svg?height=200&width=200",
    title: "Puravida Water Refill Service (5 Gallon)",
    price: 8.99,
    type: "Service",
  },
  {
    image: "/placeholder.svg?height=200&width=200",
    title: "Puravida Spring Water 24-Pack",
    price: 12.99,
    type: "Bottled",
  },
  {
    image: "/placeholder.svg?height=200&width=200",
    title: "Water Dispenser - Floor Standing",
    price: 89.99,
    discount: 15,
    type: "Accessory",
  },
  {
    image: "/placeholder.svg?height=200&width=200",
    title: "Puravida Alkaline Water 1L (6-Pack)",
    price: 10.59,
    type: "Bottled",
  },
]

export function FoodGrid() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {waterProducts.map((item, index) => (
        <ProductCard key={index} {...item} />
      ))}
    </div>
  )
}

