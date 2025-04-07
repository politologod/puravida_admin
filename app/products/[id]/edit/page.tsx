import { SidebarNav } from "../../../../components/sidebar-nav"
import { Header } from "../../../../components/header"
import { ProductForm } from "@/components/product-form"

// This would normally fetch the product data from an API
const getProductData = (id: string) => {
  return {
    name: "Puravida 5 Gallon Water Bottle",
    sku: "WB-5G-001",
    description: "Durable 5-gallon water bottle for refill services. BPA-free plastic with easy-grip handles.",
    category: "refill",
    price: 15.99,
    cost: 8.5,
    stock: 45,
    availableInPos: true,
    availableOnline: true,
    featured: true,
    taxable: true,
  }
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const productData = getProductData(params.id)

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Edit Product</h1>
            <p className="text-muted-foreground">Update product information</p>
          </div>

          <ProductForm product={productData} />
        </div>
      </div>
    </div>
  )
}

