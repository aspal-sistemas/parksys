import { Request, Response } from 'express';
import { eq, and, desc, asc } from 'drizzle-orm';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  activeConcessions, 
  activeConcessionImages, 
  activeConcessionDocuments,
  concessionTypes,
  users,
  parks,
  InsertActiveConcession,
  InsertActiveConcessionImage,
  InsertActiveConcessionDocument
} from '../shared/schema';

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'active-concessions');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `concession-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB límite
  fileFilter: (req, file, cb) => {
    // Permitir imágenes y documentos
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

/**
 * Registra todas las rutas para el módulo de Concesiones Activas
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
          (SELECT COUNT(*) FROM active_concession_images aci WHERE aci.concession_id = ac.id) as "imageCount",
          (SELECT image_url FROM active_concession_images aci WHERE aci.concession_id = ac.id AND aci.is_primary = true LIMIT 1) as "primaryImage"
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

  // Obtener una concesión activa específica con toda la información
  apiRouter.get('/active-concessions/:id', async (req: Request, res: Response) => {
    try {
      const { pool } = await import('./db');
      const concessionId = parseInt(req.params.id);
      
      // Datos principales de la concesión
      const concessionResult = await pool.query(`
        SELECT 
          ac.*,
          ct.name as "concessionTypeName",
          ct.description as "concessionTypeDescription",
          ct.technical_requirements as "technicalRequirements",
          ct.legal_requirements as "legalRequirements",
          ct.operating_rules as "operatingRules",
          ct.impact_level as "impactLevel",
          u.username as "concessionaireUsername",
          u.full_name as "concessionaireName",
          u.email as "concessionaireEmail",
          u.phone as "concessionairePhone",
          p.name as "parkName",
          p.address as "parkLocation",
          cb.username as "createdByUsername",
          mb.username as "lastModifiedByUsername"
        FROM active_concessions ac
        LEFT JOIN concession_types ct ON ac.concession_type_id = ct.id
        LEFT JOIN users u ON ac.concessionaire_id = u.id
        LEFT JOIN parks p ON ac.park_id = p.id
        LEFT JOIN users cb ON ac.created_by = cb.id
        LEFT JOIN users mb ON ac.last_modified_by = mb.id
        WHERE ac.id = $1
      `, [concessionId]);
      
      if (concessionResult.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Concesión no encontrada'
        });
      }
      
      // Imágenes de la concesión
      const imagesResult = await pool.query(`
        SELECT * FROM active_concession_images 
        WHERE concession_id = $1 
        ORDER BY is_primary DESC, display_order ASC, created_at ASC
      `, [concessionId]);
      
      // Documentos de la concesión
      const documentsResult = await pool.query(`
        SELECT * FROM active_concession_documents 
        WHERE concession_id = $1 
        ORDER BY is_required DESC, created_at DESC
      `, [concessionId]);
      
      const concession = concessionResult.rows[0];
      concession.images = imagesResult.rows;
      concession.documents = documentsResult.rows;
      
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

  // Crear nueva concesión activa
  apiRouter.post('/active-concessions', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { pool } = await import('./db');
      const userId = (req as any).userId;
      
      const concessionData: InsertActiveConcession = {
        ...req.body,
        createdBy: userId,
        lastModifiedBy: userId
      };
      
      const result = await pool.query(`
        INSERT INTO active_concessions (
          name, description, concession_type_id, concessionaire_id, park_id,
          specific_location, coordinates, area, start_date, end_date,
          operating_hours, operating_days, status, priority, specific_terms,
          special_requirements, contract_number, contract_file, permit_file,
          insurance_file, monthly_payment, revenue_percentage, deposit,
          emergency_contact, emergency_phone, notes, internal_notes,
          created_by, last_modified_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
        ) RETURNING *
      `, [
        concessionData.name,
        concessionData.description,
        concessionData.concessionTypeId,
        concessionData.concessionaireId,
        concessionData.parkId,
        concessionData.specificLocation,
        concessionData.coordinates,
        concessionData.area,
        concessionData.startDate,
        concessionData.endDate,
        concessionData.operatingHours,
        concessionData.operatingDays,
        concessionData.status,
        concessionData.priority,
        concessionData.specificTerms,
        concessionData.specialRequirements,
        concessionData.contractNumber,
        concessionData.contractFile,
        concessionData.permitFile,
        concessionData.insuranceFile,
        concessionData.monthlyPayment,
        concessionData.revenuePercentage,
        concessionData.deposit,
        concessionData.emergencyContact,
        concessionData.emergencyPhone,
        concessionData.notes,
        concessionData.internalNotes,
        userId,
        userId
      ]);
      
      res.status(201).json({
        status: 'success',
        data: result.rows[0],
        message: 'Concesión activa creada exitosamente'
      });
    } catch (error) {
      console.error('Error al crear concesión activa:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al crear concesión activa'
      });
    }
  });

  // Actualizar concesión activa
  apiRouter.put('/active-concessions/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { pool } = await import('./db');
      const concessionId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      const updateData = { ...req.body, lastModifiedBy: userId };
      
      // Construir query dinámico basado en campos enviados
      const fields = Object.keys(updateData).filter(key => key !== 'id');
      const setClause = fields.map((field, index) => {
        const dbField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
        return `${dbField} = $${index + 2}`;
      }).join(', ');
      
      const values = [concessionId, ...fields.map(field => updateData[field])];
      
      const result = await pool.query(`
        UPDATE active_concessions 
        SET ${setClause}, updated_at = NOW()
        WHERE id = $1 
        RETURNING *
      `, values);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Concesión no encontrada'
        });
      }
      
      res.json({
        status: 'success',
        data: result.rows[0],
        message: 'Concesión activa actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error al actualizar concesión activa:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al actualizar concesión activa'
      });
    }
  });

  // Eliminar concesión activa
  apiRouter.delete('/active-concessions/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { pool } = await import('./db');
      const concessionId = parseInt(req.params.id);
      
      // Verificar que la concesión existe
      const checkResult = await pool.query('SELECT id FROM active_concessions WHERE id = $1', [concessionId]);
      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Concesión no encontrada'
        });
      }
      
      // Eliminar concesión (las imágenes y documentos se eliminan por CASCADE)
      await pool.query('DELETE FROM active_concessions WHERE id = $1', [concessionId]);
      
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

  // ========== RUTAS DE IMÁGENES ==========
  
  // Subir imagen a concesión activa
  apiRouter.post('/active-concessions/:id/images', isAuthenticated, upload.single('image'), async (req: Request, res: Response) => {
    try {
      const { pool } = await import('./db');
      const concessionId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'No se proporcionó archivo de imagen'
        });
      }
      
      const imageUrl = `/uploads/active-concessions/${req.file.filename}`;
      const { title, description, imageType, isPrimary } = req.body;
      
      // Si es imagen principal, remover primary de las demás
      if (isPrimary === 'true') {
        await pool.query(
          'UPDATE active_concession_images SET is_primary = false WHERE concession_id = $1',
          [concessionId]
        );
      }
      
      const result = await pool.query(`
        INSERT INTO active_concession_images (
          concession_id, image_url, title, description, image_type, is_primary, uploaded_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
      `, [
        concessionId,
        imageUrl,
        title || '',
        description || '',
        imageType || 'general',
        isPrimary === 'true',
        userId
      ]);
      
      res.status(201).json({
        status: 'success',
        data: result.rows[0],
        message: 'Imagen subida exitosamente'
      });
    } catch (error) {
      console.error('Error al subir imagen:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al subir imagen'
      });
    }
  });

  // Obtener imágenes de una concesión
  apiRouter.get('/active-concessions/:id/images', async (req: Request, res: Response) => {
    try {
      const { pool } = await import('./db');
      const concessionId = parseInt(req.params.id);
      
      const result = await pool.query(`
        SELECT * FROM active_concession_images 
        WHERE concession_id = $1 
        ORDER BY is_primary DESC, display_order ASC, created_at ASC
      `, [concessionId]);
      
      res.json({
        status: 'success',
        data: result.rows
      });
    } catch (error) {
      console.error('Error al obtener imágenes:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener imágenes'
      });
    }
  });

  // Eliminar imagen
  apiRouter.delete('/active-concession-images/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { pool } = await import('./db');
      const imageId = parseInt(req.params.id);
      
      // Obtener información de la imagen antes de eliminar
      const imageResult = await pool.query('SELECT image_url FROM active_concession_images WHERE id = $1', [imageId]);
      
      if (imageResult.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Imagen no encontrada'
        });
      }
      
      // Eliminar archivo físico
      const imagePath = path.join(process.cwd(), 'public', imageResult.rows[0].image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      
      // Eliminar de base de datos
      await pool.query('DELETE FROM active_concession_images WHERE id = $1', [imageId]);
      
      res.json({
        status: 'success',
        message: 'Imagen eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al eliminar imagen'
      });
    }
  });

  // Establecer imagen como principal
  apiRouter.post('/active-concession-images/:id/set-primary', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { pool } = await import('./db');
      const imageId = parseInt(req.params.id);
      
      // Obtener concession_id de la imagen
      const imageResult = await pool.query('SELECT concession_id FROM active_concession_images WHERE id = $1', [imageId]);
      
      if (imageResult.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Imagen no encontrada'
        });
      }
      
      const concessionId = imageResult.rows[0].concession_id;
      
      // Remover primary de todas las imágenes de la concesión
      await pool.query('UPDATE active_concession_images SET is_primary = false WHERE concession_id = $1', [concessionId]);
      
      // Establecer como principal la imagen seleccionada
      await pool.query('UPDATE active_concession_images SET is_primary = true WHERE id = $1', [imageId]);
      
      res.json({
        status: 'success',
        message: 'Imagen establecida como principal'
      });
    } catch (error) {
      console.error('Error al establecer imagen principal:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al establecer imagen principal'
      });
    }
  });

  // ========== RUTAS DE DOCUMENTOS ==========
  
  // Subir documento a concesión activa
  apiRouter.post('/active-concessions/:id/documents', isAuthenticated, upload.single('document'), async (req: Request, res: Response) => {
    try {
      const { pool } = await import('./db');
      const concessionId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'No se proporcionó archivo de documento'
        });
      }
      
      const documentUrl = `/uploads/active-concessions/${req.file.filename}`;
      const { title, description, documentType, expirationDate, isRequired } = req.body;
      
      const result = await pool.query(`
        INSERT INTO active_concession_documents (
          concession_id, document_url, document_type, title, description, 
          expiration_date, is_required, uploaded_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
      `, [
        concessionId,
        documentUrl,
        documentType,
        title,
        description || '',
        expirationDate || null,
        isRequired === 'true',
        userId
      ]);
      
      res.status(201).json({
        status: 'success',
        data: result.rows[0],
        message: 'Documento subido exitosamente'
      });
    } catch (error) {
      console.error('Error al subir documento:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al subir documento'
      });
    }
  });

  // ========== RUTAS DE DATOS AUXILIARES ==========
  
  // Obtener concesionarios (usuarios con rol concesionario)
  apiRouter.get('/concessionaires', async (req: Request, res: Response) => {
    try {
      const { pool } = await import('./db');
      
      const result = await pool.query(`
        SELECT id, username, full_name as "fullName", email, phone
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

  // Obtener tipos de concesión activos
  apiRouter.get('/concession-types-active', async (req: Request, res: Response) => {
    try {
      const { pool } = await import('./db');
      
      const result = await pool.query(`
        SELECT * FROM concession_types 
        WHERE is_active = true 
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

  console.log('✅ Rutas de Concesiones Activas registradas correctamente');
}