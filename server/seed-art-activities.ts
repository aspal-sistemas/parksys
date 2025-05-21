import { db } from './db';
import { activities, activityCatalog } from '@shared/schema';

/**
 * Script para agregar actividades de Arte y Cultura al catálogo
 */
export async function addArtActivities() {
  try {
    console.log("Agregando actividades de Arte y Cultura al catálogo...");
    
    // Lista de actividades de Arte y Cultura
    const artActivities = [
      {
        title: "Exposiciones",
        description: "Exhibiciones artísticas temporales que muestran el trabajo de artistas locales e internacionales. Incluye exposiciones de pintura, fotografía, escultura y otras formas de expresión artística.",
        category: "artecultura",
        parkId: 1, // Este valor debe ser reemplazado por un ID de parque válido
        startDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Una semana en el futuro
        endDate: new Date(new Date().setDate(new Date().getDate() + 14)), // Dos semanas en el futuro
        location: "Área de exposiciones",
        capacity: 50,
        duration: 120, // 2 horas en minutos
        materials: "Obras de arte, material informativo, stands de exhibición",
        isRecurring: false
      },
      {
        title: "Actividades culturales",
        description: "Eventos diversos que celebran la cultura local y tradicional, incluyendo presentaciones de danza, poesía, narración oral y exposiciones de artesanía.",
        category: "artecultura",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        location: "Plaza central",
        capacity: 100,
        duration: 180, // 3 horas en minutos
        materials: "Escenario, sistema de sonido, sillas",
        isRecurring: true
      },
      {
        title: "Conciertos",
        description: "Presentaciones musicales en vivo con artistas y grupos locales, regionales o nacionales de diversos géneros musicales.",
        category: "artecultura",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 14)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 14)),
        location: "Anfiteatro",
        capacity: 200,
        duration: 120, // 2 horas en minutos
        materials: "Escenario, sistema de sonido, iluminación",
        isRecurring: false
      },
      {
        title: "Clases de pintura",
        description: "Cursos dirigidos a diferentes edades y niveles de experiencia donde se enseñan técnicas de pintura como óleo, acuarela, acrílico y más.",
        category: "artecultura",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 3)),
        endDate: null,
        location: "Sala de talleres",
        capacity: 15,
        duration: 90, // 1.5 horas en minutos
        materials: "Pinceles, lienzos, pinturas, caballetes",
        isRecurring: true
      },
      {
        title: "Clases de música",
        description: "Talleres y cursos para aprender a tocar instrumentos musicales o cantar, adaptados a diferentes niveles y edades.",
        category: "artecultura",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        endDate: null,
        location: "Aula musical",
        capacity: 12,
        duration: 60, // 1 hora en minutos
        materials: "Instrumentos musicales básicos, partituras",
        isRecurring: true
      },
      {
        title: "Taller de manualidades",
        description: "Sesiones prácticas donde se enseñan técnicas para crear objetos decorativos o funcionales con diversos materiales.",
        category: "artecultura",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 4)),
        endDate: null,
        location: "Sala multiusos",
        capacity: 20,
        duration: 120, // 2 horas en minutos
        materials: "Papel, cartón, tijeras, pegamento, materiales reciclados",
        isRecurring: true
      },
      {
        title: "Teatro",
        description: "Presentaciones teatrales que incluyen obras clásicas, contemporáneas o infantiles, realizadas por compañías locales o grupos comunitarios.",
        category: "artecultura",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 10)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 10)),
        location: "Auditorio",
        capacity: 80,
        duration: 90, // 1.5 horas en minutos
        materials: "Escenografía, vestuario, iluminación",
        isRecurring: false
      },
      {
        title: "Actividades educativas",
        description: "Programas que combinan entretenimiento con aprendizaje sobre arte, historia local, medio ambiente y otros temas relevantes.",
        category: "artecultura",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        endDate: null,
        location: "Centro educativo",
        capacity: 25,
        duration: 120, // 2 horas en minutos
        materials: "Material didáctico, proyector, pizarrón",
        isRecurring: true
      },
      {
        title: "Recorridos guiados",
        description: "Visitas acompañadas por guías especializados que explican aspectos históricos, culturales o ecológicos del parque o zona.",
        category: "artecultura",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        endDate: null,
        location: "Punto de encuentro central",
        capacity: 15,
        duration: 60, // 1 hora en minutos
        materials: "Mapas, material informativo",
        isRecurring: true
      },
      {
        title: "Taller de escultura",
        description: "Sesiones donde se enseñan técnicas para crear esculturas con diversos materiales como arcilla, madera, metal o materiales reciclados.",
        category: "artecultura",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 6)),
        endDate: null,
        location: "Taller de artes plásticas",
        capacity: 12,
        duration: 150, // 2.5 horas en minutos
        materials: "Arcilla, herramientas de modelado, madera, herramientas de tallado",
        isRecurring: true
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
    for (let i = 0; i < artActivities.length; i++) {
      const parkIndex = i % parks.length; // Distribuir las actividades entre los parques disponibles
      const parkId = parks[parkIndex].id;
      
      const activity = artActivities[i];
      activity.parkId = parkId;
      
      console.log(`Insertando actividad "${activity.title}" en el parque ID ${parkId}`);
      
      // Insertar en activities usando SQL directo para evitar problemas con el esquema
      await db.execute(
        `INSERT INTO activities 
        (park_id, title, description, start_date, end_date, category, location, capacity, created_at) 
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [
          activity.parkId, 
          activity.title, 
          activity.description, 
          activity.startDate, 
          activity.endDate, 
          activity.category, 
          activity.location, 
          activity.capacity
        ]
      );
    }
    
    console.log("Actividades de Arte y Cultura agregadas correctamente.");

  } catch (error) {
    console.error("Error al agregar actividades de Arte y Cultura:", error);
  }
}

// Ejecutar el script inmediatamente
addArtActivities()
  .then(() => {
    console.log("Proceso de carga de actividades completado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error en el proceso:", error);
    process.exit(1);
  });