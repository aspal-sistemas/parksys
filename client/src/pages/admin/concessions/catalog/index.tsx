import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/AdminLayout";
import { 
  AlertTriangle, 
  Plus, 
  Edit, 
  Check, 
  X, 
  FileText, 
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight
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
  FormMessage 
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

// Esquema de validación para el formulario
const concessionTypeSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  technicalRequirements: z.string().optional(),
  legalRequirements: z.string().optional(),
  operatingRules: z.string().optional(),
  impactLevel: z.enum(['bajo', 'medio', 'alto', 'muy_alto']),
  isActive: z.boolean().default(true)
});

type ConcessionTypeFormValues = z.infer<typeof concessionTypeSchema>;

export default function ConcessionTypeCatalog() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentConcessionType, setCurrentConcessionType] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener catálogo de tipos de concesiones
  const { data: concessionTypes, isLoading } = useQuery({
    queryKey: ["/api/concession-types/all"],
  });

  // Formulario para crear un nuevo tipo de concesión
  const createForm = useForm<ConcessionTypeFormValues>({
    resolver: zodResolver(concessionTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      technicalRequirements: "",
      legalRequirements: "",
      operatingRules: "",
      impactLevel: "bajo",
      isActive: true
    },
  });

  // Formulario para editar un tipo de concesión existente
  const editForm = useForm<ConcessionTypeFormValues>({
    resolver: zodResolver(concessionTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      technicalRequirements: "",
      legalRequirements: "",
      operatingRules: "",
      impactLevel: "bajo",
      isActive: true
    },
  });

  // Mutación para crear un nuevo tipo de concesión
  const createMutation = useMutation({
    mutationFn: async (data: ConcessionTypeFormValues) => {
      const response = await fetch("/api/concession-types", {
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
        throw new Error(error.message || "Error al crear el tipo de concesión");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/concession-types/all"] });
      toast({
        title: "Tipo de concesión creado",
        description: "El tipo de concesión ha sido creado exitosamente.",
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

  // Mutación para actualizar un tipo de concesión existente
  const updateMutation = useMutation({
    mutationFn: async (data: ConcessionTypeFormValues & { id: number }) => {
      const { id, ...updateData } = data;
      const response = await fetch(`/api/concession-types/${id}`, {
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
        throw new Error(error.message || "Error al actualizar el tipo de concesión");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/concession-types/all"] });
      toast({
        title: "Tipo de concesión actualizado",
        description: "El tipo de concesión ha sido actualizado exitosamente.",
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

  // Mutación para cambiar el estado de un tipo de concesión
  const toggleStatusMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/concession-types/${id}/toggle-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("token") || "",
          "X-User-Id": localStorage.getItem("userId") || "",
          "X-User-Role": localStorage.getItem("userRole") || "",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al cambiar el estado del tipo de concesión");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/concession-types/all"] });
      toast({
        title: "Estado actualizado",
        description: "El estado del tipo de concesión ha sido actualizado.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onCreateSubmit = (values: ConcessionTypeFormValues) => {
    createMutation.mutate(values);
  };

  const onEditSubmit = (values: ConcessionTypeFormValues) => {
    if (currentConcessionType) {
      updateMutation.mutate({
        ...values,
        id: currentConcessionType.id,
      });
    }
  };

  const handleEdit = (concessionType: any) => {
    setCurrentConcessionType(concessionType);
    editForm.reset({
      name: concessionType.name,
      description: concessionType.description,
      technicalRequirements: concessionType.technicalRequirements || "",
      legalRequirements: concessionType.legalRequirements || "",
      operatingRules: concessionType.operatingRules || "",
      impactLevel: concessionType.impactLevel,
      isActive: concessionType.isActive
    });
    setIsEditDialogOpen(true);
  };

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  // Cálculos de paginación
  const paginatedData = useMemo(() => {
    const concessionTypesArray = Array.isArray(concessionTypes) ? concessionTypes : [];
    
    if (concessionTypesArray.length === 0) {
      return {
        data: [],
        totalItems: 0,
        totalPages: 0,
        startIndex: 0,
        endIndex: 0,
      };
    }

    const totalItems = concessionTypesArray.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const data = concessionTypesArray.slice(startIndex, endIndex);

    return {
      data,
      totalItems,
      totalPages,
      startIndex: startIndex + 1,
      endIndex,
    };
  }, [concessionTypes, currentPage, itemsPerPage]);

  // Función para obtener el color de la badge según el nivel de impacto
  const getImpactLevelColor = (level: string) => {
    switch (level) {
      case 'bajo':
        return 'bg-green-100 text-green-800';
      case 'medio':
        return 'bg-yellow-100 text-yellow-800';
      case 'alto':
        return 'bg-orange-100 text-orange-800';
      case 'muy_alto':
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  };

  // Función para obtener el texto formateado del nivel de impacto
  const formatImpactLevel = (level: string) => {
    switch (level) {
      case 'bajo':
        return 'Bajo';
      case 'medio':
        return 'Medio';
      case 'alto':
        return 'Alto';
      case 'muy_alto':
        return 'Muy alto';
      default:
        return level;
    }
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Catálogo de Concesiones | Bosques Urbanos</title>
        <meta 
          name="description" 
          content="Gestiona el catálogo de tipos de concesiones disponibles para los parques" 
        />
      </Helmet>

      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Catálogo de Concesiones</h1>
            <p className="text-muted-foreground">
              Administra los tipos de concesiones disponibles para los parques
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} />
                Nuevo tipo de concesión
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Crear nuevo tipo de concesión</DialogTitle>
                <DialogDescription>
                  Introduce la información del nuevo tipo de concesión para el catálogo
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Venta de alimentos" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe en qué consiste este tipo de concesión" 
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="technicalRequirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Requisitos técnicos</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Requisitos técnicos para este tipo de concesión" 
                              {...field}
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="legalRequirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Requisitos legales</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Requisitos legales para este tipo de concesión" 
                              {...field}
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={createForm.control}
                    name="operatingRules"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reglas de operación</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Reglas de operación para este tipo de concesión" 
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="impactLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nivel de impacto ambiental/social</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un nivel de impacto" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bajo">Bajo</SelectItem>
                            <SelectItem value="medio">Medio</SelectItem>
                            <SelectItem value="alto">Alto</SelectItem>
                            <SelectItem value="muy_alto">Muy alto</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending}
                    >
                      {createMutation.isPending ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tipos de concesiones</CardTitle>
            <CardDescription>
              Lista de tipos de concesiones disponibles para asignar a los parques
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <p>Cargando catálogo de concesiones...</p>
              </div>
            ) : paginatedData.totalItems > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Nivel de impacto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.data.map((concessionType: any) => (
                        <TableRow key={concessionType.id}>
                        <TableCell className="font-medium">{concessionType.name}</TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {concessionType.description}
                        </TableCell>
                        <TableCell>
                          <Badge className={getImpactLevelColor(concessionType.impactLevel)}>
                            {formatImpactLevel(concessionType.impactLevel)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {concessionType.isActive ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                              Activo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                              Inactivo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(concessionType)}
                              title="Editar"
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleStatus(concessionType.id)}
                              title={concessionType.isActive ? "Desactivar" : "Activar"}
                            >
                              {concessionType.isActive ? (
                                <ToggleRight size={16} className="text-green-500" />
                              ) : (
                                <ToggleLeft size={16} className="text-gray-500" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Controles de paginación */}
              {paginatedData.totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {paginatedData.startIndex} a {paginatedData.endIndex} de {paginatedData.totalItems} tipos de concesiones
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="gap-1"
                    >
                      <ChevronLeft size={16} />
                      Anterior
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, paginatedData.totalPages) }, (_, i) => {
                        const startPage = Math.max(1, currentPage - 2);
                        const pageNumber = startPage + i;
                        
                        if (pageNumber > paginatedData.totalPages) return null;
                        
                        return (
                          <Button
                            key={pageNumber}
                            variant={pageNumber === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNumber)}
                            className={pageNumber === currentPage ? "bg-[#00a587] hover:bg-[#067f5f]" : ""}
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === paginatedData.totalPages}
                      className="gap-1"
                    >
                      Siguiente
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No hay tipos de concesiones</h3>
                <p className="text-muted-foreground max-w-md mt-2">
                  No se encontraron tipos de concesiones en el catálogo. Crea un nuevo tipo para comenzar.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diálogo para editar tipo de concesión */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar tipo de concesión</DialogTitle>
            <DialogDescription>
              Modifica la información del tipo de concesión
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="technicalRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requisitos técnicos</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="legalRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requisitos legales</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="operatingRules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reglas de operación</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="impactLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel de impacto ambiental/social</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un nivel de impacto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bajo">Bajo</SelectItem>
                        <SelectItem value="medio">Medio</SelectItem>
                        <SelectItem value="alto">Alto</SelectItem>
                        <SelectItem value="muy_alto">Muy alto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </FormControl>
                    <div className="leading-none">
                      <FormLabel>Activo</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}