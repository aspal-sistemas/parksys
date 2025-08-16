import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, Settings, Star, ThumbsUp, FileText, BarChart, MapPin, Users, Activity, Calendar, Building2, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Schema para el formulario de criterios
const criterioSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  label: z.string().min(2, "La etiqueta debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  fieldType: z.enum(["rating", "boolean", "text"]),
  minValue: z.number().min(1).max(10).default(1),
  maxValue: z.number().min(1).max(10).default(5),
  isRequired: z.boolean().default(true),
  category: z.string().default("experiencia"),
  icon: z.string().default("Star"),
});

type CriterioFormData = z.infer<typeof criterioSchema>;

// Tipos de entidades evaluables
const entityTypes = [
  { id: 'park', name: 'Parques', icon: MapPin, color: 'text-green-600' },
  { id: 'instructor', name: 'Instructores', icon: Users, color: 'text-blue-600' },
  { id: 'volunteer', name: 'Voluntarios', icon: Users, color: 'text-purple-600' },
  { id: 'activity', name: 'Actividades', icon: Activity, color: 'text-orange-600' },
  { id: 'event', name: 'Eventos', icon: Calendar, color: 'text-red-600' },
  { id: 'concessionaire', name: 'Concesionarios', icon: Building2, color: 'text-indigo-600' },
];

