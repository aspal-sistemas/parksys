import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, CalendarDays, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

interface InstructorActivitiesListProps {
  instructorId: number;
  limit?: number;
  showHeader?: boolean;
}

export default function InstructorActivitiesList({ 
  instructorId,
  limit = 3,
  showHeader = true
}: InstructorActivitiesListProps) {
  const [, setLocation] = useLocation();
  const [showAll, setShowAll] = useState(false);
  
  // Obtener asignaciones del instructor
  const { data: assignments, isLoading, isError } = useQuery({
    queryKey: [`/api/instructors/${instructorId}/assignments`],
    enabled: !!instructorId
  });

  // Formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMM yyyy', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Formatear hora
  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return format(date, 'HH:mm', { locale: es });
    } catch (error) {
      return '';
    }
  };

  // Colores para categorías
  const getCategoryColor = (category: string | null | undefined) => {
    if (!category) return "bg-gray-100 text-gray-800";
    
    if (category.includes('Arte') || category.includes('Cultural')) 
      return "bg-pink-100 text-pink-800";
    if (category.includes('Recreación') || category.includes('Bienestar')) 
      return "bg-green-100 text-green-800";
    if (category.includes('Temporada') || category.includes('Evento')) 
      return "bg-amber-100 text-amber-800";
    if (category.includes('Naturaleza') || category.includes('Ciencia')) 
      return "bg-blue-100 text-blue-800";
      
    return "bg-gray-100 text-gray-800";
  };

  // Verificar si una asignación está activa/vigente
  const isActiveAssignment = (startDate: string, endDate?: string) => {
    const now = new Date();
    const start = new Date(startDate);
    
    if (endDate) {
      const end = new Date(endDate);
      return now >= start && now <= end;
    }
    
    return now >= start;
  };

  if (isLoading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="text-lg">Actividades asignadas</CardTitle>
            <CardDescription>Clases y eventos a cargo del instructor</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex flex-col space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="text-lg">Actividades asignadas</CardTitle>
            <CardDescription>Clases y eventos a cargo del instructor</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-gray-500">No se pudieron cargar las actividades del instructor.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si no hay asignaciones
  if (!assignments || assignments.length === 0) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="text-lg">Actividades asignadas</CardTitle>
            <CardDescription>Clases y eventos a cargo del instructor</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-4">
            <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">Este instructor no tiene actividades asignadas actualmente.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Eliminar duplicados usando un Map basado en ID
  const uniqueAssignmentsMap = new Map();
  
  if (assignments && assignments.length > 0) {
    assignments.forEach((assignment: any) => {
      if (!uniqueAssignmentsMap.has(assignment.id)) {
        uniqueAssignmentsMap.set(assignment.id, assignment);
      }
    });
  }
  
  // Convertir el Map a array y ordenar por fecha de inicio (más recientes primero)
  const uniqueAssignments = Array.from(uniqueAssignmentsMap.values())
    .sort((a: any, b: any) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return dateB - dateA;
    });
  
  // Determinar cuántas asignaciones mostrar
  const displayedAssignments = showAll 
    ? uniqueAssignments 
    : uniqueAssignments.slice(0, limit);

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle className="text-lg">Actividades asignadas</CardTitle>
          <CardDescription>
            {assignments.length} {assignments.length === 1 ? 'actividad' : 'actividades'} a cargo del instructor
          </CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-3">
          {displayedAssignments.map((assignment: any, index: number) => (
            <div 
              key={index} 
              className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
              onClick={() => setLocation(`/admin/activities/calendar`)}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium">
                  {assignment.activityTitle || assignment.activityName || 'Actividad sin nombre'}
                </h3>
                <Badge className={getCategoryColor(assignment.activityCategory)}>
                  {assignment.activityCategory || 'Sin categoría'}
                </Badge>
              </div>
              
              <div className="mt-2 space-y-1 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  <span>
                    {formatDate(assignment.startDate)}{assignment.endDate && ` - ${formatDate(assignment.endDate)}`}
                  </span>
                </div>
                
                {assignment.startTime && assignment.endTime && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1.5" />
                    <span>
                      {formatTime(assignment.startTime)} - {formatTime(assignment.endTime)}
                    </span>
                  </div>
                )}
                
                {assignment.parkName && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1.5" />
                    <span>{assignment.parkName}</span>
                  </div>
                )}
                
                {assignment.isRecurring && (
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-1.5" />
                    <span>Actividad recurrente</span>
                  </div>
                )}
              </div>
              
              {isActiveAssignment(assignment.startDate, assignment.endDate) && (
                <Badge className="mt-2 bg-green-100 text-green-800">Activa</Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      
      {assignments.length > limit && (
        <CardFooter className="flex justify-center border-t pt-4">
          <Button 
            variant="ghost" 
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Mostrar menos' : `Ver todas (${assignments.length})`}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}