import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { useToast } from '@/hooks/use-toast';
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
const ActivityCard = ({ 
  activity, 
  parkName, 
  onEdit, 
  onDelete 
}: { 
  activity: any, 
  parkName?: string,
  onEdit?: (activity: any) => void,
  onDelete?: (activity: any) => void
}) => {
  const [showActions, setShowActions] = useState(false);
  
  return (
    <Card 
      className="overflow-hidden transition-all hover:shadow-md relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Menú de acciones flotante - visible al pasar el mouse */}
      {showActions && onEdit && onDelete && (
        <div className="absolute top-2 right-2 bg-white rounded-md shadow-md flex z-10">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(activity);
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-blue-500"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
              <path d="m15 5 4 4"/>
            </svg>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(activity);
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-red-500"
            >
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              <line x1="10" x2="10" y1="11" y2="17"/>
              <line x1="14" x2="14" y1="11" y2="17"/>
            </svg>
          </Button>
        </div>
      )}
      
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
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ver calendario</span>
            </Button>
            <Button variant="outline" size="sm">Ver detalles</Button>
          </div>
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewType, setViewType] = useState<'upcoming' | 'all' | 'past'>('upcoming');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  
  // Fetch activities
  const { 
    data: activities = [], 
    isLoading: isLoadingActivities,
    refetch: refetchActivities
  } = useQuery<any[]>({
    queryKey: ['/api/activities'],
  });
  
  // Fetch parks for park picker
  const { data: parks = [], isLoading: isLoadingParks } = useQuery<Park[]>({
    queryKey: ['/api/parks'],
  });
  
  // Mutation para eliminar actividad
  const deleteMutation = useMutation({
    mutationFn: async (activityId: number) => {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Error al eliminar la actividad');
      }
      
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Actividad eliminada",
        description: "La actividad ha sido eliminada correctamente.",
      });
      
      // Cerrar diálogo de confirmación
      setIsDeleteDialogOpen(false);
      setSelectedActivity(null);
      
      // Actualizar datos
      refetchActivities();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar la actividad: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Manejar edición de actividad
  const handleEditActivity = (activity: any) => {
    setSelectedActivity(activity);
    setIsEditModalOpen(true);
  };
  
  // Manejar eliminación de actividad
  const handleDeleteActivity = (activity: any) => {
    setSelectedActivity(activity);
    setIsDeleteDialogOpen(true);
  };
  
  // Manejar calendario de actividad
  const handleCalendarView = (activity: any) => {
    setSelectedActivity(activity);
    setIsCalendarModalOpen(true);
  };
  
  // Confirmar eliminación de actividad
  const handleConfirmDelete = () => {
    if (selectedActivity) {
      deleteMutation.mutate(selectedActivity.id);
    }
  };
  
  // Filtrar actividades
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = searchTerm ? 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (activity.description?.toLowerCase().includes(searchTerm.toLowerCase())) : 
      true;
      
    const matchesCategory = categoryFilter && categoryFilter !== 'all' ? 
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
            <SelectItem value="all">Todas las categorías</SelectItem>
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
              setCategoryFilter('all');
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
      
      {/* Modal de edición de actividad */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar actividad</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la actividad
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedActivity && !isLoadingParks && parks.length > 0 ? (
              <ActivityForm
                parks={parks}
                activity={selectedActivity}
                onSuccess={() => {
                  setIsEditModalOpen(false);
                  setSelectedActivity(null);
                }}
                onCancel={() => {
                  setIsEditModalOpen(false);
                  setSelectedActivity(null);
                }}
              />
            ) : (
              <div className="text-center py-6">
                <Skeleton className="h-8 w-3/4 mx-auto mb-4" />
                <Skeleton className="h-6 w-1/2 mx-auto mb-2" />
                <Skeleton className="h-10 w-full mb-4" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta actividad?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedActivity && (
              <div className="border border-gray-200 rounded-md p-3 mb-4">
                <h4 className="font-medium">{selectedActivity.title}</h4>
                <p className="text-sm text-gray-500">
                  {formatDate(selectedActivity.startDate)}
                </p>
                {selectedActivity.location && (
                  <p className="text-sm mt-1">
                    <span className="font-medium">Ubicación:</span> {selectedActivity.location}
                  </p>
                )}
              </div>
            )}
            <p className="text-sm text-gray-500">
              Esta acción no se puede deshacer.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedActivity(null);
              }}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de vista de calendario */}
      <Dialog open={isCalendarModalOpen} onOpenChange={setIsCalendarModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles del evento</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {selectedActivity && (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between gap-2">
                  <h3 className="font-medium text-lg">{selectedActivity.title}</h3>
                  <Badge className="w-fit bg-primary-50 text-primary border-0">
                    {selectedActivity.category || 'General'}
                  </Badge>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="font-medium">Fecha de inicio</p>
                      <p className="text-sm">{formatDate(selectedActivity.startDate)}</p>
                    </div>
                  </div>
                  
                  {selectedActivity.endDate && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <div>
                        <p className="font-medium">Fecha de finalización</p>
                        <p className="text-sm">{formatDate(selectedActivity.endDate)}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedActivity.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-600" />
                      <div>
                        <p className="font-medium">Ubicación</p>
                        <p className="text-sm">{selectedActivity.location}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Descripción</h4>
                  <p className="text-sm">{selectedActivity.description}</p>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsCalendarModalOpen(false);
                      setSelectedActivity(null);
                    }}
                  >
                    Cerrar
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsCalendarModalOpen(false);
                      handleEditActivity(selectedActivity);
                    }}
                  >
                    Editar evento
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Activities;