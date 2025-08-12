import { Request, Response, Router } from "express";
import { db } from "./db";

/**
 * Registra las rutas para el módulo de concesionarios (versión simplificada)
 */
export function registerConcessionairesSimpleRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  // Obtener todos los concesionarios
  apiRouter.get("/concessionaires", async (req: Request, res: Response) => {
    try {
      console.log("🏪 Obteniendo concesionarios...");
      
      const result = await db.execute(`
        SELECT id, name, type, rfc, tax_address, legal_representative, 
               phone, email, registration_date, status, notes, created_at, updated_at
        FROM concessionaires
        ORDER BY created_at DESC
      `);
      
      const concessionaires = result.rows || [];
      
      console.log(`✅ Concesionarios encontrados: ${concessionaires.length}`);
      res.json(concessionaires);
    } catch (error) {
      console.error("Error al obtener concesionarios:", error);
      res.status(500).json({ message: "Error al obtener los concesionarios", error: (error as any).message });
    }
  });

  // Obtener un concesionario por ID
  apiRouter.get("/concessionaires/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const result = await db.execute(`
        SELECT id, name, type, rfc, tax_address, legal_representative, 
               phone, email, registration_date, status, notes, created_at, updated_at
        FROM concessionaires
        WHERE id = $1
      `, [parseInt(id)]);
      
      const concessionaire = result.rows[0];
      
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
  apiRouter.post("/concessionaires", async (req: Request, res: Response) => {
    try {
      const { name, type, rfc, tax_address, legal_representative, phone, email, notes } = req.body;
      
      const result = await db.execute(`
        INSERT INTO concessionaires (name, type, rfc, tax_address, legal_representative, phone, email, notes, status, registration_date, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', CURRENT_DATE, NOW(), NOW())
        RETURNING *
      `, [name, type, rfc, tax_address, legal_representative, phone, email, notes]);
      
      const newConcessionaire = result.rows[0];
      
      console.log("✅ Concesionario creado:", newConcessionaire);
      res.status(201).json(newConcessionaire);
    } catch (error) {
      console.error("Error al crear concesionario:", error);
      res.status(500).json({ message: "Error al crear el concesionario" });
    }
  });

  // Actualizar un concesionario
  apiRouter.put("/concessionaires/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, type, rfc, tax_address, legal_representative, phone, email, notes, status } = req.body;
      
      const result = await db.execute(`
        UPDATE concessionaires 
        SET name = $1, type = $2, rfc = $3, tax_address = $4, legal_representative = $5, 
            phone = $6, email = $7, notes = $8, status = $9, updated_at = NOW()
        WHERE id = $10
        RETURNING *
      `, [name, type, rfc, tax_address, legal_representative, phone, email, notes, status, parseInt(id)]);
      
      const updatedConcessionaire = result.rows[0];
      
      if (!updatedConcessionaire) {
        return res.status(404).json({ message: "Concesionario no encontrado" });
      }
      
      console.log("✅ Concesionario actualizado:", updatedConcessionaire);
      res.json(updatedConcessionaire);
    } catch (error) {
      console.error("Error al actualizar concesionario:", error);
      res.status(500).json({ message: "Error al actualizar el concesionario" });
    }
  });

  // Eliminar un concesionario
  apiRouter.delete("/concessionaires/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const result = await db.execute(`
        DELETE FROM concessionaires WHERE id = $1 RETURNING id
      `, [parseInt(id)]);
      
      const deletedConcessionaire = result.rows[0];
      
      if (!deletedConcessionaire) {
        return res.status(404).json({ message: "Concesionario no encontrado" });
      }
      
      console.log("✅ Concesionario eliminado:", deletedConcessionaire);
      res.json({ message: "Concesionario eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar concesionario:", error);
      res.status(500).json({ message: "Error al eliminar el concesionario" });
    }
  });

  console.log("✅ Rutas simples de concesionarios registradas correctamente");
}