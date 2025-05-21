import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Star,
  Award,
  GraduationCap,
  MapPin,
  FileText,
  User,
  Clock,
  Users
} from 'lucide-react';
import { Spinner } from '@/components/Spinner';

interface InstructorProfileDialogProps {
  instructorId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InstructorProfileDialog({
  instructorId,
  open,
  onOpenChange
}: InstructorProfileDialogProps) {
  // Consulta para obtener los datos del instructor
  const { data: instructor, isLoading } = useQuery({
    queryKey: [`/api/instructors/${instructorId}`],
    enabled: open && !!instructorId,
  });

  // Consulta para obtener las asignaciones del instructor
  const { data: assignments } = useQuery({
    queryKey: [`/api/instructors/${instructorId}/assignments`],
    enabled: open && !!instructorId,
  });

  // Consulta para obtener las evaluaciones del instructor
  const { data: evaluations } = useQuery({
    queryKey: [`/api/instructors/${instructorId}/evaluations`],
    enabled: open && !!instructorId,
  });

  // Consulta para obtener los reconocimientos del instructor
  const { data: recognitions } = useQuery({
    queryKey: [`/api/instructors/${instructorId}/recognitions`],
    enabled: open && !!instructorId,
  });

  // Iniciales para avatar fallback
  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Renderizar estrellas para la calificación
  const renderRating = (rating?: number) => {
    if (!rating) return null;
    
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`h-4 w-4 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
        />
      );
    }
    
    return <div className="flex items-center">{stars}</div>;
  };

  // Formato para la fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center h-40">
            <Spinner size="lg" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!instructor) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start mb-4">
            <Avatar className="h-16 w-16 mr-4">
              <AvatarImage src={instructor.profile_image_url || instructor.profileImageUrl} alt={instructor.full_name || instructor.fullName} />
              <AvatarFallback>{getInitials(instructor.full_name || instructor.fullName || '')}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl">{instructor.full_name || instructor.fullName}</DialogTitle>
              <DialogDescription>
                <div className="mt-1 flex items-center space-x-2">
                  <Badge 
                    className={`${
                      (instructor.status || instructor.estado) === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                      (instructor.status || instructor.estado) === 'inactive' ? 'bg-gray-100 text-gray-800 hover:bg-gray-100' : 
                      'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                    }`}
                  >
                    {(instructor.status || instructor.estado) === 'active' ? 'Activo' : 
                     (instructor.status || instructor.estado) === 'inactive' ? 'Inactivo' : 'Pendiente'}
                  </Badge>
                  {(instructor.rating || instructor.calificacion) && (
                    <div className="flex items-center">
                      {renderRating(instructor.rating || instructor.calificacion)}
                    </div>
                  )}
                </div>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="assignments">Asignaciones</TabsTrigger>
            <TabsTrigger value="evaluations">Evaluaciones</TabsTrigger>
            <TabsTrigger value="recognitions">Reconocimientos</TabsTrigger>
          </TabsList>
          
          {/* Pestaña de Perfil */}
          <TabsContent value="profile">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Información Personal</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Correo electrónico</p>
                          <p>{instructor.email || instructor.correo}</p>
                        </div>
                      </div>
                      
                      {(instructor.phone || instructor.telefono) && (
                        <div className="flex items-start">
                          <Phone className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Teléfono</p>
                            <p>{instructor.phone || instructor.telefono}</p>
                          </div>
                        </div>
                      )}

                      {(instructor.date_of_birth || instructor.fechaNacimiento) && (
                        <div className="flex items-start">
                          <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Fecha de nacimiento</p>
                            <p>{formatDate(instructor.date_of_birth || instructor.fechaNacimiento)}</p>
                          </div>
                        </div>
                      )}

                      {(instructor.address || instructor.direccion) && (
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Dirección</p>
                            <p>{instructor.address || instructor.direccion}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Experiencia Profesional</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <Briefcase className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Experiencia</p>
                          <p>{instructor.experience_years || instructor.experienceYears || 0} {(instructor.experience_years || instructor.experienceYears) === 1 ? 'año' : 'años'}</p>
                        </div>
                      </div>
                      
                      {(instructor.specialties || instructor.especialidades) && (
                        <div className="flex items-start">
                          <GraduationCap className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Especialidades</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(instructor.specialties || instructor.especialidades || "").split(',').map((specialty, index) => (
                                <Badge key={index} variant="outline" className="mr-1 mb-1">
                                  {specialty.trim()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {(instructor.biography || instructor.biografia) && (
                        <div className="flex items-start">
                          <FileText className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Biografía</p>
                            <p className="text-sm whitespace-pre-line">{instructor.biography || instructor.biografia}</p>
                          </div>
                        </div>
                      )}
                      
                      {(instructor.created_at || instructor.createdAt) && (
                        <div className="flex items-start">
                          <Clock className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Fecha de registro</p>
                            <p>{formatDate(instructor.created_at || instructor.createdAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Pestaña de Asignaciones */}
          <TabsContent value="assignments">
            <Card>
              <CardContent className="pt-6">
                {assignments && assignments.length > 0 ? (
                  <div className="space-y-4">
                    {/* Usamos un Set para eliminar duplicados basados en ID */}
                    {Array.from(new Map(assignments.map(item => 
                      [item.id, item]
                    )).values()).map((assignment: any) => (
                      <div key={assignment.id} className="border p-3 rounded-md hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{assignment.activity_title || assignment.activityTitle || "Actividad sin título"}</h4>
                            <p className="text-sm text-gray-500">{assignment.park_name || assignment.parkName || "Parque no especificado"}</p>
                            <div className="mt-1 text-sm">
                              <span className="inline-flex items-center mr-3">
                                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                {formatDate(assignment.start_date || assignment.startDate)}
                              </span>
                              <span className="inline-flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-gray-400" />
                                {assignment.status || assignment.estado || "Pendiente"}
                              </span>
                            </div>
                          </div>
                          <Badge 
                            className={`${
                              (assignment.status || assignment.estado) === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                              (assignment.status || assignment.estado) === 'completed' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 
                              'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                            }`}
                          >
                            {(assignment.status || assignment.estado) === 'active' ? 'Activa' : 
                             (assignment.status || assignment.estado) === 'completed' ? 'Completada' : 'Programada'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-500">No hay asignaciones registradas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Pestaña de Evaluaciones */}
          <TabsContent value="evaluations">
            <Card>
              <CardContent className="pt-6">
                {evaluations && evaluations.length > 0 ? (
                  <div className="space-y-4">
                    {evaluations.map((evaluation: any) => (
                      <div key={evaluation.id} className="border p-3 rounded-md hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <h4 className="font-medium">{evaluation.title || 'Evaluación'}</h4>
                              <div className="ml-2">
                                {renderRating(evaluation.rating)}
                              </div>
                            </div>
                            {evaluation.activity_title && (
                              <p className="text-sm text-gray-500">Actividad: {evaluation.activity_title}</p>
                            )}
                            {evaluation.comments && (
                              <p className="mt-2 text-sm whitespace-pre-line">{evaluation.comments}</p>
                            )}
                            <div className="mt-1 text-sm">
                              <span className="inline-flex items-center mr-3">
                                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                {formatDate(evaluation.evaluation_date)}
                              </span>
                              <span className="inline-flex items-center">
                                <User className="h-4 w-4 mr-1 text-gray-400" />
                                {evaluation.evaluator_name}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-500">No hay evaluaciones registradas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Pestaña de Reconocimientos */}
          <TabsContent value="recognitions">
            <Card>
              <CardContent className="pt-6">
                {recognitions && recognitions.length > 0 ? (
                  <div className="space-y-4">
                    {recognitions.map((recognition: any) => (
                      <div key={recognition.id} className="border p-3 rounded-md hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <Award className="h-5 w-5 text-yellow-500 mr-2" />
                              <h4 className="font-medium">{recognition.title}</h4>
                            </div>
                            <p className="mt-2 text-sm whitespace-pre-line">{recognition.description}</p>
                            <div className="mt-2 text-sm">
                              <span className="inline-flex items-center mr-3">
                                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                {formatDate(recognition.award_date)}
                              </span>
                              {recognition.issuing_organization && (
                                <span className="inline-flex items-center">
                                  <Users className="h-4 w-4 mr-1 text-gray-400" />
                                  {recognition.issuing_organization}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-500">No hay reconocimientos registrados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}