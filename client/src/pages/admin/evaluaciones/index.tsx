import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Eye,
  Search,
  RefreshCw,
  User,
  AlertCircle,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../../../hooks/useAuth';

export default function EvaluacionesPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Obtener información del usuario autenticado
  const { user, isAuthenticated } = useAuth();
  const isSupervisor = user && user.role === 'supervisor';
  
  // Consulta para obtener todas las evaluaciones
  const { 
    data: evaluationData, 
    isLoading, 
    isError,
    refetch
  } = useQuery({
    // Si es supervisor, filtramos por su ID
    queryKey: [isSupervisor && user ? `/api/instructors-evaluations?evaluatorId=${user.id}` : '/api/instructors-evaluations'],
  });
  
  const evaluations = evaluationData || [];

  // Formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Filtrar evaluaciones
  const filteredEvaluations = Array.isArray(evaluations) 
    ? evaluations.filter((evaluation: any) => {
        const matchesSearch = 
          evaluation.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          evaluation.activity_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          evaluation.comments?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesSearch;
      })
    : [];

  // Calcular promedio de evaluación
  const calculateAverage = (evaluation: any) => {
    const scores = [
      evaluation.knowledge,
      evaluation.communication,
      evaluation.methodology,
      evaluation.overall_performance
    ].filter(Boolean);
    
    if (scores.length === 0) return 0;
    return scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
  };

  // Estilo basado en puntuación
  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'bg-green-100 text-green-800';
    if (score >= 3.5) return 'bg-blue-100 text-blue-800';
    if (score >= 2.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };
  
  // Agrupar evaluaciones por instructor
  const evaluationsByInstructor: Record<string, any[]> = {};
  filteredEvaluations.forEach((evaluation: any) => {
    const instructorId = evaluation.instructor_id;
    if (!instructorId) return;
    
    if (!evaluationsByInstructor[instructorId]) {
      evaluationsByInstructor[instructorId] = [];
    }
    evaluationsByInstructor[instructorId].push(evaluation);
  });

  // Estadísticas para el panel de control
  const totalEvaluations = filteredEvaluations.length;
  const averageScore = filteredEvaluations.length > 0 
    ? filteredEvaluations.reduce((sum: number, eval: any) => sum + calculateAverage(eval), 0) / filteredEvaluations.length
    : 0;
  const instructorsEvaluated = Object.keys(evaluationsByInstructor).length;
  const recentEvaluations = filteredEvaluations.slice(0, 5);
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Evaluaciones de Instructores</h1>
            <p className="text-muted-foreground">
              Gestión y seguimiento de evaluaciones
            </p>
          </div>
          <div className="flex justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (isError) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Evaluaciones de Instructores</h1>
            <p className="text-muted-foreground">
              Gestión y seguimiento de evaluaciones
            </p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-lg font-medium mb-2">Error al cargar evaluaciones</h2>
                <p className="text-gray-500 mb-4">Ha ocurrido un error al intentar obtener las evaluaciones. Por favor, intenta nuevamente.</p>
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
        {isSupervisor && (
          <Card className="mb-6 border-teal-200 bg-teal-50">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="p-3 bg-teal-100 rounded-full">
                  <User className="h-6 w-6 text-teal-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-teal-800 mb-1">
                    Bienvenido, Supervisor de Instructores
                  </h3>
                  <p className="text-teal-700 mb-2">
                    Tu rol te permite evaluar a los instructores y revisar su desempeño. Desde aquí puedes ver todas las evaluaciones que has realizado.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline" 
                      className="border-teal-300 text-teal-700 hover:bg-teal-100"
                      onClick={() => setLocation('/admin/instructors')}
                    >
                      Ver listado de instructores
                    </Button>
                    <Button
                      className="bg-teal-600 hover:bg-teal-700"
                      onClick={() => setLocation('/admin/instructors')}
                    >
                      Crear nueva evaluación
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Evaluaciones de Instructores</h1>
            <p className="text-muted-foreground">
              {isSupervisor 
                ? "Gestión de tus evaluaciones como supervisor" 
                : "Gestión y seguimiento de todas las evaluaciones"}
            </p>
          </div>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar datos
          </Button>
        </div>

        <Tabs defaultValue="dashboard">
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Panel de Control
            </TabsTrigger>
            <TabsTrigger value="all-evaluations">
              <FileText className="h-4 w-4 mr-2" />
              Todas las Evaluaciones
            </TabsTrigger>
            <TabsTrigger value="by-instructor">
              <User className="h-4 w-4 mr-2" />
              Por Instructor
            </TabsTrigger>
          </TabsList>
          
          {/* Panel de Control */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Total de Evaluaciones</CardTitle>
                  <CardDescription>Evaluaciones registradas en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalEvaluations}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Instructores Evaluados</CardTitle>
                  <CardDescription>Número de instructores diferentes evaluados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{instructorsEvaluated}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Puntuación Promedio</CardTitle>
                  <CardDescription>Evaluación promedio de los instructores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{averageScore.toFixed(1)}/5</div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Evaluaciones Recientes</CardTitle>
                <CardDescription>Últimas 5 evaluaciones registradas</CardDescription>
              </CardHeader>
              <CardContent>
                {recentEvaluations.length > 0 ? (
                  <div className="space-y-4">
                    {recentEvaluations.map((evaluation: any) => (
                      <div key={evaluation.id} className="border rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <div className="font-medium">{evaluation.instructor_name}</div>
                          <Badge variant="outline">{formatDate(evaluation.created_at)}</Badge>
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          {evaluation.activity_title || 'Actividad no especificada'}
                        </div>
                        <div className="grid grid-cols-4 gap-2 mb-2">
                          <div className="bg-gray-50 p-1 rounded text-center text-xs">
                            <div className="text-gray-500">Conocimiento</div>
                            <div className="font-bold">{evaluation.knowledge}/5</div>
                          </div>
                          <div className="bg-gray-50 p-1 rounded text-center text-xs">
                            <div className="text-gray-500">Comunicación</div>
                            <div className="font-bold">{evaluation.communication}/5</div>
                          </div>
                          <div className="bg-gray-50 p-1 rounded text-center text-xs">
                            <div className="text-gray-500">Metodología</div>
                            <div className="font-bold">{evaluation.methodology}/5</div>
                          </div>
                          <div className="bg-gray-50 p-1 rounded text-center text-xs">
                            <div className="text-gray-500">Global</div>
                            <div className="font-bold">{evaluation.overall_performance}/5</div>
                          </div>
                        </div>
                        {evaluation.comments && (
                          <div className="text-sm italic">"{evaluation.comments}"</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No hay evaluaciones disponibles
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Todas las Evaluaciones */}
          <TabsContent value="all-evaluations">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Listado de Evaluaciones</CardTitle>
                    <CardDescription>Todas las evaluaciones de instructores</CardDescription>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar evaluaciones..."
                        className="pl-8 w-full md:w-[250px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredEvaluations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Instructor</TableHead>
                          <TableHead>Actividad</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Puntuación</TableHead>
                          <TableHead>Evaluador</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEvaluations.map((evaluation: any) => {
                          const averageScore = calculateAverage(evaluation);
                          return (
                            <TableRow key={evaluation.id}>
                              <TableCell className="font-medium">{evaluation.instructor_name}</TableCell>
                              <TableCell>{evaluation.activity_title || 'N/A'}</TableCell>
                              <TableCell>{formatDate(evaluation.created_at)}</TableCell>
                              <TableCell>
                                <Badge className={getScoreColor(averageScore)}>
                                  {averageScore.toFixed(1)}/5
                                </Badge>
                              </TableCell>
                              <TableCell>{evaluation.evaluator_name || 'Anónimo'}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setLocation(`/admin/instructors/${evaluation.instructor_id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron evaluaciones con los filtros aplicados
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Por Instructor */}
          <TabsContent value="by-instructor">
            {Object.keys(evaluationsByInstructor).length > 0 ? (
              <div className="space-y-6">
                {Object.keys(evaluationsByInstructor).map((instructorId) => {
                  const instructorEvaluations = evaluationsByInstructor[instructorId];
                  const instructor = instructorEvaluations[0]; // Tomamos el primer registro para datos del instructor
                  
                  // Cálculo de estadísticas por instructor
                  const totalScore = instructorEvaluations.reduce((sum: number, eval: any) => sum + calculateAverage(eval), 0);
                  const avgScore = totalScore / instructorEvaluations.length;
                  
                  return (
                    <Card key={instructorId}>
                      <CardHeader>
                        <div className="flex justify-between">
                          <div>
                            <CardTitle>
                              {instructor.instructor_name}
                            </CardTitle>
                            <CardDescription>
                              {instructorEvaluations.length} {instructorEvaluations.length === 1 ? 'evaluación' : 'evaluaciones'}
                            </CardDescription>
                          </div>
                          <Badge className={getScoreColor(avgScore)}>
                            {avgScore.toFixed(1)}/5
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {instructorEvaluations.map((evaluation: any) => (
                            <div key={evaluation.id} className="border p-3 rounded-md">
                              <div className="flex justify-between mb-2">
                                <div className="font-medium">{evaluation.activity_title || 'Actividad no especificada'}</div>
                                <div className="text-sm text-gray-500">{formatDate(evaluation.created_at)}</div>
                              </div>
                              
                              <div className="grid grid-cols-4 gap-2 mb-2">
                                <div className="bg-gray-50 p-1 rounded text-center text-xs">
                                  <div className="text-gray-500">Conocimiento</div>
                                  <div className="font-bold">{evaluation.knowledge}/5</div>
                                </div>
                                <div className="bg-gray-50 p-1 rounded text-center text-xs">
                                  <div className="text-gray-500">Comunicación</div>
                                  <div className="font-bold">{evaluation.communication}/5</div>
                                </div>
                                <div className="bg-gray-50 p-1 rounded text-center text-xs">
                                  <div className="text-gray-500">Metodología</div>
                                  <div className="font-bold">{evaluation.methodology}/5</div>
                                </div>
                                <div className="bg-gray-50 p-1 rounded text-center text-xs">
                                  <div className="text-gray-500">Global</div>
                                  <div className="font-bold">{evaluation.overall_performance}/5</div>
                                </div>
                              </div>
                              
                              {evaluation.comments && (
                                <div className="text-sm italic mt-2">"{evaluation.comments}"</div>
                              )}
                              
                              <div className="mt-3 text-xs text-gray-500">
                                Evaluado por: {evaluation.evaluator_name || 'Anónimo'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron evaluaciones para mostrar por instructor
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}