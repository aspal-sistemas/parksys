/**
 * SISTEMA COMPLETO DE MULTIMEDIA PARA PARQUES
 * ==========================================
 * 
 * Sistema integral para gestión de imágenes y documentos de parques
 * con almacenamiento local y funcionalidades completas CRUD
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from './db';
import { eq, and, desc } from 'drizzle-orm';

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.fieldname === 'document' 
      ? 'public/uploads/park-documents' 
      : 'public/uploads/park-images';
    
    // Asegurar que el directorio existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 1000000);
    const extension = path.extname(file.originalname);
    const baseName = file.fieldname === 'document' ? 'park-doc' : 'park-img';
    cb(null, `${baseName}-${timestamp}-${randomId}${extension}`);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.fieldname === 'document') {
    // Documentos: PDF, DOC, DOCX, TXT
    if (file.mimetype.includes('pdf') || 
        file.mimetype.includes('document') || 
        file.mimetype.includes('text')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF, DOC, DOCX y TXT'), false);
    }
  } else {
    // Imágenes: JPG, PNG, GIF, WebP
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  }
});

export function registerMultimediaRoutes(app: any, apiRouter: Router, isAuthenticated: any) {

  // =============================================
  // GESTIÓN DE IMÁGENES DE PARQUES
  // =============================================

  // Obtener todas las imágenes de un parque
  apiRouter.get('/parks/:parkId/images', async (req: Request, res: Response) => {
    try {
      const parkId = parseInt(req.params.parkId);
      
      const query = `
        SELECT 
          id, 
          park_id as "parkId", 
          image_url as "imageUrl", 
          file_path as "filePath",
          caption, 
          is_primary as "isPrimary", 
          created_at as "createdAt"
        FROM park_images 
        WHERE park_id = $1 
        ORDER BY is_primary DESC, created_at DESC
      `;
      
      const result = await db.execute(query, [parkId]);
      console.log(`Imágenes encontradas para parque ${parkId}:`, result.length);
      
      res.json(result);
    } catch (error) {
      console.error('Error obteniendo imágenes del parque:', error);
      res.status(500).json({ error: 'Error al obtener las imágenes del parque' });
    }
  });

  // Subir nueva imagen (archivo o URL)
  apiRouter.post('/parks/:parkId/images', isAuthenticated, upload.single('image'), async (req: Request, res: Response) => {
    try {
      const parkId = parseInt(req.params.parkId);
      const { imageUrl, caption, isPrimary } = req.body;
      
      let finalImageUrl = imageUrl;
      let filePath = null;
      
      // Si se subió un archivo
      if (req.file) {
        filePath = req.file.path;
        finalImageUrl = `/uploads/park-images/${req.file.filename}`;
      }
      
      // Si es imagen principal, desmarcar otras
      if (isPrimary === 'true' || isPrimary === true) {
        await db.execute(
          'UPDATE park_images SET is_primary = false WHERE park_id = $1',
          [parkId]
        );
      }
      
      const insertQuery = `
        INSERT INTO park_images (park_id, image_url, file_path, caption, is_primary)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, park_id as "parkId", image_url as "imageUrl", caption, is_primary as "isPrimary"
      `;
      
      const result = await db.execute(insertQuery, [
        parkId,
        finalImageUrl,
        filePath,
        caption || '',
        isPrimary === 'true' || isPrimary === true
      ]);
      
      console.log(`Nueva imagen creada para parque ${parkId}:`, result[0]);
      res.status(201).json(result[0]);
      
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      res.status(500).json({ error: 'Error al subir la imagen' });
    }
  });

  // Establecer imagen como principal
  apiRouter.post('/park-images/:id/set-primary', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const imageId = parseInt(req.params.id);
      
      // Obtener parkId de la imagen
      const imageResult = await db.execute(
        'SELECT park_id FROM park_images WHERE id = $1',
        [imageId]
      );
      
      if (imageResult.length === 0) {
        return res.status(404).json({ error: 'Imagen no encontrada' });
      }
      
      const parkId = imageResult[0].park_id;
      
      // Desmarcar todas las imágenes como principales
      await db.execute(
        'UPDATE park_images SET is_primary = false WHERE park_id = $1',
        [parkId]
      );
      
      // Marcar esta imagen como principal
      await db.execute(
        'UPDATE park_images SET is_primary = true WHERE id = $1',
        [imageId]
      );
      
      res.json({ message: 'Imagen establecida como principal' });
      
    } catch (error) {
      console.error('Error estableciendo imagen principal:', error);
      res.status(500).json({ error: 'Error al establecer imagen principal' });
    }
  });

  // Eliminar imagen
  apiRouter.delete('/park-images/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const imageId = parseInt(req.params.id);
      
      // Obtener información de la imagen antes de eliminar
      const imageResult = await db.execute(
        'SELECT file_path FROM park_images WHERE id = $1',
        [imageId]
      );
      
      if (imageResult.length === 0) {
        return res.status(404).json({ error: 'Imagen no encontrada' });
      }
      
      const filePath = imageResult[0].file_path;
      
      // Eliminar archivo físico si existe
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Eliminar registro de base de datos
      await db.execute('DELETE FROM park_images WHERE id = $1', [imageId]);
      
      console.log(`Imagen ${imageId} eliminada exitosamente`);
      res.status(204).send();
      
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      res.status(500).json({ error: 'Error al eliminar la imagen' });
    }
  });

  // =============================================
  // GESTIÓN DE DOCUMENTOS DE PARQUES
  // =============================================

  // Obtener todos los documentos de un parque
  apiRouter.get('/parks/:parkId/documents', async (req: Request, res: Response) => {
    try {
      const parkId = parseInt(req.params.parkId);
      
      const query = `
        SELECT 
          id, 
          park_id as "parkId", 
          title, 
          file_path as "filePath",
          file_url as "fileUrl",
          file_size as "fileSize",
          file_type as "fileType",
          description,
          category,
          created_at as "createdAt"
        FROM park_documents 
        WHERE park_id = $1 
        ORDER BY created_at DESC
      `;
      
      const result = await db.execute(query, [parkId]);
      console.log(`Documentos encontrados para parque ${parkId}:`, result.length);
      
      res.json(result);
    } catch (error) {
      console.error('Error obteniendo documentos del parque:', error);
      res.status(500).json({ error: 'Error al obtener los documentos del parque' });
    }
  });

  // Subir nuevo documento
  apiRouter.post('/parks/:parkId/documents', isAuthenticated, upload.single('document'), async (req: Request, res: Response) => {
    try {
      const parkId = parseInt(req.params.parkId);
      const { title, description, category, fileUrl } = req.body;
      
      let finalFileUrl = fileUrl;
      let filePath = null;
      let fileSize = 0;
      let fileType = '';
      
      // Si se subió un archivo
      if (req.file) {
        filePath = req.file.path;
        finalFileUrl = `/uploads/park-documents/${req.file.filename}`;
        fileSize = req.file.size;
        fileType = req.file.mimetype;
      } else if (fileUrl) {
        // URL externa - detectar tipo de archivo por extensión
        const getFileTypeFromUrl = (url: string) => {
          const extension = url.split('.').pop()?.toLowerCase();
          switch (extension) {
            case 'pdf': return 'application/pdf';
            case 'doc': return 'application/msword';
            case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            case 'txt': return 'text/plain';
            case 'jpg':
            case 'jpeg': return 'image/jpeg';
            case 'png': return 'image/png';
            default: return 'application/octet-stream';
          }
        };
        
        fileType = getFileTypeFromUrl(fileUrl);
        fileSize = 0; // No podemos determinar el tamaño de URLs externas
      }
      
      const insertQuery = `
        INSERT INTO park_documents (park_id, title, file_path, file_url, file_size, file_type, description, category)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, park_id as "parkId", title, file_url as "fileUrl", file_size as "fileSize", file_type as "fileType", description, category, created_at as "createdAt"
      `;
      
      console.log('Insertando documento con datos:', {
        parkId,
        title,
        filePath,
        finalFileUrl,
        fileSize,
        fileType,
        description: description || '',
        category: category || 'general'
      });
      
      const result = await db.execute(insertQuery, [
        parkId,
        title,
        filePath,
        finalFileUrl,
        fileSize,
        fileType,
        description || '',
        category || 'general'
      ]);
      
      console.log('Resultado de inserción:', result);
      
      console.log(`Nuevo documento creado para parque ${parkId}:`, result[0]);
      res.status(201).json(result[0]);
      
    } catch (error) {
      console.error('Error subiendo documento:', error);
      res.status(500).json({ error: 'Error al subir el documento' });
    }
  });

  // Eliminar documento
  apiRouter.delete('/park-documents/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.id);
      
      // Obtener información del documento antes de eliminar
      const docResult = await db.execute(
        'SELECT file_path FROM park_documents WHERE id = $1',
        [documentId]
      );
      
      if (docResult.length === 0) {
        return res.status(404).json({ error: 'Documento no encontrado' });
      }
      
      const filePath = docResult[0].file_path;
      
      // Eliminar archivo físico si existe
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Eliminar registro de base de datos
      await db.execute('DELETE FROM park_documents WHERE id = $1', [documentId]);
      
      console.log(`Documento ${documentId} eliminado exitosamente`);
      res.status(204).send();
      
    } catch (error) {
      console.error('Error eliminando documento:', error);
      res.status(500).json({ error: 'Error al eliminar el documento' });
    }
  });

  // =============================================
  // ENDPOINTS DE UTILIDAD
  // =============================================

  // Obtener estadísticas de multimedia de un parque
  apiRouter.get('/parks/:parkId/multimedia-stats', async (req: Request, res: Response) => {
    try {
      const parkId = parseInt(req.params.parkId);
      
      const imagesResult = await db.execute(
        'SELECT COUNT(*) as count FROM park_images WHERE park_id = $1',
        [parkId]
      );
      
      const documentsResult = await db.execute(
        'SELECT COUNT(*) as count FROM park_documents WHERE park_id = $1',
        [parkId]
      );
      
      const stats = {
        totalImages: parseInt(imagesResult[0]?.count || '0'),
        totalDocuments: parseInt(documentsResult[0]?.count || '0')
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error obteniendo estadísticas multimedia:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  });

  console.log('✅ Sistema completo de multimedia para parques registrado');
}

/**
 * FUNCIÓN PARA CREAR TABLAS DE MULTIMEDIA
 */
export async function createMultimediaTables() {
  try {
    // Crear tabla de imágenes de parques
    await db.execute(`
      CREATE TABLE IF NOT EXISTS park_images (
        id SERIAL PRIMARY KEY,
        park_id INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        file_path TEXT,
        caption TEXT DEFAULT '',
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE
      )
    `);

    // Crear tabla de documentos de parques
    await db.execute(`
      CREATE TABLE IF NOT EXISTS park_documents (
        id SERIAL PRIMARY KEY,
        park_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        file_path TEXT,
        file_url TEXT,
        file_size INTEGER DEFAULT 0,
        file_type TEXT DEFAULT '',
        description TEXT DEFAULT '',
        category TEXT DEFAULT 'general',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Tablas de multimedia creadas exitosamente');
  } catch (error) {
    console.error('Error creando tablas de multimedia:', error);
  }
}