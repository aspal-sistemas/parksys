import { pool } from './db.js';

/**
 * Script para crear 20 actividades diversas y atractivas
 * distribuidas entre las 6 categorías y 10 parques
 */

const activitiesData = [
  // DEPORTIVO (ID: 1)
  {
    title: 'Torneo de Fútbol 7 "Copa Parques"',
    description: 'Participa en nuestro torneo de fútbol 7 inter-barrios. Categorías juvenil y adultos. Incluye arbitraje profesional, trofeos y refrigerio para todos los participantes.',
    categoryId: 1,
    parkId: 5, // Bosque Los Colomos
    location: 'Cancha de fútbol principal',
    startDate: '2025-07-15',
    endDate: '2025-07-15',
    startTime: '08:00',
    endTime: '18:00',
    duration: 600,
    capacity: 140,
    price: 250,
    isFree: false,
    isRecurring: false,
    targetMarket: ['Jóvenes', 'Adultos', 'Deportistas'],
    specialNeeds: ['Zapatos de fútbol', 'Ropa deportiva', 'Botella de agua'],
    materials: 'Balones, porterías, conos, botiquín',
    requirements: 'Edad mínima 15 años, certificado médico',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
  },
  {
    title: 'Clases de Aqua Aeróbicos',
    description: 'Ejercítate de forma divertida en el agua. Clases grupales de aqua aeróbicos para todas las edades y niveles de condición física.',
    categoryId: 1,
    parkId: 19, // Parque Agua Azul
    location: 'Alberca principal',
    startDate: '2025-07-05',
    endDate: '2025-07-26',
    startTime: '07:00',
    endTime: '08:00',
    duration: 60,
    capacity: 25,
    price: 0,
    isFree: true,
    isRecurring: true,
    recurringDays: ['Lunes', 'Miércoles', 'Viernes'],
    targetMarket: ['Adultos mayores', 'Adultos', 'Familias'],
    specialNeeds: ['Traje de baño', 'Toalla', 'Gorra de natación'],
    materials: 'Pesas acuáticas, flotadores, música',
    requirements: 'Saber nadar básico',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
  },
  {
    title: 'Maratón Ciclista "Rutas Verdes"',
    description: 'Recorre 30 km por las rutas más hermosas de la ciudad. Incluye hidratación, asistencia mecánica y medalla de participación.',
    categoryId: 1,
    parkId: 18, // Bosque Urbano Tlaquepaque
    location: 'Explanada principal',
    startDate: '2025-07-20',
    endDate: '2025-07-20',
    startTime: '06:00',
    endTime: '12:00',
    duration: 360,
    capacity: 200,
    price: 150,
    isFree: false,
    isRecurring: false,
    targetMarket: ['Jóvenes', 'Adultos', 'Ciclistas'],
    specialNeeds: ['Bicicleta en buen estado', 'Casco obligatorio', 'Ropa deportiva'],
    materials: 'Hidratación, asistencia mecánica, botiquín',
    requirements: 'Edad mínima 16 años, bicicleta propia',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
  },

  // RECREACIÓN Y BIENESTAR (ID: 2)
  {
    title: 'Sesiones de Yoga al Amanecer',
    description: 'Encuentra tu paz interior con clases de yoga matutinas rodeado de naturaleza. Incluye meditación y ejercicios de respiración.',
    categoryId: 2,
    parkId: 5, // Bosque Los Colomos
    location: 'Jardín de meditación',
    startDate: '2025-07-01',
    endDate: '2025-07-31',
    startTime: '06:30',
    endTime: '07:30',
    duration: 60,
    capacity: 30,
    price: 0,
    isFree: true,
    isRecurring: true,
    recurringDays: ['Martes', 'Jueves', 'Sábado'],
    targetMarket: ['Adultos', 'Adultos mayores', 'Principiantes'],
    specialNeeds: ['Mat de yoga', 'Ropa cómoda', 'Botella de agua'],
    materials: 'Mats disponibles, música relajante',
    requirements: 'Ninguno, apto para principiantes',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
  },
  {
    title: 'Taller de Mindfulness para Familias',
    description: 'Aprende técnicas de mindfulness en familia. Actividades diseñadas para conectar padres e hijos a través de la atención plena.',
    categoryId: 2,
    parkId: 4, // Parque Alcalde
    location: 'Área de talleres',
    startDate: '2025-07-12',
    endDate: '2025-07-12',
    startTime: '10:00',
    endTime: '12:00',
    duration: 120,
    capacity: 20,
    price: 180,
    isFree: false,
    isRecurring: false,
    targetMarket: ['Familias', 'Niños', 'Padres'],
    specialNeeds: ['Ropa cómoda', 'Cojines o mantas'],
    materials: 'Cojines, música, material didáctico',
    requirements: 'Niños de 6 años en adelante',
    imageUrl: 'https://images.unsplash.com/photo-1545389336-cf090694435e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
  },
  {
    title: 'Círculo de Lectura "Historias al Aire Libre"',
    description: 'Disfruta de la lectura comunitaria en un ambiente natural. Cada semana un libro diferente con discusiones grupales.',
    categoryId: 2,
    parkId: 15, // Parque General Luis Quintanar
    location: 'Área de lectura bajo los árboles',
    startDate: '2025-07-06',
    endDate: '2025-07-27',
    startTime: '17:00',
    endTime: '18:30',
    duration: 90,
    capacity: 15,
    price: 0,
    isFree: true,
    isRecurring: true,
    recurringDays: ['Domingo'],
    targetMarket: ['Adultos', 'Jóvenes', 'Amantes de la lectura'],
    specialNeeds: ['Libro (se proporciona)', 'Libreta de notas'],
    materials: 'Libros, cojines, bebidas calientes',
    requirements: 'Saber leer, interés en literatura',
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
  },

  // ARTE Y CULTURA (ID: 3)
  {
    title: 'Festival de Música Acústica',
    description: 'Disfruta de una tarde de música acústica con artistas locales. Géneros variados desde folk hasta jazz en un ambiente íntimo.',
    categoryId: 3,
    parkId: 7, // Parque González Gallo
    location: 'Anfiteatro natural',
    startDate: '2025-07-19',
    endDate: '2025-07-19',
    startTime: '16:00',
    endTime: '21:00',
    duration: 300,
    capacity: 150,
    price: 80,
    isFree: false,
    isRecurring: false,
    targetMarket: ['Jóvenes', 'Adultos', 'Amantes de la música'],
    specialNeeds: ['Silla plegable opcional'],
    materials: 'Escenario, sonido, iluminación',
    requirements: 'Ninguno',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
  },
  {
    title: 'Taller de Pintura en Plein Air',
    description: 'Aprende técnicas de pintura al aire libre capturando la belleza natural del parque. Material incluido para principiantes.',
    categoryId: 3,
    parkId: 2, // Parque Red
    location: 'Jardín botánico',
    startDate: '2025-07-13',
    endDate: '2025-07-13',
    startTime: '09:00',
    endTime: '13:00',
    duration: 240,
    capacity: 12,
    price: 320,
    isFree: false,
    isRecurring: false,
    targetMarket: ['Adultos', 'Artistas', 'Principiantes'],
    specialNeeds: ['Ropa que se pueda manchar', 'Sombrero'],
    materials: 'Lienzos, pinturas, pinceles, caballetes',
    requirements: 'Ninguno, incluye materiales',
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
  },
  {
    title: 'Espectáculo de Danza Folklórica Mexicana',
    description: 'Presentación del Ballet Folklórico con danzas tradicionales de diferentes estados de México. Una celebración de nuestra cultura.',
    categoryId: 3,
    parkId: 6, // Parque Revolución
    location: 'Plaza central',
    startDate: '2025-07-16',
    endDate: '2025-07-16',
    startTime: '19:00',
    endTime: '21:00',
    duration: 120,
    capacity: 300,
    price: 0,
    isFree: true,
    isRecurring: false,
    targetMarket: ['Familias', 'Adultos', 'Niños'],
    specialNeeds: ['Asientos limitados, llegar temprano'],
    materials: 'Escenario, sonido, vestuarios',
    requirements: 'Ninguno',
    imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
  },
  {
    title: 'Taller de Artesanías con Materiales Reciclados',
    description: 'Crea hermosas artesanías utilizando materiales reciclados. Aprende técnicas de upcycling mientras cuidas el medio ambiente.',
    categoryId: 3,
    parkId: 20, // Parque Montenegro
    location: 'Aula de manualidades',
    startDate: '2025-07-09',
    endDate: '2025-07-23',
    startTime: '15:00',
    endTime: '17:00',
    duration: 120,
    capacity: 18,
    price: 150,
    isFree: false,
    isRecurring: true,
    recurringDays: ['Martes'],
    targetMarket: ['Niños', 'Jóvenes', 'Familias'],
    specialNeeds: ['Delantal', 'Materiales reciclados de casa'],
    materials: 'Herramientas, pegamentos, pinturas',
    requirements: 'Edad mínima 8 años',
    imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
  },

  // NATURALEZA Y CIENCIA (ID: 4)
  {
    title: 'Observación de Aves y Fotografía',
    description: 'Descubre la riqueza ornitológica del parque. Incluye guía especializado, binoculares y taller básico de fotografía de aves.',
    categoryId: 4,
    parkId: 5, // Bosque Los Colomos
    location: 'Senderos naturales',
    startDate: '2025-07-07',
    endDate: '2025-07-07',
    startTime: '06:00',
    endTime: '09:00',
    duration: 180,
    capacity: 20,
    price: 0,
    isFree: true,
    isRecurring: false,
    targetMarket: ['Adultos', 'Fotógrafos', 'Naturalistas'],
    specialNeeds: ['Cámara fotográfica', 'Ropa de colores naturales'],
    materials: 'Binoculares, guías de campo, libreta',
    requirements: 'Interés en la naturaleza',
    imageUrl: 'https://images.unsplash.com/photo-1444927714506-8492d94b5ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
  },
  {
    title: 'Taller de Huerto Urbano para Niños',
    description: 'Los pequeños aprenden sobre agricultura urbana plantando sus propias semillas. Se llevan su maceta a casa.',
    categoryId: 4,
    parkId: 18, // Bosque Urbano Tlaquepaque
    location: 'Área de huertos demostrativos',
    startDate: '2025-07-10',
    endDate: '2025-07-10',
    startTime: '10:00',
    endTime: '12:00',
    duration: 120,
    capacity: 25,
    price: 120,
    isFree: false,
    isRecurring: false,
    targetMarket: ['Niños', 'Familias', 'Estudiantes'],
    specialNeeds: ['Ropa que se pueda ensuciar', 'Gorra'],
    materials: 'Semillas, macetas, tierra, herramientas',
    requirements: 'Edad de 5 a 12 años',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
  },
  {
    title: 'Conferencia sobre Cambio Climático',
    description: 'Charla magistral con expertos sobre el impacto del cambio climático en nuestra región y acciones que podemos tomar.',
    categoryId: 4,
    parkId: 4, // Parque Alcalde
    location: 'Auditorio al aire libre',
    startDate: '2025-07-14',
    endDate: '2025-07-14',
    startTime: '18:00',
    endTime: '20:00',
    duration: 120,
    capacity: 100,
    price: 0,
    isFree: true,
    isRecurring: false,
    targetMarket: ['Adultos', 'Estudiantes', 'Académicos'],
    specialNeeds: ['Libreta para apuntes'],
    materials: 'Proyector, micrófono, material informativo',
    requirements: 'Ninguno',
    imageUrl: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
  },

  // COMUNIDAD (ID: 5)
  {
    title: 'Jornada de Limpieza Comunitaria "Parque Limpio"',
    description: 'Únete a la comunidad para mantener nuestro parque limpio. Incluye desayuno, herramientas y reconocimiento a voluntarios.',
    categoryId: 5,
    parkId: 19, // Parque Agua Azul
    location: 'Todo el parque',
    startDate: '2025-07-06',
    endDate: '2025-07-06',
    startTime: '07:00',
    endTime: '11:00',
    duration: 240,
    capacity: 80,
    price: 0,
    isFree: true,
    isRecurring: false,
    targetMarket: ['Familias', 'Voluntarios', 'Vecinos'],
    specialNeeds: ['Ropa cómoda', 'Guantes de trabajo'],
    materials: 'Herramientas, bolsas, desayuno',
    requirements: 'Ninguno, todas las edades',
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
  },
  {
    title: 'Intercambio de Libros "Libros Libres"',
    description: 'Trae un libro y llévate otro. Evento mensual para fomentar la lectura y crear conexiones en la comunidad.',
    categoryId: 5,
    parkId: 15, // Parque General Luis Quintanar
    location: 'Kiosco central',
    startDate: '2025-07-21',
    endDate: '2025-07-21',
    startTime: '10:00',
    endTime: '14:00',
    duration: 240,
    capacity: 50,
    price: 0,
    isFree: true,
    isRecurring: true,
    recurringDays: ['Último domingo del mes'],
    targetMarket: ['Familias', 'Lectores', 'Estudiantes'],
    specialNeeds: ['Al menos un libro para intercambiar'],
    materials: 'Mesas, registro, café',
    requirements: 'Traer libro en buen estado',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
  },
  {
    title: 'Mercadito de Productores Locales',
    description: 'Apoya a los productores locales comprando productos orgánicos, artesanías y comida casera. Cada sábado del mes.',
    categoryId: 5,
    parkId: 7, // Parque González Gallo
    location: 'Plaza principal',
    startDate: '2025-07-05',
    endDate: '2025-07-26',
    startTime: '08:00',
    endTime: '14:00',
    duration: 360,
    capacity: 200,
    price: 0,
    isFree: true,
    isRecurring: true,
    recurringDays: ['Sábado'],
    targetMarket: ['Familias', 'Compradores conscientes', 'Vecinos'],
    specialNeeds: ['Bolsas reutilizables'],
    materials: 'Stands, mobiliario, música ambiental',
    requirements: 'Ninguno',
    imageUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
  },

  // EVENTOS DE TEMPORADA (ID: 6)
  {
    title: 'Festival de Verano "Noches de Estrellas"',
    description: 'Celebra el verano con música en vivo, food trucks, actividades para niños y observación astronómica con telescopios.',
    categoryId: 6,
    parkId: 17, // Parque de la Liberación
    location: 'Explanada principal',
    startDate: '2025-07-25',
    endDate: '2025-07-27',
    startTime: '17:00',
    endTime: '23:00',
    duration: 360,
    capacity: 500,
    price: 50,
    isFree: false,
    isRecurring: false,
    targetMarket: ['Familias', 'Jóvenes', 'Turistas'],
    specialNeeds: ['Sillas plegables opcionales'],
    materials: 'Escenarios, food trucks, telescopios',
    requirements: 'Ninguno',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
  },
  {
    title: 'Celebración del Día del Niño',
    description: 'Actividades especiales para los pequeños: juegos tradicionales, payasos, talleres creativos y regalos sorpresa.',
    categoryId: 6,
    parkId: 2, // Parque Red
    location: 'Área de juegos infantiles',
    startDate: '2025-07-30',
    endDate: '2025-07-30',
    startTime: '10:00',
    endTime: '16:00',
    duration: 360,
    capacity: 150,
    price: 0,
    isFree: true,
    isRecurring: false,
    targetMarket: ['Niños', 'Familias', 'Padres'],
    specialNeeds: ['Ropa cómoda para jugar'],
    materials: 'Juegos, globos, regalos, animadores',
    requirements: 'Menores de 12 años',
    imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
  },
  {
    title: 'Noche de Cine al Aire Libre "Clásicos del Verano"',
    description: 'Disfruta de películas clásicas bajo las estrellas. Proyección en pantalla gigante con sonido profesional.',
    categoryId: 6,
    parkId: 6, // Parque Revolución
    location: 'Explanada central',
    startDate: '2025-07-18',
    endDate: '2025-07-18',
    startTime: '20:00',
    endTime: '23:00',
    duration: 180,
    capacity: 200,
    price: 30,
    isFree: false,
    isRecurring: false,
    targetMarket: ['Familias', 'Parejas', 'Cinéfilos'],
    specialNeeds: ['Manta o silla plegable', 'Repelente de mosquitos'],
    materials: 'Pantalla gigante, proyector, sonido',
    requirements: 'Película apta para toda la familia',
    imageUrl: 'https://images.unsplash.com/photo-1489599608070-7edb73d05e0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
  }
];

