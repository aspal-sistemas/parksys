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
import { Calendar, Clock, MapPin, Users, AlertCircle, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

// Categorías oficiales de actividades (deben coincidir con /admin/activities/categories)
const CATEGORIAS_ACTIVIDADES = [
  { value: "todas", label: "Todas las Actividades" },
  { value: "Deportivo", label: "Deportivo" },
  { value: "Recreación y Bienestar", label: "Recreación y Bienestar" },
  { value: "Arte y Cultura", label: "Arte y Cultura" },
  { value: "Naturaleza y Ciencia", label: "Naturaleza y Ciencia" },
  { value: "Comunidad", label: "Comunidad" },
  { value: "Eventos de Temporada", label: "Eventos de Temporada" }
];

// Tipo para las actividades según la estructura actual de datos
interface Actividad {
  id: number;
  title: string;          // Nombre de la actividad
  description: string;    // Descripción
  category: string;       // Categoría
  parkId: number;         // ID del parque
  parkName?: string;      // Nombre del parque (del backend)
  parqueNombre?: string;  // Nombre del parque (agregado desde la consulta de parques)
  startDate: string;      // Fecha de inicio
  endDate?: string;       // Fecha fin (opcional)
  location?: string;      // Ubicación dentro del parque
  createdAt: string;
  // Campos adicionales que mostraremos si están disponibles
  capacity?: number;
  price?: number;
  isFree?: boolean;       // Si es gratuita o no
  materials?: string;
  requirements?: string;
  duration?: number;      // Duración en minutos
  isRecurring?: boolean;  // Si es recurrente
  recurringDays?: string[]; // Días recurrentes
}

const VerActividadesPage = () => {
  const [location, setLocation] = useLocation();
  const [categoriaActiva, setCategoriaActiva] = useState<string>("todas");
  const [busqueda, setBusqueda] = useState<string>("");
  const [parqueFiltro, setParqueFiltro] = useState<string>("todos");
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [vistaExtendida, setVistaExtendida] = useState<boolean>(false);
  const registrosPorPagina = 10;

  // Consulta para obtener la lista de parques
  const { data: parques = [] } = useQuery<{ id: number, name: string }[]>({
    queryKey: ['/api/parks'],
  });

  // Consulta para obtener las actividades
  const { data: actividades = [], isLoading } = useQuery<Actividad[]>({
    queryKey: ['/api/activities'],
    select: (data) => {
      // DEBUG: Verificar datos recibidos
      console.log('🔍 Datos raw recibidos del API:', data);
      if (data.length > 0) {
        console.log('🔍 Primera actividad completa:', data[0]);
        console.log('🔍 Campos de precio de primera actividad:', {
          id: data[0].id,
          title: data[0].title,
          price: data[0].price,
          isFree: data[0].isFree
        });
      }
      
      // Transformar y enriquecer datos si es necesario
      return data.map(actividad => ({
        ...actividad,
        // Si ya tiene parkName (del backend) lo usamos, si no, lo buscamos en los parques
        parqueNombre: actividad.parkName || parques.find(p => p.id === actividad.parkId)?.name || 'Parque no disponible'
      }));
    }
  });

  // Filtrar actividades por categoría
  const actividadesPorCategoria = actividades.filter(act => {
    // Filtro por categoría
    const categoriaCoincide = categoriaActiva === "todas" || act.category === categoriaActiva;
    
    // Filtro de búsqueda por texto
    const busquedaCoincide = busqueda === "" || 
      (act.title && act.title.toLowerCase().includes(busqueda.toLowerCase())) || 
      (act.description && act.description.toLowerCase().includes(busqueda.toLowerCase()));
    
    // Filtro por parque
    const parqueCoincide = parqueFiltro === "todos" || parqueFiltro === "" || 
      (act.parkId && act.parkId.toString() === parqueFiltro);
    
    return categoriaCoincide && busquedaCoincide && parqueCoincide;
  });

  // Paginación
  const totalPaginas = Math.ceil(actividadesPorCategoria.length / registrosPorPagina);
  const indiceInicio = (paginaActual - 1) * registrosPorPagina;
  const indiceFin = indiceInicio + registrosPorPagina;
  const actividadesPaginadas = actividadesPorCategoria.slice(indiceInicio, indiceFin);

  // Resetear página cuando cambian los filtros
  React.useEffect(() => {
    setPaginaActual(1);
  }, [categoriaActiva, busqueda, parqueFiltro]);

  // Función para renderizar la badge de estado de una actividad
  const renderEstadoBadge = (actividad: Actividad) => {
    const ahora = new Date();
    const fechaInicio = new Date(actividad.startDate);
    const fechaFin = actividad.endDate ? new Date(actividad.endDate) : null;
    
    if (fechaInicio > ahora) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Programada</Badge>;
    } else if (fechaFin && fechaFin < ahora) {
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Finalizada</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Activa</Badge>;
    }
  };

  // Función para renderizar vista extendida
  const renderVistaExtendida = (actividad: Actividad) => (
    <Card key={actividad.id} className="overflow-hidden">
      <CardHeader className="bg-gray-50 pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{actividad.title}</CardTitle>
            <CardDescription className="text-base">{actividad.description}</CardDescription>
          </div>
          <div className="ml-4 flex flex-col gap-2">
            {renderEstadoBadge(actividad)}
            {actividad.isFree === false ? (
              actividad.price ? (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  ${Number(actividad.price).toFixed(2)} MXN
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  Precio: Consultar
                </Badge>
              )
            ) : actividad.isFree === true ? (
              <Badge className="bg-green-50 text-green-700 border-green-200 border">Gratuita</Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                Sin información de precio
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Información General</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span>{actividad.parqueNombre}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span>
                  {actividad.startDate && format(new Date(actividad.startDate), "PPP", { locale: es })}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span>
                  {actividad.duration ? `${actividad.duration} min` : 'Consultar detalles'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Detalles</h4>
            <div className="space-y-2 text-sm">
              {actividad.capacity && (
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Capacidad: {actividad.capacity} personas</span>
                </div>
              )}
              {actividad.location && (
                <div>
                  <span className="font-medium">Ubicación específica:</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {actividad.location}
                  </Badge>
                </div>
              )}
              {actividad.isRecurring && actividad.recurringDays && actividad.recurringDays.length > 0 && (
                <div>
                  <span className="font-medium block mb-1">Días recurrentes:</span>
                  <div className="flex flex-wrap gap-1">
                    {actividad.recurringDays.map((dia: string) => (
                      <Badge key={dia} variant="outline" className="text-xs">
                        {dia.charAt(0).toUpperCase() + dia.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Requisitos</h4>
            <div className="space-y-2 text-sm">
              {actividad.materials && (
                <div>
                  <span className="font-medium">Materiales:</span>
                  <p className="text-gray-600 mt-1">{actividad.materials}</p>
                </div>
              )}
              {actividad.requirements && (
                <div>
                  <span className="font-medium">Requisitos:</span>
                  <p className="text-gray-600 mt-1">{actividad.requirements}</p>
                </div>
              )}
              {!actividad.materials && !actividad.requirements && (
                <p className="text-gray-400 italic">No hay requisitos específicos</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-gray-50 flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          className="text-red-600 hover:text-red-800 hover:bg-red-50"
          onClick={() => {
            if (window.confirm(`¿Estás seguro de que deseas eliminar la actividad "${actividad.title}"? Esta acción no se puede deshacer.`)) {
              fetch(`/api/activities/${actividad.id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              })
              .then(response => {
                if (response.ok) {
                  window.location.reload();
                } else {
                  alert('No se pudo eliminar la actividad. Inténtalo de nuevo.');
                }
              })
              .catch(error => {
                console.error('Error al eliminar la actividad:', error);
                alert('Error al eliminar la actividad. Inténtalo de nuevo.');
              });
            }
          }}
        >
          Borrar
        </Button>
        <Button 
          variant="default" 
          size="sm"
          onClick={() => setLocation(`/admin/organizador/catalogo/editar/${actividad.id}`)}
        >
          Editar
        </Button>
      </CardFooter>
    </Card>
  );

  // Función para renderizar vista grid normal
  const renderVistaGrid = (actividad: Actividad) => (
    <Card key={actividad.id} className="overflow-hidden">
      <CardHeader className="bg-gray-50 pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{actividad.title}</CardTitle>
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
        <p className="text-sm mb-4">{actividad.description}</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            <span>
              {actividad.startDate && format(new Date(actividad.startDate), "PPP", { locale: es })}
              {actividad.endDate && ` - ${format(new Date(actividad.endDate), "PPP", { locale: es })}`}
            </span>
          </div>
          
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            {actividad.duration ? 
              <span>Duración: {actividad.duration} min</span> :
              <span>Horario: Consultar detalles</span>
            }
          </div>
          
          {actividad.capacity && (
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-gray-500" />
              <span>Capacidad: {actividad.capacity} personas</span>
            </div>
          )}
          
          {actividad.isRecurring && actividad.recurringDays && actividad.recurringDays.length > 0 && (
            <div className="flex items-start">
              <Calendar className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
              <div>
                <span className="block">Actividad recurrente:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {actividad.recurringDays.map((dia: string) => (
                    <Badge key={dia} variant="outline" className="text-xs">
                      {dia.charAt(0).toUpperCase() + dia.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {actividad.location && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-1">Ubicación:</h4>
            <Badge variant="secondary" className="text-xs">
              {actividad.location}
            </Badge>
          </div>
        )}

        <div className="mt-4">
          {actividad.isFree === false ? (
            actividad.price ? (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Precio: ${Number(actividad.price).toFixed(2)} MXN
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                Precio: Consultar
              </Badge>
            )
          ) : actividad.isFree === true ? (
            <Badge className="bg-green-50 text-green-700 border-green-200 border">Gratuita</Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
              Sin información de precio
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t bg-gray-50 flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          className="text-red-600 hover:text-red-800 hover:bg-red-50"
          onClick={() => {
            if (window.confirm(`¿Estás seguro de que deseas eliminar la actividad "${actividad.title}"? Esta acción no se puede deshacer.`)) {
              fetch(`/api/activities/${actividad.id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              })
              .then(response => {
                if (response.ok) {
                  window.location.reload();
                } else {
                  alert('No se pudo eliminar la actividad. Inténtalo de nuevo.');
                }
              })
              .catch(error => {
                console.error('Error al eliminar la actividad:', error);
                alert('Error al eliminar la actividad. Inténtalo de nuevo.');
              });
            }
          }}
        >
          Borrar
        </Button>
        <Button 
          variant="default" 
          size="sm"
          onClick={() => setLocation(`/admin/organizador/catalogo/editar/${actividad.id}`)}
        >
          Editar
        </Button>
      </CardFooter>
    </Card>
  );

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

      {/* Filtros y controles de vista */}
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
              <SelectItem value="todos">Todos los parques</SelectItem>
              {parques.map((parque) => (
                <SelectItem key={parque.id} value={parque.id.toString()}>
                  {parque.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            variant={vistaExtendida ? "outline" : "default"}
            size="sm"
            onClick={() => setVistaExtendida(false)}
          >
            <Grid className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button
            variant={vistaExtendida ? "default" : "outline"}
            size="sm"
            onClick={() => setVistaExtendida(true)}
          >
            <List className="h-4 w-4 mr-2" />
            Lista
          </Button>
        </div>
      </div>

      {/* Pestañas por categoría */}
      <Tabs 
        defaultValue="todas" 
        value={categoriaActiva}
        onValueChange={(value) => setCategoriaActiva(value)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-1 mb-6 h-auto p-2">
          {CATEGORIAS_ACTIVIDADES.map((categoria) => (
            <TabsTrigger 
              key={categoria.value} 
              value={categoria.value}
              className="text-xs sm:text-sm whitespace-normal h-auto py-2 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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
              <div>
                {/* Información de paginación */}
                <div className="mb-4 text-sm text-gray-600">
                  Mostrando {indiceInicio + 1}-{Math.min(indiceFin, actividadesPorCategoria.length)} de {actividadesPorCategoria.length} actividades
                </div>
                
                {/* Vista Grid o Lista */}
                <div className={vistaExtendida ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                  {actividadesPaginadas.map((actividad) => 
                    vistaExtendida ? renderVistaExtendida(actividad) : renderVistaGrid(actividad)
                  )}
                </div>
                
                {/* Controles de paginación */}
                {totalPaginas > 1 && (
                  <div className="mt-8 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Página {paginaActual} de {totalPaginas}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                        disabled={paginaActual === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Anterior
                      </Button>
                      
                      {/* Números de página */}
                      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                        <Button
                          key={pagina}
                          variant={pagina === paginaActual ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPaginaActual(pagina)}
                          className={pagina === paginaActual ? "bg-primary text-primary-foreground" : ""}
                        >
                          {pagina}
                        </Button>
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                        disabled={paginaActual === totalPaginas}
                      >
                        Siguiente
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </AdminLayout>
  );
};

export default VerActividadesPage;