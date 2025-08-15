import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { isAuthenticated } from './middleware/auth';

const router = express.Router();

// Configuración de multer para eventos
const eventImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), 'uploads', 'event-images');
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'event-img-' + uniqueSuffix + ext);
  }
});

const eventImageUpload = multer({
  storage: eventImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  },
  fileFilter: function (req, file, cb) {
    // Validar tipos de archivo
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen (JPEG, JPG, PNG, GIF, WebP)'));
    }
  }
});

// Endpoint para subir imagen de evento
router.post('/upload-image', isAuthenticated, eventImageUpload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se recibió ningún archivo' 
      });
    }

    // Construir URL de la imagen
    const imageUrl = `/uploads/event-images/${req.file.filename}`;
    
    console.log('📸 Imagen de evento subida:', {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      path: req.file.path,
      url: imageUrl
    });

    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      imageUrl: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });

  } catch (error) {
    console.error('Error al subir imagen de evento:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor al subir la imagen' 
    });
  }
});

// Middleware para manejar errores de multer
router.use((error: any, req: Request, res: Response, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Máximo 5MB.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Campo de archivo inesperado.'
      });
    }
  }
  
  if (error.message === 'Solo se permiten archivos de imagen (JPEG, JPG, PNG, GIF, WebP)') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  console.error('Error en upload de imagen de evento:', error);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

export { router as eventImageRouter };