import { Request, Response, Router } from 'express';
import { db } from './db';
import { concessionContracts, concessionTypes, parks, users } from '../shared/schema';
import { eq, and, desc, like, or, gt, lt, isNull } from 'drizzle-orm';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuración para la subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads/contracts');
    
    // Crear el directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'contract-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: function(req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Solo se permiten archivos PDF'));
    }
    cb(null, true);
  }
});

/**
 * Registra las rutas para el módulo de contratos de concesiones
 * @param app Aplicación Express
 * @param apiRouter Router de la API
 * @param isAuthenticated Middleware de autenticación
 */
export function registerConcessionContractsRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  // Obtener todos los contratos de concesiones
  apiRouter.get("/concession-contracts", async (_req: Request, res: Response) => {
    try {
      // Consulta para obtener todos los contratos con información relacionada
      const contracts = await db.select({
        id: concessionContracts.id,
        parkId: concessionContracts.parkId,
        concessionaireId: concessionContracts.concessionaireId,
        concessionTypeId: concessionContracts.concessionTypeId,
        startDate: concessionContracts.startDate,
        endDate: concessionContracts.endDate,
        fee: concessionContracts.fee,
        exclusivityClauses: concessionContracts.exclusivityClauses,
        restrictions: concessionContracts.restrictions,
        contractFileUrl: concessionContracts.contractFileUrl,
        status: concessionContracts.status,
        hasExtension: concessionContracts.hasExtension,
        extensionDate: concessionContracts.extensionDate,
        notes: concessionContracts.notes,
        createdAt: concessionContracts.createdAt,
        updatedAt: concessionContracts.updatedAt,
        parkName: parks.name,
        concessionaireName: users.fullName,
        concessionTypeName: concessionTypes.name
      })
      .from(concessionContracts)
      .leftJoin(parks, eq(concessionContracts.parkId, parks.id))
      .leftJoin(users, eq(concessionContracts.concessionaireId, users.id))
      .leftJoin(concessionTypes, eq(concessionContracts.concessionTypeId, concessionTypes.id))
      .orderBy(desc(concessionContracts.createdAt));

      // Verificar el estado de los contratos y actualizarlos si es necesario
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      
      // Actualizar contratos vencidos
      for (const contract of contracts) {
        if (contract.status === 'active' && contract.endDate < formattedDate) {
          // Si el contrato está activo pero la fecha de fin ya pasó, marcar como vencido
          await db.update(concessionContracts)
            .set({ status: 'expired', updatedAt: new Date() })
            .where(eq(concessionContracts.id, contract.id));
          
          // Actualizar el estado en la respuesta
          contract.status = 'expired';
        }
      }

      res.json(contracts);
    } catch (error) {
      console.error("Error al obtener contratos de concesiones:", error);
      res.status(500).json({ message: "Error al obtener los contratos de concesiones" });
    }
  });

  // Obtener un contrato de concesión específico
  apiRouter.get("/concession-contracts/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [contract] = await db.select({
        id: concessionContracts.id,
        parkId: concessionContracts.parkId,
        concessionaireId: concessionContracts.concessionaireId,
        concessionTypeId: concessionContracts.concessionTypeId,
        startDate: concessionContracts.startDate,
        endDate: concessionContracts.endDate,
        fee: concessionContracts.fee,
        exclusivityClauses: concessionContracts.exclusivityClauses,
        restrictions: concessionContracts.restrictions,
        contractFileUrl: concessionContracts.contractFileUrl,
        status: concessionContracts.status,
        hasExtension: concessionContracts.hasExtension,
        extensionDate: concessionContracts.extensionDate,
        notes: concessionContracts.notes,
        createdAt: concessionContracts.createdAt,
        updatedAt: concessionContracts.updatedAt,
        parkName: parks.name,
        concessionaireName: users.fullName,
        concessionTypeName: concessionTypes.name
      })
      .from(concessionContracts)
      .leftJoin(parks, eq(concessionContracts.parkId, parks.id))
      .leftJoin(users, eq(concessionContracts.concessionaireId, users.id))
      .leftJoin(concessionTypes, eq(concessionContracts.concessionTypeId, concessionTypes.id))
      .where(eq(concessionContracts.id, parseInt(id)));

      if (!contract) {
        return res.status(404).json({ message: "Contrato de concesión no encontrado" });
      }

      res.json(contract);
    } catch (error) {
      console.error("Error al obtener contrato de concesión:", error);
      res.status(500).json({ message: "Error al obtener el contrato de concesión" });
    }
  });

  // Crear un nuevo contrato de concesión
  apiRouter.post("/concession-contracts", isAuthenticated, upload.single('contractFile'), async (req: Request, res: Response) => {
    try {
      const {
        parkId,
        concessionaireId,
        concessionTypeId,
        startDate,
        endDate,
        fee,
        exclusivityClauses,
        restrictions,
        status,
        hasExtension,
        extensionDate,
        notes
      } = req.body;

      // Validar los campos requeridos
      if (!parkId || !concessionaireId || !concessionTypeId || !startDate || !endDate || !fee) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
      }

      // Obtener información del archivo si se subió
      let contractFileUrl = null;
      if (req.file) {
        // Construir la URL relativa del archivo
        contractFileUrl = `/uploads/contracts/${req.file.filename}`;
      }

      // Insertar el nuevo contrato
      const [newContract] = await db.insert(concessionContracts)
        .values({
          parkId: Number(parkId),
          concessionaireId: Number(concessionaireId),
          concessionTypeId: Number(concessionTypeId),
          startDate: startDate,
          endDate: endDate,
          fee: fee,
          exclusivityClauses,
          restrictions,
          contractFileUrl,
          status: status || "active",
          hasExtension: hasExtension === 'true',
          extensionDate: extensionDate || null,
          notes,
          createdById: req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : null,
        })
        .returning();

      // Integración automática con el sistema financiero - Prorrateo mensual
      try {
        const { createFinanceIncomeFromConcessionContract } = await import('./concessions-finance-integration');
        const result = await createFinanceIncomeFromConcessionContract(newContract.id);
        if (result.success) {
          console.log(`💰 ${result.createdIncomes.length} ingresos mensuales creados automáticamente para contrato ${newContract.id}`);
        }
      } catch (integrationError) {
        console.error("Error en integración automática Concesiones → Finanzas:", integrationError);
        // No fallar la creación del contrato por error de integración
      }

      res.status(201).json(newContract);
    } catch (error) {
      console.error("Error al crear contrato de concesión:", error);
      res.status(500).json({ message: "Error al crear el contrato de concesión" });
    }
  });

  // Actualizar un contrato de concesión existente
  apiRouter.put("/concession-contracts/:id", isAuthenticated, upload.single('contractFile'), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        parkId,
        concessionaireId,
        concessionTypeId,
        startDate,
        endDate,
        fee,
        exclusivityClauses,
        restrictions,
        status,
        hasExtension,
        extensionDate,
        notes
      } = req.body;

      // Validar los campos requeridos
      if (!parkId || !concessionaireId || !concessionTypeId || !startDate || !endDate || !fee) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
      }

      // Obtener el contrato actual para verificar si existe y obtener su archivo actual
      const [existingContract] = await db.select()
        .from(concessionContracts)
        .where(eq(concessionContracts.id, parseInt(id)));

      if (!existingContract) {
        return res.status(404).json({ message: "Contrato de concesión no encontrado" });
      }

      // Determinar la URL del archivo
      let contractFileUrl = existingContract.contractFileUrl;
      
      // Si se subió un nuevo archivo, actualizar la URL
      if (req.file) {
        // Construir la nueva URL relativa del archivo
        contractFileUrl = `/uploads/contracts/${req.file.filename}`;
        
        // Si había un archivo anterior, eliminarlo
        if (existingContract.contractFileUrl) {
          const oldFilePath = path.join(process.cwd(), existingContract.contractFileUrl.replace(/^\//, ''));
          try {
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath);
            }
          } catch (error) {
            console.error("Error al eliminar archivo anterior:", error);
            // Continuar a pesar del error
          }
        }
      }

      // Actualizar el contrato
      const [updatedContract] = await db.update(concessionContracts)
        .set({
          parkId: Number(parkId),
          concessionaireId: Number(concessionaireId),
          concessionTypeId: Number(concessionTypeId),
          startDate: startDate,
          endDate: endDate,
          fee: fee,
          exclusivityClauses,
          restrictions,
          contractFileUrl,
          status: status || "active",
          hasExtension: hasExtension === 'true',
          extensionDate: extensionDate || null,
          notes,
          updatedAt: new Date()
        })
        .where(eq(concessionContracts.id, Number(id)))
        .returning();

      res.json(updatedContract);
    } catch (error) {
      console.error("Error al actualizar contrato de concesión:", error);
      res.status(500).json({ message: "Error al actualizar el contrato de concesión" });
    }
  });

  // Eliminar un contrato de concesión
  apiRouter.delete("/concession-contracts/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Obtener el contrato para verificar si existe y obtener su archivo
      const [contract] = await db.select()
        .from(concessionContracts)
        .where(eq(concessionContracts.id, parseInt(id)));

      if (!contract) {
        return res.status(404).json({ message: "Contrato de concesión no encontrado" });
      }

      // Eliminar el archivo si existe
      if (contract.contractFileUrl) {
        const filePath = path.join(process.cwd(), contract.contractFileUrl.replace(/^\//, ''));
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (error) {
          console.error("Error al eliminar archivo del contrato:", error);
          // Continuar a pesar del error
        }
      }

      // Eliminar el contrato de la base de datos
      await db.delete(concessionContracts)
        .where(eq(concessionContracts.id, parseInt(id)));

      res.json({ message: "Contrato de concesión eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar contrato de concesión:", error);
      res.status(500).json({ message: "Error al eliminar el contrato de concesión" });
    }
  });

  // Obtener contratos próximos a vencer (alertas)
  apiRouter.get("/concession-contracts/alerts/upcoming", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const currentDate = new Date();
      
      // Sumar 30 días a la fecha actual
      const futureDate = new Date();
      futureDate.setDate(currentDate.getDate() + 30);
      
      const formattedCurrentDate = currentDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      const formattedFutureDate = futureDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      
      // Obtener contratos que vencen en los próximos 30 días
      const upcomingContracts = await db.select({
        id: concessionContracts.id,
        parkId: concessionContracts.parkId,
        concessionaireId: concessionContracts.concessionaireId,
        startDate: concessionContracts.startDate,
        endDate: concessionContracts.endDate,
        status: concessionContracts.status,
        parkName: parks.name,
        concessionaireName: users.fullName,
        daysRemaining: concessionContracts.id,
      })
      .from(concessionContracts)
      .leftJoin(parks, eq(concessionContracts.parkId, parks.id))
      .leftJoin(users, eq(concessionContracts.concessionaireId, users.id))
      .where(
        and(
          eq(concessionContracts.status, 'active'),
          gt(concessionContracts.endDate, formattedCurrentDate),
          lt(concessionContracts.endDate, formattedFutureDate)
        )
      )
      .orderBy(concessionContracts.endDate);

      res.json(upcomingContracts);
    } catch (error) {
      console.error("Error al obtener alertas de contratos:", error);
      res.status(500).json({ message: "Error al obtener las alertas de contratos" });
    }
  });

  // Obtener contratos vencidos (alertas)
  apiRouter.get("/concession-contracts/alerts/expired", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const currentDate = new Date();
      const formattedCurrentDate = currentDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      
      // Obtener contratos vencidos
      const expiredContracts = await db.select({
        id: concessionContracts.id,
        parkId: concessionContracts.parkId,
        concessionaireId: concessionContracts.concessionaireId,
        startDate: concessionContracts.startDate,
        endDate: concessionContracts.endDate,
        status: concessionContracts.status,
        parkName: parks.name,
        concessionaireName: users.fullName,
        daysSinceExpiry: concessionContracts.id,
      })
      .from(concessionContracts)
      .leftJoin(parks, eq(concessionContracts.parkId, parks.id))
      .leftJoin(users, eq(concessionContracts.concessionaireId, users.id))
      .where(
        and(
          eq(concessionContracts.status, 'active'),
          lt(concessionContracts.endDate, formattedCurrentDate)
        )
      )
      .orderBy(concessionContracts.endDate);

      // Actualizar el estado de los contratos vencidos
      for (const contract of expiredContracts) {
        await db.update(concessionContracts)
          .set({ status: 'expired', updatedAt: new Date() })
          .where(eq(concessionContracts.id, contract.id));
          
        contract.status = 'expired';
      }

      res.json(expiredContracts);
    } catch (error) {
      console.error("Error al obtener contratos vencidos:", error);
      res.status(500).json({ message: "Error al obtener los contratos vencidos" });
    }
  });

  // Obtener contratos por parque
  apiRouter.get("/parks/:parkId/concession-contracts", async (req: Request, res: Response) => {
    try {
      const { parkId } = req.params;
      
      // Obtener todos los contratos de un parque específico
      const contracts = await db.select({
        id: concessionContracts.id,
        parkId: concessionContracts.parkId,
        concessionaireId: concessionContracts.concessionaireId,
        concessionTypeId: concessionContracts.concessionTypeId,
        startDate: concessionContracts.startDate,
        endDate: concessionContracts.endDate,
        fee: concessionContracts.fee,
        status: concessionContracts.status,
        hasExtension: concessionContracts.hasExtension,
        parkName: parks.name,
        concessionaireName: users.fullName,
        concessionTypeName: concessionTypes.name
      })
      .from(concessionContracts)
      .leftJoin(parks, eq(concessionContracts.parkId, parks.id))
      .leftJoin(users, eq(concessionContracts.concessionaireId, users.id))
      .leftJoin(concessionTypes, eq(concessionContracts.concessionTypeId, concessionTypes.id))
      .where(eq(concessionContracts.parkId, parseInt(parkId)))
      .orderBy(desc(concessionContracts.createdAt));

      res.json(contracts);
    } catch (error) {
      console.error("Error al obtener contratos por parque:", error);
      res.status(500).json({ message: "Error al obtener los contratos por parque" });
    }
  });

  // Obtener contratos por concesionario
  apiRouter.get("/concessionaires/:concessionaireId/contracts", async (req: Request, res: Response) => {
    try {
      const { concessionaireId } = req.params;
      
      // Obtener todos los contratos de un concesionario específico
      const contracts = await db.select({
        id: concessionContracts.id,
        parkId: concessionContracts.parkId,
        concessionaireId: concessionContracts.concessionaireId,
        concessionTypeId: concessionContracts.concessionTypeId,
        startDate: concessionContracts.startDate,
        endDate: concessionContracts.endDate,
        fee: concessionContracts.fee,
        status: concessionContracts.status,
        hasExtension: concessionContracts.hasExtension,
        parkName: parks.name,
        concessionTypeName: concessionTypes.name
      })
      .from(concessionContracts)
      .leftJoin(parks, eq(concessionContracts.parkId, parks.id))
      .leftJoin(concessionTypes, eq(concessionContracts.concessionTypeId, concessionTypes.id))
      .where(eq(concessionContracts.concessionaireId, parseInt(concessionaireId)))
      .orderBy(desc(concessionContracts.createdAt));

      res.json(contracts);
    } catch (error) {
      console.error("Error al obtener contratos por concesionario:", error);
      res.status(500).json({ message: "Error al obtener los contratos por concesionario" });
    }
  });

  // Registrar una prórroga de contrato
  apiRouter.post("/concession-contracts/:id/extension", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { extensionDate, notes } = req.body;

      if (!extensionDate) {
        return res.status(400).json({ message: "La fecha de prórroga es obligatoria" });
      }

      // Verificar que el contrato existe
      const [contract] = await db.select()
        .from(concessionContracts)
        .where(eq(concessionContracts.id, parseInt(id)));

      if (!contract) {
        return res.status(404).json({ message: "Contrato de concesión no encontrado" });
      }

      // Actualizar el contrato con la prórroga
      const [updatedContract] = await db.update(concessionContracts)
        .set({
          hasExtension: true,
          extensionDate,
          notes: notes ? `${contract.notes ? contract.notes + '\n\n' : ''}Prórroga registrada: ${notes}` : contract.notes,
          updatedAt: new Date()
        })
        .where(eq(concessionContracts.id, parseInt(id)))
        .returning();

      res.json(updatedContract);
    } catch (error) {
      console.error("Error al registrar prórroga de contrato:", error);
      res.status(500).json({ message: "Error al registrar la prórroga del contrato" });
    }
  });
}