import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configurar la carpeta de destino
const uploadDir = path.join(__dirname, '../../public/uploads/icons');

// Asegurarse de que existe la carpeta para los iconos
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar multer para el almacenamiento de iconos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar un nombre único basado en timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Obtener la extensión original del archivo
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'icon-' + uniqueSuffix + ext);
  }
});

// Filtro para asegurar que solo se suban imágenes
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Validar que sea un tipo de imagen permitido
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos JPEG o PNG'));
  }
};

// Configurar multer con los parámetros definidos
export const uploadIcon = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB límite
  },
}).single('icon');

// Manejador de errores de multer
export function handleIconUploadErrors(err: any, req: Request, res: Response, next: Function) {
  if (err instanceof multer.MulterError) {
    // Errores específicos de multer
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'El archivo es demasiado grande. El tamaño máximo es 2MB' 
      });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    // Otros errores
    return res.status(400).json({ error: err.message });
  }
  next();
}

// Función para manejar la carga del icono
export function uploadIconHandler(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }
  
  const file = req.file;
  // Devuelve la URL relativa al archivo
  const fileUrl = `/uploads/icons/${file.filename}`;
  
  return res.status(200).json({
    message: 'Icono subido exitosamente',
    filename: file.filename,
    url: fileUrl
  });
}