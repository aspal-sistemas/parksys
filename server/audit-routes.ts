import { Express, Request, Response } from "express";
import { db } from "./db";
import { roleAuditLogs } from "../shared/schema";
import { desc, eq, and, or, like, count, sql } from "drizzle-orm";
import { z } from "zod";

// Esquema para filtros de auditoría
const auditFiltersSchema = z.object({
  search: z.string().optional(),
  action: z.string().optional(),
  severity: z.string().optional(),
  module: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0)
});

export function registerAuditRoutes(app: Express) {
  
  // Obtener logs de auditoría de roles con filtros
  app.get("/api/audit/role-changes", async (req: Request, res: Response) => {
    try {
      console.log("🔍 Obteniendo logs de auditoría de roles");
      
      const filters = auditFiltersSchema.parse(req.query);
      
      let whereConditions: any[] = [];
      
      // Filtro de búsqueda por texto
      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        whereConditions.push(
          or(
            like(roleAuditLogs.username, searchTerm),
            like(roleAuditLogs.description, searchTerm),
            like(roleAuditLogs.performedBy, searchTerm)
          )
        );
      }
      
      // Filtros específicos
      if (filters.action && filters.action !== 'all') {
        whereConditions.push(eq(roleAuditLogs.action, filters.action));
      }
      
      if (filters.severity && filters.severity !== 'all') {
        whereConditions.push(eq(roleAuditLogs.severity, filters.severity));
      }
      
      if (filters.module && filters.module !== 'all') {
        whereConditions.push(eq(roleAuditLogs.module, filters.module));
      }
      
      // Filtros de fecha
      if (filters.fromDate) {
        whereConditions.push(sql`${roleAuditLogs.timestamp} >= ${new Date(filters.fromDate)}`);
      }
      
      if (filters.toDate) {
        whereConditions.push(sql`${roleAuditLogs.timestamp} <= ${new Date(filters.toDate)}`);
      }
      
      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
      
      // Obtener logs con paginación
      const logs = await db
        .select()
        .from(roleAuditLogs)
        .where(whereClause)
        .orderBy(desc(roleAuditLogs.timestamp))
        .limit(filters.limit)
        .offset(filters.offset);
      
      // Contar total de registros para paginación
      const totalCountResult = await db
        .select({ count: count() })
        .from(roleAuditLogs)
        .where(whereClause);
      
      const totalCount = totalCountResult[0]?.count || 0;
      
      console.log(`✅ Encontrados ${logs.length} logs de auditoría`);
      
      res.json({
        success: true,
        data: logs,
        pagination: {
          total: totalCount,
          limit: filters.limit,
          offset: filters.offset,
          hasMore: (filters.offset + filters.limit) < totalCount
        }
      });
      
    } catch (error) {
      console.error("❌ Error al obtener logs de auditoría:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener logs de auditoría"
      });
    }
  });

  // Obtener estadísticas de auditoría
  app.get("/api/audit/statistics", async (req: Request, res: Response) => {
    try {
      console.log("📊 Obteniendo estadísticas de auditoría");
      
      const filters = auditFiltersSchema.pick({
        fromDate: true,
        toDate: true,
        module: true
      }).parse(req.query);
      
      let whereConditions: any[] = [];
      
      if (filters.fromDate) {
        whereConditions.push(sql`${roleAuditLogs.timestamp} >= ${new Date(filters.fromDate)}`);
      }
      
      if (filters.toDate) {
        whereConditions.push(sql`${roleAuditLogs.timestamp} <= ${new Date(filters.toDate)}`);
      }
      
      if (filters.module && filters.module !== 'all') {
        whereConditions.push(eq(roleAuditLogs.module, filters.module));
      }
      
      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
      
      // Estadísticas por severidad
      const severityStats = await db
        .select({
          severity: roleAuditLogs.severity,
          count: count()
        })
        .from(roleAuditLogs)
        .where(whereClause)
        .groupBy(roleAuditLogs.severity);
      
      // Estadísticas por acción
      const actionStats = await db
        .select({
          action: roleAuditLogs.action,
          count: count()
        })
        .from(roleAuditLogs)
        .where(whereClause)
        .groupBy(roleAuditLogs.action);
      
      // Estadísticas por módulo
      const moduleStats = await db
        .select({
          module: roleAuditLogs.module,
          count: count()
        })
        .from(roleAuditLogs)
        .where(whereClause)
        .groupBy(roleAuditLogs.module);
      
      // Actividad reciente (últimos 7 días)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentActivity = await db
        .select({
          date: sql<string>`DATE(${roleAuditLogs.timestamp})`.as('date'),
          count: count()
        })
        .from(roleAuditLogs)
        .where(
          and(
            sql`${roleAuditLogs.timestamp} >= ${sevenDaysAgo}`,
            whereClause
          )
        )
        .groupBy(sql`DATE(${roleAuditLogs.timestamp})`)
        .orderBy(sql`DATE(${roleAuditLogs.timestamp})`);
      
      console.log("✅ Estadísticas de auditoría obtenidas");
      
      res.json({
        success: true,
        data: {
          severity: severityStats,
          actions: actionStats,
          modules: moduleStats,
          recentActivity
        }
      });
      
    } catch (error) {
      console.error("❌ Error al obtener estadísticas de auditoría:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener estadísticas"
      });
    }
  });

  // Crear un nuevo log de auditoría
  app.post("/api/audit/log", async (req: Request, res: Response) => {
    try {
      const logData = req.body;
      
      const newLog = await db
        .insert(roleAuditLogs)
        .values({
          ...logData,
          timestamp: new Date(),
          createdAt: new Date()
        })
        .returning();
      
      console.log(`📝 Log de auditoría creado: ${logData.action} por ${logData.performedBy}`);
      
      res.json({
        success: true,
        data: newLog[0],
        message: "Log de auditoría creado exitosamente"
      });
      
    } catch (error) {
      console.error("❌ Error al crear log de auditoría:", error);
      res.status(500).json({
        success: false,
        error: "Error al crear log de auditoría"
      });
    }
  });

  // Obtener módulos disponibles
  app.get("/api/audit/modules", async (req: Request, res: Response) => {
    try {
      const modules = await db
        .select({ module: roleAuditLogs.module })
        .from(roleAuditLogs)
        .groupBy(roleAuditLogs.module)
        .orderBy(roleAuditLogs.module);
      
      const moduleList = [
        { value: 'all', label: 'Todos los módulos' },
        ...modules.map((m: { module: string }) => ({ value: m.module, label: m.module }))
      ];
      
      res.json({
        success: true,
        data: moduleList
      });
      
    } catch (error) {
      console.error("❌ Error al obtener módulos:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener módulos"
      });
    }
  });

  console.log("✅ Rutas de auditoría de roles registradas");
}