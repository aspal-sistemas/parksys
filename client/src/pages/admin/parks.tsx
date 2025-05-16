import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Edit, 
  Trash2, 
  CalendarDays, 
  FileText,
  MoreVertical
} from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AdminSidebar from '@/components/AdminSidebar';
import { Park, PARK_TYPES } from '@shared/schema';

const AdminParks: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch parks
  const { data: parks = [], isLoading } = useQuery<Park[]>({
    queryKey: ['/api/parks'],
  });
  
  // Filter parks based on search query
  const filteredParks = parks.filter(park => 
    park.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    park.address.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get park type label
  const getParkTypeLabel = (type: string) => {
    const parkType = PARK_TYPES.find(pt => pt.value === type);
    return parkType ? parkType.label : type;
  };
  
  // Get badge color based on park type
  const getParkTypeBadgeClass = (type: string) => {
    const typeColorMap: Record<string, string> = {
      'metropolitano': 'bg-primary-100 text-primary-800',
      'barrial': 'bg-yellow-100 text-yellow-800',
      'vecinal': 'bg-orange-100 text-orange-800',
      'lineal': 'bg-blue-100 text-blue-800',
      'ecologico': 'bg-green-100 text-green-800',
      'botanico': 'bg-emerald-100 text-emerald-800',
      'deportivo': 'bg-purple-100 text-purple-800'
    };
    return typeColorMap[type] || 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-1">Parques</h1>
              <p className="text-muted-foreground">
                Administra los parques y espacios verdes en el sistema
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link href="/admin/parks/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Parque
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Search and filters */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card className="col-span-2">
              <CardHeader className="pb-3">
                <CardTitle>Buscar parques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre o dirección"
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  <Filter className="mr-2 h-4 w-4" />
                  Aplicar filtros
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Parks table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Parques</CardTitle>
              <Separator />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-10 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                  <p className="mt-2 text-muted-foreground">Cargando parques...</p>
                </div>
              ) : filteredParks.length === 0 ? (
                <div className="py-10 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-lg font-medium mb-1">No se encontraron parques</h2>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? "No hay parques que coincidan con tu búsqueda" 
                      : "Aún no has agregado ningún parque al sistema"}
                  </p>
                  {searchQuery ? (
                    <Button onClick={() => setSearchQuery('')} variant="outline">
                      Limpiar búsqueda
                    </Button>
                  ) : (
                    <Link href="/admin/parks/new">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar Primer Parque
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="hidden md:table-cell">Ubicación</TableHead>
                        <TableHead className="hidden lg:table-cell">Superficie</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredParks.map((park) => (
                        <TableRow key={park.id}>
                          <TableCell className="font-medium">
                            <Link href={`/parks/${park.id}`}>
                              <span className="cursor-pointer hover:text-primary">
                                {park.name}
                              </span>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge className={getParkTypeBadgeClass(park.parkType)}>
                              {getParkTypeLabel(park.parkType)}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span className="truncate max-w-xs">{park.address}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {park.area || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Acciones</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Link href={`/admin/parks/${park.id}`}>
                                    <div className="flex items-center">
                                      <Edit className="mr-2 h-4 w-4" />
                                      <span>Editar</span>
                                    </div>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" />
                                  <span>Documentos</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <CalendarDays className="mr-2 h-4 w-4" />
                                  <span>Actividades</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Eliminar</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminParks;
