import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Search, TreePine, Eye, Edit, Filter } from 'lucide-react';
import { Link } from 'wouter';

interface Tree {
  id: number;
  speciesName: string;
  scientificName: string;
  condition: string;
  healthStatus: string;
  height: number;
  diameter: number;
  locationDescription: string;
  plantingDate: string;
  lastMaintenanceDate: string;
  notes: string;
}

interface ParkTreesInventoryProps {
  parkId: number;
}

const ParkTreesInventory: React.FC<ParkTreesInventoryProps> = ({ parkId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState('all');
  const itemsPerPage = 10;

  // Consultar árboles específicos del parque
  const { data: treesData, isLoading, error } = useQuery({
    queryKey: ['/api/trees', parkId, currentPage, searchTerm, conditionFilter],
    queryFn: async () => {
      let url = `/api/trees?parkId=${parkId}&page=${currentPage}&limit=${itemsPerPage}`;
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      if (conditionFilter !== 'all') {
        url += `&condition=${conditionFilter}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error al cargar los árboles del parque');
      }
      
      return response.json();
    },
  });

  // Función para obtener el color del badge según la condición
  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'Bueno':
        return 'bg-green-100 text-green-800';
      case 'Regular':
        return 'bg-yellow-100 text-yellow-800';
      case 'Malo':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No registrada';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const trees = treesData?.data || [];
  const totalPages = Math.ceil((treesData?.total || 0) / itemsPerPage);

  // Resetear página cuando cambian los filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, conditionFilter]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>Error al cargar el inventario de árboles</p>
        <p className="text-sm mt-2">Por favor, intenta nuevamente</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por especie, ubicación o notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={conditionFilter} onValueChange={setConditionFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por condición" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las condiciones</SelectItem>
            <SelectItem value="Bueno">Bueno</SelectItem>
            <SelectItem value="Regular">Regular</SelectItem>
            <SelectItem value="Malo">Malo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla de árboles */}
      {trees.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <TreePine className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium mb-2">No hay árboles registrados</p>
          <p className="text-sm">
            {searchTerm || conditionFilter !== 'all' 
              ? 'No se encontraron árboles con los filtros aplicados'
              : 'Este parque aún no tiene árboles registrados en el inventario'
            }
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Especie</TableHead>
                <TableHead>Condición</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Dimensiones</TableHead>
                <TableHead>Última Mantención</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trees.map((tree: Tree) => (
                <TableRow key={tree.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{tree.speciesName}</div>
                      <div className="text-sm text-gray-500 italic">{tree.scientificName}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getConditionBadge(tree.condition || tree.healthStatus)}>
                      {tree.condition || tree.healthStatus || 'No especificada'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {tree.locationDescription || 'No especificada'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {tree.height ? `${tree.height} m` : '-'} × {tree.diameter ? `${tree.diameter} cm` : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(tree.lastMaintenanceDate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/admin/trees/inventory/${tree.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/trees/inventory/${tree.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-500">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, treesData?.total || 0)} de {treesData?.total || 0} árboles
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            
            {/* Números de página */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className={currentPage === pageNum ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {pageNum}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkTreesInventory;