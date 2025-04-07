import { SidebarNav } from "../../../components/sidebar-nav"
import { Header } from "../../../components/header"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// This would normally fetch the product data from an API
const getProductData = (id: string) => {
  return {
    id: id,
    name: "Puravida 5 Gallon Water Bottle",
    sku: "WB-5G-001",
    description: "Durable 5-gallon water bottle for refill services. BPA-free plastic with easy-grip handles.",
    category: "Refillable",
    price: 15.99,
    cost: 8.5,
    stock: 45,
    availableInPos: true,
    availableOnline: true,
    featured: true,
    taxable: true,
    images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
  }
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = getProductData(params.id)

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <a href="/products">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Products
                </a>
              </Button>
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <Badge
                variant="outline"
                className={
                  product.category === "Bottled"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    : product.category === "Refillable"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : product.category === "Service"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                }
              >
                {product.category}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <a href={`/products/${product.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Product
                </a>
              </Button>
              <Button variant="destructive">
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
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {product.images.map((image, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden border">
                        <img
                          src={image || "/placeholder.svg"}
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
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">SKU</h3>
                    <p>{product.sku}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                    <p>{product.description}</p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Price</h3>
                      <p className="text-xl font-bold">${product.price.toFixed(2)}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Cost</h3>
                      <p className="text-xl font-bold">${product.cost.toFixed(2)}</p>
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
                        {Math.round(((product.price - product.cost) / product.price) * 100)}%
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Available in POS</h3>
                      <Badge variant={product.availableInPos ? "default" : "secondary"}>
                        {product.availableInPos ? "Yes" : "No"}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Available Online</h3>
                      <Badge variant={product.availableOnline ? "default" : "secondary"}>
                        {product.availableOnline ? "Yes" : "No"}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Featured Product</h3>
                      <Badge variant={product.featured ? "default" : "secondary"}>
                        {product.featured ? "Yes" : "No"}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Taxable</h3>
                      <Badge variant={product.taxable ? "default" : "secondary"}>
                        {product.taxable ? "Yes" : "No"}
                      </Badge>
                    </div>
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

