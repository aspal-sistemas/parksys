import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, FileTextIcon, InfoIcon, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";


// Schema de validación para eventos de bajo impacto
const bajoImpactoSchema = z.object({
  // Información del evento
  tipoEvento: z.enum(["evento_familiar", "sesion_fotografia", "convivencia_escolar", "sendero_interpretativo", "recorrido_educativo", "otro"]),
  otroTipo: z.string().optional(),
  descripcionActividad: z.string().min(10, "Descripción mínima de 10 caracteres"),
  nivelEducativo: z.string().optional(),
  
  // Ubicación
  parqueSeleccionado: z.string().min(1, "Debe seleccionar un parque"),
  zonasRequeridas: z.string().optional(),
  
  // Logística
  fechaEvento: z.string().min(1, "Fecha requerida"),
  horarioInicio: z.string().min(1, "Horario de inicio requerido"),
  horarioFin: z.string().min(1, "Horario de fin requerido"),
  equipamiento: z.string().optional(),
  numeroAsistentes: z.number().min(1, "Mínimo 1 asistente").max(200, "Máximo 200 asistentes para bajo impacto"),
  numeroMenores: z.number().optional(),
  numeroAdultos: z.number().optional(),
  
  // Datos del solicitante
  nombreSolicitante: z.string().min(2, "Nombre requerido"),
  telefonoSolicitante: z.string().min(10, "Teléfono requerido"),
  emailSolicitante: z.string().email("Email válido requerido"),
  
  // Datos de institución
  nombreInstitucion: z.string().optional(),
  domicilioCalle: z.string().optional(),
  domicilioNumero: z.string().optional(),
  domicilioInterior: z.string().optional(),
  domicilioColonia: z.string().optional(),
  domicilioCP: z.string().optional(),
  telefonoInstitucion: z.string().optional(),
  emailInstitucion: z.string().email().optional().or(z.literal("")),
  municipio: z.string().optional(),
  
  // Facturación
  requiereFactura: z.boolean().default(false),
  rfc: z.string().optional(),
  razonSocial: z.string().optional(),
  
  // Autorización fotografía
  autorizaFotografia: z.boolean().default(false)
});

type BajoImpactoForm = z.infer<typeof bajoImpactoSchema>;

const parquesOptions = [
  { value: "1", label: "Parque Metropolitano de Guadalajara" },
  { value: "2", label: "Parque Deán o de La Liberación" },
  { value: "3", label: "Parque González Gallo" },
  { value: "4", label: "Bosque Los Colomos" },
  { value: "5", label: "Parque Natural Huentitán" },
  { value: "6", label: "Parque Agua Azul" },
  { value: "7", label: "Parque Ávila Camacho" },
  { value: "8", label: "Parque Puerta La Barranca" },
  { value: "9", label: "Parque Morelos" },
  { value: "10", label: "Parque Alcalde" },
  { value: "11", label: "Bosque Urbano Tlaquepaque" },
  { value: "12", label: "Parque Roberto Montenegro" },
  { value: "13", label: "Parque General Luis Quintanar" }
];

export default function SolicitudBajoImpacto() {
  const { toast } = useToast();

  const [costoCalculado, setCostoCalculado] = useState<any>(null);
  
  const form = useForm<BajoImpactoForm>({
    resolver: zodResolver(bajoImpactoSchema),
    defaultValues: {
      requiereFactura: false,
      autorizaFotografia: false,
      numeroAsistentes: 1,
      numeroMenores: 0,
      numeroAdultos: 0
    }
  });

  const { watch, setValue } = form;
  const tipoEvento = watch("tipoEvento");
  const requiereFactura = watch("requiereFactura");
  const numeroAsistentes = watch("numeroAsistentes");
  const numeroMenores = watch("numeroMenores") || 0;
  const numeroAdultos = watch("numeroAdultos") || 0;

  // Crear solicitud
  const crearSolicitudMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/eventos-ambu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Error al crear solicitud");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Solicitud creada exitosamente",
        description: "Su solicitud de evento de bajo impacto ha sido registrada. Será revisada en un plazo de 10 días hábiles."
      });
      form.reset();
      setLocation("/admin/eventos-ambu");
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear solicitud",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive"
      });
    }
  });

  const onSubmit = async (data: BajoImpactoForm) => {
    // Validar que la suma de menores y adultos coincida con total de asistentes
    if ((data.numeroMenores || 0) + (data.numeroAdultos || 0) !== data.numeroAsistentes) {
      toast({
        title: "Error de validación",
        description: "La suma de menores y adultos debe coincidir con el número total de asistentes",
        variant: "destructive"
      });
      return;
    }

    // Validar fecha (mínimo 10 días hábiles de anticipación)
    const fechaEvento = new Date(data.fechaEvento);
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + 10);
    
    if (fechaEvento < fechaLimite) {
      toast({
        title: "Fecha no válida",
        description: "Los eventos de bajo impacto deben solicitarse con mínimo 10 días hábiles de anticipación",
        variant: "destructive"
      });
      return;
    }

    // Preparar datos para envío
    const eventoData = {
      titulo: `${data.tipoEvento === "otro" ? data.otroTipo : data.tipoEvento} - ${data.nombreSolicitante}`,
      descripcion: data.descripcionActividad,
      impactoTipo: "bajo_impacto",
      categoria: data.tipoEvento,
      fechaEvento: data.fechaEvento,
      horaInicio: data.horarioInicio,
      horaFin: data.horarioFin,
      parqueId: parseInt(data.parqueSeleccionado),
      zonasRequeridas: data.zonasRequeridas,
      numeroAsistentes: data.numeroAsistentes,
      numeroMenores: data.numeroMenores,
      numeroAdultos: data.numeroAdultos,
      equipamiento: data.equipamiento,
      requiereFotografiaAutorizada: data.autorizaFotografia,
      status: "solicitado"
    };

    const solicitudData = {
      nombreSolicitante: data.nombreSolicitante,
      telefonoSolicitante: data.telefonoSolicitante,
      emailSolicitante: data.emailSolicitante,
      nombreInstitucion: data.nombreInstitucion,
      domicilioCalle: data.domicilioCalle,
      domicilioNumero: data.domicilioNumero,
      domicilioInterior: data.domicilioInterior,
      domicilioColonia: data.domicilioColonia,
      domicilioCP: data.domicilioCP,
      telefonoInstitucion: data.telefonoInstitucion,
      emailInstitucion: data.emailInstitucion,
      municipio: data.municipio,
      requiereFactura: data.requiereFactura,
      rfc: data.rfc,
      razonSocial: data.razonSocial
    };

    await crearSolicitudMutation.mutateAsync({
      evento: eventoData,
      solicitud: solicitudData
    });
  };

  // Auto-calcular total de asistentes
  React.useEffect(() => {
    const total = numeroMenores + numeroAdultos;
    if (total > 0 && total !== numeroAsistentes) {
      setValue("numeroAsistentes", total);
    }
  }, [numeroMenores, numeroAdultos, numeroAsistentes, setValue]);

  // Calcular costo estimado
  React.useEffect(() => {
    if (tipoEvento === "sesion_fotografia") {
      setCostoCalculado({ total: 220, desglose: [{ concepto: "Sesión Fotográfica Social", subtotal: 220 }] });
    } else {
      setCostoCalculado(null);
    }
  }, [tipoEvento]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileTextIcon className="h-6 w-6 text-emerald-600" />
          Solicitud de Evento de Bajo Impacto
        </CardTitle>
        <CardDescription>
          Formulario F-DIC-22 - Para eventos familiares, sesiones fotográficas y actividades educativas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Tipo de Evento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileTextIcon className="h-5 w-5" />
              Tipo de Evento
            </CardTitle>
            <CardDescription>
              Seleccione el tipo de evento que desea realizar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tipoEvento">Tipo de Evento *</Label>
                <RadioGroup
                  value={form.watch("tipoEvento")}
                  onValueChange={(value) => form.setValue("tipoEvento", value as any)}
                  className="grid grid-cols-2 gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="evento_familiar" id="evento_familiar" />
                    <Label htmlFor="evento_familiar">Evento Familiar</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sesion_fotografia" id="sesion_fotografia" />
                    <Label htmlFor="sesion_fotografia">Sesión de Fotografía/Video</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="convivencia_escolar" id="convivencia_escolar" />
                    <Label htmlFor="convivencia_escolar">Convivencia Escolar</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sendero_interpretativo" id="sendero_interpretativo" />
                    <Label htmlFor="sendero_interpretativo">Sendero Interpretativo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="recorrido_educativo" id="recorrido_educativo" />
                    <Label htmlFor="recorrido_educativo">Recorrido Educativo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="otro" id="otro" />
                    <Label htmlFor="otro">Otro</Label>
                  </div>
                </RadioGroup>
                {form.formState.errors.tipoEvento && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.tipoEvento.message}</p>
                )}
              </div>

              {tipoEvento === "otro" && (
                <div>
                  <Label htmlFor="otroTipo">Especifique el tipo de evento *</Label>
                  <Input
                    id="otroTipo"
                    {...form.register("otroTipo")}
                    placeholder="Describa el tipo de evento"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="descripcionActividad">Descripción de la actividad *</Label>
                <Textarea
                  id="descripcionActividad"
                  {...form.register("descripcionActividad")}
                  placeholder="Describe brevemente la actividad que deseas realizar..."
                  rows={4}
                />
                {form.formState.errors.descripcionActividad && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.descripcionActividad.message}</p>
                )}
              </div>

              {(tipoEvento === "sendero_interpretativo" || tipoEvento === "recorrido_educativo") && (
                <div>
                  <Label htmlFor="nivelEducativo">Nivel educativo que se atenderá</Label>
                  <Input
                    id="nivelEducativo"
                    {...form.register("nivelEducativo")}
                    placeholder="Ej: Preescolar, Primaria, Secundaria, Bachillerato"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Nota: Para senderos interpretativos y recorridos educativos, el horario es de 10:00 a 12:30 horas.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ubicación */}
        <Card>
          <CardHeader>
            <CardTitle>Ubicación del Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="parqueSeleccionado">Bosque Urbano *</Label>
                <select
                  id="parqueSeleccionado"
                  {...form.register("parqueSeleccionado")}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Seleccione un parque...</option>
                  {parquesOptions.map((parque) => (
                    <option key={parque.value} value={parque.value}>
                      {parque.label}
                    </option>
                  ))}
                </select>
                {form.formState.errors.parqueSeleccionado && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.parqueSeleccionado.message}</p>
                )}
              </div>

              {tipoEvento !== "sendero_interpretativo" && tipoEvento !== "recorrido_educativo" && (
                <div>
                  <Label htmlFor="zonasRequeridas">Zona(s) del bosque urbano requerida(s)</Label>
                  <Textarea
                    id="zonasRequeridas"
                    {...form.register("zonasRequeridas")}
                    placeholder="Especifique las zonas específicas que necesita usar..."
                    rows={2}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Logística */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Logística del Evento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
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
                <p className="text-sm text-gray-500 mt-1">
                  Mínimo 10 días hábiles de anticipación
                </p>
              </div>

              <div>
                <Label htmlFor="numeroAsistentes">Número de asistentes *</Label>
                <Input
                  id="numeroAsistentes"
                  type="number"
                  min="1"
                  max="200"
                  {...form.register("numeroAsistentes", { valueAsNumber: true })}
                />
                {form.formState.errors.numeroAsistentes && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.numeroAsistentes.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="horarioInicio">Horario de inicio *</Label>
                <Input
                  id="horarioInicio"
                  type="time"
                  {...form.register("horarioInicio")}
                />
                {form.formState.errors.horarioInicio && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.horarioInicio.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="horarioFin">Horario de fin *</Label>
                <Input
                  id="horarioFin"
                  type="time"
                  {...form.register("horarioFin")}
                />
                {form.formState.errors.horarioFin && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.horarioFin.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="numeroMenores">Número de menores</Label>
                <Input
                  id="numeroMenores"
                  type="number"
                  min="0"
                  {...form.register("numeroMenores", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="numeroAdultos">Número de adultos</Label>
                <Input
                  id="numeroAdultos"
                  type="number"
                  min="0"
                  {...form.register("numeroAdultos", { valueAsNumber: true })}
                />
              </div>
            </div>

            {tipoEvento !== "sendero_interpretativo" && tipoEvento !== "recorrido_educativo" && (
              <div className="mt-4">
                <Label htmlFor="equipamiento">Equipamiento, materiales y mobiliario a ingresar</Label>
                <Textarea
                  id="equipamiento"
                  {...form.register("equipamiento")}
                  placeholder="Mencione el equipamiento, materiales y mobiliario que pretende ingresar..."
                  rows={3}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Datos del Solicitante */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del Solicitante</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombreSolicitante">Nombre completo *</Label>
                <Input
                  id="nombreSolicitante"
                  {...form.register("nombreSolicitante")}
                  placeholder="Nombre completo del solicitante"
                />
                {form.formState.errors.nombreSolicitante && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.nombreSolicitante.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="telefonoSolicitante">Teléfono *</Label>
                <Input
                  id="telefonoSolicitante"
                  {...form.register("telefonoSolicitante")}
                  placeholder="Número de teléfono"
                />
                {form.formState.errors.telefonoSolicitante && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.telefonoSolicitante.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="emailSolicitante">Correo electrónico *</Label>
                <Input
                  id="emailSolicitante"
                  type="email"
                  {...form.register("emailSolicitante")}
                  placeholder="correo@ejemplo.com"
                />
                {form.formState.errors.emailSolicitante && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.emailSolicitante.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Datos de Institución */}
        <Card>
          <CardHeader>
            <CardTitle>Datos de la Institución (Opcional)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="nombreInstitucion">Nombre de la institución</Label>
                <Input
                  id="nombreInstitucion"
                  {...form.register("nombreInstitucion")}
                  placeholder="Nombre de la institución u organización"
                />
              </div>

              <div>
                <Label htmlFor="domicilioCalle">Calle</Label>
                <Input
                  id="domicilioCalle"
                  {...form.register("domicilioCalle")}
                  placeholder="Nombre de la calle"
                />
              </div>

              <div>
                <Label htmlFor="domicilioNumero">Número</Label>
                <Input
                  id="domicilioNumero"
                  {...form.register("domicilioNumero")}
                  placeholder="Número exterior"
                />
              </div>

              <div>
                <Label htmlFor="domicilioColonia">Colonia</Label>
                <Input
                  id="domicilioColonia"
                  {...form.register("domicilioColonia")}
                  placeholder="Colonia o barrio"
                />
              </div>

              <div>
                <Label htmlFor="domicilioCP">Código Postal</Label>
                <Input
                  id="domicilioCP"
                  {...form.register("domicilioCP")}
                  placeholder="Código postal"
                />
              </div>

              <div>
                <Label htmlFor="telefonoInstitucion">Teléfono institucional</Label>
                <Input
                  id="telefonoInstitucion"
                  {...form.register("telefonoInstitucion")}
                  placeholder="Teléfono de la institución"
                />
              </div>

              <div>
                <Label htmlFor="municipio">Municipio</Label>
                <Input
                  id="municipio"
                  {...form.register("municipio")}
                  placeholder="Municipio"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Facturación */}
        <Card>
          <CardHeader>
            <CardTitle>Datos de Facturación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiereFactura"
                  checked={requiereFactura}
                  onCheckedChange={(checked) => form.setValue("requiereFactura", !!checked)}
                />
                <Label htmlFor="requiereFactura">Requiere factura</Label>
              </div>

              {requiereFactura && (
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="rfc">RFC</Label>
                    <Input
                      id="rfc"
                      {...form.register("rfc")}
                      placeholder="RFC para facturación"
                    />
                  </div>

                  <div>
                    <Label htmlFor="razonSocial">Razón Social</Label>
                    <Input
                      id="razonSocial"
                      {...form.register("razonSocial")}
                      placeholder="Razón social para facturación"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Autorización */}
        <Card>
          <CardHeader>
            <CardTitle>Autorizaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autorizaFotografia"
                checked={form.watch("autorizaFotografia")}
                onCheckedChange={(checked) => form.setValue("autorizaFotografia", !!checked)}
              />
              <Label htmlFor="autorizaFotografia">
                Autorizo el uso de fotografías y video para difusión institucional
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Costo Estimado */}
        {costoCalculado && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Costo Estimado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-lg font-semibold text-blue-900">
                  Total: ${costoCalculado.total.toFixed(2)} MXN
                </p>
                {costoCalculado.desglose && costoCalculado.desglose.length > 0 && (
                  <div className="mt-2 text-sm text-blue-700">
                    <p className="font-medium">Desglose:</p>
                    {costoCalculado.desglose.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span>{item.concepto}</span>
                        <span>${item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 

          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={crearSolicitudMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {crearSolicitudMutation.isPending ? "Enviando..." : "Enviar Solicitud"}
          </Button>
        </div>
        </form>
      </CardContent>
    </Card>
  );
}