import type { Express } from "express";

export function registerActivityStatsRoutes(app: Express) {
  // Endpoint para obtener estadísticas de inscripciones de una actividad específica
  app.get("/api/activity-registrations/stats/:activityId", async (req, res) => {
    try {
      const activityId = parseInt(req.params.activityId);
      
      if (isNaN(activityId)) {
        return res.status(400).json({ error: "ID de actividad inválido" });
      }

      console.log(`📊 Obteniendo estadísticas para actividad ${activityId}`);

      const { db } = await import("../db");
      const { sql } = await import("drizzle-orm");

      // Obtener datos de la actividad y sus registros
      const result = await db.execute(
        sql`SELECT 
          a.id,
          a.title,
          a.capacity,
          a.max_registrations,
          a.registration_enabled,
          a.requires_approval,
          COUNT(ar.id) as total_registrations,
          COUNT(CASE WHEN ar.status = 'approved' THEN 1 END) as approved_registrations,
          COUNT(CASE WHEN ar.status = 'pending' THEN 1 END) as pending_registrations,
          COUNT(CASE WHEN ar.status = 'rejected' THEN 1 END) as rejected_registrations
        FROM activities a
        LEFT JOIN activity_registrations ar ON a.id = ar.activity_id
        WHERE a.id = ${activityId}
        GROUP BY a.id, a.title, a.capacity, a.max_registrations, a.registration_enabled, a.requires_approval`
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Actividad no encontrada" });
      }

      const activity = result.rows[0];
      
      // Calcular plazas disponibles usando la capacidad total, no max_registrations
      const totalCapacity = activity.capacity || 0;
      const totalRegistrations = parseInt(activity.total_registrations) || 0;
      const approvedRegistrations = parseInt(activity.approved_registrations) || 0;
      const pendingRegistrations = parseInt(activity.pending_registrations) || 0;
      
      // Las plazas disponibles se calculan con la capacidad total
      const availableSlots = Math.max(0, totalCapacity - totalRegistrations);

      console.log(`📊 Estadísticas calculadas para actividad ${activityId}:`);
      console.log(`   Capacidad total: ${totalCapacity}`);
      console.log(`   Registros totales: ${totalRegistrations}`);
      console.log(`   Plazas disponibles: ${availableSlots}`);

      const stats = {
        activityId,
        title: activity.title,
        capacity: totalCapacity,
        maxRegistrations: activity.max_registrations,
        registrationEnabled: activity.registration_enabled,
        requiresApproval: activity.requires_approval,
        totalRegistrations,
        approved: approvedRegistrations,
        pending: pendingRegistrations,
        rejected: parseInt(activity.rejected_registrations) || 0,
        availableSlots
      };

      res.json(stats);

    } catch (error: any) {
      console.error("Error obteniendo estadísticas de actividad:", error);
      res.status(500).json({ 
        error: "Error interno del servidor",
        details: error.message 
      });
    }
  });
}