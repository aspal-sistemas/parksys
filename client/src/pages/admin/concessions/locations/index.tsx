import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/AdminLayout";
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Maximize,
  Square,
  FileText
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
} from "@/components/ui/alert-dialog";

// Esquema para validación del formulario de ubicación
const locationSchema = z.object({
  contractId: z.string().min(1, "Debes seleccionar un contrato"),
  parkZoneId: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  areaSize: z.string().min(1, "La superficie es obligatoria"),
  locationDescription: z.string().optional(),
  polygonCoordinates: z.string().optional()
});

type LocationFormValues = z.infer<typeof locationSchema>;

export default function ConcessionLocations() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const mapRef = useRef(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener lista de ubicaciones
  const { data: locations, isLoading: isLoadingLocations } = useQuery({
    queryKey: ["/api/concession-locations"],
  });

  // Obtener lista de contratos
  const { data: contracts, isLoading: isLoadingContracts } = useQuery({
    queryKey: ["/api/concession-contracts"],
  });

  // Obtener lista de zonas de parques
  const { data: parkZones, isLoading: isLoadingParkZones } = useQuery({
    queryKey: ["/api/park-zones"],
  });

  // Formulario para crear una nueva ubicación
  const createForm = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      contractId: "",
      parkZoneId: "",
      latitude: "",
      longitude: "",
      areaSize: "",
      locationDescription: "",
      polygonCoordinates: ""
    },
  });

  // Formulario para editar una ubicación existente
  const editForm = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      contractId: "",
      parkZoneId: "",
      latitude: "",
      longitude: "",
      areaSize: "",
      locationDescription: "",
      polygonCoordinates: ""
    },
  });

  // Mutación para crear una nueva ubicación
  const createMutation = useMutation({
    mutationFn: async (data: LocationFormValues) => {
      const response = await fetch("/api/concession-locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("token") || "",
          "X-User-Id": localStorage.getItem("userId") || "",
          "X-User-Role": localStorage.getItem("userRole") || "",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear la ubicación");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/concession-locations"] });
      toast({
        title: "Ubicación creada",
        description: "La ubicación ha sido creada exitosamente.",
      });
      createForm.reset();
      setIsCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutación para actualizar una ubicación existente
  const updateMutation = useMutation({
    mutationFn: async (data: LocationFormValues & { id: number }) => {
      const { id, ...updateData } = data;
      const response = await fetch(`/api/concession-locations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("token") || "",
          "X-User-Id": localStorage.getItem("userId") || "",
          "X-User-Role": localStorage.getItem("userRole") || "",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar la ubicación");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/concession-locations"] });
      toast({
        title: "Ubicación actualizada",
        description: "La ubicación ha sido actualizada exitosamente.",
      });
      editForm.reset();
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar una ubicación
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/concession-locations/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": localStorage.getItem("token") || "",
          "X-User-Id": localStorage.getItem("userId") || "",
          "X-User-Role": localStorage.getItem("userRole") || "",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al eliminar la ubicación");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/concession-locations"] });
      toast({
        title: "Ubicación eliminada",
        description: "La ubicación ha sido eliminada exitosamente.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onCreateSubmit = (values: LocationFormValues) => {
    createMutation.mutate(values);
  };

  const onEditSubmit = (values: LocationFormValues) => {
    if (currentLocation) {
      updateMutation.mutate({
        ...values,
        id: currentLocation.id,
      });
    }
  };

  const handleEdit = (location: any) => {
    setCurrentLocation(location);
    editForm.reset({
      contractId: location.contractId.toString(),
      parkZoneId: location.parkZoneId?.toString() || "",
      latitude: location.latitude?.toString() || "",
      longitude: location.longitude?.toString() || "",
      areaSize: location.areaSize?.toString() || "",
      locationDescription: location.locationDescription || "",
      polygonCoordinates: location.polygonCoordinates ? JSON.stringify(location.polygonCoordinates) : ""
    });
    setIsEditDialogOpen(true);
  };

  const handleView = (location: any) => {
    setCurrentLocation(location);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (location: any) => {
    setCurrentLocation(location);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentLocation) {
      deleteMutation.mutate(currentLocation.id);
    }
  };

  // Filtra las ubicaciones según términos de búsqueda
  const filteredLocations = locations
    ? locations.filter((location: any) => {
        const matchesSearch =
          searchTerm === "" ||
          location.contractName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          location.parkName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          location.locationDescription?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesSearch;
      })
    : [];

  // Estado de carga de datos para el formulario
  const isFormDataLoading = isLoadingContracts || isLoadingParkZones;

  return (
    <AdminLayout>
      <Helmet>
        <title>Ubicaciones de Concesiones | Bosques Urbanos</title>
        <meta 
          name="description" 
          content="Gestiona la ubicación y georreferenciación de las concesiones en los parques" 
        />
      </Helmet>

      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ubicaciones de Concesiones</h1>
            <p className="text-muted-foreground">
              Administra la ubicación y georreferenciación de las concesiones en los parques
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} />
                Nueva ubicación
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Agregar ubicación para concesión</DialogTitle>
                <DialogDescription>
                  Introduce la información de ubicación para la concesión
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="contractId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contrato de Concesión</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isFormDataLoading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un contrato" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingContracts ? (
                                <SelectItem value="loading">Cargando contratos...</SelectItem>
                              ) : contracts && contracts.length > 0 ? (
                                contracts.map((contract: any) => (
                                  <SelectItem key={contract.id} value={contract.id.toString()}>
                                    {contract.parkName} - {contract.concessionaireName}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="empty">No hay contratos disponibles</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createForm.control}
                      name="parkZoneId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zona del Parque (Opcional)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isFormDataLoading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una zona" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingParkZones ? (
                                <SelectItem value="loading">Cargando zonas...</SelectItem>
                              ) : parkZones && parkZones.length > 0 ? (
                                parkZones.map((zone: any) => (
                                  <SelectItem key={zone.id} value={zone.id.toString()}>
                                    {zone.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="empty">No hay zonas disponibles</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={createForm.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitud (Opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. 19.4326" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createForm.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitud (Opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. -99.1332" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createForm.control}
                      name="areaSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Superficie (m²)</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. 250" {...field} type="number" min="0" step="0.01" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={createForm.control}
                      name="locationDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción de la Ubicación</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe la ubicación de la concesión dentro del parque" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="h-80 bg-gray-100 rounded-md p-4 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="mx-auto mb-2 h-10 w-10 text-gray-400" />
                      <p className="text-gray-500">
                        Visualizador de mapa (en desarrollo)
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Pronto podrás seleccionar ubicaciones en el mapa
                      </p>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Guardando..." : "Guardar ubicación"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ubicaciones..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Ubicaciones de Concesiones</CardTitle>
            <CardDescription>
              Lista de ubicaciones registradas para las concesiones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parque</TableHead>
                    <TableHead>Concesionario</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Superficie (m²)</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingLocations ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        Cargando ubicaciones...
                      </TableCell>
                    </TableRow>
                  ) : filteredLocations && filteredLocations.length > 0 ? (
                    filteredLocations.map((location: any) => (
                      <TableRow key={location.id}>
                        <TableCell>{location.parkName}</TableCell>
                        <TableCell>{location.concessionaireName}</TableCell>
                        <TableCell>
                          {location.locationDescription || 
                            (location.latitude && location.longitude ? 
                              `${location.latitude}, ${location.longitude}` : 
                              "No especificada")}
                        </TableCell>
                        <TableCell>{location.areaSize} m²</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleView(location)}
                              title="Ver detalles"
                            >
                              <FileText size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(location)}
                              title="Editar"
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(location)}
                              title="Eliminar"
                              className="text-destructive"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No hay ubicaciones registradas. Agrega una ubicación usando el botón "Nueva ubicación".
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diálogo para ver detalles de ubicación */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[750px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Ubicación</DialogTitle>
          </DialogHeader>
          {currentLocation && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Contrato</h3>
                  <p className="text-sm text-gray-500">{currentLocation.contractName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Parque</h3>
                  <p className="text-sm text-gray-500">{currentLocation.parkName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Concesionario</h3>
                  <p className="text-sm text-gray-500">{currentLocation.concessionaireName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Zona del Parque</h3>
                  <p className="text-sm text-gray-500">{currentLocation.zoneName || "No especificada"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Coordenadas</h3>
                  <p className="text-sm text-gray-500">
                    {currentLocation.latitude && currentLocation.longitude ? 
                      `${currentLocation.latitude}, ${currentLocation.longitude}` : 
                      "No especificadas"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Superficie</h3>
                  <p className="text-sm text-gray-500">{currentLocation.areaSize} m²</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Descripción de la Ubicación</h3>
                <p className="text-sm text-gray-500">{currentLocation.locationDescription || "Sin descripción"}</p>
              </div>
              
              <div className="h-80 bg-gray-100 rounded-md p-4 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="mx-auto mb-2 h-10 w-10 text-gray-400" />
                  <p className="text-gray-500">
                    Visualizador de mapa (en desarrollo)
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar ubicación */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Ubicación</DialogTitle>
            <DialogDescription>
              Modifica la información de ubicación para esta concesión
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="contractId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contrato de Concesión</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={true} // No permitir cambiar el contrato
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un contrato" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingContracts ? (
                            <SelectItem value="loading">Cargando contratos...</SelectItem>
                          ) : contracts && contracts.length > 0 ? (
                            contracts.map((contract: any) => (
                              <SelectItem key={contract.id} value={contract.id.toString()}>
                                {contract.parkName} - {contract.concessionaireName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="empty">No hay contratos disponibles</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="parkZoneId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zona del Parque (Opcional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isFormDataLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una zona" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingParkZones ? (
                            <SelectItem value="loading">Cargando zonas...</SelectItem>
                          ) : parkZones && parkZones.length > 0 ? (
                            parkZones.map((zone: any) => (
                              <SelectItem key={zone.id} value={zone.id.toString()}>
                                {zone.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="empty">No hay zonas disponibles</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitud (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. 19.4326" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitud (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. -99.1332" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="areaSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Superficie (m²)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. 250" {...field} type="number" min="0" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={editForm.control}
                  name="locationDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción de la Ubicación</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe la ubicación de la concesión dentro del parque" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="h-80 bg-gray-100 rounded-md p-4 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="mx-auto mb-2 h-10 w-10 text-gray-400" />
                  <p className="text-gray-500">
                    Visualizador de mapa (en desarrollo)
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Pronto podrás seleccionar ubicaciones en el mapa
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Guardando..." : "Guardar cambios"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Diálogo para confirmar eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la ubicación de la concesión.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}