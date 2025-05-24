import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

import { queryClient } from '@/lib/queryClient';

const ReportAssetIssuePage = () => {
  const [_, setLocation] = useLocation();
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [reportType, setReportType] = useState('damage');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [location, setLocation2] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<FileList | null>(null);

  // Obtener lista de activos
  const { data: assets = [] } = useQuery({
    queryKey: ['/api/assets'],
    retry: false,
  });

  // Obtener lista de voluntarios
  const { data: volunteers = [] } = useQuery({
    queryKey: ['/api/volunteers'],
    retry: false,
  });

  // Datos de muestra para activos en caso de que falle la conexión a la API
  const sampleAssets = [
    { id: 1, name: 'Banca Modelo Colonial', parkId: 1, parkName: 'Parque Central' },
    { id: 2, name: 'Juego Infantil Múltiple', parkId: 1, parkName: 'Parque Central' },
    { id: 3, name: 'Fuente Central', parkId: 2, parkName: 'Parque Metropolitano' },
    { id: 4, name: 'Señalización Informativa', parkId: 2, parkName: 'Parque Metropolitano' },
  ];

  // Determinar qué datos utilizar (API o muestra)
  const displayAssets = Array.isArray(assets) && assets.length > 0 ? assets : sampleAssets;

  // Obtener el activo seleccionado
  const selectedAsset = displayAssets.find((asset: any) => asset.id.toString() === selectedAssetId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPhotos(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAssetId) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un activo para reportar un problema',
        variant: 'destructive',
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: 'Error',
        description: 'Debes proporcionar una descripción del problema',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      // Preparar los datos para el envío
      const formData = new FormData();
      formData.append('assetId', selectedAssetId);
      formData.append('reportType', reportType);
      formData.append('priority', priority);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('reportDate', format(new Date(), 'yyyy-MM-dd'));
      
      // Agregar fotos si están disponibles
      if (photos) {
        for (let i = 0; i < photos.length; i++) {
          formData.append('photos', photos[i]);
        }
      }

      // Intentar enviar los datos a la API
      const response = await fetch('/api/assets/report-issue', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al reportar el problema');
      }

      // Invalidar consultas relacionadas para actualizar los datos
      queryClient.invalidateQueries({
        queryKey: ['/api/assets'],
      });
      
      toast({
        title: 'Problema reportado',
        description: 'El problema ha sido reportado correctamente. Se notificará al responsable del activo.',
      });

      // Redirigir a la lista de activos
      window.location.href = '/admin/assets';
    } catch (error) {
      console.error('Error al reportar problema:', error);
      toast({
        title: 'Error',
        description: 'No se pudo reportar el problema. Por favor, intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => window.location.href = '/admin/assets'}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Activos
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Reportar Problema</h1>
              <p className="text-muted-foreground">
                Reporta problemas o daños en activos del parque
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información del Activo</CardTitle>
                <CardDescription>
                  Selecciona el activo que presenta problemas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="asset">Activo*</Label>
                  <Select value={selectedAssetId} onValueChange={setSelectedAssetId} required>
                    <SelectTrigger id="asset">
                      <SelectValue placeholder="Selecciona un activo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {displayAssets.map((asset: any) => (
                          <SelectItem key={asset.id} value={asset.id.toString()}>
                            {asset.name} ({asset.parkName || 'Sin parque asignado'})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {selectedAssetId && (
                  <div className="border rounded-md p-4 bg-slate-50">
                    <h3 className="font-medium mb-2">Información del activo</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Nombre:</span>
                        <span className="text-sm font-medium">{selectedAsset?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Parque:</span>
                        <span className="text-sm font-medium">{selectedAsset?.parkName || 'No asignado'}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reportType">Tipo de Problema*</Label>
                  <Select value={reportType} onValueChange={setReportType} required>
                    <SelectTrigger id="reportType">
                      <SelectValue placeholder="Selecciona un tipo de problema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="damage">Daño físico</SelectItem>
                      <SelectItem value="malfunction">Mal funcionamiento</SelectItem>
                      <SelectItem value="vandalism">Vandalismo</SelectItem>
                      <SelectItem value="safety">Problema de seguridad</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad*</Label>
                  <Select value={priority} onValueChange={setPriority} required>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Selecciona la prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja - Puede esperar</SelectItem>
                      <SelectItem value="medium">Media - Atención en los próximos días</SelectItem>
                      <SelectItem value="high">Alta - Requiere atención inmediata</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalles del Problema</CardTitle>
                <CardDescription>
                  Proporciona información detallada sobre el problema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción del problema*</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe el problema detalladamente"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación específica</Label>
                  <Input
                    id="location"
                    placeholder="Ej: Esquina noreste del parque, cerca de los juegos infantiles"
                    value={location}
                    onChange={(e) => setLocation2(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photos">Fotografías (opcional)</Label>
                  <Input
                    id="photos"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Puedes subir hasta 3 fotografías para documentar el problema
                  </p>
                </div>

                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Información importante</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Al enviar este reporte, se notificará automáticamente al responsable del activo y al administrador del parque. 
                      Los problemas de alta prioridad generarán alertas inmediatas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="outline" type="button" className="mr-2" onClick={() => window.location.href = '/admin/assets'}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              <Save className="mr-2 h-4 w-4" />
              {submitting ? 'Enviando...' : 'Enviar Reporte'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ReportAssetIssuePage;