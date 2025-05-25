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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Plus, Edit, FileText, History, Star, Users, AlertTriangle, CheckCircle, XCircle, Search, FileUp } from "lucide-react";

// Esquema de validación para el formulario de concesionario
const concessionaireSchema = z.object({
  username: z.string().min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  email: z.string().email({ message: "Debe ser un correo electrónico válido" }),
  fullName: z.string().min(3, { message: "El nombre completo debe tener al menos 3 caracteres" }),
  phone: z.string().optional(),
  type: z.enum(["persona_fisica", "persona_moral"], {
    required_error: "Debes seleccionar un tipo de concesionario",
  }),
  rfc: z.string().min(10, { message: "El RFC debe tener al menos 10 caracteres" }).max(13, { message: "El RFC no debe exceder 13 caracteres" }),
  taxAddress: z.string().min(5, { message: "La dirección fiscal es obligatoria" }),
  legalRepresentative: z.string().optional(),
  notes: z.string().optional(),
});

type ConcessionaireFormValues = z.infer<typeof concessionaireSchema>;

// Esquema para editar un concesionario existente (sin requerir contraseña)
const editConcessionaireSchema = concessionaireSchema.omit({ password: true, username: true }).extend({
  password: z.string().min(6).optional(),
});

type EditConcessionaireFormValues = z.infer<typeof editConcessionaireSchema>;

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
    queryKey: ["/api/users/concessionaires"],
  });

  // Formulario para crear un nuevo concesionario
  const createForm = useForm<ConcessionaireFormValues>({
    resolver: zodResolver(concessionaireSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      fullName: "",
      phone: "",
      type: "persona_fisica",
      rfc: "",
      taxAddress: "",
      legalRepresentative: "",
      notes: "",
    },
  });

  // Formulario para editar un concesionario existente
  const editForm = useForm<EditConcessionaireFormValues>({
    resolver: zodResolver(editConcessionaireSchema),
    defaultValues: {
      email: "",
      fullName: "",
      phone: "",
      type: "persona_fisica",
      rfc: "",
      taxAddress: "",
      legalRepresentative: "",
      notes: "",
    },
  });

  // Mutación para crear un nuevo concesionario
  const createConcessionaire = useMutation({
    mutationFn: async (data: ConcessionaireFormValues) => {
      const response = await fetch("/api/users/concessionaires", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
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
      queryClient.invalidateQueries({ queryKey: ["/api/users/concessionaires"] });
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
    mutationFn: async (data: EditConcessionaireFormValues & { id: number }) => {
      const { id, ...rest } = data;
      const response = await fetch(`/api/users/concessionaires/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/users/concessionaires"] });
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
  const onEditSubmit = (values: EditConcessionaireFormValues) => {
    if (selectedConcessionaire) {
      updateConcessionaire.mutate({ ...values, id: selectedConcessionaire.id });
    }
  };

  // Función para abrir el diálogo de edición con los datos del concesionario seleccionado
  const handleEdit = (concessionaire: any) => {
    setSelectedConcessionaire(concessionaire);
    editForm.reset({
      email: concessionaire.email,
      fullName: concessionaire.fullName,
      phone: concessionaire.phone || "",
      type: concessionaire.concessionaireProfile?.type || "persona_fisica",
      rfc: concessionaire.concessionaireProfile?.rfc || "",
      taxAddress: concessionaire.concessionaireProfile?.taxAddress || "",
      legalRepresentative: concessionaire.concessionaireProfile?.legalRepresentative || "",
      notes: concessionaire.concessionaireProfile?.notes || "",
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
  const filteredConcessionaires = searchTerm && concessionaires.length > 0
    ? concessionaires.filter((c: any) => 
        c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.concessionaireProfile?.rfc?.toLowerCase().includes(searchTerm.toLowerCase()))
    : concessionaires;

  return (
    <AdminLayout>
      <Helmet>
        <title>Gestión de Concesionarios | ParquesMX</title>
        <meta 
          name="description" 
          content="Administración de concesionarios autorizados para operar en los parques municipales" 
        />
      </Helmet>

      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Concesionarios</h1>
            <p className="text-muted-foreground">
              Administra los concesionarios autorizados para operar en los parques
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} />
                Nuevo Concesionario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Concesionario</DialogTitle>
                <DialogDescription>
                  Ingresa los datos del usuario y el perfil fiscal del concesionario.
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de Usuario *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña *</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={createForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo Electrónico *</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
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
                  </div>
                  <FormField
                    control={createForm.control}
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
                    control={createForm.control}
                    name="rfc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RFC *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="taxAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección Fiscal *</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="legalRepresentative"
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
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={createConcessionaire.isPending}
                    >
                      {createConcessionaire.isPending ? "Guardando..." : "Guardar Concesionario"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="w-full">
          
          <TabsContent value="listado">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Concesionarios Registrados</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre, email o RFC"
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
                  <p className="text-center py-4">Cargando concesionarios...</p>
                ) : filteredConcessionaires.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                    <p className="text-lg font-medium">No hay concesionarios registrados</p>
                    <p className="text-muted-foreground">
                      {searchTerm ? "No se encontraron resultados para tu búsqueda" : "Registra el primer concesionario haciendo clic en 'Nuevo Concesionario'"}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre Completo</TableHead>
                        <TableHead>Correo Electrónico</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>RFC</TableHead>
                        <TableHead>Representante Legal</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredConcessionaires.map((concessionaire: any) => (
                        <TableRow key={concessionaire.id}>
                          <TableCell className="font-medium">{concessionaire.fullName}</TableCell>
                          <TableCell>{concessionaire.email}</TableCell>
                          <TableCell>
                            {concessionaire.concessionaireProfile?.type === "persona_fisica" ? "Persona Física" : "Persona Moral"}
                          </TableCell>
                          <TableCell>{concessionaire.concessionaireProfile?.rfc}</TableCell>
                          <TableCell>{concessionaire.concessionaireProfile?.legalRepresentative || "-"}</TableCell>
                          <TableCell>{renderStatus(concessionaire.concessionaireProfile?.status || "activo")}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEdit(concessionaire)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              asChild
                            >
                              <a href={`/admin/users/concessionaires/${concessionaire.id}/documents`}>
                                <FileText className="h-4 w-4 mr-1" />
                                Documentos
                              </a>
                            </Button>
                          </div>
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
                <CardTitle>Documentación de Concesionarios</CardTitle>
                <CardDescription>
                  Gestiona los documentos legales y administrativos de los concesionarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingConcessionaires ? (
                  <p className="text-center py-4">Cargando concesionarios...</p>
                ) : filteredConcessionaires.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                    <p className="text-lg font-medium">No hay concesionarios registrados</p>
                    <p className="text-muted-foreground">
                      {searchTerm ? "No se encontraron resultados para tu búsqueda" : "Registra el primer concesionario haciendo clic en 'Nuevo Concesionario'"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="relative w-64 mb-4">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nombre o RFC"
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredConcessionaires.map((concessionaire: any) => (
                        <Card key={concessionaire.id} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>{concessionaire.fullName?.substring(0, 2).toUpperCase() || "CN"}</AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-base">{concessionaire.fullName}</CardTitle>
                                <CardDescription>{concessionaire.concessionaireProfile?.rfc || "Sin RFC"}</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between items-center">
                              <div>
                                <Badge className={
                                  concessionaire.concessionaireProfile?.status === "activo" ? "bg-green-500" : 
                                  concessionaire.concessionaireProfile?.status === "inactivo" ? "bg-gray-500" : 
                                  "bg-red-500"
                                }>
                                  {concessionaire.concessionaireProfile?.status === "activo" ? "Activo" :
                                  concessionaire.concessionaireProfile?.status === "inactivo" ? "Inactivo" :
                                  "Suspendido"}
                                </Badge>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <a href={`/admin/users/concessionaires/${concessionaire.id}/documents`}>
                                  <FileText className="h-4 w-4 mr-1" />
                                  Ver Documentos
                                </a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evaluaciones">
            <Card>
              <CardHeader>
                <CardTitle>Evaluaciones de Concesionarios</CardTitle>
                <CardDescription>
                  Registra y consulta las evaluaciones de desempeño de los concesionarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                  <p className="text-lg font-medium">Módulo de Evaluaciones</p>
                  <p className="text-muted-foreground mb-4">
                    Aquí podrás registrar evaluaciones de calidad de servicio, cumplimiento normativo e impacto ambiental.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Selecciona un concesionario en la pestaña de Listado para gestionar sus evaluaciones.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Diálogo para editar concesionario */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Concesionario</DialogTitle>
            <DialogDescription>
              Actualiza los datos del concesionario.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico *</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              </div>
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="taxAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección Fiscal *</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="legalRepresentative"
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
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={updateConcessionaire.isPending}
                >
                  {updateConcessionaire.isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}