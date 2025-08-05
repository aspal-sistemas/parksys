import { Request, Response, Router } from "express";
import { db } from "./db";
import { eq, and, not, or, like } from "drizzle-orm";
import { storage } from "./storage";
import * as schema from "../shared/schema";
import bcrypt from "bcryptjs";

/**
 * Registra las rutas para el módulo de concesionarios dentro del sistema de usuarios
 * @param app Aplicación Express
 * @param apiRouter Router de la API
 * @param isAuthenticated Middleware de autenticación
 */
export function registerUsersConcessionairesRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  // Obtener todos los concesionarios
  apiRouter.get("/users/concessionaires", async (_req: Request, res: Response) => {
    try {
      const users = await db.query.users.findMany({
        where: eq(schema.users.role, "concessionaire"),
        with: {
          concessionaireProfile: true
        },
        orderBy: (users, { desc }) => [desc(users.createdAt)]
      });
      
      res.json(users);
    } catch (error) {
      console.error("Error al obtener concesionarios:", error);
      res.status(500).json({ message: "Error al obtener los concesionarios" });
    }
  });

  // Obtener un concesionario por ID
  apiRouter.get("/users/concessionaires/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const user = await db.query.users.findFirst({
        where: and(
          eq(schema.users.id, parseInt(id)),
          eq(schema.users.role, "concessionaire")
        ),
        with: {
          concessionaireProfile: true
        }
      });
      
      if (!user) {
        return res.status(404).json({ message: "Concesionario no encontrado" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error al obtener concesionario:", error);
      res.status(500).json({ message: "Error al obtener el concesionario" });
    }
  });

  // Crear un nuevo concesionario
  apiRouter.post("/users/concessionaires", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { 
        username, 
        password, 
        email, 
        fullName, 
        phone,
        type, 
        rfc, 
        taxAddress, 
        legalRepresentative,
        notes 
      } = req.body;
      
      // Validar que los campos requeridos estén presentes
      if (!username || !password || !email || !fullName || !type || !rfc || !taxAddress) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
      }
      
      // Verificar si ya existe un usuario con el mismo username o email
      const existingUser = await db.query.users.findFirst({
        where: or(
          eq(schema.users.username, username),
          eq(schema.users.email, email)
        )
      });
      
      if (existingUser) {
        return res.status(400).json({ message: "Ya existe un usuario con este nombre de usuario o correo electrónico" });
      }
      
      // Verificar si ya existe un concesionario con el mismo RFC
      const existingProfile = await db.query.concessionaireProfiles.findFirst({
        where: eq(schema.concessionaireProfiles.rfc, rfc)
      });
      
      if (existingProfile) {
        return res.status(400).json({ message: "Ya existe un concesionario con este RFC" });
      }
      
      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Crear el usuario
      const [newUser] = await db.insert(schema.users).values({
        username,
        password: hashedPassword,
        email,
        fullName,
        phone,
        role: "concessionaire",
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      // Crear el perfil de concesionario
      const [concessionaireProfile] = await db.insert(schema.concessionaireProfiles).values({
        userId: newUser.id,
        type,
        rfc,
        taxAddress,
        legalRepresentative,
        notes,
        status: "activo",
        registrationDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      res.status(201).json({
        ...newUser,
        concessionaireProfile
      });
    } catch (error) {
      console.error("Error al crear concesionario:", error);
      res.status(500).json({ message: "Error al crear el concesionario" });
    }
  });

  // Actualizar un concesionario
  apiRouter.put("/users/concessionaires/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { 
        email, 
        fullName, 
        phone, 
        password,
        type, 
        rfc, 
        taxAddress, 
        legalRepresentative,
        status,
        notes 
      } = req.body;
      
      // Verificar si existe el usuario
      const user = await db.query.users.findFirst({
        where: and(
          eq(schema.users.id, parseInt(id)),
          eq(schema.users.role, "concessionaire")
        ),
        with: {
          concessionaireProfile: true
        }
      });
      
      if (!user) {
        return res.status(404).json({ message: "Concesionario no encontrado" });
      }
      
      // Verificar si el RFC ya está en uso por otro concesionario si se está cambiando
      if (rfc && rfc !== user.concessionaireProfile?.rfc) {
        const existingProfile = await db.query.concessionaireProfiles.findFirst({
          where: and(
            eq(schema.concessionaireProfiles.rfc, rfc),
            not(eq(schema.concessionaireProfiles.userId, parseInt(id)))
          )
        });
        
        if (existingProfile) {
          return res.status(400).json({ message: "Ya existe otro concesionario con este RFC" });
        }
      }
      
      // Verificar si el email ya está en uso por otro usuario si se está cambiando
      if (email && email !== user.email) {
        const existingUser = await db.query.users.findFirst({
          where: and(
            eq(schema.users.email, email),
            not(eq(schema.users.id, parseInt(id)))
          )
        });
        
        if (existingUser) {
          return res.status(400).json({ message: "El correo electrónico ya está en uso" });
        }
      }
      
      // Actualizar el usuario
      const userUpdateData: any = {
        updatedAt: new Date()
      };
      
      if (email) userUpdateData.email = email;
      if (fullName) userUpdateData.fullName = fullName;
      if (phone) userUpdateData.phone = phone;
      
      // Si se proporciona una nueva contraseña, hashearla
      if (password) {
        userUpdateData.password = await bcrypt.hash(password, 10);
      }
      
      const [updatedUser] = await db.update(schema.users)
        .set(userUpdateData)
        .where(eq(schema.users.id, parseInt(id)))
        .returning();
      
      // Actualizar el perfil de concesionario
      const profileUpdateData: any = {
        updatedAt: new Date()
      };
      
      if (type) profileUpdateData.type = type;
      if (rfc) profileUpdateData.rfc = rfc;
      if (taxAddress) profileUpdateData.taxAddress = taxAddress;
      if (legalRepresentative) profileUpdateData.legalRepresentative = legalRepresentative;
      if (status) profileUpdateData.status = status;
      if (notes) profileUpdateData.notes = notes;
      
      const [updatedProfile] = await db.update(schema.concessionaireProfiles)
        .set(profileUpdateData)
        .where(eq(schema.concessionaireProfiles.userId, parseInt(id)))
        .returning();
      
      res.json({
        ...updatedUser,
        concessionaireProfile: updatedProfile
      });
    } catch (error) {
      console.error("Error al actualizar concesionario:", error);
      res.status(500).json({ message: "Error al actualizar el concesionario" });
    }
  });

  // Cambiar el estado de un concesionario (activar/desactivar)
  apiRouter.post("/users/concessionaires/:id/toggle-status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !['activo', 'inactivo', 'suspendido'].includes(status)) {
        return res.status(400).json({ message: "Estado no válido" });
      }
      
      // Verificar si existe el concesionario
      const user = await db.query.users.findFirst({
        where: and(
          eq(schema.users.id, parseInt(id)),
          eq(schema.users.role, "concessionaire")
        ),
        with: {
          concessionaireProfile: true
        }
      });
      
      if (!user) {
        return res.status(404).json({ message: "Concesionario no encontrado" });
      }
      
      // Actualizar el estado del perfil de concesionario
      const [updatedProfile] = await db.update(schema.concessionaireProfiles)
        .set({
          status,
          updatedAt: new Date()
        })
        .where(eq(schema.concessionaireProfiles.userId, parseInt(id)))
        .returning();
      
      res.json({
        ...user,
        concessionaireProfile: updatedProfile
      });
    } catch (error) {
      console.error("Error al cambiar el estado del concesionario:", error);
      res.status(500).json({ message: "Error al cambiar el estado del concesionario" });
    }
  });

  // Obtener los documentos de un concesionario
  apiRouter.get("/users/concessionaires/:id/documents", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const documents = await db.query.concessionaireDocuments.findMany({
        where: eq(schema.concessionaireDocuments.userId, parseInt(id)),
        orderBy: (documents, { desc }) => [desc(documents.uploadDate)]
      });
      
      res.json(documents);
    } catch (error) {
      console.error("Error al obtener documentos del concesionario:", error);
      res.status(500).json({ message: "Error al obtener los documentos del concesionario" });
    }
  });

  // Subir un documento para un concesionario
  apiRouter.post("/users/concessionaires/:id/documents", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { documentType, documentName, documentUrl, expiryDate, notes } = req.body;
      
      // Validar que los campos requeridos estén presentes
      if (!documentType || !documentName || !documentUrl) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
      }
      
      // Verificar si existe el concesionario
      const user = await db.query.users.findFirst({
        where: and(
          eq(schema.users.id, parseInt(id)),
          eq(schema.users.role, "concessionaire")
        )
      });
      
      if (!user) {
        return res.status(404).json({ message: "Concesionario no encontrado" });
      }
      
      // Crear el documento
      const [newDocument] = await db.insert(schema.concessionaireDocuments).values({
        userId: parseInt(id),
        documentType,
        documentName,
        documentUrl,
        uploadDate: new Date(),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isVerified: false,
        notes,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      res.status(201).json(newDocument);
    } catch (error) {
      console.error("Error al subir documento:", error);
      res.status(500).json({ message: "Error al subir el documento" });
    }
  });

  // Verificar un documento
  apiRouter.post("/users/concessionaires/:userId/documents/:documentId/verify", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { userId, documentId } = req.params;
      
      // Verificar si existe el documento
      const document = await db.query.concessionaireDocuments.findFirst({
        where: and(
          eq(schema.concessionaireDocuments.id, parseInt(documentId)),
          eq(schema.concessionaireDocuments.userId, parseInt(userId))
        )
      });
      
      if (!document) {
        return res.status(404).json({ message: "Documento no encontrado" });
      }
      
      // Actualizar el documento
      const [updatedDocument] = await db.update(schema.concessionaireDocuments)
        .set({
          isVerified: true,
          verificationDate: new Date(),
          verifiedById: req.user?.id || null,
          updatedAt: new Date()
        })
        .where(eq(schema.concessionaireDocuments.id, parseInt(documentId)))
        .returning();
      
      res.json(updatedDocument);
    } catch (error) {
      console.error("Error al verificar documento:", error);
      res.status(500).json({ message: "Error al verificar el documento" });
    }
  });

  // Eliminar un documento
  apiRouter.delete("/users/concessionaires/:userId/documents/:documentId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { userId, documentId } = req.params;
      
      // Verificar si existe el documento
      const document = await db.query.concessionaireDocuments.findFirst({
        where: and(
          eq(schema.concessionaireDocuments.id, parseInt(documentId)),
          eq(schema.concessionaireDocuments.userId, parseInt(userId))
        )
      });
      
      if (!document) {
        return res.status(404).json({ message: "Documento no encontrado" });
      }
      
      // Eliminar el documento
      await db.delete(schema.concessionaireDocuments)
        .where(eq(schema.concessionaireDocuments.id, parseInt(documentId)));
      
      res.json({ message: "Documento eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar documento:", error);
      res.status(500).json({ message: "Error al eliminar el documento" });
    }
  });
}