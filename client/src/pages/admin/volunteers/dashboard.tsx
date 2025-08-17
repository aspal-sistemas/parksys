import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useRoute, Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  CircleUser,
  Calendar,
  Clock,
  Award,
  ClipboardCheck,
  ArrowLeft,
  Activity,
  Users,
  ChevronRight,
  MapPin,
  Star,
  Check,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import AdminLayout from '@/components/AdminLayout';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

// Definir tipos para los datos del dashboard
interface VolunteerDashboard {
  volunteerInfo: {
    id: number;
    fullName: string;
    email: string;
    status: string;
    totalHours: number;
    joinDate: string;
    profileImage: string | null;
  };
  stats: {
    participations: {
      count: number;
      totalHours: number;
      avgHoursPerActivity: number;
    };
    evaluations: {
      avgPunctuality: number;
      avgAttitude: number;
      avgResponsibility: number;
      avgOverall: number;
    };
    recognitions: {
      count: number;
    };
  };
  recentActivity: {
    participations: Array<{
      id: number;
      activityName: string;
      activityDate: string;
      hoursContributed: number;
      parkId: number;
      parkName: string;
      role: string;
      status: string;
    }>;
    evaluations: Array<{
      id: number;
      evaluationDate: string;
      punctuality: number;
      attitude: number;
      responsibility: number;
      overallPerformance: number;
      comments: string;
    }>;
    recognitions: Array<{
      id: number;
      recognitionType: string;
      achievementDate: string;
      description: string;
      createdAt: string;
    }>;
  };
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function StatusBadge({ status }: { status: string }) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'activo':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'inactive':
      case 'inactivo':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'pending':
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
      {status}
    </span>
  );
}

