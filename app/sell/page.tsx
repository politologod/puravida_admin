import { SidebarNav } from "../../components/sidebar-nav"
import { Header } from "../../components/header"
import { CategoryFilter } from "../../components/category-filter"
import { FoodGrid } from "../../components/food-grid"
import { Cart } from "../../components/cart"
import { Footer } from "../../components/footer"

export default function SellPage() {
  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-auto p-4">
            <div className="mb-4">
              <h1 className="text-2xl font-bold">Point of Sale</h1>
              <p className="text-muted-foreground">Sell water products and services</p>
            </div>
            <CategoryFilter />
            <FoodGrid />
          </main>
          <Cart />
        </div>
        <Footer />
      </div>
    </div>
  )
}

