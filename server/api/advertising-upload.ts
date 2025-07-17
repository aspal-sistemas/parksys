import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configurar almacenamiento para archivos de publicidad
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads/advertising');
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'ad-' + uniqueSuffix + ext);
  }
});

// Configurar filtro de archivos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Tipos de archivo permitidos para publicidad
  const allowedMimes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/avi',
    'video/mov'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no válido. Se permiten: JPEG, PNG, GIF, WebP, MP4, WebM, OGG, AVI, MOV'));
  }
};

// Configurar multer
export const uploadAdvertising = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB límite para videos
  },
}).single('file');

// Endpoint para subir archivos de publicidad
export const handleAdvertisingUpload = async (req: Request, res: Response) => {
  try {
    console.log('📁 Procesando subida de archivo de publicidad...');
    
    if (!req.file) {
      console.log('❌ No se encontró archivo en la petición');
      return res.status(400).json({ 
        success: false, 
        error: 'No se ha enviado ningún archivo' 
      });
    }

    // Construir URL del archivo
    const fileUrl = `/uploads/advertising/${req.file.filename}`;
    
    // Información del archivo
    const fileInfo = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: fileUrl
    };

    console.log('📁 Archivo de publicidad subido exitosamente:', fileInfo);

    return res.status(200).json({
      success: true,
      message: 'Archivo subido exitosamente',
      file: fileInfo,
      url: fileUrl
    });

  } catch (error) {
    console.error('❌ Error al subir archivo de publicidad:', error);
    
    // Verificar si es un error de multer
    if (error instanceof Error && error.message.includes('Formato de archivo no válido')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al subir el archivo'
    });
  }
};