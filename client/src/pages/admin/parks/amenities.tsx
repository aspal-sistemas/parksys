import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import AmenityIcon from "@/components/AmenityIcon";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, ArrowLeft, MapPin, Package } from "lucide-react";

interface ParkAmenity {
  id: number;
  parkId: number;
  amenityId: number;
  amenityName: string;
  amenityIcon: string | null;
  customIconUrl?: string | null;
  moduleName?: string;
  surfaceArea?: number;
  status?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  description?: string;
}

interface Amenity {
  id: number;
  name: string;
  icon: string | null;
  category: string;
  iconType: string;
  customIconUrl: string | null;
}

interface AssignAmenityFormData {
  amenityId: number;
  moduleName: string;
  surfaceArea: number;
  status: string;
  description: string;
}

export default function ParkAmenitiesPage() {
  const params = useParams();
  const parkId = Number(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<ParkAmenity | null>(null);
  const [formData, setFormData] = useState<AssignAmenityFormData>({
    amenityId: 0,
    moduleName: "",
    surfaceArea: 0,
    status: "activo",
    description: ""
  });

  // Queries
  const { data: park } = useQuery({
    queryKey: [`/api/parks/${parkId}`],
    enabled: !!parkId,
  });

  const { data: parkAmenities, isLoading: isLoadingParkAmenities } = useQuery({
    queryKey: [`/api/parks/${parkId}/amenities`],
    enabled: !!parkId,
  });

  const { data: allAmenities } = useQuery({
    queryKey: ["/api/amenities/dashboard"],
  });

  // Available amenities (not yet assigned to this park)
  const availableAmenities = allAmenities?.allAmenities?.filter((amenity: Amenity) => 
    !parkAmenities?.find((pa: ParkAmenity) => pa.amenityId === amenity.id)
  ) || [];

  // Mutations
  const assignAmenityMutation = useMutation({
    mutationFn: async (data: AssignAmenityFormData) => {
      const response = await fetch(`/api/parks/${parkId}/amenities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al asignar amenidad');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Amenidad asignada",
        description: "La amenidad se ha asignado correctamente al parque.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}/amenities`] });
      setIsAssignDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeAmenityMutation = useMutation({
    mutationFn: async (amenityId: number) => {
      const response = await fetch(`/api/parks/${parkId}/amenities/${amenityId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al remover amenidad');
      }
    },
    onSuccess: () => {
      toast({
        title: "Amenidad removida",
        description: "La amenidad se ha removido correctamente del parque.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}/amenities`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      amenityId: 0,
      moduleName: "",
      surfaceArea: 0,
      status: "activo",
      description: ""
    });
    setSelectedAmenity(null);
  };

  const handleAssignAmenity = () => {
    if (!formData.amenityId) {
      toast({
        title: "Error",
        description: "Por favor selecciona una amenidad",
        variant: "destructive",
      });
      return;
    }
    
    assignAmenityMutation.mutate(formData);
  };

  const handleRemoveAmenity = (amenityId: number) => {
    if (confirm("¿Estás seguro de que quieres remover esta amenidad del parque?")) {
      removeAmenityMutation.mutate(amenityId);
    }
  };



  if (isLoadingParkAmenities) {
    return (
      <AdminLayout title="Gestión de Amenidades">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando amenidades...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gestión de Amenidades">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setLocation(`/admin/parks/${parkId}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Amenidades de {park?.name}
              </h2>
              <p className="text-gray-600">
                Gestiona las amenidades instaladas en este parque
              </p>
            </div>
          </div>
          
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Asignar Amenidad
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Asignar Nueva Amenidad</DialogTitle>
                <DialogDescription>
                  Selecciona una amenidad para agregar a este parque
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amenity">Amenidad</Label>
                  <Select 
                    value={formData.amenityId.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, amenityId: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una amenidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAmenities.map((amenity: Amenity) => (
                        <SelectItem key={amenity.id} value={amenity.id.toString()}>
                          <div className="flex items-center space-x-2">
                            <AmenityIcon 
                              name={amenity.icon || 'default'} 
                              iconType={amenity.customIconUrl ? 'custom' : 'system'}
                              customIconUrl={amenity.customIconUrl}
                              size={20}
                            />
                            <span>{amenity.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="moduleName">Nombre del Módulo (Opcional)</Label>
                  <Input
                    id="moduleName"
                    value={formData.moduleName}
                    onChange={(e) => setFormData({ ...formData, moduleName: e.target.value })}
                    placeholder="Ej: Cancha Principal, Área Norte..."
                  />
                </div>

                <div>
                  <Label htmlFor="surfaceArea">Área (m²)</Label>
                  <Input
                    id="surfaceArea"
                    type="number"
                    value={formData.surfaceArea}
                    onChange={(e) => setFormData({ ...formData, surfaceArea: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="mantenimiento">En Mantenimiento</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Descripción (Opcional)</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción adicional..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAssignAmenity}
                  disabled={assignAmenityMutation.isPending}
                >
                  {assignAmenityMutation.isPending ? "Asignando..." : "Asignar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Park Info Card */}
        {park && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>{park.name}</span>
              </CardTitle>
              <CardDescription>
                {park.address} • {park.area?.toLocaleString()} m²
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Amenities Table */}
        <Card>
          <CardHeader>
            <CardTitle>Amenidades Instaladas ({parkAmenities?.length || 0})</CardTitle>
            <CardDescription>
              Lista de todas las amenidades instaladas en este parque
            </CardDescription>
          </CardHeader>
          <CardContent>
            {parkAmenities && parkAmenities.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amenidad</TableHead>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Área (m²)</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parkAmenities.map((amenity: ParkAmenity) => (
                    <TableRow key={amenity.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <AmenityIcon 
                            name={amenity.amenityIcon || 'default'} 
                            iconType={amenity.amenityIcon === 'custom' ? 'custom' : 'system'}
                            customIconUrl={amenity.customIconUrl || null}
                            size={30}
                          />
                          <span className="font-medium">{amenity.amenityName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {amenity.moduleName || "Sin especificar"}
                      </TableCell>
                      <TableCell>
                        {amenity.surfaceArea ? amenity.surfaceArea.toLocaleString() : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            amenity.status === "activo" ? "default" :
                            amenity.status === "mantenimiento" ? "secondary" : "destructive"
                          }
                        >
                          {amenity.status || "activo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // TODO: Implementar edición
                              toast({
                                title: "Próximamente",
                                description: "La función de editar estará disponible pronto",
                              });
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRemoveAmenity(amenity.id)}
                            className="text-red-600 hover:text-red-700"
                            disabled={removeAmenityMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Sin amenidades</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Este parque no tiene amenidades asignadas aún.
                </p>
                <div className="mt-6">
                  <Button onClick={() => setIsAssignDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Asignar Primera Amenidad
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Amenities */}
        {availableAmenities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Amenidades Disponibles ({availableAmenities.length})</CardTitle>
              <CardDescription>
                Amenidades que puedes agregar a este parque
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableAmenities.map((amenity: Amenity) => (
                  <div 
                    key={amenity.id}
                    className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setFormData({ ...formData, amenityId: amenity.id });
                      setIsAssignDialogOpen(true);
                    }}
                  >
                    <AmenityIcon name={amenity.icon} customIconUrl={amenity.customIconUrl} />
                    <span className="text-sm font-medium truncate">{amenity.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}