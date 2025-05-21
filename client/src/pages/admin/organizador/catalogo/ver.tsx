import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, MapPin, Users, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

// Categorías de actividades
const CATEGORIAS_ACTIVIDADES = [
  { value: "artecultura", label: "Arte y Cultura" },
  { value: "recreacionbienestar", label: "Recreación y Bienestar" },
  { value: "temporada", label: "Eventos de Temporada" },
  { value: "naturalezaciencia", label: "Naturaleza, Ciencia y Conservación" }
];

// Tipo para las actividades
interface Actividad {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  parqueId: number;
  parqueNombre?: string;
  fechaInicio: string;
  fechaFin?: string;
  horaInicio: string;
  duracion: number;
  capacidad?: number;
  ubicaciones?: string[];
  esRecurrente: boolean;
  diasRecurrentes?: string[];
  esGratuita: boolean;
  precio?: number;
  materiales?: string;
  requisitos?: string;
  personalRequerido?: number;
}

const VerActividadesPage = () => {
  const [location, setLocation] = useLocation();
  const [categoriaActiva, setCategoriaActiva] = useState<string>("artecultura");
  const [busqueda, setBusqueda] = useState<string>("");
  const [parqueFiltro, setParqueFiltro] = useState<string>("");

  // Consulta para obtener la lista de parques
  const { data: parques = [] } = useQuery<{ id: number, name: string }[]>({
    queryKey: ['/api/parks'],
  });

  // Consulta para obtener las actividades
  const { data: actividades = [], isLoading } = useQuery<Actividad[]>({
    queryKey: ['/api/activities'],
    select: (data) => {
      // Transformar y enriquecer datos si es necesario
      return data.map(actividad => ({
        ...actividad,
        parqueNombre: parques.find(p => p.id === actividad.parqueId)?.name
      }));
    }
  });

  // Filtrar actividades por categoría
  const actividadesPorCategoria = actividades.filter(act => 
    act.categoria === categoriaActiva &&
    (busqueda === "" || 
      act.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
      act.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    ) &&
    (parqueFiltro === "" || act.parqueId.toString() === parqueFiltro)
  );

  // Función para renderizar la badge de estado de una actividad
  const renderEstadoBadge = (actividad: Actividad) => {
    const ahora = new Date();
    const fechaInicio = new Date(actividad.fechaInicio);
    const fechaFin = actividad.fechaFin ? new Date(actividad.fechaFin) : null;
    
    if (fechaInicio > ahora) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Programada</Badge>;
    } else if (fechaFin && fechaFin < ahora) {
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Finalizada</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Activa</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Actividades Disponibles</h1>
          <Button onClick={() => setLocation('/admin/organizador/catalogo/crear')}>
            Crear Nueva Actividad
          </Button>
        </div>
        <p className="text-gray-500">
          Visualiza todas las actividades disponibles en el catálogo por categoría
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre o descripción"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="min-w-[200px]">
          <Select value={parqueFiltro} onValueChange={setParqueFiltro}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por parque" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los parques</SelectItem>
              {parques.map((parque) => (
                <SelectItem key={parque.id} value={parque.id.toString()}>
                  {parque.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pestañas por categoría */}
      <Tabs 
        defaultValue="artecultura" 
        value={categoriaActiva}
        onValueChange={(value) => setCategoriaActiva(value)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
          {CATEGORIAS_ACTIVIDADES.map((categoria) => (
            <TabsTrigger 
              key={categoria.value} 
              value={categoria.value}
              className="text-sm md:text-base"
            >
              {categoria.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Contenido para cada categoría */}
        {CATEGORIAS_ACTIVIDADES.map((categoria) => (
          <TabsContent key={categoria.value} value={categoria.value} className="mt-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <p>Cargando actividades...</p>
              </div>
            ) : actividadesPorCategoria.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay actividades disponibles</h3>
                <p className="text-gray-500 mb-4">
                  No se encontraron actividades en la categoría {categoria.label} con los filtros aplicados.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setLocation('/admin/organizador/catalogo/crear')}
                >
                  Crear Nueva Actividad
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {actividadesPorCategoria.map((actividad) => (
                  <Card key={actividad.id} className="overflow-hidden">
                    <CardHeader className="bg-gray-50 pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{actividad.nombre}</CardTitle>
                        {renderEstadoBadge(actividad)}
                      </div>
                      {actividad.parqueNombre && (
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          {actividad.parqueNombre}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm mb-4">{actividad.descripcion}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span>
                            {actividad.fechaInicio && format(new Date(actividad.fechaInicio), "PPP", { locale: es })}
                            {actividad.fechaFin && ` - ${format(new Date(actividad.fechaFin), "PPP", { locale: es })}`}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{actividad.horaInicio} ({actividad.duracion} min)</span>
                        </div>
                        {actividad.capacidad && (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-gray-500" />
                            <span>Capacidad: {actividad.capacidad} personas</span>
                          </div>
                        )}
                        {actividad.esRecurrente && actividad.diasRecurrentes && actividad.diasRecurrentes.length > 0 && (
                          <div className="flex items-start">
                            <Calendar className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                            <div>
                              <span className="block">Actividad recurrente:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {actividad.diasRecurrentes.map((dia) => (
                                  <Badge key={dia} variant="outline" className="text-xs">
                                    {dia.charAt(0).toUpperCase() + dia.slice(1)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Ubicaciones específicas */}
                      {actividad.ubicaciones && actividad.ubicaciones.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-1">Ubicaciones:</h4>
                          <div className="flex flex-wrap gap-1">
                            {actividad.ubicaciones.map((ubicacion, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {ubicacion}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Precio */}
                      <div className="mt-4">
                        {actividad.esGratuita ? (
                          <Badge className="bg-green-50 text-green-700 border-0">Gratuita</Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-700">
                            Precio: ${actividad.precio?.toFixed(2) || '0.00'} MXN
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t bg-gray-50 flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Aquí iría la lógica para ver detalles
                          console.log(`Ver detalles de actividad ${actividad.id}`);
                        }}
                      >
                        Ver detalles
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          // Aquí iría la lógica para editar
                          console.log(`Editar actividad ${actividad.id}`);
                        }}
                      >
                        Editar
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </AdminLayout>
  );
};

export default VerActividadesPage;