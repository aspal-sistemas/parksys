import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Plus, Edit, FileText, History, Star, Users, AlertTriangle, CheckCircle, XCircle, Search, FileUp, Loader2, UserRound } from "lucide-react";

// Esquema de validación para el formulario de concesionario
const concessionaireSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  type: z.enum(["persona_fisica", "persona_moral"], {
    required_error: "Debes seleccionar un tipo de concesionario",
  }),
  rfc: z.string().min(10, { message: "El RFC debe tener al menos 10 caracteres" }).max(13, { message: "El RFC no debe exceder 13 caracteres" }),
  tax_address: z.string().min(5, { message: "La dirección fiscal es obligatoria" }),
  legal_representative: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({ message: "Debe ser un correo electrónico válido" }).optional(),
  notes: z.string().optional(),
});

type ConcessionaireFormValues = z.infer<typeof concessionaireSchema>;

export default function ConcessionairesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedConcessionaire, setSelectedConcessionaire] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("listado");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Cargar los concesionarios
  const { data: concessionaires = [], isLoading: isLoadingConcessionaires } = useQuery({
    queryKey: ["/api/concessionaires"],
  });

  // Formulario para crear un nuevo concesionario
  const createForm = useForm<ConcessionaireFormValues>({
    resolver: zodResolver(concessionaireSchema),
    defaultValues: {
      name: "",
      type: "persona_fisica",
      rfc: "",
      tax_address: "",
      legal_representative: "",
      phone: "",
      email: "",
      notes: "",
    },
  });

  // Formulario para editar un concesionario existente
  const editForm = useForm<ConcessionaireFormValues>({
    resolver: zodResolver(concessionaireSchema),
    defaultValues: {
      name: "",
      type: "persona_fisica",
      rfc: "",
      tax_address: "",
      legal_representative: "",
      phone: "",
      email: "",
      notes: "",
    },
  });

  // Mutación para crear un nuevo concesionario
  const createConcessionaire = useMutation({
    mutationFn: async (values: ConcessionaireFormValues) => {
      const response = await fetch("/api/concessionaires", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear el concesionario");
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      createForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/concessionaires"] });
      toast({
        title: "Concesionario creado",
        description: "El concesionario ha sido registrado correctamente.",
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

  // Mutación para actualizar un concesionario existente
  const updateConcessionaire = useMutation({
    mutationFn: async ({ id, ...rest }: ConcessionaireFormValues & { id: number }) => {
      const response = await fetch(`/api/concessionaires/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rest),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar el concesionario");
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsEditDialogOpen(false);
      editForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/concessionaires"] });
      toast({
        title: "Concesionario actualizado",
        description: "Los datos del concesionario han sido actualizados correctamente.",
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

  // Función para manejar la creación de un nuevo concesionario
  const onCreateSubmit = (values: ConcessionaireFormValues) => {
    createConcessionaire.mutate(values);
  };

  // Función para manejar la actualización de un concesionario existente
  const onEditSubmit = (values: ConcessionaireFormValues) => {
    if (selectedConcessionaire) {
      updateConcessionaire.mutate({ ...values, id: selectedConcessionaire.id });
    }
  };

  // Función para abrir el diálogo de edición con los datos del concesionario seleccionado
  const handleEdit = (concessionaire: any) => {
    setSelectedConcessionaire(concessionaire);
    editForm.reset({
      name: concessionaire.name,
      type: concessionaire.type,
      rfc: concessionaire.rfc,
      tax_address: concessionaire.tax_address,
      legal_representative: concessionaire.legal_representative,
      phone: concessionaire.phone,
      email: concessionaire.email,
      notes: concessionaire.notes,
    });
    setIsEditDialogOpen(true);
  };

  // Renderizar el estado del concesionario con un Badge
  const renderStatus = (status: string) => {
    switch (status) {
      case "activo":
        return <Badge className="bg-green-500">Activo</Badge>;
      case "inactivo":
        return <Badge variant="secondary">Inactivo</Badge>;
      case "suspendido":
        return <Badge variant="destructive">Suspendido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filtrar concesionarios por término de búsqueda
  const filteredConcessionaires = searchTerm 
    ? (Array.isArray(concessionaires) ? concessionaires.filter((c: any) => 
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.rfc?.toLowerCase().includes(searchTerm.toLowerCase())) : [])
    : (Array.isArray(concessionaires) ? concessionaires : []);

  return (
    <AdminLayout>
      <Helmet>
        <title>Registro de Concesionarios | Bosques Urbanos</title>
        <meta 
          name="description" 
          content="Gestión de concesionarios autorizados para operar en los parques" 
        />
      </Helmet>

      <div className="container mx-auto py-6">
        {/* Header con título */}
        <Card className="p-4 bg-gray-50 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-8 h-8 text-gray-900" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Concesionarios</h1>
                <p className="text-gray-600 mt-2">Administra los concesionarios autorizados para operar en los parques</p>
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus size={16} />
                  Nuevo Concesionario
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>Crear nuevo concesionario</DialogTitle>
                  <DialogDescription>
                    Registra un nuevo concesionario autorizado para operar en los parques.
                  </DialogDescription>
                </DialogHeader>
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre o Razón Social *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Concesionario *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona un tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="persona_fisica">Persona Física</SelectItem>
                                <SelectItem value="persona_moral">Persona Moral</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="rfc"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>RFC *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ej: XAXX010101000" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="legal_representative"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Representante Legal</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Correo Electrónico</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={createForm.control}
                      name="tax_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dirección Fiscal *</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas adicionales</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createConcessionaire.isPending}>
                        {createConcessionaire.isPending ? "Guardando..." : "Guardar concesionario"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="listado">
              <Users className="h-4 w-4 mr-2" />
              Listado
            </TabsTrigger>
            <TabsTrigger value="documentos">
              <FileText className="h-4 w-4 mr-2" />
              Documentación
            </TabsTrigger>
            <TabsTrigger value="evaluaciones">
              <Star className="h-4 w-4 mr-2" />
              Evaluaciones
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="listado">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Concesionarios Registrados</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre o RFC"
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <CardDescription>
                  Listado de personas físicas y morales autorizadas para operar concesiones
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingConcessionaires ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p>Cargando concesionarios...</p>
                  </div>
                ) : filteredConcessionaires.length === 0 ? (
                  <div className="text-center py-8">
                    <UserRound className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">No hay concesionarios registrados</p>
                    <p className="text-muted-foreground">
                      {searchTerm ? "No se encontraron resultados" : "Comienza registrando tu primer concesionario"}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre/Razón Social</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>RFC</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredConcessionaires.map((concessionaire: any) => (
                        <TableRow key={concessionaire.id}>
                          <TableCell className="font-medium">{concessionaire.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {concessionaire.type === "persona_fisica" ? "P. Física" : "P. Moral"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{concessionaire.rfc}</TableCell>
                          <TableCell>{concessionaire.phone || "-"}</TableCell>
                          <TableCell>{concessionaire.email || "-"}</TableCell>
                          <TableCell>{renderStatus(concessionaire.status || "activo")}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(concessionaire)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documentos">
            <Card>
              <CardHeader>
                <CardTitle>Documentos de Concesionarios</CardTitle>
                <CardDescription>
                  Gestiona los documentos requeridos para cada concesionario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">Gestión de Documentos</p>
                  <p className="text-muted-foreground">
                    Funcionalidad próximamente disponible
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="evaluaciones">
            <Card>
              <CardHeader>
                <CardTitle>Evaluaciones de Desempeño</CardTitle>
                <CardDescription>
                  Califica el desempeño de los concesionarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">Sistema de Evaluaciones</p>
                  <p className="text-muted-foreground">
                    Funcionalidad próximamente disponible
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Diálogo para editar concesionario */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Concesionario</DialogTitle>
              <DialogDescription>
                Actualiza los datos fiscales y de contacto del concesionario.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre o Razón Social *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Concesionario *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="persona_fisica">Persona Física</SelectItem>
                          <SelectItem value="persona_moral">Persona Moral</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="rfc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RFC *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ej: XAXX010101000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="tax_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección Fiscal *</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={editForm.control}
                  name="legal_representative"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Representante Legal</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas adicionales</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updateConcessionaire.isPending}>
                    {updateConcessionaire.isPending ? "Actualizando..." : "Actualizar concesionario"}
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