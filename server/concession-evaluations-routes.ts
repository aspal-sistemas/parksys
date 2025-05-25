import { Request, Response, Router } from "express";
import multer from "multer";
import { db } from "./db";
import { sql } from "drizzle-orm";
import path from "path";
import fs from "fs";

// Función para obtener todas las evaluaciones
export async function getConcessionEvaluations(req: Request, res: Response) {
  try {
    const result = await db.execute(sql`
      SELECT ce.*, 
        cc.park_id,
        p.name as park_name,
        u.full_name as concessionaire_name,
        eval.full_name as evaluator_name
      FROM concession_evaluations ce
      LEFT JOIN concession_contracts cc ON ce.contract_id = cc.id
      LEFT JOIN parks p ON cc.park_id = p.id
      LEFT JOIN users u ON cc.concessionaire_id = u.id
      LEFT JOIN users eval ON ce.evaluator_id = eval.id
      ORDER BY ce.evaluation_date DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener evaluaciones de concesiones:", error);
    res.status(500).json({ message: "Error al obtener evaluaciones de concesiones" });
  }
}

// Función para obtener una evaluación por ID
export async function getConcessionEvaluationById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const result = await db.execute(sql`
      SELECT ce.*, 
        cc.park_id,
        p.name as park_name,
        u.full_name as concessionaire_name,
        eval.full_name as evaluator_name
      FROM concession_evaluations ce
      LEFT JOIN concession_contracts cc ON ce.contract_id = cc.id
      LEFT JOIN parks p ON cc.park_id = p.id
      LEFT JOIN users u ON cc.concessionaire_id = u.id
      LEFT JOIN users eval ON ce.evaluator_id = eval.id
      WHERE ce.id = ${id}
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Evaluación de concesión no encontrada" });
    }

    // Obtener archivos adjuntos si existen
    const attachmentsResult = await db.execute(sql`
      SELECT * FROM concession_evaluation_attachments
      WHERE evaluation_id = ${id}
    `);

    const evaluation = result.rows[0];
    evaluation.attachments = attachmentsResult.rows;

    res.json(evaluation);
  } catch (error) {
    console.error("Error al obtener evaluación de concesión:", error);
    res.status(500).json({ message: "Error al obtener evaluación de concesión" });
  }
}

// Función para crear una evaluación
export async function createConcessionEvaluation(req: Request, res: Response) {
  try {
    const {
      contractId,
      evaluationDate,
      sanitaryScore,
      operationalScore,
      technicalScore,
      customerSatisfactionScore,
      observations,
      hasIncidents,
      incidentDescription,
      actionRequired,
      actionDescription,
      status
    } = req.body;

    // Validar que existe el contrato
    const contractResult = await db.execute(sql`
      SELECT * FROM concession_contracts WHERE id = ${contractId}
    `);

    if (contractResult.rows.length === 0) {
      return res.status(404).json({ message: "Contrato de concesión no encontrado" });
    }

    // Obtener el ID del evaluador (usuario autenticado)
    const evaluatorId = req.headers['x-user-id'];

    // Convertir valores boolean desde strings
    const hasIncidentsBool = hasIncidents === 'true';
    const actionRequiredBool = actionRequired === 'true';

    // Crear la evaluación
    const result = await db.execute(sql`
      INSERT INTO concession_evaluations (
        contract_id, 
        evaluation_date, 
        sanitary_score, 
        operational_score, 
        technical_score, 
        customer_satisfaction_score, 
        observations,
        has_incidents,
        incident_description,
        action_required,
        action_description,
        status,
        evaluator_id,
        created_at,
        updated_at
      )
      VALUES (
        ${contractId}, 
        ${evaluationDate}, 
        ${sanitaryScore}, 
        ${operationalScore}, 
        ${technicalScore}, 
        ${customerSatisfactionScore}, 
        ${observations || null},
        ${hasIncidentsBool},
        ${incidentDescription || null},
        ${actionRequiredBool},
        ${actionDescription || null},
        ${status},
        ${evaluatorId || null},
        NOW(),
        NOW()
      )
      RETURNING *
    `);

    const evaluation = result.rows[0];

    // Procesar archivos adjuntos si existen
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const attachments = [];

      for (const file of files) {
        const attachmentResult = await db.execute(sql`
          INSERT INTO concession_evaluation_attachments (
            evaluation_id,
            filename,
            original_filename,
            file_path,
            file_type,
            file_size,
            created_at
          )
          VALUES (
            ${evaluation.id},
            ${file.filename},
            ${file.originalname},
            ${file.path},
            ${file.mimetype},
            ${file.size},
            NOW()
          )
          RETURNING *
        `);
        
        attachments.push(attachmentResult.rows[0]);
      }

      evaluation.attachments = attachments;
    }

    res.status(201).json(evaluation);
  } catch (error) {
    console.error("Error al crear evaluación de concesión:", error);
    res.status(500).json({ message: "Error al crear evaluación de concesión" });
  }
}

