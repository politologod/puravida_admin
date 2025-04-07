"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Truck, CheckCircle2, Package, Clock, MapPin } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function OrderDeliveryTimeline() {
  const [currentStep, setCurrentStep] = useState(3)

  const steps = [
    {
      id: 1,
      title: "Order Processed",
      description: "Order has been processed and is ready for delivery",
      icon: Package,
      date: "April 1, 2025 - 08:30 AM",
      completed: currentStep >= 1,
    },
    {
      id: 2,
      title: "Out for Delivery",
      description: "Order has been dispatched and is on its way",
      icon: Truck,
      date: "April 1, 2025 - 10:15 AM",
      completed: currentStep >= 2,
    },
    {
      id: 3,
      title: "Delivered",
      description: "Order has been delivered successfully",
      icon: CheckCircle2,
      date: "April 1, 2025 - 02:30 PM",
      completed: currentStep >= 3,
    },
  ]

  const handleUpdateStatus = (stepId: number) => {
    setCurrentStep(stepId)
    toast({
      title: "Delivery status updated",
      description: `Order status updated to "${steps[stepId - 1].title}"`,
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Delivery Timeline</h3>

      <div className="relative">
        {steps.map((step, index) => (
          <div key={step.id} className="flex mb-8 last:mb-0">
            <div className="flex flex-col items-center mr-4">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <step.icon className="w-5 h-5" />
              </div>
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-full ${steps[index + 1].completed ? "bg-primary" : "bg-muted"}`}></div>
              )}
            </div>

            <div className="pt-1 pb-8">
              <h4 className="font-medium">{step.title}</h4>
              <p className="text-sm text-muted-foreground">{step.description}</p>
              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3 mr-1" />
                <span>{step.date}</span>
              </div>

              {!step.completed && (
                <Button variant="outline" size="sm" className="mt-2" onClick={() => handleUpdateStatus(step.id)}>
                  Mark as {step.title}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-medium">Delivery Location</h4>
              <p className="text-sm text-muted-foreground">123 Main St, Anytown, USA</p>
              <Button
                variant="link"
                className="p-0 h-auto text-sm"
                onClick={() => window.open("https://maps.google.com", "_blank")}
              >
                View on Map
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

