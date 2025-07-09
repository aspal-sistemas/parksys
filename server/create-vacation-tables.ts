import { db } from "./db";
import { 
  timeOffRequests, 
  vacationBalances, 
  employees 
} from "@shared/schema";
import { eq } from "drizzle-orm";

export async function createVacationTables() {
  console.log("🏖️ Inicializando tablas del módulo de vacaciones...");
  
  try {
    // Crear tabla de configuración si no existe
    await db.execute(`
      CREATE TABLE IF NOT EXISTS vacation_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(255) NOT NULL UNIQUE,
        setting_value TEXT NOT NULL,
        description TEXT,
        data_type VARCHAR(50) DEFAULT 'string',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Crear configuración por defecto del sistema
    const defaultSettings = [
      {
        settingKey: "default_vacation_days",
        settingValue: "12",
        description: "Días de vacaciones por defecto por año",
        dataType: "integer",
        isActive: true
      },
      {
        settingKey: "max_advance_days",
        settingValue: "90",
        description: "Días máximos de anticipación para solicitar vacaciones",
        dataType: "integer",
        isActive: true
      },
      {
        settingKey: "min_advance_days",
        settingValue: "7",
        description: "Días mínimos de anticipación para solicitar vacaciones",
        dataType: "integer",
        isActive: true
      },
      {
        settingKey: "require_approval",
        settingValue: "true",
        description: "Requiere aprobación para solicitudes de vacaciones",
        dataType: "boolean",
        isActive: true
      },
      {
        settingKey: "notification_email",
        settingValue: "admin@bosquesurbanos.gob.mx",
        description: "Email para notificaciones de vacaciones",
        dataType: "string",
        isActive: true
      }
    ];

    // Insertar configuración por defecto (solo si no existe)
    for (const setting of defaultSettings) {
      try {
        await db.execute(`
          INSERT INTO vacation_settings (setting_key, setting_value, description, data_type, is_active)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (setting_key) DO NOTHING;
        `, [setting.settingKey, setting.settingValue, setting.description, setting.dataType, setting.isActive]);
      } catch (error) {
        console.log(`Configuración ${setting.settingKey} ya existe`);
      }
    }

    // Inicializar balances de vacaciones para empleados activos del año actual
    const currentYear = new Date().getFullYear();
    const activeEmployees = await db
      .select({
        id: employees.id,
        fullName: employees.fullName
      })
      .from(employees)
      .where(eq(employees.status, "active"));

    console.log(`📊 Encontrados ${activeEmployees.length} empleados activos`);

    // Verificar cuáles empleados ya tienen balance para el año actual
    const existingBalances = await db
      .select({
        employeeId: vacationBalances.employeeId
      })
      .from(vacationBalances)
      .where(eq(vacationBalances.year, currentYear));

    const existingEmployeeIds = existingBalances.map(b => b.employeeId);
    const employeesNeedingBalance = activeEmployees.filter(emp => 
      !existingEmployeeIds.includes(emp.id)
    );

    console.log(`🆕 ${employeesNeedingBalance.length} empleados necesitan balance inicial`);

    // Crear balances iniciales para empleados que no los tienen
    if (employeesNeedingBalance.length > 0) {
      const initialBalances = employeesNeedingBalance.map(emp => ({
        employeeId: emp.id,
        year: currentYear,
        totalDays: "12.00",
        usedDays: "0.00",
        pendingDays: "0.00",
        availableDays: "12.00",
        startDate: `${currentYear}-01-01`,
        endDate: `${currentYear}-12-31`,
        notes: `Balance inicial para ${currentYear} - ${emp.fullName}`
      }));

      await db.insert(vacationBalances).values(initialBalances);
      console.log(`✅ Balances iniciales creados para ${employeesNeedingBalance.length} empleados`);
    }

    // Crear algunas solicitudes de ejemplo para demostración
    const sampleRequests = [
      {
        employeeId: activeEmployees[0]?.id || 18,
        requestType: "vacation" as const,
        startDate: "2025-08-15",
        endDate: "2025-08-19",
        requestedDays: "5.00",
        reason: "Vacaciones familiares de verano",
        description: "Viaje familiar programado",
        status: "pending" as const
      },
      {
        employeeId: activeEmployees[1]?.id || 19,
        requestType: "vacation" as const,
        startDate: "2025-09-01",
        endDate: "2025-09-03",
        requestedDays: "3.00",
        reason: "Descanso personal",
        description: "Días de descanso para asuntos personales",
        status: "approved" as const
      },
      {
        employeeId: activeEmployees[2]?.id || 20,
        requestType: "sick_leave" as const,
        startDate: "2025-07-10",
        endDate: "2025-07-12",
        requestedDays: "3.00",
        reason: "Incapacidad médica",
        description: "Recuperación post-operatoria",
        status: "approved" as const
      }
    ];

    // Insertar solicitudes de ejemplo (solo si no existen)
    for (const request of sampleRequests) {
      try {
        await db.insert(timeOffRequests).values(request);
      } catch (error) {
        console.log("Solicitud de ejemplo ya existe");
      }
    }

    console.log("🏖️ Tablas del módulo de vacaciones inicializadas correctamente");
    console.log("📋 Configuración:");
    console.log(`   - ${defaultSettings.length} configuraciones del sistema`);
    console.log(`   - ${activeEmployees.length} empleados activos`);
    console.log(`   - ${employeesNeedingBalance.length} balances iniciales creados`);
    console.log(`   - ${sampleRequests.length} solicitudes de ejemplo`);
    
  } catch (error) {
    console.error("Error al inicializar tablas de vacaciones:", error);
  }
}