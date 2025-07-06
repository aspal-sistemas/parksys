/**
 * Script para crear tablas del sistema de reservas de espacios
 */

import { db } from "./db";
import { reservableSpaces, spaceReservations, spaceAvailability } from "@shared/schema";

export async function createSpaceReservationsTables() {
  console.log("🏗️ Creando tablas del sistema de reservas de espacios...");
  
  try {
    // Las tablas se crean automáticamente con Drizzle/Neon
    console.log("✅ Tablas del sistema de reservas de espacios creadas exitosamente");
    
    // Agregar espacios reservables de muestra
    await addSampleReservableSpaces();
    
  } catch (error) {
    console.error("❌ Error creando tablas del sistema de reservas:", error);
    throw error;
  }
}

async function addSampleReservableSpaces() {
  console.log("🎪 Agregando espacios reservables de muestra...");
  
  const sampleSpaces = [
    {
      parkId: 5, // Bosque Los Colomos
      name: "Área de Juegos Infantiles Principal",
      description: "Zona amplia con juegos para niños de 3 a 12 años, incluye resbaladillas, columpios y estructuras de escalada",
      spaceType: "playground",
      capacity: 50,
      hourlyRate: "150.00",
      minimumHours: 2,
      maximumHours: 6,
      amenities: "Juegos infantiles, bancas, sombra natural, acceso a baños",
      rules: "Solo para eventos infantiles supervisados. Prohibido el uso de amplificación excesiva. Limpieza obligatoria al finalizar.",
      requiresApproval: true,
      advanceBookingDays: 15,
      coordinates: "20.6736,-103.3750"
    },
    {
      parkId: 5, // Bosque Los Colomos
      name: "Kiosco Central",
      description: "Estructura techada ideal para eventos familiares y celebraciones",
      spaceType: "kiosk",
      capacity: 80,
      hourlyRate: "250.00",
      minimumHours: 3,
      maximumHours: 8,
      amenities: "Techo, electricidad, mesas y bancas fijas, acceso vehicular",
      rules: "Prohibido el consumo de alcohol. Música hasta las 20:00 hrs. Depósito de limpieza requerido.",
      requiresApproval: true,
      advanceBookingDays: 30,
      coordinates: "20.6740,-103.3745"
    },
    {
      parkId: 18, // Bosque Urbano Tlaquepaque
      name: "Explanada Principal",
      description: "Área abierta para eventos masivos y actividades comunitarias",
      spaceType: "open_area",
      capacity: 200,
      hourlyRate: "500.00",
      minimumHours: 4,
      maximumHours: 10,
      amenities: "Área amplia, electricidad, estacionamiento cercano",
      rules: "Requiere permiso municipal para eventos grandes. Seguro de responsabilidad civil obligatorio.",
      requiresApproval: true,
      advanceBookingDays: 45,
      coordinates: "20.6400,-103.2900"
    },
    {
      parkId: 19, // Parque Agua Azul
      name: "Pabellón de Eventos",
      description: "Espacio techado para eventos formales y presentaciones",
      spaceType: "pavilion",
      capacity: 120,
      hourlyRate: "400.00",
      minimumHours: 3,
      maximumHours: 8,
      amenities: "Techo, escenario, sistema de sonido básico, iluminación",
      rules: "Solo eventos culturales y educativos. Prohibido fumar. Aforo máximo estrictamente respetado.",
      requiresApproval: true,
      advanceBookingDays: 30,
      coordinates: "20.6780,-103.3420"
    },
    {
      parkId: 5, // Bosque Los Colomos
      name: "Zona de Picnic Familiar",
      description: "Área sombreada con mesas para reuniones familiares pequeñas",
      spaceType: "picnic_area",
      capacity: 25,
      hourlyRate: "75.00",
      minimumHours: 2,
      maximumHours: 6,
      amenities: "Mesas de picnic, asadores, agua potable, botes de basura",
      rules: "Prohibido el uso de asadores personales. Limpieza obligatoria. Máximo 2 vehículos.",
      requiresApproval: false,
      advanceBookingDays: 7,
      coordinates: "20.6730,-103.3755"
    }
  ];

  try {
    const insertedSpaces = await db
      .insert(reservableSpaces)
      .values(sampleSpaces)
      .returning();

    console.log(`✅ Creados ${insertedSpaces.length} espacios reservables de muestra`);
    
    // Crear horarios de disponibilidad estándar
    await addStandardAvailability(insertedSpaces);
    
    // Crear algunas reservas de muestra
    await addSampleReservations(insertedSpaces);
    
  } catch (error) {
    console.error("❌ Error agregando espacios de muestra:", error);
  }
}

