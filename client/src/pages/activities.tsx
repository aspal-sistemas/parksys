import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  MapPin,
  Edit,
  Trash2,
  Plus,
  ArrowLeft,
  Tag,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import NewActivityForm from '@/components/NewActivityForm';

// Función auxiliar para determinar el color de la categoría
const getCategoryColor = (category?: string) => {
  switch (category) {
    case 'deportiva':
      return 'bg-green-100 text-green-800';
    case 'cultural':
      return 'bg-purple-100 text-purple-800';
    case 'recreativa':
      return 'bg-blue-100 text-blue-800';
    case 'educativa':
      return 'bg-yellow-100 text-yellow-800';
    case 'comunitaria':
      return 'bg-orange-100 text-orange-800';
    case 'ambiental':
      return 'bg-emerald-100 text-emerald-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Función para traducir las categorías
const getTranslatedCategory = (category?: string) => {
  switch (category) {
    case 'deportiva':
      return 'Deportiva';
    case 'cultural':
      return 'Cultural';
    case 'recreativa':
      return 'Recreativa';
    case 'educativa':
      return 'Educativa';
    case 'comunitaria':
      return 'Comunitaria';
    case 'ambiental':
      return 'Ambiental';
    default:
      return 'Otra';
  }
};

// Componente principal
const ActivitiesPage = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const searchParams = new URLSearchParams(window.location.search);
  const parkId = searchParams.get('parkId') ? parseInt(searchParams.get('parkId')!) : undefined;
  const parkName = searchParams.get('parkName') || 'Todos los parques';

  // Estados para diálogos
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [isEditActivityOpen, setIsEditActivityOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  // Estados para filtrado y ordenamiento
  const [activeView, setActiveView] = useState('all');
  const [sortField, setSortField] = useState('startDate');
  const [sortDirection, setSortDirection] = useState('asc');

  // Función auxiliar para formatear fechas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPP', { locale: es });
  };

  // Cargar actividades
  const { data: activities, isLoading, isError } = useQuery({
    queryKey: parkId 
      ? [`/api/parks/${parkId}/activities`] 
      : ['/api/activities'],
  });

  // Filtrar y ordenar actividades
  const filteredActivities = React.useMemo(() => {
    if (!activities) return [];
    
    const now = new Date();
    let filtered = [...activities];
    
    // Filtrar según la vista activa
    if (activeView === 'upcoming') {
      filtered = filtered.filter(activity => new Date(activity.startDate) > now);
    } else if (activeView === 'past') {
      filtered = filtered.filter(activity => {
        const endDate = activity.endDate ? new Date(activity.endDate) : new Date(activity.startDate);
        return endDate < now;
      });
    } else if (activeView === 'current') {
      filtered = filtered.filter(activity => {
        const startDate = new Date(activity.startDate);
        const endDate = activity.endDate ? new Date(activity.endDate) : startDate;
        return startDate <= now && endDate >= now;
      });
    }
    
    // Ordenar
    filtered.sort((a, b) => {
      let fieldA, fieldB;
      
      if (sortField === 'startDate') {
        fieldA = new Date(a.startDate).getTime();
        fieldB = new Date(b.startDate).getTime();
      } else if (sortField === 'title') {
        fieldA = a.title.toLowerCase();
        fieldB = b.title.toLowerCase();
      } else if (sortField === 'category') {
        fieldA = a.category || '';
        fieldB = b.category || '';
      } else {
        fieldA = a[sortField];
        fieldB = b[sortField];
      }
      
      if (sortDirection === 'asc') {
        return fieldA > fieldB ? 1 : -1;
      } else {
        return fieldA < fieldB ? 1 : -1;
      }
    });
    
    return filtered;
  }, [activities, activeView, sortField, sortDirection]);

  // Manejar cambio de ordenamiento
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Manejar eliminación de actividad
  const handleDeleteActivity = async () => {
    if (!selectedActivity) return;
    
    try {
      const response = await fetch(`/api/activities/${selectedActivity.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer direct-token-admin',
          'X-User-Id': '1',
          'X-User-Role': 'super_admin'
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar la actividad');
      }
      
      toast({
        title: 'Actividad eliminada',
        description: 'La actividad ha sido eliminada correctamente',
      });
      
      // Actualizar datos
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      if (parkId) {
        queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}/activities`] });
      }
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al eliminar la actividad',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedActivity(null);
    }
  };

  // Renderizar interfaz de carga o error
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Cargando actividades...</h1>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Error al cargar actividades</h1>
        <p>Ocurrió un error al cargar las actividades. Por favor, inténtalo de nuevo más tarde.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setLocation('/parks')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Actividades</h1>
          {parkName && <span className="text-muted-foreground">- {parkName}</span>}
        </div>
        
        <Button onClick={() => setIsAddActivityOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Actividad
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filtrar Actividades</CardTitle>
          <CardDescription>
            Selecciona una vista para filtrar las actividades por su estado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                Todas
              </TabsTrigger>
              <TabsTrigger value="current" className="flex-1">
                Actuales
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex-1">
                Próximas
              </TabsTrigger>
              <TabsTrigger value="past" className="flex-1">
                Pasadas
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('title')} className="cursor-pointer">
                Título {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('startDate')} className="cursor-pointer">
                Fecha {sortField === 'startDate' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('category')} className="cursor-pointer">
                Categoría {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No hay actividades disponibles con los filtros seleccionados
                </TableCell>
              </TableRow>
            ) : (
              filteredActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(activity.startDate)}
                      {activity.endDate && (
                        <>
                          <span className="mx-1">-</span>
                          {formatDate(activity.endDate)}
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {activity.category ? (
                      <Badge className={cn("font-normal", getCategoryColor(activity.category))}>
                        <Tag className="h-3 w-3 mr-1" />
                        {getTranslatedCategory(activity.category)}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">No especificada</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {activity.location ? (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{activity.location}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No especificada</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedActivity(activity);
                          setIsEditActivityOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedActivity(activity);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Diálogos y modales */}
      <Dialog open={isAddActivityOpen} onOpenChange={setIsAddActivityOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Agregar Nueva Actividad</DialogTitle>
          </DialogHeader>
          <NewActivityForm
            parkId={parkId || 0}
            parkName={parkName}
            onSuccess={() => setIsAddActivityOpen(false)}
            onCancel={() => setIsAddActivityOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditActivityOpen} onOpenChange={setIsEditActivityOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Actividad</DialogTitle>
          </DialogHeader>
          {selectedActivity && (
            <NewActivityForm
              parkId={selectedActivity.parkId}
              parkName={parkName}
              onSuccess={() => setIsEditActivityOpen(false)}
              onCancel={() => setIsEditActivityOpen(false)}
              existingActivity={selectedActivity}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la actividad "{selectedActivity?.title}".
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteActivity} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ActivitiesPage;

// Función auxiliar para combinar clases condicionales
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}