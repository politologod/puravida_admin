export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg">Redirigiendo al panel de control...</p>
      
      {/* Este script de cliente realiza la redirección */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.href = "/dashboard"`,
        }}
      />
    </div>
  )
}

