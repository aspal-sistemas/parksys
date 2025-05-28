import { db } from './db';
import { activities } from '@shared/schema';

/**
 * Script para agregar actividades de Eventos de Temporada al catálogo
 */
export async function addSeasonalActivities() {
  try {
    console.log("Agregando actividades de Eventos de Temporada al catálogo...");
    
    // Lista de actividades de Eventos de Temporada
    const seasonalActivities = [
      {
        title: "Festivales",
        description: "Celebraciones especiales que incluyen múltiples actividades como música en vivo, gastronomía, exhibiciones artísticas y entretenimiento familiar durante varios días.",
        category: "temporada",
        parkId: 1, // Este valor será reemplazado por un ID de parque válido
        startDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Un mes en el futuro
        endDate: new Date(new Date().setDate(new Date().getDate() + 32)), // Duración de 3 días
        location: "Todo el parque",
        capacity: 500,
        duration: 480, // 8 horas por día
        materials: "Escenarios, stands, equipo de sonido, iluminación",
        isRecurring: false
      },
      {
        title: "Eventos en días especiales",
        description: "Celebraciones de días festivos como Día de la Independencia, Día de Muertos, Navidad y Año Nuevo con actividades temáticas y decoraciones especiales.",
        category: "temporada",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 45)), // Mes y medio en el futuro
        endDate: new Date(new Date().setDate(new Date().getDate() + 45)),
        location: "Plaza central",
        capacity: 300,
        duration: 360, // 6 horas
        materials: "Decoración temática, equipo de sonido, escenario",
        isRecurring: false
      },
      {
        title: "Ferias (zapatos, libros, salud)",
        description: "Exposiciones temáticas donde se reúnen proveedores y servicios en un solo lugar, como ferias de zapatos, libros o de salud y bienestar.",
        category: "temporada",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 15)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 17)), // 3 días
        location: "Área de exposiciones",
        capacity: 150,
        duration: 420, // 7 horas por día
        materials: "Stands, mesas, sillas, equipo de sonido",
        isRecurring: false
      },
      {
        title: "Pláticas y charlas",
        description: "Conferencias y charlas educativas sobre temas como cultura, salud, historia y actualidad en fechas clave como octubre (cáncer), marzo (mujer), concientización sobre violencia y más.",
        category: "temporada",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 10)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 10)),
        location: "Auditorio",
        capacity: 80,
        duration: 120, // 2 horas
        materials: "Proyector, micrófono, sillas, material informativo",
        isRecurring: false
      },
      {
        title: "Tianguis",
        description: "Mercados temporales donde se reúnen vendedores locales de alimentos, artesanías, ropa y otros productos, promoviendo el comercio local.",
        category: "temporada",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        location: "Explanada",
        capacity: 200,
        duration: 360, // 6 horas
        materials: "Puestos, toldos, mesas",
        isRecurring: true
      },
      {
        title: "Espectáculos",
        description: "Eventos de entretenimiento como obras de teatro, conciertos, shows de comedia, magia, circo y otras presentaciones artísticas en fechas específicas.",
        category: "temporada",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 21)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 21)),
        location: "Anfiteatro",
        capacity: 120,
        duration: 120, // 2 horas
        materials: "Escenario, luces, sonido, vestuario",
        isRecurring: false
      },
      {
        title: "Feria para OSC recaudación de fondos",
        description: "Eventos organizados con Organizaciones de la Sociedad Civil (OSC) para recaudar fondos para causas sociales, con actividades, venta de productos y servicios.",
        category: "temporada",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 25)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 25)),
        location: "Plaza principal",
        capacity: 150,
        duration: 300, // 5 horas
        materials: "Stands, material promocional, urnas para donaciones",
        isRecurring: false
      },
      {
        title: "Hanal Pixán",
        description: "Celebración tradicional de la cultura maya para honrar a los difuntos, similar al Día de Muertos, con altares, comida típica y actividades culturales.",
        category: "temporada",
        parkId: 1,
        startDate: new Date(new Date(new Date().getFullYear(), 9, 30)), // 30 de octubre
        endDate: new Date(new Date(new Date().getFullYear(), 10, 2)), // 2 de noviembre
        location: "Área cultural",
        capacity: 200,
        duration: 360, // 6 horas diarias
        materials: "Altares, decoración tradicional, material para talleres",
        isRecurring: false
      },
      {
        title: "Mercado emprendedores",
        description: "Espacio dedicado a emprendedores locales para mostrar y vender sus productos innovadores, con asesorías, talleres y networking.",
        category: "temporada",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 14)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 14)),
        location: "Área de exposiciones",
        capacity: 100,
        duration: 360, // 6 horas
        materials: "Stands, material promocional, equipamiento para presentaciones",
        isRecurring: true
      },
      {
        title: "Eventos sociales",
        description: "Celebraciones comunitarias como aniversarios de colonias, reconocimientos ciudadanos, homenajes y otros eventos que fortalecen el tejido social.",
        category: "temporada",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 20)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 20)),
        location: "Plaza cívica",
        capacity: 150,
        duration: 180, // 3 horas
        materials: "Equipo de sonido, sillas, mesas, reconocimientos",
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
    for (let i = 0; i < seasonalActivities.length; i++) {
      const parkIndex = i % parks.length; // Distribuir las actividades entre los parques disponibles
      const parkId = parks[parkIndex].id;
      
      const activity = seasonalActivities[i];
      activity.parkId = parkId;
      
      console.log(`Insertando actividad "${activity.title}" en el parque ID ${parkId}`);
      
      // Insertar en activities usando SQL directo para evitar problemas con el esquema
      const query = `
        INSERT INTO activities 
        (park_id, title, description, start_date, end_date, category, location, created_at) 
        VALUES 
        ('${activity.parkId}', '${activity.title.replace(/'/g, "''")}', 
         '${activity.description.replace(/'/g, "''")}', 
         '${activity.startDate.toISOString()}', 
         ${activity.endDate ? `'${activity.endDate.toISOString()}'` : 'NULL'}, 
         '${activity.category}', 
         ${activity.location ? `'${activity.location.replace(/'/g, "''")}'` : 'NULL'}, 
         NOW())
      `;
      
      console.log(`Ejecutando consulta: ${query}`);
      await db.execute(query);
    }
    
    console.log("Actividades de Eventos de Temporada agregadas correctamente.");

  } catch (error) {
    console.error("Error al agregar actividades de Eventos de Temporada:", error);
  }
}

// Ejecutar el script inmediatamente
addSeasonalActivities()
  .then(() => {
    console.log("Proceso de carga de actividades completado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error en el proceso:", error);
    process.exit(1);
  });