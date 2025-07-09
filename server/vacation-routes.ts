import { Request, Response } from "express";
import { eq, sql, and, desc, asc, gte, lte, or, like, count } from "drizzle-orm";
import { db, pool } from "./db";
import { 
  timeOffRequests, 
  vacationBalances, 
  employees, 
  users
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
      
      // Crear condiciones WHERE para SQL directo
      const whereConditions = [];
      let sqlParams = [];
      
      if (employeeId && employeeId !== 'all') {
        whereConditions.push(`tor.employee_id = $${sqlParams.length + 1}`);
        sqlParams.push(parseInt(employeeId as string));
      }
      if (status && status !== 'all') {
        whereConditions.push(`tor.status = $${sqlParams.length + 1}`);
        sqlParams.push(status as string);
      }
      if (requestType && requestType !== 'all') {
        whereConditions.push(`tor.request_type = $${sqlParams.length + 1}`);
        sqlParams.push(requestType as string);
      }
      if (startDate) {
        whereConditions.push(`tor.start_date >= $${sqlParams.length + 1}`);
        sqlParams.push(startDate as string);
      }
      if (endDate) {
        whereConditions.push(`tor.end_date <= $${sqlParams.length + 1}`);
        sqlParams.push(endDate as string);
      }
      
      // Obtener solicitudes con información del empleado usando SQL directo
      let sqlQuery = `
        SELECT 
          tor.id,
          tor.employee_id as "employeeId",
          e.full_name as "employeeName",
          tor.request_type as "requestType",
          tor.start_date as "startDate",
          tor.end_date as "endDate",
          tor.requested_days as "requestedDays",
          tor.reason,
          tor.status,
          tor.submitted_at as "submittedAt",
          tor.approved_by as "approvedBy",
          tor.approved_at as "approvedAt",
          tor.rejection_reason as "rejectionReason"
        FROM time_off_requests tor
        INNER JOIN employees e ON tor.employee_id = e.id
      `;
      
      // Agregar WHERE clause si hay condiciones
      if (whereConditions.length > 0) {
        sqlQuery += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      sqlQuery += ' ORDER BY tor.created_at DESC LIMIT $' + (sqlParams.length + 1) + ' OFFSET $' + (sqlParams.length + 2);
      sqlParams.push(parseInt(limit as string), offset);
      
      const requests = await pool.query(sqlQuery, sqlParams);
      
      // Contar total de registros
      let countQuery = 'SELECT COUNT(*) FROM time_off_requests';
      let countParams = [];
      
      // Contar con las mismas condiciones WHERE
      if (whereConditions.length > 0) {
        // Crear condiciones sin aliases para la consulta de count
        const countConditions = whereConditions.map(condition => 
          condition.replace('tor.', '')
        );
        countQuery += ' WHERE ' + countConditions.join(' AND ');
        countParams = [...sqlParams.slice(0, -2)]; // Excluir LIMIT y OFFSET
      }
      
      const totalResult = await pool.query(countQuery, countParams);
      
      const total = totalResult.rows[0].count;
      
      res.json({
        data: requests.rows,
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

      // Validar disponibilidad de días (temporalmente simplificado)
      console.log("Creando solicitud para empleado:", employeeId, "días:", requestedDays);

      // Crear solicitud
      const [newRequest] = await db
        .insert(timeOffRequests)
        .values({
          employeeId,
          requestType,
          startDate,
          endDate,
          requestedDays: requestedDays,
          reason,
          description,
          status: "pending"
        })
        .returning();

      // Actualización del balance deshabilitada temporalmente
      console.log("Solicitud creada exitosamente:", newRequest.id);

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
      const result = await db.execute(`
        SELECT * FROM vacation_settings 
        WHERE is_active = true 
        ORDER BY setting_key ASC;
      `);

      res.json(result.rows);
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