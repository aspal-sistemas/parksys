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
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import AmenityIcon from '@/components/AmenityIcon';
import { AMENITY_CATEGORIES, Amenity } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

// Categorías para amenidades en español
const CATEGORY_LABELS: Record<string, string> = {
  "recreación": "Recreación",
  "servicios": "Servicios",
  "deportes": "Deportes",
  "accesibilidad": "Accesibilidad",
  "infraestructura": "Infraestructura",
  "naturaleza": "Naturaleza",
};

// Definir iconos disponibles
const AVAILABLE_ICONS = [
  { name: "playground", label: "Juegos infantiles" },
  { name: "toilet", label: "Baños" },
  { name: "sportsCourt", label: "Canchas deportivas" },
  { name: "bicycle", label: "Ciclovías" },
  { name: "pets", label: "Zona para mascotas" },
  { name: "accessibility", label: "Accesibilidad" },
  { name: "hiking", label: "Senderos" },
  { name: "parking", label: "Estacionamiento" },
  { name: "restaurant", label: "Área de picnic" },
  { name: "water", label: "Fuentes" },
  { name: "theater", label: "Escenarios" },
  { name: "lightbulb", label: "Iluminación" },
  { name: "security", label: "Seguridad" },
  { name: "wifi", label: "WiFi" },
  { name: "bikeParking", label: "Biciestacionamientos" },
  { name: "gym", label: "Gimnasio" },
  { name: "running", label: "Pista para correr" },
  { name: "basketball", label: "Cancha de basketball" },
  { name: "soccer", label: "Cancha de fútbol" },
  { name: "tennis", label: "Cancha de tenis" },
  { name: "pool", label: "Alberca" },
  { name: "skate", label: "Pista de skate" },
];

interface AmenityFormData {
  name: string;
  icon: string;
  category: string;
}

const AdminAmenitiesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAmenity, setCurrentAmenity] = useState<Amenity | null>(null);
  const [formData, setFormData] = useState<AmenityFormData>({
    name: '',
    icon: '',
    category: ''
  });

  const { data: amenities = [], isLoading } = useQuery<Amenity[]>({
    queryKey: ['/api/amenities'],
  });

  // Creación de nueva amenidad
  const createAmenity = useMutation({
    mutationFn: async (data: AmenityFormData) => {
      const response = await apiRequest('POST', '/api/amenities', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/amenities'] });
      toast({ title: "Amenidad creada", description: "La amenidad ha sido creada correctamente" });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "No se pudo crear la amenidad", 
        variant: "destructive" 
      });
    }
  });

  // Actualización de amenidad
  const updateAmenity = useMutation({
    mutationFn: async (data: AmenityFormData & { id: number }) => {
      const response = await apiRequest(
        'PUT', 
        `/api/amenities/${data.id}`, 
        { name: data.name, icon: data.icon, category: data.category }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/amenities'] });
      toast({ title: "Amenidad actualizada", description: "La amenidad ha sido actualizada correctamente" });
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "No se pudo actualizar la amenidad", 
        variant: "destructive" 
      });
    }
  });

  // Eliminación de amenidad
  const deleteAmenity = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/amenities/${id}`);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/amenities'] });
      toast({ title: "Amenidad eliminada", description: "La amenidad ha sido eliminada correctamente" });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "No se pudo eliminar la amenidad. Posiblemente está en uso por algún parque.", 
        variant: "destructive" 
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '',
      category: ''
    });
    setCurrentAmenity(null);
  };

  const handleEditClick = (amenity: Amenity) => {
    setCurrentAmenity(amenity);
    setFormData({
      name: amenity.name,
      icon: amenity.icon,
      category: amenity.category
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (amenity: Amenity) => {
    setCurrentAmenity(amenity);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAmenity.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAmenity) {
      updateAmenity.mutate({ ...formData, id: currentAmenity.id });
    }
  };

  const handleDeleteConfirm = () => {
    if (currentAmenity) {
      deleteAmenity.mutate(currentAmenity.id);
    }
  };

  return (
    <AdminLayout title="Gestión de Amenidades">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Amenidades</h2>
          <p className="text-muted-foreground">
            Gestiona las amenidades disponibles para los parques
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="ml-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Amenidad
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear nueva amenidad</DialogTitle>
              <DialogDescription>
                Complete los campos para crear una nueva amenidad en el sistema.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Juegos infantiles"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="icon">Icono</Label>
                  <Select 
                    value={formData.icon} 
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un icono" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_ICONS.map((icon) => (
                        <SelectItem key={icon.name} value={icon.name}>
                          <div className="flex items-center">
                            <div className="mr-2">
                              <AmenityIcon name={icon.name} size={16} />
                            </div>
                            {icon.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createAmenity.isPending}>
                  {createAmenity.isPending ? "Creando..." : "Crear Amenidad"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Icono</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : amenities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  No hay amenidades para mostrar
                </TableCell>
              </TableRow>
            ) : (
              amenities.map((amenity) => (
                <TableRow key={amenity.id}>
                  <TableCell>
                    <div className="p-2 bg-gray-100 rounded-md inline-flex">
                      <AmenityIcon name={amenity.icon} size={24} />
                    </div>
                  </TableCell>
                  <TableCell>{amenity.name}</TableCell>
                  <TableCell>
                    {CATEGORY_LABELS[amenity.category] || amenity.category}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditClick(amenity)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleDeleteClick(amenity)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar amenidad</DialogTitle>
            <DialogDescription>
              Modifique los campos para actualizar la amenidad.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nombre</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Juegos infantiles"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Categoría</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-icon">Icono</Label>
                <Select 
                  value={formData.icon} 
                  onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un icono" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_ICONS.map((icon) => (
                      <SelectItem key={icon.name} value={icon.name}>
                        <div className="flex items-center">
                          <div className="mr-2">
                            <AmenityIcon name={icon.name} size={16} />
                          </div>
                          {icon.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateAmenity.isPending}>
                {updateAmenity.isPending ? "Actualizando..." : "Actualizar Amenidad"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la amenidad
              "{currentAmenity?.name}" del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteAmenity.isPending}
            >
              {deleteAmenity.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminAmenitiesPage;