/**
 * Rutas para la gestión financiera de concesiones
 */
import { Request, Response, Router } from "express";
import multer from "multer";
import { db } from "./db";
import { sql } from "drizzle-orm";
import path from "path";
import fs from "fs";

/**
 * Registra las rutas para el módulo de gestión financiera de concesiones
 * @param app Aplicación Express
 * @param apiRouter Router de la API
 * @param isAuthenticated Middleware de autenticación
 */
export function registerConcessionPaymentsRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  console.log("Registrando rutas de gestión financiera de concesiones...");

  // Configuración para subida de archivos de facturas
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "public/uploads/invoices");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'invoice-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ storage });

  // Obtener todos los pagos de concesiones
  apiRouter.get("/concession-payments", async (_req: Request, res: Response) => {
    try {
      const result = await db.execute(sql`
        SELECT cp.*, 
          cc.park_id,
          p.name as park_name,
          u.full_name as concessionaire_name
        FROM concession_payments cp
        LEFT JOIN concession_contracts cc ON cp.contract_id = cc.id
        LEFT JOIN parks p ON cc.park_id = p.id
        LEFT JOIN users u ON cc.concessionaire_id = u.id
        ORDER BY cp.payment_date DESC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error("Error al obtener pagos de concesiones:", error);
      res.status(500).json({ message: "Error al obtener pagos de concesiones" });
    }
  });

  // Obtener pago de concesión por ID
  apiRouter.get("/concession-payments/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const result = await db.execute(sql`
        SELECT cp.*, 
          cc.park_id,
          p.name as park_name,
          u.full_name as concessionaire_name
        FROM concession_payments cp
        LEFT JOIN concession_contracts cc ON cp.contract_id = cc.id
        LEFT JOIN parks p ON cc.park_id = p.id
        LEFT JOIN users u ON cc.concessionaire_id = u.id
        WHERE cp.id = ${id}
      `);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Pago de concesión no encontrado" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error al obtener pago de concesión:", error);
      res.status(500).json({ message: "Error al obtener pago de concesión" });
    }
  });

  // Crear nuevo pago de concesión
  apiRouter.post("/concession-payments", isAuthenticated, upload.single('invoiceFile'), async (req: Request, res: Response) => {
    try {
      const {
        contractId,
        amount,
        paymentDate,
        paymentType,
        invoiceNumber,
        status,
        notes
      } = req.body;

      // Validar que existe el contrato
      const contractResult = await db.execute(sql`
        SELECT * FROM concession_contracts WHERE id = ${contractId}
      `);

      if (contractResult.rows.length === 0) {
        return res.status(404).json({ message: "Contrato de concesión no encontrado" });
      }

      // Ruta del archivo de factura si se subió
      const invoiceUrl = req.file ? `/uploads/invoices/${req.file.filename}` : null;

      // Crear el pago
      const result = await db.execute(sql`
        INSERT INTO concession_payments (
          contract_id, 
          amount, 
          payment_date, 
          payment_type, 
          invoice_number, 
          invoice_url,
          status,
          notes,
          created_at,
          updated_at
        )
        VALUES (
          ${contractId}, 
          ${amount}, 
          ${paymentDate}, 
          ${paymentType}, 
          ${invoiceNumber || null}, 
          ${invoiceUrl},
          ${status},
          ${notes || null},
          NOW(),
          NOW()
        )
        RETURNING *
      `);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error al crear pago de concesión:", error);
      res.status(500).json({ message: "Error al crear pago de concesión" });
    }
  });

  // Actualizar pago de concesión
  apiRouter.put("/concession-payments/:id", isAuthenticated, upload.single('invoiceFile'), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        contractId,
        amount,
        paymentDate,
        paymentType,
        invoiceNumber,
        status,
        notes
      } = req.body;

      // Verificar que el pago existe
      const paymentResult = await db.execute(sql`
        SELECT * FROM concession_payments WHERE id = ${id}
      `);

      if (paymentResult.rows.length === 0) {
        return res.status(404).json({ message: "Pago de concesión no encontrado" });
      }

      const existingPayment = paymentResult.rows[0];

      // Ruta del archivo de factura si se subió uno nuevo
      const invoiceUrl = req.file 
        ? `/uploads/invoices/${req.file.filename}` 
        : existingPayment.invoice_url;

      // Actualizar el pago
      const result = await db.execute(sql`
        UPDATE concession_payments
        SET
          contract_id = ${contractId},
          amount = ${amount},
          payment_date = ${paymentDate},
          payment_type = ${paymentType},
          invoice_number = ${invoiceNumber || null},
          invoice_url = ${invoiceUrl},
          status = ${status},
          notes = ${notes || null},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `);

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error al actualizar pago de concesión:", error);
      res.status(500).json({ message: "Error al actualizar pago de concesión" });
    }
  });

  // Eliminar pago de concesión
  apiRouter.delete("/concession-payments/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Verificar que el pago existe
      const paymentResult = await db.execute(sql`
        SELECT * FROM concession_payments WHERE id = ${id}
      `);

      if (paymentResult.rows.length === 0) {
        return res.status(404).json({ message: "Pago de concesión no encontrado" });
      }

      // Eliminar el archivo de factura si existe
      const payment = paymentResult.rows[0];
      if (payment.invoice_url) {
        const invoicePath = path.join(process.cwd(), "public", payment.invoice_url);
        if (fs.existsSync(invoicePath)) {
          fs.unlinkSync(invoicePath);
        }
      }

      // Eliminar el pago
      await db.execute(sql`
        DELETE FROM concession_payments WHERE id = ${id}
      `);

      res.json({ message: "Pago de concesión eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar pago de concesión:", error);
      res.status(500).json({ message: "Error al eliminar pago de concesión" });
    }
  });

  // Obtener pagos por contrato
  apiRouter.get("/concession-contracts/:contractId/payments", async (req: Request, res: Response) => {
    try {
      const { contractId } = req.params;
      
      const result = await db.execute(sql`
        SELECT cp.*, 
          cc.park_id,
          p.name as park_name,
          u.full_name as concessionaire_name
        FROM concession_payments cp
        LEFT JOIN concession_contracts cc ON cp.contract_id = cc.id
        LEFT JOIN parks p ON cc.park_id = p.id
        LEFT JOIN users u ON cc.concessionaire_id = u.id
        WHERE cp.contract_id = ${contractId}
        ORDER BY cp.payment_date DESC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error("Error al obtener pagos del contrato:", error);
      res.status(500).json({ message: "Error al obtener pagos del contrato" });
    }
  });

  // Obtener pagos pendientes
  apiRouter.get("/concession-payments/status/pending", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const result = await db.execute(sql`
        SELECT cp.*, 
          cc.park_id,
          p.name as park_name,
          u.full_name as concessionaire_name,
          ct.name as concession_type_name
        FROM concession_payments cp
        LEFT JOIN concession_contracts cc ON cp.contract_id = cc.id
        LEFT JOIN parks p ON cc.park_id = p.id
        LEFT JOIN users u ON cc.concessionaire_id = u.id
        LEFT JOIN concession_types ct ON cc.concession_type_id = ct.id
        WHERE cp.status = 'pending'
        ORDER BY cp.payment_date DESC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error("Error al obtener pagos pendientes:", error);
      res.status(500).json({ message: "Error al obtener pagos pendientes" });
    }
  });

  // Obtener pagos atrasados
  apiRouter.get("/concession-payments/status/late", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const result = await db.execute(sql`
        SELECT cp.*, 
          cc.park_id,
          p.name as park_name,
          u.full_name as concessionaire_name,
          ct.name as concession_type_name
        FROM concession_payments cp
        LEFT JOIN concession_contracts cc ON cp.contract_id = cc.id
        LEFT JOIN parks p ON cc.park_id = p.id
        LEFT JOIN users u ON cc.concessionaire_id = u.id
        LEFT JOIN concession_types ct ON cc.concession_type_id = ct.id
        WHERE cp.status = 'late'
        ORDER BY cp.payment_date DESC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error("Error al obtener pagos atrasados:", error);
      res.status(500).json({ message: "Error al obtener pagos atrasados" });
    }
  });

  // Generar reporte de ingresos por período
  apiRouter.get("/concession-payments/reports/income", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      
      let query = sql`
        SELECT SUM(amount) as total_income,
          COUNT(*) as payment_count
        FROM concession_payments
        WHERE status = 'paid'
      `;
      
      if (startDate) {
        query = sql`${query} AND payment_date >= ${startDate}`;
      }
      
      if (endDate) {
        query = sql`${query} AND payment_date <= ${endDate}`;
      }
      
      const result = await db.execute(query);
      
      // Detalle por parque
      const parkDetailQuery = sql`
        SELECT 
          p.id as park_id,
          p.name as park_name,
          SUM(cp.amount) as park_income,
          COUNT(cp.id) as payment_count
        FROM concession_payments cp
        JOIN concession_contracts cc ON cp.contract_id = cc.id
        JOIN parks p ON cc.park_id = p.id
        WHERE cp.status = 'paid'
        ${startDate ? sql`AND cp.payment_date >= ${startDate}` : sql``}
        ${endDate ? sql`AND cp.payment_date <= ${endDate}` : sql``}
        GROUP BY p.id, p.name
        ORDER BY park_income DESC
      `;
      
      const parkDetailResult = await db.execute(parkDetailQuery);
      
      // Detalle por concesionario
      const concessionaireDetailQuery = sql`
        SELECT 
          u.id as concessionaire_id,
          u.full_name as concessionaire_name,
          SUM(cp.amount) as concessionaire_income,
          COUNT(cp.id) as payment_count
        FROM concession_payments cp
        JOIN concession_contracts cc ON cp.contract_id = cc.id
        JOIN users u ON cc.concessionaire_id = u.id
        WHERE cp.status = 'paid'
        ${startDate ? sql`AND cp.payment_date >= ${startDate}` : sql``}
        ${endDate ? sql`AND cp.payment_date <= ${endDate}` : sql``}
        GROUP BY u.id, u.full_name
        ORDER BY concessionaire_income DESC
      `;
      
      const concessionaireDetailResult = await db.execute(concessionaireDetailQuery);
      
      res.json({
        summary: result.rows[0],
        parkDetail: parkDetailResult.rows,
        concessionaireDetail: concessionaireDetailResult.rows
      });
    } catch (error) {
      console.error("Error al generar reporte de ingresos:", error);
      res.status(500).json({ message: "Error al generar reporte de ingresos" });
    }
  });
}