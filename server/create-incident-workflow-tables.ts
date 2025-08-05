import { pool } from "./db";

export async function createIncidentWorkflowTables() {
  try {
    console.log("🔧 Creando tablas para flujo de trabajo de incidencias...");
    
    // Tabla para asignaciones de incidencias
    await pool.query(`
      CREATE TABLE IF NOT EXISTS incident_assignments (
        id SERIAL PRIMARY KEY,
        incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
        assigned_to_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        assigned_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        department TEXT,
        assigned_at TIMESTAMP DEFAULT NOW(),
        due_date TIMESTAMP,
        notes TEXT,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Tabla para comentarios de incidencias
    await pool.query(`
      CREATE TABLE IF NOT EXISTS incident_comments (
        id SERIAL PRIMARY KEY,
        incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        comment_text TEXT NOT NULL,
        is_internal BOOLEAN DEFAULT false,
        is_public BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Tabla para historial de incidencias
    await pool.query(`
      CREATE TABLE IF NOT EXISTS incident_history (
        id SERIAL PRIMARY KEY,
        incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action_type TEXT NOT NULL,
        old_value TEXT,
        new_value TEXT,
        field_name TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Tabla para archivos adjuntos de incidencias
    await pool.query(`
      CREATE TABLE IF NOT EXISTS incident_attachments (
        id SERIAL PRIMARY KEY,
        incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_type TEXT,
        file_size INTEGER,
        attachment_type TEXT DEFAULT 'photo' CHECK (attachment_type IN ('photo', 'document', 'video', 'other')),
        uploaded_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        is_before_photo BOOLEAN DEFAULT false,
        is_after_photo BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Tabla para notificaciones de incidencias
    await pool.query(`
      CREATE TABLE IF NOT EXISTS incident_notifications (
        id SERIAL PRIMARY KEY,
        incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        notification_type TEXT NOT NULL CHECK (notification_type IN ('assignment', 'status_change', 'comment', 'reminder', 'escalation')),
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        sent_at TIMESTAMP DEFAULT NOW(),
        read_at TIMESTAMP,
        delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed')),
        priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
      );
    `);

    // Agregar columnas faltantes a la tabla incidents si no existen
    await pool.query(`
      ALTER TABLE incidents 
      ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
      ADD COLUMN IF NOT EXISTS assigned_to_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(5,2),
      ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(5,2),
      ADD COLUMN IF NOT EXISTS cost_estimate DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS actual_cost DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS resolution_notes TEXT,
      ADD COLUMN IF NOT EXISTS citizen_satisfaction INTEGER CHECK (citizen_satisfaction >= 1 AND citizen_satisfaction <= 5),
      ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS due_date TIMESTAMP;
    `);

    // Crear índices para mejorar el rendimiento
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_incident_assignments_incident_id ON incident_assignments(incident_id);
      CREATE INDEX IF NOT EXISTS idx_incident_assignments_assigned_to ON incident_assignments(assigned_to_user_id);
      CREATE INDEX IF NOT EXISTS idx_incident_comments_incident_id ON incident_comments(incident_id);
      CREATE INDEX IF NOT EXISTS idx_incident_history_incident_id ON incident_history(incident_id);
      CREATE INDEX IF NOT EXISTS idx_incident_attachments_incident_id ON incident_attachments(incident_id);
      CREATE INDEX IF NOT EXISTS idx_incident_notifications_user_id ON incident_notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
      CREATE INDEX IF NOT EXISTS idx_incidents_priority ON incidents(priority);
      CREATE INDEX IF NOT EXISTS idx_incidents_assigned_to ON incidents(assigned_to_user_id);
    `);

    console.log("✅ Tablas de flujo de trabajo de incidencias creadas exitosamente");
    
    // Actualizar estados disponibles en incidents
    await pool.query(`
      ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_status_check;
      ALTER TABLE incidents ADD CONSTRAINT incidents_status_check 
      CHECK (status IN ('pending', 'assigned', 'in_progress', 'review', 'resolved', 'closed', 'rejected'));
    `);

    // Insertar datos de ejemplo si no existen
    await insertSampleData();
    
  } catch (error) {
    console.error("❌ Error creando tablas de flujo de trabajo:", error);
    throw error;
  }
}

async function insertSampleData() {
  try {
    // Verificar si ya existen datos
    const existingComments = await pool.query("SELECT COUNT(*) FROM incident_comments");
    if (parseInt(existingComments.rows[0].count) > 0) {
      console.log("📝 Datos de ejemplo ya existen, omitiendo inserción");
      return;
    }

    // Obtener la incidencia existente
    const incidents = await pool.query("SELECT id FROM incidents LIMIT 1");
    if (incidents.rows.length === 0) {
      console.log("⚠️ No hay incidencias para agregar datos de ejemplo");
      return;
    }
    
    const incidentId = incidents.rows[0].id;
    
    // Obtener un usuario admin
    const adminUser = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (adminUser.rows.length === 0) {
      console.log("⚠️ No hay usuarios admin para asignar");
      return;
    }
    
    const adminId = adminUser.rows[0].id;

    // Insertar asignación de ejemplo
    await pool.query(`
      INSERT INTO incident_assignments (incident_id, assigned_to_user_id, assigned_by_user_id, department, due_date, notes)
      VALUES ($1, $2, $2, 'Mantenimiento', NOW() + INTERVAL '3 days', 'Asignación inicial para evaluación técnica')
    `, [incidentId, adminId]);

    // Insertar comentarios de ejemplo
    await pool.query(`
      INSERT INTO incident_comments (incident_id, user_id, comment_text, is_internal)
      VALUES 
      ($1, $2, 'Incidencia recibida y en proceso de evaluación técnica', true),
      ($1, $2, 'Se requiere inspección presencial para determinar alcance del trabajo', true)
    `, [incidentId, adminId]);

    // Insertar historial de ejemplo
    await pool.query(`
      INSERT INTO incident_history (incident_id, user_id, action_type, old_value, new_value, field_name, notes)
      VALUES 
      ($1, $2, 'status_change', 'pending', 'assigned', 'status', 'Incidencia asignada al departamento de mantenimiento'),
      ($1, $2, 'assignment', null, 'Mantenimiento', 'department', 'Asignada a equipo técnico')
    `, [incidentId, adminId]);

    // Actualizar la incidencia existente con nueva información
    await pool.query(`
      UPDATE incidents 
      SET 
        status = 'assigned',
        priority = 'normal',
        assigned_to_user_id = $1,
        estimated_hours = 4.0,
        cost_estimate = 2500.00,
        due_date = NOW() + INTERVAL '3 days'
      WHERE id = $2
    `, [adminId, incidentId]);

    console.log("✅ Datos de ejemplo insertados correctamente");
    
  } catch (error) {
    console.error("❌ Error insertando datos de ejemplo:", error);
  }
}

// Ejecutar creación de tablas si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createIncidentWorkflowTables()
    .then(() => {
      console.log("🎉 Proceso completado");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Error en el proceso:", error);
      process.exit(1);
    });
}