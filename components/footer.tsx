import { Truck, ShoppingCart, RefreshCw } from "lucide-react"

export function Footer() {
  const orders = [
    { id: "ORD-1042", items: 6, type: "Delivery", status: "Processing", icon: Truck },
    { id: "ORD-1041", items: 4, type: "E-commerce", icon: ShoppingCart },
    { id: "ORD-1040", items: 3, type: "Refill Service", icon: RefreshCw },
  ]

  return (
    <div className="bg-card border-t dark:border-gray-800 p-4 flex gap-4">
      {orders.map((order, index) => (
        <div key={index} className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950 rounded-lg p-3 flex-1">
          <div className="w-8 h-8 bg-blue-400 dark:bg-blue-600 rounded-full flex items-center justify-center text-white">
            <order.icon className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-medium">
              {order.id}: {order.items} Items • {order.type}
            </div>
            {order.status && <div className="text-xs text-blue-600 dark:text-blue-400">{order.status}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

