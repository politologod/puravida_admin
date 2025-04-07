"use client"
import { useEffect, useState } from "react"
import { SidebarNav } from "../../../../components/sidebar-nav"
import { Header } from "../../../../components/header"
import { UserForm } from "@/components/user-form"
import { getUserById, updateUser } from "@/lib/api"
import { useParams } from "next/navigation"


export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  //const { id } = useParams() as { id: string | undefined };
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams();
  console.log('params:', params); 
  
  
  // 👈 DEBUG CRÍTICO
  const gettingUser = async () => {
    try {
      setLoading(true)
      if (!id) {
        throw new Error("User ID is undefined");
      }
      const user = await getUserById(id);
      setUserData(user)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching user data:", error)
      setError("Error fetching user data")
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      gettingUser()
    }
  }, [id])


  const handleUserUpdate = async (updatedUser: any, id: any) => {
    const update = updateUser(id, updatedUser)
    console.log("User updated:", update)
  }


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

          {loading && <p className="text-muted-foreground">Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {userData && <UserForm user={userData} />}
        </div>
      </div>
    </div>
  )
}
