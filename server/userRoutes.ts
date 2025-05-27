import { Request, Response, Router } from 'express';
import { storage } from './storage';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { fromZodError } from 'zod-validation-error';
import { db } from './db';
import { sql } from 'drizzle-orm';
import { syncInstructorProfileWithUser } from './syncInstructorProfile';

// Esquema para validar la creación de un usuario
const createUserSchema = z.object({
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(['admin', 'director', 'manager', 'supervisor', 'ciudadano', 'voluntario', 'instructor', 'user', 'guardaparques', 'guardia', 'concesionario']),
  municipalityId: z.number().nullable(),
});

// Esquema para validar la actualización de un usuario
const updateUserSchema = z.object({
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres").optional(),
  email: z.string().email("Email inválido").optional(),
  firstName: z.string().min(1, "El nombre es requerido").optional(),
  lastName: z.string().min(1, "El apellido es requerido").optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  role: z.enum(['admin', 'director', 'manager', 'supervisor', 'ciudadano', 'voluntario', 'instructor', 'user', 'guardaparques', 'guardia', 'concesionario']).optional(),
  municipalityId: z.number().nullable().optional(),
  profileImageUrl: z.string().optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  birthDate: z.string().optional(),
  bio: z.string().optional(),
  experience: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  preferredParkId: z.number().nullable().optional(),
  legalConsent: z.boolean().optional(),
});

