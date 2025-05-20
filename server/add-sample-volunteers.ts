import { db } from "./db";
import { volunteers, parks, volunteerParticipations, volunteerEvaluations, volunteerRecognitions } from "@shared/schema";
import { eq, and } from "drizzle-orm";

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
          volunteer_id: allVolunteers[0].id,
          park_id: allParks[1].id,
          activity_name: "Taller de educación ambiental",
          activity_date: new Date(new Date().setDate(new Date().getDate() - 8)),
          hours_contributed: 3,
          notes: "Impartió taller sobre reciclaje"
        },
        {
          volunteer_id: allVolunteers[1].id,
          park_id: allParks[0].id,
          activity_name: "Mantenimiento de áreas verdes",
          activity_date: new Date(new Date().setDate(new Date().getDate() - 20)),
          hours_contributed: 4,
          notes: "Ayudó con la poda de árboles"
        },
        {
          volunteer_id: allVolunteers[2].id,
          park_id: allParks[2] ? allParks[2].id : allParks[0].id,
          activity_name: "Festival ecológico",
          activity_date: new Date(new Date().setDate(new Date().getDate() - 5)),
          hours_contributed: 6,
          notes: "Coordinó actividades para niños"
        },
        {
          volunteer_id: allVolunteers[3].id,
          park_id: allParks[1].id,
          activity_name: "Reforestación",
          activity_date: new Date(new Date().setDate(new Date().getDate() - 12)),
          hours_contributed: 7,
          notes: "Participó en la plantación de 20 árboles"
        },
        {
          volunteer_id: allVolunteers[5] ? allVolunteers[5].id : allVolunteers[0].id,
          park_id: allParks[0].id,
          activity_name: "Renovación de área de juegos",
          activity_date: new Date(new Date().setDate(new Date().getDate() - 30)),
          hours_contributed: 8,
          notes: "Ayudó con la instalación de juegos nuevos"
        }
      ];
      
      for (const participation of sampleParticipations) {
        try {
          // Verificar si la participación ya existe para evitar duplicados
          const [existingParticipation] = await db.select()
            .from(volunteerParticipations)
            .where(
              and(
                eq(volunteerParticipations.volunteer_id, participation.volunteer_id),
                eq(volunteerParticipations.park_id, participation.park_id),
                eq(volunteerParticipations.activity_name, participation.activity_name)
              )
            );
          
          if (!existingParticipation) {
            await db.insert(volunteerParticipations).values(participation);
            console.log(`Participación creada para voluntario ${participation.volunteer_id} en parque ${participation.park_id}`);
          } else {
            console.log(`La participación para voluntario ${participation.volunteer_id} en actividad "${participation.activity_name}" ya existe.`);
          }
        } catch (error) {
          console.error(`Error al crear participación:`, error);
        }
      }
    } else {
      console.log("No hay suficientes voluntarios o parques para crear participaciones de muestra.");
    }
    
    // Crear algunos reconocimientos de muestra
    if (allVolunteers.length > 0) {
      // Obtener usuarios para asignar como emisores de los reconocimientos
      const allUsers = await db.select().from(users);
      const issuedById = allUsers.length > 0 ? allUsers[0].id : 1;
      
      const sampleRecognitions = [
        {
          volunteer_id: allVolunteers[0].id,
          recognition_type: "diploma",
          level: "gold",
          reason: "Por su destacada labor en la limpieza y mantenimiento de áreas verdes",
          hours_completed: 100,
          issued_at: new Date(new Date().setDate(new Date().getDate() - 20)),
          issued_by_id: issuedById
        },
        {
          volunteer_id: allVolunteers[2] ? allVolunteers[2].id : allVolunteers[0].id,
          recognition_type: "medal",
          level: "silver",
          reason: "Por su contribución en la organización del festival ecológico",
          hours_completed: 50,
          issued_at: new Date(new Date().setDate(new Date().getDate() - 10)),
          issued_by_id: issuedById
        }
      ];
      
      for (const recognition of sampleRecognitions) {
        try {
          // Verificar si el reconocimiento ya existe
          const [existingRecognition] = await db.select()
            .from(volunteerRecognitions)
            .where(
              and(
                eq(volunteerRecognitions.volunteer_id, recognition.volunteer_id),
                eq(volunteerRecognitions.recognition_type, recognition.recognition_type)
              )
            );
          
          if (!existingRecognition) {
            await db.insert(volunteerRecognitions).values(recognition);
            console.log(`Reconocimiento creado para voluntario ${recognition.volunteer_id}: ${recognition.recognition_type}`);
          } else {
            console.log(`El reconocimiento "${recognition.recognition_type}" para voluntario ${recognition.volunteer_id} ya existe.`);
          }
        } catch (error) {
          console.error(`Error al crear reconocimiento:`, error);
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