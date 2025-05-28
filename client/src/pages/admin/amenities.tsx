import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { apiRequest } from "@/lib/queryClient";

// Simple amenity icon component
function AmenityIcon({ name, size = 24 }: { name: string; size?: number }) {
  const icons: Record<string, string> = {
    playground: "🎪",
    sports: "⚽",
    bathroom: "🚻",
    parking: "🅿️",
    restaurant: "🍽️",
    bench: "💺",
    fountain: "⛲",
    wifi: "📶",
    security: "🔒",
    garden: "🌳",
    park: "🏞️",
  };
  
  return (
    <span style={{ fontSize: size }} className="inline-block">
      {icons[name] || icons.park}
    </span>
  );
}

const AVAILABLE_ICONS = [
  { name: "playground", label: "Juegos infantiles" },
  { name: "sports", label: "Deportes" },
  { name: "bathroom", label: "Baños" },
  { name: "parking", label: "Estacionamiento" },
  { name: "restaurant", label: "Restaurante" },
  { name: "bench", label: "Bancas" },
  { name: "fountain", label: "Fuente" },
  { name: "wifi", label: "WiFi" },
  { name: "security", label: "Seguridad" },
  { name: "garden", label: "Jardín" },
  { name: "park", label: "Parque" },
];

interface AmenityFormData {
  name: string;
  icon: string;
  category: string;
  iconType: 'system' | 'custom';
  customIconUrl: string | null;
}

type Amenity = {
  id: number;
  name: string;
  icon: string | null;
  category?: string;
  parksCount?: number;
  createdAt: Date;
};

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    recreacion: "Recreación",
    deportes: "Deportes", 
    servicios: "Servicios",
    naturaleza: "Naturaleza",
    cultura: "Cultura",
    accesibilidad: "Accesibilidad"
  };
  return labels[category] || "Servicios";
}

const AdminAmenitiesPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [currentAmenity, setCurrentAmenity] = useState<Amenity | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState<AmenityFormData>({
    name: "",
    icon: "park",
    category: "servicios",
    iconType: 'system',
    customIconUrl: null
  });

  // Fetch amenities with park count
  const { data: amenitiesData, isLoading } = useQuery({
    queryKey: ["/api/amenities/dashboard"],
  });

  const amenities = amenitiesData?.mostPopularAmenities || [];

  // Create amenity mutation
  const createAmenity = useMutation({
    mutationFn: async (data: AmenityFormData) => {
      return apiRequest("/api/amenities", { method: "POST", data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/amenities/dashboard"] });
      toast({ title: "Amenidad creada exitosamente" });
      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        icon: "park",
        category: "servicios",
        iconType: 'system',
        customIconUrl: null
      });
    },
    onError: () => {
      toast({ title: "Error al crear amenidad", variant: "destructive" });
    },
  });

  // Update amenity mutation
  const updateAmenity = useMutation({
    mutationFn: async (data: AmenityFormData & { id: number }) => {
      return apiRequest(`/api/amenities/${data.id}`, { method: "PUT", data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/amenities/dashboard"] });
      toast({ title: "Amenidad actualizada exitosamente" });
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error al actualizar amenidad", variant: "destructive" });
    },
  });

  // Delete amenity mutation
  const deleteAmenity = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/amenities/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/amenities/dashboard"] });
      toast({ title: "Amenidad eliminada exitosamente" });
      setIsDeleteDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error al eliminar amenidad", variant: "destructive" });
    },
  });

  // Import amenities mutation
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/amenities/import', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Error al importar amenidades');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/amenities/dashboard"] });
      toast({ 
        title: "Importación exitosa", 
        description: `Se importaron ${data.count} amenidades correctamente` 
      });
      setIsImportDialogOpen(false);
      setImportFile(null);
    },
    onError: () => {
      toast({ title: "Error al importar amenidades", variant: "destructive" });
    },
  });

  const handleEditClick = (amenity: Amenity) => {
    setCurrentAmenity(amenity);
    setFormData({
      name: amenity.name,
      icon: amenity.icon || 'park',
      category: amenity.category || 'servicios',
      iconType: 'system',
      customIconUrl: null
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

  const handleUpdateSubmit = (e: React.FormEvent) => {
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

  const handleImport = () => {
    if (importFile) {
      importMutation.mutate(importFile);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Gestión de Amenidades">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando amenidades...</div>
        </div>
      </AdminLayout>
    );
  }

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
                <DialogTitle>Importar Amenidades</DialogTitle>
                <DialogDescription>
                  Sube un archivo Excel (.xlsx) o CSV con las columnas: Nombre, Categoría, Icono
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="import-file">Archivo</Label>
                  <Input
                    id="import-file"
                    type="file"
                    accept=".xlsx,.csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImportFile(file);
                      }
                    }}
                  />
                  {importFile && (
                    <p className="text-sm text-muted-foreground">
                      Archivo seleccionado: {importFile.name}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleImport}
                  disabled={!importFile || importMutation.isPending}
                >
                  {importMutation.isPending ? "Importando..." : "Importar"}
                </Button>
              </DialogFooter>
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
                <DialogTitle>Crear Nueva Amenidad</DialogTitle>
                <DialogDescription>
                  Agrega una nueva amenidad para asignar a los parques
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre de la amenidad</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ej. Juegos infantiles"
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
                      <SelectItem value="recreacion">Recreación</SelectItem>
                      <SelectItem value="deportes">Deportes</SelectItem>
                      <SelectItem value="servicios">Servicios</SelectItem>
                      <SelectItem value="naturaleza">Naturaleza</SelectItem>
                      <SelectItem value="cultura">Cultura</SelectItem>
                      <SelectItem value="accesibilidad">Accesibilidad</SelectItem>
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
      </div>

      {/* Amenities Table with Parks Column */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Icono</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Parques</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {amenities?.map((amenity: Amenity) => (
              <TableRow key={amenity.id}>
                <TableCell>
                  <AmenityIcon name={amenity.icon || 'park'} size={24} />
                </TableCell>
                <TableCell className="font-medium">{amenity.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {getCategoryLabel(amenity.category || 'servicios')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {amenity.parksCount || 0} parques
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(amenity)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(amenity)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Amenidad</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la amenidad
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nombre de la amenidad</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  <SelectItem value="recreacion">Recreación</SelectItem>
                  <SelectItem value="deportes">Deportes</SelectItem>
                  <SelectItem value="servicios">Servicios</SelectItem>
                  <SelectItem value="naturaleza">Naturaleza</SelectItem>
                  <SelectItem value="cultura">Cultura</SelectItem>
                  <SelectItem value="accesibilidad">Accesibilidad</SelectItem>
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