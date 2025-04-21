"use client"
import { useEffect, useState } from "react"
import { SidebarNav } from "../../../../components/sidebar-nav"
import { Header } from "../../../../components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { getProductsById, updateProducts } from "@/lib/api" // Import the API functions

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

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: "",
    stock: 0,
    metadata: {}
  })

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const data = await getProductsById(params.id)
        setFormData({
          id: data.id,
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.stock,
          imageUrl: data.imageUrl,
          metadata: data.metadata || {}
        })
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === "price" ? value : parseInt(value) || 0
    }))
  }

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [name]: value
      }
    }))
  }

  const handleSwitchChange = (checked: boolean, name: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [name]: checked
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.price) {
      toast({
        title: "Validation Error",
        description: "Name and price are required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      // Call the API to update the product
      await updateProducts(params.id, {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        metadata: formData.metadata
      })

      toast({
        title: "Success",
        description: "Product updated successfully.",
      })
      
      // Navigate back to product details page
      router.push(`/products/${params.id}`)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
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

  if (error) {
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
            <Card>
              <CardContent className="pt-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              </CardContent>
            </Card>
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
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Edit Product</h1>
            <p className="text-muted-foreground">Update product information</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price (USD)</Label>
                      <Input 
                        id="price" 
                        name="price" 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        value={formData.price} 
                        onChange={handleNumberInputChange} 
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      rows={4} 
                      value={formData.description} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inventory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input 
                      id="stock" 
                      name="stock" 
                      type="number" 
                      min="0" 
                      value={formData.stock} 
                      onChange={handleNumberInputChange} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Product Image URL</Label>
                    <Input 
                      id="imageUrl" 
                      name="imageUrl" 
                      value={formData.imageUrl || ''} 
                      onChange={handleInputChange} 
                      placeholder="https://example.com/image.jpg" 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Input 
                      id="type" 
                      name="type" 
                      value={formData.metadata?.type || ''} 
                      onChange={handleMetadataChange} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input 
                      id="capacity" 
                      name="capacity" 
                      value={formData.metadata?.capacity || ''} 
                      onChange={handleMetadataChange} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="material">Material</Label>
                    <Input 
                      id="material" 
                      name="material" 
                      value={formData.metadata?.material || ''} 
                      onChange={handleMetadataChange} 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Visibility & Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="availableInPos">Available in POS</Label>
                    <Switch 
                      id="availableInPos" 
                      checked={Boolean(formData.metadata?.availableInPos)} 
                      onCheckedChange={(checked) => handleSwitchChange(checked, 'availableInPos')} 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="availableOnline">Available Online</Label>
                    <Switch 
                      id="availableOnline" 
                      checked={Boolean(formData.metadata?.availableOnline)} 
                      onCheckedChange={(checked) => handleSwitchChange(checked, 'availableOnline')} 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="featured">Featured Product</Label>
                    <Switch 
                      id="featured" 
                      checked={Boolean(formData.metadata?.featured)} 
                      onCheckedChange={(checked) => handleSwitchChange(checked, 'featured')} 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="taxable">Taxable</Label>
                    <Switch 
                      id="taxable" 
                      checked={Boolean(formData.metadata?.taxable)} 
                      onCheckedChange={(checked) => handleSwitchChange(checked, 'taxable')} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push(`/products/${params.id}`)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}