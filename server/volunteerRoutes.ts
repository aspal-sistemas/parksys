import { Request, Response } from "express";
import { db } from "./db";
import { 
  insertVolunteerSchema,
  insertVolunteerParticipationSchema,
  insertVolunteerEvaluationSchema,
  insertVolunteerRecognitionSchema
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { volunteers, volunteerParticipations, volunteerEvaluations, volunteerRecognitions, users, parks } from "@shared/schema";

/**
 * Función que registra las rutas relacionadas con el módulo de voluntariado
 */
export function registerVolunteerRoutes(app: any, apiRouter: any, publicApiRouter: any, isAuthenticated: any) {
  
  // === RUTAS PARA VOLUNTARIOS ===

  // Crear un perfil de voluntario completo a partir de un usuario existente con rol "voluntario"
  apiRouter.post("/volunteers/create-from-user", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { 
        fullName, email, phoneNumber, address, age, gender, 
        previousExperience, availability, availableDays, interestAreas, 
        preferredParkId, legalConsent, userId 
      } = req.body;
      
      // Validar que el usuario exista y tenga el rol "voluntario"
      const userResults = await db.execute(
        sql`SELECT * FROM users WHERE id = ${userId} AND role = 'voluntario'`
      );
      
      if (!userResults.rows || userResults.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "No se encontró el usuario o no tiene el rol de voluntario" 
        });
      }
      
      // Verificar si ya existe un voluntario asociado a este usuario
      const existingVolunteerResults = await db.execute(
        sql`SELECT * FROM volunteers WHERE email = ${email}`
      );
      
      if (existingVolunteerResults.rows && existingVolunteerResults.rows.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: "Ya existe un voluntario con este correo electrónico" 
        });
      }
      
      // Crear el registro de voluntario en la base de datos
      const volunteerResult = await db.execute(
        sql`INSERT INTO volunteers (
          full_name, email, phone, address, age, gender, 
          previous_experience, available_hours, available_days, interest_areas,
          preferred_park_id, legal_consent, status, created_at, updated_at
        ) VALUES (
          ${fullName}, 
          ${email}, 
          ${phoneNumber || null}, 
          ${address || null}, 
          ${age ? parseInt(age) : null}, 
          ${gender || null},
          ${previousExperience || null}, 
          ${availability || null}, 
          ${availableDays ? JSON.stringify(availableDays) : null}, 
          ${interestAreas ? JSON.stringify(interestAreas) : null},
          ${preferredParkId ? parseInt(preferredParkId) : null}, 
          ${legalConsent === true}, 
          'active', 
          NOW(), 
          NOW()
        ) RETURNING *`
      );
      
      // Validar si se creó correctamente
      if (!volunteerResult.rows || volunteerResult.rows.length === 0) {
        return res.status(500).json({ 
          success: false, 
          message: "Error al crear el perfil de voluntario" 
        });
      }
      
      // Relacionar el usuario con el voluntario (esto podría hacerse en una tabla de relaciones si se desea)
      // Para esto habría que crear una tabla adicional, pero por ahora lo manejamos con el email
      
      res.status(201).json({
        success: true,
        message: "Perfil de voluntario creado exitosamente",
        volunteer: volunteerResult.rows[0]
      });
    } catch (error) {
      console.error("Error al crear perfil de voluntario desde usuario:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error interno al crear el perfil de voluntario" 
      });
    }
  });
  
  // Obtener todos los voluntarios (incluidos usuarios con rol 'voluntario')
  apiRouter.get("/volunteers", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      let allVolunteers: any[] = [];
      let userVolunteerIds: Set<number> = new Set(); // Para rastrear IDs de usuarios que ya son voluntarios
      
      // 1. Primero obtenemos los voluntarios tradicionales
      try {
        const traditionalVolunteersResult = await db.execute(
          sql`SELECT 
            id, 
            full_name, 
            email, 
            phone, 
            status, 
            profile_image_url, 
            created_at,
            age,
            available_hours as availability,
            previous_experience,
            'module' as source,
            user_id
          FROM volunteers 
          WHERE status = 'active'
          ORDER BY id DESC`
        );
        
        if (traditionalVolunteersResult.rows && Array.isArray(traditionalVolunteersResult.rows)) {
          // Agregamos los voluntarios tradicionales a nuestra lista
          allVolunteers = [...traditionalVolunteersResult.rows];
          
          // Guardamos los IDs de usuarios asociados para evitar duplicados
          traditionalVolunteersResult.rows.forEach((volunteer: any) => {
            if (volunteer.user_id) {
              userVolunteerIds.add(volunteer.user_id);
            }
          });
        }
      } catch (err) {
        console.error("Error al obtener voluntarios tradicionales:", err);
        // Continuamos con la siguiente consulta en caso de error
      }
      
      // 2. Luego obtenemos los usuarios con rol 'voluntario' que NO están ya en la tabla de voluntarios
      try {
        // Lista de IDs a excluir
        let excludeClause = "";
        
        if (userVolunteerIds.size > 0) {
          const excludeIds = Array.from(userVolunteerIds).join(',');
          excludeClause = `AND u.id NOT IN (${excludeIds})`;
        }
        
        // Construimos la consulta SQL dinámicamente
        const query = `
          SELECT 
            u.id as user_id,
            u.full_name, 
            u.email, 
            null as phone, 
            COALESCE(v.status, 'active') as status, 
            null as profile_image_url, 
            now() as created_at,
            null as age,
            null as availability,
            null as previous_experience,
            'user' as source,
            u.id as user_id
          FROM users u
          LEFT JOIN volunteers v ON u.email = v.email
          WHERE u.role = 'voluntario' 
          AND (v.status IS NULL OR v.status = 'active')
          ${excludeClause}
          ORDER BY u.id DESC
        `;
        
        const usersResult = await db.execute(query);
        console.log("Usuarios voluntarios que no están en tabla volunteers:", usersResult.rows);
        
        if (usersResult.rows && Array.isArray(usersResult.rows)) {
          allVolunteers = [...allVolunteers, ...usersResult.rows];
        }
      } catch (err) {
        console.error("Error al obtener usuarios voluntarios:", err);
        // Continuamos y devolvemos lo que tengamos
      }
      
      console.log(`Total de ${allVolunteers.length} voluntarios encontrados`);
      res.json(allVolunteers);
    } catch (error) {
      console.error("Error al obtener voluntarios:", error);
      res.status(500).json({ message: "Error al obtener voluntarios" });
    }
  });

  // Obtener un voluntario específico
  apiRouter.get("/volunteers/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      // Usar consulta SQL directa para evitar problemas de esquema
      const result = await db.execute(
        sql`SELECT * FROM volunteers WHERE id = ${volunteerId}`
      );
      
      if (!result.rows || result.rows.length === 0) {
        return res.status(404).json({ message: "Voluntario no encontrado" });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error(`Error al obtener voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al obtener datos del voluntario" });
    }
  });

  // Crear nuevo voluntario
  // Configuración de multer para subida de imágenes de voluntarios
  const volunteerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Asegurarse de que el directorio existe
      const uploadDir = './public/uploads/volunteers';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'volunteer-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const volunteerUpload = multer({ 
    storage: volunteerStorage,
    limits: {
      fileSize: 5 * 1024 * 1024 // Límite de 5MB
    },
    fileFilter: function (req, file, cb) {
      // Aceptar solo imágenes
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Solo se permiten archivos de imagen'), false);
      }
      cb(null, true);
    }
  });

  // Registro público de voluntarios - Utilizamos directamente apiRouter en lugar de publicApiRouter
  apiRouter.post("/volunteers/register", volunteerUpload.single('profileImage'), async (req: Request, res: Response) => {
    try {
      // Campos mínimos requeridos para registro público
      const requiredFields = [
        'fullName', 'email', 'phoneNumber', 'address', 'birthDate', 
        'emergencyContact', 'emergencyPhone', 'availability', 'skills',
        'interests', 'previousExperience', 'healthConditions', 'occupation',
        'termsAccepted'
      ];
      
      // Validar que todos los campos obligatorios estén presentes
      for (const field of requiredFields) {
        if (!req.body[field]) {
          return res.status(400).json({ 
            message: `El campo '${field}' es obligatorio` 
          });
        }
      }
      
      // Validar fecha de nacimiento (mayor de 18 años)
      const birthDate = new Date(req.body.birthDate);
      
      if (isNaN(birthDate.getTime())) {
        return res.status(400).json({ 
          message: "Fecha de nacimiento no válida" 
        });
      }
      
      // Validar que sea mayor de 18 años
      const today = new Date();
      const minAgeDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      );
      
      if (birthDate > minAgeDate) {
        return res.status(400).json({ 
          message: "Debes ser mayor de 18 años para registrarte" 
        });
      }
      
      // Validar aceptación de términos
      if (req.body.termsAccepted !== 'true') {
        return res.status(400).json({ 
          message: "Debes aceptar los términos y condiciones" 
        });
      }
      
      // Preparar datos para inserción con status 'pending' por defecto
      const volunteerData = {
        fullName: req.body.fullName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
        birthDate: birthDate,
        emergencyContact: req.body.emergencyContact,
        emergencyPhone: req.body.emergencyPhone,
        occupation: req.body.occupation,
        availability: req.body.availability,
        skills: req.body.skills,
        interests: req.body.interests,
        previousExperience: req.body.previousExperience,
        healthConditions: req.body.healthConditions,
        additionalComments: req.body.additionalComments || null,
        status: 'pending', // Los voluntarios registrados inician con estado pendiente
        totalHours: 0,
        // Si hay archivo de imagen, guardar la ruta
        profileImageUrl: req.file ? `/uploads/volunteers/${req.file.filename}` : null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Insertar en la base de datos
      const [newVolunteer] = await db
        .insert(volunteers)
        .values(volunteerData)
        .returning();
      
      // Responder con éxito y datos básicos del voluntario
      res.status(201).json({
        id: newVolunteer.id,
        fullName: newVolunteer.fullName,
        email: newVolunteer.email,
        status: newVolunteer.status,
        message: "Solicitud de registro enviada exitosamente. En breve nos pondremos en contacto contigo."
      });
    } catch (error) {
      console.error("Error en registro público de voluntario:", error);
      res.status(400).json({ 
        message: "Error al procesar la solicitud de registro", 
        error: error instanceof Error ? error.message : "Error desconocido" 
      });
    }
  });

  apiRouter.post("/volunteers", volunteerUpload.single('profileImage'), async (req: Request, res: Response) => {
    try {
      console.log("Datos recibidos:", req.body);
      
      // Preparar datos incluyendo la imagen si se subió
      const formData = {
        ...req.body,
        profile_image_url: req.file ? `/uploads/volunteers/${req.file.filename}` : req.body.profile_image_url || null
      };
      
      // Adaptar los datos a la estructura real de la base de datos
      const volunteerData = {
        full_name: formData.full_name || "Sin nombre",
        email: formData.email || "voluntario@ejemplo.com",
        phone: formData.phone || "",
        age: parseInt(formData.age) || 30,
        status: formData.status || "active",
        previous_experience: formData.previous_experience || "",
        available_hours: formData.available_hours || "",
        gender: formData.gender || "No especificado",
        profile_image_url: formData.profile_image_url,
        legal_consent: formData.legal_consent === "true" || true,
        interest_areas: formData.interest_areas ? JSON.parse(formData.interest_areas) : [],
        available_days: formData.available_days ? JSON.parse(formData.available_days) : [],
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Usar SQL directo para evitar problemas con el esquema
      const result = await db.execute(
        sql`INSERT INTO volunteers (
          full_name, email, phone, age, status, previous_experience, 
          available_hours, gender, profile_image_url, legal_consent, 
          interest_areas, available_days, created_at, updated_at
        ) VALUES (
          ${volunteerData.full_name}, ${volunteerData.email}, ${volunteerData.phone},
          ${volunteerData.age}, ${volunteerData.status}, ${volunteerData.previous_experience},
          ${volunteerData.available_hours}, ${volunteerData.gender}, ${volunteerData.profile_image_url},
          ${volunteerData.legal_consent}, ${JSON.stringify(volunteerData.interest_areas)}, 
          ${JSON.stringify(volunteerData.available_days)}, ${volunteerData.created_at}, ${volunteerData.updated_at}
        ) RETURNING *`
      );
      
      const newVolunteer = result.rows[0];
      res.status(201).json(newVolunteer);
    } catch (error) {
      console.error("Error al crear voluntario:", error);
      res.status(500).json({ message: "Error al crear voluntario", error: error.message });
    }
  });

  // Actualizar voluntario
  apiRouter.put("/volunteers/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      // Verificar si el voluntario existe
      const [existingVolunteer] = await db
        .select()
        .from(volunteers)
        .where(eq(volunteers.id, volunteerId));
      
      if (!existingVolunteer) {
        return res.status(404).json({ message: "Voluntario no encontrado" });
      }
      
      // Combinamos los datos existentes con los nuevos
      const updatedData = {
        ...existingVolunteer,
        ...req.body,
        id: volunteerId,
        updatedAt: new Date()
      };
      
      // Validamos los datos actualizados (omitimos algunos campos que no son necesarios validar)
      const { id, createdAt, updatedAt, ...dataToValidate } = updatedData;
      const validationResult = insertVolunteerSchema.safeParse(dataToValidate);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Datos de voluntario no válidos", 
          errors: validationResult.error.format() 
        });
      }
      
      // Actualizamos el voluntario
      const [updatedVolunteer] = await db
        .update(volunteers)
        .set(updatedData)
        .where(eq(volunteers.id, volunteerId))
        .returning();
        
      res.json(updatedVolunteer);
    } catch (error) {
      console.error(`Error al actualizar voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al actualizar voluntario" });
    }
  });

  // Cambiar estado de voluntario (activar/desactivar)
  apiRouter.patch("/volunteers/:id/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      const { status } = req.body;
      
      if (!status || !["active", "inactive", "suspended", "pending"].includes(status)) {
        return res.status(400).json({ message: "Estado no válido. Debe ser 'active', 'inactive', 'pending' o 'suspended'" });
      }
      
      // Verificar si el voluntario existe
      const [existingVolunteer] = await db
        .select()
        .from(volunteers)
        .where(eq(volunteers.id, volunteerId));
      
      if (!existingVolunteer) {
        return res.status(404).json({ message: "Voluntario no encontrado" });
      }
      
      // Actualizar el estado del voluntario
      const [updatedVolunteer] = await db
        .update(volunteers)
        .set({ 
          status,
          updatedAt: new Date()
        })
        .where(eq(volunteers.id, volunteerId))
        .returning();
        
      res.json(updatedVolunteer);
    } catch (error) {
      console.error(`Error al actualizar estado del voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al actualizar estado del voluntario" });
    }
  });

  // Eliminar voluntario (soft delete cambiando estado a "inactive")
  apiRouter.delete("/volunteers/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      // Usamos SQL directo para evitar problemas con los campos
      const existingVolunteerResult = await db.execute(
        sql`SELECT * FROM volunteers WHERE id = ${volunteerId}`
      );
      
      if (!existingVolunteerResult.rows || existingVolunteerResult.rows.length === 0) {
        return res.status(404).json({ message: "Voluntario no encontrado" });
      }
      
      // Realizamos un soft delete cambiando el estado a "inactive" con SQL directo
      await db.execute(
        sql`UPDATE volunteers SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id = ${volunteerId}`
      );
        
      res.json({ message: "Voluntario inactivado correctamente", volunteerId });
    } catch (error) {
      console.error(`Error al eliminar voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al eliminar voluntario" });
    }
  });
  
  // Eliminar todos los voluntarios (soft delete cambiando estado a "inactive" para todos)
  apiRouter.delete("/volunteers/batch/all", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Solo administradores pueden usar esta función
      if (req.headers['x-user-role'] !== 'admin') {
        return res.status(403).json({ message: "No autorizado. Solo administradores pueden realizar esta acción" });
      }
      
      // Obtenemos una lista de IDs de voluntarios activos para mostrar el conteo
      const activeVolunteers = await db.execute(
        sql`SELECT id FROM volunteers WHERE status = 'active'`
      );
      
      const activeCount = activeVolunteers.rows?.length || 0;
      
      if (activeCount === 0) {
        return res.json({ 
          message: "No hay voluntarios activos para eliminar",
          count: 0
        });
      }
      
      // Realizamos un soft delete cambiando el estado a "inactive" para todos los voluntarios activos
      await db.execute(
        sql`UPDATE volunteers SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE status = 'active'`
      );
      
      res.json({ 
        message: `${activeCount} voluntarios han sido inactivados correctamente`,
        count: activeCount
      });
    } catch (error) {
      console.error("Error al eliminar todos los voluntarios:", error);
      res.status(500).json({ message: "Error al eliminar voluntarios" });
    }
  });

  // === RUTAS PARA PARTICIPACIONES ===

  // Obtener todas las participaciones 
  // Usamos un nombre diferente para el endpoint para evitar conflictos con la ruta parametrizada
  apiRouter.get("/participations/all", async (_req: Request, res: Response) => {
    try {
      console.log("Obteniendo todas las participaciones");
      const participations = await db
        .select()
        .from(volunteerParticipations)
        .orderBy(desc(volunteerParticipations.activityDate));
        
      console.log(`Se encontraron ${participations.length} participaciones`);
      res.json(participations);
    } catch (error) {
      console.error(`Error al obtener todas las participaciones:`, error);
      res.status(500).json({ message: "Error al obtener participaciones" });
    }
  });

  // Obtener participaciones de un voluntario
  apiRouter.get("/volunteers/:id/participations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      const participations = await db
        .select()
        .from(volunteerParticipations)
        .where(eq(volunteerParticipations.volunteerId, volunteerId))
        .orderBy(desc(volunteerParticipations.activityDate));
        
      res.json(participations);
    } catch (error) {
      console.error(`Error al obtener participaciones del voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al obtener participaciones" });
    }
  });

  // Actualizar perfil completo de voluntario (para integrar con perfil de usuario)
  apiRouter.post("/volunteers/update-profile", async (req: Request, res: Response) => {
    try {
      console.log("Actualizando perfil completo de voluntario:", req.body);
      
      const { userId, volunteerId, volunteerExperience, skills, availability, legalConsent, preferredParkId } = req.body;
      
      if (!volunteerId && !userId) {
        return res.status(400).json({ message: "Se requiere un ID de voluntario o usuario" });
      }
      
      // Buscar por ID de voluntario o ID de usuario
      let existingVolunteer;
      if (volunteerId) {
        const [result] = await db
          .select()
          .from(volunteers)
          .where(eq(volunteers.id, parseInt(volunteerId)));
        existingVolunteer = result;
      } else if (userId) {
        const [result] = await db
          .select()
          .from(volunteers)
          .where(eq(volunteers.user_id, parseInt(userId)));
        existingVolunteer = result;
      }
      
      if (!existingVolunteer) {
        return res.status(404).json({ message: "Voluntario no encontrado" });
      }
      
      // Actualizar solo los campos que existen en la tabla
      const updatedData: any = {};
      
      if (volunteerExperience !== undefined) {
        updatedData.previous_experience = volunteerExperience;
      }
      
      if (availability !== undefined) {
        updatedData.available_hours = availability;
      }
      
      if (legalConsent !== undefined) {
        updatedData.legal_consent = legalConsent;
      }
      
      if (preferredParkId !== undefined) {
        updatedData.preferred_park_id = preferredParkId;
      }
      
      // Actualizar timestamp
      updatedData.updated_at = new Date();
      
      // Actualizar el registro
      const [updatedVolunteer] = await db
        .update(volunteers)
        .set(updatedData)
        .where(eq(volunteers.id, existingVolunteer.id))
        .returning();
      
      res.json(updatedVolunteer);
    } catch (error) {
      console.error("Error al actualizar perfil de voluntario:", error);
      res.status(500).json({ message: "Error al actualizar perfil de voluntario" });
    }
  });
  
  // Registrar nueva participación
  apiRouter.post("/volunteers/:id/participations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      // Aseguramos que el volunteerId en el cuerpo coincida con el de la URL
      const participationData = {
        ...req.body,
        volunteerId,
        createdAt: new Date()
      };
      
      const validationResult = insertVolunteerParticipationSchema.safeParse(participationData);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Datos de participación no válidos", 
          errors: validationResult.error.format() 
        });
      }
      
      // Insertamos la nueva participación en la base de datos
      const [newParticipation] = await db
        .insert(volunteerParticipations)
        .values(validationResult.data)
        .returning();
        
      res.status(201).json(newParticipation);
    } catch (error) {
      console.error(`Error al crear participación para voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al registrar participación" });
    }
  });
  
  // Obtener una participación específica por ID
  apiRouter.get("/participations/:id", async (req: Request, res: Response) => {
    try {
      const participationId = parseInt(req.params.id);
      
      if (isNaN(participationId)) {
        return res.status(400).json({ message: "ID de participación no válido" });
      }
      
      const [participation] = await db
        .select()
        .from(volunteerParticipations)
        .where(eq(volunteerParticipations.id, participationId));
      
      if (!participation) {
        return res.status(404).json({ message: "Participación no encontrada" });
      }
      
      res.json(participation);
    } catch (error) {
      console.error(`Error al obtener participación ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al obtener datos de la participación" });
    }
  });
  
  // Actualizar una participación
  apiRouter.put("/participations/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const participationId = parseInt(req.params.id);
      
      if (isNaN(participationId)) {
        return res.status(400).json({ message: "ID de participación no válido" });
      }
      
      // Verificar si la participación existe
      const [existingParticipation] = await db
        .select()
        .from(volunteerParticipations)
        .where(eq(volunteerParticipations.id, participationId));
      
      if (!existingParticipation) {
        return res.status(404).json({ message: "Participación no encontrada" });
      }
      
      // Combinar los datos existentes con los nuevos, respetando los campos inmutables
      const updateData = {
        ...req.body,
        id: participationId,
        volunteerId: existingParticipation.volunteerId, // El voluntario no se puede cambiar
        createdAt: existingParticipation.createdAt // La fecha de creación no se puede cambiar
      };
      
      // Actualizar la participación en la base de datos
      const [updatedParticipation] = await db
        .update(volunteerParticipations)
        .set(updateData)
        .where(eq(volunteerParticipations.id, participationId))
        .returning();
        
      res.json(updatedParticipation);
    } catch (error) {
      console.error(`Error al actualizar participación ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al actualizar participación" });
    }
  });

  // === RUTAS PARA EVALUACIONES ===

  // Obtener todas las evaluaciones
  apiRouter.get("/volunteers/evaluations/all", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      console.log("Obteniendo todas las evaluaciones");
      const evaluations = await db
        .select()
        .from(volunteerEvaluations)
        .orderBy(desc(volunteerEvaluations.createdAt));
        
      console.log(`Se encontraron ${evaluations.length} evaluaciones`);
      res.json(evaluations);
    } catch (error) {
      console.error("Error al obtener evaluaciones:", error);
      res.status(500).json({ message: "Error al obtener evaluaciones" });
    }
  });
  
  // Obtener una evaluación específica por ID
  apiRouter.get("/volunteers/evaluations/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const evaluationId = parseInt(req.params.id);
      
      if (isNaN(evaluationId)) {
        return res.status(400).json({ message: "ID de evaluación inválido" });
      }
      
      const [evaluation] = await db
        .select()
        .from(volunteerEvaluations)
        .where(eq(volunteerEvaluations.id, evaluationId));
        
      if (!evaluation) {
        return res.status(404).json({ message: "Evaluación no encontrada" });
      }
      
      res.json(evaluation);
    } catch (error) {
      console.error("Error al obtener evaluación:", error);
      res.status(500).json({ message: "Error al obtener evaluación" });
    }
  });
  
  // Actualizar una evaluación
  apiRouter.put("/volunteers/evaluations/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const evaluationId = parseInt(req.params.id);
      
      if (isNaN(evaluationId)) {
        return res.status(400).json({ message: "ID de evaluación inválido" });
      }
      
      const { punctuality, attitude, responsibility, overallPerformance, comments, followUpRequired } = req.body;
      
      // Validar los campos requeridos
      if (punctuality === undefined || attitude === undefined || 
          responsibility === undefined || overallPerformance === undefined) {
        return res.status(400).json({ message: "Faltan campos requeridos" });
      }
      
      // Actualizar la evaluación
      const [updatedEvaluation] = await db
        .update(volunteerEvaluations)
        .set({
          punctuality,
          attitude,
          responsibility,
          overallPerformance,
          comments,
          followUpRequired,
          updatedAt: new Date(),
        })
        .where(eq(volunteerEvaluations.id, evaluationId))
        .returning();
      
      if (!updatedEvaluation) {
        return res.status(404).json({ message: "Evaluación no encontrada" });
      }
      
      res.json(updatedEvaluation);
    } catch (error) {
      console.error("Error al actualizar evaluación:", error);
      res.status(500).json({ message: "Error al actualizar evaluación" });
    }
  });

  // Obtener evaluaciones de un voluntario
  apiRouter.get("/volunteers/:id/evaluations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      const evaluations = await db
        .select()
        .from(volunteerEvaluations)
        .where(eq(volunteerEvaluations.volunteerId, volunteerId))
        .orderBy(desc(volunteerEvaluations.createdAt));
        
      res.json(evaluations);
    } catch (error) {
      console.error(`Error al obtener evaluaciones del voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al obtener evaluaciones" });
    }
  });

  // Crear evaluación para una participación
  apiRouter.post("/participations/:id/evaluations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const participationId = parseInt(req.params.id);
      
      if (isNaN(participationId)) {
        return res.status(400).json({ message: "ID de participación no válido" });
      }
      
      // Verificar que existe la participación
      const [participation] = await db
        .select()
        .from(volunteerParticipations)
        .where(eq(volunteerParticipations.id, participationId));
      
      if (!participation) {
        return res.status(404).json({ message: "Participación no encontrada" });
      }
      
      // Aseguramos que el participationId coincida con el de la URL
      const evaluationData = {
        ...req.body,
        participationId,
        // Tomamos el ID del voluntario de la participación
        volunteerId: participation.volunteerId,
        // El evaluador es el usuario autenticado o el proporcionado en el cuerpo
        evaluatorId: req.user?.id || req.body.evaluatorId,
        // Agregamos la fecha de creación
        createdAt: new Date()
      };
      
      const validationResult = insertVolunteerEvaluationSchema.safeParse(evaluationData);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Datos de evaluación no válidos", 
          errors: validationResult.error.format() 
        });
      }
      
      // Insertamos la nueva evaluación en la base de datos
      const [newEvaluation] = await db
        .insert(volunteerEvaluations)
        .values(validationResult.data)
        .returning();
        
      res.status(201).json(newEvaluation);
    } catch (error) {
      console.error(`Error al crear evaluación para participación ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al registrar evaluación" });
    }
  });

  // === RUTAS PARA RECONOCIMIENTOS ===
  
  // Obtener todos los reconocimientos (importante colocar las rutas más específicas primero)
  apiRouter.get("/volunteers/recognitions/all", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      console.log("Obteniendo todos los reconocimientos");
      const recognitions = await db
        .select()
        .from(volunteerRecognitions)
        .orderBy(desc(volunteerRecognitions.issuedAt));
        
      console.log(`Se encontraron ${recognitions.length} reconocimientos`);
      res.json(recognitions);
    } catch (error) {
      console.error("Error al obtener reconocimientos:", error);
      res.status(500).json({ message: "Error al obtener reconocimientos" });
    }
  });

  // Obtener reconocimientos de un voluntario específico
  apiRouter.get("/volunteers/:id/recognitions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      const recognitions = await db
        .select()
        .from(volunteerRecognitions)
        .where(eq(volunteerRecognitions.volunteerId, volunteerId))
        .orderBy(desc(volunteerRecognitions.createdAt));
        
      res.json(recognitions);
    } catch (error) {
      console.error(`Error al obtener reconocimientos del voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al obtener reconocimientos" });
    }
  });

  // Crear reconocimiento para un voluntario
  apiRouter.post("/volunteers/:id/recognitions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      // Verificar que existe el voluntario
      const [volunteer] = await db
        .select()
        .from(volunteers)
        .where(eq(volunteers.id, volunteerId));
      
      if (!volunteer) {
        return res.status(404).json({ message: "Voluntario no encontrado" });
      }
      
      // Aseguramos que el volunteerId coincida con el de la URL
      const recognitionData = {
        ...req.body,
        volunteerId,
        // El emisor es el usuario autenticado o el proporcionado en el cuerpo
        issuedById: req.user?.id || req.body.issuedById,
        // Agregamos la fecha de creación
        createdAt: new Date()
      };
      
      const validationResult = insertVolunteerRecognitionSchema.safeParse(recognitionData);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Datos de reconocimiento no válidos", 
          errors: validationResult.error.format() 
        });
      }
      
      // Insertamos el nuevo reconocimiento en la base de datos
      const [newRecognition] = await db
        .insert(volunteerRecognitions)
        .values(validationResult.data)
        .returning();
        
      res.status(201).json(newRecognition);
    } catch (error) {
      console.error(`Error al crear reconocimiento para voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al crear reconocimiento" });
    }
  });
  
  // === RUTAS PARA ESTADÍSTICAS ===
  
  // Obtener estadísticas del dashboard de un voluntario específico
  apiRouter.get("/volunteers/dashboard", async (req: Request, res: Response) => {
    try {
      const volunteerId = req.query.id;
      
      if (!volunteerId) {
        return res.status(400).json({ message: "ID de voluntario no proporcionado" });
      }
      
      console.log("Consultando dashboard para voluntario ID:", volunteerId);
      
      // Manejar el ID del voluntario de manera más robusta
      const numVolunteerId = parseInt(volunteerId as string, 10);
      
      if (isNaN(numVolunteerId)) {
        console.error("ID de voluntario no válido:", volunteerId);
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      console.log("Buscando voluntario con ID:", numVolunteerId);
      
      // Obtener información básica del voluntario
      const [volunteerInfo] = await db
        .select({
          id: volunteers.id,
          fullName: volunteers.fullName,
          email: volunteers.email,
          status: volunteers.status,
          totalHours: sql<number>`COALESCE(
            (SELECT SUM(hours_contributed) FROM volunteer_participations WHERE volunteer_id = ${volunteers.id}), 0
          )::int`,
          joinDate: volunteers.createdAt,
          profileImage: volunteers.profileImageUrl
        })
        .from(volunteers)
        .where(eq(volunteers.id, numVolunteerId));
        
      if (!volunteerInfo) {
        return res.status(404).json({ message: "Voluntario no encontrado" });
      }
      
      // Participaciones del voluntario
      const participations = await db
        .select({
          id: volunteerParticipations.id,
          activityName: volunteerParticipations.activityName,
          activityDate: volunteerParticipations.activityDate,
          hoursContributed: volunteerParticipations.hoursContributed,
          parkId: volunteerParticipations.parkId,
          role: sql<string>`'Voluntario'::text`,
          status: sql<string>`'Completado'::text`
        })
        .from(volunteerParticipations)
        .where(eq(volunteerParticipations.volunteerId, Number(volunteerId)))
        .orderBy(desc(volunteerParticipations.activityDate))
        .limit(5);
        
      // Obtener nombres de parques
      const parkIds = participations.map(p => p.parkId);
      let parkNames: { id: number, name: string }[] = [];
      
      if (parkIds.length > 0) {
        parkNames = await db
          .select({
            id: parks.id,
            name: parks.name
          })
          .from(parks)
          .where(sql`${parks.id} = ANY(${parkIds})`);
      }
      
      const participationsWithParkNames = participations.map(p => {
        const park = parkNames.find(park => park.id === p.parkId);
        return {
          ...p,
          parkName: park ? park.name : 'Parque desconocido'
        };
      });
      
      // Evaluaciones del voluntario
      const evaluations = await db
        .select({
          id: volunteerEvaluations.id,
          evaluationDate: volunteerEvaluations.createdAt,
          punctuality: volunteerEvaluations.punctuality,
          attitude: volunteerEvaluations.attitude,
          responsibility: volunteerEvaluations.responsibility,
          overallPerformance: volunteerEvaluations.overallPerformance,
          comments: volunteerEvaluations.comments
        })
        .from(volunteerEvaluations)
        .where(eq(volunteerEvaluations.volunteerId, Number(volunteerId)))
        .orderBy(desc(volunteerEvaluations.createdAt))
        .limit(5);
        
      // Reconocimientos del voluntario
      const recognitions = await db
        .select({
          id: volunteerRecognitions.id,
          recognitionType: volunteerRecognitions.recognitionType,
          achievementDate: volunteerRecognitions.date,
          description: volunteerRecognitions.notes,
          createdAt: sql<Date>`NOW()`
        })
        .from(volunteerRecognitions)
        .where(eq(volunteerRecognitions.volunteerId, Number(volunteerId)))
        .orderBy(desc(volunteerRecognitions.date))
        .limit(5);
        
      // Estadísticas básicas
      const [hoursStats] = await db
        .select({
          totalHours: sql<number>`sum(${volunteerParticipations.hoursContributed})::int`,
          avgHoursPerActivity: sql<number>`avg(${volunteerParticipations.hoursContributed})::float`,
          participationCount: sql<number>`count(*)::int`
        })
        .from(volunteerParticipations)
        .where(eq(volunteerParticipations.volunteerId, Number(volunteerId)));
        
      // Promedio de evaluaciones
      const [avgEvaluation] = await db
        .select({
          avgPunctuality: sql<number>`avg(${volunteerEvaluations.punctuality})::float`,
          avgAttitude: sql<number>`avg(${volunteerEvaluations.attitude})::float`,
          avgResponsibility: sql<number>`avg(${volunteerEvaluations.responsibility})::float`,
          avgOverall: sql<number>`avg(${volunteerEvaluations.overallPerformance})::float`
        })
        .from(volunteerEvaluations)
        .where(eq(volunteerEvaluations.volunteerId, Number(volunteerId)));
        
      // Devolver todos los datos en formato dashboard
      res.json({
        volunteerInfo,
        stats: {
          participations: {
            count: hoursStats?.participationCount || 0,
            totalHours: hoursStats?.totalHours || 0,
            avgHoursPerActivity: hoursStats?.avgHoursPerActivity || 0
          },
          evaluations: {
            avgPunctuality: avgEvaluation?.avgPunctuality || 0,
            avgAttitude: avgEvaluation?.avgAttitude || 0,
            avgResponsibility: avgEvaluation?.avgResponsibility || 0,
            avgOverall: avgEvaluation?.avgOverall || 0
          },
          recognitions: {
            count: recognitions.length
          }
        },
        recentActivity: {
          participations: participationsWithParkNames,
          evaluations,
          recognitions
        }
      });
    } catch (error) {
      console.error(`Error al obtener dashboard del voluntario:`, error);
      res.status(500).json({ message: "Error al obtener dashboard del voluntario" });
    }
  });
  
  // Obtener estadísticas generales del dashboard de voluntarios
  apiRouter.get("/volunteers/stats/dashboard", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Conteo total de voluntarios por estado
      const volunteersByStatus = await db
        .select({
          status: volunteers.status,
          count: sql<number>`count(*)::int`
        })
        .from(volunteers)
        .groupBy(volunteers.status);
        
      // Total de horas de voluntariado
      const [totalHours] = await db
        .select({
          total: sql<number>`sum(${volunteerParticipations.hoursContributed})::int`
        })
        .from(volunteerParticipations);
        
      // Actividades más populares
      const popularActivities = await db
        .select({
          activityName: volunteerParticipations.activityName,
          count: sql<number>`count(*)::int`
        })
        .from(volunteerParticipations)
        .groupBy(volunteerParticipations.activityName)
        .orderBy(sql`count(*) desc`)
        .limit(5);
        
      // Parques con más participación
      const popularParks = await db
        .select({
          parkId: volunteerParticipations.parkId,
          count: sql<number>`count(*)::int`
        })
        .from(volunteerParticipations)
        .groupBy(volunteerParticipations.parkId)
        .orderBy(sql`count(*) desc`)
        .limit(5);
        
      // Obtener nombres de parques populares
      const parkIds = popularParks.map(p => p.parkId);
      let parkNames = [];
      
      if (parkIds.length > 0) {
        parkNames = await db
          .select({
            id: parks.id,
            name: parks.name
          })
          .from(parks)
          .where(sql`${parks.id} = ANY(${parkIds})`);
      }
      
      // Combinar datos de parques populares con sus nombres
      const parksWithNames = popularParks.map(park => {
        const parkInfo = parkNames.find(p => p.id === park.parkId);
        return {
          ...park,
          parkName: parkInfo ? parkInfo.name : 'Parque desconocido'
        };
      });
      
      // Rendimiento promedio de los voluntarios
      const [avgPerformance] = await db
        .select({
          punctuality: sql<number>`avg(${volunteerEvaluations.punctuality})::float`,
          attitude: sql<number>`avg(${volunteerEvaluations.attitude})::float`,
          responsibility: sql<number>`avg(${volunteerEvaluations.responsibility})::float`,
          overall: sql<number>`avg(${volunteerEvaluations.overallPerformance})::float`
        })
        .from(volunteerEvaluations);
      
      res.json({
        volunteerCounts: {
          total: volunteersByStatus.reduce((sum, group) => sum + group.count, 0),
          byStatus: volunteersByStatus.reduce((obj, item) => {
            obj[item.status] = item.count;
            return obj;
          }, {} as Record<string, number>)
        },
        activities: {
          totalHours: totalHours?.total || 0,
          popularActivities
        },
        locations: {
          popularParks: parksWithNames
        },
        performance: avgPerformance || {
          punctuality: 0,
          attitude: 0,
          responsibility: 0,
          overall: 0
        }
      });
    } catch (error) {
      console.error("Error al obtener estadísticas de voluntarios:", error);
      res.status(500).json({ message: "Error al obtener estadísticas de voluntarios" });
    }
  });
}