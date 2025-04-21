"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Server, HardDrive, Cpu, Activity, Database, Gauge } from "lucide-react"

interface SystemMonitorProps {
  systemHealth: any;
  systemMetrics: any;
  isLoading: boolean;
  apiErrors: {[key: string]: string};
}

export function SystemMonitor({ systemHealth, systemMetrics, isLoading, apiErrors }: SystemMonitorProps) {
  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">Monitoreo del Sistema</h2>
      
      {(apiErrors.health || apiErrors.metrics) && (
        <Alert className="mb-4 bg-amber-50 text-amber-800 border border-amber-200">
          <AlertDescription>
            {apiErrors.health && apiErrors.metrics 
              ? 'Error al cargar datos de salud y métricas del sistema' 
              : apiErrors.health || apiErrors.metrics}
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="health" className="mb-6">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="health">Estado del Sistema</TabsTrigger>
          <TabsTrigger value="resources">Recursos y Rendimiento</TabsTrigger>
        </TabsList>
        
        <TabsContent value="health">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tarjeta de Estado General */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Activity className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Estado Operativo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center">
                      <div className={`
                        w-16 h-16 rounded-full flex items-center justify-center mb-2
                        ${systemHealth?.status === "operational" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                          : systemHealth?.status === "degraded" 
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }
                      `}>
                        <Server className="h-8 w-8" />
                      </div>
                      
                      <Badge 
                        variant={systemHealth?.status === "operational" ? "outline" : 
                                systemHealth?.status === "degraded" ? "default" : "destructive"}
                        className={`
                          text-sm py-1 px-3
                          ${systemHealth?.status === "operational" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                            : systemHealth?.status === "degraded"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          }
                        `}
                      >
                        {systemHealth?.status === "operational" ? "Sistema Operativo" : 
                         systemHealth?.status === "degraded" ? "Rendimiento Degradado" : 
                         systemHealth?.status ? systemHealth.status : "Estado Desconocido"}
                      </Badge>
                    </div>
                    
                    <div className="pt-2 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tiempo activo:</span>
                        <span className="font-medium">{systemMetrics?.process?.uptime || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Actualizado:</span>
                        <span className="font-medium">
                          {systemHealth?.timestamp ? new Date(systemHealth.timestamp).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Tarjeta de Servicios */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Database className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Servicios y Dependencias
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                      <div className="flex items-center">
                        <Server className="h-5 w-5 mr-3 text-blue-600 dark:text-blue-400" />
                        <div>
                          <div className="font-medium">Servidor API</div>
                          <div className="text-xs text-muted-foreground">Servicio principal</div>
                        </div>
                      </div>
                      <Badge 
                        variant={systemHealth?.status === "operational" ? "outline" : "destructive"}
                        className={
                          systemHealth?.status === "operational" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }
                      >
                        {systemHealth?.status === "operational" ? "En línea" : 
                         systemHealth?.status === "degraded" ? "Degradado" : 
                         "Problema"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                      <div className="flex items-center">
                        <Database className="h-5 w-5 mr-3 text-blue-600 dark:text-blue-400" />
                        <div>
                          <div className="font-medium">Base de Datos</div>
                          <div className="text-xs text-muted-foreground">Almacenamiento</div>
                        </div>
                      </div>
                      <Badge 
                        variant={systemHealth?.dependencies?.database?.status === "operational" ? "outline" : "destructive"}
                        className={
                          systemHealth?.dependencies?.database?.status === "operational" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }
                      >
                        {systemHealth?.dependencies?.database?.status === "operational" ? "Conectada" : 
                         systemHealth?.dependencies?.database?.status === "down" ? "Desconectada" : 
                         "Error"}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-2">
                      Última verificación: {systemHealth?.timestamp ? new Date(systemHealth.timestamp).toLocaleTimeString() : 'Desconocido'}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="resources">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tarjeta de Uso de Recursos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Gauge className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Uso de Recursos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : systemMetrics ? (
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <HardDrive className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm font-medium">Memoria</span>
                        </div>
                        <span className="text-sm">
                          {systemMetrics.os?.usedMemoryPercentage || 'N/A'}
                        </span>
                      </div>
                      <Progress 
                        value={systemMetrics.os?.usedMemoryPercentage ? 
                              parseFloat(systemMetrics.os.usedMemoryPercentage) : 0} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Total: {systemMetrics.os?.totalMemory}</span>
                        <span>Libre: {systemMetrics.os?.freeMemory}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <Cpu className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm font-medium">CPU</span>
                        </div>
                        <span className="text-sm">
                          {systemMetrics.os?.loadAvg ? 
                           `${systemMetrics.os.loadAvg[0]} / ${systemMetrics.os.cpus} núcleos` : 
                           'N/A'}
                        </span>
                      </div>
                      <Progress 
                        value={systemMetrics.os?.loadAvg && systemMetrics.os?.cpus ? 
                              (parseFloat(systemMetrics.os.loadAvg[0]) / systemMetrics.os.cpus) * 100 : 0} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>
                          {systemMetrics.os?.loadAvg ? 
                            `Carga: ${systemMetrics.os.loadAvg.join(' / ')}` : 
                            'Información no disponible'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <Server className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm font-medium">Memoria Heap</span>
                        </div>
                        <span className="text-sm">
                          {systemMetrics?.process?.memory?.heapUsedPercentage || 'N/A'}
                        </span>
                      </div>
                      <Progress 
                        value={systemMetrics?.process?.memory?.heapUsedPercentage ? 
                              parseFloat(systemMetrics.process.memory.heapUsedPercentage) : 0} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Proceso: {systemMetrics.process?.memory?.rss || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    No se pudieron cargar las métricas del sistema
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Tarjeta de Información del Sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Server className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Detalles del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : systemMetrics ? (
                  <div className="space-y-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/30 rounded-md">
                        <div className="text-xs text-muted-foreground mb-1">Plataforma</div>
                        <div className="font-medium">
                          {systemMetrics.os?.platform} {systemMetrics.os?.release}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-muted/30 rounded-md">
                        <div className="text-xs text-muted-foreground mb-1">Versión de Node</div>
                        <div className="font-medium">
                          {systemMetrics.process?.nodeVersion || 'N/A'}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-muted/30 rounded-md">
                        <div className="text-xs text-muted-foreground mb-1">Tiempo activo</div>
                        <div className="font-medium">
                          {systemMetrics.process?.uptime || 'N/A'}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-muted/30 rounded-md">
                        <div className="text-xs text-muted-foreground mb-1">CPUs</div>
                        <div className="font-medium">
                          {systemMetrics.os?.cpus || 'N/A'} núcleos
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-4">
                      Esta información se actualiza cada minuto automáticamente.
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    No se pudo cargar la información del sistema
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 