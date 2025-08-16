import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Star, 
  CheckCircle2, 
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  BookOpen,
  Users,
  Calendar,
  Building,
  Target,
  Heart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EvaluationCriterion {
  id: number;
  name: string;
  description: string;
  entityType: 'parques' | 'instructores' | 'voluntarios' | 'actividades' | 'concesionarios' | 'eventos';
  weight: number;
  isActive: boolean;
  minValue: number;
  maxValue: number;
  createdAt: string;
  updatedAt: string;
}

const CriteriosEvaluacion = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener criterios de evaluación
  const { data: criteria = [], isLoading } = useQuery<EvaluationCriterion[]>({
    queryKey: ['/api/evaluations/criteria'],
  });

  // Filtrar criterios
  const filteredCriteria = criteria.filter((criterion) => {
    const matchesSearch = 
      criterion.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      criterion.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEntity = entityFilter === 'all' || criterion.entityType === entityFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' ? criterion.isActive : !criterion.isActive);
    
    return matchesSearch && matchesEntity && matchesStatus;
  });

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'parques':
        return <BookOpen className="h-4 w-4 text-green-500" />;
      case 'instructores':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'voluntarios':
        return <Heart className="h-4 w-4 text-purple-500" />;
      case 'actividades':
        return <Calendar className="h-4 w-4 text-orange-500" />;
      case 'concesionarios':
        return <Building className="h-4 w-4 text-teal-500" />;
      case 'eventos':
        return <Target className="h-4 w-4 text-red-500" />;
      default:
        return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEntityColor = (entityType: string) => {
    switch (entityType) {
      case 'parques':
        return 'bg-green-100 text-green-800';
      case 'instructores':
        return 'bg-blue-100 text-blue-800';
      case 'voluntarios':
        return 'bg-purple-100 text-purple-800';
      case 'actividades':
        return 'bg-orange-100 text-orange-800';
      case 'concesionarios':
        return 'bg-teal-100 text-teal-800';
      case 'eventos':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEntityLabel = (entityType: string) => {
    switch (entityType) {
      case 'parques':
        return 'Parques';
      case 'instructores':
        return 'Instructores';
      case 'voluntarios':
        return 'Voluntarios';
      case 'actividades':
        return 'Actividades';
      case 'concesionarios':
        return 'Concesionarios';
      case 'eventos':
        return 'Eventos';
      default:
        return 'General';
    }
  };

  // Estadísticas por tipo de entidad
  const stats = {
    total: criteria.length,
    active: criteria.filter(c => c.isActive).length,
    inactive: criteria.filter(c => !c.isActive).length,
    byEntity: {
      parques: criteria.filter(c => c.entityType === 'parques').length,
      instructores: criteria.filter(c => c.entityType === 'instructores').length,
      voluntarios: criteria.filter(c => c.entityType === 'voluntarios').length,
      actividades: criteria.filter(c => c.entityType === 'actividades').length,
      concesionarios: criteria.filter(c => c.entityType === 'concesionarios').length,
      eventos: criteria.filter(c => c.entityType === 'eventos').length,
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Criterios de Evaluación" subtitle="Cargando criterios de evaluación...">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Criterios de Evaluación" subtitle="Gestión y configuración de criterios de evaluación por tipo de entidad">
      <div className="p-6 space-y-6">
        {/* Header con estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Settings className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Parques</p>
                  <p className="text-2xl font-bold text-green-600">{stats.byEntity.parques}</p>
                </div>
                <BookOpen className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Instructores</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.byEntity.instructores}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Voluntarios</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.byEntity.voluntarios}</p>
                </div>
                <Heart className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Actividades</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.byEntity.actividades}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Concesionarios</p>
                  <p className="text-2xl font-bold text-teal-600">{stats.byEntity.concesionarios}</p>
                </div>
                <Building className="h-8 w-8 text-teal-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Eventos</p>
                  <p className="text-2xl font-bold text-red-600">{stats.byEntity.eventos}</p>
                </div>
                <Target className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controles y filtros */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              value={entityFilter} 
              onChange={(e) => setEntityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las entidades</option>
              <option value="parques">Parques</option>
              <option value="instructores">Instructores</option>
              <option value="voluntarios">Voluntarios</option>
              <option value="actividades">Actividades</option>
              <option value="concesionarios">Concesionarios</option>
              <option value="eventos">Eventos</option>
            </select>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros Avanzados
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Criterio
            </Button>
          </div>
        </div>

        {/* Lista de criterios */}
        <div className="grid gap-4">
          {filteredCriteria.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron criterios de evaluación</p>
                <p className="text-sm text-gray-400 mt-2">
                  {searchTerm || entityFilter !== 'all' || statusFilter !== 'all'
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Los criterios aparecerán aquí una vez que se registren'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredCriteria.map((criterion) => (
              <Card key={criterion.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getEntityIcon(criterion.entityType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {criterion.name}
                          </h3>
                          <Badge className={getEntityColor(criterion.entityType)}>
                            {getEntityLabel(criterion.entityType)}
                          </Badge>
                          {criterion.isActive ? (
                            <ToggleRight className="h-5 w-5 text-green-500" />
                          ) : (
                            <ToggleLeft className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {criterion.description}
                        </p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>Peso: {criterion.weight}%</span>
                          <span>Rango: {criterion.minValue} - {criterion.maxValue}</span>
                          <span>
                            Actualizado: {new Date(criterion.updatedAt).toLocaleDateString('es-MX')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={criterion.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                        }
                      >
                        {criterion.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>

                  {/* Barra de peso visual */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Peso en evaluación</span>
                      <span>{criterion.weight}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${criterion.weight}%` }}
                      />
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Ver Detalles
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`flex items-center gap-2 ${
                        criterion.isActive 
                          ? 'text-red-600 hover:text-red-700' 
                          : 'text-green-600 hover:text-green-700'
                      }`}
                    >
                      {criterion.isActive ? (
                        <>
                          <ToggleLeft className="h-4 w-4" />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <ToggleRight className="h-4 w-4" />
                          Activar
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default CriteriosEvaluacion;