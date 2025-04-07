"use client"
import { SidebarNav } from "../../components/sidebar-nav"
import { Header } from "../../components/header"
import { Button } from "@/components/ui/button"
import { Plus, Download, Upload, Edit, Trash2, Eye, MoreHorizontal } from "lucide-react"
import { ProductFilters } from "@/components/product-filters"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/data-table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"

type Product = {
  id: string
  name: string
  category: string
  stock: number | string
  price: number
  availableInPos: boolean
  availableOnline: boolean
  image: string
}

export default function ProductsPage() {
  const router = useRouter()

  const products: Product[] = [
    {
      id: "P001",
      name: "Puravida 5 Gallon Water Bottle",
      category: "Refillable",
      stock: 45,
      price: 15.99,
      availableInPos: true,
      availableOnline: true,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "P002",
      name: "Puravida 1 Gallon Purified Water",
      category: "Bottled",
      stock: 120,
      price: 4.99,
      availableInPos: true,
      availableOnline: true,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "P003",
      name: "Puravida Water Refill Service (5 Gallon)",
      category: "Service",
      stock: "Unlimited",
      price: 8.99,
      availableInPos: true,
      availableOnline: false,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "P004",
      name: "Puravida Spring Water 24-Pack",
      category: "Bottled",
      stock: 78,
      price: 12.99,
      availableInPos: true,
      availableOnline: true,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "P005",
      name: "Water Dispenser - Floor Standing",
      category: "Accessory",
      stock: 12,
      price: 89.99,
      availableInPos: true,
      availableOnline: true,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "P006",
      name: "Puravida Alkaline Water 1L (6-Pack)",
      category: "Bottled",
      stock: 65,
      price: 10.59,
      availableInPos: true,
      availableOnline: true,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "P007",
      name: "Water Dispenser Cleaning Service",
      category: "Service",
      stock: "Unlimited",
      price: 24.99,
      availableInPos: true,
      availableOnline: false,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "P008",
      name: "Puravida Mineral Water 500ml (24-Pack)",
      category: "Bottled",
      stock: 92,
      price: 14.99,
      availableInPos: true,
      availableOnline: true,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "P009",
      name: "Water Bottle Carrier",
      category: "Accessory",
      stock: 5,
      price: 19.99,
      availableInPos: true,
      availableOnline: true,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "P010",
      name: "Puravida Sparkling Water 12-Pack",
      category: "Bottled",
      stock: 0,
      price: 16.99,
      availableInPos: false,
      availableOnline: true,
      image: "/placeholder.svg?height=40&width=40",
    },
  ]

  const handleDelete = (ids: string[]) => {
    toast({
      title: "Products deleted",
      description: `${ids.length} product(s) have been deleted.`,
      variant: "destructive",
    })
  }

  const columns: ColumnDef<Product>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => (
        <img
          src={row.getValue("image") || "/placeholder.svg"}
          alt={row.getValue("name")}
          className="w-10 h-10 rounded-md object-cover"
        />
      ),
    },
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("name")}</span>
          <span className="text-xs text-muted-foreground">{row.original.id}</span>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.getValue("category") as string
        return (
          <Badge
            variant="outline"
            className={
              category === "Bottled"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                : category === "Refillable"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : category === "Service"
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
            }
          >
            {category}
          </Badge>
        )
      },
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const stock = row.getValue("stock")
        return typeof stock === "number" ? (
          <span
            className={
              stock === 0
                ? "text-red-500 dark:text-red-400"
                : (stock as number) < 10
                  ? "text-amber-500 dark:text-amber-400"
                  : "text-green-500 dark:text-green-400"
            }
          >
            {stock}
          </span>
        ) : (
          <span>{stock}</span>
        )
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const price = Number.parseFloat(row.getValue("price"))
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(price)
        return <span className="font-medium">{formatted}</span>
      },
    },
    {
      id: "availability",
      header: "Availability",
      cell: ({ row }) => {
        return (
          <div className="flex flex-col gap-1">
            {row.original.availableInPos && (
              <Badge variant="secondary" className="w-fit text-xs">
                POS
              </Badge>
            )}
            {row.original.availableOnline && (
              <Badge variant="secondary" className="w-fit text-xs">
                Online
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/products/${product.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/products/${product.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleDelete([product.id])}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Products</h1>
              <p className="text-muted-foreground">Manage your inventory and e-commerce products</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button className="flex items-center gap-2" onClick={() => router.push("/products/new")}>
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <ProductFilters />
          </div>

          <DataTable columns={columns} data={products} searchKey="name" onDelete={handleDelete} />
        </div>
      </div>
    </div>
  )
}

