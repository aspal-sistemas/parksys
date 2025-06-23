import { pgTable, serial, varchar, text, integer, decimal, boolean, date, timestamp, time, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums específicos para el sistema AMBU
export const eventImpactTypeEnum = pgEnum("event_impact_type", ["bajo_impacto", "alto_impacto"]);
export const eventCategoryEnum = pgEnum("event_category", [
  // Bajo impacto
  "evento_familiar",
  "sesion_fotografia",
  "convivencia_escolar", 
  "sendero_interpretativo",
  "recorrido_educativo",
  // Alto impacto
  "evento_masivo",
  "evento_comercial",
  "evento_cooperativo",
  "carrera_deportiva",
  "actividad_fisica_grupal",
  "evento_corporativo"
]);

export const eventStatusEnum = pgEnum("event_status", [
  "borrador",
  "solicitado", 
  "en_revision",
  "aprobado",
  "rechazado",
  "cancelado",
  "realizado"
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pendiente",
  "anticipo_pagado", 
  "pagado_completo",
  "reembolsado"
]);

export const documentStatusEnum = pgEnum("document_status", [
  "pendiente",
  "recibido",
  "validado",
  "rechazado"
]);

// Tabla principal de eventos AMBU
export const eventosAmbu = pgTable("eventos_ambu", {
  id: serial("id").primaryKey(),
  
  // Información básica
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descripcion: text("descripcion"),
  impactoTipo: eventImpactTypeEnum("impacto_tipo").notNull(),
  categoria: eventCategoryEnum("categoria").notNull(),
  
  // Fechas y horarios
  fechaEvento: date("fecha_evento").notNull(),
  horaInicio: time("hora_inicio"),
  horaFin: time("hora_fin"),
  fechaMontaje: date("fecha_montaje"),
  horaMontaje: time("hora_montaje"),
  fechaDesmontaje: date("fecha_desmontaje"), 
  horaDesmontaje: time("hora_desmontaje"),
  
  // Ubicación específica
  parqueId: integer("parque_id").notNull(),
  zonasRequeridas: text("zonas_requeridas"), // Zona(s) específica del parque
  
  // Participantes
  numeroAsistentes: integer("numero_asistentes").notNull(),
  numeroMenores: integer("numero_menores"),
  numeroAdultos: integer("numero_adultos"),
  
  // Equipamiento y materiales
  equipamiento: text("equipamiento"),
  materiales: text("materiales"),
  mobiliario: text("mobiliario"),
  tiposResiduos: text("tipos_residuos"),
  
  // Logística (para alto impacto)
  logisticaDetallada: text("logistica_detallada"),
  sembrado: text("sembrado"),
  minutoAMinuto: text("minuto_a_minuto"),
  
  // Estado y seguimiento
  status: eventStatusEnum("status").default("borrador"),
  requiereFotografiaAutorizada: boolean("requiere_fotografia_autorizada").default(false),
  
  // Costos calculados
  costoTotal: decimal("costo_total", { precision: 10, scale: 2 }),
  anticipo: decimal("anticipo", { precision: 10, scale: 2 }),
  depositoGarantia: decimal("deposito_garantia", { precision: 10, scale: 2 }),
  statusPago: paymentStatusEnum("status_pago").default("pendiente"),
  
  // Metadatos
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  fechaLimiteAnticipacion: date("fecha_limite_anticipacion") // 10 días o 2 meses según tipo
});

// Datos del solicitante
export const solicitudEvento = pgTable("solicitud_evento", {
  id: serial("id").primaryKey(),
  eventoId: integer("evento_id").notNull().references(() => eventosAmbu.id, { onDelete: "cascade" }),
  
  // Datos personales del solicitante
  nombreSolicitante: varchar("nombre_solicitante", { length: 255 }).notNull(),
  telefonoSolicitante: varchar("telefono_solicitante", { length: 20 }),
  emailSolicitante: varchar("email_solicitante", { length: 255 }),
  
  // Datos de la institución/empresa
  nombreInstitucion: varchar("nombre_institucion", { length: 255 }),
  domicilioCalle: varchar("domicilio_calle", { length: 255 }),
  domicilioNumero: varchar("domicilio_numero", { length: 20 }),
  domicilioInterior: varchar("domicilio_interior", { length: 20 }),
  domicilioColonia: varchar("domicilio_colonia", { length: 100 }),
  domicilioCP: varchar("domicilio_cp", { length: 10 }),
  telefonoInstitucion: varchar("telefono_institucion", { length: 20 }),
  emailInstitucion: varchar("email_institucion", { length: 255 }),
  municipio: varchar("municipio", { length: 100 }),
  
  // Facturación
  requiereFactura: boolean("requiere_factura").default(false),
  rfc: varchar("rfc", { length: 13 }),
  razonSocial: varchar("razon_social", { length: 255 }),
  
  // Evento altruista
  esEventoAltruista: boolean("es_evento_altruista").default(false),
  causaSocial: text("causa_social"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Documentos requeridos para la solicitud
export const documentosEvento = pgTable("documentos_evento", {
  id: serial("id").primaryKey(),
  eventoId: integer("evento_id").notNull().references(() => eventosAmbu.id, { onDelete: "cascade" }),
  
  tipoDocumento: varchar("tipo_documento", { length: 100 }).notNull(), // "acta_constitutiva", "constancia_fiscal", etc.
  nombreArchivo: varchar("nombre_archivo", { length: 255 }),
  rutaArchivo: varchar("ruta_archivo", { length: 500 }),
  status: documentStatusEnum("status").default("pendiente"),
  observaciones: text("observaciones"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Costos específicos por concepto (según tabulador)
export const costosEvento = pgTable("costos_evento", {
  id: serial("id").primaryKey(),
  eventoId: integer("evento_id").notNull().references(() => eventosAmbu.id, { onDelete: "cascade" }),
  
  concepto: varchar("concepto", { length: 200 }).notNull(), // "Fotografía social", "Carrera comercial", etc.
  descripcion: text("descripcion"),
  cantidad: integer("cantidad").default(1),
  precioUnitario: decimal("precio_unitario", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  
  // Referencia al tabulador
  referenciaTabulator: varchar("referencia_tabulator", { length: 50 }), // "F-DIC-22-4", "F-DIC-23-9", etc.
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Seguimiento y aprobaciones
export const seguimientoEvento = pgTable("seguimiento_evento", {
  id: serial("id").primaryKey(),
  eventoId: integer("evento_id").notNull().references(() => eventosAmbu.id, { onDelete: "cascade" }),
  
  usuarioId: integer("usuario_id"), // ID del usuario que realiza la acción
  accion: varchar("accion", { length: 100 }).notNull(), // "solicitud_creada", "documentos_recibidos", "aprobado", etc.
  observaciones: text("observaciones"),
  fechaAccion: timestamp("fecha_accion").defaultNow(),
  
  // Datos del responsable
  responsable: varchar("responsable", { length: 255 }),
  
  createdAt: timestamp("created_at").defaultNow()
});

// Reuniones de logística (para eventos de alto impacto)
export const reunionesLogistica = pgTable("reuniones_logistica", {
  id: serial("id").primaryKey(),
  eventoId: integer("evento_id").notNull().references(() => eventosAmbu.id, { onDelete: "cascade" }),
  
  fechaReunion: date("fecha_reunion").notNull(),
  horaReunion: time("hora_reunion"),
  participantes: text("participantes"), // JSON con lista de participantes
  dependenciasInvolucradas: text("dependencias_involucradas"), // Protección Civil, Seguridad, etc.
  
  agenda: text("agenda"),
  acuerdos: text("acuerdos"),
  siguientesPasos: text("siguientes_pasos"),
  
  responsableReunion: varchar("responsable_reunion", { length: 255 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Esquemas de validación con Zod
export const insertEventoAmbuSchema = createInsertSchema(eventosAmbu);
export const insertSolicitudEventoSchema = createInsertSchema(solicitudEvento);
export const insertDocumentoEventoSchema = createInsertSchema(documentosEvento);
export const insertCostoEventoSchema = createInsertSchema(costosEvento);
export const insertSeguimientoEventoSchema = createInsertSchema(seguimientoEvento);
export const insertReunionLogisticaSchema = createInsertSchema(reunionesLogistica);

// Tipos TypeScript
export type EventoAmbu = typeof eventosAmbu.$inferSelect;
export type InsertEventoAmbu = z.infer<typeof insertEventoAmbuSchema>;
export type SolicitudEvento = typeof solicitudEvento.$inferSelect;
export type InsertSolicitudEvento = z.infer<typeof insertSolicitudEventoSchema>;
export type DocumentoEvento = typeof documentosEvento.$inferSelect;
export type InsertDocumentoEvento = z.infer<typeof insertDocumentoEventoSchema>;
export type CostoEvento = typeof costosEvento.$inferSelect;
export type InsertCostoEvento = z.infer<typeof insertCostoEventoSchema>;
export type SeguimientoEvento = typeof seguimientoEvento.$inferSelect;
export type InsertSeguimientoEvento = z.infer<typeof insertSeguimientoEventoSchema>;
export type ReunionLogistica = typeof reunionesLogistica.$inferSelect;
export type InsertReunionLogistica = z.infer<typeof insertReunionLogisticaSchema>;

// Configuración del tabulador de costos (datos estáticos)
export const tabuladorCostos = {
  fotografiaSocial: 220,
  fotografiaJardinJapones: 850,
  fotografiaRedesSociales: 1000, // por hora
  fotografiaComercial: {
    produccion1a15: 10000,
    produccion15a50: 25000, // por día
    produccionMas50: 50000 // por día
  },
  carrerasComerciales: {
    porParticipante: 90,
    permisoRuta: 1000,
    presenciaMarca: 1500
  },
  carrerasCausa: {
    porParticipante: 45,
    permisoRuta: 1000,
    presenciaMarca: 1500
  },
  entregaPaquetes: 3000, // por día
  montajeDesmontaje: 1500, // por día
  actividadesFisicas: 1000, // por mes
  entrenamientoProfesional: 3000, // por mes
  canchasQuintanar: {
    inscripcion: 800,
    usoCancha: 500
  },
  canchasDomo: {
    lunesJueves: 200,
    viernesDomingo: 400
  },
  canchaLiberacion: 800
};