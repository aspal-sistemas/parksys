import { Request, Response } from 'express';
import { Pool } from '@neondatabase/serverless';
import { db, pool } from './db';
import { parkEvaluations, parks, users } from '@shared/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { z } from 'zod';

// Esquemas de validación
const createEvaluationSchema = z.object({
  parkId: z.number(),
  evaluatorName: z.string().min(1, "El nombre es requerido"),
  evaluatorEmail: z.string().email().optional().or(z.literal("")).optional(),
  evaluatorPhone: z.string().optional().or(z.literal("")).optional(),
  evaluatorCity: z.string().optional().or(z.literal("")).optional(),
  evaluatorAge: z.number().min(13).max(120).optional(),
  isFrequentVisitor: z.boolean().optional().default(false),
  
  // Criterios de evaluación (1-5)
  cleanliness: z.number().min(1).max(5),
  safety: z.number().min(1).max(5),
  maintenance: z.number().min(1).max(5),
  accessibility: z.number().min(1).max(5),
  amenities: z.number().min(1).max(5),
  activities: z.number().min(1).max(5),
  staff: z.number().min(1).max(5),
  naturalBeauty: z.number().min(1).max(5),
  overallRating: z.number().min(1).max(5),
  
  // Información adicional
  comments: z.string().optional().or(z.literal("")).optional(),
  suggestions: z.string().optional().or(z.literal("")).optional(),
  wouldRecommend: z.boolean().optional().default(true),
  visitDate: z.string().optional().or(z.literal("")).optional(),
  visitPurpose: z.string().optional().or(z.literal("")).optional(),
  visitDuration: z.number().min(1).optional(),
});

const moderateEvaluationSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  moderationNotes: z.string().optional(),
});

// Función para obtener IP del cliente
function getClientIp(req: Request): string {
  return req.headers['x-forwarded-for'] as string || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         'unknown';
}

