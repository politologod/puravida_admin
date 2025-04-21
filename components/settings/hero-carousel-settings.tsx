"use client"

import { useState, useEffect } from "react"
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
import { getAllProducts } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

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

type Product = {
  id: string | number
  name: string
  description?: string
  category?: string
  price?: number
  stock?: number
  images?: string[]
}

export function HeroCarouselSettings() {
  const [isAddHeroOpen, setIsAddHeroOpen] = useState(false)
  const [isAddCarouselOpen, setIsAddCarouselOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Obtener productos de la API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const response = await getAllProducts()
        console.log("Productos obtenidos:", response)
        
        // Determinar dónde están los datos de productos
        let productsData = response;
        
        // Si la respuesta es un objeto con una propiedad que contiene los productos
        if (response && typeof response === 'object' && !Array.isArray(response)) {
          // Buscar propiedades comunes donde podrían estar los productos
          if (response.data) productsData = response.data;
          else if (response.products) productsData = response.products;
          else if (response.items) productsData = response.items;
          else if (response.results) productsData = response.results;
        }
        
        // Asegurarse de que productsData sea un array
        if (!Array.isArray(productsData)) {
          console.error("Los datos recibidos no son un array:", productsData);
          setProducts([]);
          return;
        }
        
        setProducts(productsData);
        
        // Convertir productos a formato de carouselItems
        const items = productsData.slice(0, 8).map((p: any) => ({
          id: p.id_autoincrement || p.id || Math.random().toString(36).substring(2, 9),
          title: p.name || "Sin nombre",
          description: p.description || "Sin descripción",
          image: p.images && p.images.length > 0 ? p.images[0] : "/placeholder.svg?height=300&width=300",
          link: `/products/${p.id}`,
      active: true,
        }));
        
        setCarouselItems(items);
      } catch (error) {
        console.error("Error al obtener productos:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos para el carousel",
          variant: "destructive",
        });
        
        // Si hay un error, usar datos de ejemplo
        setCarouselItems([
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
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  const heroSlides: HeroSlide[] = [
    {
      id: "H001",
      title: "Agua Pura, Vida Pura",
      subtitle: "Servicio premium de entrega de agua para tu hogar y oficina",
      buttonText: "Ordenar Ahora",
      buttonLink: "/products",
      image: "/placeholder.svg?height=400&width=800",
      active: true,
    },
    {
      id: "H002",
      title: "Suscríbete y Ahorra",
      subtitle: "Recibe entregas regulares de agua y ahorra hasta un 20%",
      buttonText: "Suscríbete",
      buttonLink: "/subscription",
      image: "/placeholder.svg?height=400&width=800",
      active: true,
    },
    {
      id: "H003",
      title: "Dispensadores de Agua",
      subtitle: "Dispensadores de agua de alta calidad para tu comodidad",
      buttonText: "Comprar Dispensadores",
      buttonLink: "/products/dispensers",
      image: "/placeholder.svg?height=400&width=800",
      active: false,
    },
  ]

  return (
    <div className="space-y-6">
      <Tabs defaultValue="hero">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="hero">Sección Hero</TabsTrigger>
          <TabsTrigger value="carousel">Carousel de Productos</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sección Hero</CardTitle>
                <CardDescription>Administra las diapositivas hero para tu página de inicio</CardDescription>
              </div>
              <Dialog open={isAddHeroOpen} onOpenChange={setIsAddHeroOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir Diapositiva
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Añadir Nueva Diapositiva Hero</DialogTitle>
                    <DialogDescription>Crea una nueva diapositiva hero para tu página de inicio.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hero-title">Título</Label>
                        <Input id="hero-title" placeholder="Ingresa el título de la diapositiva" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hero-subtitle">Subtítulo</Label>
                        <Input id="hero-subtitle" placeholder="Ingresa el subtítulo de la diapositiva" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hero-button-text">Texto del Botón</Label>
                        <Input id="hero-button-text" placeholder="Ingresa el texto del botón" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hero-button-link">Enlace del Botón</Label>
                        <Input id="hero-button-link" placeholder="Ingresa el enlace del botón" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Imagen de Fondo</Label>
                      <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Arrastra y suelta una imagen aquí o haz clic para explorar
                        </p>
                        <Input type="file" className="hidden" id="hero-image" />
                        <Button variant="secondary" asChild>
                          <label htmlFor="hero-image">
                            <Upload className="mr-2 h-4 w-4" />
                            Subir Imagen
                          </label>
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">Tamaño recomendado: 1920x600 píxeles</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="hero-active" defaultChecked />
                      <Label htmlFor="hero-active">Activo</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddHeroOpen(false)}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => {
                        toast({
                          title: "Diapositiva hero creada",
                          description: "La diapositiva hero ha sido creada exitosamente.",
                        })
                        setIsAddHeroOpen(false)
                      }}
                    >
                      Crear Diapositiva
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
                                Botón: {slide.buttonText}
                              </span>
                              <span className="text-xs px-2 py-1 bg-muted rounded-md">Enlace: {slide.buttonLink}</span>
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
                <CardTitle>Carousel de Productos</CardTitle>
                <CardDescription>Administra los elementos del carousel de productos</CardDescription>
              </div>
              <Dialog open={isAddCarouselOpen} onOpenChange={setIsAddCarouselOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir Elemento al Carousel
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Añadir Elemento al Carousel</DialogTitle>
                    <DialogDescription>Crea un nuevo elemento para el carousel de productos.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="carousel-title">Título</Label>
                      <Input id="carousel-title" placeholder="Ingresa el título del elemento" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="carousel-description">Descripción</Label>
                      <Textarea id="carousel-description" placeholder="Ingresa la descripción del elemento" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="carousel-link">Enlace</Label>
                      <Input id="carousel-link" placeholder="Ingresa el enlace del elemento" />
                    </div>
                    <div className="space-y-2">
                      <Label>Imagen del Producto</Label>
                      <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Arrastra y suelta una imagen aquí o haz clic para explorar
                        </p>
                        <Input type="file" className="hidden" id="carousel-image" />
                        <Button variant="secondary" asChild>
                          <label htmlFor="carousel-image">
                            <Upload className="mr-2 h-4 w-4" />
                            Subir Imagen
                          </label>
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">Tamaño recomendado: 600x600 píxeles</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="carousel-active" defaultChecked />
                      <Label htmlFor="carousel-active">Activo</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddCarouselOpen(false)}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => {
                        toast({
                          title: "Elemento de carousel creado",
                          description: "El elemento del carousel ha sido creado exitosamente.",
                        })
                        setIsAddCarouselOpen(false)
                      }}
                    >
                      Crear Elemento
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array(4).fill(0).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="aspect-square" />
                      <CardContent className="p-4">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-full mb-2" />
                        <Skeleton className="h-3 w-full mb-4" />
                        <div className="flex justify-end">
                          <Skeleton className="h-8 w-20 mr-2" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
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
                            <p className="text-xs text-muted-foreground mt-1">Enlace: {item.link}</p>
                        </div>
                        <Switch checked={item.active} />
                      </div>
                      <div className="mt-4 flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                            Editar
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

