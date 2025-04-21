"use client"

import { SidebarNav } from "../../components/sidebar-nav"
import { Header } from "../../components/header"
import { useState, useEffect } from "react"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { getDashboardStats, getSystemHealth, getSystemMetrics, getSalesByMonth, getOrdersByMonth, getSalesByCategory } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

// Componentes modulares
import { StatCards } from "@/components/dashboard/stat-cards"
import { MonthlyOrdersChart } from "@/components/dashboard/monthly-orders-chart"
import { SalesCharts } from "@/components/dashboard/sales-charts"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { SystemMonitor } from "@/components/dashboard/system-monitor"

export default function DashboardPage() {
  // Proteger esta ruta - redirigirá a /login si no está autenticado
  const { user, isLoading: authLoading } = useRequireAuth();
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [salesByCategory, setSalesByCategory] = useState<any[]>([]);
  const [salesByMonth, setSalesByMonth] = useState<any[]>([]);
  const [ordersByMonth, setOrdersByMonth] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiErrors, setApiErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setApiErrors({});
        
        // Cargar datos del dashboard
        try {
          const dashboardResponse = await getDashboardStats();
          if (dashboardResponse && dashboardResponse.data) {
            setDashboardData(dashboardResponse.data);
          }
        } catch (dashboardError: any) {
          console.error("Error al cargar datos del dashboard:", dashboardError);
          setApiErrors(prev => ({
            ...prev, 
            dashboard: 'Error al cargar estadísticas: ' + 
              (dashboardError.message?.includes('created_at') 
                ? 'Problema con la columna created_at' 
                : dashboardError.message || 'Error desconocido')
          }));
          
          // Establecer datos alternativos
          setDashboardData({
            current_month: {
              sales: 0,
              orders: 0,
              new_customers: 0
            },
            growth: {
              sales: 0,
              orders: 0,
              customers: 0
            },
            top_products: [],
            recent_orders: [],
            recent_deliveries: []
          });
        }
        
        // Cargar ventas por categoría
        try {
          const categoryResponse = await getSalesByCategory();
          if (categoryResponse && categoryResponse.data) {
            setSalesByCategory(categoryResponse.data);
          }
        } catch (categoryError: any) {
          console.error("Error al cargar ventas por categoría:", categoryError);
          setApiErrors(prev => ({...prev, categories: 'Error al cargar datos de categorías'}));
        }
        
        // Cargar ventas por mes
        try {
          const salesResponse = await getSalesByMonth();
          if (salesResponse && salesResponse.data && salesResponse.data.salesByMonth) {
            // Transformar datos para el gráfico
            const formattedSalesData = salesResponse.data.salesByMonth.map((item: any) => ({
              month: getMonthName(item.month),
              value: item.total || 0
            }));
            setSalesByMonth(formattedSalesData);
          }
        } catch (salesError: any) {
          console.error("Error al cargar ventas por mes:", salesError);
          setApiErrors(prev => ({...prev, sales: 'Error al cargar datos de ventas por mes'}));
        }
        
        // Cargar órdenes por mes
        try {
          const ordersResponse = await getOrdersByMonth();
          if (ordersResponse && ordersResponse.data && ordersResponse.data.ordersByMonth) {
            // Transformar datos para el gráfico
            const formattedOrdersData = ordersResponse.data.ordersByMonth.map((item: any) => ({
              month: getMonthName(item.month),
              count: item.count || 0,
              completed: item.completed || 0,
              pending: item.pending || 0
            }));
            setOrdersByMonth(formattedOrdersData);
          }
        } catch (ordersError: any) {
          console.error("Error al cargar órdenes por mes:", ordersError);
          setApiErrors(prev => ({...prev, orders: 'Error al cargar datos de órdenes por mes'}));
        }
        
        // Cargar datos de salud del sistema y métricas al final con un timeout
        // para que no bloquee la carga del resto de los datos y mantenga una experiencia fluida
        setTimeout(async () => {
          try {
            const healthResponse = await getSystemHealth();
            setSystemHealth(healthResponse);
          } catch (healthError) {
            console.error("Error al cargar datos de salud:", healthError);
            setApiErrors(prev => ({...prev, health: 'Error al cargar datos de salud del sistema'}));
          }
          
          try {
            const metricsResponse = await getSystemMetrics();
            setSystemMetrics(metricsResponse.metrics);
          } catch (metricsError) {
            console.error("Error al cargar métricas:", metricsError);
            setApiErrors(prev => ({...prev, metrics: 'Error al cargar métricas del sistema'}));
          }
        }, 1000);
        
      } catch (err: any) {
        console.error("Error general al cargar datos:", err);
        setError("No se pudieron cargar algunos datos del dashboard. Por favor, intenta de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!authLoading) {
      fetchDashboardData();
    }
  }, [authLoading]);
  
  // Función auxiliar para obtener el nombre del mes a partir del número
  const getMonthName = (monthNumber: number) => {
    const months = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun", 
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];
    return months[monthNumber - 1] || `Mes ${monthNumber}`;
  };
  
  // Formatear porcentajes
  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };
  
  // Determinar si mostrar flecha hacia arriba o hacia abajo según el valor
  const getGrowthIndicator = (value: number) => {
    return value >= 0 ? (
      <span className="text-green-500 dark:text-green-400 flex items-center mr-1">
        <ArrowUpRight className="h-3 w-3 mr-1" />
        {formatPercent(value)}
      </span>
    ) : (
      <span className="text-red-500 dark:text-red-400 flex items-center mr-1">
        <ArrowDownRight className="h-3 w-3 mr-1" />
        {formatPercent(value)}
      </span>
    );
  };

  // Mostrar un estado de carga mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Cargando...</h2>
          <p className="text-muted-foreground">Verificando autenticación</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Bienvenido {user?.name || 'Usuario'} al Sistema POS Puravida 23</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {apiErrors.dashboard && (
            <Alert className="mb-6 bg-amber-50 text-amber-800 border border-amber-200">
              <AlertDescription>{apiErrors.dashboard}</AlertDescription>
            </Alert>
          )}

          {/* Tarjetas de estadísticas */}
          <StatCards 
            dashboardData={dashboardData} 
            isLoading={isLoading} 
            formatPercent={formatPercent}
            getGrowthIndicator={getGrowthIndicator}
          />

          {/* Gráfico de Órdenes por Mes */}
          <MonthlyOrdersChart 
            ordersByMonth={ordersByMonth}
            isLoading={isLoading}
          />

          {/* Gráficos de ventas por categoría y tendencia de ingresos */}
          <SalesCharts 
            salesByCategory={salesByCategory}
            salesByMonth={salesByMonth}
            isLoading={isLoading}
            formatCurrency={formatCurrency}
          />

          {/* Órdenes recientes y entregas */}
          <RecentActivity 
            dashboardData={dashboardData}
            isLoading={isLoading}
            formatCurrency={formatCurrency}
          />

          {/* Monitoreo del sistema */}
          <SystemMonitor 
            systemHealth={systemHealth}
            systemMetrics={systemMetrics}
            isLoading={isLoading}
            apiErrors={apiErrors}
          />
        </div>
      </div>
    </div>
  )
}
