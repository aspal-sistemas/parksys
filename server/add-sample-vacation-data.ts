import { pool } from "./db";

/**
 * Script para agregar datos de muestra al sistema de vacaciones
 * Incluye solicitudes de vacaciones, balances y configuración
 */

interface VacationRequestData {
  employee_id: number;
  request_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: string;
  requested_by: number;
  approved_by?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface VacationBalanceData {
  employee_id: number;
  year: number;
  total_days: number;
  used_days: number;
  pending_days: number;
  available_days: number;
  created_at: string;
  updated_at: string;
}

export async function addSampleVacationData() {
  try {
    console.log("🏖️ Agregando datos de muestra al sistema de vacaciones...");

    // 1. Obtener empleados existentes
    const employeesResult = await pool.query(`
      SELECT id, full_name, email, role, created_at 
      FROM users 
      WHERE role = 'employee' 
      ORDER BY id 
      LIMIT 10
    `);

    const employees = employeesResult.rows;
    console.log(`✅ Empleados encontrados: ${employees.length}`);

    if (employees.length === 0) {
      console.log("⚠️ No hay empleados disponibles, creando empleados de muestra...");
      await createSampleEmployees();
      return addSampleVacationData();
    }

    // 2. Crear solicitudes de vacaciones de muestra (solo con empleados disponibles)
    const vacationRequests: VacationRequestData[] = [];
    
    // Crear solicitudes para cada empleado disponible
    employees.forEach((employee, index) => {
      if (index < 3) { // Solo para los primeros 3 empleados
        vacationRequests.push({
          employee_id: employee.id,
          request_type: index === 0 ? "vacaciones" : index === 1 ? "permiso" : "vacaciones",
          start_date: index === 0 ? "2025-07-15" : index === 1 ? "2025-07-20" : "2025-07-25",
          end_date: index === 0 ? "2025-07-19" : index === 1 ? "2025-07-20" : "2025-08-01",
          total_days: index === 0 ? 5 : index === 1 ? 1 : 8,
          reason: index === 0 ? "Vacaciones familiares" : index === 1 ? "Cita médica" : "Descanso personal",
          status: index === 0 ? "aprobada" : index === 1 ? "aprobada" : "pendiente",
          requested_by: employee.id,
          approved_by: index === 2 ? undefined : employees[0].id,
          notes: index === 0 ? "Aprobada por supervisor" : index === 1 ? "Permiso médico" : undefined,
          created_at: "2025-07-01T10:00:00Z",
          updated_at: "2025-07-02T14:30:00Z"
        });
      }
    });

    // Insertar solicitudes de vacaciones
    for (const request of vacationRequests) {
      await pool.query(`
        INSERT INTO vacation_requests (
          employee_id, request_type, start_date, end_date, total_days, 
          reason, status, requested_by, approved_by, notes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (employee_id, start_date, end_date) DO NOTHING
      `, [
        request.employee_id, request.request_type, request.start_date, 
        request.end_date, request.total_days, request.reason, request.status,
        request.requested_by, request.approved_by, request.notes,
        request.created_at, request.updated_at
      ]);
    }

    // 3. Crear balances de vacaciones
    const vacationBalances: VacationBalanceData[] = employees.map((emp, index) => {
      const used = [8, 5, 12, 3, 0, 15, 10, 7, 2, 18][index] || 0;
      const pending = [0, 8, 8, 9, 1, 12, 5, 0, 0, 0][index] || 0;
      
      return {
        employee_id: emp.id,
        year: 2025,
        total_days: 20,
        used_days: used,
        pending_days: pending,
        available_days: 20 - used - pending,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-07-08T12:00:00Z"
      };
    });

    // Insertar balances de vacaciones
    for (const balance of vacationBalances) {
      await pool.query(`
        INSERT INTO vacation_balances (
          employee_id, year, total_days, used_days, pending_days, 
          available_days, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (employee_id, year) DO UPDATE SET
          used_days = EXCLUDED.used_days,
          pending_days = EXCLUDED.pending_days,
          available_days = EXCLUDED.available_days,
          updated_at = EXCLUDED.updated_at
      `, [
        balance.employee_id, balance.year, balance.total_days, 
        balance.used_days, balance.pending_days, balance.available_days,
        balance.created_at, balance.updated_at
      ]);
    }

    // 4. Crear configuración del sistema
    const settingsData = [
      { key: 'annual_vacation_days', value: '20', description: 'Días de vacaciones anuales por empleado' },
      { key: 'max_consecutive_days', value: '15', description: 'Máximo de días consecutivos' },
      { key: 'advance_notice_days', value: '30', description: 'Días de aviso previo requeridos' },
      { key: 'carryover_days', value: '5', description: 'Días acumulables al siguiente año' },
      { key: 'approval_levels', value: '2', description: 'Niveles de aprobación requeridos' },
      { key: 'auto_approval_enabled', value: 'false', description: 'Aprobación automática habilitada' },
      { key: 'email_notifications', value: 'true', description: 'Notificaciones por email' },
      { key: 'sms_notifications', value: 'false', description: 'Notificaciones por SMS' },
      { key: 'calendar_integration', value: 'true', description: 'Integración con calendario' },
      { key: 'holiday_adjustment', value: 'true', description: 'Ajuste por días festivos' }
    ];

    // Insertar configuración
    for (const setting of settingsData) {
      await pool.query(`
        INSERT INTO vacation_settings (setting_key, setting_value, description, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT (setting_key) DO UPDATE SET
          setting_value = EXCLUDED.setting_value,
          updated_at = NOW()
      `, [setting.key, setting.value, setting.description]);
    }

    console.log("✅ Datos de muestra del sistema de vacaciones agregados exitosamente");
    console.log(`📋 ${vacationRequests.length} solicitudes de vacaciones creadas`);
    console.log(`⚖️ ${vacationBalances.length} balances de empleados configurados`);
    console.log(`⚙️ ${settingsData.length} configuraciones del sistema establecidas`);

  } catch (error) {
    console.error("❌ Error al agregar datos de muestra de vacaciones:", error);
    throw error;
  }
}

async function createSampleEmployees() {
  console.log("👥 Creando empleados de muestra...");
  
  const sampleEmployees = [
    { username: "ana.garcia", email: "ana.garcia@bosquesurbanos.gob.mx", full_name: "Ana García López", role: "employee" },
    { username: "carlos.mendoza", email: "carlos.mendoza@bosquesurbanos.gob.mx", full_name: "Carlos Mendoza", role: "employee" },
    { username: "elena.morales", email: "elena.morales@bosquesurbanos.gob.mx", full_name: "Elena Morales", role: "employee" },
    { username: "franco.colapinto", email: "franco.colapinto@bosquesurbanos.gob.mx", full_name: "Franco Colapinto", role: "employee" },
    { username: "maria.ruiz", email: "maria.ruiz@bosquesurbanos.gob.mx", full_name: "María Elena Ruiz", role: "employee" },
    { username: "jose.martinez", email: "jose.martinez@bosquesurbanos.gob.mx", full_name: "José Martínez", role: "employee" },
    { username: "sofia.torres", email: "sofia.torres@bosquesurbanos.gob.mx", full_name: "Ana Sofía Torres", role: "employee" },
    { username: "diego.ramirez", email: "diego.ramirez@bosquesurbanos.gob.mx", full_name: "Diego Ramírez", role: "employee" }
  ];

  for (const emp of sampleEmployees) {
    await pool.query(`
      INSERT INTO users (username, email, full_name, role, password, created_at, updated_at)
      VALUES ($1, $2, $3, $4, '$2b$10$dM6rTk6noLmnnlR4W/IKe.2/lQudvQC8adMcnbcMzeDPN8jxFyPpS', NOW(), NOW())
      ON CONFLICT (username) DO NOTHING
    `, [emp.username, emp.email, emp.full_name, emp.role]);
  }
  
  console.log("✅ Empleados de muestra creados");
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  addSampleVacationData()
    .then(() => {
      console.log("🎉 Proceso completado exitosamente");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Error en el proceso:", error);
      process.exit(1);
    });
}