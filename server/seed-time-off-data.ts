import { db } from "./db";
import { 
  timeOffRequests, 
  vacationBalances, 
  timeRecords, 
  dailyTimeSheets, 
  workSchedules,
  employees 
} from "../shared/schema";
import { eq } from "drizzle-orm";

/**
 * Script para poblar datos de muestra del módulo de vacaciones y control de horas
 */
export async function seedTimeOffData() {
  try {
    console.log("Iniciando población de datos de vacaciones y control de horas...");

    // Obtener empleados existentes
    const allEmployees = await db.select().from(employees);
    
    if (allEmployees.length === 0) {
      console.log("No hay empleados en la base de datos. Creando datos de muestra...");
      return;
    }

    console.log(`Creando datos para ${allEmployees.length} empleados`);

    // 1. Crear balances de vacaciones para 2025
    console.log("Creando balances de vacaciones...");
    for (const employee of allEmployees) {
      // Calcular días de vacaciones basado en antigüedad (15 días base + 1 por año)
      const hireDate = new Date(employee.hireDate);
      const currentDate = new Date();
      const yearsOfService = currentDate.getFullYear() - hireDate.getFullYear();
      const totalDays = Math.min(15 + yearsOfService, 30); // Máximo 30 días

      await db.insert(vacationBalances).values({
        employeeId: employee.id,
        year: 2025,
        totalDays: totalDays.toString(),
        usedDays: "0.00",
        pendingDays: "0.00",
        availableDays: totalDays.toString(),
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        notes: "Balance automático generado para 2025"
      }).onConflictDoNothing();
    }

    // 2. Crear horarios de trabajo estándar
    console.log("Creando horarios de trabajo...");
    for (const employee of allEmployees) {
      await db.insert(workSchedules).values({
        employeeId: employee.id,
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
        startTime: "08:00",
        endTime: "17:00",
        breakStartTime: "12:00",
        breakEndTime: "13:00",
        regularHoursPerDay: "8.00",
        toleranceMinutes: 15,
        effectiveFrom: "2025-01-01",
        isActive: true,
        notes: "Horario estándar de oficina"
      }).onConflictDoNothing();
    }

    // 3. Crear algunas solicitudes de vacaciones de muestra
    console.log("Creando solicitudes de vacaciones de muestra...");
    const sampleRequests = [
      {
        employeeId: allEmployees[0]?.id,
        requestType: "vacation" as const,
        startDate: "2025-07-15",
        endDate: "2025-07-26",
        requestedDays: "10.00",
        reason: "Vacaciones familiares de verano",
        description: "Viaje familiar programado con anticipación",
        status: "approved" as const,
        submittedAt: new Date("2025-06-01T10:00:00Z"),
        approvedAt: new Date("2025-06-02T09:30:00Z")
      },
      {
        employeeId: allEmployees[1]?.id,
        requestType: "sick_leave" as const,
        startDate: "2025-06-10",
        endDate: "2025-06-12",
        requestedDays: "3.00",
        reason: "Incapacidad médica por gripe",
        description: "Recomendación médica de reposo",
        status: "approved" as const,
        submittedAt: new Date("2025-06-10T08:00:00Z"),
        approvedAt: new Date("2025-06-10T10:00:00Z")
      },
      {
        employeeId: allEmployees[2]?.id,
        requestType: "permission" as const,
        startDate: "2025-06-20",
        endDate: "2025-06-20",
        requestedDays: "1.00",
        reason: "Trámites personales",
        description: "Cita médica especializada",
        status: "pending" as const,
        submittedAt: new Date("2025-06-17T14:00:00Z")
      }
    ];

    for (const request of sampleRequests) {
      if (request.employeeId) {
        await db.insert(timeOffRequests).values(request).onConflictDoNothing();
      }
    }

    // 4. Crear registros de tiempo de muestra para los últimos días
    console.log("Creando registros de tiempo de muestra...");
    const today = new Date();
    const daysToCreate = 5; // Últimos 5 días laborables

    for (let dayOffset = 0; dayOffset < daysToCreate; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() - dayOffset);
      
      // Solo días laborables (lunes a viernes)
      if (date.getDay() >= 1 && date.getDay() <= 5) {
        const dateStr = date.toISOString().split('T')[0];
        
        for (const employee of allEmployees.slice(0, 5)) { // Primeros 5 empleados
          // Horario de entrada (8:00 AM con variación)
          const checkInVariation = Math.floor(Math.random() * 30) - 15; // -15 a +15 minutos
          const checkInTime = new Date(date);
          checkInTime.setHours(8, checkInVariation > 0 ? checkInVariation : 0, 0, 0);
          
          // Horario de salida (5:00 PM con variación)
          const checkOutVariation = Math.floor(Math.random() * 60) - 30; // -30 a +30 minutos
          const checkOutTime = new Date(date);
          checkOutTime.setHours(17, checkOutVariation > 0 ? checkOutVariation : 0, 0, 0);

          // Registrar entrada
          await db.insert(timeRecords).values({
            employeeId: employee.id,
            recordType: "check_in",
            timestamp: checkInTime,
            date: dateStr,
            location: "Oficina Central",
            isManualEntry: false
          }).onConflictDoNothing();

          // Registrar salida
          await db.insert(timeRecords).values({
            employeeId: employee.id,
            recordType: "check_out",
            timestamp: checkOutTime,
            date: dateStr,
            location: "Oficina Central",
            isManualEntry: false
          }).onConflictDoNothing();

          // Calcular horas trabajadas
          const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
          const regularHours = Math.min(hoursWorked, 8);
          const overtimeHours = Math.max(hoursWorked - 8, 0);
          const isLate = checkInVariation > 15;

          // Crear hoja de tiempo diaria
          await db.insert(dailyTimeSheets).values({
            employeeId: employee.id,
            date: dateStr,
            checkInTime: checkInTime,
            checkOutTime: checkOutTime,
            regularHours: regularHours.toFixed(2),
            overtimeHours: overtimeHours.toFixed(2),
            totalHours: hoursWorked.toFixed(2),
            isLate: isLate,
            lateMinutes: isLate ? checkInVariation : 0,
            isAbsent: false,
            isJustified: isLate ? Math.random() > 0.5 : true // 50% de tardanzas justificadas
          }).onConflictDoNothing();
        }
      }
    }

    console.log("Datos de vacaciones y control de horas creados exitosamente");

  } catch (error) {
    console.error("Error poblando datos de vacaciones y control de horas:", error);
    throw error;
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === new URL(import.meta.resolve('./seed-time-off-data.ts')).href) {
  seedTimeOffData()
    .then(() => {
      console.log("Población de datos completada exitosamente");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error en población de datos:", error);
      process.exit(1);
    });
}