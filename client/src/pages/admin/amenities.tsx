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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { Plus, Edit, Trash2, FileUp } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import AmenityIcon from '@/components/AmenityIcon';
import { Amenity } from '@shared/schema';
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
  iconType: 'system' | 'custom';
  customIconUrl: string | null;
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
    category: '',
    iconType: 'system',
    customIconUrl: null
  });
  
  // Estado para manejar la carga de archivos
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Estado para manejar la importación de amenidades
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

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
        { 
          name: data.name, 
          icon: data.icon, 
          category: data.category,
          iconType: data.iconType,
          customIconUrl: data.customIconUrl
        }
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

  // Función para manejar la carga de iconos personalizados
  const handleIconUpload = async () => {
    if (!uploadedFile) return null;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('icon', uploadedFile);
      
      const response = await fetch('/api/upload/icon', {
        method: 'POST',
        body: formData,
        headers: {
          // No establecer Content-Type para que el navegador configure el boundary correcto
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir el icono');
      }
      
      const data = await response.json();
      return data.url; // URL del icono subido
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "No se pudo subir el icono", 
        variant: "destructive" 
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      icon: '',
      category: '',
      iconType: 'system',
      customIconUrl: null
    });
    setUploadedFile(null);
    setCurrentAmenity(null);
  };

  const handleEditClick = (amenity: Amenity) => {
    setCurrentAmenity(amenity);
    setFormData({
      name: amenity.name,
      icon: amenity.icon,
      category: amenity.category,
      iconType: amenity.iconType || 'system',
      customIconUrl: amenity.customIconUrl || null
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (amenity: Amenity) => {
    setCurrentAmenity(amenity);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si es un icono personalizado y hay un archivo para subir
    if (formData.iconType === 'custom' && uploadedFile) {
      // Primero subir el icono
      const iconUrl = await handleIconUpload();
      if (iconUrl) {
        // Si se subió correctamente, actualizar la URL en el form y crear la amenidad
        createAmenity.mutate({
          ...formData,
          customIconUrl: iconUrl
        });
      }
    } else {
      // Si es un icono del sistema, crear la amenidad normal
      createAmenity.mutate(formData);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAmenity) return;
    
    // Si es un icono personalizado y hay un archivo para subir
    if (formData.iconType === 'custom' && uploadedFile) {
      // Primero subir el icono
      const iconUrl = await handleIconUpload();
      if (iconUrl) {
        // Si se subió correctamente, actualizar la URL en el form y actualizar la amenidad
        updateAmenity.mutate({
          ...formData,
          customIconUrl: iconUrl,
          id: currentAmenity.id
        });
      }
    } else {
      // Si es un icono del sistema o no hay un nuevo archivo a subir
      updateAmenity.mutate({
        ...formData,
        id: currentAmenity.id
      });
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
        <div className="flex gap-2">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileUp className="mr-2 h-4 w-4" />
                Importar Amenidades
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar amenidades desde base de datos</DialogTitle>
                <DialogDescription>
                  Sube un archivo Excel (.xlsx) o CSV con las amenidades para importar masivamente.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleImportSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="importFile">Archivo de amenidades</Label>
                    <Input
                      id="importFile"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                      required
                    />
                    <p className="text-sm text-gray-500">
                      El archivo debe contener las columnas: Nombre, Categoría, Icono
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsImportDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={importAmenities.isPending}>
                    {importAmenities.isPending ? "Importando..." : "Importar Amenidades"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
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
                  <Label htmlFor="iconType">Tipo de Icono</Label>
                  <RadioGroup 
                    className="flex flex-row gap-4 mt-2"
                    value={formData.iconType}
                    onValueChange={(value) => setFormData({
                      ...formData, 
                      iconType: value as 'system' | 'custom',
                      // Si cambia a system, resetear el icon customizado
                      customIconUrl: value === 'system' ? null : formData.customIconUrl
                    })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="system" />
                      <Label htmlFor="system">Icono del sistema</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="custom" />
                      <Label htmlFor="custom">Icono personalizado</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {formData.iconType === 'system' ? (
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
                ) : (
                  <div className="grid gap-2">
                    <Label htmlFor="customIcon">Cargar icono personalizado (JPG o PNG)</Label>
                    <div className="flex items-start gap-4 mt-2">
                      <Input
                        id="customIcon"
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedFile(file);
                          }
                        }}
                        className="flex-1"
                      />
                      {(formData.customIconUrl || uploadedFile) && (
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 rounded-md bg-gray-50 flex items-center justify-center overflow-hidden border">
                            {uploadedFile ? (
                              <span className="text-xs text-gray-500">Nuevo archivo seleccionado</span>
                            ) : formData.customIconUrl ? (
                              <img 
                                src={formData.customIconUrl} 
                                alt="Icono personalizado" 
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : null}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Vista previa</p>
                        </div>
                      )}
                    </div>
                    {isUploading && <p className="text-sm text-blue-500 mt-1">Subiendo icono...</p>}
                  </div>
                )}
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
                      <AmenityIcon 
                        name={amenity.icon} 
                        size={24} 
                        iconType={amenity.iconType as 'system' | 'custom'} 
                        customIconUrl={amenity.customIconUrl}
                      />
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
                <Label htmlFor="edit-iconType">Tipo de Icono</Label>
                <RadioGroup 
                  className="flex flex-row gap-4 mt-2"
                  value={formData.iconType}
                  onValueChange={(value) => setFormData({
                    ...formData, 
                    iconType: value as 'system' | 'custom',
                    customIconUrl: value === 'system' ? null : formData.customIconUrl
                  })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="edit-system" />
                    <Label htmlFor="edit-system">Icono del sistema</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="edit-custom" />
                    <Label htmlFor="edit-custom">Icono personalizado</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.iconType === 'system' ? (
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
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="edit-customIcon">Cargar icono personalizado (JPG o PNG)</Label>
                  <div className="flex items-start gap-4 mt-2">
                    <Input
                      id="edit-customIcon"
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadedFile(file);
                        }
                      }}
                      className="flex-1"
                    />
                    {(formData.customIconUrl || uploadedFile) && (
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-md bg-gray-50 flex items-center justify-center overflow-hidden border">
                          {uploadedFile ? (
                            <span className="text-xs text-gray-500">Nuevo archivo seleccionado</span>
                          ) : formData.customIconUrl ? (
                            <img 
                              src={formData.customIconUrl} 
                              alt="Icono personalizado" 
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : null}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Vista previa</p>
                      </div>
                    )}
                  </div>
                  {isUploading && <p className="text-sm text-blue-500 mt-1">Subiendo icono...</p>}
                </div>
              )}
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