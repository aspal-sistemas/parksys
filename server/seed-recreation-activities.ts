import { db } from './db';
import { activities } from '@shared/schema';

/**
 * Script para agregar actividades de Recreación y Bienestar al catálogo
 */
export async function addRecreationActivities() {
  try {
    console.log("Agregando actividades de Recreación y Bienestar al catálogo...");
    
    // Lista de actividades de Recreación y Bienestar
    const recreationActivities = [
      {
        title: "Clases de baile",
        description: "Aprende diferentes estilos de baile como Salsa, Jazz, Ballet, Folclore y Breakdance en un ambiente divertido y dinámico. Instructores profesionales para todos los niveles.",
        category: "recreacionbienestar",
        parkId: 1, // Este valor será reemplazado por un ID de parque válido
        startDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        endDate: null,
        location: "Área de danza",
        capacity: 20,
        duration: 60, // 1 hora en minutos
        materials: "Ropa cómoda, calzado adecuado, agua",
        isRecurring: true
      },
      {
        title: "Activación física",
        description: "Sesiones de ejercicio que incluyen rutinas de Zumba, CrossFit y Pilates para mantenerse en forma y mejorar la condición física general. Para todos los niveles.",
        category: "recreacionbienestar",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        endDate: null,
        location: "Área deportiva central",
        capacity: 25,
        duration: 45, // 45 minutos
        materials: "Tapete de yoga, ropa deportiva, agua",
        isRecurring: true
      },
      {
        title: "Actividades deportivas",
        description: "Participa en deportes organizados como fútbol, voleybol y caminatas en grupo. Ideal para hacer ejercicio mientras socializas y te diviertes.",
        category: "recreacionbienestar",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 3)),
        endDate: null,
        location: "Canchas deportivas",
        capacity: 30,
        duration: 90, // 1.5 horas en minutos
        materials: "Ropa deportiva, calzado adecuado, agua",
        isRecurring: true
      },
      {
        title: "Yoga",
        description: "Sesiones de yoga para todos los niveles que combinan posturas, respiración y meditación para mejorar la flexibilidad, fuerza y bienestar general.",
        category: "recreacionbienestar",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        endDate: null,
        location: "Área verde tranquila",
        capacity: 15,
        duration: 60, // 1 hora en minutos
        materials: "Tapete de yoga, ropa cómoda, agua",
        isRecurring: true
      },
      {
        title: "Actividades para todos",
        description: "Eventos inclusivos diseñados para que personas de todas las edades y capacidades puedan participar juntos en juegos cooperativos y actividades recreativas.",
        category: "recreacionbienestar",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        endDate: null,
        location: "Plaza central",
        capacity: 50,
        duration: 120, // 2 horas en minutos
        materials: "Según actividad",
        isRecurring: true
      },
      {
        title: "Actividades infantiles",
        description: "Juegos y actividades especialmente diseñados para niños que promueven el desarrollo físico, social y cognitivo mientras se divierten al aire libre.",
        category: "recreacionbienestar",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 4)),
        endDate: null,
        location: "Área infantil",
        capacity: 20,
        duration: 60, // 1 hora en minutos
        materials: "Material didáctico, juguetes",
        isRecurring: true
      },
      {
        title: "Picnic",
        description: "Espacios designados para disfrutar de comidas al aire libre con familiares y amigos, en un ambiente relajado y en contacto con la naturaleza.",
        category: "recreacionbienestar",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 6)),
        endDate: null,
        location: "Área de picnic",
        capacity: 40,
        duration: 180, // 3 horas en minutos
        materials: "Mesas, áreas sombreadas",
        isRecurring: true
      },
      {
        title: "Ciclismo",
        description: "Recorridos en bicicleta organizados para diferentes niveles, desde principiantes hasta avanzados, por rutas seguras dentro y alrededor del parque.",
        category: "recreacionbienestar",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 3)),
        endDate: null,
        location: "Punto de encuentro en entrada principal",
        capacity: 15,
        duration: 90, // 1.5 horas en minutos
        materials: "Bicicleta, casco, agua",
        isRecurring: true
      },
      {
        title: "Senderismo",
        description: "Caminatas guiadas por senderos naturales del parque, con diferentes niveles de dificultad y duración, para disfrutar del paisaje y la naturaleza.",
        category: "recreacionbienestar",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        endDate: null,
        location: "Inicio del sendero",
        capacity: 20,
        duration: 120, // 2 horas en minutos
        materials: "Calzado cómodo, agua, protector solar",
        isRecurring: true
      },
      {
        title: "Biciruta y renta de bicicletas/patines",
        description: "Servicio de alquiler de bicicletas y patines para recorrer las rutas señalizadas del parque. Incluye equipo de protección.",
        category: "recreacionbienestar",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        endDate: null,
        location: "Módulo de renta",
        capacity: 30,
        duration: 60, // 1 hora en minutos
        materials: "Bicicletas, patines, equipo de protección",
        isRecurring: true
      },
      {
        title: "Cine al aire libre",
        description: "Proyecciones de películas familiares en un ambiente al aire libre durante las noches. Se recomienda traer mantas o sillas plegables.",
        category: "recreacionbienestar",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 10)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 10)),
        location: "Área de proyección",
        capacity: 100,
        duration: 120, // 2 horas en minutos
        materials: "Pantalla, equipo de proyección, sillas",
        isRecurring: false
      },
      {
        title: "Eventos culturales",
        description: "Programación regular de eventos culturales como bailables, presentaciones musicales y otros espectáculos para el disfrute de los visitantes.",
        category: "recreacionbienestar",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        location: "Escenario central",
        capacity: 150,
        duration: 150, // 2.5 horas en minutos
        materials: "Escenario, sonido, iluminación",
        isRecurring: false
      },
      {
        title: "Lectura",
        description: "Espacios tranquilos designados para la lectura, con posibilidad de préstamo de libros y actividades relacionadas con la promoción de la lectura.",
        category: "recreacionbienestar",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        endDate: null,
        location: "Área de lectura",
        capacity: 25,
        duration: 120, // 2 horas en minutos
        materials: "Libros, sillas cómodas, mesas",
        isRecurring: true
      },
      {
        title: "Tai-chi",
        description: "Práctica de este arte marcial chino que combina movimientos lentos, respiración y concentración para mejorar el equilibrio, flexibilidad y salud general.",
        category: "recreacionbienestar",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        endDate: null,
        location: "Área verde tranquila",
        capacity: 15,
        duration: 60, // 1 hora en minutos
        materials: "Ropa cómoda",
        isRecurring: true
      },
      {
        title: "Actividades al aire libre",
        description: "Diversas actividades recreativas que aprovechan los espacios abiertos del parque, como juegos de equipo, actividades de orientación y más.",
        category: "recreacionbienestar",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 3)),
        endDate: null,
        location: "Áreas verdes",
        capacity: 30,
        duration: 90, // 1.5 horas en minutos
        materials: "Varios según actividad",
        isRecurring: true
      },
      {
        title: "Camping",
        description: "Experiencia de acampada organizada con todas las medidas de seguridad, ideal para familias que quieren disfrutar de la naturaleza por la noche.",
        category: "recreacionbienestar",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 14)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 15)),
        location: "Área de camping",
        capacity: 40,
        duration: 720, // 12 horas en minutos (overnight)
        materials: "Carpas, sacos de dormir (pueden ser propios o rentados)",
        isRecurring: false
      },
      {
        title: "Juegos de mesa",
        description: "Espacio con mesas y sillas donde los visitantes pueden jugar ajedrez, dominó, cartas y otros juegos de mesa disponibles para préstamo.",
        category: "recreacionbienestar",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        endDate: null,
        location: "Área de juegos de mesa",
        capacity: 30,
        duration: 120, // 2 horas en minutos
        materials: "Juegos de mesa variados, mesas, sillas",
        isRecurring: true
      },
      {
        title: "Ejercicio al aire libre",
        description: "Sesiones dirigidas que aprovechan el equipamiento de ejercicio del parque, con circuitos adaptados a diferentes niveles de condición física.",
        category: "recreacionbienestar",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        endDate: null,
        location: "Área de ejercicios",
        capacity: 15,
        duration: 45, // 45 minutos
        materials: "Equipamiento de ejercicio al aire libre",
        isRecurring: true
      },
      {
        title: "Meditación",
        description: "Sesiones guiadas de meditación para reducir el estrés, aumentar la consciencia y promover la calma mental en un entorno natural.",
        category: "recreacionbienestar",
        parkId: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() + 3)),
        endDate: null,
        location: "Zona tranquila",
        capacity: 15,
        duration: 45, // 45 minutos
        materials: "Tapetes o cojines para sentarse",
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
    for (let i = 0; i < recreationActivities.length; i++) {
      const parkIndex = i % parks.length; // Distribuir las actividades entre los parques disponibles
      const parkId = parks[parkIndex].id;
      
      const activity = recreationActivities[i];
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
    
    console.log("Actividades de Recreación y Bienestar agregadas correctamente.");

  } catch (error) {
    console.error("Error al agregar actividades de Recreación y Bienestar:", error);
  }
}

// Ejecutar el script inmediatamente
addRecreationActivities()
  .then(() => {
    console.log("Proceso de carga de actividades completado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error en el proceso:", error);
    process.exit(1);
  });