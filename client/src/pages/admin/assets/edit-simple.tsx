import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function EditAssetSimple() {
  const [, params] = useRoute('/admin/assets/:id/edit');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const id = params?.id;

  // Estados para los campos del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    serialNumber: '',
    parkId: '',
    categoryId: '',
    amenityId: '',
    status: 'activo',
    condition: 'bueno',
    acquisitionDate: '',
    acquisitionCost: '',
    currentValue: '',
    location: '',
    latitude: '',
    longitude: '',
    notes: ''
  });

  // Cargar datos del activo
  const { data: asset, isLoading: assetLoading } = useQuery({
    queryKey: [`/api/assets/${id}`],
    enabled: !!id,
  });

  // Cargar datos adicionales
  const { data: parks } = useQuery({ queryKey: ['/api/parks'] });
  const { data: categories } = useQuery({ queryKey: ['/api/asset-categories'] });

  // Llenar formulario cuando se carga el activo
  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name || '',
        description: asset.description || '',
        serialNumber: asset.serialNumber || '',
        parkId: asset.parkId?.toString() || '',
        categoryId: asset.categoryId?.toString() || '',
        amenityId: asset.amenityId?.toString() || '',
        status: asset.status || 'activo',
        condition: asset.condition || 'bueno',
        acquisitionDate: asset.acquisitionDate || '',
        acquisitionCost: asset.acquisitionCost?.toString() || '',
        currentValue: asset.currentValue?.toString() || '',
        location: asset.location || '',
        latitude: asset.latitude || '',
        longitude: asset.longitude || '',
        notes: asset.notes || ''
      });
    }
  }, [asset]);

  // Obtener amenidades del parque seleccionado
  const { data: amenities } = useQuery({
    queryKey: [`/api/parks/${formData.parkId}/amenities`],
    enabled: !!formData.parkId,
  });

  // Mutación para actualizar
  const updateMutation = useMutation({
    mutationFn: (data: any) => {
      console.log("=== ENVIANDO DATOS AL BACKEND ===", data);
      return apiRequest(`/api/assets/${id}`, 'PUT', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assets/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      toast({
        title: "Activo actualizado",
        description: "El activo se ha actualizado correctamente.",
      });
      setLocation(`/admin/assets/${id}`);
    },
    onError: (error) => {
      console.error('Error al actualizar:', error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error al actualizar el activo.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    console.log("=== INICIANDO ENVÍO SIMPLE ===");
    console.log("Datos del formulario:", formData);

    // Validaciones básicas
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre es obligatorio.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.parkId) {
      toast({
        title: "Error",
        description: "Debe seleccionar un parque.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.categoryId) {
      toast({
        title: "Error",
        description: "Debe seleccionar una categoría.",
        variant: "destructive",
      });
      return;
    }

    // Preparar datos para envío
    const updateData = {
      name: formData.name.trim(),
      description: formData.description || null,
      serialNumber: formData.serialNumber || null,
      parkId: Number(formData.parkId),
      categoryId: Number(formData.categoryId),
      amenityId: formData.amenityId ? Number(formData.amenityId) : null,
      status: formData.status,
      condition: formData.condition,
      acquisitionDate: formData.acquisitionDate || null,
      acquisitionCost: formData.acquisitionCost ? parseFloat(formData.acquisitionCost) : null,
      currentValue: formData.currentValue ? parseFloat(formData.currentValue) : null,
      location: formData.location || null,
      latitude: formData.latitude || null,
      longitude: formData.longitude || null,
      notes: formData.notes || null
    };

    console.log("Datos procesados:", updateData);
    updateMutation.mutate(updateData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (assetLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocation(`/admin/assets/${id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Editar Activo (Versión Simple)</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Activo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <Label>Nombre *</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nombre del activo"
              />
            </div>

            {/* Número de serie */}
            <div>
              <Label>Número de Serie</Label>
              <Input
                value={formData.serialNumber}
                onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                placeholder="Número de serie"
              />
            </div>

            {/* Parque */}
            <div>
              <Label>Parque *</Label>
              <Select value={formData.parkId} onValueChange={(value) => handleInputChange('parkId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar parque" />
                </SelectTrigger>
                <SelectContent>
                  {parks?.map((park: any) => (
                    <SelectItem key={park.id} value={park.id.toString()}>
                      {park.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Categoría */}
            <div>
              <Label>Categoría *</Label>
              <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amenidad */}
            <div>
              <Label>Amenidad</Label>
              <Select value={formData.amenityId} onValueChange={(value) => handleInputChange('amenityId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar amenidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin amenidad</SelectItem>
                  {amenities?.map((amenity: any) => (
                    <SelectItem key={amenity.id} value={amenity.id.toString()}>
                      {amenity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estado */}
            <div>
              <Label>Estado</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="mantenimiento">En Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Condición */}
            <div>
              <Label>Condición</Label>
              <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excelente">Excelente</SelectItem>
                  <SelectItem value="bueno">Bueno</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="malo">Malo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fecha de adquisición */}
            <div>
              <Label>Fecha de Adquisición</Label>
              <Input
                type="date"
                value={formData.acquisitionDate}
                onChange={(e) => handleInputChange('acquisitionDate', e.target.value)}
              />
            </div>

            {/* Costo de adquisición */}
            <div>
              <Label>Costo de Adquisición</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.acquisitionCost}
                onChange={(e) => handleInputChange('acquisitionCost', e.target.value)}
                placeholder="0.00"
              />
            </div>

            {/* Valor actual */}
            <div>
              <Label>Valor Actual</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.currentValue}
                onChange={(e) => handleInputChange('currentValue', e.target.value)}
                placeholder="0.00"
              />
            </div>

            {/* Ubicación */}
            <div>
              <Label>Ubicación</Label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Descripción de la ubicación"
              />
            </div>

            {/* Latitud */}
            <div>
              <Label>Latitud</Label>
              <Input
                value={formData.latitude}
                onChange={(e) => handleInputChange('latitude', e.target.value)}
                placeholder="19.4326"
              />
            </div>

            {/* Longitud */}
            <div>
              <Label>Longitud</Label>
              <Input
                value={formData.longitude}
                onChange={(e) => handleInputChange('longitude', e.target.value)}
                placeholder="-99.1332"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <Label>Descripción</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descripción del activo"
              rows={3}
            />
          </div>

          {/* Notas */}
          <div>
            <Label>Notas</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Notas adicionales"
              rows={3}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => setLocation(`/admin/assets/${id}`)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
              <Save className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}