export function registerParkEvaluationRoutes(app: any, apiRouter: any, isAuthenticated: any) {
  console.log('📊 Registrando rutas del módulo de evaluaciones de parques...');

  // Crear tabla de evaluaciones si no existe
  apiRouter.post('/park-evaluations/init', async (req: Request, res: Response) => {
    try {
      console.log('🔧 Inicializando tabla de evaluaciones de parques...');
      
      // Crear tabla usando SQL directo
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS park_evaluations (
          id SERIAL PRIMARY KEY,
          park_id INTEGER NOT NULL REFERENCES parks(id),
          evaluator_name VARCHAR(255) NOT NULL,
          evaluator_email VARCHAR(255),
          evaluator_phone VARCHAR(20),
          evaluator_city VARCHAR(100),
          evaluator_age INTEGER,
          is_frequent_visitor BOOLEAN DEFAULT FALSE,
          
          cleanliness INTEGER NOT NULL CHECK (cleanliness >= 1 AND cleanliness <= 5),
          safety INTEGER NOT NULL CHECK (safety >= 1 AND safety <= 5),
          maintenance INTEGER NOT NULL CHECK (maintenance >= 1 AND maintenance <= 5),
          accessibility INTEGER NOT NULL CHECK (accessibility >= 1 AND accessibility <= 5),
          amenities INTEGER NOT NULL CHECK (amenities >= 1 AND amenities <= 5),
          activities INTEGER NOT NULL CHECK (activities >= 1 AND activities <= 5),
          staff INTEGER NOT NULL CHECK (staff >= 1 AND staff <= 5),
          natural_beauty INTEGER NOT NULL CHECK (natural_beauty >= 1 AND natural_beauty <= 5),
          overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
          
          comments TEXT,
          suggestions TEXT,
          would_recommend BOOLEAN DEFAULT TRUE,
          
          visit_date DATE,
          visit_purpose VARCHAR(100),
          visit_duration INTEGER,
          
          status VARCHAR(20) DEFAULT 'pending',
          moderated_by INTEGER REFERENCES users(id),
          moderated_at TIMESTAMP,
          moderation_notes TEXT,
          
          ip_address VARCHAR(45),
          user_agent TEXT,
          
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      console.log('✅ Tabla de evaluaciones creada exitosamente');
      res.json({ success: true, message: 'Tabla de evaluaciones inicializada' });
    } catch (error) {
      console.error('❌ Error inicializando tabla:', error);
      res.status(500).json({ error: 'Error al inicializar tabla' });
    }
  });

  // Obtener todas las evaluaciones (administrador)
  apiRouter.get('/park-evaluations', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { status, parkId, page = 1, limit = 10 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let baseQuery = `
        SELECT 
          pe.*,
          p.name as park_name,
          u.full_name as moderator_name
        FROM park_evaluations pe
        LEFT JOIN parks p ON pe.park_id = p.id
        LEFT JOIN users u ON pe.moderated_by = u.id
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (status) {
        baseQuery += ` AND pe.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (parkId) {
        baseQuery += ` AND pe.park_id = $${paramIndex}`;
        params.push(Number(parkId));
        paramIndex++;
      }

      baseQuery += ` ORDER BY pe.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(Number(limit), offset);

      const result = await pool.query(baseQuery, params);
      
      // Contar total para paginación
      let countQuery = `SELECT COUNT(*) as total FROM park_evaluations pe WHERE 1=1`;
      const countParams: any[] = [];
      let countParamIndex = 1;

      if (status) {
        countQuery += ` AND pe.status = $${countParamIndex}`;
        countParams.push(status);
        countParamIndex++;
      }

      if (parkId) {
        countQuery += ` AND pe.park_id = $${countParamIndex}`;
        countParams.push(Number(parkId));
      }

      const countResult = await pool.query(countQuery, countParams);
      const total = countResult.rows[0]?.total || 0;

      res.json({
        evaluations: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: Number(total),
          pages: Math.ceil(Number(total) / Number(limit))
        }
      });
    } catch (error) {
      console.error('❌ Error obteniendo evaluaciones:', error);
      res.status(500).json({ error: 'Error al obtener evaluaciones' });
    }
  });

  // Obtener evaluaciones por parque (público)
  apiRouter.get('/parks/:parkId/evaluations', async (req: Request, res: Response) => {
    try {
      const { parkId } = req.params;
      const { status = 'approved', page = 1, limit = 10 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const query = `
        SELECT 
          pe.*,
          p.name as park_name
        FROM park_evaluations pe
        LEFT JOIN parks p ON pe.park_id = p.id
        WHERE pe.park_id = $1 AND pe.status = $2
        ORDER BY pe.created_at DESC
        LIMIT $3 OFFSET $4
      `;

      const result = await pool.query(query, [Number(parkId), status, Number(limit), offset]);
      
      // Contar total
      const countQuery = `SELECT COUNT(*) as total FROM park_evaluations WHERE park_id = $1 AND status = $2`;
      const countResult = await pool.query(countQuery, [Number(parkId), status]);
      const total = countResult.rows[0]?.total || 0;

      res.json({
        evaluations: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: Number(total),
          pages: Math.ceil(Number(total) / Number(limit))
        }
      });
    } catch (error) {
      console.error('❌ Error obteniendo evaluaciones del parque:', error);
      res.status(500).json({ error: 'Error al obtener evaluaciones del parque' });
    }
  });

  // Obtener estadísticas de evaluaciones por parque
  apiRouter.get('/parks/:parkId/evaluation-stats', async (req: Request, res: Response) => {
    try {
      const { parkId } = req.params;

      const query = `
        SELECT 
          COUNT(*) as total_evaluations,
          AVG(overall_rating) as average_rating,
          AVG(cleanliness) as avg_cleanliness,
          AVG(safety) as avg_safety,
          AVG(maintenance) as avg_maintenance,
          AVG(accessibility) as avg_accessibility,
          AVG(amenities) as avg_amenities,
          AVG(activities) as avg_activities,
          AVG(staff) as avg_staff,
          AVG(natural_beauty) as avg_natural_beauty,
          COUNT(CASE WHEN would_recommend = true THEN 1 END) as recommendations,
          COUNT(CASE WHEN overall_rating = 5 THEN 1 END) as five_star_count,
          COUNT(CASE WHEN overall_rating = 4 THEN 1 END) as four_star_count,
          COUNT(CASE WHEN overall_rating = 3 THEN 1 END) as three_star_count,
          COUNT(CASE WHEN overall_rating = 2 THEN 1 END) as two_star_count,
          COUNT(CASE WHEN overall_rating = 1 THEN 1 END) as one_star_count
        FROM park_evaluations 
        WHERE park_id = $1 AND status = 'approved'
      `;

      const result = await pool.query(query, [Number(parkId)]);
      const stats = result.rows[0];

      if (stats) {
        // Calcular porcentaje de recomendación
        const recommendationRate = stats.total_evaluations > 0 
          ? (Number(stats.recommendations) / Number(stats.total_evaluations)) * 100 
          : 0;

        res.json({
          ...stats,
          recommendation_rate: Math.round(recommendationRate * 100) / 100,
          average_rating: stats.average_rating ? Math.round(Number(stats.average_rating) * 100) / 100 : 0,
          avg_cleanliness: stats.avg_cleanliness ? Math.round(Number(stats.avg_cleanliness) * 100) / 100 : 0,
          avg_safety: stats.avg_safety ? Math.round(Number(stats.avg_safety) * 100) / 100 : 0,
          avg_maintenance: stats.avg_maintenance ? Math.round(Number(stats.avg_maintenance) * 100) / 100 : 0,
          avg_accessibility: stats.avg_accessibility ? Math.round(Number(stats.avg_accessibility) * 100) / 100 : 0,
          avg_amenities: stats.avg_amenities ? Math.round(Number(stats.avg_amenities) * 100) / 100 : 0,
          avg_activities: stats.avg_activities ? Math.round(Number(stats.avg_activities) * 100) / 100 : 0,
          avg_staff: stats.avg_staff ? Math.round(Number(stats.avg_staff) * 100) / 100 : 0,
          avg_natural_beauty: stats.avg_natural_beauty ? Math.round(Number(stats.avg_natural_beauty) * 100) / 100 : 0,
        });
      } else {
        res.json({
          total_evaluations: 0,
          average_rating: 0,
          recommendation_rate: 0,
          avg_cleanliness: 0,
          avg_safety: 0,
          avg_maintenance: 0,
          avg_accessibility: 0,
          avg_amenities: 0,
          avg_activities: 0,
          avg_staff: 0,
          avg_natural_beauty: 0,
          five_star_count: 0,
          four_star_count: 0,
          three_star_count: 0,
          two_star_count: 0,
          one_star_count: 0,
        });
      }
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  });

  // Crear nueva evaluación (público)
  apiRouter.post('/park-evaluations', async (req: Request, res: Response) => {
    try {
      const validatedData = createEvaluationSchema.parse(req.body);
      
      // Agregar metadata
      const evaluationData = {
        ...validatedData,
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'] || 'unknown',
        status: 'pending' as const,
      };

      const query = `
        INSERT INTO park_evaluations (
          park_id, evaluator_name, evaluator_email, evaluator_phone, evaluator_city, 
          evaluator_age, is_frequent_visitor, cleanliness, safety, maintenance, 
          accessibility, amenities, activities, staff, natural_beauty, overall_rating,
          comments, suggestions, would_recommend, visit_date, visit_purpose, 
          visit_duration, status, ip_address, user_agent, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24, $25, NOW(), NOW()
        ) RETURNING *
      `;

      const result = await pool.query(query, [
        evaluationData.parkId,
        evaluationData.evaluatorName,
        evaluationData.evaluatorEmail || null,
        evaluationData.evaluatorPhone || null,
        evaluationData.evaluatorCity || null,
        evaluationData.evaluatorAge || null,
        evaluationData.isFrequentVisitor || false,
        evaluationData.cleanliness,
        evaluationData.safety,
        evaluationData.maintenance,
        evaluationData.accessibility,
        evaluationData.amenities,
        evaluationData.activities,
        evaluationData.staff,
        evaluationData.naturalBeauty,
        evaluationData.overallRating,
        evaluationData.comments || null,
        evaluationData.suggestions || null,
        evaluationData.wouldRecommend !== false,
        evaluationData.visitDate || null,
        evaluationData.visitPurpose || null,
        evaluationData.visitDuration || null,
        evaluationData.status,
        evaluationData.ipAddress,
        evaluationData.userAgent,
      ]);

      console.log('✅ Evaluación creada exitosamente:', result.rows[0]);
      res.status(201).json({ 
        success: true, 
        evaluation: result.rows[0],
        message: 'Evaluación enviada exitosamente. Será revisada antes de publicarse.' 
      });
    } catch (error) {
      console.error('❌ Error creando evaluación:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Datos inválidos', details: error.errors });
      } else {
        res.status(500).json({ error: 'Error al crear evaluación' });
      }
    }
  });

  // Moderar evaluación (administrador)
  apiRouter.patch('/park-evaluations/:id/moderate', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 1; // Fallback para desarrollo
      const validatedData = moderateEvaluationSchema.parse(req.body);

      const query = `
        UPDATE park_evaluations 
        SET status = $1, moderated_by = $2, moderated_at = NOW(), moderation_notes = $3, updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `;

      const result = await pool.query(query, [
        validatedData.status,
        userId,
        validatedData.moderationNotes || null,
        Number(id)
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Evaluación no encontrada' });
      }

      console.log('✅ Evaluación moderada exitosamente:', result.rows[0]);
      res.json({ 
        success: true, 
        evaluation: result.rows[0],
        message: 'Evaluación moderada exitosamente' 
      });
    } catch (error) {
      console.error('❌ Error moderando evaluación:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Datos inválidos', details: error.errors });
      } else {
        res.status(500).json({ error: 'Error al moderar evaluación' });
      }
    }
  });

  // Eliminar evaluación (administrador)
  apiRouter.delete('/park-evaluations/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const query = `DELETE FROM park_evaluations WHERE id = $1 RETURNING *`;
      const result = await pool.query(query, [Number(id)]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Evaluación no encontrada' });
      }

      console.log('✅ Evaluación eliminada exitosamente');
      res.json({ success: true, message: 'Evaluación eliminada exitosamente' });
    } catch (error) {
      console.error('❌ Error eliminando evaluación:', error);
      res.status(500).json({ error: 'Error al eliminar evaluación' });
    }
  });

  // Obtener resumen de evaluaciones de todos los parques
  apiRouter.get('/park-evaluations/summary', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const query = `
        SELECT 
          p.id as park_id,
          p.name as park_name,
          COUNT(pe.id) as total_evaluations,
          AVG(pe.overall_rating) as average_rating,
          COUNT(CASE WHEN pe.would_recommend = true THEN 1 END) as recommendations,
          COUNT(CASE WHEN pe.status = 'pending' THEN 1 END) as pending_evaluations
        FROM parks p
        LEFT JOIN park_evaluations pe ON p.id = pe.park_id
        GROUP BY p.id, p.name
        ORDER BY average_rating DESC NULLS LAST, total_evaluations DESC
      `;

      const result = await pool.query(query);
      
      const summary = result.rows.map(row => ({
        ...row,
        average_rating: row.average_rating ? Math.round(Number(row.average_rating) * 100) / 100 : 0,
        recommendation_rate: row.total_evaluations > 0 
          ? Math.round((Number(row.recommendations) / Number(row.total_evaluations)) * 100) 
          : 0,
      }));

      res.json({ parks: summary });
    } catch (error) {
      console.error('❌ Error obteniendo resumen:', error);
      res.status(500).json({ error: 'Error al obtener resumen' });
    }
  });

  console.log('✅ Rutas del módulo de evaluaciones de parques registradas correctamente');
}