import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import AdminLayout from '@/components/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Sprout, 
  TreeDeciduous, 
  Ruler, 
  Calendar, 
  CircleAlert, 
  CircleCheck, 
  Info, 
  BarChart4, 
  Map, 
  Scissors,
  Leaf,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Componente para gráfico circular simple
const PieChart = ({ segments }: { segments: { name: string; value: number; color: string }[] }) => {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  let currentAngle = 0;

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {segments.map((segment, index) => {
          const percentage = (segment.value / total) * 100;
          const angle = (percentage / 100) * 360;
          const startAngle = currentAngle;
          currentAngle += angle;
          const endAngle = currentAngle;
          
          const startRad = (startAngle - 90) * Math.PI / 180;
          const endRad = (endAngle - 90) * Math.PI / 180;
          
          const x1 = 50 + 40 * Math.cos(startRad);
          const y1 = 50 + 40 * Math.sin(startRad);
          const x2 = 50 + 40 * Math.cos(endRad);
          const y2 = 50 + 40 * Math.sin(endRad);
          
          const largeArcFlag = angle > 180 ? 1 : 0;
          
          const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
          
          return (
            <path 
              key={index} 
              d={pathData} 
              fill={segment.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
              stroke="#fff"
              strokeWidth="0.5"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold">{total}</span>
        <span className="text-sm text-gray-500">Total</span>
      </div>
    </div>
  );
};

// Componente para las estadísticas de mantenimiento
const MaintenanceStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/trees/maintenances/stats'],
    queryFn: async () => {
      const response = await fetch('/api/trees/maintenances/stats');
      if (!response.ok) {
        throw new Error('Error al cargar estadísticas de mantenimiento');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Datos para gráfico de mantenimientos por tipo
  const maintenanceByType = stats?.byType || [];
  const maintenanceTypeSegments = [
    { name: 'Poda', value: maintenanceByType.find((t: any) => t.type.toLowerCase() === 'poda')?.count || 0, color: '#10b981' },
    { name: 'Riego', value: maintenanceByType.find((t: any) => t.type.toLowerCase() === 'riego')?.count || 0, color: '#3b82f6' },
    { name: 'Tratamiento', value: maintenanceByType.find((t: any) => t.type.toLowerCase() === 'tratamiento fitosanitario')?.count || 0, color: '#f59e0b' },
    { name: 'Plantación', value: maintenanceByType.find((t: any) => t.type.toLowerCase() === 'plantación')?.count || 0, color: '#8b5cf6' },
    { name: 'Otro', value: maintenanceByType.filter((t: any) => !['poda', 'riego', 'tratamiento fitosanitario', 'plantación'].includes(t.type.toLowerCase()))?.reduce((sum: number, item: any) => sum + item.count, 0), color: '#6b7280' },
  ];

  // Datos para gráfico de mantenimientos por estado
  const maintenanceHealthSegments = [
    { name: 'Bueno', value: stats?.byHealth?.good || 0, color: '#10b981' },
    { name: 'Regular', value: stats?.byHealth?.fair || 0, color: '#f59e0b' },
    { name: 'Malo', value: stats?.byHealth?.poor || 0, color: '#ef4444' },
    { name: 'No evaluado', value: stats?.byHealth?.notAssessed || 0, color: '#6b7280' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Mantenimientos por Tipo</CardTitle>
          <CardDescription>Distribución de actividades de mantenimiento</CardDescription>
        </CardHeader>
        <CardContent>
          <PieChart segments={maintenanceTypeSegments} />
          <div className="grid grid-cols-2 gap-2 mt-4">
            {maintenanceTypeSegments.map((segment, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: segment.color }}></div>
                <div className="text-sm flex-1">{segment.name}</div>
                <div className="text-sm font-medium">{segment.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Mantenimientos por Estado de Árbol</CardTitle>
          <CardDescription>Distribución según condición del árbol</CardDescription>
        </CardHeader>
        <CardContent>
          <PieChart segments={maintenanceHealthSegments} />
          <div className="grid grid-cols-2 gap-2 mt-4">
            {maintenanceHealthSegments.map((segment, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: segment.color }}></div>
                <div className="text-sm flex-1">{segment.name}</div>
                <div className="text-sm font-medium">{segment.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Resumen de Mantenimientos</CardTitle>
          <CardDescription>Indicadores clave de mantenimiento de árboles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col p-4 bg-green-50 rounded-lg">
              <div className="text-green-700 mb-1 flex items-center">
                <Scissors className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Total Mantenimientos</span>
              </div>
              <div className="text-3xl font-bold text-green-800">{stats?.total || 0}</div>
              <div className="text-sm text-green-600 mt-1">Acumulado histórico</div>
            </div>
            
            <div className="flex flex-col p-4 bg-blue-50 rounded-lg">
              <div className="text-blue-700 mb-1 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Recientes (30 días)</span>
              </div>
              <div className="text-3xl font-bold text-blue-800">{stats?.recent || 0}</div>
              <div className="text-sm text-blue-600 mt-1">Último mes</div>
            </div>
            
            <div className="flex flex-col p-4 bg-amber-50 rounded-lg">
              <div className="text-amber-700 mb-1 flex items-center">
                <Leaf className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Tratamientos Especiales</span>
              </div>
              <div className="text-3xl font-bold text-amber-800">{stats?.byType?.find((t: any) => t.type.toLowerCase() === 'tratamiento fitosanitario')?.count || 0}</div>
              <div className="text-sm text-amber-600 mt-1">Salud del arbolado</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente para las estadísticas del inventario
const InventoryStats = () => {
  const { data: trees, isLoading: isLoadingTrees } = useQuery({
    queryKey: ['/api/trees'],
    queryFn: async () => {
      const response = await fetch('/api/trees?limit=1000');
      if (!response.ok) {
        throw new Error('Error al cargar el inventario de árboles');
      }
      return response.json();
    },
  });

  const { data: species, isLoading: isLoadingSpecies } = useQuery({
    queryKey: ['/api/tree-species'],
    queryFn: async () => {
      const response = await fetch('/api/tree-species');
      if (!response.ok) {
        throw new Error('Error al cargar especies de árboles');
      }
      return response.json();
    },
  });

  if (isLoadingTrees || isLoadingSpecies) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Procesar datos del inventario
  const healthStatusCounts = {
    bueno: 0,
    regular: 0,
    malo: 0,
    critico: 0,
    noEvaluado: 0
  };

  trees?.data?.forEach((tree: any) => {
    const status = tree.healthStatus?.toLowerCase() || 'noEvaluado';
    if (status === 'bueno') healthStatusCounts.bueno++;
    else if (status === 'regular') healthStatusCounts.regular++;
    else if (status === 'malo') healthStatusCounts.malo++;
    else if (status === 'crítico' || status === 'critico') healthStatusCounts.critico++;
    else healthStatusCounts.noEvaluado++;
  });

  // Datos para gráfico de estado de salud
  const healthSegments = [
    { name: 'Bueno', value: healthStatusCounts.bueno, color: '#10b981' },
    { name: 'Regular', value: healthStatusCounts.regular, color: '#f59e0b' },
    { name: 'Malo', value: healthStatusCounts.malo, color: '#ef4444' },
    { name: 'Crítico', value: healthStatusCounts.critico, color: '#b91c1c' },
    { name: 'No evaluado', value: healthStatusCounts.noEvaluado, color: '#6b7280' },
  ];

  // Contar árboles por especie
  const speciesCounts: Record<string, number> = {};
  trees?.data?.forEach((tree: any) => {
    const speciesName = tree.speciesName || 'Desconocido';
    speciesCounts[speciesName] = (speciesCounts[speciesName] || 0) + 1;
  });

  // Convertir a array y ordenar
  const speciesCountsArray = Object.entries(speciesCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Calcular el total y el top 5
  const totalTrees = trees?.data?.length || 0;
  const topSpecies = speciesCountsArray.slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Estado de Salud del Arbolado</CardTitle>
          <CardDescription>Distribución por condición de los árboles</CardDescription>
        </CardHeader>
        <CardContent>
          <PieChart segments={healthSegments} />
          <div className="grid grid-cols-2 gap-2 mt-4">
            {healthSegments.map((segment, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: segment.color }}></div>
                <div className="text-sm flex-1">{segment.name}</div>
                <div className="text-sm font-medium">{segment.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Especies Más Comunes</CardTitle>
          <CardDescription>Top 5 especies en el inventario</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topSpecies.map((species, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{species.name}</span>
                  <span className="text-sm text-gray-500">{species.count} ({Math.round((species.count / totalTrees) * 100)}%)</span>
                </div>
                <Progress value={(species.count / totalTrees) * 100} className="h-2" />
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Total de Especies:</span>
              <span className="font-bold">{speciesCountsArray.length}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="font-medium">Total de Árboles:</span>
              <span className="font-bold">{totalTrees}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Indicadores Clave del Inventario</CardTitle>
          <CardDescription>Resumen de datos del inventario arbóreo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col p-4 bg-green-50 rounded-lg">
              <div className="text-green-700 mb-1 flex items-center">
                <TreeDeciduous className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Total Árboles</span>
              </div>
              <div className="text-3xl font-bold text-green-800">{totalTrees}</div>
              <div className="text-sm text-green-600 mt-1">En inventario</div>
            </div>
            
            <div className="flex flex-col p-4 bg-blue-50 rounded-lg">
              <div className="text-blue-700 mb-1 flex items-center">
                <Leaf className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Especies</span>
              </div>
              <div className="text-3xl font-bold text-blue-800">{speciesCountsArray.length}</div>
              <div className="text-sm text-blue-600 mt-1">Diversidad</div>
            </div>
            
            <div className="flex flex-col p-4 bg-amber-50 rounded-lg">
              <div className="text-amber-700 mb-1 flex items-center">
                <CircleCheck className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Buen Estado</span>
              </div>
              <div className="text-3xl font-bold text-amber-800">{healthStatusCounts.bueno}</div>
              <div className="text-sm text-amber-600 mt-1">{totalTrees ? Math.round((healthStatusCounts.bueno / totalTrees) * 100) : 0}% del total</div>
            </div>
            
            <div className="flex flex-col p-4 bg-red-50 rounded-lg">
              <div className="text-red-700 mb-1 flex items-center">
                <CircleAlert className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Atención Requerida</span>
              </div>
              <div className="text-3xl font-bold text-red-800">{healthStatusCounts.malo + healthStatusCounts.critico}</div>
              <div className="text-sm text-red-600 mt-1">{totalTrees ? Math.round(((healthStatusCounts.malo + healthStatusCounts.critico) / totalTrees) * 100) : 0}% del total</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function TreeReportsPage() {
  const { toast } = useToast();
  const [reportYear, setReportYear] = React.useState(new Date().getFullYear().toString());
  const [reportType, setReportType] = React.useState('todos');
  
  // Obtener años disponibles para filtrar (último lustro)
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({length: 5}, (_, i) => (currentYear - i).toString());

  return (
    <AdminLayout>
      <Helmet>
        <title>Reportes del Inventario Arbóreo | ParquesMX</title>
        <meta name="description" content="Estadísticas y reportes del inventario arbóreo en los parques municipales" />
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-800 flex items-center">
              <BarChart4 className="mr-2 h-8 w-8" />
              Reportes del Inventario Arbóreo
            </h1>
            <p className="mt-1 text-gray-600">
              Estadísticas y análisis de los árboles en el sistema de parques
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
            <Select value={reportYear} onValueChange={setReportYear}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Seleccionar año" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo de reporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los árboles</SelectItem>
                <SelectItem value="mantenimiento">Con mantenimiento</SelectItem>
                <SelectItem value="criticos">En estado crítico</SelectItem>
                <SelectItem value="plantados">Recientemente plantados</SelectItem>
              </SelectContent>
            </Select>
            
            <Button className="whitespace-nowrap">
              <FileText className="mr-2 h-4 w-4" />
              Exportar Reporte
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full md:w-[600px]">
            <TabsTrigger value="general">Vista General</TabsTrigger>
            <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
            <TabsTrigger value="inventory">Inventario</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Resumen del Inventario</CardTitle>
                  <CardDescription>Estado general del arbolado</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <TreeDeciduous className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium">Total de Árboles</span>
                      </div>
                      <span className="font-bold">132</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Leaf className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium">Especies Diferentes</span>
                      </div>
                      <span className="font-bold">18</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Map className="h-5 w-5 text-amber-600 mr-2" />
                        <span className="text-sm font-medium">Parques con Árboles</span>
                      </div>
                      <span className="font-bold">7</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CircleAlert className="h-5 w-5 text-red-600 mr-2" />
                        <span className="text-sm font-medium">En Estado Crítico</span>
                      </div>
                      <span className="font-bold">5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Actividades de Mantenimiento</CardTitle>
                  <CardDescription>Resumen de intervenciones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Scissors className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium">Total Mantenimientos</span>
                      </div>
                      <span className="font-bold">43</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium">En los Últimos 30 días</span>
                      </div>
                      <span className="font-bold">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Ruler className="h-5 w-5 text-amber-600 mr-2" />
                        <span className="text-sm font-medium">Podas Realizadas</span>
                      </div>
                      <span className="font-bold">24</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Leaf className="h-5 w-5 text-purple-600 mr-2" />
                        <span className="text-sm font-medium">Tratamientos Sanitarios</span>
                      </div>
                      <span className="font-bold">8</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Especies Destacadas</CardTitle>
                  <CardDescription>Especies más presentes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Ahuehuete</span>
                        <span className="text-xs text-gray-500">26 árboles</span>
                      </div>
                      <Progress value={26} max={132} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Jacaranda</span>
                        <span className="text-xs text-gray-500">18 árboles</span>
                      </div>
                      <Progress value={18} max={132} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Fresno</span>
                        <span className="text-xs text-gray-500">15 árboles</span>
                      </div>
                      <Progress value={15} max={132} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Laurel de la India</span>
                        <span className="text-xs text-gray-500">12 árboles</span>
                      </div>
                      <Progress value={12} max={132} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Indicadores Generales de Salud del Arbolado</CardTitle>
                <CardDescription>Distribución por estado de salud en el inventario</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex flex-col p-4 bg-green-50 rounded-lg">
                    <div className="text-green-700 mb-1 flex items-center">
                      <CircleCheck className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Buen Estado</span>
                    </div>
                    <div className="text-3xl font-bold text-green-800">74</div>
                    <div className="text-sm text-green-600 mt-1">56% del total</div>
                  </div>
                  
                  <div className="flex flex-col p-4 bg-yellow-50 rounded-lg">
                    <div className="text-yellow-700 mb-1 flex items-center">
                      <Info className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Estado Regular</span>
                    </div>
                    <div className="text-3xl font-bold text-yellow-800">41</div>
                    <div className="text-sm text-yellow-600 mt-1">31% del total</div>
                  </div>
                  
                  <div className="flex flex-col p-4 bg-orange-50 rounded-lg">
                    <div className="text-orange-700 mb-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Mal Estado</span>
                    </div>
                    <div className="text-3xl font-bold text-orange-800">12</div>
                    <div className="text-sm text-orange-600 mt-1">9% del total</div>
                  </div>
                  
                  <div className="flex flex-col p-4 bg-red-50 rounded-lg">
                    <div className="text-red-700 mb-1 flex items-center">
                      <CircleAlert className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Estado Crítico</span>
                    </div>
                    <div className="text-3xl font-bold text-red-800">5</div>
                    <div className="text-sm text-red-600 mt-1">4% del total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="maintenance">
            <MaintenanceStats />
          </TabsContent>
          
          <TabsContent value="inventory">
            <InventoryStats />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

export default TreeReportsPage;