// Función para actualizar una evaluación
export async function updateConcessionEvaluation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      contractId,
      evaluationDate,
      sanitaryScore,
      operationalScore,
      technicalScore,
      customerSatisfactionScore,
      observations,
      hasIncidents,
      incidentDescription,
      actionRequired,
      actionDescription,
      status
    } = req.body;

    // Verificar que la evaluación existe
    const evaluationResult = await db.execute(sql`
      SELECT * FROM concession_evaluations WHERE id = ${id}
    `);

    if (evaluationResult.rows.length === 0) {
      return res.status(404).json({ message: "Evaluación de concesión no encontrada" });
    }

    // Convertir valores boolean desde strings
    const hasIncidentsBool = hasIncidents === 'true';
    const actionRequiredBool = actionRequired === 'true';

    // Actualizar la evaluación
    const result = await db.execute(sql`
      UPDATE concession_evaluations
      SET
        contract_id = ${contractId},
        evaluation_date = ${evaluationDate},
        sanitary_score = ${sanitaryScore},
        operational_score = ${operationalScore},
        technical_score = ${technicalScore},
        customer_satisfaction_score = ${customerSatisfactionScore},
        observations = ${observations || null},
        has_incidents = ${hasIncidentsBool},
        incident_description = ${incidentDescription || null},
        action_required = ${actionRequiredBool},
        action_description = ${actionDescription || null},
        status = ${status},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `);

    const evaluation = result.rows[0];

    // Procesar archivos adjuntos si existen
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const attachments = [];

      for (const file of files) {
        const attachmentResult = await db.execute(sql`
          INSERT INTO concession_evaluation_attachments (
            evaluation_id,
            filename,
            original_filename,
            file_path,
            file_type,
            file_size,
            created_at
          )
          VALUES (
            ${evaluation.id},
            ${file.filename},
            ${file.originalname},
            ${file.path},
            ${file.mimetype},
            ${file.size},
            NOW()
          )
          RETURNING *
        `);
        
        attachments.push(attachmentResult.rows[0]);
      }

      // Obtener todos los archivos adjuntos actualizados
      const allAttachmentsResult = await db.execute(sql`
        SELECT * FROM concession_evaluation_attachments
        WHERE evaluation_id = ${id}
      `);

      evaluation.attachments = allAttachmentsResult.rows;
    }

    res.json(evaluation);
  } catch (error) {
    console.error("Error al actualizar evaluación de concesión:", error);
    res.status(500).json({ message: "Error al actualizar evaluación de concesión" });
  }
}

// Función para eliminar una evaluación
export async function deleteConcessionEvaluation(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Verificar que la evaluación existe
    const evaluationResult = await db.execute(sql`
      SELECT * FROM concession_evaluations WHERE id = ${id}
    `);

    if (evaluationResult.rows.length === 0) {
      return res.status(404).json({ message: "Evaluación de concesión no encontrada" });
    }

    // Obtener los archivos adjuntos para eliminarlos
    const attachmentsResult = await db.execute(sql`
      SELECT * FROM concession_evaluation_attachments
      WHERE evaluation_id = ${id}
    `);

    // Eliminar archivos físicos
    for (const attachment of attachmentsResult.rows) {
      if (attachment.file_path) {
        try {
          fs.unlinkSync(attachment.file_path);
        } catch (err) {
          console.error(`Error al eliminar archivo adjunto: ${attachment.file_path}`, err);
        }
      }
    }

    // Eliminar registros de archivos adjuntos
    await db.execute(sql`
      DELETE FROM concession_evaluation_attachments
      WHERE evaluation_id = ${id}
    `);

    // Eliminar la evaluación
    await db.execute(sql`
      DELETE FROM concession_evaluations WHERE id = ${id}
    `);

    res.json({ message: "Evaluación de concesión eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar evaluación de concesión:", error);
    res.status(500).json({ message: "Error al eliminar evaluación de concesión" });
  }
}

