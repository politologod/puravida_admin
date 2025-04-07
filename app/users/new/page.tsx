import { SidebarNav } from "../../../components/sidebar-nav"
import { Header } from "../../../components/header"
import { UserForm } from "@/components/user-form"

export default function NewUserPage() {
  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Add New User</h1>
            <p className="text-muted-foreground">Create a new user account</p>
          </div>

          <UserForm />
        </div>
      </div>
    </div>
  )
}