// Función para sincronizar datos de usuario con la tabla de voluntarios
async function syncUserWithVolunteerTable(user: any) {
  try {
    console.log(`Sincronizando usuario ${user.id} con tabla de voluntarios...`);
    
    // Verificar si ya existe un registro en la tabla de voluntarios para este usuario
    const volunteerResult = await db.execute(
      sql`SELECT * FROM volunteers WHERE email = ${user.email}`
    );
    
    const volunteerExists = volunteerResult.rows && volunteerResult.rows.length > 0;
    
    // Convertir campos de usuario a formato de voluntario
    const volunteerData = {
      full_name: user.fullName,
      email: user.email,
      phone: user.phone || null,
      gender: user.gender || null,
      status: 'active',
      profile_image_url: user.profileImageUrl || null,
      previous_experience: null, // Estos campos pueden estar en un objeto adicional 
      address: user.address || null,
      emergency_contact: user.emergencyContactName || null,
      emergency_phone: user.emergencyContactPhone || null,
      preferred_park_id: user.preferredParkId || 3, // Usamos valor por defecto
      user_id: user.id,
      updated_at: new Date()
    };
    
    if (volunteerExists) {
      // Actualizar el registro existente
      const volunteerId = volunteerResult.rows[0].id;
      console.log(`Actualizando voluntario existente ID ${volunteerId}`);
      
      // Calcular la edad a partir de la fecha de nacimiento si existe, o mantener la existente
      let age = 18; // Valor por defecto
      if (user.birthDate) {
        const birthDate = new Date(user.birthDate);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        // Ajustar si aún no ha cumplido años este año
        if (today.getMonth() < birthDate.getMonth() || 
            (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }
      
      await db.execute(
        sql`UPDATE volunteers 
            SET full_name = ${volunteerData.full_name},
                email = ${volunteerData.email},
                phone = ${volunteerData.phone},
                gender = ${volunteerData.gender},
                status = ${volunteerData.status},
                profile_image_url = ${volunteerData.profile_image_url},
                user_id = ${volunteerData.user_id},
                updated_at = ${volunteerData.updated_at},
                age = ${age},
                preferred_park_id = ${user.preferredParkId || 3},
                address = ${user.address || null},
                emergency_contact = ${user.emergencyContactName || null},
                emergency_phone = ${user.emergencyContactPhone || null}
            WHERE id = ${volunteerId}`
      );
      
      console.log(`Voluntario ID ${volunteerId} actualizado correctamente`);
    } else {
      // Crear un nuevo registro
      console.log(`Creando nuevo registro de voluntario para usuario ID ${user.id}`);
      
      // Calcular la edad a partir de la fecha de nacimiento si existe, o usar 18 como valor predeterminado
      let age = 18; // Valor predeterminado
      if (user.birthDate) {
        const birthDate = new Date(user.birthDate);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        // Ajustar si aún no ha cumplido años este año
        if (today.getMonth() < birthDate.getMonth() || 
            (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }
      
      await db.execute(
        sql`INSERT INTO volunteers 
            (full_name, email, phone, gender, status, profile_image_url, user_id, 
             created_at, updated_at, age, legal_consent, preferred_park_id, 
             address, emergency_contact, emergency_phone)
            VALUES 
            (${volunteerData.full_name}, ${volunteerData.email}, ${volunteerData.phone}, 
             ${volunteerData.gender}, ${volunteerData.status}, ${volunteerData.profile_image_url}, 
             ${volunteerData.user_id}, ${new Date()}, ${volunteerData.updated_at}, ${age}, ${true}, 
             ${user.preferredParkId || 3}, ${user.address || null}, 
             ${user.emergencyContactName || null}, ${user.emergencyContactPhone || null})`
      );
      
      console.log(`Nuevo voluntario creado para usuario ID ${user.id}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error al sincronizar usuario con tabla de voluntarios:`, error);
    return false;
  }
}

export function registerUserRoutes(app: any, apiRouter: Router) {
  // Middleware para verificar si el usuario es administrador
  const isAdmin = (req: Request, res: Response, next: Function) => {
    // En desarrollo, omitimos la verificación de autenticación para facilitar las pruebas
    if (process.env.NODE_ENV === 'development') {
      // Agregamos un usuario admin simulado para pruebas
      req.user = {
        id: 1,
        username: 'admin',
        role: 'admin'
      };
      return next();
    }
    
    // En producción, verificamos la autenticación
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (req.user.role !== 'admin' && req.user.role !== 'director') {
      return res.status(403).json({ message: "You don't have permission to access this resource" });
    }
    
    next();
  };

  // GET /api/users - Obtener todos los usuarios
  apiRouter.get('/users', isAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      
      // No enviamos las contraseñas al cliente
      const safeUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(safeUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Error al obtener usuarios' });
    }
  });

  // GET /api/users/:id - Obtener un usuario por ID
  apiRouter.get('/users/:id', isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      // No enviamos la contraseña al cliente
      const { password, ...userWithoutPassword } = user;
      
      // Si el usuario es voluntario, obtenemos los datos adicionales de la tabla voluntarios
      if (user.role === 'voluntario') {
        try {
          // Buscar los datos adicionales del voluntario
          const volunteerResult = await db.execute(
            sql`SELECT * FROM volunteers WHERE user_id = ${userId}`
          );
          
          if (volunteerResult.rows && volunteerResult.rows.length > 0) {
            const volunteerData = volunteerResult.rows[0];
            console.log("Datos del voluntario encontrados:", volunteerData);
            
            // Creamos un nuevo objeto que incluya los datos del usuario y del voluntario
            const userDataWithVolunteer = {
              ...userWithoutPassword,
              preferredParkId: volunteerData.preferred_park_id,
              legalConsent: volunteerData.legal_consent === true,
              volunteerExperience: volunteerData.previous_experience,
              availability: volunteerData.available_hours,
              address: volunteerData.address || '',
              emergencyContactName: volunteerData.emergency_contact || '',
              emergencyContactPhone: volunteerData.emergency_phone || ''
            };
            
            console.log("🔍 DEBUG - Datos de voluntario agregados al usuario:", {
              address: volunteerData.address,
              emergencyContact: volunteerData.emergency_contact,
              emergencyPhone: volunteerData.emergency_phone
            });
            
            // Devolvemos directamente este objeto enriquecido
            return res.json(userDataWithVolunteer);
          }
        } catch (error) {
          console.error('Error al obtener datos de voluntario:', error);
          // No interrumpimos el flujo, devolvemos los datos de usuario que tenemos
        }
      }
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Error al obtener usuario' });
    }
  });

  // POST /api/users - Crear un nuevo usuario
  apiRouter.post('/users', isAdmin, async (req: Request, res: Response) => {
    try {
      // Imprimir los datos recibidos para diagnosticar problemas
      console.log("Datos recibidos en POST /users:", {
        ...req.body,
        password: req.body.password ? "[REDACTED]" : undefined
      });
      
      // Validar los datos del usuario
      try {
        const validationResult = createUserSchema.safeParse(req.body);
        if (!validationResult.success) {
          const formattedError = fromZodError(validationResult.error);
          console.error("Error detallado de validación:", JSON.stringify(formattedError, null, 2));
          console.error("Errores específicos:", formattedError.details);
          return res.status(400).json({ 
            message: 'Error de validación', 
            details: formattedError.message,
            errors: formattedError.details
          });
        }
        
        const userData = validationResult.data;
        
        // Verificar si el usuario ya existe
        const existingUser = await storage.getUserByUsername(userData.username);
        if (existingUser) {
          return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
        }
        
        // Verificar si el email ya está en uso
        const existingEmail = await storage.getUserByEmail(userData.email);
        if (existingEmail) {
          return res.status(400).json({ message: 'El email ya está en uso' });
        }
        
        // En este caso, no hasheamos la contraseña para facilitar las pruebas
        const hashedPassword = userData.password;
        
        // Crear el usuario con logging detallado
        console.log("Datos que se enviarán a createUser:", {
          ...userData,
          password: "[REDACTED]",
          fullName: `${userData.firstName} ${userData.lastName}`
        });
        
        try {
          // Preparamos todos los campos adicionales
          const userDataToSave = {
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            role: userData.role,
            firstName: userData.firstName,
            lastName: userData.lastName,
            fullName: `${userData.firstName} ${userData.lastName}`,
            municipalityId: userData.municipalityId,
            phone: userData.phone || null,
            gender: userData.gender || null,
            birthDate: userData.birthDate || null,
            bio: userData.bio || null,
            profileImageUrl: userData.profileImageUrl || null,
            address: userData.address || null,
            emergencyContactName: userData.emergencyContactName || null,
            emergencyContactPhone: userData.emergencyContactPhone || null,
            preferredParkId: userData.preferredParkId || null,
            legalConsent: userData.legalConsent || false
          };

          const newUser = await storage.createUser(userDataToSave);
          
          console.log("Usuario creado exitosamente:", {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
          });
          
          // Guardar la imagen de perfil en el caché si existe
          if (userData.profileImageUrl && newUser.id) {
            const { saveProfileImage } = await import('./profileImageCache');
            saveProfileImage(newUser.id, userData.profileImageUrl);
            console.log(`Imagen de perfil guardada en caché para usuario ${newUser.id}: ${userData.profileImageUrl}`);
          }
          
          // Si el usuario tiene rol de voluntario, sincronizar con la tabla de voluntarios
          if (newUser.role === 'voluntario') {
            await syncUserWithVolunteerTable(newUser);
          }
          
          // No enviamos la contraseña en la respuesta
          const { password, ...userWithoutPassword } = newUser;
          
          res.status(201).json(userWithoutPassword);
        } catch (dbError) {
          console.error("Error específico al crear usuario en la base de datos:", dbError);
          res.status(500).json({ message: 'Error al crear usuario en la base de datos', details: dbError.message });
        }
      } catch (validationError) {
        console.error("Error durante la validación:", validationError);
        return res.status(400).json({ 
          message: 'Error de validación', 
          details: 'Error en el proceso de validación'
        });
      }
    } catch (error) {
      console.error('Error general creating user:', error);
      res.status(500).json({ message: 'Error al crear usuario' });
    }
  });

  // PUT /api/users/:id - Actualizar un usuario existente
  apiRouter.put('/users/:id', isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);
      
      // Verificar si el usuario existe
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      // Validar los datos del usuario
      const updateData = updateUserSchema.parse(req.body);
      
      // Si se está actualizando el nombre de usuario, verificar que no esté en uso
      if (updateData.username && updateData.username !== existingUser.username) {
        const userWithSameUsername = await storage.getUserByUsername(updateData.username);
        if (userWithSameUsername && userWithSameUsername.id !== userId) {
          return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
        }
      }
      
      // Si se está actualizando el email, verificar que no esté en uso
      if (updateData.email && updateData.email !== existingUser.email) {
        const userWithSameEmail = await storage.getUserByEmail(updateData.email);
        if (userWithSameEmail && userWithSameEmail.id !== userId) {
          return res.status(400).json({ message: 'El email ya está en uso' });
        }
      }
      
      // Preparar los datos para la actualización
      const userData: any = { ...updateData };
      
      // Si se proporcionaron nombre y apellido, actualizar el nombre completo
      if (updateData.firstName && updateData.lastName) {
        userData.fullName = `${updateData.firstName} ${updateData.lastName}`;
      } else if (updateData.firstName) {
        userData.fullName = `${updateData.firstName} ${existingUser.lastName || ''}`;
      } else if (updateData.lastName) {
        userData.fullName = `${existingUser.firstName || ''} ${updateData.lastName}`;
      }
      
      // Procesar campos adicionales de perfil
      if (updateData.phone !== undefined) {
        userData.phone = updateData.phone || null;
      }
      
      if (updateData.gender !== undefined) {
        userData.gender = updateData.gender || null;
      }
      
      if (updateData.birthDate !== undefined) {
        userData.birthDate = updateData.birthDate ? new Date(updateData.birthDate) : null;
      }
      
      if (updateData.bio !== undefined) {
        userData.bio = updateData.bio || null;
      }
      
      if (updateData.profileImageUrl !== undefined) {
        userData.profileImageUrl = updateData.profileImageUrl || null;
      }
      
      // Actualizar timestamp
      userData.updatedAt = new Date();
      
      // Si se proporcionó contraseña, encriptarla (en un entorno real)
      if (updateData.password) {
        // userData.password = await bcrypt.hash(updateData.password, 10);
        
        // En este caso, no hasheamos la contraseña para facilitar las pruebas
        userData.password = updateData.password;
      }
      
      // Actualizar el usuario
      const updatedUser = await storage.updateUser(userId, userData);
      
      // Si el usuario tiene rol de instructor, sincronizar con la tabla de instructores
      if (updatedUser.role === 'instructor') {
        try {
          // Sincronizamos los datos con el perfil de instructor
          console.log(`⚙️ Sincronizando perfil de instructor para usuario ID: ${updatedUser.id}`);
          const syncResult = await syncInstructorProfileWithUser(updatedUser.id);
          console.log(`✅ Resultado de sincronización de instructor:`, syncResult);
        } catch (error) {
          console.error(`❌ Error al sincronizar perfil de instructor para usuario ID: ${updatedUser.id}:`, error);
          // No interrumpimos el flujo principal si hay error en esto
        }
      }
      
      // Si el usuario tiene rol de voluntario, sincronizar con la tabla de voluntarios
      if (updatedUser.role === 'voluntario') {
        try {
          // Primero sincronizamos los datos básicos
          await syncUserWithVolunteerTable(updatedUser);
          
          // Si hay información adicional de voluntario, hacemos una solicitud a la ruta especializada
          if (updateData.volunteerExperience || updateData.availability || 
              updateData.preferredParkId !== undefined || updateData.legalConsent) {
            
            // Encuentro el ID del voluntario
            const volunteerResult = await db.execute(
              sql`SELECT id FROM volunteers WHERE user_id = ${updatedUser.id}`
            );
            
            if (volunteerResult.rows && volunteerResult.rows.length > 0) {
              const volunteerId = volunteerResult.rows[0].id;
              
              // Llamamos a la API interna para actualizar el perfil de voluntario
              const volunteerUpdateData = {
                volunteerId: volunteerId,
                userId: updatedUser.id,
                // Campos de experiencia y disponibilidad
                volunteerExperience: updateData.volunteerExperience,
                availability: updateData.availability,
                availableDays: updateData.availableDays,
                // Campos de parque preferido y consentimiento
                preferredParkId: updateData.preferredParkId,
                legalConsent: updateData.legalConsent,
                // Campos de áreas de interés
                interestNature: updateData.interestNature,
                interestEvents: updateData.interestEvents,
                interestEducation: updateData.interestEducation,
                interestMaintenance: updateData.interestMaintenance,
                interestSports: updateData.interestSports, 
                interestCultural: updateData.interestCultural
              };
              
              // Hacer la solicitud directamente a nuestra API interna
              try {
                console.log("Enviando datos de voluntario a /api/volunteers/update-profile:", volunteerUpdateData);
                
                // Enviar datos directamente a nuestra API (usando conexión interna)
                // Asegurarnos de tener la ID del voluntario
                if (volunteerId) {
                  console.log("Datos de voluntario completos:", updateData);
                
                  // Log para depuración de lo que vamos a enviar al endpoint
                  console.log("Datos de voluntario que se van a actualizar:", {
                    volunteerId,
                    address: updateData.address,
                    emergencyContactName: updateData.emergencyContactName,
                    emergencyContactPhone: updateData.emergencyContactPhone,
                    preferredParkId: updateData.preferredParkId,
                    volunteerExperience: updateData.volunteerExperience,
                    availability: updateData.availability
                  });
                  
                  try {
                    // Preparar datos completos para el endpoint
                    const completeVolunteerData = {
                      volunteerId: volunteerId,
                      userId: updatedUser.id,
                      // Datos básicos
                      address: updateData.address,
                      emergencyContactName: updateData.emergencyContactName,
                      emergencyContactPhone: updateData.emergencyContactPhone,
                      // Campos de experiencia y disponibilidad (con valores por defecto)
                      volunteerExperience: updateData.volunteerExperience || "",
                      availability: updateData.availability || "flexible",
                      availableDays: updateData.availableDays || "weekdays",
                      // Campos de parque preferido y consentimiento
                      preferredParkId: updateData.preferredParkId || 1,
                      legalConsent: updateData.legalConsent === true,
                      // Campos de áreas de interés (con valores por defecto)
                      interestNature: updateData.interestNature === true,
                      interestEvents: updateData.interestEvents === true,
                      interestEducation: updateData.interestEducation === true,
                      interestMaintenance: updateData.interestMaintenance === true,
                      interestSports: updateData.interestSports === true,
                      interestCultural: updateData.interestCultural === true
                    };
                    
                    console.log("ENVIANDO DATOS COMPLETOS:", completeVolunteerData);
                    
                    // Llamar al endpoint interno
                    const response = await fetch('http://localhost:5000/api/volunteers/update-profile', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(completeVolunteerData)
                    });
                    
                    if (response.ok) {
                      console.log("Perfil de voluntario actualizado correctamente mediante llamada HTTP interna");
                    } else {
                      console.error("Error al actualizar perfil de voluntario:", await response.text());
                      
                      // Como respaldo, actualizar solo los campos básicos del voluntario
                      await db.execute(
                        sql`UPDATE volunteers 
                            SET address = ${updateData.address || null},
                                emergency_contact = ${updateData.emergencyContactName || null},
                                emergency_phone = ${updateData.emergencyContactPhone || null},
                                preferred_park_id = ${updateData.preferredParkId || null},
                                legal_consent = ${updateData.legalConsent === true},
                                previous_experience = ${updateData.volunteerExperience || null},
                                available_hours = ${updateData.availability || null},
                                updated_at = ${new Date()}
                            WHERE id = ${volunteerId}`
                      );
                    }
                  } catch (error) {
                    console.error("Error al llamar al endpoint interno:", error);
                    
                    // Como respaldo, actualizar solo los campos básicos
                    try {
                      // 1. Actualizar campos básicos
                      await db.execute(
                        sql`UPDATE volunteers 
                            SET address = ${updateData.address || null},
                                emergency_contact = ${updateData.emergencyContactName || null},
                                emergency_phone = ${updateData.emergencyContactPhone || null},
                                preferred_park_id = ${updateData.preferredParkId || null},
                                previous_experience = ${updateData.volunteerExperience || null},
                                available_hours = ${updateData.availability || null},
                                available_days = ${updateData.availableDays || null},
                                legal_consent = ${updateData.legalConsent === true},
                                updated_at = ${new Date()}
                            WHERE id = ${volunteerId}`
                      );
                      
                      // 2. Preparar áreas de interés como array
                      const interestAreas = [];
                      if (updateData.interestNature) interestAreas.push('nature');
                      if (updateData.interestEvents) interestAreas.push('events');
                      if (updateData.interestEducation) interestAreas.push('education');
                      if (updateData.interestMaintenance) interestAreas.push('maintenance');
                      if (updateData.interestSports) interestAreas.push('sports');
                      if (updateData.interestCultural) interestAreas.push('cultural');
                      
                      // 3. Actualizar áreas de interés en operación separada si hay alguna
                      if (interestAreas.length > 0) {
                        const interestAreasJSON = JSON.stringify(interestAreas);
                        await db.execute(
                          sql`UPDATE volunteers 
                              SET interest_areas = ${interestAreasJSON}
                              WHERE id = ${volunteerId}`
                        );
                      }
                      
                      // Verificar datos guardados
                      const verifyResult = await db.execute(
                        sql`SELECT * FROM volunteers WHERE id = ${volunteerId}`
                      );
                      
                      if (verifyResult.rows && verifyResult.rows.length > 0) {
                        console.log("Datos del voluntario guardados y verificados:", {
                          id: verifyResult.rows[0].id,
                          address: verifyResult.rows[0].address,
                          emergency_contact: verifyResult.rows[0].emergency_contact,
                          emergency_phone: verifyResult.rows[0].emergency_phone,
                          previous_experience: verifyResult.rows[0].previous_experience,
                          available_hours: verifyResult.rows[0].available_hours,
                          available_days: verifyResult.rows[0].available_days,
                          interest_areas: verifyResult.rows[0].interest_areas,
                          legal_consent: verifyResult.rows[0].legal_consent
                        });
                      }
                    } catch (directError) {
                      console.error("Error al actualizar directamente el perfil de voluntario:", directError);
                    }
                  }
                  
                  console.log(`Voluntario ID ${volunteerId} actualizado correctamente con parque preferido ID: ${volunteerUpdateData.preferredParkId}`);
                } else {
                  console.error("Error: No se encontró ID de voluntario para actualizar");
                }
                
                console.log('Perfil de voluntario actualizado correctamente mediante actualización directa');
              } catch (updateError) {
                console.error("Error al actualizar directamente el perfil de voluntario:", updateError);
              }
              
              console.log('Perfil de voluntario actualizado correctamente');
            }
          }
        } catch (error) {
          console.error("Error al actualizar información adicional de voluntario:", error);
          // No interrumpimos el flujo principal si hay error en esto
        }
      }
      
      // No enviamos la contraseña en la respuesta
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          message: 'Error de validación', 
          details: validationError.message 
        });
      }
      
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Error al actualizar usuario' });
    }
  });

  // DELETE /api/users/:id - Eliminar un usuario
  apiRouter.delete('/users/:id', isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);
      
      // Verificar si el usuario existe
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      // No permitir eliminar al usuario con el que se está autenticado
      if (req.user && req.user.id === userId) {
        return res.status(400).json({ message: 'No puedes eliminar tu propio usuario' });
      }
      
      // Eliminar el usuario
      await storage.deleteUser(userId);
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Error al eliminar usuario' });
    }
  });
}