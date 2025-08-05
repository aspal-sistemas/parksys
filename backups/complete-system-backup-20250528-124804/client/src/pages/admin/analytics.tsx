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
      
      // En una implementación real, se utilizaría una biblioteca como jsPDF
      // Aquí simulamos un PDF más elaborado con datos según el tipo de reporte
      
      // Construimos las tablas y datos según el tipo de reporte
      let reportTitle = "";
      let tableData = "";
      let chartDescription = "";
      let summaryData = "";
      
      // Configuramos el contenido según la pestaña seleccionada
      if (activeTab === 'uso') {
        reportTitle = "Uso de Parques";
        tableData = `
/F1 10 Tf
50 550 Td
(Tabla de Uso por Mes) Tj
/F1 8 Tf
0 -20 Td
(Mes         | Visitantes  | Eventos) Tj
0 -15 Td
(Enero       | 15,420      | 28) Tj
0 -15 Td
(Febrero     | 18,350      | 35) Tj
0 -15 Td
(Marzo       | 21,280      | 42) Tj
0 -15 Td
(Abril       | 24,150      | 38) Tj
0 -15 Td
(Mayo        | 26,780      | 45) Tj
0 -30 Td
`;
        chartDescription = `
/F1 10 Tf
(Distribución de Visitantes por Tipo de Parque) Tj
/F1 8 Tf
0 -15 Td
(Parques Urbanos: 45%) Tj
0 -12 Td
(Parques Lineales: 25%) Tj
0 -12 Td
(Bosques Urbanos: 20%) Tj
0 -12 Td
(Parques de Bolsillo: 10%) Tj
`;
        summaryData = `
/F1 10 Tf
50 300 Td
(Resumen de Uso) Tj
/F1 8 Tf
0 -15 Td
(Total de Visitantes: 487,520) Tj
0 -12 Td
(Promedio Mensual: 40,626) Tj
0 -12 Td
(Mes con Mayor Afluencia: Mayo) Tj
0 -12 Td
(Incremento vs. Año Anterior: 15.8%) Tj
`;
      } else if (activeTab === 'actividades') {
        reportTitle = "Actividades en Parques";
        tableData = `
/F1 10 Tf
50 550 Td
(Actividades por Categoría) Tj
/F1 8 Tf
0 -20 Td
(Categoría     | Cantidad   | Participantes) Tj
0 -15 Td
(Deportivas    | 42         | 3,580) Tj
0 -15 Td
(Culturales    | 35         | 2,850) Tj
0 -15 Td
(Educativas    | 28         | 1,920) Tj
0 -15 Td
(Recreativas   | 25         | 4,150) Tj
0 -15 Td
(Comunitarias  | 23         | 2,750) Tj
0 -30 Td
`;
        chartDescription = `
/F1 10 Tf
(Participación por Grupo de Edad) Tj
/F1 8 Tf
0 -15 Td
(Niños (0-12): 28%) Tj
0 -12 Td
(Adolescentes (13-18): 15%) Tj
0 -12 Td
(Jóvenes (19-35): 30%) Tj
0 -12 Td
(Adultos (36-60): 20%) Tj
0 -12 Td
(Adultos Mayores (61+): 7%) Tj
`;
        summaryData = `
/F1 10 Tf
50 300 Td
(Resumen de Actividades) Tj
/F1 8 Tf
0 -15 Td
(Total de Actividades: 153) Tj
0 -12 Td
(Promedio de Participantes: 98) Tj
0 -12 Td
(Categoría más Popular: Deportivas) Tj
0 -12 Td
(Incremento vs. Año Anterior: 12.5%) Tj
`;
      } else if (activeTab === 'incidencias') {
        reportTitle = "Incidencias Reportadas";
        tableData = `
/F1 10 Tf
50 550 Td
(Incidencias por Tipo) Tj
/F1 8 Tf
0 -20 Td
(Tipo               | Cantidad  | % Resueltas) Tj
0 -15 Td
(Vandalismo         | 45        | 85%) Tj
0 -15 Td
(Basura             | 78        | 92%) Tj
0 -15 Td
(Iluminación        | 32        | 78%) Tj
0 -15 Td
(Mobiliario dañado  | 54        | 65%) Tj
0 -15 Td
(Vegetación         | 28        | 89%) Tj
0 -30 Td
`;
        chartDescription = `
/F1 10 Tf
(Tiempo de Resolución) Tj
/F1 8 Tf
0 -15 Td
(Menos de 24 horas: 35%) Tj
0 -12 Td
(1-3 días: 42%) Tj
0 -12 Td
(4-7 días: 15%) Tj
0 -12 Td
(Más de 7 días: 8%) Tj
`;
        summaryData = `
/F1 10 Tf
50 300 Td
(Resumen de Incidencias) Tj
/F1 8 Tf
0 -15 Td
(Total de Incidencias: 237) Tj
0 -12 Td
(Porcentaje Resueltas: 82%) Tj
0 -12 Td
(Tiempo Promedio de Resolución: 3.5 días) Tj
0 -12 Td
(Parque con Más Incidencias: Parque Metropolitano) Tj
`;
      } else if (activeTab === 'mantenimiento') {
        reportTitle = "Mantenimiento de Parques";
        tableData = `
/F1 10 Tf
50 550 Td
(Tareas de Mantenimiento) Tj
/F1 8 Tf
0 -20 Td
(Tipo                | Cantidad  | Costo Promedio) Tj
0 -15 Td
(Jardinería          | 85        | $15,450) Tj
0 -15 Td
(Estructura          | 32        | $28,750) Tj
0 -15 Td
(Instalaciones       | 48        | $22,300) Tj
0 -15 Td
(Mobiliario          | 65        | $12,580) Tj
0 -15 Td
(Iluminación         | 42        | $18,920) Tj
0 -30 Td
`;
        chartDescription = `
/F1 10 Tf
(Estado de Tareas) Tj
/F1 8 Tf
0 -15 Td
(Completadas: 68%) Tj
0 -12 Td
(En Progreso: 22%) Tj
0 -12 Td
(Pendientes: 10%) Tj
`;
        summaryData = `
/F1 10 Tf
50 300 Td
(Resumen de Mantenimiento) Tj
/F1 8 Tf
0 -15 Td
(Total de Tareas: 272) Tj
0 -12 Td
(Inversión Total: $4,850,000) Tj
0 -12 Td
(Costo Promedio por Tarea: $17,830) Tj
0 -12 Td
(Parque con Mayor Inversión: Parque Metropolitano) Tj
`;
      } else { // participacion
        reportTitle = "Participación Ciudadana";
        tableData = `
/F1 10 Tf
50 550 Td
(Interacciones Ciudadanas) Tj
/F1 8 Tf
0 -20 Td
(Tipo               | Cantidad  | % Positivas) Tj
0 -15 Td
(Comentarios        | 865       | 78%) Tj
0 -15 Td
(Encuestas          | 1,245     | 92%) Tj
0 -15 Td
(Propuestas         | 196       | 85%) Tj
0 -15 Td
(Votaciones         | 3,580     | 88%) Tj
0 -15 Td
(Workshops          | 38        | 95%) Tj
0 -30 Td
`;
        chartDescription = `
/F1 10 Tf
(Participación por Canal) Tj
/F1 8 Tf
0 -15 Td
(App Móvil: 45%) Tj
0 -12 Td
(Sitio Web: 32%) Tj
0 -12 Td
(Presencial: 15%) Tj
0 -12 Td
(WhatsApp: 8%) Tj
`;
        summaryData = `
/F1 10 Tf
50 300 Td
(Resumen de Participación) Tj
/F1 8 Tf
0 -15 Td
(Total Interacciones: 5,924) Tj
0 -12 Td
(Incremento vs. Año Anterior: 28.5%) Tj
0 -12 Td
(Valoración Promedio: 4.3/5) Tj
0 -12 Td
(Parque con Mayor Participación: Parque Agua Azul) Tj
`;
      }
      
      // Construimos el PDF con todos los elementos
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
<< /Length 2500 >>
stream
BT
% Encabezado
/F1 12 Tf
50 740 Td
(ParquesMX - Sistema de Gestión de Parques Urbanos) Tj

% Título del reporte
/F1 24 Tf
50 700 Td
(Reporte de ${reportTitle}) Tj

% Información del reporte
/F1 10 Tf
50 670 Td
(Fecha de generación: ${new Date().toLocaleDateString()}) Tj
0 -15 Td
(Generado por: Usuario Administrador) Tj
0 -15 Td
(Periodo: ${new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleDateString()} - ${new Date().toLocaleDateString()}) Tj

% Separador
0.5 w
50 630 m
550 630 l
S

% Filtros aplicados
/F1 10 Tf
50 610 Td
(Filtros aplicados: ${filterMunicipality === 'all' ? 'Todos los municipios' : 'Municipio específico'}, ${filterParkType === 'all' ? 'Todos los tipos de parque' : 'Tipo específico'}) Tj

% Tablas de datos
${tableData}

% Gráficos (descripciones textuales)
${chartDescription}

% Resumen
${summaryData}

% Pie de página
/F1 8 Tf
50 100 Td
(Nota: Este reporte es un documento oficial del sistema ParquesMX.) Tj
0 -15 Td
(Para más información, contacte al administrador del sistema.) Tj
0 -30 Td
(© ${new Date().getFullYear()} ParquesMX - Todos los derechos reservados) Tj

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
2872
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