async function addStandardAvailability(spaces: any[]) {
  console.log("⏰ Configurando horarios de disponibilidad...");
  
  const availabilitySchedules = [];
  
  for (const space of spaces) {
    // Horario estándar: Martes a Domingo, 8:00 - 18:00
    for (let day = 2; day <= 7; day++) { // 2=Martes, 7=Sábado (0=Domingo)
      availabilitySchedules.push({
        spaceId: space.id,
        dayOfWeek: day === 7 ? 0 : day, // Convertir sábado a domingo
        startTime: "08:00:00",
        endTime: "18:00:00",
        isAvailable: true
      });
    }
    
    // Domingo con horario reducido
    availabilitySchedules.push({
      spaceId: space.id,
      dayOfWeek: 0, // Domingo
      startTime: "10:00:00",
      endTime: "16:00:00",
      isAvailable: true
    });
  }

  try {
    await db.insert(spaceAvailability).values(availabilitySchedules);
    console.log(`✅ Configurados horarios para ${spaces.length} espacios`);
  } catch (error) {
    console.error("❌ Error configurando horarios:", error);
  }
}

async function addSampleReservations(spaces: any[]) {
  console.log("📅 Creando reservas de muestra...");
  
  const sampleReservations = [
    {
      spaceId: spaces[0].id, // Área de Juegos Infantiles
      reservedBy: 1,
      contactName: "María González",
      contactPhone: "33-1234-5678",
      contactEmail: "maria.gonzalez@email.com",
      reservationDate: "2025-01-15",
      startTime: "15:00:00",
      endTime: "18:00:00",
      expectedAttendees: 25,
      purpose: "Fiesta de cumpleaños infantil - 6 años",
      specialRequests: "Necesitamos acceso para decorar 1 hora antes",
      totalCost: "450.00",
      depositPaid: "225.00",
      status: "confirmed"
    },
    {
      spaceId: spaces[1].id, // Kiosco Central
      reservedBy: 1,
      contactName: "Roberto Hernández",
      contactPhone: "33-8765-4321",
      contactEmail: "roberto.hernandez@empresa.com",
      reservationDate: "2025-01-20",
      startTime: "11:00:00",
      endTime: "16:00:00",
      expectedAttendees: 60,
      purpose: "Reunión familiar - aniversario de bodas",
      specialRequests: "Requerimos servicio de limpieza especializada",
      totalCost: "1250.00",
      depositPaid: "625.00",
      status: "pending"
    },
    {
      spaceId: spaces[4].id, // Zona de Picnic
      reservedBy: 1,
      contactName: "Ana López",
      contactPhone: "33-5555-0123",
      contactEmail: "ana.lopez@email.com",
      reservationDate: "2025-01-12",
      startTime: "12:00:00",
      endTime: "16:00:00",
      expectedAttendees: 15,
      purpose: "Comida familiar dominical",
      specialRequests: "Necesitamos usar nuestro asador portátil",
      totalCost: "300.00",
      depositPaid: "150.00",
      status: "confirmed"
    }
  ];

  try {
    await db.insert(spaceReservations).values(sampleReservations);
    console.log(`✅ Creadas ${sampleReservations.length} reservas de muestra`);
  } catch (error) {
    console.error("❌ Error creando reservas de muestra:", error);
  }
}

// Ejecutar función directamente
createSpaceReservationsTables()
  .then(() => {
    console.log("🎉 Sistema de reservas de espacios inicializado exitosamente");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Error:", error);
    process.exit(1);
  });