import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Search, Loader, Calendar, MapPin, Plus, ArrowUpDown, Filter, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Activity } from '@shared/schema';

const AdminActivitiesSimple = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('startDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPark, setFilterPark] = useState<string>('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [showActivityDialog, setShowActivityDialog] = useState(false);

  // Fetch all activities
  const { 
    data: activitiesData = [], 
    isLoading: isLoadingActivities,
    isError: isErrorActivities,
  } = useQuery({
    queryKey: ['/api/activities'],
  });

  // Fetch parks for filtering
  const { data: parks = [] } = useQuery({
    queryKey: ['/api/parks'],
    enabled: true
  });

  // Apply filters and sorting
  const filteredAndSortedActivities = React.useMemo(() => {
    let activities = Array.isArray(activitiesData) ? [...activitiesData] : [];

    // Filter by search query
    if (searchQuery) {
      activities = activities.filter(activity => 
        activity.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      activities = activities.filter(activity => activity.status === filterStatus);
    }

    // Filter by park
    if (filterPark !== 'all') {
      activities = activities.filter(activity => activity.parkId?.toString() === filterPark);
    }

    // Sort activities
    activities.sort((a, b) => {
      let aValue = a[sortField as keyof typeof a];
      let bValue = b[sortField as keyof typeof b];

      if (sortField === 'startDate') {
        aValue = new Date(a.startDate || 0).getTime();
        bValue = new Date(b.startDate || 0).getTime();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return activities;
  }, [activitiesData, searchQuery, filterStatus, filterPark, sortField, sortDirection]);

  // Format date
  const formatDate = (date: Date | string) => {
    try {
      return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: es });
    } catch {
      return 'Fecha no válida';
    }
  };

  // Calendar functions
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getActivitiesForDate = (date: Date) => {
    return filteredAndSortedActivities.filter(activity => {
      const activityDate = new Date(activity.startDate);
      return activityDate.toDateString() === date.toDateString();
    });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const openActivityDialog = (activity: any) => {
    setSelectedActivity(activity);
    setShowActivityDialog(true);
  };

  const renderCalendarGrid = () => {
    const startDay = getDay(monthStart);
    const emptyDays = Array.from({ length: startDay }, (_, i) => (
      <div key={`empty-${i}`} className="h-24 border border-gray-200"></div>
    ));

    return (
      <div className="grid grid-cols-7 gap-1">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="p-2 text-center font-medium text-gray-700 bg-gray-50">
            {day}
          </div>
        ))}
        {emptyDays}
        {monthDays.map(day => {
          const dayActivities = getActivitiesForDate(day);
          return (
            <div key={day.toISOString()} className="h-24 border border-gray-200 p-1 overflow-y-auto">
              <div className="text-xs font-medium text-gray-600">
                {format(day, 'd')}
              </div>
              {dayActivities.map(activity => (
                <div
                  key={activity.id}
                  className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 mb-1 cursor-pointer hover:bg-blue-200"
                  onClick={() => openActivityDialog(activity)}
                >
                  {activity.title?.substring(0, 15)}...
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoadingActivities) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader className="w-8 h-8 animate-spin" />
          <span className="ml-2">Cargando actividades...</span>
        </div>
      </AdminLayout>
    );
  }

  if (isErrorActivities) {
    return (
      <AdminLayout>
        <div className="text-center text-red-500 p-8">
          Error al cargar las actividades. Por favor, recarga la página.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Actividades</h1>
          <Link href="/admin/organizador/nueva-actividad">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Actividad
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Calendario
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {/* Filters and Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtros y Búsqueda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-64">
                    <Input
                      placeholder="Buscar actividades..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="activa">Activa</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                      <SelectItem value="completada">Completada</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPark} onValueChange={setFilterPark}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Parque" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los parques</SelectItem>
                      {Array.isArray(parks) && parks.map((park: any) => (
                        <SelectItem key={park.id} value={park.id.toString()}>
                          {park.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                </div>
              </CardContent>
            </Card>

            {/* Activities Table */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Actividades ({filteredAndSortedActivities.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          className="p-0 h-auto font-medium"
                          onClick={() => handleSort('title')}
                        >
                          Título
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          className="p-0 h-auto font-medium"
                          onClick={() => handleSort('startDate')}
                        >
                          Fecha y Hora
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          className="p-0 h-auto font-medium"
                          onClick={() => handleSort('status')}
                        >
                          Estado
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>Capacidad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedActivities.length > 0 ? (
                      filteredAndSortedActivities.map((activity: any) => (
                        <TableRow 
                          key={activity.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => openActivityDialog(activity)}
                        >
                          <TableCell className="font-medium">{activity.title}</TableCell>
                          <TableCell>{formatDate(activity.startDate)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {activity.location || 'No especificada'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              activity.status === 'activa' ? 'default' :
                              activity.status === 'pendiente' ? 'secondary' :
                              activity.status === 'cancelada' ? 'destructive' :
                              'outline'
                            }>
                              {activity.status || 'Sin estado'}
                            </Badge>
                          </TableCell>
                          <TableCell>{activity.capacity || 'Sin límite'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                          No se encontraron actividades
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            {/* Calendar Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Calendario de Actividades
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-lg font-medium min-w-48 text-center">
                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button 
                      onClick={() => window.location.href = '/admin/activities/new'}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Actividad
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {renderCalendarGrid()}
              </CardContent>
            </Card>

            {/* Calendar Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtros del Calendario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="activa">Activa</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                      <SelectItem value="completada">Completada</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPark} onValueChange={setFilterPark}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Parque" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los parques</SelectItem>
                      {Array.isArray(parks) && parks.map((park: any) => (
                        <SelectItem key={park.id} value={park.id.toString()}>
                          {park.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Activity Detail Dialog */}
        <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedActivity?.title}</DialogTitle>
            </DialogHeader>
            {selectedActivity && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700">Fecha y Hora</h4>
                    <p>{formatDate(selectedActivity.startDate)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Estado</h4>
                    <Badge variant={
                      selectedActivity.status === 'activa' ? 'default' :
                      selectedActivity.status === 'pendiente' ? 'secondary' :
                      selectedActivity.status === 'cancelada' ? 'destructive' :
                      'outline'
                    }>
                      {selectedActivity.status || 'Sin estado'}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Ubicación</h4>
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {selectedActivity.location || 'No especificada'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Capacidad</h4>
                    <p>{selectedActivity.capacity || 'Sin límite'}</p>
                  </div>
                </div>
                {selectedActivity.description && (
                  <div>
                    <h4 className="font-medium text-gray-700">Descripción</h4>
                    <p className="text-gray-600">{selectedActivity.description}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cerrar</Button>
              </DialogClose>
              <Button onClick={() => window.location.href = `/admin/activities/${selectedActivity?.id}/edit`}>
                Editar Actividad
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminActivitiesSimple;