import { Request, Response } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { concessionLocations } from "@shared/schema";
import { eq } from "drizzle-orm";

// Obtener todas las ubicaciones de concesiones
export async function getConcessionLocations(req: Request, res: Response) {
  try {
    const locations = await db.select().from(concessionLocations);
    
    // Enriquecer con nombres de contratos para la UI
    const enrichedLocations = await Promise.all(
      locations.map(async (location) => {
        try {
          // Buscar contrato para obtener nombres
          const [contract] = await db.query.concessionContracts.findMany({
            where: eq(concessionLocations.contractId, location.contractId),
            with: {
              concession: true,
              park: true,
            }
          });

          return {
            ...location,
            contractName: contract ? `${contract.park?.name} - ${contract.concession?.name}` : 'Desconocido',
            parkName: contract?.park?.name || 'Desconocido',
            concessionaireName: contract?.concession?.name || 'Desconocido'
          };
        } catch (error) {
          console.error("Error enriqueciendo ubicación:", error);
          return location;
        }
      })
    );

    res.json(enrichedLocations);
  } catch (error) {
    console.error("Error al obtener ubicaciones de concesiones:", error);
    res.status(500).json({ message: "Error al obtener ubicaciones de concesiones" });
  }
}

// Obtener una ubicación de concesión por ID
export async function getConcessionLocationById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const [location] = await db.select().from(concessionLocations).where(eq(concessionLocations.id, id));
    
    if (!location) {
      return res.status(404).json({ message: "Ubicación no encontrada" });
    }
    
    res.json(location);
  } catch (error) {
    console.error("Error al obtener ubicación de concesión:", error);
    res.status(500).json({ message: "Error al obtener ubicación de concesión" });
  }
}

// Crear una nueva ubicación de concesión
export async function createConcessionLocation(req: Request, res: Response) {
  try {
    const { 
      contractId, 
      zoneName, 
      subzoneName, 
      coordinates, 
      areaSqm, 
      mapReference, 
      locationDescription 
    } = req.body;

    // Validar campos obligatorios
    if (!contractId || !zoneName || !coordinates || !areaSqm) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // Crear la ubicación
    const [newLocation] = await db.insert(concessionLocations).values({
      contractId: parseInt(contractId),
      zoneName,
      subzoneName: subzoneName || null,
      coordinates,
      areaSqm: parseFloat(areaSqm),
      mapReference: mapReference || null,
      locationDescription: locationDescription || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: req.headers["x-user-id"] ? parseInt(req.headers["x-user-id"] as string) : null
    }).returning();

    res.status(201).json(newLocation);
  } catch (error) {
    console.error("Error al crear ubicación de concesión:", error);
    res.status(500).json({ message: "Error al crear ubicación de concesión" });
  }
}

// Actualizar una ubicación de concesión existente
export async function updateConcessionLocation(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const { 
      contractId, 
      zoneName, 
      subzoneName, 
      coordinates, 
      areaSqm, 
      mapReference, 
      locationDescription 
    } = req.body;

    // Validar campos obligatorios
    if (!contractId || !zoneName || !coordinates || !areaSqm) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // Verificar si la ubicación existe
    const [existingLocation] = await db.select().from(concessionLocations).where(eq(concessionLocations.id, id));
    
    if (!existingLocation) {
      return res.status(404).json({ message: "Ubicación no encontrada" });
    }

    // Actualizar la ubicación
    const [updatedLocation] = await db.update(concessionLocations)
      .set({
        contractId: parseInt(contractId),
        zoneName,
        subzoneName: subzoneName || null,
        coordinates,
        areaSqm: parseFloat(areaSqm),
        mapReference: mapReference || null,
        locationDescription: locationDescription || null,
        updatedAt: new Date()
      })
      .where(eq(concessionLocations.id, id))
      .returning();

    res.json(updatedLocation);
  } catch (error) {
    console.error("Error al actualizar ubicación de concesión:", error);
    res.status(500).json({ message: "Error al actualizar ubicación de concesión" });
  }
}

// Eliminar una ubicación de concesión
export async function deleteConcessionLocation(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    
    // Verificar si la ubicación existe
    const [existingLocation] = await db.select().from(concessionLocations).where(eq(concessionLocations.id, id));
    
    if (!existingLocation) {
      return res.status(404).json({ message: "Ubicación no encontrada" });
    }

    // Eliminar la ubicación
    await db.delete(concessionLocations).where(eq(concessionLocations.id, id));

    res.json({ message: "Ubicación eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar ubicación de concesión:", error);
    res.status(500).json({ message: "Error al eliminar ubicación de concesión" });
  }
}

// Registrar las rutas de ubicaciones de concesiones
export function registerConcessionLocationRoutes(app: any, apiRouter: any, isAuthenticated: any) {
  // Rutas para gestionar ubicaciones de concesiones
  apiRouter.get("/concession-locations", isAuthenticated, getConcessionLocations);
  apiRouter.get("/concession-locations/:id", isAuthenticated, getConcessionLocationById);
  apiRouter.post("/concession-locations", isAuthenticated, createConcessionLocation);
  apiRouter.put("/concession-locations/:id", isAuthenticated, updateConcessionLocation);
  apiRouter.delete("/concession-locations/:id", isAuthenticated, deleteConcessionLocation);
}