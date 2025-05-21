import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { apiRequest } from '@/lib/queryClient';

// Categorías para actividades
const ACTIVITY_CATEGORIES = [
  { value: "artecultura", label: "Arte y Cultura" },
  { value: "recreacionbienestar", label: "Recreación y Bienestar" },
  { value: "temporada", label: "Eventos de Temporada" },
  { value: "naturalezaciencia", label: "Naturaleza, Ciencia y Conservación" }
];

interface ActivityCatalogItem {
  id: number;
  name: string;
  description: string;
  category: string;
  duration: number; // Duración en minutos
  capacity: number | null;
  materials: string | null;
  staffRequired: number | null;
  isRecurring: boolean;
}

interface ActivityCatalogFormData {
  name: string;
  description: string;
  category: string;
  duration: number;
  capacity: number | null;
  materials: string | null;
  staffRequired: number | null;
  isRecurring: boolean;
}

const AdminActivityCatalogPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<ActivityCatalogItem | null>(null);
  
  // Lista de nombres de actividades precargadas
  const PREDEFINED_ACTIVITIES = [
    // Arte y Cultura
    { value: "Exposiciones", label: "Exposiciones" },
    { value: "Actividades Culturales", label: "Actividades Culturales" },
    { value: "Conciertos", label: "Conciertos" },
    { value: "Clases de pintura", label: "Clases de pintura" },
    { value: "Clases de música", label: "Clases de música" },
    { value: "Taller de manualidades", label: "Taller de manualidades" },
    { value: "Arte", label: "Arte" },
    { value: "Actividades Educativas", label: "Actividades Educativas" },
    { value: "Recorridos guiados", label: "Recorridos guiados" },
    
    // Recreación y Bienestar
    { value: "Clase de Yoga", label: "Clase de Yoga" },
    { value: "Clases de baile", label: "Clases de baile (Salsa, Jazz, Ballet, Folklore, Breakdance)" },
    { value: "Activación física", label: "Activación física (Zumba, Cardio, Pilates)" },
    { value: "Actividades deportivas", label: "Actividades deportivas (fútbol, voleybol, caminatas)" },
    { value: "Yoga", label: "Yoga" },
    { value: "Actividades para todos", label: "Actividades para todos" },
    { value: "Actividades infantiles", label: "Actividades infantiles" },
    { value: "Picnic", label: "Picnic" },
    { value: "Ciclismo", label: "Ciclismo" },
    { value: "Senderismo", label: "Senderismo" },
    { value: "Bicirruta y renta de bicicletas/patines", label: "Bicirruta y renta de bicicletas/patines" },
    
    // Eventos de Temporada
    { value: "Festival de Primavera", label: "Festival de Primavera" },
    { value: "Festivales", label: "Festivales" },
    { value: "Eventos en días especiales", label: "Eventos en días especiales" },
    { value: "Ferias (zapatos, libros, salud)", label: "Ferias (zapatos, libros, salud)" },
    { value: "Pláticas-charlas", label: "Pláticas-charlas (octubre, marzo, Mujer, cáncer, violencia)" },
    { value: "Tianguis", label: "Tianguis" },
    { value: "Espectáculos", label: "Espectáculos" },
    { value: "Feria para OSC recaudación de fondos", label: "Feria para OSC recaudación de fondos" },
    { value: "Hanal Pixán", label: "Hanal Pixán" },
    { value: "Mercado emprendedores", label: "Mercado emprendedores" },
    { value: "Eventos sociales", label: "Eventos sociales" },
    
    // Naturaleza, Ciencia y Conservación
    { value: "Taller de Identificación de Plantas Nativas", label: "Taller de Identificación de Plantas Nativas" },
    { value: "Clases de jardinería y siembra", label: "Clases de jardinería y siembra" },
    { value: "Recorrido botánico", label: "Recorrido botánico" },
    { value: "Venta de plantas", label: "Venta de plantas" },
    { value: "Clases de educación ambiental", label: "Clases de educación ambiental" },
    { value: "Taller Huertos orgánicos", label: "Taller Huertos orgánicos" },
    { value: "Manualidades", label: "Manualidades" },
    { value: "Cursos de reciclaje", label: "Cursos de reciclaje" },
    { value: "Avistamiento de Aves", label: "Avistamiento de Aves" },
    { value: "Pláticas sobre plantas ricas en vitaminas y para una buena alimentación", label: "Pláticas sobre plantas ricas en vitaminas y para una buena alimentación" },
    { value: "Reforestación", label: "Reforestación" },
    
    // Otro
    { value: "otro", label: "Otra actividad (especificar)" }
  ];
  
  const [customActivity, setCustomActivity] = useState(false);
  const [formData, setFormData] = useState<ActivityCatalogFormData>({
    name: '',
    description: '',
    category: '',
    duration: 60,
    capacity: null,
    materials: null,
    staffRequired: null,
    isRecurring: false
  });
  
  // Función para filtrar actividades por categoría
  const getActivitiesByCategory = (category: string) => {
    if (!category) return [];
    return PREDEFINED_ACTIVITIES.filter(activity => {
      // Lista de actividades por categoría
      if (category === 'artecultura' && [
        "Exposiciones", "Actividades Culturales", "Conciertos", 
        "Clases de pintura", "Clases de música", "Taller de manualidades", 
        "Arte", "Actividades Educativas", "Recorridos guiados"
      ].includes(activity.value)) {
        return true;
      }
      
      if (category === 'recreacionbienestar' && [
        "Clase de Yoga", "Clases de baile", "Activación física", 
        "Actividades deportivas", "Yoga", "Actividades para todos", 
        "Actividades infantiles", "Picnic", "Ciclismo", 
        "Senderismo", "Bicirruta y renta de bicicletas/patines"
      ].includes(activity.value)) {
        return true;
      }
      
      if (category === 'temporada' && [
        "Festival de Primavera", "Festivales", "Eventos en días especiales", 
        "Ferias (zapatos, libros, salud)", "Pláticas-charlas", "Tianguis", 
        "Espectáculos", "Feria para OSC recaudación de fondos", 
        "Hanal Pixán", "Mercado emprendedores", "Eventos sociales"
      ].includes(activity.value)) {
        return true;
      }
      
      if (category === 'naturalezaciencia' && [
        "Taller de Identificación de Plantas Nativas", "Clases de jardinería y siembra", 
        "Recorrido botánico", "Venta de plantas", "Clases de educación ambiental", 
        "Taller Huertos orgánicos", "Manualidades", "Cursos de reciclaje", 
        "Avistamiento de Aves", "Pláticas sobre plantas ricas en vitaminas y para una buena alimentación", 
        "Reforestación"
      ].includes(activity.value)) {
        return true;
      }
      
      return activity.value === "otro";
    });
  };

  // Por ahora usamos datos de ejemplo mientras implementamos el backend
  const mockActivitiesCatalog: ActivityCatalogItem[] = [
    // Categoría: Arte y Cultura
    {
      id: 1,
      name: "Exposiciones",
      description: "Exhibiciones artísticas temporales abiertas al público",
      category: "artecultura",
      duration: 180,
      capacity: 50,
      materials: "Paneles de exposición, iluminación especial, material informativo",
      staffRequired: 2,
      isRecurring: true
    },
    {
      id: 2,
      name: "Actividades Culturales",
      description: "Eventos culturales diversos para promover las tradiciones locales",
      category: "artecultura",
      duration: 120,
      capacity: 40,
      materials: "Materiales específicos según la actividad cultural",
      staffRequired: 3,
      isRecurring: true
    },
    {
      id: 3,
      name: "Conciertos",
      description: "Presentaciones musicales en vivo de artistas locales",
      category: "artecultura",
      duration: 120,
      capacity: 100,
      materials: "Equipo de sonido, escenario, iluminación",
      staffRequired: 5,
      isRecurring: false
    },
    {
      id: 4,
      name: "Clases de pintura",
      description: "Taller creativo de pintura para todos los niveles",
      category: "artecultura",
      duration: 120,
      capacity: 15,
      materials: "Lienzos, pinturas, pinceles, caballetes",
      staffRequired: 2,
      isRecurring: true
    },
    {
      id: 5,
      name: "Clases de música",
      description: "Lecciones básicas de instrumentos musicales populares",
      category: "artecultura",
      duration: 90,
      capacity: 12,
      materials: "Instrumentos musicales básicos, partituras, sillas",
      staffRequired: 1,
      isRecurring: true
    },
    {
      id: 6,
      name: "Taller de manualidades",
      description: "Actividades manuales creativas con diversos materiales",
      category: "artecultura",
      duration: 90,
      capacity: 20,
      materials: "Papelería, tijeras, pegamento, materiales reciclados",
      staffRequired: 2,
      isRecurring: true
    },
    {
      id: 7,
      name: "Arte",
      description: "Espacio de expresión artística libre para todas las edades",
      category: "artecultura",
      duration: 120,
      capacity: 25,
      materials: "Diversos materiales artísticos según la temática",
      staffRequired: 2,
      isRecurring: true
    },
    {
      id: 8,
      name: "Actividades Educativas",
      description: "Talleres y actividades con enfoque educativo y cultural",
      category: "artecultura",
      duration: 90,
      capacity: 30,
      materials: "Material didáctico, proyector, pizarra",
      staffRequired: 2,
      isRecurring: true
    },
    {
      id: 9,
      name: "Recorridos guiados",
      description: "Visitas guiadas por espacios culturales dentro del parque",
      category: "artecultura",
      duration: 60,
      capacity: 15,
      materials: "Mapas, material informativo",
      staffRequired: 1,
      isRecurring: true
    },
    
    // Categoría: Recreación y Bienestar
    {
      id: 10,
      name: "Clase de Yoga",
      description: "Sesión de yoga para todos los niveles con instructor",
      category: "recreacionbienestar",
      duration: 60,
      capacity: 20,
      materials: "Tapetes de yoga, bloques, mantas",
      staffRequired: 1,
      isRecurring: true
    },
    
    // Categoría: Eventos de Temporada
    {
      id: 11,
      name: "Festival de Primavera",
      description: "Evento familiar con actividades temáticas de la estación",
      category: "temporada",
      duration: 240,
      capacity: 200,
      materials: "Decoraciones, stands, equipos de sonido",
      staffRequired: 8,
      isRecurring: false
    },
    
    // Categoría: Naturaleza, Ciencia y Conservación
    {
      id: 12,
      name: "Taller de Identificación de Plantas Nativas",
      description: "Actividad educativa para conocer y conservar especies locales",
      category: "naturalezaciencia",
      duration: 120,
      capacity: 30,
      materials: "Guías de identificación, lupas, libretas",
      staffRequired: 2,
      isRecurring: true
    }
  ];

  // Simulación de la consulta a la API
  const { data: activityCatalog = mockActivitiesCatalog, isLoading } = useQuery<ActivityCatalogItem[]>({
    queryKey: ['/api/activity-catalog'],
    enabled: false // Deshabilitada por ahora, usamos datos mockeados
  });

  // Creación de nueva actividad del catálogo
  const createActivityCatalogItem = useMutation({
    mutationFn: async (data: ActivityCatalogFormData) => {
      // Aquí iría el código real para crear el ítem en la API
      // const response = await apiRequest('POST', '/api/activity-catalog', data);
      // return response.json();
      
      // Por ahora simplemente simulamos un éxito
      return { ...data, id: Date.now() } as ActivityCatalogItem;
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ['/api/activity-catalog'] }); // Descomentar cuando tengamos API real
      toast({ title: "Actividad creada", description: "La actividad ha sido añadida al catálogo correctamente" });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "No se pudo crear la actividad", 
        variant: "destructive" 
      });
    }
  });

  // Actualización de actividad
  const updateActivityCatalogItem = useMutation({
    mutationFn: async (data: ActivityCatalogFormData & { id: number }) => {
      // Aquí iría el código real para actualizar el ítem en la API
      // const response = await apiRequest('PUT', `/api/activity-catalog/${data.id}`, data);
      // return response.json();
      
      // Por ahora simplemente simulamos un éxito
      return { ...data };
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ['/api/activity-catalog'] }); // Descomentar cuando tengamos API real
      toast({ title: "Actividad actualizada", description: "La actividad del catálogo ha sido actualizada correctamente" });
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "No se pudo actualizar la actividad", 
        variant: "destructive" 
      });
    }
  });

  // Eliminación de actividad
  const deleteActivityCatalogItem = useMutation({
    mutationFn: async (id: number) => {
      // Aquí iría el código real para eliminar el ítem en la API
      // await apiRequest('DELETE', `/api/activity-catalog/${id}`);
      
      // Por ahora simplemente simulamos un éxito
      return true;
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ['/api/activity-catalog'] }); // Descomentar cuando tengamos API real
      toast({ title: "Actividad eliminada", description: "La actividad ha sido eliminada del catálogo correctamente" });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "No se pudo eliminar la actividad. Posiblemente está en uso en algún parque.", 
        variant: "destructive" 
      });
    }
  });
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      duration: 60,
      capacity: null,
      materials: null,
      staffRequired: null,
      isRecurring: false
    });
    setCurrentActivity(null);
    setCustomActivity(false);
  };

  const handleEditClick = (activity: ActivityCatalogItem) => {
    setCurrentActivity(activity);
    setFormData({
      name: activity.name,
      description: activity.description,
      category: activity.category,
      duration: activity.duration,
      capacity: activity.capacity,
      materials: activity.materials,
      staffRequired: activity.staffRequired,
      isRecurring: activity.isRecurring
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (activity: ActivityCatalogItem) => {
    setCurrentActivity(activity);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createActivityCatalogItem.mutate(formData);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentActivity) return;
    
    updateActivityCatalogItem.mutate({
      ...formData,
      id: currentActivity.id
    });
  };

  const handleDeleteConfirm = () => {
    if (currentActivity) {
      deleteActivityCatalogItem.mutate(currentActivity.id);
    }
  };

  return (
    <AdminLayout title="Catálogo de Actividades">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Catálogo de Actividades</h2>
          <p className="text-muted-foreground">
            Gestiona el catálogo de actividades disponibles para programar en los parques
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="ml-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Actividad
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Crear nueva actividad</DialogTitle>
              <DialogDescription>
                Defina los detalles de la nueva actividad para el catálogo.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => {
                      setFormData({ 
                        ...formData, 
                        category: value,
                        name: '' // Reiniciamos el nombre al cambiar de categoría
                      });
                      setCustomActivity(false);
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.category && (
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre de Actividad</Label>
                    <Select 
                      value={formData.name} 
                      onValueChange={(value) => {
                        if (value === "otro") {
                          setCustomActivity(true);
                          setFormData({ ...formData, name: '' });
                        } else {
                          setCustomActivity(false);
                          setFormData({ ...formData, name: value });
                        }
                      }}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una actividad" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {getActivitiesByCategory(formData.category).map((activity) => (
                          <SelectItem key={activity.value} value={activity.value}>
                            {activity.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {customActivity && (
                      <div className="mt-2">
                        <Label htmlFor="customName">Especificar nombre</Label>
                        <Input
                          id="customName"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Ingresa el nombre de la actividad"
                          required
                        />
                      </div>
                    )}
                  </div>
                )}
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe la actividad..."
                    rows={3}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="duration">Duración (minutos)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min={15}
                      step={15}
                      value={formData.duration.toString()}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="capacity">Capacidad (participantes)</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min={1}
                      value={formData.capacity?.toString() || ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : parseInt(e.target.value);
                        setFormData({ ...formData, capacity: val });
                      }}
                      placeholder="Sin límite"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="materials">Materiales Necesarios</Label>
                  <Textarea
                    id="materials"
                    value={formData.materials || ''}
                    onChange={(e) => setFormData({ ...formData, materials: e.target.value || null })}
                    placeholder="Lista de materiales requeridos..."
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="staffRequired">Personal Requerido</Label>
                    <Input
                      id="staffRequired"
                      type="number"
                      min={0}
                      value={formData.staffRequired?.toString() || ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : parseInt(e.target.value);
                        setFormData({ ...formData, staffRequired: val });
                      }}
                      placeholder="Sin personal"
                    />
                  </div>
                  
                  <div className="grid gap-2 items-center">
                    <Label htmlFor="isRecurring" className="mb-2">Actividad Recurrente</Label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        id="isRecurring"
                        checked={formData.isRecurring}
                        onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                        className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                      />
                      <Label htmlFor="isRecurring" className="mt-0 text-sm">Se puede programar de forma periódica</Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createActivityCatalogItem.isPending}>
                  {createActivityCatalogItem.isPending ? "Creando..." : "Crear Actividad"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-12">
          <p>Cargando catálogo de actividades...</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Recurrente</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityCatalog.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No hay actividades definidas en el catálogo.
                  </TableCell>
                </TableRow>
              ) : (
                activityCatalog.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">
                      <div>
                        {activity.name}
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{activity.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {ACTIVITY_CATEGORIES.find(cat => cat.value === activity.category)?.label || activity.category}
                    </TableCell>
                    <TableCell>
                      {activity.duration} min
                    </TableCell>
                    <TableCell>
                      {activity.capacity || 'Sin límite'}
                    </TableCell>
                    <TableCell>
                      {activity.isRecurring ? 'Sí' : 'No'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditClick(activity)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <AlertDialog open={isDeleteDialogOpen && currentActivity?.id === activity.id} onOpenChange={setIsDeleteDialogOpen}>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteClick(activity)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar esta actividad del catálogo?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente la actividad
                                <strong> {currentActivity?.name}</strong> del catálogo.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Editar actividad</DialogTitle>
            <DialogDescription>
              Actualice los detalles de la actividad en el catálogo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Categoría</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => {
                    setFormData({ 
                      ...formData, 
                      category: value,
                      name: '' // Reiniciamos el nombre al cambiar de categoría
                    });
                    setCustomActivity(false);
                  }}
                  required
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {formData.category && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Nombre de Actividad</Label>
                  <Select 
                    value={formData.name} 
                    onValueChange={(value) => {
                      if (value === "otro") {
                        setCustomActivity(true);
                        setFormData({ ...formData, name: '' });
                      } else {
                        setCustomActivity(false);
                        setFormData({ ...formData, name: value });
                      }
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una actividad" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {getActivitiesByCategory(formData.category).map((activity) => (
                        <SelectItem key={activity.value} value={activity.value}>
                          {activity.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {customActivity && (
                    <div className="mt-2">
                      <Label htmlFor="edit-customName">Especificar nombre</Label>
                      <Input
                        id="edit-customName"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ingresa el nombre de la actividad"
                        required
                      />
                    </div>
                  )}
                </div>
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe la actividad..."
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-duration">Duración (minutos)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    min={15}
                    step={15}
                    value={formData.duration.toString()}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-capacity">Capacidad (participantes)</Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    min={1}
                    value={formData.capacity?.toString() || ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : parseInt(e.target.value);
                      setFormData({ ...formData, capacity: val });
                    }}
                    placeholder="Sin límite"
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-materials">Materiales Necesarios</Label>
                <Textarea
                  id="edit-materials"
                  value={formData.materials || ''}
                  onChange={(e) => setFormData({ ...formData, materials: e.target.value || null })}
                  placeholder="Lista de materiales requeridos..."
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-staffRequired">Personal Requerido</Label>
                  <Input
                    id="edit-staffRequired"
                    type="number"
                    min={0}
                    value={formData.staffRequired?.toString() || ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : parseInt(e.target.value);
                      setFormData({ ...formData, staffRequired: val });
                    }}
                    placeholder="Sin personal"
                  />
                </div>
                
                <div className="grid gap-2 items-center">
                  <Label htmlFor="edit-isRecurring" className="mb-2">Actividad Recurrente</Label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox"
                      id="edit-isRecurring"
                      checked={formData.isRecurring}
                      onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                      className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                    />
                    <Label htmlFor="edit-isRecurring" className="mt-0 text-sm">Se puede programar de forma periódica</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateActivityCatalogItem.isPending}>
                {updateActivityCatalogItem.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminActivityCatalogPage;