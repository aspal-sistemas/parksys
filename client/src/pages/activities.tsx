import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Park } from '@shared/schema';
import { 
  CalendarDays, MapPin, Clock, Tag, Filter, Search, Plus 
} from 'lucide-react';
import ActivityForm from '@/components/ActivityForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Formato para fechas
const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
};

// Formato para tiempo relativo
const getRelativeTime = (dateString: string | Date) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Evento pasado';
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Mañana';
  if (diffDays < 7) return `En ${diffDays} días`;
  if (diffDays < 30) return `En ${Math.floor(diffDays / 7)} semanas`;
  return `En ${Math.floor(diffDays / 30)} meses`;
};

// Componente de card para actividad
const ActivityCard = ({ activity, parkName }: { activity: any, parkName?: string }) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-medium text-lg">{activity.title}</h3>
            {parkName && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-3.5 w-3.5 mr-1 text-primary" />
                <span>{parkName}</span>
              </div>
            )}
          </div>
          <Badge className="bg-primary-50 hover:bg-primary-100 text-primary border-0">
            {activity.category || 'General'}
          </Badge>
        </div>
        
        <div className="mt-3 text-sm">
          <div className="flex items-center text-gray-700 mb-1">
            <CalendarDays className="h-3.5 w-3.5 mr-1 text-gray-500" />
            <span>{formatDate(activity.startDate)}</span>
          </div>
          {activity.location && (
            <div className="flex items-center text-gray-700 mb-1">
              <MapPin className="h-3.5 w-3.5 mr-1 text-gray-500" />
              <span>{activity.location}</span>
            </div>
          )}
        </div>
        
        <p className="mt-3 text-gray-600 line-clamp-2">
          {activity.description}
        </p>
        
        <div className="mt-4 flex justify-between items-center">
          <Badge variant="outline" className={cn("border-0", 
            diffTimeClass(activity.startDate)
          )}>
            {getRelativeTime(activity.startDate)}
          </Badge>
          <Button variant="outline" size="sm">Ver detalles</Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Clase de color según tiempo
const diffTimeClass = (dateString: string | Date) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "bg-gray-100 text-gray-600";
  if (diffDays < 2) return "bg-orange-50 text-orange-600";
  if (diffDays < 7) return "bg-green-50 text-green-600";
  return "bg-blue-50 text-blue-600";
};

// Componente principal de Actividades
const Activities: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [viewType, setViewType] = useState<'upcoming' | 'all' | 'past'>('upcoming');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Fetch activities
  const { data: activities = [], isLoading: isLoadingActivities } = useQuery<any[]>({
    queryKey: ['/api/activities'],
  });
  
  // Fetch parks for park picker
  const { data: parks = [], isLoading: isLoadingParks } = useQuery<Park[]>({
    queryKey: ['/api/parks'],
  });
  
  // Filtrar actividades
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = searchTerm ? 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (activity.description?.toLowerCase().includes(searchTerm.toLowerCase())) : 
      true;
      
    const matchesCategory = categoryFilter ? 
      activity.category === categoryFilter : 
      true;
      
    const now = new Date();
    const activityDate = new Date(activity.startDate);
    
    let matchesTimeFilter = true;
    if (viewType === 'upcoming') {
      matchesTimeFilter = activityDate >= now;
    } else if (viewType === 'past') {
      matchesTimeFilter = activityDate < now;
    }
    
    return matchesSearch && matchesCategory && matchesTimeFilter;
  });
  
  // Ordenar actividades por fecha
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    if (viewType === 'past') {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    }
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });
  
  // Categorías únicas para el filtro
  const uniqueCategories = Array.from(
    new Set(activities.map(activity => activity.category).filter(Boolean))
  );
  
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Actividades en Parques</h1>
          <p className="text-gray-600 mt-1">
            Explora y descubre eventos y actividades en los parques públicos
          </p>
        </div>
        
        <Button 
          className="mt-4 md:mt-0"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear actividad
        </Button>
      </div>
      
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar actividades..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2 text-gray-500" />
              <SelectValue placeholder="Filtrar por categoría" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas las categorías</SelectItem>
            {uniqueCategories.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Tabs value={viewType} onValueChange={(value) => setViewType(value as any)}>
          <TabsList className="w-full">
            <TabsTrigger value="upcoming" className="flex-1">Próximas</TabsTrigger>
            <TabsTrigger value="all" className="flex-1">Todas</TabsTrigger>
            <TabsTrigger value="past" className="flex-1">Pasadas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Estado de carga */}
      {isLoadingActivities ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4">
                <Skeleton className="h-7 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/3 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedActivities.map(activity => (
            <ActivityCard 
              key={activity.id} 
              activity={activity}
              parkName={activity.parkName}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No hay actividades</h3>
          <p className="text-gray-600 mt-1">
            {searchTerm || categoryFilter ? 
              "No se encontraron actividades con los filtros seleccionados" : 
              "Actualmente no hay actividades programadas"}
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('');
              setViewType('all');
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Limpiar filtros
          </Button>
        </div>
      )}
      
      {/* Modal de creación de actividad */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Crear nueva actividad</DialogTitle>
            <DialogDescription>
              Programa una nueva actividad o evento en uno de los parques
            </DialogDescription>
          </DialogHeader>
          
          {/* Formulario de actividad */}
          <div className="py-4">
            {!isLoadingParks && parks.length > 0 ? (
              <ActivityForm
                parks={parks}
                onSuccess={() => setIsCreateModalOpen(false)}
                onCancel={() => setIsCreateModalOpen(false)}
              />
            ) : (
              <div className="text-center py-6">
                <Skeleton className="h-8 w-3/4 mx-auto mb-4" />
                <Skeleton className="h-6 w-1/2 mx-auto mb-2" />
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Activities;