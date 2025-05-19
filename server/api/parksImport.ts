import { Request, Response } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { insertParkSchema } from '@shared/schema';
import { storage } from '../storage';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

// Configurar multer para almacenar archivos temporalmente
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const tempDir = path.join(__dirname, '../../temp');
      // Crear directorio temp si no existe
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      cb(null, tempDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, 'parks-import-' + uniqueSuffix + ext);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB límite
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/csv'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de archivo no válido. Sólo se permiten archivos Excel (.xls, .xlsx) o CSV (.csv)'));
    }
  }
});

// Manejador de errores para multer
export const handleMulterErrors = (err: any, req: Request, res: Response, next: any) => {
  if (err instanceof multer.MulterError) {
    // Error de multer
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'El archivo es demasiado grande. El tamaño máximo permitido es 5MB.'
      });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    // Otro tipo de error
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Middleware para subir un único archivo
export const uploadParkFile = upload.single('file');

// Genera una plantilla Excel para importación de parques
export const generateImportTemplate = (req: Request, res: Response) => {
  try {
    // Crear un libro de trabajo nuevo
    const wb = XLSX.utils.book_new();
    
    // Crear una hoja de datos con encabezados y ejemplos
    const headers = [
      'nombre',
      'tipo_parque',
      'direccion',
      'latitud',
      'longitud',
      'codigo_postal',
      'descripcion',
      'area',
      'horario',
      'estacionamiento',
      'telefono_contacto',
      'email_contacto',
      'website'
    ];
    
    // Datos de ejemplo
    const exampleData = [
      {
        nombre: 'Parque Ejemplo',
        tipo_parque: 'Urbano',
        direccion: 'Av. Ejemplo 123, Col. Centro',
        latitud: '20.659698',
        longitud: '-103.349609',
        codigo_postal: '44100',
        descripcion: 'Descripción detallada del parque ejemplo',
        area: '12000',
        horario: 'Lunes a Domingo de 6:00 a 22:00',
        estacionamiento: 'Sí',
        telefono_contacto: '3331234567',
        email_contacto: 'parque@ejemplo.com',
        website: 'https://www.parqueejemplo.mx'
      },
      {
        nombre: 'Parque Modelo',
        tipo_parque: 'Lineal',
        direccion: 'Calle Modelo 456, Col. Moderna',
        latitud: '20.670000',
        longitud: '-103.350000',
        codigo_postal: '44190',
        descripcion: 'Parque lineal con ciclovía y áreas verdes',
        area: '5000',
        horario: 'Abierto 24 horas',
        estacionamiento: 'No',
        telefono_contacto: '',
        email_contacto: '',
        website: ''
      }
    ];
    
    // Crear estructura de worksheet
    const ws_data = [headers];
    
    // Agregar datos de ejemplo
    exampleData.forEach(example => {
      const row = headers.map(header => {
        // Usar nombres de campo en inglés para mapear a los nombres en español
        const fieldMapping: { [key: string]: string } = {
          'nombre': 'name',
          'tipo_parque': 'parkType',
          'direccion': 'address',
          'latitud': 'latitude',
          'longitud': 'longitude',
          'codigo_postal': 'postalCode',
          'descripcion': 'description',
          'area': 'area',
          'horario': 'hours',
          'estacionamiento': 'hasParking',
          'telefono_contacto': 'contactPhone',
          'email_contacto': 'contactEmail',
          'website': 'website'
        };
        
        const fieldName = fieldMapping[header] || header;
        return example[header as keyof typeof example] || '';
      });
      ws_data.push(row);
    });
    
    // Añadir información sobre los tipos de parque válidos
    const parkTypesInfo = [
      [''],
      ['Tipos de parque válidos:'],
      ['Urbano'],
      ['Lineal'],
      ['Bosque Urbano'],
      ['Jardín'],
      ['Unidad Deportiva'],
      ['Otro']
    ];
    
    // Añadir información sobre los campos obligatorios
    const requiredFieldsInfo = [
      [''],
      ['Campos obligatorios:'],
      ['nombre'],
      ['tipo_parque'],
      ['direccion'],
      ['latitud'],
      ['longitud']
    ];
    
    // Crear worksheet con los datos
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    
    // Agregar información adicional en columnas separadas
    XLSX.utils.sheet_add_aoa(ws, parkTypesInfo, { origin: { r: 0, c: headers.length + 2 } });
    XLSX.utils.sheet_add_aoa(ws, requiredFieldsInfo, { origin: { r: 0, c: headers.length + 4 } });
    
    // Agregar el worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Parques');
    
    // Generar el archivo Excel
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    
    // Enviar respuesta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=plantilla_importacion_parques.xlsx');
    res.send(excelBuffer);
  } catch (error) {
    console.error('Error al generar plantilla:', error);
    res.status(500).json({ message: 'Error al generar la plantilla de importación' });
  }
};

// Procesa el archivo de importación
export const processImportFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' });
    }
    
    if (!req.body.municipalityId) {
      return res.status(400).json({ message: 'Debe seleccionar un municipio' });
    }
    
    const municipalityId = parseInt(req.body.municipalityId);
    const filePath = req.file.path;
    
    // Verificar que el municipio existe
    const municipality = await storage.getMunicipality(municipalityId);
    if (!municipality) {
      return res.status(404).json({ message: 'El municipio seleccionado no existe' });
    }
    
    // Cargar el workbook
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convertir a JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet, { raw: true }) as any[];
    
    if (rawData.length === 0) {
      return res.status(400).json({ message: 'El archivo está vacío o no contiene datos válidos' });
    }
    
    // Mapeo de nombres de columnas en español a inglés
    const fieldMappings: { [key: string]: string } = {
      'nombre': 'name',
      'tipo_parque': 'parkType',
      'direccion': 'address',
      'latitud': 'latitude',
      'longitud': 'longitude',
      'codigo_postal': 'postalCode',
      'descripcion': 'description',
      'area': 'area',
      'horario': 'hours',
      'estacionamiento': 'hasParking',
      'telefono_contacto': 'contactPhone',
      'email_contacto': 'contactEmail',
      'website': 'website'
    };
    
    // Mapear tipos de parque en español a inglés
    const parkTypeMappings: { [key: string]: string } = {
      'Urbano': 'Urban',
      'Lineal': 'Linear',
      'Bosque Urbano': 'Urban Forest',
      'Jardín': 'Garden',
      'Unidad Deportiva': 'Sports Unit',
      'Otro': 'Other'
    };
    
    // Transformar datos
    const parksData = rawData.map((row, index) => {
      const transformedData: any = {
        municipalityId: municipalityId
      };
      
      // Mapear campos según los nombres en español
      Object.keys(row).forEach(key => {
        const normalizedKey = key.toLowerCase().trim();
        let englishKey = fieldMappings[normalizedKey];
        
        if (englishKey) {
          let value = row[key];
          
          // Convertir 'estacionamiento' a booleano
          if (englishKey === 'hasParking') {
            if (typeof value === 'string') {
              value = value.toLowerCase() === 'sí' || value.toLowerCase() === 'si' || value.toLowerCase() === 'yes' || value === '1' || value === 'true';
            } else if (typeof value === 'number') {
              value = value === 1;
            }
          }
          
          // Mapear tipo de parque
          if (englishKey === 'parkType' && typeof value === 'string') {
            value = parkTypeMappings[value] || value;
          }
          
          transformedData[englishKey] = value;
        }
      });
      
      return transformedData;
    });
    
    // Validar y filtrar parques válidos
    const validParks = [];
    const errors = [];
    
    for (const [index, parkData] of parksData.entries()) {
      try {
        const validatedPark = insertParkSchema.parse(parkData);
        validParks.push(validatedPark);
      } catch (error) {
        if (error instanceof ZodError) {
          const rowNumber = index + 2; // +2 porque el índice empieza en 0 y hay un encabezado
          const validationError = fromZodError(error);
          errors.push(`Fila ${rowNumber}: ${validationError.message}`);
        } else {
          errors.push(`Error en la fila ${index + 2}: ${(error as Error).message}`);
        }
      }
    }
    
    // Si no hay parques válidos, retornar error
    if (validParks.length === 0) {
      return res.status(400).json({
        message: 'No se encontraron parques válidos para importar',
        errors
      });
    }
    
    // Crear parques en la base de datos
    let createdCount = 0;
    const importErrors = [];
    
    for (const [index, parkData] of validParks.entries()) {
      try {
        await storage.createPark(parkData);
        createdCount++;
      } catch (error) {
        const rowNumber = index + 2;
        importErrors.push(`Error al importar parque en fila ${rowNumber}: ${(error as Error).message}`);
      }
    }
    
    // Eliminar archivo temporal
    fs.unlinkSync(filePath);
    
    // Preparar respuesta
    const hasErrors = errors.length > 0 || importErrors.length > 0;
    const allErrors = [...errors, ...importErrors];
    
    return res.status(hasErrors && createdCount === 0 ? 400 : 200).json({
      success: createdCount > 0,
      parksImported: createdCount,
      message: createdCount > 0 
        ? `Se importaron ${createdCount} parques correctamente${hasErrors ? ', con algunos errores' : ''}.`
        : 'No se pudo importar ningún parque.',
      errors: allErrors,
      totalErrors: allErrors.length,
      totalProcessed: parksData.length
    });
    
  } catch (error) {
    // Si hay algún error en el proceso, eliminar el archivo temporal
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Error al procesar archivo de importación:', error);
    return res.status(500).json({ 
      message: 'Error al procesar el archivo de importación',
      error: (error as Error).message
    });
  }
};