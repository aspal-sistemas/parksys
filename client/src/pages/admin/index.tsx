import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  MapPin, 
  Users, 
  Calendar, 
  Bell, 
  MessageSquare, 
  ArrowUp, 
  ArrowDown, 
  ArrowRight,
  Plus,
  Upload,
  Layers,
  FileText,
  Tag,
  BarChart,
  Settings,
  Building,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/AdminLayout';

// Simplified modular dashboard component
const AdminDashboard: React.FC = () => {
  // Fetch parks count
  const { data: parks = [] } = useQuery({
    queryKey: ['/api/parks'],
  });
  
  return (
    <AdminLayout 
      title="Dashboard" 
      subtitle="Bienvenido al panel de administración de ParquesMX"
    >
      <div className="flex items-center justify-end space-x-3 mb-6">
        <Link href="/admin/parks/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Parque
          </Button>
        </Link>
        <Link href="/admin/parks-import">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Importar Parques
          </Button>
        </Link>
      </div>
      
      {/* Stats overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Parks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Parques
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parks.length}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Badge variant="outline" className="text-emerald-500 bg-emerald-50">
                <ArrowUp className="h-3 w-3 mr-1" />
                +4.5%
              </Badge>
              <span className="ml-1">desde el mes pasado</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuarios
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Badge variant="outline" className="text-emerald-500 bg-emerald-50">
                <ArrowUp className="h-3 w-3 mr-1" />
                +12%
              </Badge>
              <span className="ml-1">desde el mes pasado</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Actividades
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">36</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Badge variant="outline" className="text-rose-500 bg-rose-50">
                <ArrowDown className="h-3 w-3 mr-1" />
                -2.5%
              </Badge>
              <span className="ml-1">desde el mes pasado</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Incidents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Incidentes Reportados
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Badge variant="outline" className="text-rose-500 bg-rose-50">
                <ArrowUp className="h-3 w-3 mr-1" />
                +8%
              </Badge>
              <span className="ml-1">desde el mes pasado</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Nueva Estructura de Menú */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Nueva Estructura del Menú</h2>
        <Card className="p-4">
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Se ha implementado una nueva estructura de menú con los siguientes módulos y submódulos:</p>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-2">1. Módulo - Usuarios del Sistema</h3>
                <p className="text-sm text-gray-600">Submódulos: Lista, Usuarios</p>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-2">2. Módulo - Programación y Actividades</h3>
                <p className="text-sm text-gray-600">Submódulos: Organizador de Actividades, Actividades, Reportes</p>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-2">3. Módulo - Gestión Operativa e Infraestructura</h3>
                <p className="text-sm text-gray-600">Submódulos: Parques, Activos, Incidencias, Proyectos de Capital, Reportes</p>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-2">4. Módulo - Finanzas y Presupuesto</h3>
                <p className="text-sm text-gray-600">Submódulos: Egresos, Ingresos, Flujo de Efectivo, Calculadora de recuperación de costos, Indicadores clave</p>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-2">5. Módulo - Comunicación y Marketing</h3>
                <p className="text-sm text-gray-600">Submódulos: Eventos, Encuestas, Patrocinios, Reportes</p>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-2">6. Módulo - Voluntariado</h3>
                <p className="text-sm text-gray-600">Submódulos: Gestión de Voluntarios, Actividades, Capacitación, Reportes</p>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-2">7. Módulo - Concesiones y Espacios Comerciales</h3>
                <p className="text-sm text-gray-600">Submódulos: Registro Concesionarios, Contratos, Formatos, Reportes</p>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-2">8. Módulo - Recursos Humanos del Parque</h3>
                <p className="text-sm text-gray-600">Submódulos: Registro Personal, Roles y Turnos, Historial de Formación, Evaluación y Seguimiento, Perfiles de Puesto, Organigrama</p>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-2">9. Módulo - Análisis y Reportes</h3>
                <p className="text-sm text-gray-600">Submódulos: Dashboard Analítico, Exportar Reportes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Estructura Anterior */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Estructura Original del Menú</h2>
        <Card className="p-4">
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Esta es la estructura original que teníamos antes:</p>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-2">Módulo de Espacios Verdes</h3>
                <p className="text-sm text-gray-600">Submódulos: Parques, Amenidades, Municipios</p>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-2">Módulo de Actividades y Eventos</h3>
                <p className="text-sm text-gray-600">Submódulos: Actividades, Incidentes</p>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-2">Módulo de Contenidos Multimedia</h3>
                <p className="text-sm text-gray-600">Submódulos: Documentos, Imágenes, Videos</p>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-2">Módulo de Comunidad</h3>
                <p className="text-sm text-gray-600">Submódulos: Comentarios, Usuarios</p>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-2">Módulo de Análisis y Reportes</h3>
                <p className="text-sm text-gray-600">Submódulos: Dashboard Analítico, Exportar Reportes</p>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-2">Módulo de Sistema</h3>
                <p className="text-sm text-gray-600">Submódulos: Configuración</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent activity */}
      <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent parks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Parques Recientes</CardTitle>
            <CardDescription>Los últimos parques agregados al sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {parks.slice(-3).reverse().map((park: any, i: number) => (
                <div key={i} className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{park.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {park.address?.substring(0, 30) || 'Sin dirección'}...
                    </p>
                  </div>
                  <Link href={`/admin/parks/${park.id}`}>
                    <Button variant="ghost" size="icon">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
              
              <Link href="/admin/parks">
                <Button variant="outline" className="w-full mt-2">
                  Ver todos los parques
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent comments */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Comentarios Recientes</CardTitle>
            <CardDescription>Los últimos comentarios de los ciudadanos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-secondary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">María L.</p>
                  <p className="text-xs text-muted-foreground">
                    "Excelente parque, muy limpio y seguro. Me encanta venir los fines de semana."
                  </p>
                  <div className="flex items-center pt-1">
                    <p className="text-xs text-muted-foreground">Parque Metropolitano • Hace 2 días</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-secondary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Carlos R.</p>
                  <p className="text-xs text-muted-foreground">
                    "Las instalaciones deportivas están en muy buen estado. Recomendado."
                  </p>
                  <div className="flex items-center pt-1">
                    <p className="text-xs text-muted-foreground">Parque Deportivo • Hace 3 días</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-secondary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Sofia T.</p>
                  <p className="text-xs text-muted-foreground">
                    "Me encantaron las áreas para mascotas. Mi perro lo disfrutó mucho."
                  </p>
                  <div className="flex items-center pt-1">
                    <p className="text-xs text-muted-foreground">Bosque Los Colomos • Hace 5 días</p>
                  </div>
                </div>
              </div>
              
              <Link href="/admin/comments">
                <Button variant="outline" className="w-full mt-2">
                  Ver todos los comentarios
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent incidents */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Incidentes Recientes</CardTitle>
            <CardDescription>Los últimos reportes de incidentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center">
                    <p className="text-sm font-medium leading-none">Juegos infantiles dañados</p>
                    <Badge variant="outline" className="ml-2 text-red-500 bg-red-50">Alto</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    "Los columpios están rotos y son peligrosos para los niños."
                  </p>
                  <div className="flex items-center pt-1">
                    <p className="text-xs text-muted-foreground">Parque Metropolitano • Pendiente</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center">
                    <p className="text-sm font-medium leading-none">Falta de iluminación</p>
                    <Badge variant="outline" className="ml-2 text-yellow-500 bg-yellow-50">Medio</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    "Las luminarias del sector norte no funcionan, generando inseguridad."
                  </p>
                  <div className="flex items-center pt-1">
                    <p className="text-xs text-muted-foreground">Parque Agua Azul • En progreso</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-green-500" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center">
                    <p className="text-sm font-medium leading-none">Banca rota</p>
                    <Badge variant="outline" className="ml-2 text-green-500 bg-green-50">Bajo</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    "Banca de madera rota en la zona de picnic."
                  </p>
                  <div className="flex items-center pt-1">
                    <p className="text-xs text-muted-foreground">Bosque Los Colomos • Resuelto</p>
                  </div>
                </div>
              </div>
              
              <Link href="/admin/incidents">
                <Button variant="outline" className="w-full mt-2">
                  Ver todos los incidentes
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;