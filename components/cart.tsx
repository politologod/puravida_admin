import { Button } from "@/components/ui/button"
import { CreditCard, QrCode, Banknote, Edit2, Link } from "lucide-react"

const cartItems = [
  { title: "Puravida 5 Gallon Water Bottle (Refillable)", price: 15.99, quantity: 1 },
  { title: "Puravida Water Refill Service (5 Gallon)", price: 8.99, quantity: 2 },
  { title: "Puravida Spring Water 24-Pack (Bottled)", price: 12.99, quantity: 1 },
  { title: "Water Dispenser - Floor Standing (Accessory)", price: 89.99, quantity: 1 },
]

export function Cart() {
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const tax = subtotal * 0.05
  const total = subtotal + tax

  return (
    <div className="w-[380px] bg-card border-l dark:border-gray-800 flex flex-col h-full">
      <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Customer #1042</h2>
          <p className="text-sm text-muted-foreground">Walk-in Customer</p>
        </div>
        <Button variant="ghost" size="icon">
          <Edit2 className="h-5 w-5" />
        </Button>
      </div>
      <div className="p-4 border-b dark:border-gray-800">
        <div className="flex gap-2 mb-4">
          <Button variant="secondary" className="flex-1 rounded-full">
            In-store
          </Button>
          <Button variant="outline" className="flex-1 rounded-full">
            Delivery
          </Button>
          <Button variant="outline" className="flex-1 rounded-full">
            Refill
          </Button>
        </div>
        <Button variant="outline" className="w-full flex items-center gap-2">
          <Link className="h-4 w-4" />
          Link to E-commerce Order
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {cartItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3 mb-4">
            <img
              src="/placeholder.svg?height=64&width=64"
              alt={item.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="text-sm font-medium">{item.title}</h4>
              <div className="flex justify-between items-center mt-1">
                <span className="text-blue-600 dark:text-blue-400 font-bold">${item.price.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">{item.quantity}X</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t dark:border-gray-800 p-4">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sub Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax 5%</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total Amount</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Button variant="outline" className="flex flex-col items-center py-2">
            <Banknote className="h-5 w-5 mb-1" />
            <span className="text-xs">Cash</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center py-2">
            <CreditCard className="h-5 w-5 mb-1" />
            <span className="text-xs">Card</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center py-2">
            <QrCode className="h-5 w-5 mb-1" />
            <span className="text-xs">QR Code</span>
          </Button>
        </div>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 dark:bg-blue-700 dark:hover:bg-blue-800">
          Complete Sale
        </Button>
      </div>
    </div>
  )
}

