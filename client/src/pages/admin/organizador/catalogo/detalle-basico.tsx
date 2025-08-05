import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';

const DetalleBasicoActividadPage = () => {
  const [location, setLocation] = useLocation();
  const [actividadId, setActividadId] = useState<number | null>(null);
  
  // Extraer el ID de la actividad desde la URL
  useEffect(() => {
    const id = location.split('/').pop();
    if (id && !isNaN(Number(id))) {
      setActividadId(parseInt(id));
    }
  }, [location]);
  
  // Obtener los detalles de la actividad
  const { data: actividad, isLoading, error } = useQuery({
    queryKey: ['/api/activities', actividadId],
    enabled: actividadId !== null,
  });
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">Cargando detalles de la actividad...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  if (error || !actividad) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-500">Actividad no encontrada</h2>
            <p className="mt-4 text-gray-500">
              La actividad que estás buscando no existe o ha sido eliminada.
            </p>
            <Button 
              className="mt-6" 
              onClick={() => setLocation('/admin/organizador/catalogo/ver')}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver al catálogo
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/admin/organizador/catalogo/ver')}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver al catálogo
          </Button>
          
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">{actividad.title || 'Actividad sin título'}</h1>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la actividad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">ID de la actividad</h3>
                <p className="bg-gray-100 p-2 rounded">{actividad.id}</p>
              </div>
              
              {actividad.description && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Descripción</h3>
                  <p className="text-gray-700">{actividad.description}</p>
                </div>
              )}
              
              {actividad.category && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Categoría</h3>
                  <p className="text-gray-700">{actividad.category}</p>
                </div>
              )}
              
              {actividad.parkId && (
                <div>
                  <h3 className="text-lg font-medium mb-2">ID del parque</h3>
                  <p className="text-gray-700">{actividad.parkId}</p>
                </div>
              )}
              
              {actividad.parkName && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Nombre del parque</h3>
                  <p className="text-gray-700">{actividad.parkName}</p>
                </div>
              )}
              
              <div className="pt-4">
                <Button 
                  variant="default" 
                  onClick={() => setLocation('/admin/organizador/catalogo/ver')}
                >
                  Ver todas las actividades
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default DetalleBasicoActividadPage;