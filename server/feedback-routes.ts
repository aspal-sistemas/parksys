import { Router, Request, Response } from "express";
import { pool } from "./db";
import { z } from "zod";

const router = Router();

// Esquema de validación para crear retroalimentación
const createFeedbackSchema = z.object({
  parkId: z.number(),
  formType: z.enum(['share', 'report_problem', 'suggest_improvement', 'propose_event']),
  fullName: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(1, "El mensaje es requerido"),
  category: z.string().optional(),
  priority: z.string().optional(),
  eventType: z.string().optional(),
  suggestedDate: z.string().optional(),
  expectedAttendance: z.number().optional(),
  socialMedia: z.string().optional(),
});

// POST /api/feedback - Crear nueva retroalimentación
router.post("/", async (req: Request, res: Response) => {
  try {
    const validatedData = createFeedbackSchema.parse(req.body);
    
    const insertQuery = `
      INSERT INTO park_feedback (
        park_id, form_type, full_name, email, phone, subject, message,
        category, priority, event_type, suggested_date, expected_attendance,
        social_media, status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending', NOW(), NOW()
      ) RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      validatedData.parkId,
      validatedData.formType,
      validatedData.fullName,
      validatedData.email,
      validatedData.phone || null,
      validatedData.subject || null,
      validatedData.message,
      validatedData.category || null,
      validatedData.priority || null,
      validatedData.eventType || null,
      validatedData.suggestedDate || null,
      validatedData.expectedAttendance || null,
      validatedData.socialMedia || null,
    ]);

    console.log(`✅ Nueva retroalimentación creada: ${validatedData.formType} para parque ${validatedData.parkId}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al crear retroalimentación:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /api/feedback - Obtener todas las retroalimentaciones con filtros
router.get("/", async (req: Request, res: Response) => {
  try {
    const { 
      parkId, 
      formType, 
      status, 
      page = '1', 
      limit = '10',
      search = ''
    } = req.query;

    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    // Filtro por parque
    if (parkId && parkId !== 'all') {
      whereConditions.push(`pf.park_id = $${paramIndex}`);
      queryParams.push(parseInt(parkId as string));
      paramIndex++;
    }

    // Filtro por tipo de formulario
    if (formType && formType !== 'all') {
      whereConditions.push(`pf.form_type = $${paramIndex}`);
      queryParams.push(formType);
      paramIndex++;
    }

    // Filtro por estado
    if (status && status !== 'all') {
      whereConditions.push(`pf.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    // Búsqueda por texto
    if (search) {
      whereConditions.push(`(
        pf.full_name ILIKE $${paramIndex} OR 
        pf.email ILIKE $${paramIndex} OR 
        pf.subject ILIKE $${paramIndex} OR 
        pf.message ILIKE $${paramIndex} OR
        p.name ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Consulta principal con JOIN a parques y usuarios
    const query = `
      SELECT 
        pf.*,
        p.name as park_name,
        p.slug as park_slug,
        u.full_name as assigned_user_name
      FROM park_feedback pf
      LEFT JOIN parks p ON pf.park_id = p.id
      LEFT JOIN users u ON pf.assigned_to = u.id
      ${whereClause}
      ORDER BY pf.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    queryParams.push(limitNum, (pageNum - 1) * limitNum);

    const result = await pool.query(query, queryParams);

    // Consulta para contar el total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM park_feedback pf
      LEFT JOIN parks p ON pf.park_id = p.id
      ${whereClause}
    `;
    
    const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    res.json({
      feedback: result.rows.map(row => ({
        id: row.id,
        parkId: row.park_id,
        parkName: row.park_name,
        parkSlug: row.park_slug,
        formType: row.form_type,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone,
        subject: row.subject,
        message: row.message,
        category: row.category,
        priority: row.priority,
        eventType: row.event_type,
        suggestedDate: row.suggested_date,
        expectedAttendance: row.expected_attendance,
        socialMedia: row.social_media,
        status: row.status,
        tags: row.tags,
        adminNotes: row.admin_notes,
        assignedTo: row.assigned_to,
        assignedUserName: row.assigned_user_name,
        resolvedAt: row.resolved_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      }
    });
  } catch (error) {
    console.error("❌ Error al obtener retroalimentación:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// PUT /api/feedback/:id - Actualizar retroalimentación (para admin)
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, assignedTo, tags } = req.body;

    const updateQuery = `
      UPDATE park_feedback 
      SET 
        status = COALESCE($1, status),
        admin_notes = COALESCE($2, admin_notes),
        assigned_to = COALESCE($3, assigned_to),
        tags = COALESCE($4, tags),
        resolved_at = CASE WHEN $1 = 'resolved' THEN NOW() ELSE resolved_at END,
        updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [
      status || null,
      adminNotes || null,
      assignedTo || null,
      tags ? JSON.stringify(tags) : null,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Retroalimentación no encontrada" });
    }

    console.log(`✅ Retroalimentación ${id} actualizada`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al actualizar retroalimentación:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /api/feedback/stats - Obtener estadísticas de retroalimentación
router.get("/stats", async (req: Request, res: Response) => {
  try {
    // Estadísticas generales
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'reviewed' THEN 1 END) as reviewed,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed
      FROM park_feedback
    `;

    // Estadísticas por tipo de formulario
    const typeStatsQuery = `
      SELECT 
        form_type,
        COUNT(*) as count
      FROM park_feedback
      GROUP BY form_type
      ORDER BY count DESC
    `;

    // Estadísticas por parque
    const parkStatsQuery = `
      SELECT 
        p.name as park_name,
        COUNT(pf.*) as feedback_count
      FROM parks p
      LEFT JOIN park_feedback pf ON p.id = pf.park_id
      GROUP BY p.id, p.name
      HAVING COUNT(pf.*) > 0
      ORDER BY feedback_count DESC
      LIMIT 10
    `;

    const [statsResult, typeStatsResult, parkStatsResult] = await Promise.all([
      pool.query(statsQuery),
      pool.query(typeStatsQuery),
      pool.query(parkStatsQuery)
    ]);

    res.json({
      general: statsResult.rows[0],
      byType: typeStatsResult.rows,
      byPark: parkStatsResult.rows
    });
  } catch (error) {
    console.error("❌ Error al obtener estadísticas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;