// Configuración de rutas para el módulo de evaluaciones de concesiones
export function registerConcessionEvaluationRoutes(app: any, apiRouter: any, isAuthenticated: any) {
  console.log("Registrando rutas de evaluaciones de concesiones...");

  // Configuración para subida de archivos de evaluaciones
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "public/uploads/evaluations");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'eval-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ storage });

  // Registrar rutas
  apiRouter.get("/concession-evaluations", getConcessionEvaluations);
  apiRouter.get("/concession-evaluations/:id", getConcessionEvaluationById);
  apiRouter.post("/concession-evaluations", isAuthenticated, upload.array("attachment", 5), createConcessionEvaluation);
  apiRouter.put("/concession-evaluations/:id", isAuthenticated, upload.array("attachment", 5), updateConcessionEvaluation);
  apiRouter.delete("/concession-evaluations/:id", isAuthenticated, deleteConcessionEvaluation);

  // Obtener evaluaciones por contrato
  apiRouter.get("/concession-contracts/:contractId/evaluations", async (req: Request, res: Response) => {
    try {
      const { contractId } = req.params;
      
      const result = await db.execute(sql`
        SELECT ce.*, 
          cc.park_id,
          p.name as park_name,
          u.full_name as concessionaire_name,
          eval.full_name as evaluator_name
        FROM concession_evaluations ce
        LEFT JOIN concession_contracts cc ON ce.contract_id = cc.id
        LEFT JOIN parks p ON cc.park_id = p.id
        LEFT JOIN users u ON cc.concessionaire_id = u.id
        LEFT JOIN users eval ON ce.evaluator_id = eval.id
        WHERE ce.contract_id = ${contractId}
        ORDER BY ce.evaluation_date DESC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error("Error al obtener evaluaciones del contrato:", error);
      res.status(500).json({ message: "Error al obtener evaluaciones del contrato" });
    }
  });

  // Obtener archivos adjuntos de una evaluación
  apiRouter.get("/concession-evaluations/:id/attachments", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const result = await db.execute(sql`
        SELECT * FROM concession_evaluation_attachments
        WHERE evaluation_id = ${id}
      `);

      res.json(result.rows);
    } catch (error) {
      console.error("Error al obtener archivos adjuntos:", error);
      res.status(500).json({ message: "Error al obtener archivos adjuntos" });
    }
  });

  // Descargar un archivo adjunto
  apiRouter.get("/concession-evaluation-attachments/:attachmentId/download", async (req: Request, res: Response) => {
    try {
      const { attachmentId } = req.params;
      
      const result = await db.execute(sql`
        SELECT * FROM concession_evaluation_attachments
        WHERE id = ${attachmentId}
      `);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Archivo adjunto no encontrado" });
      }

      const attachment = result.rows[0];
      const filePath = attachment.file_path;

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Archivo físico no encontrado" });
      }

      res.download(filePath, attachment.original_filename);
    } catch (error) {
      console.error("Error al descargar archivo adjunto:", error);
      res.status(500).json({ message: "Error al descargar archivo adjunto" });
    }
  });

  // Eliminar un archivo adjunto específico
  apiRouter.delete("/concession-evaluation-attachments/:attachmentId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { attachmentId } = req.params;
      
      const result = await db.execute(sql`
        SELECT * FROM concession_evaluation_attachments
        WHERE id = ${attachmentId}
      `);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Archivo adjunto no encontrado" });
      }

      const attachment = result.rows[0];
      
      // Eliminar archivo físico
      if (attachment.file_path && fs.existsSync(attachment.file_path)) {
        fs.unlinkSync(attachment.file_path);
      }

      // Eliminar registro de base de datos
      await db.execute(sql`
        DELETE FROM concession_evaluation_attachments
        WHERE id = ${attachmentId}
      `);

      res.json({ message: "Archivo adjunto eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar archivo adjunto:", error);
      res.status(500).json({ message: "Error al eliminar archivo adjunto" });
    }
  });
}