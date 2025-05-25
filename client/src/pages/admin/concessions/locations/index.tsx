import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/AdminLayout";
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Map, 
  Ruler,
  Layers,
  Building,
  ZoomIn
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

// Esquema para validación del formulario de ubicaciones
const locationSchema = z.object({
  contractId: z.string().min(1, "Debes seleccionar un contrato"),
  zoneName: z.string().min(1, "El nombre de la zona es obligatorio"),
  subzoneName: z.string().optional(),
  coordinates: z.string().regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/, "Formato inválido. Debe ser lat,lng"),
  areaSqm: z.string().min(1, "La superficie es obligatoria"),
  mapReference: z.string().optional(),
  locationDescription: z.string().optional()
});

type LocationFormValues = z.infer<typeof locationSchema>;

export default function ConcessionLocations() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewMapDialogOpen, setIsViewMapDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
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

  // Formulario para crear una nueva ubicación
  const createForm = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      contractId: "",
      zoneName: "",
      subzoneName: "",
      coordinates: "",
      areaSqm: "",
      mapReference: "",
      locationDescription: ""
    },
  });

  // Formulario para editar una ubicación existente
  const editForm = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      contractId: "",
      zoneName: "",
      subzoneName: "",
      coordinates: "",
      areaSqm: "",
      mapReference: "",
      locationDescription: ""
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
      zoneName: location.zoneName,
      subzoneName: location.subzoneName || "",
      coordinates: location.coordinates,
      areaSqm: location.areaSqm.toString(),
      mapReference: location.mapReference || "",
      locationDescription: location.locationDescription || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleViewMap = (location: any) => {
    setCurrentLocation(location);
    setIsViewMapDialogOpen(true);
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
        return (
          searchTerm === "" ||
          location.contractName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          location.zoneName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          location.subzoneName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    : [];

  // Función para obtener el nombre de contrato a partir de su ID
  const getContractName = (contractId: number) => {
    if (!contracts) return "Desconocido";
    const contract = contracts.find((c: any) => c.id === contractId);
    return contract ? `${contract.parkName} - ${contract.concessionaireName}` : "Desconocido";
  };

  // Estado de carga de datos para el formulario
  const isFormDataLoading = isLoadingContracts;

  return (
    <AdminLayout>
      <Helmet>
        <title>Ubicaciones de Concesiones | ParquesMX</title>
        <meta 
          name="description" 
          content="Gestiona las ubicaciones georreferenciadas de concesiones para los parques" 
        />
      </Helmet>

      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ubicaciones de Concesiones</h1>
            <p className="text-muted-foreground">
              Administra la georreferenciación y distribución espacial de las concesiones
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} />
                Nueva ubicación
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar nueva ubicación de concesión</DialogTitle>
                <DialogDescription>
                  Introduce la información de ubicación y georreferenciación
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="zoneName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zona</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre de la zona" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createForm.control}
                      name="subzoneName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subzona (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre de la subzona" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="coordinates"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coordenadas</FormLabel>
                          <FormControl>
                            <Input placeholder="lat,lng (ej: 19.4326,-99.1332)" {...field} />
                          </FormControl>
                          <FormDescription>
                            Formato: latitud,longitud
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createForm.control}
                      name="areaSqm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Superficie (m²)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Superficie en metros cuadrados" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={createForm.control}
                    name="mapReference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referencia de mapa (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="URL o referencia del mapa" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="locationDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción de la ubicación</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe la ubicación y sus características" 
                            {...field} 
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Ubicaciones registradas</CardTitle>
              <div className="relative w-64">
                <Input
                  type="text"
                  placeholder="Buscar ubicaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <Separator />
          </CardHeader>
          <CardContent>
            {isLoadingLocations ? (
              <div className="flex justify-center items-center h-40">
                <p>Cargando ubicaciones...</p>
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <h3 className="text-lg font-medium">No hay ubicaciones registradas</h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? "No se encontraron ubicaciones que coincidan con tu búsqueda" 
                    : "Comienza registrando la primera ubicación de concesión"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Zona</TableHead>
                    <TableHead>Subzona</TableHead>
                    <TableHead>Superficie (m²)</TableHead>
                    <TableHead>Coordenadas</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLocations.map((location: any) => (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">{getContractName(location.contractId)}</TableCell>
                      <TableCell>{location.zoneName}</TableCell>
                      <TableCell>{location.subzoneName || "—"}</TableCell>
                      <TableCell>{location.areaSqm} m²</TableCell>
                      <TableCell>
                        <Badge variant="outline">{location.coordinates}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewMap(location)}
                            title="Ver en mapa"
                          >
                            <Map className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(location)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog open={isDeleteDialogOpen && currentLocation?.id === location.id} onOpenChange={setIsDeleteDialogOpen}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDelete(location)}
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente
                                  la ubicación de la concesión del sistema.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmDelete}>
                                  {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        {/* Diálogo para editar ubicación */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar ubicación de concesión</DialogTitle>
              <DialogDescription>
                Modifica la información de ubicación y georreferenciación
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="zoneName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zona</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre de la zona" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="subzoneName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subzona (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre de la subzona" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="coordinates"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coordenadas</FormLabel>
                        <FormControl>
                          <Input placeholder="lat,lng (ej: 19.4326,-99.1332)" {...field} />
                        </FormControl>
                        <FormDescription>
                          Formato: latitud,longitud
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="areaSqm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Superficie (m²)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Superficie en metros cuadrados" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={editForm.control}
                  name="mapReference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referencia de mapa (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="URL o referencia del mapa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="locationDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción de la ubicación</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe la ubicación y sus características" 
                          {...field} 
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Guardando cambios..." : "Guardar cambios"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Diálogo para visualizar mapa */}
        <Dialog open={isViewMapDialogOpen} onOpenChange={setIsViewMapDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Vista de mapa</DialogTitle>
              <DialogDescription>
                {currentLocation && (
                  <span>
                    {getContractName(currentLocation.contractId)} - {currentLocation.zoneName}
                    {currentLocation.subzoneName && `, ${currentLocation.subzoneName}`}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="h-[400px] w-full bg-slate-100 rounded-md flex flex-col items-center justify-center">
              <Map className="h-12 w-12 text-slate-400 mb-2" />
              <p className="text-slate-500">
                Aquí se mostraría la visualización del mapa con la ubicación seleccionada.
              </p>
              {currentLocation && (
                <div className="mt-4 flex flex-col items-center">
                  <Badge variant="outline" className="mb-2">{currentLocation.coordinates}</Badge>
                  <span className="text-sm text-slate-500">Superficie: {currentLocation.areaSqm} m²</span>
                </div>
              )}
            </div>
            <div className="mt-4">
              <h3 className="font-medium mb-2">Detalles de la ubicación</h3>
              {currentLocation && (
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-semibold">Descripción:</span>{" "}
                    {currentLocation.locationDescription || "Sin descripción"}
                  </p>
                  {currentLocation.mapReference && (
                    <p>
                      <span className="font-semibold">Referencia:</span>{" "}
                      {currentLocation.mapReference}
                    </p>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}