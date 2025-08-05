import { Request, Response, Router } from "express";
import { db } from "./db";
import { eq, and, not, or, like } from "drizzle-orm";
import { storage } from "./storage";
import * as schema from "../shared/schema";

/**
 * Registra las rutas para el módulo de concesionarios
 * @param app Aplicación Express
 * @param apiRouter Router de la API
 * @param isAuthenticated Middleware de autenticación
 */
export function registerConcessionairesRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  // Obtener todos los concesionarios
  apiRouter.get("/concessionaires", async (req: Request, res: Response) => {
    try {
      const users = await db.query.users.findMany({
        where: eq(schema.users.role, "concessionaire"),
        with: {
          concessionaireProfile: true
        }
      });
      
      res.json(users);
    } catch (error) {
      console.error("Error al obtener concesionarios:", error);
      res.status(500).json({ message: "Error al obtener los concesionarios" });
    }
  });

  // Obtener un concesionario por ID
  apiRouter.get("/concessionaires/:id", async (req: Request, res: Response) => {
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
  apiRouter.post("/concessionaires", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { 
        username, 
        password, 
        email, 
        fullName, 
        phone,
        rfc, 
        type, 
        tax_address, 
        legal_representative 
      } = req.body;
      
      // Validar que los campos requeridos estén presentes
      if (!username || !password || !email || !fullName || !rfc || !type || !tax_address) {
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
      const existingConcessionaire = await db.query.concessionaireProfiles.findFirst({
        where: eq(schema.concessionaireProfiles.rfc, rfc)
      });
      
      if (existingConcessionaire) {
        return res.status(400).json({ message: "Ya existe un concesionario con este RFC" });
      }
      
      // Crear el usuario
      const [newUser] = await db.insert(schema.users).values({
        username,
        password, // Nota: En producción, este password debería ser hasheado
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
        taxAddress: tax_address,
        legalRepresentative: legal_representative,
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
  apiRouter.put("/concessionaires/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { 
        email, 
        fullName, 
        phone, 
        rfc, 
        type, 
        tax_address, 
        legal_representative,
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
      
      // Verificar si el RFC ya está en uso por otro concesionario
      if (rfc) {
        const existingConcessionaire = await db.query.concessionaireProfiles.findFirst({
          where: and(
            eq(schema.concessionaireProfiles.rfc, rfc),
            not(eq(schema.concessionaireProfiles.userId, parseInt(id)))
          )
        });
        
        if (existingConcessionaire) {
          return res.status(400).json({ message: "Ya existe otro concesionario con este RFC" });
        }
      }
      
      // Actualizar el usuario
      const [updatedUser] = await db.update(schema.users)
        .set({
          email: email || user.email,
          fullName: fullName || user.fullName,
          phone: phone || user.phone,
          updatedAt: new Date()
        })
        .where(eq(schema.users.id, parseInt(id)))
        .returning();
      
      // Actualizar el perfil de concesionario
      const [updatedProfile] = await db.update(schema.concessionaireProfiles)
        .set({
          type: type || user.concessionaireProfile.type,
          rfc: rfc || user.concessionaireProfile.rfc,
          taxAddress: tax_address || user.concessionaireProfile.taxAddress,
          legalRepresentative: legal_representative || user.concessionaireProfile.legalRepresentative,
          status: status || user.concessionaireProfile.status,
          notes: notes || user.concessionaireProfile.notes,
          updatedAt: new Date()
        })
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
  apiRouter.post("/concessionaires/:id/toggle-status", isAuthenticated, async (req: Request, res: Response) => {
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
  apiRouter.get("/concessionaires/:id/documents", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const documents = await db.query.concessionaireDocuments.findMany({
        where: eq(schema.concessionaireDocuments.userId, parseInt(id)),
        orderBy: (documents, { desc }) => [desc(documents.uploadDate)],
      });
      
      res.json(documents);
    } catch (error) {
      console.error("Error al obtener documentos del concesionario:", error);
      res.status(500).json({ message: "Error al obtener los documentos del concesionario" });
    }
  });

  // Subir un documento para un concesionario
  apiRouter.post("/concessionaires/:id/documents", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { document_type, document_name, document_url, expiry_date, notes } = req.body;
      
      // Validar que los campos requeridos estén presentes
      if (!document_type || !document_name || !document_url) {
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
        documentType: document_type,
        documentName: document_name,
        documentUrl: document_url,
        uploadDate: new Date(),
        expiryDate: expiry_date ? new Date(expiry_date) : null,
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
  apiRouter.post("/concessionaires/:userId/documents/:documentId/verify", isAuthenticated, async (req: Request, res: Response) => {
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
  apiRouter.delete("/concessionaires/:userId/documents/:documentId", isAuthenticated, async (req: Request, res: Response) => {
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