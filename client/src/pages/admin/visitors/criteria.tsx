import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, safeApiRequest } from '@/lib/queryClient';
import AdminLayout from '@/components/AdminLayout';
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical, 
  Settings, 
  Star, 
  Type, 
  CheckCircle,
  Sparkles,
  Shield,
  Wrench,
  MapPin,
  Calendar,
  Users,
  Leaf
} from 'lucide-react';

// Tipos para criterios de evaluación
interface EvaluationCriteria {
  id: number;
  name: string;
  label: string;
  description: string;
  fieldType: 'rating' | 'boolean' | 'text';
  minValue: number;
  maxValue: number;
  isRequired: boolean;
  isActive: boolean;
  sortOrder: number;
  icon: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface CriteriaFormData {
  name: string;
  label: string;
  description: string;
  fieldType: 'rating' | 'boolean' | 'text';
  minValue: number;
  maxValue: number;
  isRequired: boolean;
  isActive: boolean;
  sortOrder: number;
  icon: string;
  category: string;
}

const iconOptions = [
  { value: 'Sparkles', label: 'Limpieza', icon: Sparkles },
  { value: 'Shield', label: 'Seguridad', icon: Shield },
  { value: 'Wrench', label: 'Mantenimiento', icon: Wrench },
  { value: 'MapPin', label: 'Ubicación/Amenidades', icon: MapPin },
  { value: 'Calendar', label: 'Actividades', icon: Calendar },
  { value: 'Users', label: 'Personal', icon: Users },
  { value: 'Leaf', label: 'Naturaleza', icon: Leaf },
  { value: 'Star', label: 'Calidad', icon: Star },
  { value: 'CheckCircle', label: 'Satisfacción', icon: CheckCircle },
  { value: 'Type', label: 'Información', icon: Type },
];

const categoryOptions = [
  { value: 'infraestructura', label: 'Infraestructura', color: 'bg-blue-100 text-blue-800' },
  { value: 'seguridad', label: 'Seguridad', color: 'bg-red-100 text-red-800' },
  { value: 'servicios', label: 'Servicios', color: 'bg-green-100 text-green-800' },
  { value: 'accesibilidad', label: 'Accesibilidad', color: 'bg-purple-100 text-purple-800' },
  { value: 'ambiente', label: 'Ambiente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'experiencia', label: 'Experiencia', color: 'bg-pink-100 text-pink-800' },
];

const CriteriaForm: React.FC<{
  criteria?: EvaluationCriteria;
  onSubmit: (data: CriteriaFormData) => void;
  onCancel: () => void;
}> = ({ criteria, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CriteriaFormData>({
    name: criteria?.name || '',
    label: criteria?.label || '',
    description: criteria?.description || '',
    fieldType: criteria?.fieldType || 'rating',
    minValue: criteria?.minValue || 1,
    maxValue: criteria?.maxValue || 5,
    isRequired: criteria?.isRequired !== undefined ? criteria.isRequired : true,
    isActive: criteria?.isActive !== undefined ? criteria.isActive : true,
    sortOrder: criteria?.sortOrder || 0,
    icon: criteria?.icon || 'Star',
    category: criteria?.category || 'experiencia',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(opt => opt.value === iconName);
    if (iconOption) {
      const IconComponent = iconOption.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <Star className="h-4 w-4" />;
  };

  const getCategoryBadge = (category: string) => {
    const categoryOption = categoryOptions.find(opt => opt.value === category);
    if (categoryOption) {
      return <Badge className={categoryOption.color}>{categoryOption.label}</Badge>;
    }
    return <Badge>Sin categoría</Badge>;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nombre técnico</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="ej: cleanliness"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Identificador único en minúsculas (sin espacios)
          </p>
        </div>

        <div>
          <Label htmlFor="label">Etiqueta</Label>
          <Input
            id="label"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            placeholder="ej: Limpieza"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Texto visible en el formulario
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe qué evalúa este criterio..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="fieldType">Tipo de campo</Label>
          <Select 
            value={formData.fieldType} 
            onValueChange={(value: 'rating' | 'boolean' | 'text') => setFormData({ ...formData, fieldType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Calificación (1-5 estrellas)</SelectItem>
              <SelectItem value="boolean">Sí/No</SelectItem>
              <SelectItem value="text">Texto libre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="icon">Icono</Label>
          <Select 
            value={formData.icon} 
            onValueChange={(value) => setFormData({ ...formData, icon: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {iconOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category">Categoría</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.fieldType === 'rating' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="minValue">Valor mínimo</Label>
            <Input
              id="minValue"
              type="number"
              min="1"
              max="10"
              value={formData.minValue}
              onChange={(e) => setFormData({ ...formData, minValue: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="maxValue">Valor máximo</Label>
            <Input
              id="maxValue"
              type="number"
              min="1"
              max="10"
              value={formData.maxValue}
              onChange={(e) => setFormData({ ...formData, maxValue: parseInt(e.target.value) })}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="sortOrder">Orden de visualización</Label>
          <Input
            id="sortOrder"
            type="number"
            min="0"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isRequired"
            checked={formData.isRequired}
            onCheckedChange={(checked) => setFormData({ ...formData, isRequired: checked })}
          />
          <Label htmlFor="isRequired">Campo obligatorio</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
          <Label htmlFor="isActive">Activo</Label>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Vista previa</h4>
        <div className="flex items-center gap-2 text-sm">
          {getIconComponent(formData.icon)}
          <span className="font-medium">{formData.label || 'Sin etiqueta'}</span>
          {getCategoryBadge(formData.category)}
          {formData.isRequired && <Badge variant="outline">Obligatorio</Badge>}
          {!formData.isActive && <Badge variant="secondary">Inactivo</Badge>}
        </div>
        {formData.description && (
          <p className="text-sm text-gray-600 mt-1">{formData.description}</p>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {criteria ? 'Actualizar Criterio' : 'Crear Criterio'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default function EvaluationCriteriaPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<EvaluationCriteria | null>(null);

  // Obtener criterios de evaluación
  const { data: criteriaData, isLoading, error } = useQuery({
    queryKey: ['/api/evaluation-criteria/admin'],
    queryFn: () => safeApiRequest('/api/evaluation-criteria/admin'),
  });

  // Asegurar que criteria sea un array
  const criteria = Array.isArray(criteriaData) ? criteriaData : [];

  // Crear criterio
  const createCriteria = useMutation({
    mutationFn: (data: CriteriaFormData) => apiRequest('/api/evaluation-criteria', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/evaluation-criteria/admin'] });
      toast({
        title: "Criterio creado",
        description: "El criterio de evaluación ha sido creado exitosamente.",
      });
      setShowCreateDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el criterio",
        variant: "destructive",
      });
    },
  });

  // Actualizar criterio
  const updateCriteria = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CriteriaFormData }) => 
      apiRequest(`/api/evaluation-criteria/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/evaluation-criteria/admin'] });
      toast({
        title: "Criterio actualizado",
        description: "El criterio de evaluación ha sido actualizado exitosamente.",
      });
      setEditingCriteria(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el criterio",
        variant: "destructive",
      });
    },
  });

  // Eliminar criterio
  const deleteCriteria = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/evaluation-criteria/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/evaluation-criteria/admin'] });
      toast({
        title: "Criterio eliminado",
        description: "El criterio de evaluación ha sido eliminado exitosamente.",
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

  const handleCreateCriteria = (data: CriteriaFormData) => {
    createCriteria.mutate(data);
  };

  const handleUpdateCriteria = (data: CriteriaFormData) => {
    if (editingCriteria) {
      updateCriteria.mutate({ id: editingCriteria.id, data });
    }
  };

  const handleDeleteCriteria = (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar este criterio? Esta acción no se puede deshacer.')) {
      deleteCriteria.mutate(id);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(opt => opt.value === iconName);
    if (iconOption) {
      const IconComponent = iconOption.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <Star className="h-4 w-4" />;
  };

  const getCategoryBadge = (category: string) => {
    const categoryOption = categoryOptions.find(opt => opt.value === category);
    if (categoryOption) {
      return <Badge className={categoryOption.color}>{categoryOption.label}</Badge>;
    }
    return <Badge>Sin categoría</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 max-w-6xl mx-auto">
      {/* Header con título */}
      <Card className="p-4 bg-gray-50 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-8 h-8 text-gray-900" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Criterios</h1>
              <p className="text-gray-600 mt-2">Configura los criterios que aparecerán en los formularios de evaluación</p>
            </div>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Criterio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Criterio de Evaluación</DialogTitle>
              </DialogHeader>
              <CriteriaForm
                onSubmit={handleCreateCriteria}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      <div className="space-y-4">
        {criteria.map((criterium: EvaluationCriteria) => (
          <Card key={criterium.id} className={`${!criterium.isActive ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-500">#{criterium.sortOrder}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getIconComponent(criterium.icon)}
                    <span className="font-medium">{criterium.label}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getCategoryBadge(criterium.category)}
                    <Badge variant="outline">{criterium.fieldType}</Badge>
                    {criterium.isRequired && <Badge variant="outline">Obligatorio</Badge>}
                    {!criterium.isActive && <Badge variant="secondary">Inactivo</Badge>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Dialog 
                    open={editingCriteria?.id === criterium.id} 
                    onOpenChange={(open) => !open && setEditingCriteria(null)}
                  >
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingCriteria(criterium)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Editar Criterio de Evaluación</DialogTitle>
                      </DialogHeader>
                      <CriteriaForm
                        criteria={criterium}
                        onSubmit={handleUpdateCriteria}
                        onCancel={() => setEditingCriteria(null)}
                      />
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteCriteria(criterium.id)}
                    disabled={deleteCriteria.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              
              {criterium.description && (
                <p className="text-sm text-gray-600 mt-2 ml-8">
                  {criterium.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 mt-2 ml-8 text-xs text-gray-500">
                <span>Nombre: {criterium.name}</span>
                {criterium.fieldType === 'rating' && (
                  <span>Rango: {criterium.minValue}-{criterium.maxValue}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {criteria.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay criterios configurados</h3>
            <p className="text-gray-600 mb-4">
              Comience creando criterios de evaluación para personalizar los formularios
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Criterio
            </Button>
          </CardContent>
        </Card>
      )}
      </div>
    </AdminLayout>
  );
}