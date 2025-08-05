import { pool } from "./db";

/**
 * Script para crear las tablas relacionadas con el módulo de instructores
 */
async function createInstructorsTables() {
  const client = await pool.connect();
  
  try {
    console.log("Iniciando creación de tablas para el módulo de instructores...");
    
    // Iniciar una transacción
    await client.query('BEGIN');
    
    // Crear tabla de instructores
    await client.query(`
      CREATE TABLE IF NOT EXISTS instructors (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        age INTEGER,
        gender TEXT,
        specialties TEXT,
        experience_years INTEGER NOT NULL,
        bio TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        available_hours TEXT,
        available_days TEXT[],
        preferred_park_id INTEGER,
        profile_image_url TEXT,
        cv_url TEXT,
        education TEXT,
        certifications TEXT[],
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log("Tabla instructors creada");
    
    // Crear tabla de asignaciones de instructores
    await client.query(`
      CREATE TABLE IF NOT EXISTS instructor_assignments (
        id SERIAL PRIMARY KEY,
        instructor_id INTEGER NOT NULL REFERENCES instructors(id),
        activity_id INTEGER NOT NULL REFERENCES activities(id),
        park_id INTEGER NOT NULL REFERENCES parks(id),
        activity_name TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        hours_assigned INTEGER NOT NULL,
        assigned_by_id INTEGER NOT NULL,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log("Tabla instructor_assignments creada");
    
    // Crear tabla de evaluaciones de instructores
    await client.query(`
      CREATE TABLE IF NOT EXISTS instructor_evaluations (
        id SERIAL PRIMARY KEY,
        assignment_id INTEGER NOT NULL REFERENCES instructor_assignments(id),
        instructor_id INTEGER NOT NULL REFERENCES instructors(id),
        evaluator_id INTEGER NOT NULL,
        knowledge INTEGER NOT NULL,
        communication INTEGER NOT NULL, 
        methodology INTEGER NOT NULL, 
        overall_performance INTEGER NOT NULL,
        comments TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log("Tabla instructor_evaluations creada");
    
    // Crear tabla de reconocimientos de instructores
    await client.query(`
      CREATE TABLE IF NOT EXISTS instructor_recognitions (
        id SERIAL PRIMARY KEY,
        instructor_id INTEGER NOT NULL REFERENCES instructors(id),
        recognition_type TEXT NOT NULL,
        level TEXT,
        reason TEXT NOT NULL,
        hours_completed INTEGER,
        certificate_url TEXT,
        issued_at TIMESTAMP NOT NULL DEFAULT NOW(),
        issued_by_id INTEGER NOT NULL,
        additional_comments TEXT
      )
    `);
    console.log("Tabla instructor_recognitions creada");
    
    // Confirmar la transacción
    await client.query('COMMIT');
    console.log("Tablas para el módulo de instructores creadas correctamente");
    
  } catch (error) {
    // Revertir la transacción en caso de error
    await client.query('ROLLBACK');
    console.error("Error al crear las tablas:", error);
    throw error;
  } finally {
    // Liberar el cliente
    client.release();
  }
}

// Ejecutar el script
createInstructorsTables()
  .then(() => {
    console.log("Proceso de creación de tablas completado");
    process.exit(0);
  })
  .catch(error => {
    console.error("Error en el proceso:", error);
    process.exit(1);
  });