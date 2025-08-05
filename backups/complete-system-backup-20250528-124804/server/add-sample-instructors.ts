import { db } from "./db";
import { 
  instructors, 
  instructorAssignments, 
  activities 
} from "@shared/schema";
import { sql } from "drizzle-orm";

/**
 * Script para agregar instructores de muestra
 */
async function addSampleInstructors() {
  console.log("Agregando instructores de muestra...");
  
  // Lista de instructores de muestra
  const sampleInstructors = [
    {
      fullName: "Carla Ramírez Soto",
      email: "carla.ramirez@instructores.mx",
      phoneNumber: "33-4512-7890",
      gender: "Femenino",
      age: 38,
      specialties: "Yoga, Meditación, Bienestar",
      experience: 12,
      bio: "Instructora certificada en yoga y meditación con más de 12 años de experiencia. Especialista en técnicas de respiración y mindfulness.",
      status: "active",
      availability: "Tardes y fines de semana",
      availableDays: ["Lunes", "Miércoles", "Viernes", "Sábado"],
      education: "Licenciatura en Educación Física, Certificación Internacional de Yoga",
      certifications: ["Instructor de Yoga Certificado", "Especialista en Meditación Guiada"]
    },
    {
      fullName: "Roberto Mendoza Galindo",
      email: "roberto.mendoza@instructores.mx",
      phoneNumber: "33-2289-5421",
      gender: "Masculino",
      age: 45,
      specialties: "Deportes, Fútbol, Baloncesto",
      experience: 20,
      bio: "Ex-jugador profesional de fútbol con amplia experiencia en entrenamiento deportivo juvenil. Especialista en desarrollo de habilidades motoras y trabajo en equipo.",
      status: "active",
      availability: "Mañanas y tardes",
      availableDays: ["Martes", "Jueves", "Sábado", "Domingo"],
      education: "Licenciatura en Ciencias del Deporte",
      certifications: ["Entrenador FIFA Nivel 2", "Certificación en Primeros Auxilios Deportivos"]
    },
    {
      fullName: "Elena Vázquez Duarte",
      email: "elena.vazquez@instructores.mx",
      phoneNumber: "33-6678-1234",
      gender: "Femenino",
      age: 42,
      specialties: "Arte, Pintura, Cerámica",
      experience: 15,
      bio: "Artista visual con experiencia en diversas técnicas pictóricas. Ha expuesto en galerías nacionales e internacionales. Apasionada por enseñar arte a todas las edades.",
      status: "active",
      availability: "Tardes y noches",
      availableDays: ["Lunes", "Martes", "Jueves", "Viernes"],
      education: "Maestría en Artes Visuales",
      certifications: ["Técnico en Restauración de Arte", "Diplomado en Pedagogía Artística"]
    },
    {
      fullName: "Miguel Ángel Torres Herrera",
      email: "miguel.torres@instructores.mx",
      phoneNumber: "33-8823-4567",
      gender: "Masculino",
      age: 36,
      specialties: "Música, Guitarra, Teoría Musical",
      experience: 14,
      bio: "Músico profesional especializado en guitarra y teoría musical. Ha participado en diversas orquestas y grupos musicales. Enfoque didáctico adaptado a diferentes niveles.",
      status: "active",
      availability: "Tardes y fines de semana",
      availableDays: ["Martes", "Miércoles", "Jueves", "Sábado"],
      education: "Conservatorio de Música de Guadalajara",
      certifications: ["Licenciatura en Música", "Diplomado en Educación Musical"]
    },
    {
      fullName: "Alejandra Robles Quintero",
      email: "alejandra.robles@instructores.mx",
      phoneNumber: "33-5590-8877",
      gender: "Femenino",
      age: 33,
      specialties: "Danza Contemporánea, Ballet, Jazz",
      experience: 10,
      bio: "Bailarina profesional con formación en ballet clásico y danza contemporánea. Experiencia en montaje de coreografías y enseñanza a diferentes grupos de edad.",
      status: "active",
      availability: "Mañanas y tardes",
      availableDays: ["Lunes", "Miércoles", "Viernes", "Domingo"],
      education: "Academia de Ballet de Guadalajara",
      certifications: ["Certificación en Pedagogía de Danza", "Técnico en Jazz"]
    },
    {
      fullName: "Daniel Ortega Miranda",
      email: "daniel.ortega@instructores.mx",
      phoneNumber: "33-7712-3456",
      gender: "Masculino",
      age: 40,
      specialties: "Ecología, Jardinería, Conservación",
      experience: 18,
      bio: "Biólogo especializado en ecología urbana y conservación. Ha liderado proyectos de reforestación y cuenta con amplia experiencia en educación ambiental para todas las edades.",
      status: "active",
      availability: "Mañanas",
      availableDays: ["Martes", "Jueves", "Sábado"],
      education: "Doctorado en Ciencias Ambientales",
      certifications: ["Educador Ambiental Certificado", "Especialista en Permacultura"]
    },
    {
      fullName: "Gabriela Estrada Figueroa",
      email: "gabriela.estrada@instructores.mx",
      phoneNumber: "33-9921-6745",
      gender: "Femenino",
      age: 38,
      specialties: "Teatro, Expresión Corporal, Improvisación",
      experience: 16,
      bio: "Actriz y directora teatral con experiencia en montajes para público infantil y adulto. Especialista en técnicas de improvisación y desarrollo de habilidades expresivas.",
      status: "active",
      availability: "Tardes y noches",
      availableDays: ["Lunes", "Miércoles", "Viernes", "Sábado"],
      education: "Licenciatura en Arte Dramático",
      certifications: ["Método Stanislavski", "Dirección Escénica"]
    },
    {
      fullName: "Héctor Navarro Campos",
      email: "hector.navarro@instructores.mx",
      phoneNumber: "33-8834-2211",
      gender: "Masculino",
      age: 52,
      specialties: "Historia, Recorridos Guiados, Patrimonio Cultural",
      experience: 25,
      bio: "Historiador especializado en patrimonio cultural urbano. Ha publicado varios libros sobre la historia de Guadalajara y sus monumentos. Experiencia en recorridos históricos guiados.",
      status: "active",
      availability: "Mañanas y tardes",
      availableDays: ["Martes", "Jueves", "Sábado", "Domingo"],
      education: "Doctorado en Historia",
      certifications: ["Guía Turístico Certificado", "Especialista en Patrimonio Cultural de Jalisco"]
    },
    {
      fullName: "Isabel Morales Jiménez",
      email: "isabel.morales@instructores.mx",
      phoneNumber: "33-6654-9980",
      gender: "Femenino",
      age: 35,
      specialties: "Fotografía, Edición Digital, Composición",
      experience: 12,
      bio: "Fotógrafa profesional con experiencia en diferentes géneros fotográficos. Ha realizado exposiciones individuales y colectivas. Enfoque en enseñanza de técnicas básicas y avanzadas.",
      status: "active",
      availability: "Tardes",
      availableDays: ["Martes", "Jueves", "Sábado"],
      education: "Licenciatura en Artes Visuales",
      certifications: ["Adobe Certified Expert", "Diplomado en Fotografía Documental"]
    },
    {
      fullName: "Javier López Castro",
      email: "javier.lopez@instructores.mx",
      phoneNumber: "33-1123-4567",
      gender: "Masculino",
      age: 37,
      specialties: "Baile, Salsa, Bachata, Danzón",
      experience: 14,
      bio: "Bailarín profesional especializado en ritmos latinos. Ha participado en competencias nacionales e internacionales. Experiencia en la enseñanza a principiantes y niveles avanzados.",
      status: "active",
      availability: "Noches y fines de semana",
      availableDays: ["Jueves", "Viernes", "Sábado", "Domingo"],
      education: "Academia de Baile Latino de México",
      certifications: ["Instructor de Baile Latino Certificado", "Coreógrafo Profesional"]
    },
    {
      fullName: "Karla Medina Ruiz",
      email: "karla.medina@instructores.mx",
      phoneNumber: "33-9878-5544",
      gender: "Femenino",
      age: 32,
      specialties: "Artesanía, Manualidades, Reciclaje Creativo",
      experience: 8,
      bio: "Artesana especializada en técnicas tradicionales y reciclaje creativo. Ha participado en ferias artesanales nacionales. Experiencia en talleres para niños y adultos.",
      status: "active",
      availability: "Mañanas y tardes",
      availableDays: ["Lunes", "Miércoles", "Viernes"],
      education: "Técnico en Diseño de Artesanías",
      certifications: ["Artesana Certificada", "Especialista en Reciclaje Creativo"]
    },
    {
      fullName: "Luis Fernando Ríos Ochoa",
      email: "luisf.rios@instructores.mx",
      phoneNumber: "33-2267-8890",
      gender: "Masculino",
      age: 41,
      specialties: "Huertos Urbanos, Permacultura, Agricultura Orgánica",
      experience: 15,
      bio: "Ingeniero agrónomo especializado en agricultura urbana y permacultura. Ha desarrollado proyectos comunitarios de huertos urbanos. Experiencia en educación ambiental práctica.",
      status: "active",
      availability: "Mañanas y fines de semana",
      availableDays: ["Martes", "Jueves", "Sábado", "Domingo"],
      education: "Maestría en Agroecología",
      certifications: ["Permacultor Certificado", "Especialista en Agricultura Orgánica"]
    },
    {
      fullName: "María Fernanda Gutiérrez Lara",
      email: "mariaf.gutierrez@instructores.mx",
      phoneNumber: "33-4478-9912",
      gender: "Femenino",
      age: 39,
      specialties: "Desarrollo Personal, Meditación, Mindfulness",
      experience: 12,
      bio: "Coach certificada en desarrollo personal y bienestar. Práctica de mindfulness y meditación por más de 15 años. Experiencia en talleres y retiros de crecimiento personal.",
      status: "active",
      availability: "Tardes y fines de semana",
      availableDays: ["Lunes", "Miércoles", "Viernes", "Domingo"],
      education: "Maestría en Psicología",
      certifications: ["Coach Certificada", "Instructora de Mindfulness"]
    },
    {
      fullName: "Noé Valenzuela Cervantes",
      email: "noe.valenzuela@instructores.mx",
      phoneNumber: "33-6612-3344",
      gender: "Masculino",
      age: 45,
      specialties: "Ajedrez, Juegos de Estrategia, Desarrollo Cognitivo",
      experience: 20,
      bio: "Maestro internacional de ajedrez con experiencia en enseñanza a todas las edades. Ha desarrollado metodologías para el uso del ajedrez como herramienta educativa y de desarrollo cognitivo.",
      status: "active",
      availability: "Tardes",
      availableDays: ["Martes", "Jueves", "Sábado"],
      education: "Licenciatura en Matemáticas",
      certifications: ["Maestro FIDE de Ajedrez", "Instructor Certificado"]
    },
    {
      fullName: "Patricia Montes de Oca",
      email: "patricia.montes@instructores.mx",
      phoneNumber: "33-9945-6678",
      gender: "Femenino",
      age: 36,
      specialties: "Literatura, Escritura Creativa, Poesía",
      experience: 10,
      bio: "Escritora y poeta con obras publicadas. Ha coordinado talleres literarios y círculos de lectura. Experiencia en enseñanza de técnicas narrativas y expresión escrita.",
      status: "active",
      availability: "Noches",
      availableDays: ["Lunes", "Miércoles", "Viernes"],
      education: "Licenciatura en Letras Hispánicas",
      certifications: ["Diplomado en Creación Literaria", "Editora Certificada"]
    }
  ];
  
  // Insertar instructores en la base de datos
  for (const instructor of sampleInstructors) {
    try {
      console.log(`Creando instructor: ${instructor.fullName}`);
      
      // Convertir arreglos a formato compatible con PostgreSQL
      const availableDays = instructor.availableDays ? `{${instructor.availableDays.join(',')}}` : null;
      const certifications = instructor.certifications ? `{${instructor.certifications.join(',')}}` : null;
      
      // Usar SQL directo para evitar problemas con el esquema
      const query = `
        INSERT INTO instructors
        (full_name, email, phone, gender, age, specialties, experience_years, bio, status, 
         available_hours, available_days, preferred_park_id, profile_image_url, 
         created_at, updated_at, education, certifications)
        VALUES
        ('${instructor.fullName}', '${instructor.email}', '${instructor.phoneNumber}', 
         '${instructor.gender}', ${instructor.age}, '${instructor.specialties}', 
         ${instructor.experience}, '${instructor.bio.replace(/'/g, "''")}', 
         '${instructor.status}', '${instructor.availability}', 
         '${availableDays}', 
         ${Math.floor(Math.random() * 10) + 1}, 
         NULL, 
         NOW(), NOW(), 
         '${instructor.education}', 
         '${certifications}')
        RETURNING id
      `;
      
      const result = await db.execute(query);
      const instructorId = result.rows[0].id;
      
      console.log(`Instructor creado con ID: ${instructorId}`);
      
      // Asignar el instructor a algunas actividades
      await assignInstructorToActivities(instructorId, instructor.specialties);
    } catch (error) {
      console.error(`Error al crear instructor ${instructor.fullName}:`, error);
    }
  }
  
  console.log("Instructores de muestra agregados correctamente.");
}

