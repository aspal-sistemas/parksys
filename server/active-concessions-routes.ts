import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/active-concessions';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `concession-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB límite
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image') {
      // Solo imágenes para el campo 'image'
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)'));
      }
    } else if (file.fieldname === 'document') {
      // Documentos para el campo 'document'
      const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten documentos PDF o Word'));
      }
    } else {
      cb(new Error('Campo de archivo no válido'));
    }
  }
});

/**
 * Registra todas las rutas para el módulo de Concesiones Activas (versión simplificada)
 */
export function registerActiveConcessionRoutes(app: any, apiRouter: any, isAuthenticated: any) {
  
  // ========== RUTAS PRINCIPALES ==========
  
  // Obtener todas las concesiones activas con información relacionada
  apiRouter.get('/active-concessions', async (req: Request, res: Response) => {
    try {
      const { pool } = await import('./db');
      
      const result = await pool.query(`
        SELECT 
          ac.*,
          ct.name as "concessionTypeName",
          ct.description as "concessionTypeDescription",
          ct.impact_level as "impactLevel",
          u.username as "concessionaireUsername",
          u.full_name as "concessionaireName",
          u.email as "concessionaireEmail",
          u.phone as "concessionairePhone",
          p.name as "parkName",
          p.address as "parkLocation",
          0 as "imageCount",
          null as "primaryImage"
        FROM active_concessions ac
        LEFT JOIN concession_types ct ON ac.concession_type_id = ct.id
        LEFT JOIN users u ON ac.concessionaire_id = u.id
        LEFT JOIN parks p ON ac.park_id = p.id
        ORDER BY ac.created_at DESC
      `);
      
      res.json({
        status: 'success',
        data: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      console.error('Error al obtener concesiones activas:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener concesiones activas'
      });
    }
  });

  // Obtener una concesión activa específica
  apiRouter.get('/active-concessions/:id', async (req: Request, res: Response) => {
    try {
      const { pool } = await import('./db');
      const concessionId = parseInt(req.params.id);

      const concessionResult = await pool.query(`
        SELECT 
          ac.*,
          ct.name as "concessionTypeName",
          ct.description as "concessionTypeDescription",
          ct.impact_level as "impactLevel",
          u.username as "concessionaireUsername",
          u.full_name as "concessionaireName",
          u.email as "concessionaireEmail",
          u.phone as "concessionairePhone",
          p.name as "parkName",
          p.address as "parkLocation"
        FROM active_concessions ac
        LEFT JOIN concession_types ct ON ac.concession_type_id = ct.id
        LEFT JOIN users u ON ac.concessionaire_id = u.id
        LEFT JOIN parks p ON ac.park_id = p.id
        WHERE ac.id = $1
      `, [concessionId]);

      if (concessionResult.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Concesión no encontrada'
        });
      }
      
      const concession = concessionResult.rows[0];
      concession.images = [];
      concession.documents = [];

      res.json({
        status: 'success',
        data: concession
      });
    } catch (error) {
      console.error('Error al obtener concesión activa:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener concesión activa'
      });
    }
  });

  // Crear una nueva concesión activa
  apiRouter.post('/active-concessions', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { pool } = await import('./db');
      
      const concessionData = {
        name: req.body.name,
        description: req.body.description,
        concession_type_id: req.body.concessionTypeId,
        concessionaire_id: req.body.concessionaireId,
        park_id: req.body.parkId,
        specific_location: req.body.specificLocation,
        start_date: req.body.startDate,
        end_date: req.body.endDate,
        status: req.body.status || 'pending',
        priority: req.body.priority || 'medium',
        operating_hours: req.body.operatingHours,
        operating_days: req.body.operatingDays,
        monthly_payment: req.body.monthlyPayment,
        emergency_contact: req.body.emergencyContact,
        emergency_phone: req.body.emergencyPhone,
        terms_conditions: req.body.termsConditions,
        financial_guarantees: req.body.financialGuarantees,
        insurance_policy: req.body.insurancePolicy,
        created_at: new Date(),
        updated_at: new Date()
      };

      const result = await pool.query(`
        INSERT INTO active_concessions (
          name, description, concession_type_id, concessionaire_id, park_id, 
          specific_location, start_date, end_date, status, priority, 
          operating_hours, operating_days, monthly_payment, emergency_contact, 
          emergency_phone, terms_conditions, financial_guarantees, insurance_policy,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        ) RETURNING *
      `, [
        concessionData.name, concessionData.description, concessionData.concession_type_id,
        concessionData.concessionaire_id, concessionData.park_id, concessionData.specific_location,
        concessionData.start_date, concessionData.end_date, concessionData.status,
        concessionData.priority, concessionData.operating_hours, concessionData.operating_days,
        concessionData.monthly_payment, concessionData.emergency_contact, concessionData.emergency_phone,
        concessionData.terms_conditions, concessionData.financial_guarantees, concessionData.insurance_policy,
        concessionData.created_at, concessionData.updated_at
      ]);

      res.status(201).json({
        status: 'success',
        message: 'Concesión activa creada exitosamente',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error al crear concesión activa:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al crear concesión activa'
      });
    }
  });

  // Actualizar una concesión activa
  apiRouter.put('/active-concessions/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { pool } = await import('./db');
      const concessionId = parseInt(req.params.id);

      const updateData = {
        name: req.body.name,
        description: req.body.description,
        concession_type_id: req.body.concessionTypeId,
        concessionaire_id: req.body.concessionaireId,
        park_id: req.body.parkId,
        specific_location: req.body.specificLocation,
        start_date: req.body.startDate,
        end_date: req.body.endDate,
        status: req.body.status,
        priority: req.body.priority,
        operating_hours: req.body.operatingHours,
        operating_days: req.body.operatingDays,
        monthly_payment: req.body.monthlyPayment,
        emergency_contact: req.body.emergencyContact,
        emergency_phone: req.body.emergencyPhone,
        terms_conditions: req.body.termsConditions,
        financial_guarantees: req.body.financialGuarantees,
        insurance_policy: req.body.insurancePolicy,
        updated_at: new Date()
      };

      const result = await pool.query(`
        UPDATE active_concessions SET
          name = $1, description = $2, concession_type_id = $3, concessionaire_id = $4,
          park_id = $5, specific_location = $6, start_date = $7, end_date = $8,
          status = $9, priority = $10, operating_hours = $11, operating_days = $12,
          monthly_payment = $13, emergency_contact = $14, emergency_phone = $15,
          terms_conditions = $16, financial_guarantees = $17, insurance_policy = $18,
          updated_at = $19
        WHERE id = $20
        RETURNING *
      `, [
        updateData.name, updateData.description, updateData.concession_type_id,
        updateData.concessionaire_id, updateData.park_id, updateData.specific_location,
        updateData.start_date, updateData.end_date, updateData.status,
        updateData.priority, updateData.operating_hours, updateData.operating_days,
        updateData.monthly_payment, updateData.emergency_contact, updateData.emergency_phone,
        updateData.terms_conditions, updateData.financial_guarantees, updateData.insurance_policy,
        updateData.updated_at, concessionId
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Concesión no encontrada'
        });
      }

      res.json({
        status: 'success',
        message: 'Concesión activa actualizada exitosamente',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error al actualizar concesión activa:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al actualizar concesión activa'
      });
    }
  });

  // Eliminar una concesión activa
  apiRouter.delete('/active-concessions/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { pool } = await import('./db');
      const concessionId = parseInt(req.params.id);

      const result = await pool.query('DELETE FROM active_concessions WHERE id = $1 RETURNING *', [concessionId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Concesión no encontrada'
        });
      }

      res.json({
        status: 'success',
        message: 'Concesión activa eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar concesión activa:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al eliminar concesión activa'
      });
    }
  });

  // ========== RUTAS DE DATOS RELACIONADOS ==========
  
  // Obtener concesionarios (usuarios con rol 'concesionario')
  apiRouter.get('/concessionaires', async (req: Request, res: Response) => {
    try {
      const { pool } = await import('./db');
      
      const result = await pool.query(`
        SELECT id, username, full_name, email, phone, created_at
        FROM users 
        WHERE role = 'concesionario'
        ORDER BY full_name ASC
      `);

      res.json({
        status: 'success',
        data: result.rows
      });
    } catch (error) {
      console.error('Error al obtener concesionarios:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener concesionarios'
      });
    }
  });

  // Obtener tipos de concesión disponibles
  apiRouter.get('/concession-types-active', async (req: Request, res: Response) => {
    try {
      const { pool } = await import('./db');
      
      const result = await pool.query(`
        SELECT id, name, description, impact_level, created_at
        FROM concession_types 
        ORDER BY name ASC
      `);

      res.json({
        status: 'success',
        data: result.rows
      });
    } catch (error) {
      console.error('Error al obtener tipos de concesión:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener tipos de concesión'
      });
    }
  });

  console.log('✅ Rutas de concesiones activas registradas exitosamente (versión simplificada)');
}