export async function createDiverseActivities() {
  console.log('🎯 Iniciando creación de 20 actividades diversas...');
  
  let createdCount = 0;
  
  for (const activity of activitiesData) {
    try {
      // Convertir arrays a JSON si es necesario
      const targetMarketJson = activity.targetMarket ? JSON.stringify(activity.targetMarket) : null;
      const specialNeedsJson = activity.specialNeeds ? JSON.stringify(activity.specialNeeds) : null;
      const recurringDaysArray = activity.recurringDays || null;

      const result = await pool.query(`
        INSERT INTO activities (
          title, description, category_id, park_id, location, 
          start_date, end_date, start_time, end_time, duration,
          capacity, price, is_free, is_recurring, recurring_days,
          target_market, special_needs, materials, requirements
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING id
      `, [
        activity.title,
        activity.description,
        activity.categoryId,
        activity.parkId,
        activity.location,
        activity.startDate,
        activity.endDate,
        activity.startTime,
        activity.endTime,
        activity.duration,
        activity.capacity,
        activity.price,
        activity.isFree,
        activity.isRecurring,
        recurringDaysArray,
        targetMarketJson,
        specialNeedsJson,
        activity.materials,
        activity.requirements
      ]);

      const activityId = result.rows[0].id;
      
      // Agregar imagen a la actividad
      const imageFileName = `activity-${activityId}-primary.jpg`;
      await pool.query(`
        INSERT INTO activity_images (activity_id, image_url, file_name, mime_type, is_primary, caption)
        VALUES ($1, $2, $3, $4, true, $5)
      `, [
        activityId,
        activity.imageUrl,
        imageFileName,
        'image/jpeg',
        `Imagen principal de ${activity.title}`
      ]);

      createdCount++;
      console.log(`✅ Actividad creada: "${activity.title}" (ID: ${activityId})`);
      
    } catch (error) {
      console.error(`❌ Error creando actividad "${activity.title}":`, error);
    }
  }
  
  console.log(`🎉 Proceso completado. ${createdCount}/20 actividades creadas exitosamente.`);
  
  // Mostrar resumen por categoría
  const categoryStats = await pool.query(`
    SELECT 
      ac.name as category_name,
      COUNT(a.id) as total_activities
    FROM activity_categories ac
    LEFT JOIN activities a ON a.category_id = ac.id
    GROUP BY ac.id, ac.name
    ORDER BY ac.id
  `);
  
  console.log('\n📊 Resumen por categoría:');
  categoryStats.rows.forEach(stat => {
    console.log(`${stat.category_name}: ${stat.total_activities} actividades`);
  });
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createDiverseActivities()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}