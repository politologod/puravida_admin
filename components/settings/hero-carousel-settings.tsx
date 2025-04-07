"use client"

import { useState } from "react"
import { Plus, Trash2, Edit, ArrowUp, ArrowDown, ImageIcon, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type HeroSlide = {
  id: string
  title: string
  subtitle: string
  buttonText: string
  buttonLink: string
  image: string
  active: boolean
}

type CarouselItem = {
  id: string
  title: string
  description: string
  image: string
  link: string
  active: boolean
}

export function HeroCarouselSettings() {
  const [isAddHeroOpen, setIsAddHeroOpen] = useState(false)
  const [isAddCarouselOpen, setIsAddCarouselOpen] = useState(false)

  const heroSlides: HeroSlide[] = [
    {
      id: "H001",
      title: "Pure Water, Pure Life",
      subtitle: "Premium water delivery service for your home and office",
      buttonText: "Order Now",
      buttonLink: "/products",
      image: "/placeholder.svg?height=400&width=800",
      active: true,
    },
    {
      id: "H002",
      title: "Subscribe & Save",
      subtitle: "Get regular water deliveries and save up to 20%",
      buttonText: "Subscribe",
      buttonLink: "/subscription",
      image: "/placeholder.svg?height=400&width=800",
      active: true,
    },
    {
      id: "H003",
      title: "Water Dispensers",
      subtitle: "High-quality water dispensers for your convenience",
      buttonText: "Shop Dispensers",
      buttonLink: "/products/dispensers",
      image: "/placeholder.svg?height=400&width=800",
      active: false,
    },
  ]

  const carouselItems: CarouselItem[] = [
    {
      id: "C001",
      title: "5 Gallon Water Bottle",
      description: "Premium purified water in reusable containers",
      image: "/placeholder.svg?height=300&width=300",
      link: "/products/5-gallon",
      active: true,
    },
    {
      id: "C002",
      title: "Water Dispenser",
      description: "Modern dispensers for hot and cold water",
      image: "/placeholder.svg?height=300&width=300",
      link: "/products/dispensers",
      active: true,
    },
    {
      id: "C003",
      title: "Alkaline Water",
      description: "Enhanced pH water for better hydration",
      image: "/placeholder.svg?height=300&width=300",
      link: "/products/alkaline",
      active: true,
    },
    {
      id: "C004",
      title: "Spring Water",
      description: "Natural spring water with essential minerals",
      image: "/placeholder.svg?height=300&width=300",
      link: "/products/spring",
      active: false,
    },
  ]

  return (
    <div className="space-y-6">
      <Tabs defaultValue="hero">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="carousel">Product Carousel</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>Manage hero slides for your homepage</CardDescription>
              </div>
              <Dialog open={isAddHeroOpen} onOpenChange={setIsAddHeroOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Hero Slide
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Hero Slide</DialogTitle>
                    <DialogDescription>Create a new hero slide for your homepage.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hero-title">Title</Label>
                        <Input id="hero-title" placeholder="Enter slide title" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hero-subtitle">Subtitle</Label>
                        <Input id="hero-subtitle" placeholder="Enter slide subtitle" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hero-button-text">Button Text</Label>
                        <Input id="hero-button-text" placeholder="Enter button text" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hero-button-link">Button Link</Label>
                        <Input id="hero-button-link" placeholder="Enter button link" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Background Image</Label>
                      <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Drag and drop an image here or click to browse
                        </p>
                        <Input type="file" className="hidden" id="hero-image" />
                        <Button variant="secondary" asChild>
                          <label htmlFor="hero-image">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image
                          </label>
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">Recommended size: 1920x600 pixels</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="hero-active" defaultChecked />
                      <Label htmlFor="hero-active">Active</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddHeroOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        toast({
                          title: "Hero slide created",
                          description: "The hero slide has been created successfully.",
                        })
                        setIsAddHeroOpen(false)
                      }}
                    >
                      Create Slide
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {heroSlides.map((slide, index) => (
                  <Card key={slide.id}>
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-1/3 h-40 bg-muted">
                        <img
                          src={slide.image || "/placeholder.svg"}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{slide.title}</h3>
                            <p className="text-sm text-muted-foreground">{slide.subtitle}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md">
                                Button: {slide.buttonText}
                              </span>
                              <span className="text-xs px-2 py-1 bg-muted rounded-md">Link: {slide.buttonLink}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch checked={slide.active} />
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-end gap-2">
                          {index > 0 && (
                            <Button variant="outline" size="icon">
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                          )}
                          {index < heroSlides.length - 1 && (
                            <Button variant="outline" size="icon">
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carousel">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Product Carousel</CardTitle>
                <CardDescription>Manage product carousel items</CardDescription>
              </div>
              <Dialog open={isAddCarouselOpen} onOpenChange={setIsAddCarouselOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Carousel Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Carousel Item</DialogTitle>
                    <DialogDescription>Create a new product carousel item.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="carousel-title">Title</Label>
                      <Input id="carousel-title" placeholder="Enter item title" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="carousel-description">Description</Label>
                      <Textarea id="carousel-description" placeholder="Enter item description" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="carousel-link">Link</Label>
                      <Input id="carousel-link" placeholder="Enter item link" />
                    </div>
                    <div className="space-y-2">
                      <Label>Product Image</Label>
                      <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Drag and drop an image here or click to browse
                        </p>
                        <Input type="file" className="hidden" id="carousel-image" />
                        <Button variant="secondary" asChild>
                          <label htmlFor="carousel-image">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image
                          </label>
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">Recommended size: 600x600 pixels</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="carousel-active" defaultChecked />
                      <Label htmlFor="carousel-active">Active</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddCarouselOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        toast({
                          title: "Carousel item created",
                          description: "The carousel item has been created successfully.",
                        })
                        setIsAddCarouselOpen(false)
                      }}
                    >
                      Create Item
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {carouselItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="aspect-square bg-muted">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">Link: {item.link}</p>
                        </div>
                        <Switch checked={item.active} />
                      </div>
                      <div className="mt-4 flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

