import { Request, Response } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { concessionPayments } from "@shared/schema";
import { eq } from "drizzle-orm";

// Obtener todos los pagos de concesiones
export async function getConcessionPayments(req: Request, res: Response) {
  try {
    const payments = await db.select().from(concessionPayments);
    
    // Enriquecer con nombres de contratos para la UI
    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        try {
          // Buscar contrato para obtener nombres
          const [contract] = await db.query.concessionContracts.findMany({
            where: eq(concessionPayments.contractId, payment.contractId),
            with: {
              concession: true,
              park: true,
            }
          });

          return {
            ...payment,
            contractName: contract ? `${contract.park?.name} - ${contract.concession?.name}` : 'Desconocido',
            parkName: contract?.park?.name || 'Desconocido',
            concessionaireName: contract?.concession?.name || 'Desconocido'
          };
        } catch (error) {
          console.error("Error enriqueciendo pago:", error);
          return payment;
        }
      })
    );

    res.json(enrichedPayments);
  } catch (error) {
    console.error("Error al obtener pagos de concesiones:", error);
    res.status(500).json({ message: "Error al obtener pagos de concesiones" });
  }
}

// Obtener un pago de concesión por ID
export async function getConcessionPaymentById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const [payment] = await db.select().from(concessionPayments).where(eq(concessionPayments.id, id));
    
    if (!payment) {
      return res.status(404).json({ message: "Pago no encontrado" });
    }
    
    res.json(payment);
  } catch (error) {
    console.error("Error al obtener pago de concesión:", error);
    res.status(500).json({ message: "Error al obtener pago de concesión" });
  }
}

// Crear un nuevo pago de concesión
export async function createConcessionPayment(req: Request, res: Response) {
  try {
    const { 
      contractId, 
      paymentDate, 
      amount, 
      paymentType, 
      paymentStatus, 
      invoiceNumber, 
      invoiceUrl, 
      notes 
    } = req.body;

    // Validar campos obligatorios
    if (!contractId || !paymentDate || !amount || !paymentType || !paymentStatus) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // Crear el pago
    const [newPayment] = await db.insert(concessionPayments).values({
      contractId: parseInt(contractId),
      paymentDate: new Date(paymentDate),
      amount: parseFloat(amount),
      paymentType,
      paymentStatus,
      invoiceNumber: invoiceNumber || null,
      invoiceUrl: invoiceUrl || null,
      notes: notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: req.headers["x-user-id"] ? parseInt(req.headers["x-user-id"] as string) : null
    }).returning();

    res.status(201).json(newPayment);
  } catch (error) {
    console.error("Error al crear pago de concesión:", error);
    res.status(500).json({ message: "Error al crear pago de concesión" });
  }
}

// Actualizar un pago de concesión existente
export async function updateConcessionPayment(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const { 
      contractId, 
      paymentDate, 
      amount, 
      paymentType, 
      paymentStatus, 
      invoiceNumber, 
      invoiceUrl, 
      notes 
    } = req.body;

    // Validar campos obligatorios
    if (!contractId || !paymentDate || !amount || !paymentType || !paymentStatus) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // Verificar si el pago existe
    const [existingPayment] = await db.select().from(concessionPayments).where(eq(concessionPayments.id, id));
    
    if (!existingPayment) {
      return res.status(404).json({ message: "Pago no encontrado" });
    }

    // Actualizar el pago
    const [updatedPayment] = await db.update(concessionPayments)
      .set({
        contractId: parseInt(contractId),
        paymentDate: new Date(paymentDate),
        amount: parseFloat(amount),
        paymentType,
        paymentStatus,
        invoiceNumber: invoiceNumber || null,
        invoiceUrl: invoiceUrl || null,
        notes: notes || null,
        updatedAt: new Date()
      })
      .where(eq(concessionPayments.id, id))
      .returning();

    res.json(updatedPayment);
  } catch (error) {
    console.error("Error al actualizar pago de concesión:", error);
    res.status(500).json({ message: "Error al actualizar pago de concesión" });
  }
}

// Eliminar un pago de concesión
export async function deleteConcessionPayment(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    
    // Verificar si el pago existe
    const [existingPayment] = await db.select().from(concessionPayments).where(eq(concessionPayments.id, id));
    
    if (!existingPayment) {
      return res.status(404).json({ message: "Pago no encontrado" });
    }

    // Eliminar el pago
    await db.delete(concessionPayments).where(eq(concessionPayments.id, id));

    res.json({ message: "Pago eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar pago de concesión:", error);
    res.status(500).json({ message: "Error al eliminar pago de concesión" });
  }
}

// Registrar las rutas de pagos de concesiones
export function registerConcessionPaymentRoutes(app: any, apiRouter: any, isAuthenticated: any) {
  // Rutas para gestionar pagos de concesiones
  apiRouter.get("/concession-payments", isAuthenticated, getConcessionPayments);
  apiRouter.get("/concession-payments/:id", isAuthenticated, getConcessionPaymentById);
  apiRouter.post("/concession-payments", isAuthenticated, createConcessionPayment);
  apiRouter.put("/concession-payments/:id", isAuthenticated, updateConcessionPayment);
  apiRouter.delete("/concession-payments/:id", isAuthenticated, deleteConcessionPayment);
}