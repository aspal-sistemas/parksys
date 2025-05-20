import { storage } from "./storage";

/**
 * Script para agregar voluntarios de muestra
 */
async function addSampleVolunteers() {
  console.log("Agregando voluntarios de muestra...");
  
  // Creamos un array con los datos de los voluntarios de muestra
  const sampleVolunteers = [
    {
      fullName: "Ana García Martínez",
      email: "ana.garcia@example.com",
      phoneNumber: "5551234567",
      emergencyContact: "5559876543",
      address: "Calle Hidalgo 123, Centro",
      birthdate: new Date("1990-05-15"),
      skills: "Jardinería, educación ambiental",
      availability: "Fines de semana",
      status: "active",
      profileImageUrl: "https://randomuser.me/api/portraits/women/1.jpg",
    },
    {
      fullName: "Carlos Rodríguez López",
      email: "carlos.rodriguez@example.com",
      phoneNumber: "5552345678",
      emergencyContact: "5558765432",
      address: "Av. Reforma 456, Juárez",
      birthdate: new Date("1985-10-20"),
      skills: "Diseño gráfico, fotografía",
      availability: "Tardes entre semana",
      status: "active",
      profileImageUrl: "https://randomuser.me/api/portraits/men/2.jpg",
    },
    {
      fullName: "Laura Hernández Sánchez",
      email: "laura.hernandez@example.com",
      phoneNumber: "5553456789",
      emergencyContact: "5557654321",
      address: "Calle 5 de Mayo 789, Roma",
      birthdate: new Date("1995-03-08"),
      skills: "Primeros auxilios, organización de eventos",
      availability: "Fines de semana y festivos",
      status: "active",
      profileImageUrl: "https://randomuser.me/api/portraits/women/3.jpg",
    },
    {
      fullName: "Miguel Ángel Pérez Torres",
      email: "miguel.perez@example.com",
      phoneNumber: "5554567890",
      emergencyContact: "5556543210",
      address: "Av. Insurgentes 234, Condesa",
      birthdate: new Date("1988-12-12"),
      skills: "Deportes, mantenimiento",
      availability: "Tardes y fines de semana",
      status: "pending",
      profileImageUrl: "https://randomuser.me/api/portraits/men/4.jpg",
    },
    {
      fullName: "Sofía Ramírez Vargas",
      email: "sofia.ramirez@example.com",
      phoneNumber: "5555678901",
      emergencyContact: "5555432109",
      address: "Calle Durango 567, Roma Norte",
      birthdate: new Date("1992-07-25"),
      skills: "Educación infantil, artes plásticas",
      availability: "Mañanas entre semana",
      status: "inactive",
      profileImageUrl: "https://randomuser.me/api/portraits/women/5.jpg",
    },
    {
      fullName: "Javier Gómez Flores",
      email: "javier.gomez@example.com",
      phoneNumber: "5556789012",
      emergencyContact: "5554321098",
      address: "Av. Chapultepec 890, Condesa",
      birthdate: new Date("1980-02-18"),
      skills: "Administración, logística",
      availability: "Fines de semana",
      status: "active",
      profileImageUrl: "https://randomuser.me/api/portraits/men/6.jpg",
    },
    {
      fullName: "Patricia Morales Díaz",
      email: "patricia.morales@example.com",
      phoneNumber: "5557890123",
      emergencyContact: "5553210987",
      address: "Calle Orizaba 123, Roma Sur",
      birthdate: new Date("1993-11-30"),
      skills: "Comunicación, redes sociales",
      availability: "Flexible",
      status: "active",
      profileImageUrl: "https://randomuser.me/api/portraits/women/7.jpg",
    },
    {
      fullName: "Roberto Vega Méndez",
      email: "roberto.vega@example.com",
      phoneNumber: "5558901234",
      emergencyContact: "5552109876",
      address: "Av. Sonora 456, Hipódromo",
      birthdate: new Date("1991-06-05"),
      skills: "Informática, diseño web",
      availability: "Tardes y fines de semana",
      status: "suspended",
      profileImageUrl: "https://randomuser.me/api/portraits/men/8.jpg",
    },
  ];

  // Agregamos los voluntarios de muestra
  for (const volunteerData of sampleVolunteers) {
    try {
      // Convertimos los datos al formato esperado por la base de datos
      const formattedData = {
        fullName: volunteerData.fullName,
        email: volunteerData.email,
        age: Math.floor(Math.random() * 30) + 18, // Edad aleatoria entre 18 y 48
        gender: Math.random() > 0.5 ? 'M' : 'F',
        phone: volunteerData.phoneNumber,
        profileImageUrl: volunteerData.profileImageUrl,
        availableHours: volunteerData.availability,
        previousExperience: volunteerData.skills,
        legalConsent: true,
        status: volunteerData.status || 'active'
      };
      
      // Buscamos si el voluntario ya existe consultando por email
      const [existingVolunteer] = await db.select()
        .from(volunteers)
        .where(eq(volunteers.email, volunteerData.email));
      
      if (!existingVolunteer) {
        const [newVolunteer] = await db.insert(volunteers)
          .values(formattedData)
          .returning();
        console.log(`Voluntario creado: ${volunteerData.fullName}`);
      } else {
        console.log(`El voluntario ${volunteerData.fullName} ya existe en la base de datos.`);
      }
    } catch (error) {
      console.error(`Error al crear voluntario ${volunteerData.fullName}:`, error);
    }
  }

  // Ahora creamos participaciones de muestra
  try {
    // Obtener todos los voluntarios y parques para asignar participaciones
    const allVolunteers = await db.select().from(volunteers);
    const allParks = await db.select().from(parks);
    
    if (allVolunteers.length > 0 && allParks.length > 0) {
      const sampleParticipations = [
        {
          volunteer_id: allVolunteers[0].id,
          park_id: allParks[0].id,
          activity_name: "Jornada de limpieza",
          activity_date: new Date(new Date().setDate(new Date().getDate() - 15)),
          hours_contributed: 5,
          notes: "Excelente actitud y disposición"
        },
        {
          volunteerId: allVolunteers[0].id,
          parkId: allParks[1].id,
          activityName: "Taller de educación ambiental",
          activityDate: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString().split('T')[0],
          hoursContributed: 3,
          notes: "Impartió taller sobre reciclaje"
        },
        {
          volunteerId: allVolunteers[1].id,
          parkId: allParks[0].id,
          activityName: "Mantenimiento de áreas verdes",
          activityDate: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString().split('T')[0],
          hoursContributed: 4,
          notes: "Ayudó con la poda de árboles"
        },
        {
          volunteerId: allVolunteers[2].id,
          parkId: allParks[2].id,
          activityName: "Festival ecológico",
          activityDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString().split('T')[0],
          hoursContributed: 6,
          notes: "Coordinó actividades para niños"
        },
        {
          volunteerId: allVolunteers[3].id,
          parkId: allParks[1].id,
          activityName: "Reforestación",
          activityDate: new Date(new Date().setDate(new Date().getDate() - 12)).toISOString().split('T')[0],
          hoursContributed: 7,
          notes: "Participó en la plantación de 20 árboles"
        },
        {
          volunteerId: allVolunteers[5].id,
          parkId: allParks[0].id,
          activityName: "Renovación de área de juegos",
          activityDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
          hoursContributed: 8,
          notes: "Ayudó con la instalación de juegos nuevos"
        }
      ];
      
      for (const participation of sampleParticipations) {
        // Verificar si la participación ya existe para evitar duplicados
        const existingParticipation = await storage.getVolunteerParticipationByDetails(
          participation.volunteerId,
          participation.parkId,
          participation.activityName,
          participation.activityDate
        );
        
        if (!existingParticipation) {
          await storage.createVolunteerParticipation(participation);
          console.log(`Participación creada para voluntario ${participation.volunteerId} en parque ${participation.parkId}`);
        } else {
          console.log(`La participación para voluntario ${participation.volunteerId} en actividad "${participation.activityName}" ya existe.`);
        }
      }
    } else {
      console.log("No hay suficientes voluntarios o parques para crear participaciones de muestra.");
    }
    
    // Crear algunos reconocimientos de muestra
    if (allVolunteers.length > 0) {
      const sampleRecognitions = [
        {
          volunteerId: allVolunteers[0].id,
          title: "Voluntario del Mes",
          description: "Por su destacada labor en la limpieza y mantenimiento de áreas verdes",
          awardDate: new Date(new Date().setDate(new Date().getDate() - 20)),
          awardType: "mensual"
        },
        {
          volunteerId: allVolunteers[2].id,
          title: "Mención Honorífica",
          description: "Por su contribución en la organización del festival ecológico",
          awardDate: new Date(new Date().setDate(new Date().getDate() - 10)),
          awardType: "especial"
        }
      ];
      
      for (const recognition of sampleRecognitions) {
        const existingRecognition = await storage.getVolunteerRecognitionByDetails(
          recognition.volunteerId, 
          recognition.title,
          recognition.awardDate.toISOString()
        );
        
        if (!existingRecognition) {
          await storage.createVolunteerRecognition(recognition);
          console.log(`Reconocimiento creado para voluntario ${recognition.volunteerId}: ${recognition.title}`);
        } else {
          console.log(`El reconocimiento "${recognition.title}" para voluntario ${recognition.volunteerId} ya existe.`);
        }
      }
    } else {
      console.log("No hay voluntarios para crear reconocimientos de muestra.");
    }

  } catch (error) {
    console.error("Error al crear participaciones o reconocimientos de muestra:", error);
  }

  console.log("Proceso de creación de datos de muestra para voluntarios completado");
}

export { addSampleVolunteers };