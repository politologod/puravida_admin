"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { Header } from "@/components/header"
import { ProductForm } from "@/components/product-form"
import { getProductById } from "@/lib/api"
import { Product } from "@/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const data = await getProductById(params.id)
        console.log("Producto obtenido:", data)
        
        // Normalizar los datos
        const normalizedProduct = {
          id: data.id,
          name: data.name || "",
          description: data.description || "",
          price: data.price || "",
          stock: data.stock || 0,
          category: data.category || "",
          imageUrl: data.imageUrl || "",
          metadata: data.metadata || {},
          metaTitle: data.metaTitle || "",
          metaDescription: data.metaDescription || "",
          seoKeywords: data.seoKeywords || "",
          createdAt: data.createdAt || "",
          updatedAt: data.updatedAt || ""
        }
        
        setProduct(normalizedProduct)
      } catch (err) {
        console.error("Error al cargar el producto:", err)
        setError("Error al cargar el producto. Por favor, intente nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <SidebarNav />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto p-6">
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-background">
        <SidebarNav />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto">
          {product && <ProductForm product={product} />}
        </div>
      </div>
    </div>
  )
}