/**
 * Script para crear las tablas para los nuevos módulos de concesiones:
 * - Ubicaciones/Georeferenciación (concession_locations)
 * - Gestión financiera (concession_payments)
 * - Evaluación y Cumplimiento (concession_evaluations)
 */

import { pool } from "./db";

/**
 * Inicializa las tablas para los nuevos módulos de concesiones
 */
export async function createConcessionModulesTables() {
  const client = await pool.connect();

  try {
    // Iniciar transacción
    await client.query('BEGIN');

    console.log('Creando tablas para nuevos módulos de concesiones...');

    // Crear tabla de zonas de parques
    await client.query(`
      CREATE TABLE IF NOT EXISTS park_zones (
        id SERIAL PRIMARY KEY,
        park_id INTEGER NOT NULL REFERENCES parks(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        polygon_coordinates JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Tabla park_zones creada o ya existente.');

    // Crear tabla de ubicaciones de concesiones
    await client.query(`
      CREATE TABLE IF NOT EXISTS concession_locations (
        id SERIAL PRIMARY KEY,
        contract_id INTEGER NOT NULL REFERENCES concession_contracts(id) ON DELETE CASCADE,
        park_zone_id INTEGER REFERENCES park_zones(id) ON DELETE SET NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        area_size DECIMAL(10, 2) NOT NULL, -- en metros cuadrados
        location_description TEXT,
        polygon_coordinates JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Tabla concession_locations creada o ya existente.');

    // Crear tabla de pagos de concesiones
    await client.query(`
      CREATE TABLE IF NOT EXISTS concession_payments (
        id SERIAL PRIMARY KEY,
        contract_id INTEGER NOT NULL REFERENCES concession_contracts(id) ON DELETE CASCADE,
        amount DECIMAL(12, 2) NOT NULL,
        payment_date DATE NOT NULL,
        payment_type VARCHAR(50) NOT NULL, -- Mensual, Anual, Variable, etc.
        invoice_number VARCHAR(100),
        invoice_url TEXT,
        status VARCHAR(50) NOT NULL, -- Pendiente, Pagado, Atrasado
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Tabla concession_payments creada o ya existente.');

    // Crear tabla de evaluaciones de concesiones
    await client.query(`
      CREATE TABLE IF NOT EXISTS concession_evaluations (
        id SERIAL PRIMARY KEY,
        contract_id INTEGER NOT NULL REFERENCES concession_contracts(id) ON DELETE CASCADE,
        evaluation_date DATE NOT NULL,
        sanitary_score INTEGER NOT NULL, -- 1-10
        operational_score INTEGER NOT NULL, -- 1-10
        technical_score INTEGER NOT NULL, -- 1-10
        customer_satisfaction_score INTEGER NOT NULL, -- 1-10
        observations TEXT,
        has_incidents BOOLEAN NOT NULL DEFAULT FALSE,
        incident_description TEXT,
        action_required BOOLEAN NOT NULL DEFAULT FALSE,
        action_description TEXT,
        status VARCHAR(50) NOT NULL, -- Completada, Pendiente, En progreso
        follow_up_date DATE,
        evaluator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Tabla concession_evaluations creada o ya existente.');

    // Crear tabla de archivos adjuntos de evaluaciones
    await client.query(`
      CREATE TABLE IF NOT EXISTS concession_evaluation_attachments (
        id SERIAL PRIMARY KEY,
        evaluation_id INTEGER NOT NULL REFERENCES concession_evaluations(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        file_type VARCHAR(100),
        file_size INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Tabla concession_evaluation_attachments creada o ya existente.');

    // Confirmar transacción
    await client.query('COMMIT');
    console.log('Todas las tablas para los nuevos módulos de concesiones han sido creadas exitosamente.');

    return {
      success: true,
      message: 'Todas las tablas para los nuevos módulos de concesiones han sido creadas exitosamente.'
    };
  } catch (error) {
    // Revertir transacción en caso de error
    await client.query('ROLLBACK');
    console.error('Error al crear tablas para nuevos módulos de concesiones:', error);
    
    return {
      success: false,
      message: 'Error al crear tablas para nuevos módulos de concesiones',
      error: error instanceof Error ? error.message : String(error)
    };
  } finally {
    // Liberar el cliente
    client.release();
  }
}

// Ejecutar la función inmediatamente
createConcessionModulesTables()
  .then(result => {
    console.log(result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Error inesperado:', error);
    process.exit(1);
  });