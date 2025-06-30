import { db } from "./db";
import * as schema from "../shared/schema";
import { eq } from "drizzle-orm";

const newConcessionTypes = [
  {
    name: "Teatro y Espectáculos al Aire Libre",
    description: "Presentaciones teatrales, obras de títeres, cuentacuentos y espectáculos artísticos en espacios naturales del parque.",
    technicalRequirements: "Área mínima de 100m², acceso a electricidad, restricciones de horario (máximo hasta 20:00 hrs), capacidad para 50 personas.",
    legalRequirements: "Permisos municipales de espectáculos públicos, seguro de responsabilidad civil, equipos de sonido controlado.",
    operatingRules: "Horario máximo hasta 20:00 hrs, volumen controlado, limpieza del área posterior al evento.",
    impactLevel: "medio" as const,
    isActive: true
  },
  {
    name: "Deportes Acuáticos y Kayak",
    description: "Renta de kayaks, paddleboards, botes a pedales y clases de deportes acuáticos en lagos y lagunas del parque.",
    technicalRequirements: "Acceso directo a cuerpo de agua, bodega para equipo, área de vestidores, zona de seguridad demarcada.",
    legalRequirements: "Certificación en deportes acuáticos, personal con entrenamiento en primeros auxilios, chalecos salvavidas certificados.",
    operatingRules: "Supervisión permanente, uso obligatorio de chalecos salvavidas, horarios según condiciones climáticas.",
    impactLevel: "alto" as const,
    isActive: true
  },
  {
    name: "Organización de Eventos Familiares",
    description: "Planificación y coordinación de fiestas infantiles, reuniones familiares, baby showers y celebraciones sociales.",
    technicalRequirements: "Espacios techados disponibles, acceso a sanitarios, área de juegos cercana, capacidad variable según evento.",
    legalRequirements: "Seguro de eventos, personal capacitado en organización, proveedores autorizados de decoración.",
    operatingRules: "Reservación previa, límites de capacidad, limpieza posterior obligatoria, horarios establecidos.",
    impactLevel: "medio" as const,
    isActive: true
  },
  {
    name: "Food Truck Cocina Internacional",
    description: "Venta de comida internacional gourmet desde food truck móvil: tacos coreanos, hamburguesas artesanales, sushi rolls.",
    technicalRequirements: "Zona de estacionamiento para food truck, acceso a agua potable, contenedores de basura especializados.",
    legalRequirements: "Licencia sanitaria municipal, certificación de manejo de alimentos, food truck con todas las normas.",
    operatingRules: "Ubicación fija asignada, manejo adecuado de residuos, cumplimiento de normas sanitarias.",
    impactLevel: "bajo" as const,
    isActive: true
  },
  {
    name: "Taller de Arte y Pintura Ecológica",
    description: "Clases de pintura al aire libre, talleres de arte con materiales ecológicos y exposiciones de arte local.",
    technicalRequirements: "Área techada para materiales, mesas y sillas portátiles, acceso a agua para limpieza, buena iluminación natural.",
    legalRequirements: "Instructor certificado en artes plásticas, materiales no tóxicos, seguro de actividades educativas.",
    operatingRules: "Grupos máximo 15 personas, materiales ecológicos obligatorios, limpieza de área posterior.",
    impactLevel: "bajo" as const,
    isActive: true
  },
  {
    name: "Entrenamiento Funcional y Yoga",
    description: "Clases grupales de fitness al aire libre, yoga matutino, entrenamiento funcional y meditación en la naturaleza.",
    technicalRequirements: "Superficie plana de césped o pavimento, sombra natural o artificial, espacio mínimo 200m².",
    legalRequirements: "Instructores certificados, seguro de actividades deportivas, equipo de entrenamiento sanitizado.",
    operatingRules: "Horarios matutinos preferentes, grupos máximo 20 personas, equipo personal de participantes.",
    impactLevel: "bajo" as const,
    isActive: true
  },
  {
    name: "Sesiones Fotográficas Profesionales",
    description: "Servicios de fotografía profesional para bodas, quinceañeros, graduaciones y sesiones familiares en entornos naturales.",
    technicalRequirements: "Acceso a múltiples locaciones fotogénicas, permisos para uso de áreas especiales, horarios flexibles.",
    legalRequirements: "Fotógrafo profesional registrado, equipo profesional completo, seguro de equipos y responsabilidad.",
    operatingRules: "Reservación previa obligatoria, respeto a otros visitantes, no modificación de paisaje natural.",
    impactLevel: "bajo" as const,
    isActive: true
  },
  {
    name: "Bar de Jugos y Smoothies Naturales",
    description: "Preparación y venta de jugos frescos, smoothies verdes, aguas frescas naturales y bebidas energizantes saludables.",
    technicalRequirements: "Puesto fijo con refrigeración, acceso a electricidad 220V, área de preparación higiénica, contenedores de residuos orgánicos.",
    legalRequirements: "Licencia sanitaria, refrigeración adecuada, frutas y verduras frescas certificadas, personal capacitado.",
    operatingRules: "Preparación en tiempo real, ingredientes frescos diarios, compostaje de residuos orgánicos.",
    impactLevel: "bajo" as const,
    isActive: true
  },
  {
    name: "Escuela de Música al Aire Libre",
    description: "Clases individuales y grupales de guitarra, ukelele, percusión y canto en espacios naturales del parque.",
    technicalRequirements: "Área acústicamente aislada, asientos fijos o portátiles, protección contra clima, horarios controlados.",
    legalRequirements: "Instructores con formación musical, instrumentos en buen estado, permisos de ruido controlado.",
    operatingRules: "Volumen controlado, horarios diurnos únicamente, grupos máximo 10 personas.",
    impactLevel: "medio" as const,
    isActive: true
  },
  {
    name: "Juegos Tradicionales Mexicanos",
    description: "Organización de torneos de lotería, matarile-rile-rón, stop, vibora de la mar y otros juegos tradicionales mexicanos.",
    technicalRequirements: "Área amplia para grupos grandes, superficie segura, acceso a sombra, capacidad mínima 30 personas.",
    legalRequirements: "Coordinador con experiencia en recreación, materiales de juego tradicionales, seguro de actividades grupales.",
    operatingRules: "Actividades familiares, preservación de tradiciones mexicanas, inclusión de todas las edades.",
    impactLevel: "bajo" as const,
    isActive: true
  }
];

