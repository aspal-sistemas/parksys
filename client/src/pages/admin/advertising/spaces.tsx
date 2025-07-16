import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';
import { LayoutGrid, Monitor, Search, Filter, Plus, Edit, Trash2, Eye } from 'lucide-react';

interface AdSpace {
  id: number;
  pageType: string;
  position: string;
  dimensions: string;
  maxFileSize: number;
  allowedFormats: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdSpaces = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPageType, setFilterPageType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    page_type: '',
    position: '',
    page_identifier: '',
    width: '',
    height: '',
    category: 'commercial',
    is_active: true
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutación para crear espacios
  const createSpaceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/advertising/spaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Error al crear el espacio publicitario');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertising/spaces'] });
      setIsCreateModalOpen(false);
      setFormData({
        name: '',
        description: '',
        page_type: '',
        position: '',
        page_identifier: '',
        width: '',
        height: '',
        category: 'commercial',
        is_active: true
      });
      toast({
        title: "Éxito",
        description: "Espacio publicitario creado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear el espacio publicitario",
        variant: "destructive",
      });
    },
  });

  // Mutación para actualizar espacios
  const updateSpaceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/advertising/spaces/${selectedSpace.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Error al actualizar el espacio publicitario');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertising/spaces'] });
      setIsEditModalOpen(false);
      setSelectedSpace(null);
      setFormData({
        name: '',
        description: '',
        page_type: '',
        position: '',
        page_identifier: '',
        width: '',
        height: '',
        category: 'commercial',
        is_active: true
      });
      toast({
        title: "Éxito",
        description: "Espacio publicitario actualizado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el espacio publicitario",
        variant: "destructive",
      });
    },
  });

  const { data: apiResponse, isLoading, error } = useQuery({
    queryKey: ['/api/advertising/spaces'],
    queryFn: async () => {
      const response = await fetch('/api/advertising/spaces');
      if (!response.ok) {
        throw new Error('Error al cargar espacios publicitarios');
      }
      return response.json();
    }
  });

  // Extraer los datos del wrapper de respuesta
  const spaces = apiResponse?.success ? apiResponse.data : [];

  const filteredSpaces = Array.isArray(spaces) ? spaces.filter(space => {
    const spaceName = `${space.pageType} - ${space.position}`;
    const matchesSearch = spaceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         space.dimensions.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPageType = filterPageType === 'all' || space.pageType === filterPageType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && space.isActive) ||
                         (filterStatus === 'inactive' && !space.isActive);
    
    return matchesSearch && matchesPageType && matchesStatus;
  }) : [];

  const getPageTypeColor = (pageType: string) => {
    const colors = {
      'parks': 'bg-green-100 text-green-800',
      'tree-species': 'bg-blue-100 text-blue-800',
      'activities': 'bg-purple-100 text-purple-800',
      'concessions': 'bg-orange-100 text-orange-800',
      'homepage': 'bg-red-100 text-red-800'
    };
    return colors[pageType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPositionBadge = (position: string) => {
    const positions = {
      'header': 'Header',
      'sidebar': 'Sidebar',
      'footer': 'Footer',
      'hero': 'Hero',
      'content': 'Contenido'
    };
    return positions[position as keyof typeof positions] || position;
  };

  const getPageTypeLabel = (pageType: string) => {
    const types = {
      'parks': 'Parques',
      'tree-species': 'Especies Arbóreas',
      'activities': 'Actividades',
      'concessions': 'Concesiones',
      'homepage': 'Página Principal',
      'instructors': 'Instructores',
      'volunteers': 'Voluntarios',
      'activity-detail': 'Detalle de Actividad',
      'instructor-profile': 'Perfil de Instructor'
    };
    return types[pageType as keyof typeof types] || pageType;
  };

  const getPositionLabel = (position: string) => {
    const positions = {
      'header': 'Encabezado',
      'sidebar': 'Barra lateral',
      'footer': 'Pie de página',
      'hero': 'Sección principal',
      'content': 'Contenido',
      'profile': 'Perfil'
    };
    return positions[position as keyof typeof positions] || position;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSpaceMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSpaceMutation.mutate(formData);
  };

  const handleEditClick = (space: any) => {
    setSelectedSpace(space);
    setFormData({
      name: space.name || '',
      description: space.description || '',
      page_type: space.page_type || space.pageType || '',
      position: space.position || '',
      page_identifier: space.page_identifier || space.pageIdentifier || '',
      width: space.width || '',
      height: space.height || '',
      category: space.category || 'commercial',
      is_active: space.is_active !== undefined ? space.is_active : space.isActive !== undefined ? space.isActive : true
    });
    setIsEditModalOpen(true);
  };

  const handleViewSpace = (space: any) => {
    setSelectedSpace(space);
    setIsViewModalOpen(true);
  };

  const handleEditSpace = (space: any) => {
    setSelectedSpace(space);
    setFormData({
      name: space.name || '',
      description: space.description || '',
      page_type: space.page_type || '',
      position: space.position || '',
      page_identifier: space.page_identifier || '',
      width: space.width || '',
      height: space.height || '',
      category: space.category || 'commercial',
      is_active: space.is_active !== undefined ? space.is_active : true
    });
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando espacios publicitarios...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">Error al cargar espacios publicitarios</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Espacios Publicitarios</h1>
          <p className="text-gray-600">Gestión de espacios publicitarios disponibles en el sistema</p>
        </div>

        {/* Controles de búsqueda y filtros */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar espacios por nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterPageType} onValueChange={setFilterPageType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo de página" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las páginas</SelectItem>
                  <SelectItem value="parks">Parques</SelectItem>
                  <SelectItem value="tree-species">Especies Arbóreas</SelectItem>
                  <SelectItem value="activities">Actividades</SelectItem>
                  <SelectItem value="concessions">Concesiones</SelectItem>
                  <SelectItem value="homepage">Homepage</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#00a587] hover:bg-[#067f5f]">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Espacio
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Espacio Publicitario</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nombre del Espacio</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="ej: Header Principal Homepage"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descripción del espacio publicitario"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="page_type">Tipo de Página</Label>
                        <Select value={formData.page_type} onValueChange={(value) => setFormData(prev => ({ ...prev, page_type: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="parks">Parques</SelectItem>
                            <SelectItem value="tree-species">Especies Arbóreas</SelectItem>
                            <SelectItem value="activities">Actividades</SelectItem>
                            <SelectItem value="concessions">Concesiones</SelectItem>
                            <SelectItem value="homepage">Homepage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="position">Posición</Label>
                        <Select value={formData.position} onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar posición" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="header">Header</SelectItem>
                            <SelectItem value="sidebar">Sidebar</SelectItem>
                            <SelectItem value="footer">Footer</SelectItem>
                            <SelectItem value="hero">Hero</SelectItem>
                            <SelectItem value="content">Contenido</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="page_identifier">Identificador de Página</Label>
                      <Input
                        id="page_identifier"
                        value={formData.page_identifier}
                        onChange={(e) => setFormData(prev => ({ ...prev, page_identifier: e.target.value }))}
                        placeholder="ej: homepage, park-detail, activities-list"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="width">Ancho (px)</Label>
                        <Input
                          id="width"
                          type="number"
                          value={formData.width}
                          onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value }))}
                          placeholder="ej: 300"
                        />
                      </div>
                      <div>
                        <Label htmlFor="height">Alto (px)</Label>
                        <Input
                          id="height"
                          type="number"
                          value={formData.height}
                          onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                          placeholder="ej: 250"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Categoría</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="commercial">Comercial</SelectItem>
                          <SelectItem value="institutional">Institucional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                      />
                      <Label htmlFor="is_active">Activo</Label>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-[#00a587] hover:bg-[#067f5f]" disabled={createSpaceMutation.isPending}>
                        {createSpaceMutation.isPending ? 'Creando...' : 'Crear Espacio'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Modal para Ver Espacio */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles del Espacio Publicitario</DialogTitle>
            </DialogHeader>
            {selectedSpace && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Nombre</Label>
                    <p className="text-sm text-gray-900">{selectedSpace.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">ID</Label>
                    <p className="text-sm text-gray-900">#{selectedSpace.id}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Descripción</Label>
                  <p className="text-sm text-gray-900">{selectedSpace.description || 'Sin descripción'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Tipo de Página</Label>
                    <p className="text-sm text-gray-900">{getPageTypeLabel(selectedSpace.page_type)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Posición</Label>
                    <p className="text-sm text-gray-900">{getPositionLabel(selectedSpace.position)}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Identificador de Página</Label>
                  <p className="text-sm text-gray-900">{selectedSpace.page_identifier || 'No especificado'}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Ancho</Label>
                    <p className="text-sm text-gray-900">{selectedSpace.width ? `${selectedSpace.width}px` : 'No especificado'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Alto</Label>
                    <p className="text-sm text-gray-900">{selectedSpace.height ? `${selectedSpace.height}px` : 'No especificado'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Categoría</Label>
                    <p className="text-sm text-gray-900">{selectedSpace.category === 'commercial' ? 'Comercial' : 'Institucional'}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Estado</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedSpace.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedSpace.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button onClick={() => setIsViewModalOpen(false)}>
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal para Editar Espacio */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Espacio Publicitario</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Nombre</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nombre del espacio"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-page_type">Tipo de Página</Label>
                  <Select value={formData.page_type} onValueChange={(value) => setFormData(prev => ({ ...prev, page_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homepage">Página Principal</SelectItem>
                      <SelectItem value="parks">Parques</SelectItem>
                      <SelectItem value="activities">Actividades</SelectItem>
                      <SelectItem value="activity-detail">Detalle de Actividad</SelectItem>
                      <SelectItem value="instructors">Instructores</SelectItem>
                      <SelectItem value="instructor-profile">Perfil de Instructor</SelectItem>
                      <SelectItem value="volunteers">Voluntarios</SelectItem>
                      <SelectItem value="concessions">Concesiones</SelectItem>
                      <SelectItem value="tree-species">Especies Arbóreas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-description">Descripción</Label>
                <textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del espacio publicitario"
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-position">Posición</Label>
                  <Select value={formData.position} onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar posición" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header">Encabezado</SelectItem>
                      <SelectItem value="sidebar">Barra lateral</SelectItem>
                      <SelectItem value="footer">Pie de página</SelectItem>
                      <SelectItem value="hero">Sección principal</SelectItem>
                      <SelectItem value="content">Contenido</SelectItem>
                      <SelectItem value="profile">Perfil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-page_identifier">Identificador de Página</Label>
                  <Input
                    id="edit-page_identifier"
                    value={formData.page_identifier}
                    onChange={(e) => setFormData(prev => ({ ...prev, page_identifier: e.target.value }))}
                    placeholder="ID específico de la página"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-width">Ancho (px)</Label>
                  <Input
                    id="edit-width"
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value }))}
                    placeholder="ej: 300"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-height">Alto (px)</Label>
                  <Input
                    id="edit-height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                    placeholder="ej: 250"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-category">Categoría</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commercial">Comercial</SelectItem>
                    <SelectItem value="institutional">Institucional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="edit-is_active">Activo</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#00a587] hover:bg-[#067f5f]" disabled={updateSpaceMutation.isPending}>
                  {updateSpaceMutation.isPending ? 'Actualizando...' : 'Actualizar Espacio'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Espacios</CardTitle>
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{spaces.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <Monitor className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{spaces.filter(s => s.isActive).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
              <Monitor className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{spaces.filter(s => !s.isActive).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamaño Promedio</CardTitle>
              <Monitor className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {spaces.length > 0 ? Math.round(spaces.reduce((sum, s) => sum + s.maxFileSize, 0) / spaces.length / 1024 / 1024) : 0}MB
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de espacios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSpaces.map((space) => (
            <Card key={space.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{space.pageType} - {space.position}</CardTitle>
                  <Badge variant={space.isActive ? "default" : "secondary"}>
                    {space.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <CardDescription>Espacio publicitario en {space.pageType}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tipo de página:</span>
                    <Badge className={getPageTypeColor(space.pageType)}>
                      {space.pageType}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Posición:</span>
                    <Badge variant="outline">{getPositionBadge(space.position)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Dimensiones:</span>
                    <span className="text-sm text-gray-600">{space.dimensions || 'Responsive'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tamaño máximo:</span>
                    <span className="text-sm font-bold text-[#00a587]">{space.maxFileSize ? Math.round(space.maxFileSize / 1024 / 1024) + 'MB' : 'Sin límite'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Formatos:</span>
                    <span className="text-sm text-gray-600">{space.allowedFormats ? space.allowedFormats.join(', ') : 'Todos'}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewSpace(space)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditClick(space)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSpaces.length === 0 && (
          <div className="text-center py-12">
            <Monitor className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron espacios</h3>
            <p className="text-gray-600">
              {searchTerm || filterPageType !== 'all' || filterStatus !== 'all'
                ? 'No hay espacios que coincidan con los filtros aplicados'
                : 'Aún no hay espacios publicitarios configurados'}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdSpaces;