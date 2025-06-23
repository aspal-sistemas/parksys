import React from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Schema de validación para edición de eventos AMBU
const editEventoSchema = z.object({
  titulo: z.string().min(5, "Título debe tener al menos 5 caracteres"),
  descripcion: z.string().min(10, "Descripción debe tener al menos 10 caracteres"),
  categoria: z.string().min(1, "Categoría requerida"),
  fechaEvento: z.string().min(1, "Fecha requerida"),
  horaInicio: z.string().min(1, "Hora de inicio requerida"),
  horaFin: z.string().min(1, "Hora de fin requerida"),
  numeroAsistentes: z.number().min(1, "Debe haber al menos 1 asistente"),
  status: z.enum(["borrador", "solicitado", "en_revision", "aprobado", "rechazado", "cancelado", "realizado"]),
  parqueId: z.number().min(1, "Debe seleccionar un parque"),
  zonasRequeridas: z.string().optional(),
  equipamiento: z.string().optional(),
  observaciones: z.string().optional()
});

type EditEventoForm = z.infer<typeof editEventoSchema>;

const categoriasBajoImpacto = [
  { value: "evento_familiar", label: "Evento Familiar" },
  { value: "sesion_fotografia", label: "Sesión Fotográfica" },
  { value: "convivencia_escolar", label: "Convivencia Escolar" },
  { value: "sendero_interpretativo", label: "Sendero Interpretativo" },
  { value: "recorrido_educativo", label: "Recorrido Educativo" }
];

const categoriasAltoImpacto = [
  { value: "evento_masivo", label: "Evento Masivo" },
  { value: "evento_comercial", label: "Evento Comercial" },
  { value: "evento_cooperativo", label: "Evento Cooperativo" },
  { value: "carrera_deportiva", label: "Carrera Deportiva" },
  { value: "actividad_fisica_grupal", label: "Actividad Física Grupal" },
  { value: "evento_corporativo", label: "Evento Corporativo" }
];

const statusOptions = [
  { value: "borrador", label: "Borrador" },
  { value: "solicitado", label: "Solicitado" },
  { value: "en_revision", label: "En Revisión" },
  { value: "aprobado", label: "Aprobado" },
  { value: "rechazado", label: "Rechazado" },
  { value: "cancelado", label: "Cancelado" },
  { value: "realizado", label: "Realizado" }
];

const parquesOptions = [
  { value: 1, label: "Parque Metropolitano de Guadalajara" },
  { value: 2, label: "Parque Deán o de La Liberación" },
  { value: 3, label: "Parque González Gallo" },
  { value: 4, label: "Bosque Los Colomos" },
  { value: 5, label: "Parque Natural Huentitán" },
  { value: 6, label: "Parque Agua Azul" },
  { value: 7, label: "Parque Ávila Camacho" },
  { value: 8, label: "Parque Puerta La Barranca" },
  { value: 9, label: "Parque Morelos" },
  { value: 10, label: "Parque Alcalde" },
  { value: 11, label: "Bosque Urbano Tlaquepaque" },
  { value: 12, label: "Parque Roberto Montenegro" },
  { value: 13, label: "Parque General Luis Quintanar" }
];

