import { Request, Response, Router } from "express";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { storage } from "./storage";

/**
 * Registra las rutas para el módulo de concesionarios
 * @param app Aplicación Express
 * @param apiRouter Router de la API
 * @param isAuthenticated Middleware de autenticación
 */
export function registerConcessionaireRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  // Obtener todos los concesionarios
  apiRouter.get("/concessionaires", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const concessionaires = await db.query.concessionaires.findMany({
        orderBy: (concessionaires, { desc }) => [desc(concessionaires.createdAt)],
      });
      
      res.json(concessionaires);
    } catch (error) {
      console.error("Error al obtener concesionarios:", error);
      res.status(500).json({ message: "Error al obtener los concesionarios" });
    }
  });

  // Obtener un concesionario por ID
  apiRouter.get("/concessionaires/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [concessionaire] = await db.query.concessionaires.findMany({
        where: eq(db.schema.concessionaires.id, parseInt(id)),
      });
      
      if (!concessionaire) {
        return res.status(404).json({ message: "Concesionario no encontrado" });
      }
      
      res.json(concessionaire);
    } catch (error) {
      console.error("Error al obtener concesionario:", error);
      res.status(500).json({ message: "Error al obtener el concesionario" });
    }
  });

  // Crear un nuevo concesionario
  apiRouter.post("/concessionaires", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { name, type, rfc, tax_address, legal_representative, phone, email, notes } = req.body;
      
      // Validar que los campos requeridos estén presentes
      if (!name || !type || !rfc || !tax_address) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
      }
      
      // Verificar si ya existe un concesionario con el mismo RFC
      const [existingConcessionaireRFC] = await db.query.concessionaires.findMany({
        where: eq(db.schema.concessionaires.rfc, rfc),
      });
      
      if (existingConcessionaireRFC) {
        return res.status(400).json({ message: "Ya existe un concesionario con este RFC" });
      }
      
      // Crear el concesionario
      const [newConcessionaire] = await db.insert(db.schema.concessionaires).values({
        name,
        type,
        rfc,
        tax_address,
        legal_representative,
        phone,
        email,
        notes,
        status: 'activo',
        registration_date: new Date(),
        created_by_id: req.user?.id || null,
        created_at: new Date(),
        updated_at: new Date(),
      }).returning();
      
      res.status(201).json(newConcessionaire);
    } catch (error) {
      console.error("Error al crear concesionario:", error);
      res.status(500).json({ message: "Error al crear el concesionario" });
    }
  });

  // Actualizar un concesionario
  apiRouter.put("/concessionaires/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, type, rfc, tax_address, legal_representative, phone, email, notes } = req.body;
      
      // Validar que los campos requeridos estén presentes
      if (!name || !type || !rfc || !tax_address) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
      }
      
      // Verificar si existe el concesionario
      const [existingConcessionaire] = await db.query.concessionaires.findMany({
        where: eq(db.schema.concessionaires.id, parseInt(id)),
      });
      
      if (!existingConcessionaire) {
        return res.status(404).json({ message: "Concesionario no encontrado" });
      }
      
      // Verificar si el RFC ya está en uso por otro concesionario
      const [existingConcessionaireRFC] = await db.query.concessionaires.findMany({
        where: (concessionaires, { and, eq, ne }) => and(
          eq(concessionaires.rfc, rfc),
          ne(concessionaires.id, parseInt(id))
        ),
      });
      
      if (existingConcessionaireRFC) {
        return res.status(400).json({ message: "Ya existe otro concesionario con este RFC" });
      }
      
      // Actualizar el concesionario
      const [updatedConcessionaire] = await db.update(db.schema.concessionaires)
        .set({
          name,
          type,
          rfc,
          tax_address,
          legal_representative,
          phone,
          email,
          notes,
          updated_at: new Date(),
        })
        .where(eq(db.schema.concessionaires.id, parseInt(id)))
        .returning();
      
      res.json(updatedConcessionaire);
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
      const [existingConcessionaire] = await db.query.concessionaires.findMany({
        where: eq(db.schema.concessionaires.id, parseInt(id)),
      });
      
      if (!existingConcessionaire) {
        return res.status(404).json({ message: "Concesionario no encontrado" });
      }
      
      // Actualizar el estado del concesionario
      const [updatedConcessionaire] = await db.update(db.schema.concessionaires)
        .set({
          status,
          updated_at: new Date(),
        })
        .where(eq(db.schema.concessionaires.id, parseInt(id)))
        .returning();
      
      res.json(updatedConcessionaire);
    } catch (error) {
      console.error("Error al cambiar el estado del concesionario:", error);
      res.status(500).json({ message: "Error al cambiar el estado del concesionario" });
    }
  });

  // Obtener los documentos de un concesionario
  apiRouter.get("/concessionaires/:id/documents", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const documents = await db.query.concessionaire_documents.findMany({
        where: eq(db.schema.concessionaire_documents.concessionaire_id, parseInt(id)),
        orderBy: (documents, { desc }) => [desc(documents.upload_date)],
      });
      
      res.json(documents);
    } catch (error) {
      console.error("Error al obtener documentos del concesionario:", error);
      res.status(500).json({ message: "Error al obtener los documentos del concesionario" });
    }
  });

  // Obtener el historial de relaciones de un concesionario con parques
  apiRouter.get("/concessionaires/:id/history", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const history = await db.query.concessionaire_history.findMany({
        where: eq(db.schema.concessionaire_history.concessionaire_id, parseInt(id)),
        orderBy: (history, { desc }) => [desc(history.start_date)],
        with: {
          park: true,
          concession: true,
        },
      });
      
      res.json(history);
    } catch (error) {
      console.error("Error al obtener historial del concesionario:", error);
      res.status(500).json({ message: "Error al obtener el historial del concesionario" });
    }
  });

  // Obtener las evaluaciones de un concesionario
  apiRouter.get("/concessionaires/:id/evaluations", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const evaluations = await db.query.concessionaire_evaluations.findMany({
        where: eq(db.schema.concessionaire_evaluations.concessionaire_id, parseInt(id)),
        orderBy: (evaluations, { desc }) => [desc(evaluations.evaluation_date)],
        with: {
          park: true,
          concession: true,
        },
      });
      
      res.json(evaluations);
    } catch (error) {
      console.error("Error al obtener evaluaciones del concesionario:", error);
      res.status(500).json({ message: "Error al obtener las evaluaciones del concesionario" });
    }
  });
}