export async function seedConcessionTypes() {
  console.log("🏪 Iniciando creación de tipos de concesiones adicionales en el catálogo...");
  
  try {
    for (const concessionType of newConcessionTypes) {
      // Verificar si el tipo de concesión ya existe
      const existingConcessionType = await db.query.concessionTypes.findFirst({
        where: eq(schema.concessionTypes.name, concessionType.name)
      });

      if (existingConcessionType) {
        console.log(`⚠️ Tipo de concesión "${concessionType.name}" ya existe, saltando...`);
        continue;
      }

      // Crear el tipo de concesión
      const [newConcessionType] = await db.insert(schema.concessionTypes).values({
        name: concessionType.name,
        description: concessionType.description,
        technicalRequirements: concessionType.technicalRequirements,
        legalRequirements: concessionType.legalRequirements,
        operatingRules: concessionType.operatingRules,
        impactLevel: concessionType.impactLevel,
        isActive: concessionType.isActive,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      console.log(`✅ Tipo de concesión creado: ${newConcessionType.name}`);
    }

    console.log("🎉 ¡Tipos de concesiones adicionales creados exitosamente!");
    
    // Mostrar resumen
    const totalConcessionTypes = await db.query.concessionTypes.findMany({
      where: eq(schema.concessionTypes.isActive, true)
    });
    
    console.log(`📊 Total de tipos de concesiones activas en el catálogo: ${totalConcessionTypes.length}`);
    
    return true;
  } catch (error) {
    console.error("❌ Error al crear tipos de concesiones:", error);
    return false;
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedConcessionTypes().then(() => {
    console.log("✅ Proceso completado");
    process.exit(0);
  }).catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
}