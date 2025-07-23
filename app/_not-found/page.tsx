import Link from "next/link"

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Página no encontrada</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <Link 
          href="/dashboard" 
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  )
} 