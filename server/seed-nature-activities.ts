import { db } from './db';
import { activities } from '@shared/schema';

/**
 * Script para agregar actividades de Naturaleza, Ciencia y Conservación al catálogo
 */
export async function addNatureActivities() {
  try {
    console.log("Agregando actividades de Naturaleza, Ciencia y Conservación al catálogo...");
    
    // Lista de actividades de Naturaleza, Ciencia y Conservación
    const natureActivities = [
      {
        title: "Clases de jardinería y siembra",
        description: "Talleres prácticos donde los participantes aprenden técnicas de jardinería, cultivo de plantas y cuidado del suelo, con actividades prácticas de siembra.",
        category: "naturalezaciencia",
        parkId: 1, // Este valor será reemplazado por un ID de parque válido
        startDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        endDate: null,
        location: "Área de jardinería",
        capacity: 15,
        duration: 120, // 2 horas en minutos
        materials: "Tierra, semillas, macetas, herramientas de jardinería",
        isRecurring: true
      },
      {
        title: "Recorrido botánico",
        description: "Visitas guiadas por expertos que explican la diversidad de especies vegetales del parque, sus características, usos y la importancia de su conservación.",
        category: "naturalezaciencia",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 3)),
        endDate: null,
        location: "Punto de encuentro central",
        capacity: 20,
        duration: 90, // 1.5 horas en minutos
        materials: "Material informativo, guías de identificación de plantas",
        isRecurring: true
      },
      {
        title: "Venta de plantas",
        description: "Mercado de plantas ornamentales, medicinales y comestibles, donde también se ofrecen consejos sobre su cuidado y cultivo.",
        category: "naturalezaciencia",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 10)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 10)),
        location: "Área asignada para ventas",
        capacity: 200,
        duration: 300, // 5 horas en minutos
        materials: "Stands, mesas, plantas para venta",
        isRecurring: false
      },
      {
        title: "Clases de educación ambiental",
        description: "Sesiones educativas sobre temas ambientales como cambio climático, biodiversidad, conservación de recursos y prácticas sustentables.",
        category: "naturalezaciencia",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 4)),
        endDate: null,
        location: "Aula ambiental",
        capacity: 25,
        duration: 90, // 1.5 horas en minutos
        materials: "Material didáctico, presentaciones, actividades interactivas",
        isRecurring: true
      },
      {
        title: "Taller Huertos orgánicos",
        description: "Capacitación práctica para crear y mantener huertos urbanos y familiares usando técnicas orgánicas sin pesticidas ni fertilizantes químicos.",
        category: "naturalezaciencia",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        endDate: null,
        location: "Área de huertos demostrativos",
        capacity: 15,
        duration: 150, // 2.5 horas en minutos
        materials: "Semillas, herramientas, compost, camas de cultivo",
        isRecurring: true
      },
      {
        title: "Manualidades con materiales naturales",
        description: "Talleres creativos donde se enseña a elaborar objetos decorativos y funcionales utilizando materiales naturales como semillas, hojas, ramas y fibras.",
        category: "naturalezaciencia",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 6)),
        endDate: null,
        location: "Sala de talleres",
        capacity: 20,
        duration: 120, // 2 horas en minutos
        materials: "Materiales naturales, herramientas, pegamento ecológico",
        isRecurring: true
      },
      {
        title: "Cursos de reciclaje",
        description: "Formación sobre técnicas de reciclaje, reducción de residuos y reutilización creativa de materiales para promover el consumo responsable.",
        category: "naturalezaciencia",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 8)),
        endDate: null,
        location: "Centro de educación ambiental",
        capacity: 25,
        duration: 120, // 2 horas en minutos
        materials: "Materiales reciclables, herramientas, ejemplos de productos reciclados",
        isRecurring: true
      },
      {
        title: "Avistamiento de Aves",
        description: "Actividad guiada para observar e identificar aves locales y migratorias en su hábitat natural, con explicaciones sobre su comportamiento y conservación.",
        category: "naturalezaciencia",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        endDate: null,
        location: "Punto de encuentro para observación",
        capacity: 15,
        duration: 120, // 2 horas en minutos
        materials: "Binoculares, guías de identificación de aves",
        isRecurring: true
      },
      {
        title: "Pláticas sobre plantas ricas en vitaminas y para buena alimentación",
        description: "Conferencias y talleres sobre propiedades nutricionales de diversas plantas, su uso en la alimentación saludable y cómo incorporarlas en la dieta diaria.",
        category: "naturalezaciencia",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 9)),
        endDate: null,
        location: "Sala de conferencias",
        capacity: 30,
        duration: 90, // 1.5 horas en minutos
        materials: "Material educativo, muestras de plantas, recetarios",
        isRecurring: true
      },
      {
        title: "Reforestación",
        description: "Jornadas de plantación de árboles y vegetación nativa para recuperar espacios verdes, mejorar la calidad del aire y promover la biodiversidad local.",
        category: "naturalezaciencia",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 15)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 15)),
        location: "Áreas asignadas para reforestación",
        capacity: 50,
        duration: 180, // 3 horas en minutos
        materials: "Árboles jóvenes, herramientas de jardinería, guantes, agua",
        isRecurring: false
      }
    ];

    // Insertar actividades en la base de datos
    // Primero, obtener todos los parques para asignar IDs válidos
    const parksResult = await db.execute(
      `SELECT id, name FROM parks WHERE is_deleted = false ORDER BY id LIMIT 10`
    );
    
    const parks = parksResult.rows;
    
    if (parks.length === 0) {
      console.log("No se encontraron parques activos. Las actividades necesitan asignarse a parques existentes.");
      return;
    }
    
    // Insertar cada actividad asignándole un parque existente
    for (let i = 0; i < natureActivities.length; i++) {
      const parkIndex = i % parks.length; // Distribuir las actividades entre los parques disponibles
      const parkId = parks[parkIndex].id;
      
      const activity = natureActivities[i];
      activity.parkId = parkId;
      
      console.log(`Insertando actividad "${activity.title}" en el parque ID ${parkId}`);
      
      // Insertar en activities usando SQL directo para evitar problemas con el esquema
      await db.execute(
        `INSERT INTO activities 
        (park_id, title, description, start_date, end_date, category, location, created_at) 
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          activity.parkId, 
          activity.title, 
          activity.description, 
          activity.startDate, 
          activity.endDate, 
          activity.category, 
          activity.location
        ]
      );
    }
    
    console.log("Actividades de Naturaleza, Ciencia y Conservación agregadas correctamente.");

  } catch (error) {
    console.error("Error al agregar actividades de Naturaleza, Ciencia y Conservación:", error);
  }
}

// Ejecutar el script inmediatamente
addNatureActivities()
  .then(() => {
    console.log("Proceso de carga de actividades completado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error en el proceso:", error);
    process.exit(1);
  });