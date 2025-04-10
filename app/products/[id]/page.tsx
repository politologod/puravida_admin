"use client"
import { useEffect, useState } from "react"
import { SidebarNav } from "../../../components/sidebar-nav"
import { Header } from "../../../components/header"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { getProductsById } from "@/lib/api" // Import the API function

type Product = {
  id: number | string
  name: string
  description: string
  price: string | number
  stock: number
  imageUrl?: string
  metadata?: {
    type?: string
    capacity?: string
    material?: string
    [key: string]: any
  }
  createdAt: string
  updatedAt: string
  Categories?: any[]
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const data = await getProductsById(params.id)
        setProduct(data)
        setError(null)
      } catch (err) {
        setError("Failed to load product details")
        toast({
          title: "Error",
          description: "Failed to load product details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const handleDelete = async () => {
    if (!product) return
    
    // This would normally call an API to delete the product
    toast({
      title: "Product deleted",
      description: `${product.name} has been deleted.`,
      variant: "destructive",
    })
    router.push("/products")
  }

  // Function to determine category based on metadata
  const determineCategory = (product: Product) => {
    if (product.metadata?.type) {
      return product.metadata.type
    }
    if (product.metadata?.capacity) {
      return `${product.metadata.capacity} Container`
    }
    return "Uncategorized"
  }

  // Calculate approximate cost and profit margin (since we don't have cost in the API)
  const calculateCost = (price: number) => {
    // Assuming cost is roughly 60% of the price for this example
    return price * 0.6
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <SidebarNav />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto p-6 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex h-screen bg-background">
        <SidebarNav />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto p-6">
            <div className="flex items-center gap-2 mb-6">
              <Button variant="outline" onClick={() => router.push("/products")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Button>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error || "Product not found"}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const category = determineCategory(product)
  const price = parseFloat(product.price as string)
  const cost = calculateCost(price)
  const images = [product.imageUrl || "/placeholder.svg?height=400&width=400"]

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.push("/products")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Button>
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <Badge
                variant="outline"
                className={
                  category.includes("Agua")
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    : category.includes("L")
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                }
              >
                {category}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push(`/products/${product.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Product
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Product
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-square rounded-lg overflow-hidden border">
                    <img
                      src={images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {images.map((image, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden border">
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">ID</h3>
                    <p>{product.id}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                    <p>{product.description}</p>
                  </div>

                  {product.metadata && Object.keys(product.metadata).length > 0 && (
                    <>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Specifications</h3>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {Object.entries(product.metadata).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-sm font-medium">{key}: </span>
                              <span>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Price</h3>
                      <p className="text-xl font-bold">${price.toFixed(2)}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Estimated Cost</h3>
                      <p className="text-xl font-bold">${cost.toFixed(2)}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Stock</h3>
                      <p
                        className={`text-xl font-bold ${
                          product.stock === 0
                            ? "text-red-500 dark:text-red-400"
                            : product.stock < 10
                              ? "text-amber-500 dark:text-amber-400"
                              : "text-green-500 dark:text-green-400"
                        }`}
                      >
                        {product.stock}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Profit Margin</h3>
                      <p className="text-xl font-bold">
                        {Math.round(((price - cost) / price) * 100)}%
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                    <p>{new Date(product.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h3>
                    <p>{new Date(product.updatedAt).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sales Information</CardTitle>
                  <CardDescription>Recent sales and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Sales data would be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}