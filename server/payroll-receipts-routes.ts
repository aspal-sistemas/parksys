import { Router, Request, Response } from 'express';
import { db } from './db';
import { 
  payrollReceipts, 
  payrollReceiptDetails, 
  payrollPeriods, 
  payrollDetails,
  payrollConcepts,
  employees,
  users
} from '../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { generateReceiptPDF } from './pdf-generator';
import fs from 'fs';
import path from 'path';

/**
 * Registra las rutas del módulo de Recibos de Nómina
 */
export function registerPayrollReceiptsRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  
  // Middleware de logging
  apiRouter.use((req: Request, res: Response, next: any) => {
    console.log(`Receipt Route: ${req.method} ${req.path}`);
    console.log('Receipt Headers:', req.headers.authorization);
    console.log('Receipt Body Raw:', req.body);
    next();
  });

  // Obtener todos los recibos con filtros
  apiRouter.get("/payroll-receipts", async (req: Request, res: Response) => {
    try {
      const { employeeId, periodId, status, year, month } = req.query;
      
      let query = db
        .select({
          id: payrollReceipts.id,
          receiptNumber: payrollReceipts.receiptNumber,
          generatedDate: payrollReceipts.generatedDate,
          payDate: payrollReceipts.payDate,
          employeeName: payrollReceipts.employeeName,
          employeePosition: payrollReceipts.employeePosition,
          employeeDepartment: payrollReceipts.employeeDepartment,
          totalGross: payrollReceipts.totalGross,
          totalDeductions: payrollReceipts.totalDeductions,
          totalNet: payrollReceipts.totalNet,
          status: payrollReceipts.status,
          pdfGenerated: payrollReceipts.pdfGenerated,
          periodId: payrollReceipts.periodId,
          employeeId: payrollReceipts.employeeId,
          // Datos del período
          periodName: payrollPeriods.period,
          periodStartDate: payrollPeriods.startDate,
          periodEndDate: payrollPeriods.endDate
        })
        .from(payrollReceipts)
        .leftJoin(payrollPeriods, eq(payrollReceipts.periodId, payrollPeriods.id));

      // Aplicar filtros
      const conditions = [];
      if (employeeId) conditions.push(eq(payrollReceipts.employeeId, parseInt(employeeId as string)));
      if (periodId) conditions.push(eq(payrollReceipts.periodId, parseInt(periodId as string)));
      if (status) conditions.push(eq(payrollReceipts.status, status as string));

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const receipts = await query.orderBy(desc(payrollReceipts.generatedDate));
      
      res.json(receipts);
    } catch (error) {
      console.error('Error obteniendo recibos:', error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Obtener recibos de un empleado específico
  apiRouter.get("/employees/:employeeId/payroll-receipts", async (req: Request, res: Response) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      
      if (isNaN(employeeId)) {
        return res.status(400).json({ error: "ID de empleado inválido" });
      }

      const receipts = await db
        .select({
          id: payrollReceipts.id,
          receiptNumber: payrollReceipts.receiptNumber,
          generatedDate: payrollReceipts.generatedDate,
          payDate: payrollReceipts.payDate,
          totalGross: payrollReceipts.totalGross,
          totalDeductions: payrollReceipts.totalDeductions,
          totalNet: payrollReceipts.totalNet,
          status: payrollReceipts.status,
          pdfGenerated: payrollReceipts.pdfGenerated,
          // Datos del período
          periodName: payrollPeriods.period,
          periodStartDate: payrollPeriods.startDate,
          periodEndDate: payrollPeriods.endDate
        })
        .from(payrollReceipts)
        .leftJoin(payrollPeriods, eq(payrollReceipts.periodId, payrollPeriods.id))
        .where(eq(payrollReceipts.employeeId, employeeId))
        .orderBy(desc(payrollReceipts.generatedDate));

      res.json(receipts);
    } catch (error) {
      console.error('Error obteniendo recibos del empleado:', error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Obtener detalle completo de un recibo
  apiRouter.get("/payroll-receipts/:id", async (req: Request, res: Response) => {
    try {
      const receiptId = parseInt(req.params.id);
      
      if (isNaN(receiptId)) {
        return res.status(400).json({ error: "ID de recibo inválido" });
      }

      // Obtener datos del recibo
      const [receipt] = await db
        .select()
        .from(payrollReceipts)
        .leftJoin(payrollPeriods, eq(payrollReceipts.periodId, payrollPeriods.id))
        .leftJoin(employees, eq(payrollReceipts.employeeId, employees.id))
        .where(eq(payrollReceipts.id, receiptId));

      if (!receipt) {
        return res.status(404).json({ error: "Recibo no encontrado" });
      }

      // Obtener detalles del recibo
      const details = await db
        .select()
        .from(payrollReceiptDetails)
        .where(eq(payrollReceiptDetails.receiptId, receiptId))
        .orderBy(payrollReceiptDetails.sortOrder);

      res.json({
        ...receipt,
        details
      });
    } catch (error) {
      console.error('Error obteniendo detalle del recibo:', error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Generar recibo para un empleado en un período específico
  apiRouter.post("/generate-receipt", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { employeeId, periodId } = req.body;
      
      if (!employeeId || !periodId) {
        return res.status(400).json({ error: "employeeId y periodId son requeridos" });
      }

      // Verificar si ya existe un recibo para este empleado y período
      const [existingReceipt] = await db
        .select()
        .from(payrollReceipts)
        .where(and(
          eq(payrollReceipts.employeeId, employeeId),
          eq(payrollReceipts.periodId, periodId)
        ));

      if (existingReceipt) {
        return res.status(400).json({ error: "Ya existe un recibo para este empleado y período" });
      }

      // Obtener datos del empleado
      const [employee] = await db
        .select()
        .from(employees)
        .where(eq(employees.id, employeeId));

      if (!employee) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }

      // Obtener datos del período
      const [period] = await db
        .select()
        .from(payrollPeriods)
        .where(eq(payrollPeriods.id, periodId));

      if (!period) {
        return res.status(404).json({ error: "Período no encontrado" });
      }

      // Obtener detalles de nómina del empleado para este período
      const payrollData = await db
        .select({
          conceptId: payrollDetails.conceptId,
          amount: payrollDetails.amount,
          quantity: payrollDetails.quantity,
          description: payrollDetails.description,
          conceptCode: payrollConcepts.code,
          conceptName: payrollConcepts.name,
          conceptType: payrollConcepts.type,
          conceptCategory: payrollConcepts.category,
          sortOrder: payrollConcepts.sortOrder
        })
        .from(payrollDetails)
        .leftJoin(payrollConcepts, eq(payrollDetails.conceptId, payrollConcepts.id))
        .where(and(
          eq(payrollDetails.employeeId, employeeId),
          eq(payrollDetails.periodId, periodId)
        ))
        .orderBy(payrollConcepts.sortOrder);

      if (payrollData.length === 0) {
        return res.status(400).json({ error: "No hay datos de nómina para generar el recibo" });
      }

      // Calcular totales
      let totalGross = 0;
      let totalDeductions = 0;

      payrollData.forEach(item => {
        const amount = parseFloat(item.amount || '0');
        if (item.conceptType === 'income') {
          totalGross += amount;
        } else if (item.conceptType === 'deduction') {
          totalDeductions += amount;
        }
      });

      const totalNet = totalGross - totalDeductions;

      // Generar número de recibo único
      const receiptNumber = `REC-${period.period}-${employee.id.toString().padStart(4, '0')}-${Date.now()}`;

      // Crear recibo en la base de datos
      const [newReceipt] = await db
        .insert(payrollReceipts)
        .values({
          periodId,
          employeeId,
          receiptNumber,
          payDate: period.endDate,
          employeeName: employee.fullName,
          employeePosition: employee.position,
          employeeDepartment: employee.department,
          totalGross: totalGross.toFixed(2),
          totalDeductions: totalDeductions.toFixed(2),
          totalNet: totalNet.toFixed(2),
          status: 'generated',
          generatedById: (req as any).user?.id
        })
        .returning();

      // Crear detalles del recibo
      const receiptDetails = payrollData.map(item => ({
        receiptId: newReceipt.id,
        conceptId: item.conceptId!,
        conceptCode: item.conceptCode!,
        conceptName: item.conceptName!,
        conceptType: item.conceptType!,
        conceptCategory: item.conceptCategory!,
        quantity: item.quantity || '1.00',
        amount: item.amount!,
        description: item.description,
        sortOrder: item.sortOrder || 0
      }));

      await db.insert(payrollReceiptDetails).values(receiptDetails);

      res.json({
        success: true,
        receipt: newReceipt,
        message: "Recibo generado exitosamente"
      });

    } catch (error) {
      console.error('Error generando recibo:', error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Generar PDF de un recibo
  apiRouter.post("/payroll-receipts/:id/generate-pdf", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const receiptId = parseInt(req.params.id);
      
      if (isNaN(receiptId)) {
        return res.status(400).json({ error: "ID de recibo inválido" });
      }

      // Obtener datos completos del recibo
      const receiptData = await getFullReceiptData(receiptId);
      
      if (!receiptData) {
        return res.status(404).json({ error: "Recibo no encontrado" });
      }

      // Generar PDF
      const pdfResult = await generateReceiptPDF(receiptData);
      
      // Actualizar recibo con información del PDF
      await db
        .update(payrollReceipts)
        .set({
          pdfFileName: pdfResult.fileName,
          pdfPath: pdfResult.filePath,
          pdfGenerated: true,
          status: 'generated'
        })
        .where(eq(payrollReceipts.id, receiptId));

      res.json({
        success: true,
        pdfPath: pdfResult.filePath,
        fileName: pdfResult.fileName,
        message: "PDF generado exitosamente"
      });

    } catch (error) {
      console.error('Error generando PDF:', error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Descargar PDF de un recibo
  apiRouter.get("/payroll-receipts/:id/download", async (req: Request, res: Response) => {
    try {
      const receiptId = parseInt(req.params.id);
      
      if (isNaN(receiptId)) {
        return res.status(400).json({ error: "ID de recibo inválido" });
      }

      const [receipt] = await db
        .select()
        .from(payrollReceipts)
        .where(eq(payrollReceipts.id, receiptId));

      if (!receipt || !receipt.pdfPath || !receipt.pdfGenerated) {
        return res.status(404).json({ error: "PDF no encontrado o no generado" });
      }

      const filePath = path.join(process.cwd(), receipt.pdfPath);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Archivo PDF no encontrado en el servidor" });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${receipt.pdfFileName}"`);
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

    } catch (error) {
      console.error('Error descargando PDF:', error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
}

// Función auxiliar para obtener datos completos del recibo
async function getFullReceiptData(receiptId: number) {
  try {
    // Obtener datos del recibo
    const [receipt] = await db
      .select()
      .from(payrollReceipts)
      .leftJoin(payrollPeriods, eq(payrollReceipts.periodId, payrollPeriods.id))
      .leftJoin(employees, eq(payrollReceipts.employeeId, employees.id))
      .where(eq(payrollReceipts.id, receiptId));

    if (!receipt) return null;

    // Obtener detalles del recibo
    const details = await db
      .select()
      .from(payrollReceiptDetails)
      .where(eq(payrollReceiptDetails.receiptId, receiptId))
      .orderBy(payrollReceiptDetails.sortOrder);

    return {
      ...receipt,
      details
    };
  } catch (error) {
    console.error('Error obteniendo datos del recibo:', error);
    return null;
  }
}