/**
 * Asigna un instructor a actividades relacionadas con sus especialidades
 */
async function assignInstructorToActivities(instructorId: number, specialties: string) {
  try {
    // Consultar la estructura actual de la tabla de actividades
    console.log(`Consultando estructura de tabla de actividades para instructor ${instructorId}...`);
    
    // Obtener las actividades disponibles
    const result = await db.execute(`
      SELECT * FROM activities LIMIT 1
    `);
    console.log("Estructura de actividades:", Object.keys(result.rows[0] || {}).join(", "));
    
    // Obtener las actividades de la tabla
    const allActivitiesResult = await db.execute(`SELECT * FROM activities`);
    const allActivities = allActivitiesResult.rows;
    console.log(`Se encontraron ${allActivities.length} actividades en total`);
    
    // Filtrar actividades que coincidan con las especialidades del instructor
    const specialtiesList = specialties.toLowerCase().split(',').map(s => s.trim());
    
    const matchingActivities = allActivities.filter(activity => {
      // Si la actividad tiene categoría o título que coincida con alguna especialidad
      if (!activity.title && !activity.category) return false;
      
      const activityTitle = (activity.title || '').toLowerCase();
      const activityCategory = (activity.category || '').toLowerCase();
      const activityDescription = (activity.description || '').toLowerCase();
      
      return specialtiesList.some(specialty => 
        activityTitle.includes(specialty) || 
        activityCategory.includes(specialty) || 
        activityDescription.includes(specialty));
    });
    
    console.log(`Se encontraron ${matchingActivities.length} actividades que coinciden con las especialidades del instructor ${instructorId}`);
    
    // Seleccionar hasta 3 actividades al azar para asignar
    const activitiesToAssign = matchingActivities.length > 3 
      ? selectRandomItems(matchingActivities, 3) 
      : matchingActivities;
    
    if (activitiesToAssign.length === 0) {
      console.log(`No se encontraron actividades que coincidan con las especialidades del instructor ${instructorId}`);
      return;
    }
    
    // Asignar el instructor a las actividades seleccionadas
    for (const activity of activitiesToAssign) {
      try {
        const parkId = activity.park_id;
        const activityName = activity.title || 'Actividad sin título';
        const startDate = activity.start_date;
        const endDate = activity.end_date;
        
        console.log(`Asignando instructor ${instructorId} a la actividad "${activityName}" en el parque ${parkId}`);
        
        const query = `
          INSERT INTO instructor_assignments
          (instructor_id, activity_id, park_id, activity_name, start_date, end_date, hours_assigned, assigned_by_id, created_at)
          VALUES
          (${instructorId}, ${activity.id}, ${parkId}, '${activityName.replace(/'/g, "''")}', 
           '${startDate}', ${endDate ? `'${endDate}'` : 'NULL'}, 
           ${Math.floor(Math.random() * 10) + 2}, 1, NOW())
        `;
        
        await db.execute(query);
        console.log(`Asignación creada para instructor ${instructorId} en actividad ${activity.id}`);
      } catch (error) {
        console.error(`Error al asignar instructor ${instructorId} a actividad ${activity.id}:`, error);
      }
    }
  } catch (error) {
    console.error(`Error al asignar actividades al instructor ${instructorId}:`, error);
  }
}

/**
 * Selecciona elementos aleatorios de un arreglo
 */
function selectRandomItems<T>(items: T[], count: number): T[] {
  const shuffled = [...items].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Ejecutar el script
addSampleInstructors()
  .then(() => {
    console.log("Proceso de carga de instructores completado");
    process.exit(0);
  })
  .catch(error => {
    console.error("Error al cargar instructores:", error);
    process.exit(1);
  });