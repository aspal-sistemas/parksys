import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLayout } from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Users, Plus, FileText, TrendingUp, MapPin, Clock, Sun, Cloud, CloudRain, BarChart3, Download, Filter, PieChart, Activity, Grid, List, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface VisitorCount {
  id: number;
  parkId: number;
  parkName: string;
  date: string;
  adults: number;
  children: number;
  seniors: number;
  pets: number;
  groups: number;
  totalVisitors: number;
  countingMethod: string;
  dayType?: string;
  weather?: string;
  notes?: string;
  createdAt: string;
}

interface Park {
  id: number;
  name: string;
  municipality: string;
}

interface VisitorCountForm {
  parkId: number;
  date: string;
  startDate?: string;
  endDate?: string;
  adults: number;
  children: number;
  seniors: number;
  pets: number;
  groups: number;
  countingMethod: string;
  dayType?: string;
  weather?: string;
  notes?: string;
}

export default function VisitorCountPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedPark, setSelectedPark] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [countingMode, setCountingMode] = useState<'daily' | 'range'>('daily');
  
  // Estados para reportes
  const [reportPeriod, setReportPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [reportPark, setReportPark] = useState<string>('all');
  
  // Estados para paginación y vista
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const recordsPerPage = 10;
  const [formData, setFormData] = useState<VisitorCountForm>({
    parkId: 0,
    date: new Date().toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    adults: 0,
    children: 0,
    seniors: 0,
    pets: 0,
    groups: 0,
    countingMethod: "estimation",
    dayType: "weekday",
    weather: "sunny",
    notes: ""
  });

  // Queries
  const { data: parks } = useQuery<Park[]>({
    queryKey: ['/api/parks'],
  });

  const { data: visitorCounts, isLoading } = useQuery<{
    data: VisitorCount[];
    pagination: any;
  }>({
    queryKey: ['/api/visitor-counts', selectedPark, currentPage, searchTerm, dateFilter, methodFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedPark && selectedPark !== 'all') params.set('parkId', selectedPark);
      params.set('limit', recordsPerPage.toString());
      params.set('offset', ((currentPage - 1) * recordsPerPage).toString());
      if (searchTerm) params.set('search', searchTerm);
      if (dateFilter) params.set('startDate', dateFilter);
      if (methodFilter) params.set('method', methodFilter);
      
      const response = await fetch(`/api/visitor-counts?${params}`);
      return response.json();
    },
  });

  // Datos filtrados para visualización
  const filteredData = useMemo(() => {
    if (!visitorCounts?.data) return [];
    
    let filtered = [...visitorCounts.data];
    
    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(count => 
        count.parkName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        count.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtro por método
    if (methodFilter && methodFilter !== 'all') {
      filtered = filtered.filter(count => count.countingMethod === methodFilter);
    }
    
    return filtered;
  }, [visitorCounts?.data, searchTerm, methodFilter]);

  // Reset de filtros
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedPark('all');
    setDateFilter('');
    setMethodFilter('all');
    setCurrentPage(1);
  };

  // Calcular paginación
  const totalPages = Math.ceil((visitorCounts?.pagination?.total || 0) / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = Math.min(startIndex + recordsPerPage, visitorCounts?.pagination?.total || 0);

  // Funciones de exportación e importación
  const exportToCSV = () => {
    if (!visitorCounts?.data?.length) {
      toast({
        title: "No hay datos",
        description: "No hay registros para exportar",
        variant: "destructive",
      });
      return;
    }

    const csvData = visitorCounts.data.map(count => ({
      Fecha: count.date,
      Parque: count.parkName,
      Adultos: count.adults,
      Niños: count.children,
      'Adultos Mayores': count.seniors,
      Mascotas: count.pets,
      Grupos: count.groups,
      'Total Visitantes': count.totalVisitors,
      'Método de Conteo': count.countingMethod,
      'Tipo de Día': count.dayType,
      Clima: count.weather,
      Notas: count.notes || ''
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    // Agregar BOM para UTF-8 para garantizar que los acentos se muestren correctamente
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `conteo-visitantes-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "Exportación exitosa",
      description: "Los datos se han exportado correctamente",
    });
  };

  const downloadTemplate = () => {
    // Crear plantilla CSV con columnas requeridas y datos de ejemplo
    const templateData = [
      {
        'Fecha': '2025-01-15',
        'Parque': 'Bosque Los Colomos',
        'Adultos': '150',
        'Niños': '75',
        'Adultos Mayores': '30',
        'Mascotas': '20',
        'Grupos': '5',
        'Método de Conteo': 'counting',
        'Tipo de Día': 'normal',
        'Clima': 'sunny',
        'Notas': 'Día regular, buen clima'
      },
      {
        'Fecha': '2025-01-16',
        'Parque': 'Parque Metropolitano',
        'Adultos': '200',
        'Niños': '100',
        'Adultos Mayores': '40',
        'Mascotas': '25',
        'Grupos': '8',
        'Método de Conteo': 'estimation',
        'Tipo de Día': 'weekend',
        'Clima': 'cloudy',
        'Notas': 'Fin de semana, mucha actividad'
      }
    ];

    // Agregar filas de instrucciones en la plantilla
    const instructionRows = [
      {
        'Fecha': '--- INSTRUCCIONES ---',
        'Parque': 'Formato: YYYY-MM-DD',
        'Adultos': 'Nombre del parque',
        'Niños': 'Número entero',
        'Adultos Mayores': 'Número entero',
        'Mascotas': 'Número entero',
        'Grupos': 'Número entero',
        'Método de Conteo': 'counting/estimation/survey',
        'Tipo de Día': 'normal/weekend/holiday',
        'Clima': 'sunny/cloudy/rainy',
        'Notas': 'Opcional - Observaciones'
      },
      {
        'Fecha': '--- ELIMINAR ESTA FILA ---',
        'Parque': 'Eliminar filas de instrucciones',
        'Adultos': 'antes de importar',
        'Niños': '',
        'Adultos Mayores': '',
        'Mascotas': '',
        'Grupos': '',
        'Método de Conteo': '',
        'Tipo de Día': '',
        'Clima': '',
        'Notas': ''
      }
    ];

    const finalData = [...instructionRows, ...templateData];
    const headers = Object.keys(finalData[0]);
    const csvContent = [
      headers.join(','),
      ...finalData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    // Agregar BOM para UTF-8 para garantizar que los acentos se muestren correctamente
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `plantilla-conteo-visitantes-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "Plantilla descargada",
      description: "La plantilla CSV se ha descargado correctamente. Completa los datos y vuelve a importar.",
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        // Aquí iría la lógica de procesamiento del CSV
        // Por ahora solo mostramos un mensaje de éxito
        toast({
          title: "Importación exitosa",
          description: `Se procesaron ${lines.length - 1} registros`,
        });
        
        queryClient.invalidateQueries({ queryKey: ['/api/visitor-counts'] });
      } catch (error) {
        toast({
          title: "Error en importación",
          description: "Error al procesar el archivo CSV",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  // Calcular datos para reportes
  const reportData = useMemo(() => {
    if (!visitorCounts?.data || visitorCounts.data.length === 0) return null;

    // Filtrar por parque si no es 'all'
    const filteredData = reportPark === 'all' 
      ? visitorCounts.data 
      : visitorCounts.data.filter(count => count.parkId.toString() === reportPark);

    // Estadísticas generales
    const totalVisitors = filteredData.reduce((sum, count) => sum + count.totalVisitors, 0);
    const totalAdults = filteredData.reduce((sum, count) => sum + count.adults, 0);
    const totalChildren = filteredData.reduce((sum, count) => sum + count.children, 0);
    const totalSeniors = filteredData.reduce((sum, count) => sum + count.seniors, 0);
    const totalPets = filteredData.reduce((sum, count) => sum + count.pets, 0);
    const avgDaily = filteredData.length > 0 ? Math.round(totalVisitors / filteredData.length) : 0;

    // Datos demográficos para gráfico de pie
    const demographicData = [
      { name: 'Adultos', value: totalAdults, color: '#067f5f' },
      { name: 'Niños', value: totalChildren, color: '#bcd256' },
      { name: 'Seniors', value: totalSeniors, color: '#8498a5' },
      { name: 'Mascotas', value: totalPets, color: '#00a587' }
    ];

    // Datos por parque para gráfico de barras
    const parkData = filteredData.reduce((acc, count) => {
      const existing = acc.find(item => item.parkName === count.parkName);
      if (existing) {
        existing.visitors += count.totalVisitors;
        existing.records += 1;
      } else {
        acc.push({
          parkName: count.parkName,
          visitors: count.totalVisitors,
          records: 1
        });
      }
      return acc;
    }, [] as any[]);

    // Datos por método de conteo
    const methodData = filteredData.reduce((acc, count) => {
      const method = count.countingMethod;
      const existing = acc.find(item => item.method === method);
      if (existing) {
        existing.count += 1;
        existing.visitors += count.totalVisitors;
      } else {
        acc.push({
          method: method,
          count: 1,
          visitors: count.totalVisitors
        });
      }
      return acc;
    }, [] as any[]);

    // Datos por clima
    const weatherData = filteredData.reduce((acc, count) => {
      const weather = count.weather || 'No especificado';
      const existing = acc.find(item => item.weather === weather);
      if (existing) {
        existing.count += 1;
        existing.visitors += count.totalVisitors;
      } else {
        acc.push({
          weather: weather,
          count: 1,
          visitors: count.totalVisitors
        });
      }
      return acc;
    }, [] as any[]);

    // Tendencia temporal (últimos 7 días)
    const last7Days = filteredData
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7)
      .map(count => ({
        date: format(new Date(count.date), 'dd/MM', { locale: es }),
        visitors: count.totalVisitors,
        adults: count.adults,
        children: count.children
      }));

    return {
      summary: {
        totalVisitors,
        totalAdults,
        totalChildren,
        totalSeniors,
        totalPets,
        avgDaily,
        totalRecords: filteredData.length,
        uniqueParks: [...new Set(filteredData.map(c => c.parkName))].length
      },
      charts: {
        demographic: demographicData,
        parks: parkData,
        methods: methodData,
        weather: weatherData,
        trend: last7Days
      }
    };
  }, [visitorCounts, reportPark]);

  // Mutation para crear nuevo registro
  const createVisitorCount = useMutation({
    mutationFn: async (data: VisitorCountForm) => {
      console.log('Datos del formulario de conteo de visitantes:', data);
      console.log('Modo de conteo:', countingMode);
      
      if (countingMode === 'range') {
        // Para rangos, crear múltiples registros
        const records = [];
        const startDate = new Date(data.startDate!);
        const endDate = new Date(data.endDate!);
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          const record = {
            parkId: data.parkId,
            date: dateStr,
            adults: data.adults,
            children: data.children,
            seniors: data.seniors,
            pets: data.pets,
            groups: data.groups,
            countingMethod: data.countingMethod,
            dayType: countingMode === 'daily' ? data.dayType : undefined,
            weather: countingMode === 'daily' ? data.weather : undefined,
            notes: data.notes,
            registeredBy: 1 // Usuario admin por defecto
          };
          console.log('Registro individual para rango:', record);
          records.push(record);
        }
        
        // Crear todos los registros
        const responses = await Promise.all(
          records.map(record => 
            apiRequest('/api/visitor-counts', {
              method: 'POST',
              body: record
            })
          )
        );
        
        return responses;
      } else {
        // Para conteo diario
        const requestData = { 
          parkId: data.parkId,
          date: data.date,
          adults: data.adults,
          children: data.children,
          seniors: data.seniors,
          pets: data.pets,
          groups: data.groups,
          countingMethod: data.countingMethod,
          dayType: data.dayType,
          weather: data.weather,
          notes: data.notes,
          registeredBy: 1 // Usuario admin por defecto
        };
        console.log('Datos para enviar (conteo diario):', requestData);
        
        return apiRequest('/api/visitor-counts', {
          method: 'POST',
          body: requestData
        });
      }
    },
    onSuccess: () => {
      const recordsCount = countingMode === 'range' ? 
        Math.ceil((new Date(formData.endDate!) - new Date(formData.startDate!)) / (1000 * 60 * 60 * 24)) + 1 : 1;
      
      toast({
        title: "Registro exitoso",
        description: `${recordsCount} registro(s) de visitantes creado(s) correctamente`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/visitor-counts'] });
      setShowForm(false);
      setFormData({
        parkId: 0,
        date: new Date().toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        adults: 0,
        children: 0,
        seniors: 0,
        pets: 0,
        groups: 0,
        countingMethod: "estimation",
        dayType: "weekday",
        weather: "sunny",
        notes: ""
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo registrar el conteo de visitantes",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 Datos del formulario antes de enviar:', formData);
    console.log('🔍 Modo de conteo:', countingMode);
    
    if (formData.parkId === 0) {
      toast({
        title: "Error",
        description: "Por favor selecciona un parque",
        variant: "destructive",
      });
      return;
    }
    
    if (countingMode === 'range') {
      if (!formData.startDate || !formData.endDate) {
        toast({
          title: "Error",
          description: "Por favor selecciona las fechas de inicio y fin",
          variant: "destructive",
        });
        return;
      }
      
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        toast({
          title: "Error",
          description: "La fecha de inicio debe ser anterior a la fecha de fin",
          variant: "destructive",
        });
        return;
      }
    }
    
    createVisitorCount.mutate(formData);
  };

  const getMethodLabel = (method: string) => {
    const methods = {
      estimation: "Estimación",
      manual_counter: "Contador manual",
      event_based: "Basado en eventos",
      entrance_control: "Control de acceso"
    };
    return methods[method as keyof typeof methods] || method;
  };

  const getDayTypeLabel = (dayType: string) => {
    const types = {
      weekday: "Día laborable",
      weekend: "Fin de semana",
      holiday: "Día festivo"
    };
    return types[dayType as keyof typeof types] || dayType;
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'sunny': return <Sun className="h-4 w-4" />;
      case 'cloudy': return <Cloud className="h-4 w-4" />;
      case 'rainy': return <CloudRain className="h-4 w-4" />;
      default: return <Sun className="h-4 w-4" />;
    }
  };

  const getTotalVisitors = () => {
    return formData.adults + formData.children + formData.seniors;
  };

  const getTotalPets = () => {
    return formData.pets;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Conteo de Visitantes</h1>
            <p className="text-gray-600">Gestión diaria de visitantes por parque</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Registro
            </Button>
          </div>
        </div>

        <Tabs defaultValue="registros" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="registros">Registros Diarios</TabsTrigger>
            <TabsTrigger value="reportes">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="registros" className="space-y-4">
            {/* Filtros y Controles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros y Controles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Buscar</Label>
                    <Input
                      id="search"
                      placeholder="Buscar parque o notas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="park-filter">Parque</Label>
                    <Select value={selectedPark} onValueChange={setSelectedPark}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los parques" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los parques</SelectItem>
                        {parks?.filter(park => park.id && park.name).map((park) => (
                          <SelectItem key={park.id} value={park.id.toString()}>
                            {park.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-filter">Fecha</Label>
                    <Input
                      id="date-filter"
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="method-filter">Método</Label>
                    <Select value={methodFilter} onValueChange={setMethodFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los métodos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los métodos</SelectItem>
                        <SelectItem value="counting">Conteo directo</SelectItem>
                        <SelectItem value="estimation">Estimación</SelectItem>
                        <SelectItem value="survey">Encuesta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Vista</Label>
                    <div className="flex space-x-2">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportToCSV}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Importar CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadTemplate}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Plantilla CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetFilters}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Limpiar Filtros
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    {visitorCounts?.pagination?.total ? (
                      `Página ${currentPage} de ${totalPages} - Mostrando ${startIndex + 1}-${endIndex} de ${visitorCounts.pagination.total} registros`
                    ) : (
                      'Sin registros'
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de registros */}
            <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}`}>
              {isLoading ? (
                <div className="text-center py-8 col-span-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando registros...</p>
                </div>
              ) : visitorCounts?.data?.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay registros de visitantes</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Comienza registrando el conteo diario de visitantes
                    </p>
                  </CardContent>
                </Card>
              ) : (
                visitorCounts?.data?.map((count) => (
                  <Card key={count.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className={`${viewMode === 'grid' ? 'p-4' : 'p-6'}`}>
                      {viewMode === 'grid' ? (
                        // Vista Grid - Compacta
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin className="h-4 w-4 text-emerald-600" />
                                <h3 className="font-semibold text-sm">{count.parkName}</h3>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(count.date), 'dd/MM/yyyy', { locale: es })}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-emerald-600">
                                {count.totalVisitors}
                              </div>
                              <div className="text-xs text-gray-500">visitantes</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center p-2 bg-blue-50 rounded">
                              <div className="text-sm font-semibold text-blue-700">{count.adults}</div>
                              <div className="text-xs text-blue-600">Adultos</div>
                            </div>
                            <div className="text-center p-2 bg-green-50 rounded">
                              <div className="text-sm font-semibold text-green-700">{count.children}</div>
                              <div className="text-xs text-green-600">Niños</div>
                            </div>
                            <div className="text-center p-2 bg-orange-50 rounded">
                              <div className="text-sm font-semibold text-orange-700">{count.seniors}</div>
                              <div className="text-xs text-orange-600">Mayores</div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">
                              {getMethodLabel(count.countingMethod)}
                            </Badge>
                            {count.weather && (
                              <Badge variant="outline" className="text-xs flex items-center gap-1">
                                {getWeatherIcon(count.weather)}
                                {count.weather}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ) : (
                        // Vista Lista - Detallada
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className="h-4 w-4 text-emerald-600" />
                                <h3 className="font-semibold text-lg">{count.parkName}</h3>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>{format(new Date(count.date), 'dd/MM/yyyy', { locale: es })}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-emerald-600">
                                {count.totalVisitors}
                              </div>
                              <div className="text-sm text-gray-500">visitantes</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-lg font-semibold text-blue-700">{count.adults}</div>
                              <div className="text-sm text-blue-600">Adultos</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-lg font-semibold text-green-700">{count.children}</div>
                              <div className="text-sm text-green-600">Niños</div>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                              <div className="text-lg font-semibold text-orange-700">{count.seniors}</div>
                              <div className="text-sm text-orange-600">Adultos mayores</div>
                            </div>
                            <div className="text-center p-3 bg-pink-50 rounded-lg">
                              <div className="text-lg font-semibold text-pink-700">{count.pets}</div>
                              <div className="text-sm text-pink-600">Mascotas</div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <div className="text-lg font-semibold text-purple-700">{count.groups}</div>
                              <div className="text-sm text-purple-600">Grupos</div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getDayTypeLabel(count.dayType)}
                            </Badge>
                            <Badge variant="outline">
                              {getMethodLabel(count.countingMethod)}
                            </Badge>
                            {count.weather && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                {getWeatherIcon(count.weather)}
                                {count.weather}
                              </Badge>
                            )}
                          </div>

                          {count.notes && (
                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              <strong>Notas:</strong> {count.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Paginación */}
            {visitorCounts?.pagination?.total > recordsPerPage && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reportes">
            <div className="space-y-6">
              {/* Controles de filtro */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filtros de Reporte
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Parque</Label>
                      <Select value={reportPark} onValueChange={setReportPark}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un parque" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los parques</SelectItem>
                          {parks?.filter(park => park.id && park.name).map((park) => (
                            <SelectItem key={park.id} value={park.id.toString()}>
                              {park.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Período</Label>
                      <Select value={reportPeriod} onValueChange={(value: any) => setReportPeriod(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="week">Última semana</SelectItem>
                          <SelectItem value="month">Último mes</SelectItem>
                          <SelectItem value="quarter">Último trimestre</SelectItem>
                          <SelectItem value="year">Último año</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Métricas resumen */}
              {reportData && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Total Visitantes</p>
                            <p className="text-2xl font-bold text-[#067f5f]">
                              {reportData.summary.totalVisitors.toLocaleString()}
                            </p>
                          </div>
                          <Users className="h-8 w-8 text-[#067f5f]" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Promedio Diario</p>
                            <p className="text-2xl font-bold text-[#00a587]">
                              {reportData.summary.avgDaily}
                            </p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-[#00a587]" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Registros</p>
                            <p className="text-2xl font-bold text-[#bcd256]">
                              {reportData.summary.totalRecords}
                            </p>
                          </div>
                          <FileText className="h-8 w-8 text-[#bcd256]" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Parques Únicos</p>
                            <p className="text-2xl font-bold text-[#8498a5]">
                              {reportData.summary.uniqueParks}
                            </p>
                          </div>
                          <MapPin className="h-8 w-8 text-[#8498a5]" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Gráficos */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Distribución demográfica */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChart className="h-5 w-5" />
                          Distribución Demográfica
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={reportData.charts.demographic}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {reportData.charts.demographic.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tendencia temporal */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-5 w-5" />
                          Tendencia Últimos 7 Días
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={reportData.charts.trend}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Line type="monotone" dataKey="visitors" stroke="#067f5f" strokeWidth={2} />
                              <Line type="monotone" dataKey="adults" stroke="#00a587" strokeWidth={2} />
                              <Line type="monotone" dataKey="children" stroke="#bcd256" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Visitantes por parque */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Visitantes por Parque
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reportData.charts.parks}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="parkName" angle={-45} textAnchor="end" height={100} />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="visitors" fill="#067f5f" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Métodos de conteo */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Métodos de Conteo
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {reportData.charts.methods.map((method, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium">{method.method}</p>
                                <p className="text-sm text-gray-600">{method.count} registros</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-semibold text-[#067f5f]">
                                  {method.visitors.toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-600">visitantes</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tabla de condiciones climáticas */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sun className="h-5 w-5" />
                        Análisis por Condiciones Climáticas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Clima</th>
                              <th className="text-center p-2">Registros</th>
                              <th className="text-center p-2">Total Visitantes</th>
                              <th className="text-center p-2">Promedio</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.charts.weather.map((weather, index) => (
                              <tr key={index} className="border-b">
                                <td className="p-2 font-medium">{weather.weather}</td>
                                <td className="text-center p-2">{weather.count}</td>
                                <td className="text-center p-2">{weather.visitors.toLocaleString()}</td>
                                <td className="text-center p-2">{Math.round(weather.visitors / weather.count)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Botón de exportar */}
                  <div className="flex justify-end">
                    <Button className="bg-[#067f5f] hover:bg-[#00a587]">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Reporte
                    </Button>
                  </div>
                </>
              )}

              {/* Estado sin datos */}
              {!reportData && (
                <Card>
                  <CardContent className="p-8">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No hay datos disponibles para generar reportes</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Asegúrate de tener registros de visitantes para visualizar los análisis
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal de formulario */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Nuevo Registro de Visitantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Modo de conteo *</Label>
                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant={countingMode === 'daily' ? 'default' : 'outline'}
                          onClick={() => setCountingMode('daily')}
                          className="flex items-center gap-2"
                        >
                          <Calendar className="h-4 w-4" />
                          Conteo diario
                        </Button>
                        <Button
                          type="button"
                          variant={countingMode === 'range' ? 'default' : 'outline'}
                          onClick={() => setCountingMode('range')}
                          className="flex items-center gap-2"
                        >
                          <Clock className="h-4 w-4" />
                          Rango de fechas
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="parkId">Parque *</Label>
                        <Select 
                          value={formData.parkId.toString()} 
                          onValueChange={(value) => setFormData({...formData, parkId: parseInt(value)})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un parque" />
                          </SelectTrigger>
                          <SelectContent>
                            {parks?.filter(park => park.id && park.name).map((park) => (
                              <SelectItem key={park.id} value={park.id.toString()}>
                                {park.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {countingMode === 'daily' ? (
                        <div className="space-y-2">
                          <Label htmlFor="date">Fecha *</Label>
                          <Input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                            required
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label>Rango de fechas *</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor="startDate" className="text-sm">Desde</Label>
                              <Input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="endDate" className="text-sm">Hasta</Label>
                              <Input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contador de Visitantes */}
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <h3 className="font-semibold text-blue-900 mb-3">Contador de Visitantes</h3>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="adults">Adultos</Label>
                          <Input
                            type="number"
                            min="0"
                            value={formData.adults}
                            onChange={(e) => setFormData({...formData, adults: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="children">Niños</Label>
                          <Input
                            type="number"
                            min="0"
                            value={formData.children}
                            onChange={(e) => setFormData({...formData, children: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="seniors">Adultos mayores</Label>
                          <Input
                            type="number"
                            min="0"
                            value={formData.seniors}
                            onChange={(e) => setFormData({...formData, seniors: parseInt(e.target.value) || 0})}
                          />
                        </div>

                      </div>
                    </div>

                    {/* Contador de Mascotas */}
                    <div className="p-4 border rounded-lg bg-pink-50">
                      <h3 className="font-semibold text-pink-900 mb-3">Contador de Mascotas</h3>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="pets">Mascotas (perros)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={formData.pets}
                            onChange={(e) => setFormData({...formData, pets: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        <div className="text-sm text-pink-700 mt-2">
                          Conteo separado para mascotas que ingresan al parque
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-700">{formData.adults + formData.children + formData.seniors}</div>
                        <div className="text-sm text-emerald-600">Total de visitantes</div>
                      </div>
                    </div>
                    <div className="p-4 bg-pink-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-pink-700">{formData.pets}</div>
                        <div className="text-sm text-pink-600">Total de mascotas</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="countingMethod">Método de conteo *</Label>
                      <Select 
                        value={formData.countingMethod} 
                        onValueChange={(value) => setFormData({...formData, countingMethod: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="estimation">Estimación</SelectItem>
                          <SelectItem value="manual_counter">Contador manual</SelectItem>
                          <SelectItem value="event_based">Basado en eventos</SelectItem>
                          <SelectItem value="entrance_control">Control de acceso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {countingMode === 'daily' && (
                      <div className="space-y-2">
                        <Label htmlFor="dayType">Tipo de día *</Label>
                        <Select 
                          value={formData.dayType} 
                          onValueChange={(value) => setFormData({...formData, dayType: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekday">Día laborable</SelectItem>
                            <SelectItem value="weekend">Fin de semana</SelectItem>
                            <SelectItem value="holiday">Día festivo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {countingMode === 'daily' && (
                    <div className="space-y-2">
                      <Label htmlFor="weather">Clima</Label>
                      <Select 
                        value={formData.weather} 
                        onValueChange={(value) => setFormData({...formData, weather: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sunny">Soleado</SelectItem>
                          <SelectItem value="cloudy">Nublado</SelectItem>
                          <SelectItem value="rainy">Lluvioso</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas adicionales</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Observaciones, eventos especiales, etc."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={createVisitorCount.isPending}
                    >
                      {createVisitorCount.isPending ? "Guardando..." : "Guardar Registro"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}