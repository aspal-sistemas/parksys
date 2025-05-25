import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { FileText, Plus, CheckCircle, XCircle, Calendar, ExternalLink, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Esquema de validación para el formulario de documento
const documentSchema = z.object({
  documentType: z.string({
    required_error: "El tipo de documento es obligatorio",
  }),
  documentName: z.string().min(3, { 
    message: "El nombre del documento debe tener al menos 3 caracteres" 
  }),
  documentUrl: z.string().url({ 
    message: "Debe ser una URL válida" 
  }),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

export default function ConcessionaireDocuments() {
  const { id } = useParams();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Cargar el concesionario
  const { data: concessionaire, isLoading: isLoadingConcessionaire } = useQuery({
    queryKey: [`/api/users/concessionaires/${id}`],
  });

  // Cargar los documentos del concesionario
  const { data: documents = [], isLoading: isLoadingDocuments } = useQuery({
    queryKey: [`/api/users/concessionaires/${id}/documents`],
  });

  // Formulario para subir un nuevo documento
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      documentType: "",
      documentName: "",
      documentUrl: "",
      expiryDate: "",
      notes: "",
    },
  });

  // Mutación para subir un nuevo documento
  const uploadDocument = useMutation({
    mutationFn: async (data: DocumentFormValues) => {
      const response = await fetch(`/api/users/concessionaires/${id}/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al subir el documento");
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsUploadDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/users/concessionaires/${id}/documents`] });
      toast({
        title: "Documento subido",
        description: "El documento ha sido cargado correctamente.",
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

  // Mutación para verificar un documento
  const verifyDocument = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await fetch(`/api/users/concessionaires/${id}/documents/${documentId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al verificar el documento");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/concessionaires/${id}/documents`] });
      toast({
        title: "Documento verificado",
        description: "El documento ha sido marcado como verificado.",
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

  // Mutación para eliminar un documento
  const deleteDocument = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await fetch(`/api/users/concessionaires/${id}/documents/${documentId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al eliminar el documento");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/concessionaires/${id}/documents`] });
      toast({
        title: "Documento eliminado",
        description: "El documento ha sido eliminado correctamente.",
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

  // Función para manejar la subida de un nuevo documento
  const onSubmit = (values: DocumentFormValues) => {
    uploadDocument.mutate(values);
  };

  // Renderizar el tipo de documento en texto legible
  const renderDocumentType = (type: string) => {
    switch (type) {
      case "rfc":
        return "RFC";
      case "identificacion":
        return "Identificación Oficial";
      case "acta_constitutiva":
        return "Acta Constitutiva";
      case "poder_notarial":
        return "Poder Notarial";
      case "comprobante_domicilio":
        return "Comprobante de Domicilio";
      case "permiso_operacion":
        return "Permiso de Operación";
      case "licencia_funcionamiento":
        return "Licencia de Funcionamiento";
      case "dictamen_proteccion_civil":
        return "Dictamen de Protección Civil";
      case "alta_hacienda":
        return "Alta en Hacienda";
      case "carta_antecedentes":
        return "Carta de No Antecedentes Penales";
      default:
        return type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: es });
    } catch (e) {
      return "Fecha inválida";
    }
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Documentos del Concesionario | ParquesMX</title>
        <meta 
          name="description" 
          content="Gestión de documentos legales y administrativos del concesionario" 
        />
      </Helmet>

      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            asChild
          >
            <a href="/admin/users/concessionaires">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </a>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Documentos del Concesionario
            </h1>
            {!isLoadingConcessionaire && concessionaire && (
              <p className="text-muted-foreground">
                {concessionaire.fullName} {" - "} 
                {concessionaire.concessionaireProfile?.type === "persona_fisica" ? "Persona Física" : "Persona Moral"}
              </p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Información del Concesionario</CardTitle>
                  <CardDescription>
                    Datos generales y fiscales
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingConcessionaire ? (
                <div className="flex justify-center py-4">
                  <div className="animate-pulse flex flex-col space-y-2 w-full">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ) : concessionaire && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="" alt={concessionaire.fullName} />
                        <AvatarFallback>
                          {concessionaire.fullName?.substring(0, 2).toUpperCase() || "CN"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-lg font-medium">{concessionaire.fullName}</p>
                        <p className="text-sm text-muted-foreground">{concessionaire.email}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                      <p>{concessionaire.phone || "No especificado"}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Estado</p>
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
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tipo de Concesionario</p>
                      <p>
                        {concessionaire.concessionaireProfile?.type === "persona_fisica" ? "Persona Física" : "Persona Moral"}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">RFC</p>
                      <p>{concessionaire.concessionaireProfile?.rfc}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Dirección Fiscal</p>
                      <p>{concessionaire.concessionaireProfile?.taxAddress}</p>
                    </div>
                    
                    {concessionaire.concessionaireProfile?.legalRepresentative && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Representante Legal</p>
                        <p>{concessionaire.concessionaireProfile.legalRepresentative}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Documentos Registrados</CardTitle>
                <CardDescription>
                  Documentos legales y administrativos del concesionario
                </CardDescription>
              </div>
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus size={16} />
                    Subir Documento
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Subir Nuevo Documento</DialogTitle>
                    <DialogDescription>
                      Ingresa los datos del documento que deseas registrar para este concesionario.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="documentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Documento *</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona un tipo de documento" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="rfc">RFC</SelectItem>
                                <SelectItem value="identificacion">Identificación Oficial</SelectItem>
                                <SelectItem value="acta_constitutiva">Acta Constitutiva</SelectItem>
                                <SelectItem value="poder_notarial">Poder Notarial</SelectItem>
                                <SelectItem value="comprobante_domicilio">Comprobante de Domicilio</SelectItem>
                                <SelectItem value="permiso_operacion">Permiso de Operación</SelectItem>
                                <SelectItem value="licencia_funcionamiento">Licencia de Funcionamiento</SelectItem>
                                <SelectItem value="dictamen_proteccion_civil">Dictamen de Protección Civil</SelectItem>
                                <SelectItem value="alta_hacienda">Alta en Hacienda</SelectItem>
                                <SelectItem value="carta_antecedentes">Carta de No Antecedentes Penales</SelectItem>
                                <SelectItem value="otro">Otro</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="documentName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del Documento *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              Nombre descriptivo para identificar el documento
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="documentUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL del Documento *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              URL donde se encuentra almacenado el documento
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Vencimiento</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormDescription>
                              Fecha en que vence la validez del documento (opcional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notas</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              Información adicional sobre el documento (opcional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          disabled={uploadDocument.isPending}
                        >
                          {uploadDocument.isPending ? "Subiendo..." : "Subir Documento"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingDocuments ? (
              <div className="flex justify-center py-4">
                <div className="animate-pulse flex flex-col space-y-4 w-full">
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-10 w-10 text-blue-500 mx-auto mb-2" />
                <p className="text-lg font-medium">No hay documentos registrados</p>
                <p className="text-muted-foreground mb-4">
                  Aún no se han subido documentos para este concesionario.
                </p>
                <Button 
                  onClick={() => setIsUploadDialogOpen(true)}
                  className="gap-2"
                >
                  <Plus size={16} />
                  Subir Primer Documento
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Fecha de Carga</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((document: any) => (
                    <TableRow key={document.id}>
                      <TableCell>{renderDocumentType(document.documentType)}</TableCell>
                      <TableCell className="font-medium">{document.documentName}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          {formatDate(document.uploadDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {document.expiryDate ? (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            {formatDate(document.expiryDate)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sin vencimiento</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {document.isVerified ? (
                          <Badge className="bg-green-500 flex items-center gap-1 w-fit">
                            <CheckCircle className="h-3 w-3" />
                            Verificado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <XCircle className="h-3 w-3" />
                            Sin verificar
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(document.documentUrl, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          
                          {!document.isVerified && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => verifyDocument.mutate(document.id)}
                              disabled={verifyDocument.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Verificar
                            </Button>
                          )}
                          
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              if (confirm("¿Estás seguro de que deseas eliminar este documento?")) {
                                deleteDocument.mutate(document.id);
                              }
                            }}
                            disabled={deleteDocument.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Eliminar
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
      </div>
    </AdminLayout>
  );
}