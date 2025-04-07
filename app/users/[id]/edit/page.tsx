"use client"
import { useEffect, useState } from "react"
import { SidebarNav } from "../../../../components/sidebar-nav"
import { Header } from "../../../../components/header"
import { UserForm } from "@/components/user-form"
import { getUserById, updateUser } from "@/lib/api"
import { useParams } from "next/navigation"

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams();
  console.log('parámetros:', params); 
  
  const gettingUser = async () => {
    try {
      setLoading(true)
      if (!id) {
        throw new Error("El ID del usuario no está definido");
      }
      const user = await getUserById(id);
      setUserData(user)
      setLoading(false)
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error)
      setError("Error al obtener los datos del usuario")
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      gettingUser()
    }
  }, [id])


  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Editar Usuario</h1>
            <p className="text-muted-foreground">Actualizar información del usuario</p>
          </div>

          {loading && <p className="text-muted-foreground">Cargando...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {userData && <UserForm user={userData} idUser={id} />}
        </div>
      </div>
    </div>
  )
}
