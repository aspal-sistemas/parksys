import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Download, Filter, Users, Map, Activity, AlertTriangle, MessageSquare, BarChart, PieChart, LineChart, CalendarIcon, Check } from 'lucide-react';

const AnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('uso');
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [dateRange, setDateRange] = useState<{from?: Date; to?: Date}>({});
  const [filterMunicipality, setFilterMunicipality] = useState('all');
  const [filterParkType, setFilterParkType] = useState('all');
  const [exportFormat, setExportFormat] = useState('excel');
  
  const handleExportData = () => {
    // Para demostración mostraremos un diálogo de exportación
    setShowExportDialog(true);
  };
  
  const executeExport = () => {
    // Determinamos el tipo de contenido y extensión según el formato seleccionado
    let mimeType = 'text/plain';
    let fileExt = exportFormat;
    let content = 'Datos simulados de exportación';
    
    if (exportFormat === 'excel') {
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      fileExt = 'xlsx';
      content = 'Datos de Excel simulados';
    } else if (exportFormat === 'csv') {
      mimeType = 'text/csv';
      fileExt = 'csv';
      content = 'campo1,campo2,campo3\nvalor1,valor2,valor3';
    } else if (exportFormat === 'pdf') {
      // Para PDF usamos un formato diferente que garantiza su descarga
      mimeType = 'application/pdf';
      
      // En una implementación real, se integraría con una biblioteca de generación de PDF
      // Como jsPDF o similar para generar un PDF con el contenido real
      
      // Para esta demo, vamos a crear un PDF con elementos para mostrar el contenido básico
      // Nota: Este es un PDF muy básico pero visible con estructura válida
      const pdfContent = `
%PDF-1.4
1 0 obj
<< /Type /Catalog
   /Pages 2 0 R
>>
endobj
2 0 obj
<< /Type /Pages
   /Kids [3 0 R]
   /Count 1
>>
endobj
3 0 obj
<< /Type /Page
   /Parent 2 0 R
   /MediaBox [0 0 612 792]
   /Resources << /Font << /F1 4 0 R >> >>
   /Contents 5 0 R
>>
endobj
4 0 obj
<< /Type /Font
   /Subtype /Type1
   /BaseFont /Helvetica
>>
endobj
5 0 obj
<< /Length 172 >>
stream
BT
/F1 24 Tf
50 700 Td
(Reporte de ${activeTab === 'uso' ? 'Uso de Parques' : 
             activeTab === 'actividades' ? 'Actividades' : 
             activeTab === 'incidencias' ? 'Incidencias' : 
             activeTab === 'mantenimiento' ? 'Mantenimiento' : 'Participación Ciudadana'}) Tj
/F1 12 Tf
0 -50 Td
(Fecha: ${new Date().toLocaleDateString()}) Tj
0 -20 Td
(Este es un reporte generado desde el sistema ParquesMX) Tj
0 -20 Td
(Para más información, contacte al administrador del sistema) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000063 00000 n
0000000124 00000 n
0000000247 00000 n
0000000315 00000 n
trailer
<< /Size 6
   /Root 1 0 R
>>
startxref
541
%%EOF
`;
      
      const blob = new Blob([pdfContent], { type: mimeType });
      
      const fileName = `reporte_${activeTab}_${new Date().toISOString().split('T')[0]}.${fileExt}`;
      const url = URL.createObjectURL(blob);
      
      // Creamos un elemento para descargar
      const element = document.createElement('a');
      element.href = url;
      element.download = fileName;
      element.style.display = 'none';
      document.body.appendChild(element);
      
      // Mostramos un mensaje al usuario
      alert(`Exportando datos de ${activeTab} en formato ${exportFormat}\nArchivo: ${fileName}`);
      
      // Descargamos
      element.click();
      
      // Limpiamos
      setTimeout(() => {
        document.body.removeChild(element);
        URL.revokeObjectURL(url);
      }, 100);
      
      setShowExportDialog(false);
      return;
    }
    
    // Para formatos que no son PDF
    const fileName = `reporte_${activeTab}_${new Date().toISOString().split('T')[0]}.${fileExt}`;
    
    // Creamos un elemento temporal para simular la descarga
    const element = document.createElement('a');
    element.setAttribute('href', `data:${mimeType};charset=utf-8,` + encodeURIComponent(content));
    element.setAttribute('download', fileName);
    element.style.display = 'none';
    document.body.appendChild(element);
    
    // Mostramos un mensaje al usuario
    alert(`Exportando datos de ${activeTab} en formato ${exportFormat}\nArchivo: ${fileName}`);
    
    // Simulamos el clic para descargar
    element.click();
    
    // Limpiamos
    document.body.removeChild(element);
    setShowExportDialog(false);
  };
  
  const openFilterDialog = () => {
    setShowFilterDialog(true);
  };
  
  const [filteredStatus, setFilteredStatus] = useState<string | null>(null);
  
  const applyFilters = () => {
    // Representamos los nombres de municipios
    const municipalityNames = {
      'all': 'Todos',
      '1': 'Ciudad de México',
      '2': 'Guadalajara',
      '3': 'Monterrey'
    };
    
    // Representamos nombres de tipos de parques
    const parkTypes = {
      'all': 'Todos',
      'urbano': 'Urbano',
      'lineal': 'Lineal',
      'bosque': 'Bosque',
      'bolsillo': 'De Bolsillo'
    };
    
    const fromDate = dateRange.from ? dateRange.from.toLocaleDateString() : 'no seleccionada';
    const toDate = dateRange.to ? dateRange.to.toLocaleDateString() : 'no seleccionada';
    
    // Creamos un texto para mostrar el estado de los filtros
    const filterStatus = `Filtros aplicados: ${municipalityNames[filterMunicipality as keyof typeof municipalityNames]}, ${parkTypes[filterParkType as keyof typeof parkTypes]}, Desde: ${fromDate}, Hasta: ${toDate}`;
    
    // Actualizamos el estado con los filtros aplicados
    setFilteredStatus(filterStatus);
    
    // Cerramos el diálogo
    setShowFilterDialog(false);
  };
  
  return (
    <AdminLayout title="Análisis y Reportes">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-1">Análisis y Reportes</h2>
            <p className="text-muted-foreground">
              Visualiza estadísticas y genera reportes para la gestión y toma de decisiones
            </p>
            {filteredStatus && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm flex items-center">
                <Filter className="h-4 w-4 mr-2 text-blue-500" />
                <span>{filteredStatus}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              Exportar Datos
            </Button>
            <Button 
              variant={filteredStatus ? "default" : "outline"} 
              onClick={openFilterDialog}
              className={filteredStatus ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
            
            {/* Diálogo de Filtros */}
            <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Filtrar Datos</DialogTitle>
                  <DialogDescription>
                    Selecciona los criterios para filtrar la información mostrada
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="municipality" className="text-right">
                      Municipio
                    </Label>
                    <Select
                      value={filterMunicipality}
                      onValueChange={setFilterMunicipality}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar Municipio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="1">Ciudad de México</SelectItem>
                        <SelectItem value="2">Guadalajara</SelectItem>
                        <SelectItem value="3">Monterrey</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="parkType" className="text-right">
                      Tipo de Parque
                    </Label>
                    <Select
                      value={filterParkType}
                      onValueChange={setFilterParkType}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="urbano">Urbano</SelectItem>
                        <SelectItem value="lineal">Lineal</SelectItem>
                        <SelectItem value="bosque">Bosque</SelectItem>
                        <SelectItem value="bolsillo">De Bolsillo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dateFrom" className="text-right">
                      Desde
                    </Label>
                    <div className="col-span-3 flex gap-2 items-center">
                      <Input
                        id="dateFrom"
                        type="date"
                        className="col-span-3"
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : undefined;
                          setDateRange((prev) => ({ ...prev, from: date }));
                        }}
                      />
                      <CalendarIcon className="h-4 w-4 opacity-50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dateTo" className="text-right">
                      Hasta
                    </Label>
                    <div className="col-span-3 flex gap-2 items-center">
                      <Input
                        id="dateTo"
                        type="date"
                        className="col-span-3"
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : undefined;
                          setDateRange((prev) => ({ ...prev, to: date }));
                        }}
                      />
                      <CalendarIcon className="h-4 w-4 opacity-50" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowFilterDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={applyFilters}>Aplicar Filtros</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Diálogo de Exportación */}
            <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Exportar Datos</DialogTitle>
                  <DialogDescription>
                    Selecciona el formato para exportar los datos del reporte actual
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="exportFormat" className="text-right">
                      Formato
                    </Label>
                    <Select
                      value={exportFormat}
                      onValueChange={setExportFormat}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar Formato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                        <SelectItem value="csv">CSV (.csv)</SelectItem>
                        <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">
                      Datos
                    </Label>
                    <div className="col-span-3">
                      {activeTab === 'uso' && <div>Estadísticas de uso de parques</div>}
                      {activeTab === 'actividades' && <div>Estadísticas de actividades</div>}
                      {activeTab === 'incidencias' && <div>Estadísticas de incidencias</div>}
                      {activeTab === 'mantenimiento' && <div>Estadísticas de mantenimiento</div>}
                      {activeTab === 'participacion' && <div>Estadísticas de participación</div>}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={executeExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="uso">
              <Users className="h-4 w-4 mr-2" />
              Uso de Parques
            </TabsTrigger>
            <TabsTrigger value="actividades">
              <Activity className="h-4 w-4 mr-2" />
              Actividades
            </TabsTrigger>
            <TabsTrigger value="incidencias">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Incidencias
            </TabsTrigger>
            <TabsTrigger value="mantenimiento">
              <Calendar className="h-4 w-4 mr-2" />
              Mantenimiento
            </TabsTrigger>
            <TabsTrigger value="participacion">
              <MessageSquare className="h-4 w-4 mr-2" />
              Participación
            </TabsTrigger>
          </TabsList>
          
          {/* Uso de Parques */}
          <TabsContent value="uso" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Parques</CardTitle>
                  <CardDescription>Total de parques y distribución por tipo</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="text-4xl font-bold mb-2">24</div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="bg-blue-50">Urbanos: 12</Badge>
                    <Badge variant="outline" className="bg-green-50">Lineales: 5</Badge>
                    <Badge variant="outline" className="bg-amber-50">Bosques: 3</Badge>
                    <Badge variant="outline" className="bg-purple-50">De Bolsillo: 4</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Visitantes Mensuales</CardTitle>
                  <CardDescription>Promedio de visitantes por mes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">23,400</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-500 font-medium">↑12.5%</span> vs el año anterior
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Eventos</CardTitle>
                  <CardDescription>Total de eventos realizados en parques</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">453</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-500 font-medium">↑8.3%</span> vs el año anterior
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Uso Anual</CardTitle>
                <CardDescription>Visitantes y eventos por mes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-slate-50 rounded-md">
                  <div className="text-center">
                    <BarChart className="h-12 w-12 mx-auto text-primary mb-4" />
                    <p className="text-lg font-medium">Gráfico de tendencia de uso anual</p>
                    <p className="text-sm text-muted-foreground">Muestra la evolución mensual de visitantes y eventos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Actividades */}
          <TabsContent value="actividades" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total de Actividades</CardTitle>
                  <CardDescription>Actividades programadas en todos los parques</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">195</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-500 font-medium">↑15.8%</span> vs trimestre anterior
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Participación</CardTitle>
                  <CardDescription>Promedio de participantes por actividad</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">28</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-500 font-medium">↑5.2%</span> vs trimestre anterior
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Satisfacción</CardTitle>
                  <CardDescription>Valoración promedio de las actividades</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">4.7 / 5</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Basado en 845 valoraciones
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tipos de Actividades</CardTitle>
                  <CardDescription>Distribución por categoría</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center bg-slate-50 rounded-md">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 mx-auto text-primary mb-4" />
                      <p className="text-lg font-medium">Gráfico de distribución de actividades</p>
                      <p className="text-sm text-muted-foreground">Muestra los tipos de actividades más comunes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Parques con más Actividades</CardTitle>
                  <CardDescription>Top 5 parques por número de actividades</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center bg-slate-50 rounded-md">
                    <div className="text-center">
                      <BarChart className="h-12 w-12 mx-auto text-primary mb-4" />
                      <p className="text-lg font-medium">Gráfico de parques más activos</p>
                      <p className="text-sm text-muted-foreground">Muestra los 5 parques con más actividades programadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Incidencias */}
          <TabsContent value="incidencias" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total de Incidencias</CardTitle>
                  <CardDescription>Incidencias reportadas en todos los parques</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">153</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-rose-500 font-medium">↑5.3%</span> vs mes anterior
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Tiempo de Respuesta</CardTitle>
                  <CardDescription>Promedio para resolver incidencias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">3.2 días</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-500 font-medium">↓15%</span> vs mes anterior
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Tasa de Resolución</CardTitle>
                  <CardDescription>Porcentaje de incidencias resueltas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">87%</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-500 font-medium">↑4%</span> vs mes anterior
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tipos de Incidencias</CardTitle>
                  <CardDescription>Distribución por categoría</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center bg-slate-50 rounded-md">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 mx-auto text-primary mb-4" />
                      <p className="text-lg font-medium">Gráfico de tipos de incidencias</p>
                      <p className="text-sm text-muted-foreground">Muestra la distribución de incidencias por tipo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Incidencias por Parque</CardTitle>
                  <CardDescription>Top 5 parques con más reportes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center bg-slate-50 rounded-md">
                    <div className="text-center">
                      <BarChart className="h-12 w-12 mx-auto text-primary mb-4" />
                      <p className="text-lg font-medium">Gráfico de incidencias por parque</p>
                      <p className="text-sm text-muted-foreground">Muestra los 5 parques con más incidencias reportadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Mantenimiento */}
          <TabsContent value="mantenimiento" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Tareas de Mantenimiento</CardTitle>
                  <CardDescription>Total de tareas programadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">105</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    En 28 parques diferentes
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Presupuesto Utilizado</CardTitle>
                  <CardDescription>Del presupuesto anual de mantenimiento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">65%</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    MXN 3,250,000 de 5,000,000
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Costo Promedio</CardTitle>
                  <CardDescription>Por tarea de mantenimiento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">MXN 30,952</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-rose-500 font-medium">↑8%</span> vs año anterior
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Estado de Tareas</CardTitle>
                  <CardDescription>Distribución por estado</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center bg-slate-50 rounded-md">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 mx-auto text-primary mb-4" />
                      <p className="text-lg font-medium">Gráfico de estados de tareas</p>
                      <p className="text-sm text-muted-foreground">Muestra las tareas completadas, en progreso y pendientes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Tipos de Mantenimiento</CardTitle>
                  <CardDescription>Distribución por categoría</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center bg-slate-50 rounded-md">
                    <div className="text-center">
                      <BarChart className="h-12 w-12 mx-auto text-primary mb-4" />
                      <p className="text-lg font-medium">Gráfico de tipos de mantenimiento</p>
                      <p className="text-sm text-muted-foreground">Muestra los tipos de tareas de mantenimiento más comunes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Participación Ciudadana */}
          <TabsContent value="participacion" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total Comentarios</CardTitle>
                  <CardDescription>Comentarios recibidos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">865</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-500 font-medium">↑22%</span> vs año anterior
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Encuestas Completadas</CardTitle>
                  <CardDescription>Total de participaciones en encuestas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">1,245</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    En 12 encuestas publicadas
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Propuestas Ciudadanas</CardTitle>
                  <CardDescription>Ideas y propuestas recibidas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">196</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-500 font-medium">↑32%</span> vs año anterior
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Participación</CardTitle>
                <CardDescription>Evolución mensual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-slate-50 rounded-md">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 mx-auto text-primary mb-4" />
                    <p className="text-lg font-medium">Gráfico de tendencia de participación</p>
                    <p className="text-sm text-muted-foreground">Muestra la evolución mensual de comentarios, encuestas y propuestas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Parques con Mayor Participación</CardTitle>
                <CardDescription>Top 5 parques con más interacciones ciudadanas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-slate-50 rounded-md">
                  <div className="text-center">
                    <BarChart className="h-12 w-12 mx-auto text-primary mb-4" />
                    <p className="text-lg font-medium">Gráfico de participación por parque</p>
                    <p className="text-sm text-muted-foreground">Muestra los 5 parques con mayor participación ciudadana</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsDashboard;