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
import { CalendarIcon, FileTextIcon, AlertTriangle, DollarSign, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";


// Schema de validación para eventos de alto impacto
const altoImpactoSchema = z.object({
  // Información del evento
  tipoEvento: z.enum(["evento_masivo", "evento_comercial", "evento_cooperativo", "carrera_deportiva", "actividad_fisica_grupal", "evento_corporativo"]),
  descripcionActividad: z.string().min(20, "Descripción mínima de 20 caracteres para eventos de alto impacto"),
  
  // Ubicación
  parqueSeleccionado: z.string().min(1, "Debe seleccionar un parque"),
  zonasRequeridas: z.string().min(10, "Debe especificar las zonas requeridas"),
  
  // Logística detallada
  fechaEvento: z.string().min(1, "Fecha requerida"),
  horarioInicio: z.string().min(1, "Horario de inicio requerido"),
  horarioFin: z.string().min(1, "Horario de fin requerido"),
  fechaMontaje: z.string().optional(),
  horaMontaje: z.string().optional(),
  fechaDesmontaje: z.string().optional(),
  horaDesmontaje: z.string().optional(),
  
  equipamiento: z.string().min(10, "Debe especificar el equipamiento detallado"),
  materiales: z.string().optional(),
  mobiliario: z.string().optional(),
  tiposResiduos: z.string().optional(),
  
  numeroAsistentes: z.number().min(201, "Eventos de alto impacto requieren mínimo 201 asistentes"),
  numeroMenores: z.number().optional(),
  numeroAdultos: z.number().optional(),
  
  // Logística específica de alto impacto
  logisticaDetallada: z.string().min(50, "Debe proporcionar logística detallada"),
  sembrado: z.string().optional(),
  minutoAMinuto: z.string().optional(),
  
  // Datos del solicitante
  nombreSolicitante: z.string().min(2, "Nombre requerido"),
  telefonoSolicitante: z.string().min(10, "Teléfono requerido"),
  emailSolicitante: z.string().email("Email válido requerido"),
  
  // Datos de institución (obligatorios para alto impacto)
  nombreInstitucion: z.string().min(5, "Nombre de institución requerido para eventos de alto impacto"),
  domicilioCalle: z.string().min(5, "Domicilio completo requerido"),
  domicilioNumero: z.string().min(1, "Número requerido"),
  domicilioColonia: z.string().min(3, "Colonia requerida"),
  domicilioCP: z.string().min(5, "Código postal requerido"),
  telefonoInstitucion: z.string().min(10, "Teléfono institucional requerido"),
  emailInstitucion: z.string().email("Email institucional válido requerido"),
  municipio: z.string().min(3, "Municipio requerido"),
  
  // Facturación (obligatoria para alto impacto)
  rfc: z.string().min(12, "RFC requerido para eventos de alto impacto"),
  razonSocial: z.string().min(5, "Razón social requerida"),
  
  // Autorización fotografía
  autorizaFotografia: z.boolean().default(false),
  
  // Confirmaciones específicas
  aceptaTerminos: z.boolean().refine(val => val === true, "Debe aceptar los términos y condiciones"),
  confirmaAnticipacion: z.boolean().refine(val => val === true, "Debe confirmar la anticipación de 2 meses")
});

type AltoImpactoForm = z.infer<typeof altoImpactoSchema>;

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

export default function SolicitudAltoImpacto() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [costoCalculado, setCostoCalculado] = useState<any>(null);
  
  const form = useForm<AltoImpactoForm>({
    resolver: zodResolver(altoImpactoSchema),
    defaultValues: {
      autorizaFotografia: false,
      aceptaTerminos: false,
      confirmaAnticipacion: false,
      numeroAsistentes: 201,
      numeroMenores: 0,
      numeroAdultos: 0
    }
  });

  const { watch, setValue } = form;
  const tipoEvento = watch("tipoEvento");
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
        description: "Su solicitud de evento de alto impacto ha sido registrada. Será revisada en un plazo de 2 meses. Se requiere 50% de anticipo."
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

  const onSubmit = async (data: AltoImpactoForm) => {
    // Validar que la suma de menores y adultos coincida con total de asistentes
    if ((data.numeroMenores || 0) + (data.numeroAdultos || 0) !== data.numeroAsistentes) {
      toast({
        title: "Error de validación",
        description: "La suma de menores y adultos debe coincidir con el número total de asistentes",
        variant: "destructive"
      });
      return;
    }

    // Validar fecha (mínimo 2 meses de anticipación)
    const fechaEvento = new Date(data.fechaEvento);
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() + 2);
    
    if (fechaEvento < fechaLimite) {
      toast({
        title: "Fecha no válida",
        description: "Los eventos de alto impacto deben solicitarse con mínimo 2 meses de anticipación",
        variant: "destructive"
      });
      return;
    }

    // Preparar datos para envío
    const eventoData = {
      titulo: `${data.tipoEvento} - ${data.nombreInstitucion}`,
      descripcion: data.descripcionActividad,
      impactoTipo: "alto_impacto",
      categoria: data.tipoEvento,
      fechaEvento: data.fechaEvento,
      horaInicio: data.horarioInicio,
      horaFin: data.horarioFin,
      fechaMontaje: data.fechaMontaje,
      horaMontaje: data.horaMontaje,
      fechaDesmontaje: data.fechaDesmontaje,
      horaDesmontaje: data.horaDesmontaje,
      parqueId: parseInt(data.parqueSeleccionado),
      zonasRequeridas: data.zonasRequeridas,
      numeroAsistentes: data.numeroAsistentes,
      numeroMenores: data.numeroMenores,
      numeroAdultos: data.numeroAdultos,
      equipamiento: data.equipamiento,
      materiales: data.materiales,
      mobiliario: data.mobiliario,
      tiposResiduos: data.tiposResiduos,
      logisticaDetallada: data.logisticaDetallada,
      sembrado: data.sembrado,
      minutoAMinuto: data.minutoAMinuto,
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
      domicilioColonia: data.domicilioColonia,
      domicilioCP: data.domicilioCP,
      telefonoInstitucion: data.telefonoInstitucion,
      emailInstitucion: data.emailInstitucion,
      municipio: data.municipio,
      requiereFactura: true, // Siempre true para alto impacto
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
    if (tipoEvento && numeroAsistentes) {
      let costoBase = 0;
      let desglose: any[] = [];

      if (tipoEvento === "carrera_deportiva") {
        costoBase = numeroAsistentes * 90 + 1000 + 1500; // Participantes + Ruta + Presencia marca
        desglose = [
          { concepto: `${numeroAsistentes} participantes x $90`, subtotal: numeroAsistentes * 90 },
          { concepto: "Permiso de uso de ruta", subtotal: 1000 },
          { concepto: "Presencia de marca", subtotal: 1500 }
        ];
      } else if (tipoEvento === "actividad_fisica_grupal") {
        costoBase = 3000; // Entrenamiento profesional mensual
        desglose = [{ concepto: "Entrenamiento profesional mensual", subtotal: 3000 }];
      } else if (tipoEvento === "evento_comercial") {
        if (numeroAsistentes <= 15) {
          costoBase = 10000;
          desglose = [{ concepto: "Producción comercial (1-15 personas)", subtotal: 10000 }];
        } else if (numeroAsistentes <= 50) {
          costoBase = 25000;
          desglose = [{ concepto: "Producción comercial (15-50 personas)", subtotal: 25000 }];
        } else {
          costoBase = 50000;
          desglose = [{ concepto: "Producción comercial (50+ personas)", subtotal: 50000 }];
        }
      }

      // Agregar costos de montaje/desmontaje
      costoBase += 1500;
      desglose.push({ concepto: "Montaje/Desmontaje", subtotal: 1500 });

      setCostoCalculado({
        total: costoBase,
        anticipo: costoBase * 0.5, // 50% anticipo
        depositoGarantia: costoBase * 0.1, // 10% depósito garantía
        desglose
      });
    }
  }, [tipoEvento, numeroAsistentes]);

  return (
    <AdminLayout>
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="mb-6">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="font-semibold">Evento de Alto Impacto</h2>
          </div>
          <p className="text-orange-700 mt-1">
            Requiere anticipación de 2 meses, 50% de anticipo y 10% de depósito en garantía.
          </p>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Solicitud de Evento de Alto Impacto
        </h1>
        <p className="text-gray-600">
          F-DIC-23 - Complete este formulario para solicitar autorización para eventos masivos, 
          comerciales, cooperativos y actividades corporativas.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Tipo de Evento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileTextIcon className="h-5 w-5" />
              Tipo de Evento de Alto Impacto
            </CardTitle>
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
                    <RadioGroupItem value="evento_masivo" id="evento_masivo" />
                    <Label htmlFor="evento_masivo">Evento Masivo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="evento_comercial" id="evento_comercial" />
                    <Label htmlFor="evento_comercial">Evento Comercial</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="evento_cooperativo" id="evento_cooperativo" />
                    <Label htmlFor="evento_cooperativo">Evento Cooperativo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="carrera_deportiva" id="carrera_deportiva" />
                    <Label htmlFor="carrera_deportiva">Carrera Deportiva</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="actividad_fisica_grupal" id="actividad_fisica_grupal" />
                    <Label htmlFor="actividad_fisica_grupal">Actividad Física Grupal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="evento_corporativo" id="evento_corporativo" />
                    <Label htmlFor="evento_corporativo">Evento Corporativo</Label>
                  </div>
                </RadioGroup>
                {form.formState.errors.tipoEvento && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.tipoEvento.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="descripcionActividad">Descripción detallada de la actividad *</Label>
                <Textarea
                  id="descripcionActividad"
                  {...form.register("descripcionActividad")}
                  placeholder="Proporcione una descripción completa y detallada del evento, incluyendo objetivos, programa de actividades, público objetivo, etc."
                  rows={6}
                />
                {form.formState.errors.descripcionActividad && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.descripcionActividad.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ubicación y Logística */}
        <Card>
          <CardHeader>
            <CardTitle>Ubicación y Logística Detallada</CardTitle>
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

              <div>
                <Label htmlFor="zonasRequeridas">Zona(s) específicas del bosque urbano *</Label>
                <Textarea
                  id="zonasRequeridas"
                  {...form.register("zonasRequeridas")}
                  placeholder="Especifique detalladamente las zonas del parque que utilizará, incluyendo rutas, áreas de montaje, ubicación de escenarios, etc."
                  rows={3}
                />
                {form.formState.errors.zonasRequeridas && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.zonasRequeridas.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="logisticaDetallada">Logística detallada del evento *</Label>
                <Textarea
                  id="logisticaDetallada"
                  {...form.register("logisticaDetallada")}
                  placeholder="Describa en detalle la logística del evento: cronograma, proveedores, personal involucrado, medidas de seguridad, control de multitudes, etc."
                  rows={5}
                />
                {form.formState.errors.logisticaDetallada && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.logisticaDetallada.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fechas y Horarios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Fechas y Horarios
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
                  Mínimo 2 meses de anticipación
                </p>
              </div>

              <div>
                <Label htmlFor="numeroAsistentes">Número de asistentes *</Label>
                <Input
                  id="numeroAsistentes"
                  type="number"
                  min="201"
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
                <Label htmlFor="fechaMontaje">Fecha de montaje</Label>
                <Input
                  id="fechaMontaje"
                  type="date"
                  {...form.register("fechaMontaje")}
                />
              </div>

              <div>
                <Label htmlFor="horaMontaje">Hora de montaje</Label>
                <Input
                  id="horaMontaje"
                  type="time"
                  {...form.register("horaMontaje")}
                />
              </div>

              <div>
                <Label htmlFor="fechaDesmontaje">Fecha de desmontaje</Label>
                <Input
                  id="fechaDesmontaje"
                  type="date"
                  {...form.register("fechaDesmontaje")}
                />
              </div>

              <div>
                <Label htmlFor="horaDesmontaje">Hora de desmontaje</Label>
                <Input
                  id="horaDesmontaje"
                  type="time"
                  {...form.register("horaDesmontaje")}
                />
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
          </CardContent>
        </Card>

        {/* Equipamiento y Materiales */}
        <Card>
          <CardHeader>
            <CardTitle>Equipamiento y Materiales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="equipamiento">Equipamiento detallado *</Label>
                <Textarea
                  id="equipamiento"
                  {...form.register("equipamiento")}
                  placeholder="Liste todo el equipamiento que ingresará: escenarios, sonido, iluminación, carpas, etc."
                  rows={4}
                />
                {form.formState.errors.equipamiento && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.equipamiento.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="materiales">Materiales adicionales</Label>
                <Textarea
                  id="materiales"
                  {...form.register("materiales")}
                  placeholder="Especifique materiales adicionales que utilizará"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="mobiliario">Mobiliario</Label>
                <Textarea
                  id="mobiliario"
                  {...form.register("mobiliario")}
                  placeholder="Mesas, sillas, tarimas, etc."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="tiposResiduos">Tipos de residuos generados</Label>
                <Textarea
                  id="tiposResiduos"
                  {...form.register("tiposResiduos")}
                  placeholder="Especifique los tipos de residuos que generará el evento y plan de manejo"
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Datos del Solicitante e Institución */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del Solicitante e Institución</CardTitle>
            <CardDescription>Todos los campos son obligatorios para eventos de alto impacto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombreSolicitante">Nombre completo del solicitante *</Label>
                <Input
                  id="nombreSolicitante"
                  {...form.register("nombreSolicitante")}
                  placeholder="Nombre completo"
                />
                {form.formState.errors.nombreSolicitante && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.nombreSolicitante.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="telefonoSolicitante">Teléfono del solicitante *</Label>
                <Input
                  id="telefonoSolicitante"
                  {...form.register("telefonoSolicitante")}
                  placeholder="Número de teléfono"
                />
                {form.formState.errors.telefonoSolicitante && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.telefonoSolicitante.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="emailSolicitante">Email del solicitante *</Label>
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

              <div>
                <Label htmlFor="nombreInstitucion">Nombre de la institución *</Label>
                <Input
                  id="nombreInstitucion"
                  {...form.register("nombreInstitucion")}
                  placeholder="Empresa u organización"
                />
                {form.formState.errors.nombreInstitucion && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.nombreInstitucion.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="domicilioCalle">Calle *</Label>
                <Input
                  id="domicilioCalle"
                  {...form.register("domicilioCalle")}
                  placeholder="Nombre de la calle"
                />
                {form.formState.errors.domicilioCalle && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.domicilioCalle.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="domicilioNumero">Número *</Label>
                <Input
                  id="domicilioNumero"
                  {...form.register("domicilioNumero")}
                  placeholder="Número exterior"
                />
                {form.formState.errors.domicilioNumero && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.domicilioNumero.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="domicilioColonia">Colonia *</Label>
                <Input
                  id="domicilioColonia"
                  {...form.register("domicilioColonia")}
                  placeholder="Colonia o barrio"
                />
                {form.formState.errors.domicilioColonia && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.domicilioColonia.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="domicilioCP">Código Postal *</Label>
                <Input
                  id="domicilioCP"
                  {...form.register("domicilioCP")}
                  placeholder="Código postal"
                />
                {form.formState.errors.domicilioCP && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.domicilioCP.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="telefonoInstitucion">Teléfono institucional *</Label>
                <Input
                  id="telefonoInstitucion"
                  {...form.register("telefonoInstitucion")}
                  placeholder="Teléfono de la institución"
                />
                {form.formState.errors.telefonoInstitucion && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.telefonoInstitucion.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="emailInstitucion">Email institucional *</Label>
                <Input
                  id="emailInstitucion"
                  type="email"
                  {...form.register("emailInstitucion")}
                  placeholder="contacto@institucion.com"
                />
                {form.formState.errors.emailInstitucion && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.emailInstitucion.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="municipio">Municipio *</Label>
                <Input
                  id="municipio"
                  {...form.register("municipio")}
                  placeholder="Municipio"
                />
                {form.formState.errors.municipio && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.municipio.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="rfc">RFC *</Label>
                <Input
                  id="rfc"
                  {...form.register("rfc")}
                  placeholder="RFC para facturación"
                />
                {form.formState.errors.rfc && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.rfc.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="razonSocial">Razón Social *</Label>
                <Input
                  id="razonSocial"
                  {...form.register("razonSocial")}
                  placeholder="Razón social para facturación"
                />
                {form.formState.errors.razonSocial && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.razonSocial.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Confirmaciones y Autorizaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confirmaAnticipacion"
                  checked={form.watch("confirmaAnticipacion")}
                  onCheckedChange={(checked) => form.setValue("confirmaAnticipacion", !!checked)}
                />
                <Label htmlFor="confirmaAnticipacion">
                  Confirmo que estoy solicitando este evento con al menos 2 meses de anticipación *
                </Label>
              </div>
              {form.formState.errors.confirmaAnticipacion && (
                <p className="text-sm text-red-600">{form.formState.errors.confirmaAnticipacion.message}</p>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="aceptaTerminos"
                  checked={form.watch("aceptaTerminos")}
                  onCheckedChange={(checked) => form.setValue("aceptaTerminos", !!checked)}
                />
                <Label htmlFor="aceptaTerminos">
                  Acepto los términos y condiciones para eventos de alto impacto, incluyendo el pago del 50% de anticipo y 10% de depósito en garantía *
                </Label>
              </div>
              {form.formState.errors.aceptaTerminos && (
                <p className="text-sm text-red-600">{form.formState.errors.aceptaTerminos.message}</p>
              )}

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
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-orange-700">Costo Total</p>
                    <p className="text-xl font-semibold text-orange-900">
                      ${costoCalculado.total.toFixed(2)} MXN
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-orange-700">Anticipo (50%)</p>
                    <p className="text-lg font-semibold text-orange-900">
                      ${costoCalculado.anticipo.toFixed(2)} MXN
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-orange-700">Depósito Garantía (10%)</p>
                    <p className="text-lg font-semibold text-orange-900">
                      ${costoCalculado.depositoGarantia.toFixed(2)} MXN
                    </p>
                  </div>
                </div>
                
                {costoCalculado.desglose && costoCalculado.desglose.length > 0 && (
                  <div className="text-sm text-orange-700">
                    <p className="font-medium mb-2">Desglose:</p>
                    {costoCalculado.desglose.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span>{item.concepto}</span>
                        <span>${item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 p-3 bg-orange-100 rounded border border-orange-200">
                  <div className="flex items-center gap-2 text-orange-800">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Nota importante:</span>
                  </div>
                  <p className="text-sm text-orange-700 mt-1">
                    Se requerirá reunión de logística con Protección Civil, Seguridad Pública y otras dependencias según el tipo de evento.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setLocation("/admin/eventos-ambu")}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={crearSolicitudMutation.isPending}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {crearSolicitudMutation.isPending ? "Enviando..." : "Enviar Solicitud"}
          </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}