export default function EditarEventoAmbu() {
  const params = useParams();
  const eventoId = params.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Cargar datos del evento
  const { data: evento, isLoading } = useQuery({
    queryKey: [`/api/eventos-ambu/${eventoId}`],
    queryFn: async () => {
      const response = await fetch(`/api/eventos-ambu/${eventoId}`);
      if (!response.ok) throw new Error("Error al cargar evento");
      return response.json();
    }
  });

  const form = useForm<EditEventoForm>({
    resolver: zodResolver(editEventoSchema),
    values: evento?.evento ? {
      titulo: evento.evento.titulo || "",
      descripcion: evento.evento.descripcion || "",
      categoria: evento.evento.categoria || "",
      fechaEvento: evento.evento.fechaEvento || "",
      horaInicio: evento.evento.horaInicio || "",
      horaFin: evento.evento.horaFin || "",
      numeroAsistentes: evento.evento.numeroAsistentes || 1,
      status: evento.evento.status || "borrador",
      parqueId: evento.evento.parqueId || 1,
      zonasRequeridas: evento.evento.zonasRequeridas || "",
      equipamiento: evento.evento.equipamiento || "",
      observaciones: evento.evento.observaciones || ""
    } : undefined
  });

  // Mutation para actualizar evento
  const updateEventoMutation = useMutation({
    mutationFn: async (data: EditEventoForm) => {
      const response = await fetch(`/api/eventos-ambu/${eventoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Error al actualizar evento");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Evento actualizado",
        description: "Los cambios se han guardado exitosamente"
      });
      queryClient.invalidateQueries({ queryKey: [`/api/eventos-ambu/${eventoId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/eventos-ambu"] });
      setLocation(`/admin/eventos-ambu/${eventoId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive"
      });
    }
  });

  const onSubmit = async (data: EditEventoForm) => {
    await updateEventoMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Evento no encontrado</p>
        <Button className="mt-4" onClick={() => setLocation("/admin/eventos-ambu")}>
          Volver al listado
        </Button>
      </div>
    );
  }

  const impactoTipo = evento.evento.impactoTipo;
  const categoriasDisponibles = impactoTipo === "bajo_impacto" ? categoriasBajoImpacto : categoriasAltoImpacto;

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocation(`/admin/eventos-ambu/${eventoId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Editar Evento AMBU
          </h1>
          <p className="text-gray-600">
            Modificar información del evento de {impactoTipo === "bajo_impacto" ? "bajo" : "alto"} impacto
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica del Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título del evento *</Label>
              <Input
                id="titulo"
                {...form.register("titulo")}
                placeholder="Nombre descriptivo del evento"
              />
              {form.formState.errors.titulo && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.titulo.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                {...form.register("descripcion")}
                placeholder="Descripción detallada del evento"
                rows={4}
              />
              {form.formState.errors.descripcion && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.descripcion.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="categoria">Categoría *</Label>
              <Select 
                value={form.watch("categoria")} 
                onValueChange={(value) => form.setValue("categoria", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categoriasDisponibles.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.categoria && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.categoria.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Estado del evento *</Label>
              <Select 
                value={form.watch("status")} 
                onValueChange={(value) => form.setValue("status", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.status.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fecha y Ubicación */}
        <Card>
          <CardHeader>
            <CardTitle>Fecha y Ubicación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fechaEvento">Fecha del evento *</Label>
                <Input
                  id="fechaEvento"
                  type="date"
                  {...form.register("fechaEvento")}
                />
                {form.formState.errors.fechaEvento && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.fechaEvento.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="horaInicio">Hora de inicio *</Label>
                <Input
                  id="horaInicio"
                  type="time"
                  {...form.register("horaInicio")}
                />
                {form.formState.errors.horaInicio && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.horaInicio.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="horaFin">Hora de fin *</Label>
                <Input
                  id="horaFin"
                  type="time"
                  {...form.register("horaFin")}
                />
                {form.formState.errors.horaFin && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.horaFin.message}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parqueId">Bosque Urbano *</Label>
                <Select 
                  value={form.watch("parqueId")?.toString()} 
                  onValueChange={(value) => form.setValue("parqueId", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar parque" />
                  </SelectTrigger>
                  <SelectContent>
                    {parquesOptions.map((parque) => (
                      <SelectItem key={parque.value} value={parque.value.toString()}>
                        {parque.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.parqueId && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.parqueId.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="numeroAsistentes">Número de asistentes *</Label>
                <Input
                  id="numeroAsistentes"
                  type="number"
                  min="1"
                  {...form.register("numeroAsistentes", { valueAsNumber: true })}
                />
                {form.formState.errors.numeroAsistentes && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.numeroAsistentes.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="zonasRequeridas">Zonas requeridas</Label>
              <Textarea
                id="zonasRequeridas"
                {...form.register("zonasRequeridas")}
                placeholder="Especifique las zonas del parque que utilizará"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Logística */}
        <Card>
          <CardHeader>
            <CardTitle>Logística y Equipamiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="equipamiento">Equipamiento y materiales</Label>
              <Textarea
                id="equipamiento"
                {...form.register("equipamiento")}
                placeholder="Describa el equipamiento, materiales y mobiliario que utilizará"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="observaciones">Observaciones adicionales</Label>
              <Textarea
                id="observaciones"
                {...form.register("observaciones")}
                placeholder="Comentarios, observaciones o notas especiales sobre el evento"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation(`/admin/eventos-ambu/${eventoId}`)}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={updateEventoMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateEventoMutation.isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}