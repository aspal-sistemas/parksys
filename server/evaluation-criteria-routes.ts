import { Router, Request, Response } from 'express';
import { pool } from './db';
import { z } from 'zod';
import { evaluationCriteria, insertEvaluationCriteriaSchema, type EvaluationCriteria } from '@shared/schema';

const router = Router();

// Crear criterios por defecto si no existen
export async function initializeDefaultCriteria() {
  try {
    // Verificar si ya existen criterios
    const { rows: existingCriteria } = await pool.query('SELECT COUNT(*) FROM evaluation_criteria');
    
    if (parseInt(existingCriteria[0].count) === 0) {
      console.log('🔧 Creando criterios de evaluación por defecto...');
      
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
    console.error('❌ Error inicializando criterios de evaluación:', error);
  }
}

// Registrar rutas de criterios de evaluación
export function registerEvaluationCriteriaRoutes(app: any, apiRouter: any, isAuthenticated: any) {
  console.log('📋 Registrando rutas de criterios de evaluación...');

  // Obtener todos los criterios activos (público - para formularios)
  apiRouter.get('/evaluation-criteria', async (req: Request, res: Response) => {
    try {
      const { rows } = await pool.query(`
        SELECT 
          id,
          name,
          label,
          description,
          field_type as "fieldType",
          min_value as "minValue",
          max_value as "maxValue",
          is_required as "isRequired",
          is_active as "isActive",
          sort_order as "sortOrder",
          icon,
          category,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM evaluation_criteria 
        WHERE is_active = true 
        ORDER BY sort_order ASC
      `);

      res.json(rows);
    } catch (error) {
      console.error('❌ Error obteniendo criterios:', error);
      res.status(500).json({ error: 'Error al obtener criterios de evaluación' });
    }
  });

  // Obtener todos los criterios (admin)
  apiRouter.get('/evaluation-criteria/admin', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { rows } = await pool.query(`
        SELECT 
          id,
          name,
          label,
          description,
          field_type as "fieldType",
          min_value as "minValue",
          max_value as "maxValue",
          is_required as "isRequired",
          is_active as "isActive",
          sort_order as "sortOrder",
          icon,
          category,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM evaluation_criteria 
        ORDER BY sort_order ASC
      `);

      res.json(rows);
    } catch (error) {
      console.error('❌ Error obteniendo criterios (admin):', error);
      res.status(500).json({ error: 'Error al obtener criterios de evaluación' });
    }
  });

  // Crear nuevo criterio
  apiRouter.post('/evaluation-criteria', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const validatedData = insertEvaluationCriteriaSchema.parse(req.body);
      
      const { rows } = await pool.query(`
        INSERT INTO evaluation_criteria 
        (name, label, description, field_type, min_value, max_value, is_required, is_active, sort_order, icon, category)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING 
          id,
          name,
          label,
          description,
          field_type as "fieldType",
          min_value as "minValue",
          max_value as "maxValue",
          is_required as "isRequired",
          is_active as "isActive",
          sort_order as "sortOrder",
          icon,
          category,
          created_at as "createdAt",
          updated_at as "updatedAt"
      `, [
        validatedData.name,
        validatedData.label,
        validatedData.description,
        validatedData.fieldType,
        validatedData.minValue,
        validatedData.maxValue,
        validatedData.isRequired,
        validatedData.isActive,
        validatedData.sortOrder,
        validatedData.icon,
        validatedData.category
      ]);

      res.status(201).json(rows[0]);
    } catch (error) {
      console.error('❌ Error creando criterio:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Datos inválidos', details: error.errors });
      } else {
        res.status(500).json({ error: 'Error al crear criterio de evaluación' });
      }
    }
  });

  // Actualizar criterio
  apiRouter.put('/evaluation-criteria/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = insertEvaluationCriteriaSchema.parse(req.body);
      
      const { rows } = await pool.query(`
        UPDATE evaluation_criteria 
        SET 
          name = $1,
          label = $2,
          description = $3,
          field_type = $4,
          min_value = $5,
          max_value = $6,
          is_required = $7,
          is_active = $8,
          sort_order = $9,
          icon = $10,
          category = $11,
          updated_at = NOW()
        WHERE id = $12
        RETURNING 
          id,
          name,
          label,
          description,
          field_type as "fieldType",
          min_value as "minValue",
          max_value as "maxValue",
          is_required as "isRequired",
          is_active as "isActive",
          sort_order as "sortOrder",
          icon,
          category,
          created_at as "createdAt",
          updated_at as "updatedAt"
      `, [
        validatedData.name,
        validatedData.label,
        validatedData.description,
        validatedData.fieldType,
        validatedData.minValue,
        validatedData.maxValue,
        validatedData.isRequired,
        validatedData.isActive,
        validatedData.sortOrder,
        validatedData.icon,
        validatedData.category,
        id
      ]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Criterio no encontrado' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error('❌ Error actualizando criterio:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Datos inválidos', details: error.errors });
      } else {
        res.status(500).json({ error: 'Error al actualizar criterio de evaluación' });
      }
    }
  });

  // Eliminar criterio
  apiRouter.delete('/evaluation-criteria/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Verificar si el criterio está siendo usado
      const { rows: usageCheck } = await pool.query(`
        SELECT COUNT(*) FROM evaluation_responses WHERE criteria_id = $1
      `, [id]);

      if (parseInt(usageCheck[0].count) > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar este criterio porque está siendo usado en evaluaciones existentes' 
        });
      }

      const { rows } = await pool.query(`
        DELETE FROM evaluation_criteria WHERE id = $1 RETURNING id
      `, [id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Criterio no encontrado' });
      }

      res.json({ message: 'Criterio eliminado exitosamente' });
    } catch (error) {
      console.error('❌ Error eliminando criterio:', error);
      res.status(500).json({ error: 'Error al eliminar criterio de evaluación' });
    }
  });

  // Reordenar criterios
  apiRouter.put('/evaluation-criteria/reorder', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { criteriaIds } = req.body as { criteriaIds: number[] };
      
      if (!Array.isArray(criteriaIds)) {
        return res.status(400).json({ error: 'criteriaIds debe ser un array' });
      }

      // Actualizar el orden de los criterios
      for (let i = 0; i < criteriaIds.length; i++) {
        await pool.query(`
          UPDATE evaluation_criteria 
          SET sort_order = $1, updated_at = NOW() 
          WHERE id = $2
        `, [i + 1, criteriaIds[i]]);
      }

      res.json({ message: 'Orden actualizado exitosamente' });
    } catch (error) {
      console.error('❌ Error reordenando criterios:', error);
      res.status(500).json({ error: 'Error al reordenar criterios' });
    }
  });

  console.log('✅ Rutas de criterios de evaluación registradas correctamente');
}

export default router;