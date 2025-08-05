import React, { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Save, 
  Calendar, 
  Tag,
  Info,
  CheckCircle2,
  X 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/ui/date-picker';
import { queryClient } from '@/lib/queryClient';

const AssignEquipmentPage = () => {
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedInstructorId, setSelectedInstructorId] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [purpose, setPurpose] = useState('');
  const [activityId, setActivityId] = useState('');
  const [notes, setNotes] = useState('');
  const [requiresTraining, setRequiresTraining] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Obtener lista de activos (equipamiento deportivo)
  const { data: assets = [] } = useQuery({
    queryKey: ['/api/assets'],
    retry: false,
  });

  // Obtener lista de instructores
  const { data: instructors = [] } = useQuery({
    queryKey: ['/api/instructors'],
    retry: false,
  });

  // Obtener lista de actividades
  const { data: activities = [] } = useQuery({
    queryKey: ['/api/activities'],
    retry: false,
  });

  // Datos de muestra para cuando falle la API
  const sampleAssets = [
    { id: 1, name: 'Equipo de Yoga (10 colchonetas)', condition: 'good', categoryName: 'Equipamiento Deportivo', parkName: 'Parque Central' },
    { id: 2, name: 'Set de Balones de Fútbol (5)', condition: 'good', categoryName: 'Equipamiento Deportivo', parkName: 'Parque Central' },
    { id: 3, name: 'Kit de Tenis (4 raquetas, 10 pelotas)', condition: 'fair', categoryName: 'Equipamiento Deportivo', parkName: 'Parque Metropolitano' },
    { id: 4, name: 'Sistema de Sonido Portátil', condition: 'good', categoryName: 'Equipamiento Electrónico', parkName: 'Parque Agua Azul' },
  ];

  const sampleInstructors = [
    { id: 1, fullName: 'Carlos Ramírez', specialties: 'Yoga, Meditación' },
    { id: 2, fullName: 'Laura Sánchez', specialties: 'Fútbol, Atletismo' },
    { id: 3, fullName: 'Miguel Torres', specialties: 'Tenis, Badminton' },
    { id: 4, fullName: 'Ana López', specialties: 'Baile, Aerobics' },
  ];

  const sampleActivities = [
    { id: 1, title: 'Clase de Yoga para Principiantes', parkId: 1, parkName: 'Parque Central' },
    { id: 2, title: 'Entrenamiento de Fútbol Juvenil', parkId: 1, parkName: 'Parque Central' },
    { id: 3, title: 'Torneo de Tenis Infantil', parkId: 2, parkName: 'Parque Metropolitano' },
    { id: 4, title: 'Clase de Baile Urbano', parkId: 3, parkName: 'Parque Agua Azul' },
  ];

  // Determinar qué datos utilizar (API o muestra)
  const displayAssets = Array.isArray(assets) && assets.length > 0 
    ? assets.filter((asset: any) => asset.categoryName?.toLowerCase().includes('deport') || asset.categoryName?.toLowerCase().includes('equip'))
    : sampleAssets;
  
  const displayInstructors = Array.isArray(instructors) && instructors.length > 0 ? instructors : sampleInstructors;
  const displayActivities = Array.isArray(activities) && activities.length > 0 ? activities : sampleActivities;

  // Obtener el activo seleccionado
  const selectedAsset = displayAssets.find((asset: any) => asset.id.toString() === selectedAssetId);
  
  // Obtener el instructor seleccionado
  const selectedInstructor = displayInstructors.find((instructor: any) => instructor.id.toString() === selectedInstructorId);

  // Obtener la actividad seleccionada
  const selectedActivity = displayActivities.find((activity: any) => activity.id.toString() === activityId);

  // Verificar si hay conflictos en las fechas con otras asignaciones
  const hasConflict = false; // Implementar verificación real más adelante

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAssetId) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un equipamiento para asignar',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedInstructorId) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un instructor',
        variant: 'destructive',
      });
      return;
    }

    if (!startDate) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar una fecha de inicio',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      // Preparar los datos para el envío
      const assignmentData = {
        assetId: parseInt(selectedAssetId),
        instructorId: parseInt(selectedInstructorId),
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : null,
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : null,
        purpose,
        activityId: activityId ? parseInt(activityId) : null,
        notes,
        requiresTraining,
        status: 'active',
      };

      // Intentar enviar los datos a la API
      const response = await fetch('/api/asset-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(assignmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al asignar equipamiento');
      }

      // Invalidar consultas relacionadas para actualizar los datos
      queryClient.invalidateQueries({
        queryKey: ['/api/assets'],
      });
      
      toast({
        title: 'Equipamiento asignado',
        description: 'El equipamiento ha sido asignado correctamente al instructor.',
      });

      // Redirigir a la lista de activos
      window.location.href = '/admin/assets';
    } catch (error) {
      console.error('Error al asignar equipamiento:', error);
      toast({
        title: 'Error',
        description: 'No se pudo asignar el equipamiento. Por favor, intenta de nuevo.',
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
              <h1 className="text-3xl font-bold tracking-tight">Asignar Equipamiento a Instructor</h1>
              <p className="text-muted-foreground">
                Asigna equipamiento deportivo a instructores para actividades programadas
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información del Equipamiento</CardTitle>
                <CardDescription>
                  Selecciona el equipamiento deportivo que deseas asignar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="asset">Equipamiento*</Label>
                  <Select value={selectedAssetId} onValueChange={setSelectedAssetId} required>
                    <SelectTrigger id="asset">
                      <SelectValue placeholder="Selecciona un equipamiento" />
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
                    <h3 className="font-medium mb-2">Información del equipamiento</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Nombre:</span>
                        <span className="text-sm font-medium">{selectedAsset?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Condición:</span>
                        <span className="text-sm font-medium capitalize">{selectedAsset?.condition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Parque:</span>
                        <span className="text-sm font-medium">{selectedAsset?.parkName || 'No asignado'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Categoría:</span>
                        <span className="text-sm font-medium">{selectedAsset?.categoryName}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="purpose">Propósito de uso*</Label>
                  <Select value={purpose} onValueChange={setPurpose} required>
                    <SelectTrigger id="purpose">
                      <SelectValue placeholder="Selecciona el propósito" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class">Clase regular</SelectItem>
                      <SelectItem value="event">Evento especial</SelectItem>
                      <SelectItem value="tournament">Torneo</SelectItem>
                      <SelectItem value="workshop">Taller</SelectItem>
                      <SelectItem value="training">Entrenamiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity">Actividad relacionada (opcional)</Label>
                  <Select value={activityId} onValueChange={setActivityId}>
                    <SelectTrigger id="activity">
                      <SelectValue placeholder="Selecciona una actividad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {displayActivities.map((activity: any) => (
                          <SelectItem key={activity.id} value={activity.id.toString()}>
                            {activity.title} ({activity.parkName || 'Sin parque asignado'})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información del Instructor</CardTitle>
                <CardDescription>
                  Selecciona el instructor y el periodo de asignación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor*</Label>
                  <Select value={selectedInstructorId} onValueChange={setSelectedInstructorId} required>
                    <SelectTrigger id="instructor">
                      <SelectValue placeholder="Selecciona un instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {displayInstructors.map((instructor: any) => (
                          <SelectItem key={instructor.id} value={instructor.id.toString()}>
                            {instructor.fullName}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {selectedInstructorId && (
                  <div className="border rounded-md p-4 bg-slate-50">
                    <h3 className="font-medium mb-2">Información del instructor</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Nombre:</span>
                        <span className="text-sm font-medium">{selectedInstructor?.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Especialidades:</span>
                        <span className="text-sm font-medium">{selectedInstructor?.specialties}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Fecha de inicio*</Label>
                    <DatePicker 
                      selected={startDate} 
                      onSelect={setStartDate} 
                      locale={es}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Fecha de devolución</Label>
                    <DatePicker 
                      selected={endDate} 
                      onSelect={setEndDate} 
                      locale={es}
                      className="w-full"
                      minDate={startDate || undefined}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas adicionales</Label>
                  <Textarea
                    id="notes"
                    placeholder="Instrucciones especiales o detalles adicionales"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="requiresTraining" 
                    checked={requiresTraining}
                    onCheckedChange={(checked) => setRequiresTraining(checked as boolean)}
                  />
                  <Label htmlFor="requiresTraining" className="text-sm font-normal">
                    El instructor requiere capacitación para usar este equipamiento
                  </Label>
                </div>

                {hasConflict && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-3">
                    <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Conflicto detectado</p>
                      <p className="text-xs text-red-700 mt-1">
                        Este equipamiento ya está asignado para el periodo seleccionado. Por favor, selecciona otras fechas o un equipamiento diferente.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="outline" type="button" className="mr-2" onClick={() => window.location.href = '/admin/assets'}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || hasConflict}>
              <Save className="mr-2 h-4 w-4" />
              {submitting ? 'Asignando...' : 'Asignar Equipamiento'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AssignEquipmentPage;