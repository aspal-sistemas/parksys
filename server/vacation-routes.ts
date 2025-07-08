import { Request, Response } from "express";
import { eq, sql, and, desc, asc, gte, lte, or, like, count } from "drizzle-orm";
import { db } from "./db";
import { 
  timeOffRequests, 
  vacationBalances, 
  employees, 
  users,
  vacationSettings 
} from "@shared/schema";

/**
 * MÓDULO COMPLETO DE VACACIONES
 * Sistema integral para gestión de vacaciones con 4 submódulos:
 * 1. Gestión de Solicitudes 
 * 2. Panel de Control
 * 3. Balance de Vacaciones
 * 4. Configuración del Sistema
 */

export function registerVacationRoutes(app: any, apiRouter: any, isAuthenticated: any) {
  console.log("🏖️ Registrando rutas del módulo de vacaciones...");

  // ========== 1. GESTIÓN DE SOLICITUDES (/hr/vacations) ==========
  
  // Obtener todas las solicitudes de vacaciones con paginación y filtros
  apiRouter.get("/vacation-requests", async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10, status, employeeId, requestType, startDate, endDate } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      let whereConditions: any[] = [];
      
      // Filtros opcionales
      if (status) {
        whereConditions.push(eq(timeOffRequests.status, status as string));
      }
      if (employeeId) {
        whereConditions.push(eq(timeOffRequests.employeeId, parseInt(employeeId as string)));
      }
      if (requestType) {
        whereConditions.push(eq(timeOffRequests.requestType, requestType as string));
      }
      if (startDate) {
        whereConditions.push(gte(timeOffRequests.startDate, startDate as string));
      }
      if (endDate) {
        whereConditions.push(lte(timeOffRequests.endDate, endDate as string));
      }
      
      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
      
      // Obtener solicitudes con información del empleado
      const requests = await db
        .select({
          id: timeOffRequests.id,
          employeeId: timeOffRequests.employeeId,
          employeeName: employees.fullName,
          requestType: timeOffRequests.requestType,
          startDate: timeOffRequests.startDate,
          endDate: timeOffRequests.endDate,
          requestedDays: timeOffRequests.requestedDays,
          reason: timeOffRequests.reason,
          status: timeOffRequests.status,
          submittedAt: timeOffRequests.submittedAt,
          approvedBy: timeOffRequests.approvedBy,
          approvedAt: timeOffRequests.approvedAt,
          rejectionReason: timeOffRequests.rejectionReason,
        })
        .from(timeOffRequests)
        .innerJoin(employees, eq(timeOffRequests.employeeId, employees.id))
        .where(whereClause)
        .orderBy(desc(timeOffRequests.submittedAt))
        .limit(parseInt(limit as string))
        .offset(offset);
      
      // Contar total de registros
      const totalResult = await db
        .select({ count: count() })
        .from(timeOffRequests)
        .where(whereClause);
      
      const total = totalResult[0].count;
      
      res.json({
        data: requests,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      });
    } catch (error) {
      console.error("Error al obtener solicitudes de vacaciones:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Crear nueva solicitud de vacaciones
  apiRouter.post("/vacation-requests", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const {
        employeeId,
        requestType,
        startDate,
        endDate,
        requestedDays,
        reason,
        description
      } = req.body;

      // Validar disponibilidad de días
      const balance = await db
        .select()
        .from(vacationBalances)
        .where(and(
          eq(vacationBalances.employeeId, employeeId),
          eq(vacationBalances.year, new Date().getFullYear())
        ))
        .limit(1);

      if (balance.length === 0) {
        return res.status(400).json({ error: "No se encontró balance de vacaciones para este empleado" });
      }

      if (parseFloat(balance[0].availableDays) < requestedDays) {
        return res.status(400).json({ error: "Días solicitados exceden los días disponibles" });
      }

      // Crear solicitud
      const [newRequest] = await db
        .insert(timeOffRequests)
        .values({
          employeeId,
          requestType,
          startDate,
          endDate,
          requestedDays,
          reason,
          description,
          status: "pending"
        })
        .returning();

      // Actualizar días pendientes en balance
      await db
        .update(vacationBalances)
        .set({
          pendingDays: sql`${vacationBalances.pendingDays} + ${requestedDays}`,
          availableDays: sql`${vacationBalances.availableDays} - ${requestedDays}`,
          updatedAt: new Date()
        })
        .where(and(
          eq(vacationBalances.employeeId, employeeId),
          eq(vacationBalances.year, new Date().getFullYear())
        ));

      res.status(201).json(newRequest);
    } catch (error) {
      console.error("Error al crear solicitud:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Aprobar/Rechazar solicitud
  apiRouter.put("/vacation-requests/:id/review", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { action, reviewComments } = req.body; // action: 'approve' | 'reject'
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      // Obtener la solicitud
      const [request] = await db
        .select()
        .from(timeOffRequests)
        .where(eq(timeOffRequests.id, parseInt(id)))
        .limit(1);

      if (!request) {
        return res.status(404).json({ error: "Solicitud no encontrada" });
      }

      if (request.status !== "pending") {
        return res.status(400).json({ error: "La solicitud ya ha sido procesada" });
      }

      const newStatus = action === "approve" ? "approved" : "rejected";

      // Actualizar solicitud
      await db
        .update(timeOffRequests)
        .set({
          status: newStatus,
          approvedBy: userId,
          approvedAt: new Date(),
          rejectionReason: action === "reject" ? reviewComments : null
        })
        .where(eq(timeOffRequests.id, parseInt(id)));

      // Actualizar balance según la acción
      if (action === "approve") {
        // Mover días de pendiente a usado
        await db
          .update(vacationBalances)
          .set({
            usedDays: sql`${vacationBalances.usedDays} + ${request.requestedDays}`,
            pendingDays: sql`${vacationBalances.pendingDays} - ${request.requestedDays}`,
            updatedAt: new Date()
          })
          .where(and(
            eq(vacationBalances.employeeId, request.employeeId),
            eq(vacationBalances.year, new Date().getFullYear())
          ));
      } else {
        // Restaurar días disponibles
        await db
          .update(vacationBalances)
          .set({
            availableDays: sql`${vacationBalances.availableDays} + ${request.requestedDays}`,
            pendingDays: sql`${vacationBalances.pendingDays} - ${request.requestedDays}`,
            updatedAt: new Date()
          })
          .where(and(
            eq(vacationBalances.employeeId, request.employeeId),
            eq(vacationBalances.year, new Date().getFullYear())
          ));
      }

      res.json({ message: `Solicitud ${action === "approve" ? "aprobada" : "rechazada"} exitosamente` });
    } catch (error) {
      console.error("Error al procesar solicitud:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // ========== 2. PANEL DE CONTROL (/hr/vacation-dashboard) ==========

  // Estadísticas del dashboard
  apiRouter.get("/vacation-dashboard/stats", async (req: Request, res: Response) => {
    try {
      const currentYear = new Date().getFullYear();
      
      // Estadísticas de solicitudes
      const [pendingCount] = await db
        .select({ count: count() })
        .from(timeOffRequests)
        .where(eq(timeOffRequests.status, "pending"));
      
      const [approvedCount] = await db
        .select({ count: count() })
        .from(timeOffRequests)
        .where(eq(timeOffRequests.status, "approved"));
      
      const [rejectedCount] = await db
        .select({ count: count() })
        .from(timeOffRequests)
        .where(eq(timeOffRequests.status, "rejected"));

      // Días totales en el sistema
      const [totalDaysResult] = await db
        .select({ 
          totalDays: sql`SUM(${vacationBalances.totalDays})`,
          usedDays: sql`SUM(${vacationBalances.usedDays})`,
          availableDays: sql`SUM(${vacationBalances.availableDays})`
        })
        .from(vacationBalances)
        .where(eq(vacationBalances.year, currentYear));

      res.json({
        requests: {
          pending: pendingCount.count,
          approved: approvedCount.count,
          rejected: rejectedCount.count,
          total: pendingCount.count + approvedCount.count + rejectedCount.count
        },
        days: {
          total: parseFloat(totalDaysResult?.totalDays || "0"),
          used: parseFloat(totalDaysResult?.usedDays || "0"),
          available: parseFloat(totalDaysResult?.availableDays || "0")
        }
      });
    } catch (error) {
      console.error("Error al obtener estadísticas del dashboard:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Detección de conflictos de fechas
  apiRouter.get("/vacation-dashboard/conflicts", async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: "Fechas de inicio y fin requeridas" });
      }

      const conflicts = await db
        .select({
          id: timeOffRequests.id,
          employeeId: timeOffRequests.employeeId,
          employeeName: employees.fullName,
          startDate: timeOffRequests.startDate,
          endDate: timeOffRequests.endDate,
          requestType: timeOffRequests.requestType,
          status: timeOffRequests.status
        })
        .from(timeOffRequests)
        .innerJoin(employees, eq(timeOffRequests.employeeId, employees.id))
        .where(
          and(
            eq(timeOffRequests.status, "approved"),
            or(
              and(
                lte(timeOffRequests.startDate, endDate as string),
                gte(timeOffRequests.endDate, startDate as string)
              )
            )
          )
        );

      res.json(conflicts);
    } catch (error) {
      console.error("Error al detectar conflictos:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // ========== 3. BALANCE DE VACACIONES (/hr/vacation-balances) ==========

  // Obtener balances de todos los empleados
  apiRouter.get("/vacation-balances", async (req: Request, res: Response) => {
    try {
      const { year = new Date().getFullYear() } = req.query;
      
      const balances = await db
        .select({
          id: vacationBalances.id,
          employeeId: vacationBalances.employeeId,
          employeeName: employees.fullName,
          year: vacationBalances.year,
          totalDays: vacationBalances.totalDays,
          usedDays: vacationBalances.usedDays,
          pendingDays: vacationBalances.pendingDays,
          availableDays: vacationBalances.availableDays,
          notes: vacationBalances.notes,
          updatedAt: vacationBalances.updatedAt
        })
        .from(vacationBalances)
        .innerJoin(employees, eq(vacationBalances.employeeId, employees.id))
        .where(eq(vacationBalances.year, parseInt(year as string)))
        .orderBy(asc(employees.fullName));

      res.json(balances);
    } catch (error) {
      console.error("Error al obtener balances:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Actualizar balance de empleado
  apiRouter.put("/vacation-balances/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { totalDays, notes } = req.body;
      
      const [updatedBalance] = await db
        .update(vacationBalances)
        .set({
          totalDays,
          notes,
          updatedAt: new Date()
        })
        .where(eq(vacationBalances.id, parseInt(id)))
        .returning();

      if (!updatedBalance) {
        return res.status(404).json({ error: "Balance no encontrado" });
      }

      res.json(updatedBalance);
    } catch (error) {
      console.error("Error al actualizar balance:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // ========== 4. CONFIGURACIÓN DEL SISTEMA (/hr/vacation-settings) ==========

  // Obtener configuración del sistema
  apiRouter.get("/vacation-settings", async (req: Request, res: Response) => {
    try {
      const settings = await db
        .select()
        .from(vacationSettings)
        .where(eq(vacationSettings.isActive, true))
        .orderBy(asc(vacationSettings.settingKey));

      res.json(settings);
    } catch (error) {
      console.error("Error al obtener configuración:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Inicialización masiva de balances para nuevo año
  apiRouter.post("/vacation-balances/initialize", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { year, defaultDays = 12 } = req.body;
      
      // Obtener todos los empleados activos
      const activeEmployees = await db
        .select({ id: employees.id })
        .from(employees)
        .where(eq(employees.status, "active"));

      // Verificar si ya existen balances para este año
      const existingBalances = await db
        .select({ employeeId: vacationBalances.employeeId })
        .from(vacationBalances)
        .where(eq(vacationBalances.year, year));

      const existingEmployeeIds = existingBalances.map(b => b.employeeId);
      const employeesToInitialize = activeEmployees.filter(emp => !existingEmployeeIds.includes(emp.id));

      if (employeesToInitialize.length === 0) {
        return res.json({ message: "Todos los empleados ya tienen balances para este año" });
      }

      // Crear balances para empleados nuevos
      const newBalances = employeesToInitialize.map(emp => ({
        employeeId: emp.id,
        year,
        totalDays: defaultDays,
        usedDays: 0,
        pendingDays: 0,
        availableDays: defaultDays,
        notes: `Inicializado automáticamente para ${year}`
      }));

      await db.insert(vacationBalances).values(newBalances);

      res.json({ 
        message: `Balances inicializados para ${newBalances.length} empleados`,
        count: newBalances.length 
      });
    } catch (error) {
      console.error("Error al inicializar balances:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  console.log("🏖️ Rutas del módulo de vacaciones registradas correctamente");
}