import React from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Images, MapPin, Users, TreePine } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import ParkMultimediaManager from "@/components/ParkMultimediaManager";
import ParkAmenitiesManager from "@/components/ParkAmenitiesManager";
import ParkTreeSpeciesManager from "@/components/ParkTreeSpeciesManager";

import ParkVolunteersManager from "@/components/ParkVolunteersManager";

export default function ParkManage() {
  const { id } = useParams();
  
  // Consulta para obtener datos del parque
  const { data: park, isLoading, error } = useQuery({
    queryKey: [`/api/parks/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/parks/${id}`, {
        headers: {
          'Authorization': 'Bearer direct-token-1750522117022',
          'X-User-Id': '1',
          'X-User-Role': 'super_admin'
        }
      });
      if (!response.ok) throw new Error('Error cargando parque');
      return response.json();
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando parque...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !park) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">Error cargando el parque</p>
            <Link href="/admin/parks">
              <Button className="mt-4">Volver a parques</Button>
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/parks">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{park.name}</h1>
                <div className="flex items-center text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{park.address}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Tabs de gestión */}
          <Tabs defaultValue="multimedia" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="multimedia" className="flex items-center gap-2">
                <Images className="h-4 w-4" />
                Multimedia
              </TabsTrigger>
              <TabsTrigger value="amenidades" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Amenidades
              </TabsTrigger>
              <TabsTrigger value="arboles" className="flex items-center gap-2">
                <TreePine className="h-4 w-4" />
                Árboles
              </TabsTrigger>
              <TabsTrigger value="voluntarios" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Voluntarios
              </TabsTrigger>
            </TabsList>

            {/* PESTAÑA DE MULTIMEDIA - MODO EDICIÓN COMPLETO */}
            <TabsContent value="multimedia" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-blue-600 flex items-center gap-2">
                    <Images className="h-6 w-6" />
                    Gestión de Multimedia del Parque
                  </CardTitle>
                  <CardDescription>
                    Administra imágenes y documentos del parque. Puedes subir archivos o usar URLs externas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ParkMultimediaManager parkId={parseInt(id || '0')} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* PESTAÑA DE AMENIDADES - MODO EDICIÓN COMPLETO */}
            <TabsContent value="amenidades" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-green-600 flex items-center gap-2">
                    <MapPin className="h-6 w-6" />
                    Gestión de Amenidades del Parque
                  </CardTitle>
                  <CardDescription>
                    Administra las amenidades y servicios disponibles en el parque. Puedes agregar nuevas amenidades o editar las existentes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ParkAmenitiesManager parkId={parseInt(id!)} />
                </CardContent>
              </Card>
            </TabsContent>



            <TabsContent value="arboles" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-green-600 flex items-center gap-2">
                    <TreePine className="h-6 w-6" />
                    Gestión de Especies Arbóreas del Parque
                  </CardTitle>
                  <CardDescription>
                    Administra las especies arbóreas asignadas al parque. Puedes seleccionar especies del catálogo y configurar detalles de plantación.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ParkTreeSpeciesManager parkId={parseInt(id!)} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="voluntarios" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-green-600 flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    Gestión de Voluntarios del Parque
                  </CardTitle>
                  <CardDescription>
                    Administra los voluntarios asignados al parque. Selecciona voluntarios disponibles de la columna izquierda para asignarlos a este parque.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ParkVolunteersManager parkId={parseInt(id!)} />
                </CardContent>
              </Card>
            </TabsContent>


          </Tabs>
        </div>
    </AdminLayout>
  );
}