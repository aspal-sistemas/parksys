import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  Mail, 
  Calendar, 
  CalendarClock, 
  Briefcase, 
  ArrowLeft, 
  FileEdit, 
  Trash, 
  Award,
  BookOpen,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import InstructorActivitiesList from '@/components/InstructorActivitiesList';

export default function InstructorDetailPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const instructorId = parseInt(params.id);
  
  // Obtener datos del instructor
  const { 
    data: instructor, 
    isLoading, 
    isError,
    refetch 
  } = useQuery({
    queryKey: [`/api/instructors/${instructorId}`],
    enabled: !isNaN(instructorId)
  });

  // Obtener asignaciones del instructor
  const { 
    data: assignments,
    isLoading: isLoadingAssignments
  } = useQuery({
    queryKey: [`/api/instructors/${instructorId}/assignments`],
    enabled: !isNaN(instructorId)
  });

  // Obtener evaluaciones del instructor
  const { 
    data: evaluations,
    isLoading: isLoadingEvaluations
  } = useQuery({
    queryKey: [`/api/instructors/${instructorId}/evaluations`],
    enabled: !isNaN(instructorId)
  });

  // Obtener reconocimientos del instructor
  const { 
    data: recognitions,
    isLoading: isLoadingRecognitions
  } = useQuery({
    queryKey: [`/api/instructors/${instructorId}/recognitions`],
    enabled: !isNaN(instructorId)
  });

  // Formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Iniciales para avatar
  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Renderizar estado del instructor
  const renderStatus = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Renderizar especialidades
  const renderSpecialties = (specialties?: string) => {
    if (!specialties) return <span className="text-gray-400 italic">Sin especialidades registradas</span>;
    
    return specialties.split(',').map((specialty, index) => (
      <Badge key={index} variant="outline" className="mr-1 mb-1">{specialty.trim()}</Badge>
    ));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/admin/instructors')}
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold">Cargando instructor...</h1>
          </div>
          <div className="flex justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (isError || !instructor) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/admin/instructors')}
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold">Error al cargar instructor</h1>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-lg font-medium mb-2">No se pudo cargar la información del instructor</h2>
                <p className="text-gray-500 mb-4">Ha ocurrido un error al intentar obtener los datos. Por favor, intenta nuevamente.</p>
                <Button onClick={() => refetch()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/admin/instructors')}
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{instructor.full_name}</h1>
              <p className="text-muted-foreground">
                Instructor desde {formatDate(instructor.created_at)}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <FileEdit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button variant="destructive">
              <Trash className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna izquierda - Información de perfil */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Perfil</CardTitle>
                <CardDescription>Información personal del instructor</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col items-center mb-6">
                  <Avatar className="h-32 w-32 mb-4">
                    <AvatarImage src={instructor.profile_image_url} alt={instructor.full_name} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(instructor.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{instructor.full_name}</h2>
                  <div className="mt-2">
                    {renderStatus(instructor.status)}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{instructor.email}</span>
                    </div>
                  </div>
                  
                  {instructor.phone && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Teléfono</p>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{instructor.phone}</span>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Experiencia</p>
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{instructor.experience_years} {instructor.experience_years === 1 ? 'año' : 'años'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Fecha de registro</p>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{formatDate(instructor.created_at)}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Especialidades</p>
                    <div className="flex flex-wrap">
                      {renderSpecialties(instructor.specialties)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Estadísticas */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-500 mb-1">Actividades</p>
                    <p className="text-2xl font-bold text-blue-600">{assignments?.length || 0}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-500 mb-1">Evaluaciones</p>
                    <p className="text-2xl font-bold text-green-600">{evaluations?.length || 0}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-500 mb-1">Reconocimientos</p>
                    <p className="text-2xl font-bold text-amber-600">{recognitions?.length || 0}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-500 mb-1">Años de exp.</p>
                    <p className="text-2xl font-bold text-purple-600">{instructor.experience_years}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Columna derecha - Tabs con información detallada */}
          <div className="md:col-span-2">
            <Tabs defaultValue="activities">
              <TabsList className="mb-4">
                <TabsTrigger value="activities">
                  <CalendarClock className="h-4 w-4 mr-2" />
                  Actividades
                </TabsTrigger>
                <TabsTrigger value="evaluations">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Evaluaciones
                </TabsTrigger>
                <TabsTrigger value="recognitions">
                  <Award className="h-4 w-4 mr-2" />
                  Reconocimientos
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="activities">
                <InstructorActivitiesList 
                  instructorId={instructorId} 
                  limit={5} 
                  showHeader={false} 
                />
              </TabsContent>
              
              <TabsContent value="evaluations">
                {isLoadingEvaluations ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-center py-4">
                        <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ) : !evaluations || evaluations.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-6">
                        <BookOpen className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No hay evaluaciones disponibles para este instructor.</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {evaluations.map((evaluation: any) => (
                      <Card key={evaluation.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <CardTitle className="text-lg">{evaluation.title || 'Evaluación'}</CardTitle>
                            <Badge>{format(new Date(evaluation.createdAt), 'dd MMM yyyy', { locale: es })}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {evaluation.comments && (
                            <p className="text-gray-700 mb-3">{evaluation.comments}</p>
                          )}
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                            <div className="bg-gray-50 p-2 rounded text-center">
                              <p className="text-xs text-gray-500">Conocimiento</p>
                              <p className="font-bold">{evaluation.knowledge}/5</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded text-center">
                              <p className="text-xs text-gray-500">Comunicación</p>
                              <p className="font-bold">{evaluation.communication}/5</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded text-center">
                              <p className="text-xs text-gray-500">Metodología</p>
                              <p className="font-bold">{evaluation.methodology}/5</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded text-center">
                              <p className="text-xs text-gray-500">Desempeño</p>
                              <p className="font-bold">{evaluation.overallPerformance}/5</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="recognitions">
                {isLoadingRecognitions ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-center py-4">
                        <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ) : !recognitions || recognitions.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-6">
                        <Award className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No hay reconocimientos disponibles para este instructor.</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {recognitions.map((recognition: any) => (
                      <Card key={recognition.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <CardTitle className="text-lg">{recognition.title}</CardTitle>
                            <Badge className="bg-amber-100 text-amber-800">
                              {format(new Date(recognition.issuedAt), 'dd MMM yyyy', { locale: es })}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 mb-3">{recognition.description}</p>
                          {recognition.category && (
                            <Badge variant="outline">{recognition.category}</Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}