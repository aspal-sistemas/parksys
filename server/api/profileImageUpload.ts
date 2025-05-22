import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configurar la carpeta de destino para imágenes de perfil usando una ruta relativa
const uploadDir = path.resolve('./public/uploads/profiles');

// Asegurarse de que existe la carpeta para los perfiles
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar multer para el almacenamiento de imágenes de perfil
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar un nombre único basado en timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Obtener la extensión original del archivo
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

// Filtro para asegurar que solo se suban imágenes
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Aceptar solo imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Configuración de límites
const limits = {
  fileSize: 5 * 1024 * 1024 // 5MB máximo
};

// Crear middleware de carga
const upload = multer({ 
  storage, 
  fileFilter,
  limits
}).single('profileImage');

// Manejador para la carga de imágenes de perfil
export function handleProfileImageUpload(req: Request, res: Response) {
  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        // Error de multer
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            message: 'El archivo es demasiado grande. El tamaño máximo es 5MB.'
          });
        }
        return res.status(400).json({ message: err.message });
      }
      
      // Error desconocido
      return res.status(500).json({ message: 'Error al cargar la imagen' });
    }
    
    // Si no hay archivo
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha seleccionado ninguna imagen' });
    }
    
    // Devolver la URL de la imagen cargada
    const imagePath = `/uploads/profiles/${req.file.filename}`;
    res.json({ 
      url: imagePath,
      message: 'Imagen cargada correctamente' 
    });
  });
}