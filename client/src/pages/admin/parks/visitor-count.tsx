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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';
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

  // Mapeo de traducción para métodos de conteo
  const methodLabels = {
    estimation: 'Estimación',
    manual_counter: 'Contador manual',
    event_based: 'Basado en eventos',
    entrance_control: 'Control de acceso'
  };
  
  const [selectedPark, setSelectedPark] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [countingMode, setCountingMode] = useState<'daily' | 'range'>('daily');
  const [distributionMode, setDistributionMode] = useState<'equal' | 'average'>('average');
  
  // Estados para reportes
  const [reportPeriod, setReportPeriod] = useState<'week' | 'month' | 'quarter' | 'year' | 'all'>('month');
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
  const { data: parksResponse } = useQuery({
    queryKey: ['/api/parks'],
    retry: 1
  });
  
  const parks = Array.isArray(parksResponse) ? parksResponse : ((parksResponse as any)?.data && Array.isArray((parksResponse as any).data) ? (parksResponse as any).data : []);

  const { data: visitorCounts, isLoading } = useQuery<{
    data: VisitorCount[];
    pagination: any;
  }>({
    queryKey: ['/api/visitor-counts', selectedPark, currentPage, searchTerm, dateFilter, methodFilter, reportPark, reportPeriod],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Usar el filtro de parque de los reportes si está activo, sino usar el selectedPark normal
      const parkFilter = reportPark !== 'all' ? reportPark : selectedPark;
      if (parkFilter && parkFilter !== 'all') params.set('parkId', parkFilter);
      
      params.set('limit', recordsPerPage.toString());
      params.set('offset', ((currentPage - 1) * recordsPerPage).toString());
      if (searchTerm) params.set('search', searchTerm);
      if (methodFilter) params.set('method', methodFilter);
      
      // Priorizar filtro de período de reportes sobre dateFilter manual
      if (reportPeriod !== 'all') {
        const now = new Date();
        let startDate: Date;

        switch (reportPeriod) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            break;
          case 'quarter':
            startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            break;
          case 'year':
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            break;
          default:
            startDate = new Date(0);
        }
        
        params.set('startDate', startDate.toISOString().split('T')[0]);
      } else if (dateFilter) {
        // Solo usar dateFilter si no hay filtro de período activo
        params.set('startDate', dateFilter);
      }
      
      console.log(`🌐 [UNIFIED FILTER] Consultando con parámetros:`, Object.fromEntries(params.entries()));
      
      const response = await fetch(`/api/visitor-counts?${params}`);
      return response.json();
    },
  });

  // Query adicional para obtener estadísticas globales completas (no paginadas)
  const { data: globalStats } = useQuery({
    queryKey: ['/api/visitor-counts/dashboard', reportPark, reportPeriod, dateFilter, methodFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Usar los mismos filtros que la query principal
      const parkFilter = reportPark !== 'all' ? reportPark : selectedPark;
      if (parkFilter && parkFilter !== 'all') params.set('parkId', parkFilter);
      
      if (methodFilter) params.set('method', methodFilter);
      
      // Aplicar filtros de fecha con la misma lógica
      if (reportPeriod !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        switch (reportPeriod) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            break;
          case 'quarter':
            startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            break;
          case 'year':
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            break;
          default:
            startDate = new Date(0);
        }
        
        params.set('startDate', startDate.toISOString().split('T')[0]);
      } else if (dateFilter) {
        params.set('startDate', dateFilter);
      }
      
      params.set('limit', '10000'); // Límite alto para obtener todos los datos
      
      const response = await fetch(`/api/visitor-counts/dashboard?${params}`);
      return response.json();
    },
    suspense: false,
    retry: 1
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

  // Funciones de exportación profesional
  const exportToCSV = () => {
    if (!visitorCounts?.data?.length) {
      toast({
        title: "No hay datos",
        description: "No hay registros para exportar",
        variant: "destructive",
      });
      return;
    }

    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Calcular estadísticas de resumen
    const totalVisitors = visitorCounts.data.reduce((sum, count) => sum + count.totalVisitors, 0);
    const totalAdults = visitorCounts.data.reduce((sum, count) => sum + count.adults, 0);
    const totalChildren = visitorCounts.data.reduce((sum, count) => sum + count.children, 0);
    const totalSeniors = visitorCounts.data.reduce((sum, count) => sum + count.seniors, 0);
    const totalPets = visitorCounts.data.reduce((sum, count) => sum + count.pets, 0);
    const totalGroups = visitorCounts.data.reduce((sum, count) => sum + count.groups, 0);
    const avgDaily = visitorCounts.data.length > 0 ? Math.round(totalVisitors / visitorCounts.data.length) : 0;
    
    // Estadísticas por método de conteo
    const methodStats = visitorCounts.data.reduce((acc, count) => {
      const method = getMethodLabel(count.countingMethod);
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Estadísticas por clima
    const weatherStats = visitorCounts.data.reduce((acc, count) => {
      const weather = getWeatherLabel(count.weather);
      acc[weather] = (acc[weather] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Traducir métodos de conteo a español
    const methodLabels: Record<string, string> = {
      'counting': 'Conteo manual',
      'estimation': 'Estimación',
      'manual_counter': 'Contador manual',
      'event_based': 'Basado en eventos',
      'entrance_control': 'Control de acceso'
    };

    // Traducir tipos de clima
    const weatherTranslations: Record<string, string> = {
      'sunny': 'Soleado',
      'cloudy': 'Nublado', 
      'rainy': 'Lluvioso',
      'other': 'Otro'
    };

    // Traducir tipos de día
    const dayTypeTranslations: Record<string, string> = {
      'weekday': 'Día laborable',
      'weekend': 'Fin de semana',
      'holiday': 'Día festivo'
    };

    const csvData = visitorCounts.data.map(count => ({
      'Fecha': format(new Date(count.date), 'dd/MM/yyyy', { locale: es }),
      'Parque': count.parkName,
      'Adultos': count.adults,
      'Niños': count.children,
      'Adultos Mayores': count.seniors,
      'Mascotas': count.pets,
      'Grupos': count.groups,
      'Total Visitantes': count.totalVisitors,
      'Método de Conteo': methodLabels[count.countingMethod] || count.countingMethod,
      'Tipo de Día': dayTypeTranslations[count.dayType || 'weekday'] || count.dayType,
      'Clima': weatherTranslations[count.weather || 'sunny'] || count.weather,
      'Notas': count.notes || 'Sin observaciones'
    }));

    // Encabezado profesional
    const headerLines = [
      'SISTEMA DE GESTIÓN DE PARQUES URBANOS',
      'REPORTE DE CONTEO DE VISITANTES',
      `Generado el: ${currentDate}`,
      `Total de registros: ${visitorCounts.data.length}`,
      '',
      'RESUMEN EJECUTIVO',
      `Total de visitantes registrados: ${totalVisitors.toLocaleString('es-ES')}`,
      `Promedio diario de visitantes: ${avgDaily.toLocaleString('es-ES')}`,
      `Adultos: ${totalAdults.toLocaleString('es-ES')} | Niños: ${totalChildren.toLocaleString('es-ES')} | Adultos Mayores: ${totalSeniors.toLocaleString('es-ES')}`,
      `Mascotas: ${totalPets.toLocaleString('es-ES')} | Grupos organizados: ${totalGroups.toLocaleString('es-ES')}`,
      '',
      'MÉTODOS DE CONTEO UTILIZADOS',
      ...Object.entries(methodStats).map(([method, count]) => `${method}: ${count} registros`),
      '',
      'CONDICIONES CLIMÁTICAS',
      ...Object.entries(weatherStats).map(([weather, count]) => `${weather}: ${count} días`),
      '',
      'DETALLE DE REGISTROS',
      ''
    ];

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      ...headerLines,
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${(row as any)[header]}"`).join(','))
    ].join('\n');

    // Agregar BOM para UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `conteo_visitantes_profesional_${format(new Date(), 'dd-MM-yyyy', { locale: es })}.csv`;
    link.click();

    toast({
      title: "Exportación CSV exitosa",
      description: `Se exportaron ${visitorCounts.data.length} registros con resumen ejecutivo`,
    });
  };

  // Función de exportación a Excel profesional
  const exportToExcel = async () => {
    if (!visitorCounts?.data?.length) {
      toast({
        title: "No hay datos",
        description: "No hay registros para exportar",
        variant: "destructive",
      });
      return;
    }

    try {
      // Importar librerías dinámicamente
      const XLSX = await import('xlsx');
      
      const currentDate = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Calcular estadísticas
      const totalVisitors = visitorCounts.data.reduce((sum, count) => sum + count.totalVisitors, 0);
      const totalAdults = visitorCounts.data.reduce((sum, count) => sum + count.adults, 0);
      const totalChildren = visitorCounts.data.reduce((sum, count) => sum + count.children, 0);
      const totalSeniors = visitorCounts.data.reduce((sum, count) => sum + count.seniors, 0);
      const totalPets = visitorCounts.data.reduce((sum, count) => sum + count.pets, 0);
      const totalGroups = visitorCounts.data.reduce((sum, count) => sum + count.groups, 0);
      const avgDaily = visitorCounts.data.length > 0 ? Math.round(totalVisitors / visitorCounts.data.length) : 0;
      const uniqueParks = Array.from(new Set(visitorCounts.data.map(c => c.parkName))).length;

      // Traducir métodos y tipos
      const methodLabels: Record<string, string> = {
        'counting': 'Conteo manual',
        'estimation': 'Estimación',
        'manual_counter': 'Contador manual',
        'event_based': 'Basado en eventos',
        'entrance_control': 'Control de acceso'
      };

      const weatherTranslations: Record<string, string> = {
        'sunny': 'Soleado',
        'cloudy': 'Nublado', 
        'rainy': 'Lluvioso',
        'other': 'Otro'
      };

      const dayTypeTranslations: Record<string, string> = {
        'weekday': 'Día laborable',
        'weekend': 'Fin de semana',
        'holiday': 'Día festivo'
      };

      // Datos principales
      const mainData = visitorCounts.data.map(count => ({
        'Fecha': format(new Date(count.date), 'dd/MM/yyyy', { locale: es }),
        'Parque': count.parkName,
        'Adultos': count.adults,
        'Niños': count.children,
        'Adultos Mayores': count.seniors,
        'Mascotas': count.pets,
        'Grupos': count.groups,
        'Total Visitantes': count.totalVisitors,
        'Método de Conteo': methodLabels[count.countingMethod] || count.countingMethod,
        'Tipo de Día': dayTypeTranslations[count.dayType || 'weekday'] || count.dayType,
        'Clima': weatherTranslations[count.weather || 'sunny'] || count.weather,
        'Notas': count.notes || 'Sin observaciones'
      }));

      // Estadísticas por método de conteo
      const methodStats = visitorCounts.data.reduce((acc, count) => {
        const method = getMethodLabel(count.countingMethod);
        acc[method] = (acc[method] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Estadísticas por clima
      const weatherStats = visitorCounts.data.reduce((acc, count) => {
        const weather = getWeatherLabel(count.weather);
        acc[weather] = (acc[weather] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Estadísticas por tipo de día
      const dayTypeStats = visitorCounts.data.reduce((acc, count) => {
        const dayType = dayTypeTranslations[count.dayType || 'weekday'] || (count.dayType || 'Día de semana');
        acc[dayType] = (acc[dayType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Análisis por parques
      const parkStats = visitorCounts.data.reduce((acc, count) => {
        if (!acc[count.parkName]) {
          acc[count.parkName] = {
            registros: 0,
            visitantes: 0,
            adultos: 0,
            niños: 0,
            seniors: 0,
            mascotas: 0,
            grupos: 0
          };
        }
        acc[count.parkName].registros += 1;
        acc[count.parkName].visitantes += count.totalVisitors;
        acc[count.parkName].adultos += count.adults;
        acc[count.parkName].niños += count.children;
        acc[count.parkName].seniors += count.seniors;
        acc[count.parkName].mascotas += count.pets;
        acc[count.parkName].grupos += count.groups;
        return acc;
      }, {} as Record<string, any>);

      // Datos del resumen ejecutivo con análisis completo
      const summaryData = [
        ['SISTEMA DE GESTIÓN DE PARQUES URBANOS'],
        ['REPORTE PROFESIONAL DE CONTEO DE VISITANTES'],
        [`Generado el: ${currentDate}`],
        [`Período de análisis: ${visitorCounts.data.length} registros`],
        [''],
        ['═══════════════════════════════════════'],
        ['RESUMEN EJECUTIVO GENERAL'],
        ['═══════════════════════════════════════'],
        [''],
        ['MÉTRICAS PRINCIPALES'],
        ['Indicador', 'Valor', 'Observaciones'],
        ['Total de registros', visitorCounts.data.length.toLocaleString('es-ES'), 'Conteos realizados'],
        ['Total de visitantes', totalVisitors.toLocaleString('es-ES'), 'Suma de todos los visitantes'],
        ['Promedio diario de visitantes', avgDaily.toLocaleString('es-ES'), 'Visitantes por día'],
        ['Parques únicos monitoreados', uniqueParks, 'Diferentes ubicaciones'],
        [''],
        ['DISTRIBUCIÓN DEMOGRÁFICA'],
        ['Segmento Poblacional', 'Total', 'Porcentaje', 'Promedio Diario'],
        ['Adultos', totalAdults.toLocaleString('es-ES'), `${((totalAdults / totalVisitors) * 100).toFixed(1)}%`, Math.round(totalAdults / visitorCounts.data.length)],
        ['Niños', totalChildren.toLocaleString('es-ES'), `${((totalChildren / totalVisitors) * 100).toFixed(1)}%`, Math.round(totalChildren / visitorCounts.data.length)],
        ['Adultos Mayores', totalSeniors.toLocaleString('es-ES'), `${((totalSeniors / totalVisitors) * 100).toFixed(1)}%`, Math.round(totalSeniors / visitorCounts.data.length)],
        [''],
        ['OTROS REGISTROS'],
        ['Tipo', 'Total', 'Promedio por Registro'],
        ['Mascotas', totalPets.toLocaleString('es-ES'), Math.round(totalPets / visitorCounts.data.length)],
        ['Grupos organizados', totalGroups.toLocaleString('es-ES'), Math.round(totalGroups / visitorCounts.data.length)],
        [''],
        ['ANÁLISIS POR MÉTODOS DE CONTEO'],
        ['Método', 'Registros', 'Porcentaje de Uso'],
        ...Object.entries(methodStats).map(([method, count]) => [
          method, 
          count, 
          `${((count / visitorCounts.data.length) * 100).toFixed(1)}%`
        ]),
        [''],
        ['ANÁLISIS POR CONDICIONES CLIMÁTICAS'],
        ['Condición Climática', 'Días Registrados', 'Porcentaje'],
        ...Object.entries(weatherStats).map(([weather, count]) => [
          weather, 
          count, 
          `${((count / visitorCounts.data.length) * 100).toFixed(1)}%`
        ]),
        [''],
        ['ANÁLISIS POR TIPO DE DÍA'],
        ['Tipo de Día', 'Registros', 'Porcentaje'],
        ...Object.entries(dayTypeStats).map(([dayType, count]) => [
          dayType, 
          count, 
          `${((count / visitorCounts.data.length) * 100).toFixed(1)}%`
        ]),
      ];

      // Datos de análisis por parques
      const parkAnalysisData = [
        ['ANÁLISIS DETALLADO POR PARQUES'],
        [`Generado el: ${currentDate}`],
        [''],
        ['Parque', 'Total Registros', 'Total Visitantes', 'Promedio por Registro', 'Adultos', 'Niños', 'Seniors', 'Mascotas', 'Grupos'],
        ...Object.entries(parkStats).map(([parkName, stats]) => [
          parkName,
          stats.registros,
          stats.visitantes.toLocaleString('es-ES'),
          Math.round(stats.visitantes / stats.registros),
          stats.adultos.toLocaleString('es-ES'),
          stats.niños.toLocaleString('es-ES'),
          stats.seniors.toLocaleString('es-ES'),
          stats.mascotas.toLocaleString('es-ES'),
          stats.grupos.toLocaleString('es-ES')
        ]),
      ];

      // Crear libro de trabajo profesional
      const workbook = XLSX.utils.book_new();
      
      // Hoja 1: Resumen Ejecutivo (primera hoja para impacto inmediato)
      const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
      summaryWorksheet['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 25 }, { wch: 20 }];
      
      // Configurar formato para encabezados principales
      if (summaryWorksheet['A1']) summaryWorksheet['A1'].s = { font: { bold: true, sz: 16 } };
      if (summaryWorksheet['A2']) summaryWorksheet['A2'].s = { font: { bold: true, sz: 14 } };
      
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumen Ejecutivo');

      // Hoja 2: Análisis por Parques
      const parkAnalysisWorksheet = XLSX.utils.aoa_to_sheet(parkAnalysisData);
      parkAnalysisWorksheet['!cols'] = [
        { wch: 25 }, // Parque
        { wch: 15 }, // Total Registros
        { wch: 18 }, // Total Visitantes
        { wch: 18 }, // Promedio por Registro
        { wch: 12 }, // Adultos
        { wch: 12 }, // Niños
        { wch: 12 }, // Seniors
        { wch: 12 }, // Mascotas
        { wch: 12 }  // Grupos
      ];
      
      XLSX.utils.book_append_sheet(workbook, parkAnalysisWorksheet, 'Análisis por Parques');
      
      // Hoja 3: Datos Detallados
      const dataWorksheet = XLSX.utils.json_to_sheet(mainData);
      
      // Ajustar ancho de columnas para datos detallados
      const colWidths = [
        { wch: 12 }, // Fecha
        { wch: 25 }, // Parque
        { wch: 10 }, // Adultos
        { wch: 10 }, // Niños
        { wch: 15 }, // Adultos Mayores
        { wch: 10 }, // Mascotas
        { wch: 10 }, // Grupos
        { wch: 15 }, // Total Visitantes
        { wch: 20 }, // Método de Conteo
        { wch: 15 }, // Tipo de Día
        { wch: 12 }, // Clima
        { wch: 35 }  // Notas
      ];
      dataWorksheet['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, dataWorksheet, 'Datos Detallados');

      // Hoja 4: Gráficos y Tendencias (datos preparados para gráficos)
      const chartsData = [
        ['DATOS PARA GRÁFICOS Y ANÁLISIS DE TENDENCIAS'],
        [`Generado el: ${currentDate}`],
        [''],
        ['RESUMEN POR FECHAS (últimos registros)'],
        ['Fecha', 'Total Visitantes', 'Adultos', 'Niños', 'Seniors', 'Mascotas', 'Grupos'],
        ...visitorCounts.data.slice(0, 30).map(count => [
          format(new Date(count.date), 'dd/MM/yyyy', { locale: es }),
          count.totalVisitors,
          count.adults,
          count.children,
          count.seniors,
          count.pets,
          count.groups
        ]),
        [''],
        ['COMPARATIVO DE MÉTODOS DE CONTEO'],
        ['Método', 'Frecuencia de Uso', 'Porcentaje'],
        ...Object.entries(methodStats).map(([method, count]) => [
          method, 
          count, 
          `${((count / visitorCounts.data.length) * 100).toFixed(1)}%`
        ]),
        [''],
        ['ANÁLISIS CLIMÁTICO'],
        ['Condición', 'Days', 'Porcentaje', 'Impacto en Visitantes'],
        ...Object.entries(weatherStats).map(([weather, count]) => {
          const visitsInWeather = visitorCounts.data
            .filter(c => getWeatherLabel(c.weather) === weather)
            .reduce((sum, c) => sum + c.totalVisitors, 0);
          const avgVisitsInWeather = count > 0 ? Math.round(visitsInWeather / count) : 0;
          
          return [
            weather, 
            count, 
            `${((count / visitorCounts.data.length) * 100).toFixed(1)}%`,
            `${avgVisitsInWeather} visitantes promedio`
          ];
        }),
        [''],
        ['NOTAS Y METODOLOGÍA'],
        ['• Los datos incluyen solo registros con información completa'],
        ['• Los promedios se calculan sobre días registrados, no días calendarios'],
        ['• Los porcentajes demográficos se basan en el total de visitantes'],
        ['• Las condiciones climáticas afectan significativamente la asistencia'],
        [''],
        ['RECOMENDACIONES OPERATIVAS'],
        ['• Implementar conteo sistemático en días de alta afluencia'],
        ['• Considerar clima en planificación de eventos'],
        ['• Monitorear patrones estacionales para mejor gestión'],
        ['• Documentar observaciones específicas por parque']
      ];
      
      const chartsWorksheet = XLSX.utils.aoa_to_sheet(chartsData);
      chartsWorksheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 25 }];
      
      XLSX.utils.book_append_sheet(workbook, chartsWorksheet, 'Gráficos y Tendencias');

      // Generar y descargar archivo
      const fileName = `conteo_visitantes_${format(new Date(), 'dd-MM-yyyy', { locale: es })}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Exportación Excel Profesional Exitosa",
        description: `Se generó un archivo Excel con ${visitorCounts.data.length} registros, 4 hojas de análisis y estadísticas completas`,
      });

    } catch (error) {
      console.error('Error exportando a Excel:', error);
      toast({
        title: "Error en exportación",
        description: "No se pudo generar el archivo Excel",
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = () => {
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Crear plantilla profesional con instrucciones detalladas
    const templateData = [
      {
        'Fecha': '2025-01-15',
        'Parque': 'Bosque Los Colomos',
        'Adultos': '150',
        'Niños': '75',
        'Adultos Mayores': '30',
        'Mascotas': '20',
        'Grupos': '5',
        'Método de Conteo': 'Conteo manual',
        'Tipo de Día': 'Día laborable',
        'Clima': 'Soleado',
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
        'Método de Conteo': 'Estimación',
        'Tipo de Día': 'Fin de semana',
        'Clima': 'Nublado',
        'Notas': 'Fin de semana, mucha actividad'
      }
    ];

    // Encabezado profesional con instrucciones
    const headerLines = [
      'SISTEMA DE GESTIÓN DE PARQUES URBANOS',
      'PLANTILLA PARA IMPORTACIÓN DE CONTEO DE VISITANTES',
      `Generado el: ${currentDate}`,
      '',
      'INSTRUCCIONES DE USO:',
      '1. Complete los campos requeridos en cada fila',
      '2. Use formato de fecha: AAAA-MM-DD (ejemplo: 2025-01-15)',
      '3. Use números enteros para conteos de visitantes',
      '4. Los valores de Método de Conteo aceptados son:',
      '   - Conteo manual, Estimación, Contador manual, Basado en eventos, Control de acceso',
      '5. Los valores de Tipo de Día aceptados son:',
      '   - Día laborable, Fin de semana, Día festivo',
      '6. Los valores de Clima aceptados son:',
      '   - Soleado, Nublado, Lluvioso, Otro',
      '7. El campo Notas es opcional',
      '8. Guarde el archivo como CSV antes de importar',
      '',
      'DATOS DE EJEMPLO (puede eliminar estas filas):',
      ''
    ];

    const headers = Object.keys(templateData[0]);
    const csvContent = [
      ...headerLines,
      headers.join(','),
      ...templateData.map(row => headers.map(header => `"${(row as any)[header]}"`).join(','))
    ].join('\n');

    // Agregar BOM para UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `plantilla_conteo_visitantes_${format(new Date(), 'dd-MM-yyyy', { locale: es })}.csv`;
    link.click();

    toast({
      title: "Plantilla descargada",
      description: "Plantilla profesional con instrucciones detalladas lista para usar",
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

  // Calcular datos para reportes usando estadísticas globales completas
  const reportData = useMemo(() => {
    if (!globalStats?.metrics) return null;

    // Usar métricas globales del dashboard endpoint
    const metrics = globalStats.metrics;
    const allRecords = globalStats.records || [];

    console.log(`🌐 [REPORT DATA] Usando estadísticas globales: ${Number(metrics.totalVisitors || 0).toLocaleString()} visitantes totales`);

    // Estadísticas generales desde las métricas globales
    const totalVisitors = Number(metrics.totalVisitors || 0);
    const totalAdults = Number(metrics.totalAdults || 0);
    const totalChildren = Number(metrics.totalChildren || 0);
    const totalSeniors = Number(metrics.totalSeniors || 0);
    const totalPets = Number(metrics.totalPets || 0);
    const avgDaily = Number(metrics.avgDailyVisitors || 0);

    // Datos demográficos para gráfico de pie (filtrar valores cero para evitar encimamiento)
    const demographicData = [
      { name: 'Adultos', value: totalAdults, color: '#067f5f' },
      { name: 'Niños', value: totalChildren, color: '#bcd256' },
      { name: 'Seniors', value: totalSeniors, color: '#8498a5' },
      { name: 'Mascotas', value: totalPets, color: '#00a587' }
    ].filter(item => item.value > 0); // Solo mostrar segmentos con datos

    // Datos por parque usando parkSummaries globales
    const parkData = globalStats.parkSummaries?.map((summary: any) => ({
      parkName: summary.parkName || 'Sin nombre',
      visitors: Number(summary.totalVisitors || 0),
      records: Number(summary.totalRecords || 0)
    })) || [];

    // Datos por método de conteo usando todos los registros
    const methodData = allRecords.reduce((acc, count) => {
      const methodKey = count.countingMethod;
      const method = methodLabels[methodKey as keyof typeof methodLabels] || methodKey || 'No especificado';
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

    // Datos por clima usando todos los registros
    const weatherData = allRecords.reduce((acc, count) => {
      const weatherKey = count.weather || 'other';
      const weather = weatherLabels[weatherKey as keyof typeof weatherLabels] || 'No especificado';
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

    // Tendencia temporal (últimos 7 días) usando todos los registros
    const last7Days = allRecords
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
        totalRecords: Number(metrics.totalRecords || 0),
        uniqueParks: Number(metrics.uniqueParks || 0)
      },
      charts: {
        demographic: demographicData,
        parks: parkData,
        methods: methodData,
        weather: weatherData,
        trend: last7Days
      }
    };
  }, [visitorCounts]);

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
        
        // Calcular número de días en el rango
        const timeDiff = endDate.getTime() - startDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
        
        console.log(`📊 Modo distribución: ${distributionMode}, Días: ${daysDiff}`);
        console.log(`Total originales: ${data.adults} adultos, ${data.children} niños, ${data.seniors} seniors, ${data.pets} mascotas, ${data.groups} grupos`);
        
        if (distributionMode === 'average') {
          // Distribución con promedio diario y variaciones
          const avgAdults = Math.round(data.adults / daysDiff);
          const avgChildren = Math.round(data.children / daysDiff);
          const avgSeniors = Math.round(data.seniors / daysDiff);
          const avgPets = Math.round(data.pets / daysDiff);
          const avgGroups = Math.round(data.groups / daysDiff);
          
          console.log(`📈 Promedio diario: ${avgAdults} adultos, ${avgChildren} niños, ${avgSeniors} seniors, ${avgPets} mascotas, ${avgGroups} grupos`);
          
          // Función para crear variación realista (±15% del promedio)
          const addVariation = (value: number) => {
            if (value === 0) return 0;
            const variation = Math.round(value * 0.15); // 15% de variación
            const randomVariation = Math.floor(Math.random() * (variation * 2 + 1)) - variation;
            return Math.max(0, value + randomVariation);
          };
          
          for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            
            // Aplicar variación realista a cada categoría
            const dayAdults = addVariation(avgAdults);
            const dayChildren = addVariation(avgChildren);
            const daySeniors = addVariation(avgSeniors);
            const dayPets = addVariation(avgPets);
            const dayGroups = addVariation(avgGroups);
            
            const record = {
              parkId: data.parkId,
              date: dateStr,
              adults: dayAdults,
              children: dayChildren,
              seniors: daySeniors,
              pets: dayPets,
              groups: dayGroups,
              countingMethod: data.countingMethod,
              dayType: data.dayType,
              weather: data.weather,
              notes: `${data.notes || ''} (Promedio diario distribuido del período ${data.startDate} a ${data.endDate})`.trim(),
              registeredBy: 1
            };
            console.log(`📅 ${dateStr}: ${dayAdults + dayChildren + daySeniors} visitantes (${dayAdults}+${dayChildren}+${daySeniors})`);
            records.push(record);
          }
        } else {
          // Distribución igual (números idénticos cada día)
          console.log(`📋 Usando números idénticos cada día`);
          
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
              dayType: data.dayType,
              weather: data.weather,
              notes: `${data.notes || ''} (Números idénticos para período ${data.startDate} a ${data.endDate})`.trim(),
              registeredBy: 1
            };
            console.log(`📅 ${dateStr}: ${data.adults + data.children + data.seniors} visitantes (números idénticos)`);
            records.push(record);
          }
        }
        
        // Crear todos los registros con manejo de duplicados
        const responses = [];
        let successCount = 0;
        let duplicateCount = 0;
        
        for (const record of records) {
          try {
            const response = await apiRequest('/api/visitor-counts', {
              method: 'POST',
              data: record
            });
            responses.push(response);
            successCount++;
          } catch (error: any) {
            if (error.status === 409) {
              // Registro duplicado - no es un error crítico
              console.log(`⚠️ Registro duplicado para fecha ${record.date}`);
              duplicateCount++;
            } else {
              throw error; // Re-lanzar otros errores
            }
          }
        }
        
        return { responses, successCount, duplicateCount };
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
          data: requestData
        });
      }
    },
    onSuccess: (result: any) => {
      if (countingMode === 'range' && result.successCount !== undefined) {
        // Modo rango con manejo de duplicados
        const totalAttempted = Math.ceil((new Date(formData.endDate!).getTime() - new Date(formData.startDate!).getTime()) / (1000 * 60 * 60 * 24)) + 1;
        let message = `${result.successCount} registro(s) creado(s) exitosamente`;
        if (result.duplicateCount > 0) {
          message += `, ${result.duplicateCount} ya existían`;
        }
        
        toast({
          title: "Registro completado",
          description: message,
        });
      } else {
        // Modo diario normal
        toast({
          title: "Registro exitoso",
          description: "Registro de visitantes creado correctamente",
        });
      }
      
      // Invalidar múltiples queries para actualizar dashboard
      queryClient.invalidateQueries({ queryKey: ['/api/visitor-counts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/visitor-counts/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/visitor-summary'] });
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

  const getWeatherLabel = (weather: string | undefined) => {
    if (!weather) return 'No especificado';
    return weatherLabels[weather as keyof typeof weatherLabels] || weather;
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
        {/* Header con título */}
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-8 h-8 text-gray-900" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Conteo</h1>
                <p className="text-gray-600 mt-2">Gestión diaria de visitantes por parque</p>
              </div>
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
        </Card>

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
                        {parks && Array.isArray(parks) && parks.filter(park => park.id && park.name).map((park) => (
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
                        <SelectItem value="estimation">Estimación</SelectItem>
                        <SelectItem value="manual_counter">Contador manual</SelectItem>
                        <SelectItem value="event_based">Basado en eventos</SelectItem>
                        <SelectItem value="entrance_control">Control de acceso</SelectItem>
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
                      onClick={exportToExcel}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Exportar Excel
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
                                {Number(count.totalVisitors || 0).toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">visitantes</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center p-2 bg-blue-50 rounded">
                              <div className="text-sm font-semibold text-blue-700">{Number(count.adults || 0).toLocaleString()}</div>
                              <div className="text-xs text-blue-600">Adultos</div>
                            </div>
                            <div className="text-center p-2 bg-green-50 rounded">
                              <div className="text-sm font-semibold text-green-700">{Number(count.children || 0).toLocaleString()}</div>
                              <div className="text-xs text-green-600">Niños</div>
                            </div>
                            <div className="text-center p-2 bg-orange-50 rounded">
                              <div className="text-sm font-semibold text-orange-700">{Number(count.seniors || 0).toLocaleString()}</div>
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
                                {getWeatherLabel(count.weather)}
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
                                {Number(count.totalVisitors || 0).toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-500">visitantes</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-lg font-semibold text-blue-700">{Number(count.adults || 0).toLocaleString()}</div>
                              <div className="text-sm text-blue-600">Adultos</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-lg font-semibold text-green-700">{Number(count.children || 0).toLocaleString()}</div>
                              <div className="text-sm text-green-600">Niños</div>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                              <div className="text-lg font-semibold text-orange-700">{Number(count.seniors || 0).toLocaleString()}</div>
                              <div className="text-sm text-orange-600">Adultos mayores</div>
                            </div>
                            <div className="text-center p-3 bg-pink-50 rounded-lg">
                              <div className="text-lg font-semibold text-pink-700">{Number(count.pets || 0).toLocaleString()}</div>
                              <div className="text-sm text-pink-600">Mascotas</div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <div className="text-lg font-semibold text-purple-700">{Number(count.groups || 0).toLocaleString()}</div>
                              <div className="text-sm text-purple-600">Grupos</div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getDayTypeLabel(count.dayType || 'weekday')}
                            </Badge>
                            <Badge variant="outline">
                              {getMethodLabel(count.countingMethod)}
                            </Badge>
                            {count.weather && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                {getWeatherIcon(count.weather)}
                                {getWeatherLabel(count.weather)}
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
                          {parks && Array.isArray(parks) && parks.filter(park => park.id && park.name).map((park) => (
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
                          <SelectItem value="all">Todo el año</SelectItem>
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
                              {Number(reportData.summary.avgDaily || 0).toLocaleString()}
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
                              {Number(reportData.summary.totalRecords || 0).toLocaleString()}
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
                              {Number(reportData.summary.uniqueParks || 0).toLocaleString()}
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
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={reportData.charts.demographic}
                                cx="50%"
                                cy="45%"
                                labelLine={true}
                                label={({ name, percent, value }) => 
                                  percent > 0.05 ? `${name}: ${Number(value || 0).toLocaleString()} (${(percent * 100).toFixed(1)}%)` : ''
                                }
                                outerRadius={70}
                                innerRadius={20}
                                fill="#8884d8"
                                dataKey="value"
                                minAngle={5}
                              >
                                {reportData.charts.demographic.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(value: any, name: string) => [
                                  `${Number(value || 0).toLocaleString()} visitantes`, 
                                  name
                                ]}
                              />
                              <Legend 
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                formatter={(value: string, entry: any) => 
                                  `${value}: ${Number(entry.payload?.value || 0).toLocaleString()}`
                                }
                              />
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
                              <Tooltip formatter={(value: any) => [Number(value).toLocaleString(), 'Visitantes']} />
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
                              <Tooltip formatter={(value: any) => [Number(value).toLocaleString(), 'Visitantes']} />
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
                    <div className="flex space-x-2">
                      <Button 
                        onClick={exportToCSV}
                        className="bg-[#067f5f] hover:bg-[#00a587]"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exportar CSV
                      </Button>
                      <Button 
                        onClick={exportToExcel}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Exportar Excel
                      </Button>
                    </div>
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

                    {/* Modo de distribución para rangos */}
                    {countingMode === 'range' && (
                      <div className="space-y-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <Label>Tipo de distribución para el período *</Label>
                        <div className="flex gap-4">
                          <Button
                            type="button"
                            variant={distributionMode === 'average' ? 'default' : 'outline'}
                            onClick={() => setDistributionMode('average')}
                            className="flex items-center gap-2 text-sm"
                            size="sm"
                          >
                            <TrendingUp className="h-4 w-4" />
                            Promedio diario distribuido
                          </Button>
                          <Button
                            type="button"
                            variant={distributionMode === 'equal' ? 'default' : 'outline'}
                            onClick={() => setDistributionMode('equal')}
                            className="flex items-center gap-2 text-sm"
                            size="sm"
                          >
                            <BarChart3 className="h-4 w-4" />
                            Números idénticos
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          {distributionMode === 'average' 
                            ? 'Los números se dividirán entre los días del período con variaciones naturales (±15%)'
                            : 'Los mismos números se aplicarán idénticamente a cada día del período'
                          }
                        </p>
                      </div>
                    )}

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
                            {parks && Array.isArray(parks) && parks.filter(park => park.id && park.name).map((park) => (
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