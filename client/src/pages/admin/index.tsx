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
      
      {/* Module Access Cards */}
      <h2 className="text-xl font-semibold mb-4">Módulos del Sistema</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Espacios Verdes Module */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Layers className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Espacios Verdes</CardTitle>
                <CardDescription>Gestión de parques y amenidades</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex flex-col items-center bg-gray-50 p-2 rounded-md">
                <MapPin className="h-4 w-4 text-muted-foreground mb-1" />
                <span className="text-xs font-medium">{parks.length} Parques</span>
              </div>
              <div className="flex flex-col items-center bg-gray-50 p-2 rounded-md">
                <Tag className="h-4 w-4 text-muted-foreground mb-1" />
                <span className="text-xs font-medium">28 Amenidades</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-0">
            <Link href="/admin/parks">
              <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                Ver parques
              </Button>
            </Link>
            <Link href="/admin/amenities">
              <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                Ver amenidades
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        {/* Eventos Module */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Eventos y Reportes</CardTitle>
                <CardDescription>Actividades e incidentes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex flex-col items-center bg-gray-50 p-2 rounded-md">
                <Calendar className="h-4 w-4 text-muted-foreground mb-1" />
                <span className="text-xs font-medium">36 Actividades</span>
              </div>
              <div className="flex flex-col items-center bg-gray-50 p-2 rounded-md">
                <AlertTriangle className="h-4 w-4 text-muted-foreground mb-1" />
                <span className="text-xs font-medium">12 Incidentes</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-0">
            <Link href="/admin/activities">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                Ver actividades
              </Button>
            </Link>
            <Link href="/admin/incidents">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                Ver incidentes
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        {/* Media Module */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Contenido Multimedia</CardTitle>
                <CardDescription>Documentos, imágenes y videos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex flex-col items-center bg-gray-50 p-2 rounded-md">
                <FileText className="h-4 w-4 text-muted-foreground mb-1" />
                <span className="text-xs font-medium">45 Documentos</span>
              </div>
              <div className="flex flex-col items-center bg-gray-50 p-2 rounded-md">
                <Users className="h-4 w-4 text-muted-foreground mb-1" />
                <span className="text-xs font-medium">120 Imágenes</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-0">
            <Link href="/admin/documents">
              <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                Ver documentos
              </Button>
            </Link>
            <Link href="/admin/images">
              <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                Ver imágenes
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        {/* Community Module */}
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle>Comunidad</CardTitle>
                <CardDescription>Comentarios y usuarios</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex flex-col items-center bg-gray-50 p-2 rounded-md">
                <MessageSquare className="h-4 w-4 text-muted-foreground mb-1" />
                <span className="text-xs font-medium">138 Comentarios</span>
              </div>
              <div className="flex flex-col items-center bg-gray-50 p-2 rounded-md">
                <Users className="h-4 w-4 text-muted-foreground mb-1" />
                <span className="text-xs font-medium">25 Usuarios</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-0">
            <Link href="/admin/comments">
              <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                Ver comentarios
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                Ver usuarios
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        {/* Analytics Module */}
        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <BarChart className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <CardTitle>Análisis y Reportes</CardTitle>
                <CardDescription>Estadísticas y exportación</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex flex-col items-center bg-gray-50 p-2 rounded-md">
                <BarChart className="h-4 w-4 text-muted-foreground mb-1" />
                <span className="text-xs font-medium">5 Reportes</span>
              </div>
              <div className="flex flex-col items-center bg-gray-50 p-2 rounded-md">
                <ArrowDown className="h-4 w-4 text-muted-foreground mb-1" />
                <span className="text-xs font-medium">12 Descargas</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-0">
            <Link href="/admin/analytics">
              <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                Ver analytics
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                Ver reportes
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        {/* System Module */}
        <Card className="border-l-4 border-l-slate-500">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <Settings className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <CardTitle>Sistema</CardTitle>
                <CardDescription>Configuración y administración</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex flex-col items-center bg-gray-50 p-2 rounded-md">
                <Building className="h-4 w-4 text-muted-foreground mb-1" />
                <span className="text-xs font-medium">5 Municipios</span>
              </div>
              <div className="flex flex-col items-center bg-gray-50 p-2 rounded-md">
                <Settings className="h-4 w-4 text-muted-foreground mb-1" />
                <span className="text-xs font-medium">Configuración</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-0">
            <Link href="/admin/municipalities">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-700 hover:bg-slate-50">
                Ver municipios
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-700 hover:bg-slate-50">
                Configuración
              </Button>
            </Link>
          </CardFooter>
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