const CriteriosEvaluacion = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('criterios');
  const [selectedEntityType, setSelectedEntityType] = useState('park');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener lista de criterios
  const { data: criterios = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/evaluations/criteria'],
  });

  // Obtener criterios asignados para la entidad seleccionada
  const { data: assignedCriteria = [], isLoading: isLoadingAssigned } = useQuery<any[]>({
    queryKey: ['/api/evaluations/criteria', selectedEntityType],
    enabled: !!selectedEntityType,
  });

  // Mutación para crear criterio
  const createMutation = useMutation({
    mutationFn: async (data: CriterioFormData) => {
      const response = await fetch('/api/evaluations/criteria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Error al crear criterio');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/evaluations/criteria'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Criterio creado",
        description: "El criterio se ha creado exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el criterio",
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar criterio
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/evaluations/criteria/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar criterio');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/evaluations/criteria'] });
      toast({
        title: "Criterio eliminado",
        description: "El criterio se ha eliminado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el criterio",
        variant: "destructive",
      });
    },
  });

  const form = useForm<CriterioFormData>({
    resolver: zodResolver(criterioSchema),
    defaultValues: {
      name: "",
      label: "",
      description: "",
      fieldType: "rating",
      minValue: 1,
      maxValue: 5,
      isRequired: true,
      category: "experiencia",
      icon: "Star",
    },
  });

  const onSubmit = (data: CriterioFormData) => {
    createMutation.mutate(data);
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el criterio "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const getFieldTypeLabel = (type: string) => {
    const types = {
      'rating': 'Escala',
      'boolean': 'Sí/No',
      'text': 'Texto libre'
    };
    return types[type as keyof typeof types] || type;
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'rating': return <Star className="h-4 w-4" />;
      case 'boolean': return <ThumbsUp className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      default: return <BarChart className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'experiencia': 'bg-blue-100 text-blue-800',
      'infraestructura': 'bg-green-100 text-green-800',
      'servicio': 'bg-purple-100 text-purple-800',
      'seguridad': 'bg-red-100 text-red-800',
      'accesibilidad': 'bg-yellow-100 text-yellow-800',
      'desempeño': 'bg-indigo-100 text-indigo-800',
      'cumplimiento': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Constructor de Formularios de Evaluación</h1>
          <p className="text-gray-600 mt-2">
            Configure criterios y construya formularios personalizados para cada tipo de evaluación
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Criterio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Criterio</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Criterio</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ej: limpieza_instalaciones" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="label"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Etiqueta</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ej: Limpieza de Instalaciones" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Descripción detallada del criterio..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fieldType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Campo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="rating">Escala (1-5)</SelectItem>
                            <SelectItem value="boolean">Sí/No</SelectItem>
                            <SelectItem value="text">Texto libre</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="experiencia">Experiencia</SelectItem>
                            <SelectItem value="infraestructura">Infraestructura</SelectItem>
                            <SelectItem value="servicio">Servicio</SelectItem>
                            <SelectItem value="seguridad">Seguridad</SelectItem>
                            <SelectItem value="accesibilidad">Accesibilidad</SelectItem>
                            <SelectItem value="desempeño">Desempeño</SelectItem>
                            <SelectItem value="cumplimiento">Cumplimiento</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch('fieldType') === 'rating' && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="minValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Mínimo</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} min={1} max={10} 
                              onChange={e => field.onChange(parseInt(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Máximo</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} min={1} max={10}
                              onChange={e => field.onChange(parseInt(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creando...' : 'Crear Criterio'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="criterios">Gestión de Criterios</TabsTrigger>
          <TabsTrigger value="formularios">Constructor de Formularios</TabsTrigger>
        </TabsList>

        {/* Tab de Gestión de Criterios */}
        <TabsContent value="criterios" className="space-y-6">
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{criterios.length || 0}</div>
                <div className="text-sm text-gray-600">Criterios Totales</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {criterios.filter((c: any) => c.fieldType === 'rating').length || 0}
                </div>
                <div className="text-sm text-gray-600">Tipo Escala</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {criterios.filter((c: any) => c.fieldType === 'boolean').length || 0}
                </div>
                <div className="text-sm text-gray-600">Tipo Sí/No</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {criterios.filter((c: any) => c.fieldType === 'text').length || 0}
                </div>
                <div className="text-sm text-gray-600">Tipo Texto</div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Criterios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Biblioteca de Criterios
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">Cargando criterios...</div>
              ) : criterios.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay criterios configurados.</p>
                  <p className="text-sm">Crea el primer criterio para comenzar.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {criterios.map((criterio: any) => (
                    <div key={criterio.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getFieldTypeIcon(criterio.fieldType)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{criterio.label}</h4>
                          <p className="text-sm text-gray-600">{criterio.description || criterio.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {getFieldTypeLabel(criterio.fieldType)}
                            </Badge>
                            <Badge className={`text-xs ${getCategoryColor(criterio.category)}`}>
                              {criterio.category}
                            </Badge>
                            {criterio.fieldType === 'rating' && (
                              <Badge variant="outline" className="text-xs">
                                {criterio.minValue}-{criterio.maxValue}
                              </Badge>
                            )}
                            {criterio.isRequired && (
                              <Badge variant="outline" className="text-xs text-red-600">
                                Requerido
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(criterio.id, criterio.label)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Constructor de Formularios */}
        <TabsContent value="formularios" className="space-y-6">
          {/* Selector de tipo de entidad */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {entityTypes.map((entityType) => (
              <Card 
                key={entityType.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedEntityType === entityType.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedEntityType(entityType.id)}
              >
                <CardContent className="p-4 text-center">
                  <entityType.icon className={`h-8 w-8 mx-auto mb-2 ${entityType.color}`} />
                  <div className="text-sm font-medium">{entityType.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Constructor de formulario para la entidad seleccionada */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Formulario para {entityTypes.find(e => e.id === selectedEntityType)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedEntityType === 'park' ? (
                <div className="space-y-6">
                  {/* Formulario oficial existente */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                        <MapPin className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-green-800">Formulario Oficial de Evaluación de Parques</h3>
                        <p className="text-sm text-green-600">Sistema activo y funcional</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-green-100">
                        <h4 className="font-medium text-gray-900 mb-2">Características del formulario:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Evaluación integral de experiencia del visitante</li>
                          <li>• Criterios de limpieza, seguridad, y accesibilidad</li>
                          <li>• Sistema de calificación por estrellas</li>
                          <li>• Comentarios y sugerencias</li>
                          <li>• Geolocalización automática</li>
                        </ul>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button 
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                          onClick={() => window.open('/parque/bosque-los-colomos-5/evaluar', '_blank')}
                        >
                          <Star className="h-4 w-4" />
                          Ver Formulario Oficial
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
                          onClick={() => window.open('/parque/bosque-los-colomos-5/evaluaciones', '_blank')}
                        >
                          <BarChart className="h-4 w-4" />
                          Ver Evaluaciones
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Constructor personalizado */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                        <Settings className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-blue-800">Constructor de Formularios Personalizados</h3>
                        <p className="text-sm text-blue-600">Próximamente disponible</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <p className="text-sm text-gray-600 mb-3">
                        Funcionalidades en desarrollo para crear formularios personalizados:
                      </p>
                      <ul className="text-sm text-gray-500 space-y-1">
                        <li>• Selección de criterios específicos de la biblioteca</li>
                        <li>• Configuración de pesos y prioridades</li>
                        <li>• Personalización de escalas de calificación</li>
                        <li>• Exportación e integración con formulario oficial</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Constructor de formularios específicos en desarrollo.</p>
                  <p className="text-sm">
                    Aquí podrás seleccionar y organizar los criterios para el tipo de evaluación seleccionado.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CriteriosEvaluacion;