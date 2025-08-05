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

type ConcessionTypeForm = z.infer<typeof concessionTypeSchema>;

interface ConcessionType {
  id: number;
  name: string;
  description: string;
  technicalRequirements?: string;
  legalRequirements?: string;
  operatingRules?: string;
  impactLevel: 'bajo' | 'medio' | 'alto' | 'muy_alto';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ConcessionsCatalog() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados para modales
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ConcessionType | null>(null);
  
  // Estados para paginación y filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const itemsPerPage = 10;

  // Formularios
  const createForm = useForm<ConcessionTypeForm>({
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

  const editForm = useForm<ConcessionTypeForm>({
    resolver: zodResolver(concessionTypeSchema),
  });

  // Query para obtener los tipos de concesión
  const { data: concessionTypes = [], isLoading } = useQuery({
    queryKey: ['/api/concession-types'],
    suspense: false,
    retry: 1
  });

  // Mutaciones
  const createMutation = useMutation({
    mutationFn: async (data: ConcessionTypeForm) => {
      const response = await fetch('/api/concession-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error al crear el tipo de concesión');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/concession-types'] });
      setIsCreateDialogOpen(false);
      createForm.reset();
      toast({
        title: "Tipo de concesión creado",
        description: "El nuevo tipo de concesión ha sido agregado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el tipo de concesión.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ConcessionTypeForm & { id: number }) => {
      const response = await fetch(`/api/concession-types/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error al actualizar el tipo de concesión');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/concession-types'] });
      setIsEditDialogOpen(false);
      setEditingItem(null);
      editForm.reset();
      toast({
        title: "Tipo de concesión actualizado",
        description: "Los cambios han sido guardados exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el tipo de concesión.",
        variant: "destructive",
      });
    },
  });

  // Filtrado y paginación
  const filteredTypes = useMemo(() => {
    return concessionTypes.filter((type: ConcessionType) => {
      const matchesSearch = type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           type.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "active" && type.isActive) ||
                           (statusFilter === "inactive" && !type.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [concessionTypes, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredTypes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTypes = filteredTypes.slice(startIndex, startIndex + itemsPerPage);

  // Handlers
  const onCreateSubmit = (data: ConcessionTypeForm) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: ConcessionTypeForm) => {
    if (editingItem) {
      updateMutation.mutate({ ...data, id: editingItem.id });
    }
  };

  const handleEdit = (item: ConcessionType) => {
    setEditingItem(item);
    editForm.reset({
      name: item.name,
      description: item.description,
      technicalRequirements: item.technicalRequirements || "",
      legalRequirements: item.legalRequirements || "",
      operatingRules: item.operatingRules || "",
      impactLevel: item.impactLevel,
      isActive: item.isActive,
    });
    setIsEditDialogOpen(true);
  };

  // Función para obtener el color de badge del nivel de impacto
  const getImpactBadgeColor = (level: string) => {
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
        {/* Header con título */}
        <Card className="p-4 bg-gray-50 mb-6">
          <div className="flex items-center gap-2">
            <FileText className="w-8 h-8 text-gray-900" />
            <h1 className="text-3xl font-bold text-gray-900">Catálogo de Concesiones</h1>
          </div>
          <p className="text-gray-600 mt-2">Administra los tipos de concesiones disponibles para los parques</p>
        </Card>

        {/* Controles y botón nuevo */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <Input
              placeholder="Buscar tipos de concesión..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
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
                      name="impactLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nivel de impacto</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona el nivel" />
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
                      control={createForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
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
                  </div>
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
                      {createMutation.isPending ? 'Creando...' : 'Crear tipo'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabla de tipos de concesión */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div>Cargando tipos de concesión...</div>
              </div>
            ) : paginatedTypes.length > 0 ? (
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
                    {paginatedTypes.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell className="font-medium">{type.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{type.description}</TableCell>
                        <TableCell>
                          <Badge className={getImpactBadgeColor(type.impactLevel)}>
                            {formatImpactLevel(type.impactLevel)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={type.isActive ? "default" : "secondary"}>
                            {type.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(type)}
                            >
                              <Edit size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay tipos de concesión</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== "all" 
                    ? "No se encontraron tipos que coincidan con los filtros."
                    : "Comienza creando tu primer tipo de concesión."
                  }
                </p>
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredTypes.length)} de {filteredTypes.length} tipos
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="text-sm font-medium">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de edición */}
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
                        <Input placeholder="Ej: Venta de alimentos" {...field} />
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
                    control={editForm.control}
                    name="impactLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nivel de impacto</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el nivel" />
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
                </div>
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
      </div>
    </AdminLayout>
  );
}