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
import { Calendar, Users, Plus, FileText, TrendingUp, MapPin, Clock, Sun, Cloud, CloudRain, BarChart3, Download, Filter, PieChart, Activity, Grid, List, Upload, ChevronLeft, ChevronRight, FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
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

  // Mapeo de traducción para el clima
  const weatherLabels = {
    sunny: 'Soleado',
    cloudy: 'Nublado', 
    rainy: 'Lluvioso',
    other: 'Otro'
  };
  
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
    countingMethod: 'counting',
    dayType: 'normal',
    weather: 'sunny',
    notes: ''
  });

  // Query para obtener parques
  const { data: parks } = useQuery<Park[]>({
    queryKey: ['/api/parks'],
    retry: 1,
    suspense: false
  });

  // Query principal para conteo de visitantes
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

  // Funciones helper para traducciones
  const getMethodLabel = (method: string) => {
    const labels = {
      'estimation': 'Estimación',
      'manual_counter': 'Contador manual', 
      'event_based': 'Basado en eventos',
      'entrance_control': 'Control de acceso',
      'counting': 'Conteo directo',
      'survey': 'Encuesta'
    };
    return labels[method as keyof typeof labels] || method;
  };

  const getDayTypeLabel = (dayType: string) => {
    const labels = {
      'weekday': 'Día laborable',
      'weekend': 'Fin de semana', 
      'holiday': 'Día festivo'
    };
    return labels[dayType as keyof typeof labels] || dayType;
  };

  const getWeatherLabel = (weather: string) => {
    const labels = {
      'sunny': 'Soleado',
      'cloudy': 'Nublado',
      'rainy': 'Lluvioso', 
      'other': 'Otro'
    };
    return labels[weather as keyof typeof labels] || weather;
  };

  const getWeatherIcon = (weather: string) => {
    const icons = {
      'sunny': <Sun className="h-3 w-3" />,
      'cloudy': <Cloud className="h-3 w-3" />,
      'rainy': <CloudRain className="h-3 w-3" />,
      'other': <Cloud className="h-3 w-3" />
    };
    return icons[weather as keyof typeof icons] || <Cloud className="h-3 w-3" />;
  };

  // Datos filtrados para visualización
  const filteredData = useMemo(() => {
    if (!visitorCounts?.data) return [];
    return visitorCounts.data;
  }, [visitorCounts?.data]);

  // Función para exportar a Excel
  const exportToExcel = () => {
    if (!filteredData.length) {
      toast({ title: "No hay datos para exportar", variant: "destructive" });
      return;
    }

    const today = new Date().toLocaleDateString('es-MX', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).replace(/\//g, '-');

    // Datos principales
    const mainData = filteredData.map(count => ({
      'Parque': count.parkName,
      'Fecha': format(new Date(count.date), 'dd/MM/yyyy'),
      'Adultos': count.adults,
      'Niños': count.children,
      'Adultos Mayores': count.seniors,
      'Mascotas': count.pets,
      'Grupos': count.groups,
      'Total Visitantes': count.totalVisitors,
      'Método Conteo': getMethodLabel(count.countingMethod),
      'Tipo Día': getDayTypeLabel(count.dayType || ''),
      'Clima': getWeatherLabel(count.weather || ''),
      'Notas': (count.notes || '').slice(0, 100) + (count.notes && count.notes.length > 100 ? '...' : ''),
      'Fecha Registro': format(new Date(count.createdAt), 'dd/MM/yyyy HH:mm')
    }));

    // Crear el workbook
    const wb = XLSX.utils.book_new();

    // Hoja 1: Datos principales con header corporativo
    const headerRows = [
      ['SISTEMA DE GESTIÓN DE PARQUES URBANOS'],
      ['Reporte de Conteo de Visitantes'],
      [`Generado el ${today}`],
      [''],
    ];

    const wsData = [...headerRows, Object.keys(mainData[0] || {}), ...mainData.map(row => Object.values(row))];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Auto-width columns
    const colWidths = Object.keys(mainData[0] || {}).map(key => ({ wch: Math.max(key.length, 15) }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Datos de Visitantes');

    // Descargar el archivo
    XLSX.writeFile(wb, `conteo_visitantes_${today}.xlsx`);
    toast({ title: "Archivo Excel exportado exitosamente" });
  };

  // Función para exportar a CSV
  const exportToCSV = () => {
    if (!filteredData.length) {
      toast({ title: "No hay datos para exportar", variant: "destructive" });
      return;
    }

    const today = new Date().toLocaleDateString('es-MX', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).replace(/\//g, '-');

    const csvData = filteredData.map(count => ({
      'Parque': count.parkName,
      'Fecha': format(new Date(count.date), 'dd/MM/yyyy'),
      'Adultos': count.adults,
      'Niños': count.children,
      'Adultos Mayores': count.seniors,
      'Mascotas': count.pets,
      'Grupos': count.groups,
      'Total Visitantes': count.totalVisitors,
      'Método Conteo': getMethodLabel(count.countingMethod),
      'Tipo Día': getDayTypeLabel(count.dayType || ''),
      'Clima': getWeatherLabel(count.weather || ''),
      'Notas': (count.notes || '').slice(0, 100) + (count.notes && count.notes.length > 100 ? '...' : ''),
      'Fecha Registro': format(new Date(count.createdAt), 'dd/MM/yyyy HH:mm')
    }));

    const csv = Papa.unparse(csvData, {
      header: true,
      delimiter: ',',
      encoding: 'utf-8'
    });

    // Agregar BOM para UTF-8 y header profesional
    const professionalHeader = `SISTEMA DE GESTIÓN DE PARQUES URBANOS
Reporte de Conteo de Visitantes
Generado el ${today}

`;

    const finalCsv = '\uFEFF' + professionalHeader + csv;
    
    const blob = new Blob([finalCsv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `conteo_visitantes_profesional_${today}.csv`;
    link.click();
    
    toast({ title: "Archivo CSV exportado exitosamente" });
  };

  // Mutation para crear nuevo registro
  const createVisitorCount = useMutation({
    mutationFn: (data: VisitorCountForm) => apiRequest('/api/visitor-counts', { method: 'POST', data }),
    onSuccess: () => {
      toast({ title: "Registro creado exitosamente" });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['/api/visitor-counts'] });
      // Reset form
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
        countingMethod: 'counting',
        dayType: 'normal',
        weather: 'sunny',
        notes: ''
      });
    },
    onError: (error) => {
      toast({ 
        title: "Error al crear registro", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.parkId === 0) {
      toast({
        title: "Error",
        description: "Por favor selecciona un parque",
        variant: "destructive",
      });
      return;
    }
    
    createVisitorCount.mutate(formData);
  };

  const getTotalVisitors = () => {
    return formData.adults + formData.children + formData.seniors;
  };

  // Calcular paginación
  const totalPages = Math.ceil((visitorCounts?.pagination?.total || 0) / recordsPerPage);

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

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="park-filter">Parque</Label>
                <Select value={selectedPark} onValueChange={setSelectedPark}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los parques" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los parques</SelectItem>
                    {parks?.map(park => (
                      <SelectItem key={park.id} value={park.id.toString()}>
                        {park.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por parque o notas..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button onClick={exportToExcel} variant="outline" size="sm">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  variant="outline"
                  size="sm"
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contenido principal */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Vista de tarjetas */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredData.map((count) => (
                  <Card key={count.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{count.parkName}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {format(new Date(count.date), 'dd/MM/yyyy')}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Visitantes:</span>
                          <Badge variant="secondary">{count.totalVisitors}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Adultos:</span>
                          <span>{count.adults}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Niños:</span>
                          <span>{count.children}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Método:</span>
                          <Badge variant="outline">{getMethodLabel(count.countingMethod)}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Clima:</span>
                          <div className="flex items-center gap-1">
                            {getWeatherIcon(count.weather || 'sunny')}
                            <span className="text-sm">{getWeatherLabel(count.weather || 'sunny')}</span>
                          </div>
                        </div>
                        {count.notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            {count.notes.slice(0, 100)}...
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className={currentPage === page ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Modal para nuevo registro */}
        {showForm && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nuevo Registro de Visitantes</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="parkId">Parque</Label>
                    <Select value={formData.parkId.toString()} onValueChange={(value) => setFormData({...formData, parkId: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar parque" />
                      </SelectTrigger>
                      <SelectContent>
                        {parks?.map(park => (
                          <SelectItem key={park.id} value={park.id.toString()}>
                            {park.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date">Fecha</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="adults">Adultos</Label>
                    <Input
                      id="adults"
                      type="number"
                      min="0"
                      value={formData.adults}
                      onChange={(e) => setFormData({...formData, adults: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="children">Niños</Label>
                    <Input
                      id="children"
                      type="number"
                      min="0"
                      value={formData.children}
                      onChange={(e) => setFormData({...formData, children: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="seniors">Adultos Mayores</Label>
                    <Input
                      id="seniors"
                      type="number"
                      min="0"
                      value={formData.seniors}
                      onChange={(e) => setFormData({...formData, seniors: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pets">Mascotas</Label>
                    <Input
                      id="pets"
                      type="number"
                      min="0"
                      value={formData.pets}
                      onChange={(e) => setFormData({...formData, pets: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="groups">Grupos</Label>
                    <Input
                      id="groups"
                      type="number"
                      min="0"
                      value={formData.groups}
                      onChange={(e) => setFormData({...formData, groups: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="countingMethod">Método de Conteo</Label>
                    <Select value={formData.countingMethod} onValueChange={(value) => setFormData({...formData, countingMethod: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="counting">Conteo Directo</SelectItem>
                        <SelectItem value="estimation">Estimación</SelectItem>
                        <SelectItem value="survey">Encuesta</SelectItem>
                        <SelectItem value="entrance_control">Control de Acceso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dayType">Tipo de Día</Label>
                    <Select value={formData.dayType} onValueChange={(value) => setFormData({...formData, dayType: value})}>
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
                  <div>
                    <Label htmlFor="weather">Clima</Label>
                    <Select value={formData.weather} onValueChange={(value) => setFormData({...formData, weather: value})}>
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
                </div>

                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Observaciones adicionales..."
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium">Total de Visitantes: {getTotalVisitors()}</p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    Guardar Registro
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
}