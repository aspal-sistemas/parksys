import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import XLSX from 'xlsx';
import { storage } from '../storage';
import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { parks } from '@shared/schema';

// Configuración de Multer para el almacenamiento temporal de archivos
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../../uploads');
      
      // Crear el directorio si no existe
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Generar un nombre único para el archivo
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'parksimport-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // Limitar a 5MB
  },
  fileFilter: (req, file, cb) => {
    // Validar tipos de archivo permitidos
    const filetypes = /xlsx|xls|csv/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls) o CSV (.csv)'));
  },
});

// Manejar errores de multer
export const handleMulterErrors = (err: any, req: Request, res: Response, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'El archivo es demasiado grande. Tamaño máximo: 5MB',
      });
    }
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

// Esquema para validar los datos de parques
const ParkImportSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  municipalityId: z.coerce.number().int().positive("ID de municipio inválido"),
  parkType: z.string().min(1, "El tipo de parque es requerido"),
  description: z.string().nullable().optional(),
  address: z.string().min(1, "La dirección es requerida"),
  postalCode: z.string().nullable().optional(),
  latitude: z.string().min(1, "La latitud es requerida"),
  longitude: z.string().min(1, "La longitud es requerida"),
  area: z.string().nullable().optional(),
  yearFounded: z.string().nullable().optional(),
  openingTime: z.string().nullable().optional(),
  closingTime: z.string().nullable().optional(),
  maintenanceSchedule: z.string().nullable().optional(), 
  accessibilityFeatures: z.string().nullable().optional(),
  contactEmail: z.string().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
});

// Middleware para manejar la subida de archivos
export const uploadParkFile = upload.single('file');

// Controlador para generar la plantilla de importación
export const generateImportTemplate = (req: Request, res: Response) => {
  try {
    // Crear un libro de trabajo y una hoja
    const wb = XLSX.utils.book_new();
    
    // Definir las columnas de la plantilla
    const templateHeaders = [
      { header: "name", key: "name", width: 20, note: "Obligatorio: Nombre del parque" },
      { header: "municipalityId", key: "municipalityId", width: 15, note: "Obligatorio: ID del municipio (número)" },
      { header: "parkType", key: "parkType", width: 15, note: "Obligatorio: Tipo de parque" },
      { header: "address", key: "address", width: 30, note: "Obligatorio: Dirección completa" },
      { header: "latitude", key: "latitude", width: 15, note: "Obligatorio: Latitud (formato decimal)" },
      { header: "longitude", key: "longitude", width: 15, note: "Obligatorio: Longitud (formato decimal)" },
      { header: "description", key: "description", width: 30, note: "Opcional: Descripción del parque" },
      { header: "postalCode", key: "postalCode", width: 15, note: "Opcional: Código postal" },
      { header: "area", key: "area", width: 15, note: "Opcional: Área en m² o hectáreas" },
      { header: "yearFounded", key: "yearFounded", width: 15, note: "Opcional: Año de fundación" },
      { header: "openingTime", key: "openingTime", width: 15, note: "Opcional: Hora de apertura (formato 24h)" },
      { header: "closingTime", key: "closingTime", width: 15, note: "Opcional: Hora de cierre (formato 24h)" },
      { header: "maintenanceSchedule", key: "maintenanceSchedule", width: 20, note: "Opcional: Calendario de mantenimiento" },
      { header: "accessibilityFeatures", key: "accessibilityFeatures", width: 20, note: "Opcional: Características de accesibilidad" },
      { header: "contactEmail", key: "contactEmail", width: 20, note: "Opcional: Email de contacto" },
      { header: "contactPhone", key: "contactPhone", width: 20, note: "Opcional: Teléfono de contacto" }
    ];
    
    // Crear la hoja con los encabezados
    const ws = XLSX.utils.aoa_to_sheet([templateHeaders.map(h => h.header)]);
    
    // Añadir comentarios/notas a las celdas
    if (!ws.A1) ws.A1 = { t: 's', v: 'name' };
    if (!ws.A1.c) ws.A1.c = [];
    templateHeaders.forEach((h, idx) => {
      // Crear la celda si no existe
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: idx });
      if (!ws[cellRef]) ws[cellRef] = { t: 's', v: h.header };
      
      // Añadir el comentario
      if (!ws[cellRef].c) ws[cellRef].c = [];
      ws[cellRef].c.push({ a: 'Sistema', t: h.note });
    });
    
    // Añadir la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, "PlanillaParques");
    
    // Establecer anchos de columna
    const colWidths = templateHeaders.map(h => h.width);
    ws['!cols'] = colWidths.map(width => ({ width }));
    
    // Añadir un ejemplo de datos
    XLSX.utils.sheet_add_aoa(ws, [
      [
        "Parque Central", // name
        "1", // municipalityId
        "Urbano", // parkType
        "Av. Principal #123, Colonia Centro", // address
        "20.123456", // latitude
        "-99.123456", // longitude
        "Hermoso parque con áreas verdes y juegos infantiles", // description
        "44100", // postalCode
        "5000", // area
        "1985", // yearFounded
        "06:00", // openingTime
        "22:00", // closingTime
        "Lunes y jueves", // maintenanceSchedule
        "Rampas, baños adaptados", // accessibilityFeatures
        "contacto@parque.mx", // contactEmail
        "555-123-4567" // contactPhone
      ]
    ], { origin: { r: 1, c: 0 } });
    
    // Convertir a buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    
    // Enviar el archivo
    res.setHeader('Content-Disposition', 'attachment; filename="plantilla_importacion_parques.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(excelBuffer);
  } catch (error) {
    console.error("Error generating template:", error);
    return res.status(500).json({ error: "Error al generar la plantilla de importación" });
  }
};

// Controlador para procesar la importación de parques
export const processImportFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ningún archivo" });
    }

    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convertir a JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    if (jsonData.length === 0) {
      return res.status(400).json({ error: "El archivo no contiene datos" });
    }

    // Procesar cada fila
    const results = {
      imported: 0,
      errors: 0,
      errorDetails: [] as string[]
    };

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any;
      const rowNumber = i + 2; // +2 porque i empieza en 0 y hay una fila de encabezados
      
      try {
        // Validar los datos con el esquema
        const validatedData = ParkImportSchema.parse(row);
        
        // Crear el parque en la base de datos
        await storage.createPark({
          ...validatedData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        results.imported++;
      } catch (error) {
        results.errors++;
        if (error instanceof z.ZodError) {
          error.errors.forEach(err => {
            results.errorDetails.push(`Fila ${rowNumber}: ${err.path.join('.')} - ${err.message}`);
          });
        } else if (error instanceof Error) {
          results.errorDetails.push(`Fila ${rowNumber}: ${error.message}`);
        } else {
          results.errorDetails.push(`Fila ${rowNumber}: Error desconocido`);
        }
      }
    }

    // Eliminar el archivo temporal
    fs.unlinkSync(filePath);
    
    return res.json(results);
  } catch (error) {
    console.error("Error processing import file:", error);
    // Si hay un archivo, intentar eliminarlo
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({ error: "Error al procesar el archivo de importación" });
  }
};