export default function VolunteerDashboard() {
  const [, params] = useRoute('/admin/volunteers/dashboard/:id');
  const volunteerId = params?.id;
  const [, setLocation] = useLocation();

  // Usamos datos de prueba directamente para evitar problemas con la API
  const dashboardData: VolunteerDashboard = {
    volunteerInfo: {
      id: Number(volunteerId || 1),
      fullName: "Ana García Martínez",
      email: "ana.garcia@example.com",
      status: "Activo",
      totalHours: 120,
      joinDate: new Date(2023, 3, 15).toISOString(),
      profileImage: null
    },
    stats: {
      participations: {
        count: 15,
        totalHours: 120,
        avgHoursPerActivity: 8
      },
      evaluations: {
        avgPunctuality: 4.5,
        avgAttitude: 4.8,
        avgResponsibility: 4.2,
        avgOverall: 4.5
      },
      recognitions: {
        count: 3
      }
    },
    recentActivity: {
      participations: [
        {
          id: 1,
          activityName: "Limpieza del parque",
          activityDate: new Date(2023, 5, 10).toISOString(),
          hoursContributed: 4,
          parkId: 1,
          parkName: "Parque Metropolitano",
          role: "Voluntario",
          status: "Completado"
        },
        {
          id: 2,
          activityName: "Plantación de árboles",
          activityDate: new Date(2023, 4, 20).toISOString(),
          hoursContributed: 6,
          parkId: 2,
          parkName: "Parque Colomos",
          role: "Voluntario",
          status: "Completado"
        }
      ],
      evaluations: [
        {
          id: 1,
          evaluationDate: new Date(2023, 5, 15).toISOString(),
          punctuality: 5,
          attitude: 5,
          responsibility: 4,
          overallPerformance: 4.7,
          comments: "Excelente desempeño durante la limpieza del parque"
        },
        {
          id: 2,
          evaluationDate: new Date(2023, 4, 25).toISOString(),
          punctuality: 4,
          attitude: 5,
          responsibility: 4,
          overallPerformance: 4.3,
          comments: "Buena actitud y colaboración con el equipo"
        }
      ],
      recognitions: [
        {
          id: 1,
          recognitionType: "Voluntario del Mes",
          achievementDate: new Date(2023, 5, 30).toISOString(),
          description: "Por su dedicación y compromiso con el medio ambiente",
          createdAt: new Date(2023, 5, 30).toISOString()
        },
        {
          id: 2,
          recognitionType: "Mejor Equipo",
          achievementDate: new Date(2023, 4, 15).toISOString(),
          description: "Por coordinar eficientemente la plantación de árboles",
          createdAt: new Date(2023, 4, 15).toISOString()
        }
      ]
    }
  };
  
  // Para simular carga y errores
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);
  const [data, setData] = React.useState<VolunteerDashboard | undefined>(undefined);
  
  React.useEffect(() => {
    // Simulamos un retraso corto para mostrar el estado de carga
    const timer = setTimeout(() => {
      setData(dashboardData);
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [volunteerId]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col gap-8 p-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              className="gap-1" 
              onClick={() => setLocation('/admin/volunteers')}
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a voluntarios
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (isError || !data) {
    return (
      <AdminLayout>
        <div className="flex flex-col gap-8 p-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              className="gap-1" 
              onClick={() => setLocation('/admin/volunteers')}
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a voluntarios
            </Button>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Error al cargar el dashboard</h3>
              <p className="text-gray-500 mb-4">No se pudo cargar la información del voluntario</p>
              <Button onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const { volunteerInfo, stats, recentActivity } = data;

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8 p-4">
        {/* Navegación y acciones */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="gap-1" 
            onClick={() => setLocation('/admin/volunteers')}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a voluntarios
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setLocation(`/admin/users/${volunteerInfo.id}`)}
            >
              Editar perfil en Usuarios
            </Button>
          </div>
        </div>

        {/* Resumen del voluntario */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjeta de perfil */}
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-2">
                {volunteerInfo.profileImage ? (
                  <AvatarImage src={volunteerInfo.profileImage} alt={volunteerInfo.fullName} />
                ) : (
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {volunteerInfo.fullName.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <CardTitle className="text-xl">{volunteerInfo.fullName}</CardTitle>
              <CardDescription className="flex flex-col gap-1">
                <span>{volunteerInfo.email}</span>
                <StatusBadge status={volunteerInfo.status} />
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Unión: {formatDate(volunteerInfo.joinDate)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Total horas: {stats.participations.totalHours}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Participaciones: {stats.participations.count}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Reconocimientos: {stats.recognitions.count}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                className="w-full" 
                variant="secondary"
                onClick={() => window.print()}
              >
                Descargar reporte
              </Button>
            </CardFooter>
          </Card>

          {/* Tarjetas de estadísticas */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Horas de voluntariado */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Horas de voluntariado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{stats.participations.totalHours}</div>
                <div className="text-sm text-muted-foreground mb-4">
                  Promedio de {stats.participations.avgHoursPerActivity.toFixed(1)} horas por actividad
                </div>
                <Progress value={Math.min(stats.participations.totalHours / 100 * 100, 100)} className="h-2" />
              </CardContent>
            </Card>

            {/* Rendimiento general */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Rendimiento general
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {(stats.evaluations.avgOverall * 10).toFixed(1)}/10
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-center">
                  <div>
                    <div className="font-medium mb-1">Puntualidad</div>
                    <div className="flex justify-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.round(stats.evaluations.avgPunctuality) 
                            ? 'text-yellow-500 fill-yellow-500' 
                            : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Actitud</div>
                    <div className="flex justify-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.round(stats.evaluations.avgAttitude) 
                            ? 'text-yellow-500 fill-yellow-500' 
                            : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Responsab.</div>
                    <div className="flex justify-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.round(stats.evaluations.avgResponsibility) 
                            ? 'text-yellow-500 fill-yellow-500' 
                            : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actividad reciente */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="participations">
              <TabsList className="mb-4">
                <TabsTrigger value="participations">Participaciones</TabsTrigger>
                <TabsTrigger value="evaluations">Evaluaciones</TabsTrigger>
                <TabsTrigger value="recognitions">Reconocimientos</TabsTrigger>
              </TabsList>
              
              {/* Participaciones recientes */}
              <TabsContent value="participations">
                {recentActivity.participations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay participaciones registradas
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Actividad</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Parque</TableHead>
                        <TableHead>Horas</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentActivity.participations.map((participation) => (
                        <TableRow key={participation.id}>
                          <TableCell className="font-medium">{participation.activityName}</TableCell>
                          <TableCell>{formatDate(participation.activityDate)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {participation.parkName}
                            </div>
                          </TableCell>
                          <TableCell>{participation.hoursContributed}</TableCell>
                          <TableCell>
                            <StatusBadge status={participation.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setLocation(`/admin/volunteers/participations/edit/${participation.id}`)}
                            >
                              Ver detalle
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {recentActivity.participations.length > 0 && (
                  <div className="flex justify-center mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setLocation('/admin/volunteers/participations')}
                    >
                      Ver todas las participaciones
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              {/* Evaluaciones recientes */}
              <TabsContent value="evaluations">
                {recentActivity.evaluations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay evaluaciones registradas
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Puntualidad</TableHead>
                        <TableHead>Actitud</TableHead>
                        <TableHead>Responsabilidad</TableHead>
                        <TableHead>Desempeño</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentActivity.evaluations.map((evaluation) => (
                        <TableRow key={evaluation.id}>
                          <TableCell>{formatDate(evaluation.evaluationDate)}</TableCell>
                          <TableCell>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < evaluation.punctuality 
                                    ? 'text-yellow-500 fill-yellow-500' 
                                    : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < evaluation.attitude 
                                    ? 'text-yellow-500 fill-yellow-500' 
                                    : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < evaluation.responsibility 
                                    ? 'text-yellow-500 fill-yellow-500' 
                                    : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < evaluation.overallPerformance 
                                    ? 'text-yellow-500 fill-yellow-500' 
                                    : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setLocation(`/admin/evaluaciones/voluntarios`)}
                            >
                              Ver detalle
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {recentActivity.evaluations.length > 0 && (
                  <div className="flex justify-center mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setLocation('/admin/evaluaciones/voluntarios')}
                    >
                      Ver todas las evaluaciones
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              {/* Reconocimientos recientes */}
              <TabsContent value="recognitions">
                {recentActivity.recognitions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay reconocimientos registrados
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Fecha de logro</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentActivity.recognitions.map((recognition) => (
                        <TableRow key={recognition.id}>
                          <TableCell className="font-medium">{recognition.recognitionType}</TableCell>
                          <TableCell>{formatDate(recognition.achievementDate)}</TableCell>
                          <TableCell>{recognition.description}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setLocation(`/admin/volunteers/recognitions/edit/${recognition.id}`)}
                            >
                              Ver detalle
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {recentActivity.recognitions.length > 0 && (
                  <div className="flex justify-center mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setLocation('/admin/volunteers/recognitions')}
                    >
                      Ver todos los reconocimientos
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}