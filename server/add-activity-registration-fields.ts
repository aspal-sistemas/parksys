import { pool } from "./db";

export async function addActivityRegistrationFields() {
  try {
    console.log("🔧 Agregando campos de inscripción a la tabla activities...");

    // Verificar si las columnas ya existen
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'activities' 
      AND column_name IN ('registration_enabled', 'max_registrations', 'registration_deadline', 'requires_approval')
    `);

    const existingColumns = columnCheck.rows.map(row => row.column_name);

    // Agregar columnas si no existen
    if (!existingColumns.includes('registration_enabled')) {
      await pool.query(`
        ALTER TABLE activities 
        ADD COLUMN registration_enabled BOOLEAN DEFAULT false
      `);
      console.log("✅ Columna registration_enabled agregada");
    }

    if (!existingColumns.includes('max_registrations')) {
      await pool.query(`
        ALTER TABLE activities 
        ADD COLUMN max_registrations INTEGER
      `);
      console.log("✅ Columna max_registrations agregada");
    }

    if (!existingColumns.includes('registration_deadline')) {
      await pool.query(`
        ALTER TABLE activities 
        ADD COLUMN registration_deadline TIMESTAMP
      `);
      console.log("✅ Columna registration_deadline agregada");
    }

    if (!existingColumns.includes('requires_approval')) {
      await pool.query(`
        ALTER TABLE activities 
        ADD COLUMN requires_approval BOOLEAN DEFAULT true
      `);
      console.log("✅ Columna requires_approval agregada");
    }

    // Habilitar inscripciones en algunas actividades existentes
    await pool.query(`
      UPDATE activities 
      SET registration_enabled = true, 
          max_registrations = 25, 
          requires_approval = true,
          registration_deadline = start_date - INTERVAL '1 day'
      WHERE id IN (
        SELECT id FROM activities 
        ORDER BY created_at DESC 
        LIMIT 5
      )
    `);

    console.log("✅ Campos de inscripción agregados a la tabla activities");

  } catch (error) {
    console.error("❌ Error al agregar campos de inscripción:", error);
  }
}