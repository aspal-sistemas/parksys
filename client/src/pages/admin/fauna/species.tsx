import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Grid3X3, 
  List, 
  Download, 
  Upload,
  Heart,
  Fish,
  Bug,
  Rabbit,
  ChevronLeft,
  ChevronRight,
  FileDown,
  FileUp,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertFaunaSpeciesSchema, type FaunaSpecies } from '@shared/schema';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';
import { apiRequest } from '@/lib/queryClient';
import { ImageUploader } from '@/components/ImageUploader';

interface FaunaSpeciesWithPagination {
  data: FaunaSpecies[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const FaunaSpeciesAdmin: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [conservationFilter, setConservationFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<FaunaSpecies | null>(null);
  
  const itemsPerPage = 9;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para obtener especies de fauna
  const { data: speciesResponse, isLoading } = useQuery<FaunaSpeciesWithPagination>({
    queryKey: ['/api/fauna/species', { 
      page: currentPage, 
      limit: itemsPerPage, 
      search: searchTerm,
      category: categoryFilter,
      conservation_status: conservationFilter
    }]
  });

  // Query para estadísticas
  const { data: stats } = useQuery({
    queryKey: ['/api/fauna/stats']
  });

  // Formulario para crear/editar especies
  const form = useForm({
    resolver: zodResolver(insertFaunaSpeciesSchema),
    defaultValues: {
      commonName: '',
      scientificName: '',
      family: '',
      category: 'aves' as const,
      habitat: '',
      description: '',
      behavior: '',
      diet: '',
      reproductionPeriod: '',
      conservationStatus: 'estable' as const,
      sizeCm: '',
      weightGrams: '',
      lifespan: 0,
      isNocturnal: false,
      isMigratory: false,
      isEndangered: false,
      imageUrl: '',
      photoUrl: '',
      photoCaption: '',
      ecologicalImportance: '',
      threats: '',
      protectionMeasures: '',
      observationTips: '',
      bestObservationTime: '',
      commonLocations: [],
      iconColor: '#16a085'
    }
  });

  // Mutaciones
  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/fauna/species', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fauna/species'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fauna/stats'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({ title: 'Especie creada exitosamente' });
    },
    onError: () => {
      toast({ title: 'Error al crear la especie', variant: 'destructive' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/fauna/species/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fauna/species'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fauna/stats'] });
      setIsEditDialogOpen(false);
      form.reset();
      toast({ title: 'Especie actualizada exitosamente' });
    },
    onError: () => {
      toast({ title: 'Error al actualizar la especie', variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/fauna/species/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fauna/species'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fauna/stats'] });
      toast({ title: 'Especie eliminada exitosamente' });
    },
    onError: () => {
      toast({ title: 'Error al eliminar la especie', variant: 'destructive' });
    }
  });

  const species = speciesResponse?.data || [];
  const pagination = speciesResponse?.pagination;

  // Funciones de manejo
  const handleCreate = (data: any) => {
    console.log('Datos del formulario:', data);
    // Filtrar campos vacíos y enviar solo los que tienen valor
    const cleanData = {
      commonName: data.commonName,
      scientificName: data.scientificName,
      family: data.family,
      category: data.category,
      conservationStatus: data.conservationStatus || 'estable',
      isNocturnal: data.isNocturnal || false,
      isMigratory: data.isMigratory || false,
      isEndangered: data.isEndangered || false,
      commonLocations: data.commonLocations || [],
      iconColor: data.iconColor || '#16a085',
      iconType: data.iconType || 'system'
    };

    // Añadir campos opcionales solo si tienen valor
    if (data.habitat) cleanData.habitat = data.habitat;
    if (data.description) cleanData.description = data.description;
    if (data.behavior) cleanData.behavior = data.behavior;
    if (data.diet) cleanData.diet = data.diet;
    if (data.reproductionPeriod) cleanData.reproductionPeriod = data.reproductionPeriod;
    if (data.sizeCm) cleanData.sizeCm = data.sizeCm;
    if (data.weightGrams) cleanData.weightGrams = data.weightGrams;
    if (data.lifespan) cleanData.lifespan = data.lifespan;
    if (data.imageUrl) cleanData.imageUrl = data.imageUrl;
    if (data.photoUrl) cleanData.photoUrl = data.photoUrl;
    if (data.photoCaption) cleanData.photoCaption = data.photoCaption;
    if (data.ecologicalImportance) cleanData.ecologicalImportance = data.ecologicalImportance;
    if (data.threats) cleanData.threats = data.threats;
    if (data.protectionMeasures) cleanData.protectionMeasures = data.protectionMeasures;
    if (data.observationTips) cleanData.observationTips = data.observationTips;
    if (data.bestObservationTime) cleanData.bestObservationTime = data.bestObservationTime;
    console.log('Datos limpiados:', cleanData);
    createMutation.mutate(cleanData);
  };

  const handleEdit = (speciesData: FaunaSpecies) => {
    setSelectedSpecies(speciesData);
    form.reset(speciesData);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (data: any) => {
    if (selectedSpecies) {
      updateMutation.mutate({ id: selectedSpecies.id, data });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta especie?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleView = (speciesData: FaunaSpecies) => {
    setSelectedSpecies(speciesData);
    setIsViewDialogOpen(true);
  };

  // Función para obtener el ícono de categoría
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'aves': return <Heart className="h-5 w-5 text-blue-600" />;
      case 'mamiferos': return <Rabbit className="h-5 w-5 text-green-600" />;
      case 'insectos': return <Bug className="h-5 w-5 text-yellow-600" />;
      case 'vida_acuatica': return <Fish className="h-5 w-5 text-teal-600" />;
      default: return <Heart className="h-5 w-5 text-gray-600" />;
    }
  };

  // Función para obtener el color del badge de estado de conservación
  const getConservationStatusColor = (status: string) => {
    switch (status) {
      case 'estable': return 'bg-green-100 text-green-800';
      case 'vulnerable': return 'bg-yellow-100 text-yellow-800';
      case 'en_peligro': return 'bg-orange-100 text-orange-800';
      case 'en_peligro_critico': return 'bg-red-100 text-red-800';
      case 'extinto_local': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Fauna</h1>
            <p className="text-gray-600">Administra el catálogo de especies de fauna urbana</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileUp className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <Button variant="outline" size="sm">
              <FileDown className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Especie
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Especie</DialogTitle>
                  <DialogDescription>
                    Agrega una nueva especie al catálogo de fauna
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => {
                    console.log('SUBMIT EJECUTADO', data);
                    handleCreate(data);
                  })} className="space-y-4">
                    {/* Subida de Imagen */}
                    <div className="space-y-2">
                      <Label>Fotografía de la Especie</Label>
                      <ImageUploader
                        currentImageUrl={form.watch('photoUrl')}
                        onImageUploaded={(url) => form.setValue('photoUrl', url)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="commonName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre Común</FormLabel>
                            <FormControl>
                              <Input placeholder="Nombre común de la especie" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="scientificName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre Científico</FormLabel>
                            <FormControl>
                              <Input placeholder="Nombre científico" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="family"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Familia</FormLabel>
                            <FormControl>
                              <Input placeholder="Familia taxonómica" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoría</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar categoría" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="aves">Aves</SelectItem>
                                <SelectItem value="mamiferos">Mamíferos</SelectItem>
                                <SelectItem value="insectos">Insectos</SelectItem>
                                <SelectItem value="vida_acuatica">Vida Acuática</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="habitat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hábitat</FormLabel>
                          <FormControl>
                            <Input placeholder="Hábitat natural" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Descripción de la especie" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="behavior"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comportamiento</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Comportamiento de la especie" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createMutation.isPending}
                        onClick={() => console.log('BOTÓN CLICKEADO', form.formState.errors)}
                      >
                        {createMutation.isPending ? 'Creando...' : 'Crear Especie'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Especies</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.data.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Especies Aves</CardTitle>
                <Heart className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.data.byCategory.find(c => c.category === 'aves')?.count || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mamíferos</CardTitle>
                <Rabbit className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.data.byCategory.find(c => c.category === 'mamiferos')?.count || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Peligro</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.data.endangered}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar especies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="aves">Aves</SelectItem>
                  <SelectItem value="mamiferos">Mamíferos</SelectItem>
                  <SelectItem value="insectos">Insectos</SelectItem>
                  <SelectItem value="vida_acuatica">Vida Acuática</SelectItem>
                </SelectContent>
              </Select>

              <Select value={conservationFilter} onValueChange={setConservationFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Estado Conservación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="estable">Estable</SelectItem>
                  <SelectItem value="vulnerable">Vulnerable</SelectItem>
                  <SelectItem value="en_peligro">En Peligro</SelectItem>
                  <SelectItem value="en_peligro_critico">Peligro Crítico</SelectItem>
                  <SelectItem value="extinto_local">Extinto Local</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de especies */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {species.map((sp) => (
            <Card key={sp.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(sp.category)}
                    <CardTitle className="text-lg">{sp.commonName}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleView(sp)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(sp)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(sp.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="italic">{sp.scientificName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {sp.category.replace('_', ' ')}
                    </Badge>
                    <Badge className={getConservationStatusColor(sp.conservationStatus)}>
                      {sp.conservationStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                  {sp.isEndangered && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      En Peligro
                    </Badge>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {sp.description || 'Sin descripción disponible'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Paginación */}
        {pagination && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
              {pagination.total} especies
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                disabled={pagination.page >= pagination.totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Diálogo de Edición */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Especie</DialogTitle>
              <DialogDescription>
                Modifica los datos de la especie seleccionada
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
                {/* Subida de Imagen */}
                <div className="space-y-2">
                  <Label>Fotografía de la Especie</Label>
                  <ImageUploader
                    currentImageUrl={form.watch('photoUrl')}
                    onImageUploaded={(url) => form.setValue('photoUrl', url)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="commonName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Común</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre común de la especie" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="scientificName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Científico</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre científico" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="family"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Familia</FormLabel>
                        <FormControl>
                          <Input placeholder="Familia taxonómica" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="aves">Aves</SelectItem>
                            <SelectItem value="mamiferos">Mamíferos</SelectItem>
                            <SelectItem value="insectos">Insectos</SelectItem>
                            <SelectItem value="vida_acuatica">Vida Acuática</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="habitat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hábitat</FormLabel>
                      <FormControl>
                        <Input placeholder="Hábitat natural" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descripción de la especie" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="conservationStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado de Conservación</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="estable">Estable</SelectItem>
                          <SelectItem value="vulnerable">Vulnerable</SelectItem>
                          <SelectItem value="en_peligro">En Peligro</SelectItem>
                          <SelectItem value="en_peligro_critico">Peligro Crítico</SelectItem>
                          <SelectItem value="extinto_local">Extinto Local</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Actualizando...' : 'Actualizar Especie'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Diálogo de Visualización */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedSpecies && getCategoryIcon(selectedSpecies.category)}
                {selectedSpecies?.commonName}
              </DialogTitle>
              <DialogDescription className="italic">
                {selectedSpecies?.scientificName}
              </DialogDescription>
            </DialogHeader>
            
            {selectedSpecies && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Imagen */}
                <div className="space-y-4">
                  {selectedSpecies.photoUrl && (
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={selectedSpecies.photoUrl}
                        alt={selectedSpecies.commonName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {selectedSpecies.category.replace('_', ' ')}
                    </Badge>
                    <Badge className={getConservationStatusColor(selectedSpecies.conservationStatus)}>
                      {selectedSpecies.conservationStatus.replace('_', ' ')}
                    </Badge>
                    {selectedSpecies.isEndangered && (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        En Peligro
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Información */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Información Básica</h3>
                    <div className="mt-2 space-y-2 text-sm">
                      <div><strong>Familia:</strong> {selectedSpecies.family}</div>
                      <div><strong>Hábitat:</strong> {selectedSpecies.habitat || 'No especificado'}</div>
                      {selectedSpecies.sizeCm && (
                        <div><strong>Tamaño:</strong> {selectedSpecies.sizeCm} cm</div>
                      )}
                      {selectedSpecies.weightGrams && (
                        <div><strong>Peso:</strong> {selectedSpecies.weightGrams} gramos</div>
                      )}
                      {selectedSpecies.lifespan && selectedSpecies.lifespan > 0 && (
                        <div><strong>Esperanza de vida:</strong> {selectedSpecies.lifespan} años</div>
                      )}
                    </div>
                  </div>

                  {selectedSpecies.description && (
                    <div>
                      <h3 className="font-semibold text-gray-900">Descripción</h3>
                      <p className="mt-2 text-sm text-gray-600">{selectedSpecies.description}</p>
                    </div>
                  )}

                  {selectedSpecies.behavior && (
                    <div>
                      <h3 className="font-semibold text-gray-900">Comportamiento</h3>
                      <p className="mt-2 text-sm text-gray-600">{selectedSpecies.behavior}</p>
                    </div>
                  )}

                  {selectedSpecies.diet && (
                    <div>
                      <h3 className="font-semibold text-gray-900">Dieta</h3>
                      <p className="mt-2 text-sm text-gray-600">{selectedSpecies.diet}</p>
                    </div>
                  )}

                  {selectedSpecies.ecologicalImportance && (
                    <div>
                      <h3 className="font-semibold text-gray-900">Importancia Ecológica</h3>
                      <p className="mt-2 text-sm text-gray-600">{selectedSpecies.ecologicalImportance}</p>
                    </div>
                  )}

                  {selectedSpecies.threats && (
                    <div>
                      <h3 className="font-semibold text-gray-900">Amenazas</h3>
                      <p className="mt-2 text-sm text-red-600">{selectedSpecies.threats}</p>
                    </div>
                  )}

                  {selectedSpecies.observationTips && (
                    <div>
                      <h3 className="font-semibold text-gray-900">Consejos de Observación</h3>
                      <p className="mt-2 text-sm text-gray-600">{selectedSpecies.observationTips}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-4">
                    {selectedSpecies.isNocturnal && (
                      <Badge variant="outline">Nocturno</Badge>
                    )}
                    {selectedSpecies.isMigratory && (
                      <Badge variant="outline">Migratorio</Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </AdminLayout>
  );
};

export default FaunaSpeciesAdmin;