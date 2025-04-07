import { SidebarNav } from "../../../../components/sidebar-nav"
import { Header } from "../../../../components/header"
import { UserForm } from "@/components/user-form"

// This would normally fetch the user data from an API
const getUserData = (id: string) => {
  return {
    id: id,
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, Anytown, USA",
    role: "Customer",
    status: "active",
    notes: "Prefers delivery on weekends. Has water dispenser subscription.",
  }
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  const userData = getUserData(params.id)

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Edit User</h1>
            <p className="text-muted-foreground">Update user information</p>
          </div>

          <UserForm user={userData} />
        </div>
      </div>
    </div>
  )
}

