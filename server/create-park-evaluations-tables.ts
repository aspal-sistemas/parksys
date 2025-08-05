import { pool } from './db';

export async function createParkEvaluationsTables() {
  try {
    console.log('🏛️ Creando tablas de evaluaciones de parques...');
    
    // Crear tabla de evaluaciones
    await pool.query(`
      CREATE TABLE IF NOT EXISTS park_evaluations (
        id SERIAL PRIMARY KEY,
        park_id INTEGER NOT NULL REFERENCES parks(id),
        
        -- Información del evaluador
        evaluator_name VARCHAR(255) NOT NULL,
        evaluator_email VARCHAR(255),
        evaluator_phone VARCHAR(20),
        evaluator_city VARCHAR(100),
        evaluator_age INTEGER,
        is_frequent_visitor BOOLEAN DEFAULT FALSE,
        
        -- Criterios de evaluación (1-5 estrellas)
        cleanliness INTEGER NOT NULL,
        safety INTEGER NOT NULL,
        maintenance INTEGER NOT NULL,
        accessibility INTEGER NOT NULL,
        amenities INTEGER NOT NULL,
        activities INTEGER NOT NULL,
        staff INTEGER NOT NULL,
        natural_beauty INTEGER NOT NULL,
        
        -- Calificación general
        overall_rating INTEGER NOT NULL,
        
        -- Comentarios y sugerencias
        comments TEXT,
        suggestions TEXT,
        would_recommend BOOLEAN DEFAULT TRUE,
        
        -- Información adicional
        visit_date DATE,
        visit_purpose VARCHAR(100),
        visit_duration INTEGER,
        
        -- Moderación
        status VARCHAR(20) DEFAULT 'pending',
        moderated_by INTEGER REFERENCES users(id),
        moderated_at TIMESTAMP,
        moderation_notes TEXT,
        
        -- Metadata
        ip_address VARCHAR(45),
        user_agent TEXT,
        
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ Tabla park_evaluations creada exitosamente');
    
    // Crear algunos datos de ejemplo
    await pool.query(`
      INSERT INTO park_evaluations (
        park_id, evaluator_name, evaluator_email, evaluator_city, evaluator_age,
        cleanliness, safety, maintenance, accessibility, amenities, activities, staff, natural_beauty,
        overall_rating, comments, suggestions, would_recommend, visit_date, visit_purpose,
        status, created_at
      ) VALUES 
      (5, 'María González', 'maria.gonzalez@gmail.com', 'Guadalajara', 28,
       5, 4, 5, 4, 5, 4, 5, 5,
       5, 'Excelente parque para caminar y relajarse. Muy limpio y bien mantenido.',
       'Sería genial tener más bancas en las áreas con sombra.', TRUE,
       '2025-07-10', 'recreation', 'approved', NOW() - INTERVAL '2 days'),
       
      (5, 'Carlos Mendoza', 'carlos.mendoza@hotmail.com', 'Zapopan', 35,
       4, 5, 4, 3, 4, 5, 4, 5,
       4, 'Muy buen parque, especialmente para hacer ejercicio. Las instalaciones están bien.',
       'Mejorar la accesibilidad en algunas áreas del parque.', TRUE,
       '2025-07-09', 'exercise', 'approved', NOW() - INTERVAL '1 day'),
       
      (5, 'Ana Ruiz', 'ana.ruiz@yahoo.com', 'Tlaquepaque', 42,
       5, 4, 5, 5, 4, 3, 4, 5,
       4, 'Perfecto para venir en familia. Los niños lo disfrutan mucho.',
       'Más actividades para niños estarían genial.', TRUE,
       '2025-07-08', 'family', 'approved', NOW() - INTERVAL '3 days'),
       
      (2, 'Roberto Silva', 'roberto.silva@gmail.com', 'Guadalajara', 31,
       4, 4, 3, 4, 4, 4, 4, 4,
       4, 'Buen parque urbano, aunque necesita un poco más de mantenimiento.',
       'Revisar el estado de algunos juegos infantiles.', TRUE,
       '2025-07-07', 'recreation', 'approved', NOW() - INTERVAL '4 days'),
       
      (4, 'Elena Morales', 'elena.morales@hotmail.com', 'Guadalajara', 29,
       5, 5, 4, 4, 5, 4, 5, 4,
       5, 'Uno de mis parques favoritos en la ciudad. Muy seguro y limpio.',
       'Sería bueno tener más eventos culturales.', TRUE,
       '2025-07-06', 'exercise', 'approved', NOW() - INTERVAL '5 days')
      ON CONFLICT DO NOTHING
    `);
    
    console.log('✅ Datos de ejemplo agregados a park_evaluations');
    
    return true;
  } catch (error) {
    console.error('❌ Error creando tablas de evaluaciones:', error);
    return false;
  }
}