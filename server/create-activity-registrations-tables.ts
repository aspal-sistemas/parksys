import { pool } from "./db";

export async function createActivityRegistrationsTables() {
  try {
    console.log("🎯 Creando tablas de inscripciones de actividades...");

    // Crear tabla de inscripciones de actividades
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_registrations (
        id SERIAL PRIMARY KEY,
        activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
        participant_name VARCHAR(255) NOT NULL,
        participant_email VARCHAR(255) NOT NULL,
        participant_phone VARCHAR(20),
        age INTEGER,
        emergency_contact_name VARCHAR(255),
        emergency_phone VARCHAR(20),
        medical_conditions TEXT,
        dietary_restrictions TEXT,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_by INTEGER REFERENCES users(id),
        approved_at TIMESTAMP,
        rejection_reason TEXT,
        notes TEXT,
        accepts_terms BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear índices para mejorar el rendimiento
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_activity_registrations_activity_id 
      ON activity_registrations(activity_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_activity_registrations_status 
      ON activity_registrations(status);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_activity_registrations_email 
      ON activity_registrations(participant_email);
    `);

    console.log("✅ Tablas de inscripciones de actividades creadas exitosamente");

    // Crear algunos datos de muestra
    await seedSampleRegistrations();

  } catch (error) {
    console.error("❌ Error al crear tablas de inscripciones:", error);
  }
}

async function seedSampleRegistrations() {
  try {
    // Verificar si ya existen registros
    const existingResult = await pool.query(
      "SELECT COUNT(*) as count FROM activity_registrations"
    );
    
    if (parseInt(existingResult.rows[0].count) > 0) {
      console.log("📋 Las inscripciones de muestra ya existen, omitiendo...");
      return;
    }

    // Obtener algunas actividades existentes
    const activitiesResult = await pool.query(
      "SELECT id FROM activities WHERE registration_enabled = true LIMIT 5"
    );
    
    if (activitiesResult.rows.length === 0) {
      console.log("🚫 No hay actividades con inscripciones habilitadas para crear datos de muestra");
      return;
    }

    const activities = activitiesResult.rows;
    
    // Crear inscripciones de muestra
    const sampleRegistrations = [
      {
        activity_id: activities[0]?.id,
        participant_name: "María González",
        participant_email: "maria.gonzalez@email.com",
        participant_phone: "33-1234-5678",
        age: 28,
        emergency_contact_name: "Carlos González",
        emergency_phone: "33-8765-4321",
        status: "approved",
        approved_at: new Date()
      },
      {
        activity_id: activities[0]?.id,
        participant_name: "Juan Pérez",
        participant_email: "juan.perez@email.com",
        participant_phone: "33-2345-6789",
        age: 35,
        status: "pending"
      },
      {
        activity_id: activities[1]?.id || activities[0]?.id,
        participant_name: "Ana Rodríguez",
        participant_email: "ana.rodriguez@email.com",
        participant_phone: "33-3456-7890",
        age: 24,
        medical_conditions: "Alergia a los frutos secos",
        status: "approved",
        approved_at: new Date()
      },
      {
        activity_id: activities[1]?.id || activities[0]?.id,
        participant_name: "Luis Martínez",
        participant_email: "luis.martinez@email.com",
        age: 42,
        status: "rejected",
        rejection_reason: "Capacidad máxima alcanzada"
      },
      {
        activity_id: activities[2]?.id || activities[0]?.id,
        participant_name: "Carmen López",
        participant_email: "carmen.lopez@email.com",
        participant_phone: "33-4567-8901",
        age: 31,
        dietary_restrictions: "Vegetariana",
        status: "pending"
      },
      {
        activity_id: activities[2]?.id || activities[0]?.id,
        participant_name: "Roberto Silva",
        participant_email: "roberto.silva@email.com",
        participant_phone: "33-5678-9012",
        age: 29,
        emergency_contact_name: "Laura Silva",
        emergency_phone: "33-9876-5432",
        status: "approved",
        approved_at: new Date()
      }
    ];

    for (const registration of sampleRegistrations) {
      if (registration.activity_id) {
        await pool.query(`
          INSERT INTO activity_registrations (
            activity_id, participant_name, participant_email, participant_phone,
            age, emergency_contact_name, emergency_phone, medical_conditions,
            dietary_restrictions, status, approved_at, rejection_reason
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          registration.activity_id,
          registration.participant_name,
          registration.participant_email,
          registration.participant_phone,
          registration.age,
          registration.emergency_contact_name,
          registration.emergency_phone,
          registration.medical_conditions,
          registration.dietary_restrictions,
          registration.status,
          registration.approved_at,
          registration.rejection_reason
        ]);
      }
    }

    console.log("✅ Datos de muestra de inscripciones creados exitosamente");

  } catch (error) {
    console.error("❌ Error al crear datos de muestra de inscripciones:", error);
  }
}