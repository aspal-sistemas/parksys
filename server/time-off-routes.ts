import { Request, Response, Router } from "express";
import { db } from "./db";
import { 
  timeOffRequests, 
  vacationBalances, 
  timeRecords, 
  dailyTimeSheets, 
  workSchedules,
  employees,
  users
} from "../shared/schema";
import { 
  InsertTimeOffRequest, 
  InsertVacationBalance, 
  InsertTimeRecord, 
  InsertDailyTimeSheet, 
  InsertWorkSchedule 
} from "../shared/schema";
import { eq, desc, asc, and, gte, lte, sql, or } from "drizzle-orm";

/**
 * Registra las rutas para el módulo de vacaciones, permisos y control de horas
 */
export function registerTimeOffRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  
  // ========== RUTAS DE SOLICITUDES DE TIEMPO LIBRE ==========
  
  // Obtener todas las solicitudes con filtro por año
  apiRouter.get("/time-off-requests", async (req: Request, res: Response) => {
    try {
      const { status, employeeId, type, year, month, name, department, limit = "50", offset = "0" } = req.query;
      
      let whereConditions: any[] = [];
      
      if (status) {
        whereConditions.push(sql`${timeOffRequests.status} = ${status}`);
      }
      
      if (employeeId) {
        whereConditions.push(eq(timeOffRequests.employeeId, parseInt(employeeId as string)));
      }
      
      if (type) {
        whereConditions.push(eq(timeOffRequests.requestType, type as any));
      }
      
      // Filtro por año y mes
      if (year) {
        const selectedYear = parseInt(year as string);
        if (month) {
          // Filtro específico por mes
          const selectedMonth = parseInt(month as string);
          const startOfMonth = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
          const endOfMonth = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];
          whereConditions.push(
            and(
              gte(timeOffRequests.startDate, startOfMonth),
              lte(timeOffRequests.startDate, endOfMonth)
            )
          );
        } else {
          // Solo filtro por año
          const startOfYear = new Date(selectedYear, 0, 1).toISOString().split('T')[0];
          const endOfYear = new Date(selectedYear, 11, 31).toISOString().split('T')[0];
          whereConditions.push(
            and(
              gte(timeOffRequests.startDate, startOfYear),
              lte(timeOffRequests.startDate, endOfYear)
            )
          );
        }
      }
      
      // Filtro por nombre del empleado
      if (name) {
        whereConditions.push(
          sql`LOWER(${employees.fullName}) LIKE LOWER(${'%' + name + '%'})`
        );
      }
      
      // Filtro por departamento
      if (department) {
        whereConditions.push(eq(employees.department, department as string));
      }
      
      const requests = await db
        .select({
          id: timeOffRequests.id,
          employeeId: timeOffRequests.employeeId,
          employeeName: employees.fullName,
          employeePosition: employees.position,
          requestType: timeOffRequests.requestType,
          startDate: timeOffRequests.startDate,
          endDate: timeOffRequests.endDate,
          requestedDays: timeOffRequests.requestedDays,
          reason: timeOffRequests.reason,
          description: timeOffRequests.description,
          status: timeOffRequests.status,
          submittedAt: timeOffRequests.submittedAt,
          approvedBy: timeOffRequests.approvedBy,
          approvedAt: timeOffRequests.approvedAt,
          rejectionReason: timeOffRequests.rejectionReason,
          approverName: users.fullName
        })
        .from(timeOffRequests)
        .leftJoin(employees, eq(timeOffRequests.employeeId, employees.id))
        .leftJoin(users, eq(timeOffRequests.approvedBy, users.id))
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(timeOffRequests.submittedAt))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));
      
      res.json(requests);
    } catch (error) {
      console.error("Error obteniendo solicitudes de tiempo libre:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // Obtener solicitud específica
  apiRouter.get("/time-off-requests/:id", async (req: Request, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      
      const [request] = await db
        .select({
          id: timeOffRequests.id,
          employeeId: timeOffRequests.employeeId,
          employeeName: employees.fullName,
          employeePosition: employees.position,
          employeeDepartment: employees.department,
          requestType: timeOffRequests.requestType,
          startDate: timeOffRequests.startDate,
          endDate: timeOffRequests.endDate,
          requestedDays: timeOffRequests.requestedDays,
          reason: timeOffRequests.reason,
          description: timeOffRequests.description,
          medicalCertificate: timeOffRequests.medicalCertificate,
          attachments: timeOffRequests.attachments,
          status: timeOffRequests.status,
          submittedAt: timeOffRequests.submittedAt,
          approvedBy: timeOffRequests.approvedBy,
          approvedAt: timeOffRequests.approvedAt,
          rejectionReason: timeOffRequests.rejectionReason,
          approverName: users.fullName
        })
        .from(timeOffRequests)
        .leftJoin(employees, eq(timeOffRequests.employeeId, employees.id))
        .leftJoin(users, eq(timeOffRequests.approvedBy, users.id))
        .where(eq(timeOffRequests.id, requestId));
      
      if (!request) {
        return res.status(404).json({ error: "Solicitud no encontrada" });
      }
      
      res.json(request);
    } catch (error) {
      console.error("Error obteniendo solicitud:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // Crear nueva solicitud
  apiRouter.post("/time-off-requests", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const requestData: InsertTimeOffRequest = req.body;
      
      // Calcular días solicitados automáticamente
      const startDate = new Date(requestData.startDate);
      const endDate = new Date(requestData.endDate);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      const [newRequest] = await db
        .insert(timeOffRequests)
        .values({
          ...requestData,
          requestedDays: diffDays.toString()
        })
        .returning();
      
      res.status(201).json(newRequest);
    } catch (error) {
      console.error("Error creando solicitud:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // Actualizar solicitud
  apiRouter.put("/time-off-requests/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      const updateData = req.body;
      
      const [updatedRequest] = await db
        .update(timeOffRequests)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(timeOffRequests.id, requestId))
        .returning();
      
      if (!updatedRequest) {
        return res.status(404).json({ error: "Solicitud no encontrada" });
      }
      
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error actualizando solicitud:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // Aprobar/Rechazar solicitud
  apiRouter.post("/time-off-requests/:id/approve", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      const { action, rejectionReason } = req.body; // action: 'approve' | 'reject'
      const userId = (req as any).user?.id;
      
      const updateData: any = {
        status: action === 'approve' ? 'approved' : 'rejected',
        approvedBy: userId,
        approvedAt: new Date(),
        updatedAt: new Date()
      };
      
      if (action === 'reject' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
      
      const [updatedRequest] = await db
        .update(timeOffRequests)
        .set(updateData)
        .where(eq(timeOffRequests.id, requestId))
        .returning();
      
      if (!updatedRequest) {
        return res.status(404).json({ error: "Solicitud no encontrada" });
      }
      
      // Si es aprobación de vacaciones, actualizar balance
      if (action === 'approve' && updatedRequest.requestType === 'vacation') {
        const year = new Date(updatedRequest.startDate).getFullYear();
        
        await db
          .update(vacationBalances)
          .set({
            usedDays: sql`used_days + ${updatedRequest.requestedDays}`,
            availableDays: sql`available_days - ${updatedRequest.requestedDays}`,
            updatedAt: new Date()
          })
          .where(and(
            eq(vacationBalances.employeeId, updatedRequest.employeeId),
            eq(vacationBalances.year, year)
          ));
      }
      
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error procesando solicitud:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // ========== RUTAS DE BALANCES DE VACACIONES ==========
  
  // Obtener balances de vacaciones
  apiRouter.get("/vacation-balances", async (req: Request, res: Response) => {
    try {
      const { employeeId, year, month, name, department } = req.query;
      
      let whereConditions: any[] = [];
      
      if (employeeId) {
        whereConditions.push(eq(vacationBalances.employeeId, parseInt(employeeId as string)));
      }
      
      if (year) {
        whereConditions.push(eq(vacationBalances.year, parseInt(year as string)));
      }
      
      // Filtro por nombre del empleado
      if (name) {
        whereConditions.push(
          sql`LOWER(${employees.fullName}) LIKE LOWER(${'%' + name + '%'})`
        );
      }
      
      // Filtro por departamento
      if (department) {
        whereConditions.push(eq(employees.department, department as string));
      }
      
      const balances = await db
        .select({
          id: vacationBalances.id,
          employeeId: vacationBalances.employeeId,
          employeeName: employees.fullName,
          employeePosition: employees.position,
          year: vacationBalances.year,
          totalDays: vacationBalances.totalDays,
          usedDays: vacationBalances.usedDays,
          pendingDays: vacationBalances.pendingDays,
          availableDays: vacationBalances.availableDays,
          startDate: vacationBalances.startDate,
          endDate: vacationBalances.endDate,
          notes: vacationBalances.notes
        })
        .from(vacationBalances)
        .leftJoin(employees, eq(vacationBalances.employeeId, employees.id))
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(vacationBalances.year), asc(employees.fullName));
      
      res.json(balances);
    } catch (error) {
      console.error("Error obteniendo balances de vacaciones:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // Crear/Actualizar balance de vacaciones
  apiRouter.post("/vacation-balances", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const balanceData: InsertVacationBalance = req.body;
      
      // Verificar si ya existe un balance para este empleado y año
      const [existingBalance] = await db
        .select()
        .from(vacationBalances)
        .where(and(
          eq(vacationBalances.employeeId, balanceData.employeeId),
          eq(vacationBalances.year, balanceData.year)
        ));
      
      if (existingBalance) {
        // Actualizar balance existente
        const [updatedBalance] = await db
          .update(vacationBalances)
          .set({
            ...balanceData,
            updatedAt: new Date()
          })
          .where(eq(vacationBalances.id, existingBalance.id))
          .returning();
        
        res.json(updatedBalance);
      } else {
        // Crear nuevo balance
        const [newBalance] = await db
          .insert(vacationBalances)
          .values(balanceData)
          .returning();
        
        res.status(201).json(newBalance);
      }
    } catch (error) {
      console.error("Error guardando balance de vacaciones:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // ========== RUTAS DE REGISTROS DE TIEMPO ==========
  
  // Obtener registros de tiempo
  apiRouter.get("/time-records", async (req: Request, res: Response) => {
    try {
      const { employeeId, date, dateFrom, dateTo, type, limit = "100", offset = "0" } = req.query;
      
      let whereConditions: any[] = [];
      
      if (employeeId) {
        whereConditions.push(eq(timeRecords.employeeId, parseInt(employeeId as string)));
      }
      
      if (date) {
        whereConditions.push(eq(timeRecords.date, date as string));
      }
      
      if (dateFrom && dateTo) {
        whereConditions.push(
          and(
            gte(timeRecords.date, dateFrom as string),
            lte(timeRecords.date, dateTo as string)
          )
        );
      }
      
      if (type) {
        whereConditions.push(eq(timeRecords.recordType, type as any));
      }
      
      const records = await db
        .select({
          id: timeRecords.id,
          employeeId: timeRecords.employeeId,
          employeeName: employees.fullName,
          recordType: timeRecords.recordType,
          timestamp: timeRecords.timestamp,
          date: timeRecords.date,
          location: timeRecords.location,
          notes: timeRecords.notes,
          isManualEntry: timeRecords.isManualEntry,
          manualReason: timeRecords.manualReason,
          registeredBy: timeRecords.registeredBy,
          registeredByName: users.fullName,
          createdAt: timeRecords.createdAt
        })
        .from(timeRecords)
        .leftJoin(employees, eq(timeRecords.employeeId, employees.id))
        .leftJoin(users, eq(timeRecords.registeredBy, users.id))
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(timeRecords.timestamp))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));
      
      res.json(records);
    } catch (error) {
      console.error("Error obteniendo registros de tiempo:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // Registrar entrada/salida
  apiRouter.post("/time-records", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const recordData: InsertTimeRecord = req.body;
      const userId = (req as any).user?.id;
      
      const [newRecord] = await db
        .insert(timeRecords)
        .values({
          ...recordData,
          registeredBy: recordData.isManualEntry ? userId : undefined
        })
        .returning();
      
      // Actualizar hoja de tiempo diaria si es entrada o salida
      if (newRecord.recordType === 'check_in' || newRecord.recordType === 'check_out') {
        await updateDailyTimeSheet(newRecord.employeeId, newRecord.date);
      }
      
      res.status(201).json(newRecord);
    } catch (error) {
      console.error("Error registrando tiempo:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // ========== RUTAS DE HOJAS DE TIEMPO DIARIAS ==========
  
  // Obtener hojas de tiempo diarias
  apiRouter.get("/daily-time-sheets", async (req: Request, res: Response) => {
    try {
      const { employeeId, date, dateFrom, dateTo, limit = "50", offset = "0" } = req.query;
      
      let whereConditions: any[] = [];
      
      if (employeeId) {
        whereConditions.push(eq(dailyTimeSheets.employeeId, parseInt(employeeId as string)));
      }
      
      if (date) {
        whereConditions.push(eq(dailyTimeSheets.date, date as string));
      }
      
      if (dateFrom && dateTo) {
        whereConditions.push(
          and(
            gte(dailyTimeSheets.date, dateFrom as string),
            lte(dailyTimeSheets.date, dateTo as string)
          )
        );
      }
      
      const timeSheets = await db
        .select({
          id: dailyTimeSheets.id,
          employeeId: dailyTimeSheets.employeeId,
          employeeName: employees.fullName,
          employeePosition: employees.position,
          date: dailyTimeSheets.date,
          checkInTime: dailyTimeSheets.checkInTime,
          checkOutTime: dailyTimeSheets.checkOutTime,
          regularHours: dailyTimeSheets.regularHours,
          overtimeHours: dailyTimeSheets.overtimeHours,
          breakHours: dailyTimeSheets.breakHours,
          totalHours: dailyTimeSheets.totalHours,
          isLate: dailyTimeSheets.isLate,
          lateMinutes: dailyTimeSheets.lateMinutes,
          isEarlyLeave: dailyTimeSheets.isEarlyLeave,
          earlyLeaveMinutes: dailyTimeSheets.earlyLeaveMinutes,
          isAbsent: dailyTimeSheets.isAbsent,
          absenceReason: dailyTimeSheets.absenceReason,
          lateReason: dailyTimeSheets.lateReason,
          isJustified: dailyTimeSheets.isJustified,
          notes: dailyTimeSheets.notes,
          approvedBy: dailyTimeSheets.approvedBy,
          approvedAt: dailyTimeSheets.approvedAt,
          approverName: users.fullName
        })
        .from(dailyTimeSheets)
        .leftJoin(employees, eq(dailyTimeSheets.employeeId, employees.id))
        .leftJoin(users, eq(dailyTimeSheets.approvedBy, users.id))
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(dailyTimeSheets.date), asc(employees.fullName))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));
      
      res.json(timeSheets);
    } catch (error) {
      console.error("Error obteniendo hojas de tiempo:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // Actualizar hoja de tiempo diaria
  apiRouter.put("/daily-time-sheets/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const timeSheetId = parseInt(req.params.id);
      const updateData = req.body;
      
      const [updatedTimeSheet] = await db
        .update(dailyTimeSheets)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(dailyTimeSheets.id, timeSheetId))
        .returning();
      
      if (!updatedTimeSheet) {
        return res.status(404).json({ error: "Hoja de tiempo no encontrada" });
      }
      
      res.json(updatedTimeSheet);
    } catch (error) {
      console.error("Error actualizando hoja de tiempo:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // ========== RUTAS DE HORARIOS DE TRABAJO ==========
  
  // Obtener horarios de trabajo
  apiRouter.get("/work-schedules", async (req: Request, res: Response) => {
    try {
      const { employeeId, active } = req.query;
      
      let whereConditions: any[] = [];
      
      if (employeeId) {
        whereConditions.push(eq(workSchedules.employeeId, parseInt(employeeId as string)));
      }
      
      if (active !== undefined) {
        whereConditions.push(eq(workSchedules.isActive, active === 'true'));
      }
      
      const schedules = await db
        .select({
          id: workSchedules.id,
          employeeId: workSchedules.employeeId,
          employeeName: employees.fullName,
          employeePosition: employees.position,
          monday: workSchedules.monday,
          tuesday: workSchedules.tuesday,
          wednesday: workSchedules.wednesday,
          thursday: workSchedules.thursday,
          friday: workSchedules.friday,
          saturday: workSchedules.saturday,
          sunday: workSchedules.sunday,
          startTime: workSchedules.startTime,
          endTime: workSchedules.endTime,
          breakStartTime: workSchedules.breakStartTime,
          breakEndTime: workSchedules.breakEndTime,
          regularHoursPerDay: workSchedules.regularHoursPerDay,
          toleranceMinutes: workSchedules.toleranceMinutes,
          effectiveFrom: workSchedules.effectiveFrom,
          effectiveTo: workSchedules.effectiveTo,
          isActive: workSchedules.isActive,
          notes: workSchedules.notes,
          createdBy: workSchedules.createdBy,
          createdByName: users.fullName
        })
        .from(workSchedules)
        .leftJoin(employees, eq(workSchedules.employeeId, employees.id))
        .leftJoin(users, eq(workSchedules.createdBy, users.id))
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(workSchedules.effectiveFrom));
      
      res.json(schedules);
    } catch (error) {
      console.error("Error obteniendo horarios:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // Crear horario de trabajo
  apiRouter.post("/work-schedules", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const scheduleData: InsertWorkSchedule = req.body;
      const userId = (req as any).user?.id;
      
      // Desactivar horarios anteriores del empleado
      await db
        .update(workSchedules)
        .set({
          isActive: false,
          effectiveTo: new Date().toISOString().split('T')[0],
          updatedAt: new Date()
        })
        .where(and(
          eq(workSchedules.employeeId, scheduleData.employeeId),
          eq(workSchedules.isActive, true)
        ));
      
      const [newSchedule] = await db
        .insert(workSchedules)
        .values({
          ...scheduleData,
          createdBy: userId
        })
        .returning();
      
      res.status(201).json(newSchedule);
    } catch (error) {
      console.error("Error creando horario:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // Estadísticas de tiempo
  apiRouter.get("/time-stats", async (req: Request, res: Response) => {
    try {
      const { employeeId, month, year } = req.query;
      const currentYear = parseInt(year as string) || new Date().getFullYear();
      const currentMonth = parseInt(month as string) || new Date().getMonth() + 1;
      
      let whereConditions: any[] = [
        sql`EXTRACT(YEAR FROM ${dailyTimeSheets.date}) = ${currentYear}`,
        sql`EXTRACT(MONTH FROM ${dailyTimeSheets.date}) = ${currentMonth}`
      ];
      
      if (employeeId) {
        whereConditions.push(eq(dailyTimeSheets.employeeId, parseInt(employeeId as string)));
      }
      
      const stats = await db
        .select({
          totalRegularHours: sql<number>`COALESCE(SUM(${dailyTimeSheets.regularHours}), 0)`,
          totalOvertimeHours: sql<number>`COALESCE(SUM(${dailyTimeSheets.overtimeHours}), 0)`,
          totalHours: sql<number>`COALESCE(SUM(${dailyTimeSheets.totalHours}), 0)`,
          daysWorked: sql<number>`COUNT(CASE WHEN ${dailyTimeSheets.isAbsent} = false THEN 1 END)`,
          daysAbsent: sql<number>`COUNT(CASE WHEN ${dailyTimeSheets.isAbsent} = true THEN 1 END)`,
          daysLate: sql<number>`COUNT(CASE WHEN ${dailyTimeSheets.isLate} = true THEN 1 END)`,
          totalLateMinutes: sql<number>`COALESCE(SUM(${dailyTimeSheets.lateMinutes}), 0)`
        })
        .from(dailyTimeSheets)
        .where(and(...whereConditions));
      
      res.json(stats[0] || {
        totalRegularHours: 0,
        totalOvertimeHours: 0,
        totalHours: 0,
        daysWorked: 0,
        daysAbsent: 0,
        daysLate: 0,
        totalLateMinutes: 0
      });
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  console.log("Rutas de tiempo libre y control de horas registradas correctamente");
}

/**
 * Función auxiliar para actualizar la hoja de tiempo diaria
 */
async function updateDailyTimeSheet(employeeId: number, date: string) {
  try {
    // Obtener registros del día
    const dayRecords = await db
      .select()
      .from(timeRecords)
      .where(and(
        eq(timeRecords.employeeId, employeeId),
        eq(timeRecords.date, date)
      ))
      .orderBy(asc(timeRecords.timestamp));
    
    if (dayRecords.length === 0) return;
    
    // Encontrar entrada y salida
    const checkIn = dayRecords.find(r => r.recordType === 'check_in');
    const checkOut = dayRecords.find(r => r.recordType === 'check_out');
    
    let totalHours = 0;
    let isAbsent = true;
    let isLate = false;
    let lateMinutes = 0;
    
    if (checkIn) {
      isAbsent = false;
      
      // Obtener horario del empleado
      const [schedule] = await db
        .select()
        .from(workSchedules)
        .where(and(
          eq(workSchedules.employeeId, employeeId),
          eq(workSchedules.isActive, true)
        ));
      
      if (schedule) {
        const scheduledStart = new Date(`${date}T${schedule.startTime}`);
        const actualStart = new Date(checkIn.timestamp);
        
        if (actualStart > scheduledStart) {
          isLate = true;
          lateMinutes = Math.round((actualStart.getTime() - scheduledStart.getTime()) / (1000 * 60));
        }
      }
      
      if (checkOut) {
        const checkInTime = new Date(checkIn.timestamp);
        const checkOutTime = new Date(checkOut.timestamp);
        totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
      }
    }
    
    // Crear o actualizar hoja de tiempo diaria
    const timeSheetData = {
      employeeId,
      date,
      checkInTime: checkIn?.timestamp,
      checkOutTime: checkOut?.timestamp,
      totalHours: totalHours.toFixed(2),
      regularHours: Math.min(totalHours, 8).toFixed(2),
      overtimeHours: Math.max(totalHours - 8, 0).toFixed(2),
      isAbsent,
      isLate,
      lateMinutes,
      updatedAt: new Date()
    };
    
    // Verificar si ya existe
    const [existing] = await db
      .select()
      .from(dailyTimeSheets)
      .where(and(
        eq(dailyTimeSheets.employeeId, employeeId),
        eq(dailyTimeSheets.date, date)
      ));
    
    if (existing) {
      await db
        .update(dailyTimeSheets)
        .set(timeSheetData)
        .where(eq(dailyTimeSheets.id, existing.id));
    } else {
      await db
        .insert(dailyTimeSheets)
        .values(timeSheetData as any);
    }
    
  } catch (error) {
    console.error("Error actualizando hoja de tiempo diaria:", error);
  }
}