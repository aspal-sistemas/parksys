import { db } from "./db";
import { 
  timeOffRequests, 
  vacationBalances, 
  timeRecords, 
  dailyTimeSheets, 
  workSchedules,
  requestTypeEnum,
  requestStatusEnum,
  timeRecordTypeEnum
} from "../shared/schema";

/**
 * Script para crear las tablas del módulo de vacaciones, permisos y control de horas
 */
export async function createTimeOffTables() {
  try {
    console.log("Iniciando creación de tablas de vacaciones y control de horas...");

    // Crear los enums primero
    await db.execute(`
      DO $$ BEGIN
        CREATE TYPE request_type AS ENUM (
          'vacation', 'permission', 'sick_leave', 'maternity_leave', 
          'paternity_leave', 'personal_leave', 'bereavement', 
          'study_leave', 'unpaid_leave'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(`
      DO $$ BEGIN
        CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(`
      DO $$ BEGIN
        CREATE TYPE time_record_type AS ENUM (
          'check_in', 'check_out', 'break_start', 'break_end', 
          'overtime_start', 'overtime_end'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Crear tabla de solicitudes de tiempo libre
    await db.execute(`
      CREATE TABLE IF NOT EXISTS time_off_requests (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL REFERENCES employees(id),
        request_type request_type NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        requested_days DECIMAL(5,2) NOT NULL,
        reason TEXT NOT NULL,
        description TEXT,
        medical_certificate TEXT,
        attachments TEXT[],
        status request_status DEFAULT 'pending',
        approved_by INTEGER REFERENCES users(id),
        approved_at TIMESTAMP,
        rejection_reason TEXT,
        submitted_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Crear tabla de balances de vacaciones
    await db.execute(`
      CREATE TABLE IF NOT EXISTS vacation_balances (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL REFERENCES employees(id),
        year INTEGER NOT NULL,
        total_days DECIMAL(5,2) NOT NULL,
        used_days DECIMAL(5,2) DEFAULT 0.00,
        pending_days DECIMAL(5,2) DEFAULT 0.00,
        available_days DECIMAL(5,2) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(employee_id, year)
      );
    `);

    // Crear tabla de registros de tiempo
    await db.execute(`
      CREATE TABLE IF NOT EXISTS time_records (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL REFERENCES employees(id),
        record_type time_record_type NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        date DATE NOT NULL,
        latitude TEXT,
        longitude TEXT,
        location TEXT,
        notes TEXT,
        is_manual_entry BOOLEAN DEFAULT FALSE,
        manual_reason TEXT,
        registered_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Crear tabla de resumen diario de horas
    await db.execute(`
      CREATE TABLE IF NOT EXISTS daily_time_sheets (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL REFERENCES employees(id),
        date DATE NOT NULL,
        check_in_time TIMESTAMP,
        check_out_time TIMESTAMP,
        regular_hours DECIMAL(5,2) DEFAULT 0.00,
        overtime_hours DECIMAL(5,2) DEFAULT 0.00,
        break_hours DECIMAL(5,2) DEFAULT 0.00,
        total_hours DECIMAL(5,2) DEFAULT 0.00,
        is_late BOOLEAN DEFAULT FALSE,
        late_minutes INTEGER DEFAULT 0,
        is_early_leave BOOLEAN DEFAULT FALSE,
        early_leave_minutes INTEGER DEFAULT 0,
        is_absent BOOLEAN DEFAULT FALSE,
        absence_reason TEXT,
        late_reason TEXT,
        is_justified BOOLEAN DEFAULT FALSE,
        notes TEXT,
        approved_by INTEGER REFERENCES users(id),
        approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(employee_id, date)
      );
    `);

    // Crear tabla de horarios de trabajo
    await db.execute(`
      CREATE TABLE IF NOT EXISTS work_schedules (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL REFERENCES employees(id),
        monday BOOLEAN DEFAULT TRUE,
        tuesday BOOLEAN DEFAULT TRUE,
        wednesday BOOLEAN DEFAULT TRUE,
        thursday BOOLEAN DEFAULT TRUE,
        friday BOOLEAN DEFAULT TRUE,
        saturday BOOLEAN DEFAULT FALSE,
        sunday BOOLEAN DEFAULT FALSE,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        break_start_time TEXT,
        break_end_time TEXT,
        regular_hours_per_day DECIMAL(5,2) DEFAULT 8.00,
        tolerance_minutes INTEGER DEFAULT 15,
        effective_from DATE NOT NULL,
        effective_to DATE,
        is_active BOOLEAN DEFAULT TRUE,
        notes TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Crear índices para optimizar consultas
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_time_off_requests_employee_id ON time_off_requests(employee_id);
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_time_off_requests_status ON time_off_requests(status);
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_time_off_requests_dates ON time_off_requests(start_date, end_date);
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_vacation_balances_employee_year ON vacation_balances(employee_id, year);
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_time_records_employee_date ON time_records(employee_id, date);
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_daily_time_sheets_employee_date ON daily_time_sheets(employee_id, date);
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_work_schedules_employee_active ON work_schedules(employee_id, is_active);
    `);

    console.log("Tablas de vacaciones y control de horas creadas exitosamente");

  } catch (error) {
    console.error("Error creando tablas de vacaciones y control de horas:", error);
    throw error;
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === new URL(import.meta.resolve('./create-time-off-tables.ts')).href) {
  createTimeOffTables()
    .then(() => {
      console.log("Migración completada exitosamente");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error en migración:", error);
      process.exit(1);
    });
}