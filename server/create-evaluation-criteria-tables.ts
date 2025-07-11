import { pool } from './db';

export async function createEvaluationCriteriaTables() {
  try {
    console.log('📋 Creando tablas para criterios de evaluación configurables...');
    
    // Crear tabla de criterios de evaluación
    await pool.query(`
      CREATE TABLE IF NOT EXISTS evaluation_criteria (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        label VARCHAR(255) NOT NULL,
        description TEXT,
        field_type VARCHAR(50) NOT NULL DEFAULT 'rating',
        min_value INTEGER DEFAULT 1,
        max_value INTEGER DEFAULT 5,
        is_required BOOLEAN DEFAULT TRUE,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        icon VARCHAR(50),
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Crear tabla de respuestas de evaluación flexibles
    await pool.query(`
      CREATE TABLE IF NOT EXISTS evaluation_responses (
        id SERIAL PRIMARY KEY,
        evaluation_id INTEGER NOT NULL REFERENCES park_evaluations(id) ON DELETE CASCADE,
        criteria_id INTEGER NOT NULL REFERENCES evaluation_criteria(id) ON DELETE CASCADE,
        rating_value INTEGER,
        text_value TEXT,
        boolean_value BOOLEAN,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(evaluation_id, criteria_id)
      );
    `);

    // Crear índices para optimizar consultas
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_evaluation_criteria_active 
      ON evaluation_criteria(is_active, sort_order);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_evaluation_responses_evaluation 
      ON evaluation_responses(evaluation_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_evaluation_responses_criteria 
      ON evaluation_responses(criteria_id);
    `);

    console.log('✅ Tablas de criterios de evaluación creadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error creando tablas de criterios de evaluación:', error);
    throw error;
  }
}

export async function seedDefaultEvaluationCriteria() {
  try {
    // Verificar si ya existen criterios
    const { rows: existingCriteria } = await pool.query(
      'SELECT COUNT(*) FROM evaluation_criteria'
    );
    
    if (parseInt(existingCriteria[0].count) === 0) {
      console.log('🌱 Creando criterios de evaluación por defecto...');
      
      const defaultCriteria = [
        {
          name: 'cleanliness',
          label: 'Limpieza',
          description: 'Estado de limpieza general del parque',
          fieldType: 'rating',
          minValue: 1,
          maxValue: 5,
          isRequired: true,
          isActive: true,
          sortOrder: 1,
          icon: 'Sparkles',
          category: 'infraestructura'
        },
        {
          name: 'safety',
          label: 'Seguridad',
          description: 'Percepción de seguridad en el parque',
          fieldType: 'rating',
          minValue: 1,
          maxValue: 5,
          isRequired: true,
          isActive: true,
          sortOrder: 2,
          icon: 'Shield',
          category: 'seguridad'
        },
        {
          name: 'maintenance',
          label: 'Mantenimiento',
          description: 'Estado de mantenimiento de instalaciones',
          fieldType: 'rating',
          minValue: 1,
          maxValue: 5,
          isRequired: true,
          isActive: true,
          sortOrder: 3,
          icon: 'Wrench',
          category: 'infraestructura'
        },
        {
          name: 'accessibility',
          label: 'Accesibilidad',
          description: 'Facilidad de acceso para personas con discapacidad',
          fieldType: 'rating',
          minValue: 1,
          maxValue: 5,
          isRequired: true,
          isActive: true,
          sortOrder: 4,
          icon: 'Accessibility',
          category: 'accesibilidad'
        },
        {
          name: 'amenities',
          label: 'Amenidades',
          description: 'Calidad y variedad de amenidades disponibles',
          fieldType: 'rating',
          minValue: 1,
          maxValue: 5,
          isRequired: true,
          isActive: true,
          sortOrder: 5,
          icon: 'MapPin',
          category: 'servicios'
        },
        {
          name: 'activities',
          label: 'Actividades',
          description: 'Calidad y variedad de actividades ofrecidas',
          fieldType: 'rating',
          minValue: 1,
          maxValue: 5,
          isRequired: true,
          isActive: true,
          sortOrder: 6,
          icon: 'Calendar',
          category: 'servicios'
        },
        {
          name: 'staff',
          label: 'Personal',
          description: 'Calidad de atención del personal del parque',
          fieldType: 'rating',
          minValue: 1,
          maxValue: 5,
          isRequired: true,
          isActive: true,
          sortOrder: 7,
          icon: 'Users',
          category: 'servicios'
        },
        {
          name: 'naturalBeauty',
          label: 'Belleza Natural',
          description: 'Atractivo natural y paisajístico del parque',
          fieldType: 'rating',
          minValue: 1,
          maxValue: 5,
          isRequired: true,
          isActive: true,
          sortOrder: 8,
          icon: 'Leaf',
          category: 'ambiente'
        }
      ];

      for (const criteria of defaultCriteria) {
        await pool.query(`
          INSERT INTO evaluation_criteria 
          (name, label, description, field_type, min_value, max_value, is_required, is_active, sort_order, icon, category)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          criteria.name,
          criteria.label,
          criteria.description,
          criteria.fieldType,
          criteria.minValue,
          criteria.maxValue,
          criteria.isRequired,
          criteria.isActive,
          criteria.sortOrder,
          criteria.icon,
          criteria.category
        ]);
      }

      console.log('✅ Criterios de evaluación por defecto creados exitosamente');
    } else {
      console.log('📋 Criterios de evaluación ya existen');
    }
  } catch (error) {
    console.error('❌ Error creando criterios por defecto:', error);
    throw error;
  }
}