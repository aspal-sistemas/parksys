import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Check, MapPin } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Esquema de validación para coordenadas
const locationSchema = z.object({
  latitude: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= -90 && num <= 90;
    },
    { message: "La latitud debe ser un número entre -90 y 90" }
  ),
  longitude: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= -180 && num <= 180;
    },
    { message: "La longitud debe ser un número entre -180 y 180" }
  ),
  location: z.string().optional(),
});

type LocationFormValues = z.infer<typeof locationSchema>;

const EditLocationPage = () => {
  const params = useParams();
  const id = params.id;
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Obtener datos del activo
  const { data: asset, isLoading } = useQuery({
    queryKey: [`/api/assets/${id}`],
    enabled: !!id,
  });
  
  // Configurar formulario
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      latitude: '',
      longitude: '',
      location: '',
    },
  });
  
  // Actualizar valores por defecto cuando se carguen los datos
  useEffect(() => {
    if (asset) {
      form.reset({
        latitude: asset.latitude || '',
        longitude: asset.longitude || '',
        location: asset.location || '',
      });
    }
  }, [asset, form]);
  
  // Mutación para actualizar la ubicación
  const updateMutation = useMutation({
    mutationFn: (data: LocationFormValues) => {
      return apiRequest(`/api/assets/${id}`, 'PUT', {
        latitude: data.latitude,
        longitude: data.longitude,
        location: data.location,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assets/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      toast({
        title: "Ubicación actualizada",
        description: "Las coordenadas del activo se han actualizado correctamente.",
      });
      setLocation(`/admin/assets/map`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al actualizar las coordenadas.",
        variant: "destructive",
      });
      console.error('Error al actualizar coordenadas:', error);
    }
  });
  
  // Manejar envío del formulario
  const onSubmit = (data: LocationFormValues) => {
    updateMutation.mutate(data);
  };
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container py-6">
          <div className="mb-6">
            <Button variant="outline" onClick={() => setLocation('/admin/assets/map')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Mapa
            </Button>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-96" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setLocation('/admin/assets/map')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Mapa
          </Button>
        </div>
        
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-xl">Editar Ubicación</CardTitle>
            <CardDescription>
              Activo: {asset?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Alert className="bg-blue-50 border-blue-200">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    Ingresa las coordenadas de ubicación para este activo. Para México, la latitud suele ser positiva (norte) y la longitud negativa (oeste).
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitud</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ej: 19.432608" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Coordenada norte (+) / sur (-)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitud</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ej: -99.133209" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Coordenada este (+) / oeste (-)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción de Ubicación</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: Cerca de la entrada principal" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Describe dónde se encuentra este activo dentro del parque
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center justify-end gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation('/admin/assets/map')}
                    type="button"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? 'Guardando...' : 'Guardar Ubicación'}
                    <Check className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default EditLocationPage;