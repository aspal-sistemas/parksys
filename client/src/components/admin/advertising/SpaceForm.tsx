import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Plus, Upload, Image, Video, Carousel, FileText } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const spaceSchema = z.object({
  page_type: z.string().min(1, 'Tipo de página es requerido'),
  position: z.string().min(1, 'Posición es requerida'),
  page_identifier: z.string().optional(),
  name: z.string().min(1, 'Nombre es requerido'),
  description: z.string().optional(),
  width: z.number().min(1, 'Ancho es requerido'),
  height: z.number().min(1, 'Alto es requerido'),
  category: z.string().min(1, 'Categoría es requerida'),
  is_active: z.boolean(),
});

type SpaceFormData = z.infer<typeof spaceSchema>;

interface SpaceFormProps {
  space?: any;
  onSave: (data: SpaceFormData) => void;
  onCancel: () => void;
}

const SpaceForm: React.FC<SpaceFormProps> = ({ space, onSave, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SpaceFormData>({
    resolver: zodResolver(spaceSchema),
    defaultValues: {
      page_type: space?.page_type || '',
      position: space?.position || '',
      page_identifier: space?.page_identifier || '',
      name: space?.name || '',
      description: space?.description || '',
      width: space?.width || 300,
      height: space?.height || 250,
      category: space?.category || '',
      is_active: space?.is_active ?? true,
    },
  });

  const watchedPageType = watch('page_type');
  const watchedPosition = watch('position');
  const watchedCategory = watch('category');

  const pageTypes = [
    { value: 'homepage', label: 'Página Principal', icon: '🏠' },
    { value: 'parks', label: 'Parques', icon: '🌳' },
    { value: 'activities', label: 'Actividades', icon: '🎯' },
    { value: 'concessions', label: 'Concesiones', icon: '🏪' },
    { value: 'instructors', label: 'Instructores', icon: '👨‍🏫' },
    { value: 'volunteers', label: 'Voluntarios', icon: '🤝' },
    { value: 'tree-species', label: 'Especies Arbóreas', icon: '🌲' },
  ];

  const positions = [
    { value: 'header', label: 'Cabecera', description: 'Parte superior de la página' },
    { value: 'sidebar', label: 'Barra lateral', description: 'Lateral derecho/izquierdo' },
    { value: 'footer', label: 'Pie de página', description: 'Parte inferior' },
    { value: 'hero', label: 'Hero/Banner', description: 'Sección principal destacada' },
    { value: 'profile', label: 'Perfil', description: 'Dentro de perfiles individuales' },
  ];

  const categories = [
    { value: 'institutional', label: 'Institucional', color: 'bg-blue-100 text-blue-800' },
    { value: 'commercial', label: 'Comercial', color: 'bg-green-100 text-green-800' },
  ];

  const onSubmit = async (data: SpaceFormData) => {
    setIsSubmitting(true);
    try {
      const method = space ? 'PUT' : 'POST';
      const url = space 
        ? `/api/advertising-management/spaces/${space.id}`
        : '/api/advertising-management/spaces';
      
      await apiRequest(url, method, data);
      
      toast({ 
        title: `Espacio ${space ? 'actualizado' : 'creado'} correctamente`,
        description: `El espacio "${data.name}" ha sido ${space ? 'actualizado' : 'creado'} exitosamente.`
      });
      
      onSave(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Hubo un error al procesar la solicitud',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Información Básica</TabsTrigger>
          <TabsTrigger value="preview">Vista Previa</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del Espacio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre del Espacio *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Ej: Sidebar Principal - Parques"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="page_type">Tipo de Página *</Label>
                  <Select
                    value={watchedPageType}
                    onValueChange={(value) => setValue('page_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar página" />
                    </SelectTrigger>
                    <SelectContent>
                      {pageTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.page_type && (
                    <p className="text-sm text-red-600">{errors.page_type.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">Posición *</Label>
                  <Select
                    value={watchedPosition}
                    onValueChange={(value) => setValue('position', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar posición" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map(pos => (
                        <SelectItem key={pos.value} value={pos.value}>
                          <div>
                            <div className="font-medium">{pos.label}</div>
                            <div className="text-sm text-gray-600">{pos.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.position && (
                    <p className="text-sm text-red-600">{errors.position.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    value={watchedCategory}
                    onValueChange={(value) => setValue('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={cat.color}>{cat.label}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="page_identifier">Identificador de Página</Label>
                <Input
                  id="page_identifier"
                  {...register('page_identifier')}
                  placeholder="Ej: park-detail, activity-list (opcional)"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Específica una página particular dentro del tipo seleccionado
                </p>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe el propósito y ubicación de este espacio..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="width">Ancho (px) *</Label>
                  <Input
                    id="width"
                    type="number"
                    min="1"
                    {...register('width', { valueAsNumber: true })}
                  />
                  {errors.width && (
                    <p className="text-sm text-red-600">{errors.width.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="height">Alto (px) *</Label>
                  <Input
                    id="height"
                    type="number"
                    min="1"
                    {...register('height', { valueAsNumber: true })}
                  />
                  {errors.height && (
                    <p className="text-sm text-red-600">{errors.height.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_active">Estado Activo</Label>
                  <p className="text-sm text-gray-600">
                    Espacios activos pueden recibir anuncios
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={watch('is_active')}
                  onCheckedChange={(checked) => setValue('is_active', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa del Espacio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-blue-100 text-blue-800">
                      {watchedPageType || 'Sin página'}
                    </Badge>
                    <Badge className="bg-green-100 text-green-800">
                      {watchedPosition || 'Sin posición'}
                    </Badge>
                    {watchedCategory && (
                      <Badge className={categories.find(c => c.value === watchedCategory)?.color || 'bg-gray-100 text-gray-800'}>
                        {categories.find(c => c.value === watchedCategory)?.label || watchedCategory}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      <strong>Dimensiones:</strong> {watch('width') || 0} x {watch('height') || 0} px
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Identificador:</strong> {watch('page_identifier') || 'No especificado'}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Estado:</strong> {watch('is_active') ? 'Activo' : 'Inactivo'}
                    </div>
                  </div>

                  {watch('width') && watch('height') && (
                    <div className="mt-4">
                      <div className="text-sm text-gray-600 mb-2">Simulación del espacio:</div>
                      <div 
                        className="border-2 border-dashed border-gray-300 bg-gray-100 flex items-center justify-center text-gray-500 text-sm"
                        style={{
                          width: `${Math.min(watch('width') || 300, 400)}px`,
                          height: `${Math.min(watch('height') || 250, 200)}px`,
                        }}
                      >
                        Espacio Publicitario
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          className="bg-[#00a587] hover:bg-[#067f5f]"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : (space ? 'Actualizar' : 'Crear')} Espacio
        </Button>
      </div>
    </form>
  );
};

export default SpaceForm;