import { Request, Response } from 'express';
import { db } from './db';
import { 
  sponsorshipPackages, 
  sponsors, 
  sponsorshipCampaigns,
  sponsorshipContracts,
  sponsorEvents,
  sponsorshipMetrics,
  sponsorAssets,
  sponsorshipEvaluations,
  sponsorshipRenewals,
  sponsorEventBenefits,
  insertSponsorshipPackageSchema, 
  insertSponsorSchema, 
  insertSponsorshipCampaignSchema,
  insertSponsorshipContractSchema,
  insertSponsorEventSchema,
  insertSponsorshipMetricsSchema,
  insertSponsorAssetSchema,
  insertSponsorshipEvaluationSchema,
  insertSponsorshipRenewalSchema,
  insertSponsorEventBenefitSchema
} from '../shared/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * Rutas para el sistema de patrocinios
 */
export function registerSponsorshipRoutes(app: any, apiRouter: any, isAuthenticated: any) {
  
  // ===== PAQUETES DE PATROCINIO =====
  
  // Obtener todos los paquetes de patrocinio
  apiRouter.get('/sponsorship-packages', async (req: Request, res: Response) => {
    try {
      const packages = await db
        .select()
        .from(sponsorshipPackages)
        .orderBy(desc(sponsorshipPackages.createdAt));
      
      res.json(packages);
    } catch (error) {
      console.error('Error al obtener paquetes de patrocinio:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Obtener un paquete específico
  apiRouter.get('/sponsorship-packages/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const packageResult = await db
        .select()
        .from(sponsorshipPackages)
        .where(eq(sponsorshipPackages.id, parseInt(id)))
        .limit(1);
      
      if (packageResult.length === 0) {
        return res.status(404).json({ error: 'Paquete no encontrado' });
      }
      
      res.json(packageResult[0]);
    } catch (error) {
      console.error('Error al obtener paquete:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Crear nuevo paquete de patrocinio
  apiRouter.post('/sponsorship-packages', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const validatedData = insertSponsorshipPackageSchema.parse(req.body);
      
      const [newPackage] = await db
        .insert(sponsorshipPackages)
        .values(validatedData)
        .returning();
      
      res.status(201).json(newPackage);
    } catch (error) {
      console.error('Error al crear paquete de patrocinio:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Actualizar paquete de patrocinio
  apiRouter.put('/sponsorship-packages/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = insertSponsorshipPackageSchema.parse(req.body);
      
      const [updatedPackage] = await db
        .update(sponsorshipPackages)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(sponsorshipPackages.id, parseInt(id)))
        .returning();
      
      if (!updatedPackage) {
        return res.status(404).json({ error: 'Paquete no encontrado' });
      }
      
      res.json(updatedPackage);
    } catch (error) {
      console.error('Error al actualizar paquete:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Eliminar paquete de patrocinio
  apiRouter.delete('/sponsorship-packages/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [deletedPackage] = await db
        .delete(sponsorshipPackages)
        .where(eq(sponsorshipPackages.id, parseInt(id)))
        .returning();
      
      if (!deletedPackage) {
        return res.status(404).json({ error: 'Paquete no encontrado' });
      }
      
      res.json({ message: 'Paquete eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar paquete:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // ===== PATROCINADORES =====
  
  // Obtener todos los patrocinadores
  apiRouter.get('/sponsors', async (req: Request, res: Response) => {
    try {
      const sponsorsList = await db
        .select()
        .from(sponsors)
        .orderBy(desc(sponsors.createdAt));
      
      res.json(sponsorsList);
    } catch (error) {
      console.error('Error al obtener patrocinadores:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Obtener un patrocinador específico
  apiRouter.get('/sponsors/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const sponsor = await db
        .select()
        .from(sponsors)
        .where(eq(sponsors.id, parseInt(id)))
        .limit(1);
      
      if (sponsor.length === 0) {
        return res.status(404).json({ error: 'Patrocinador no encontrado' });
      }
      
      res.json(sponsor[0]);
    } catch (error) {
      console.error('Error al obtener patrocinador:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Crear nuevo patrocinador
  apiRouter.post('/sponsors', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const validatedData = insertSponsorSchema.parse(req.body);
      
      const [newSponsor] = await db
        .insert(sponsors)
        .values(validatedData)
        .returning();
      
      res.status(201).json(newSponsor);
    } catch (error) {
      console.error('Error al crear patrocinador:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Actualizar patrocinador
  apiRouter.put('/sponsors/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = insertSponsorSchema.parse(req.body);
      
      const [updatedSponsor] = await db
        .update(sponsors)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(sponsors.id, parseInt(id)))
        .returning();
      
      if (!updatedSponsor) {
        return res.status(404).json({ error: 'Patrocinador no encontrado' });
      }
      
      res.json(updatedSponsor);
    } catch (error) {
      console.error('Error al actualizar patrocinador:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Eliminar patrocinador
  apiRouter.delete('/sponsors/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [deletedSponsor] = await db
        .delete(sponsors)
        .where(eq(sponsors.id, parseInt(id)))
        .returning();
      
      if (!deletedSponsor) {
        return res.status(404).json({ error: 'Patrocinador no encontrado' });
      }
      
      res.json({ message: 'Patrocinador eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar patrocinador:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // ===== CAMPAÑAS DE PATROCINIO =====
  
  // Obtener todas las campañas
  apiRouter.get('/sponsorship-campaigns', async (req: Request, res: Response) => {
    try {
      const campaigns = await db
        .select()
        .from(sponsorshipCampaigns)
        .orderBy(desc(sponsorshipCampaigns.createdAt));
      
      res.json(campaigns);
    } catch (error) {
      console.error('Error al obtener campañas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Crear nueva campaña
  apiRouter.post('/sponsorship-campaigns', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const validatedData = insertSponsorshipCampaignSchema.parse(req.body);
      
      const [newCampaign] = await db
        .insert(sponsorshipCampaigns)
        .values(validatedData)
        .returning();
      
      res.status(201).json(newCampaign);
    } catch (error) {
      console.error('Error al crear campaña:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // ===== CONTRATOS DE PATROCINIO =====
  
  // Obtener todos los contratos
  apiRouter.get('/sponsorship-contracts', async (req: Request, res: Response) => {
    try {
      const contracts = await db
        .select()
        .from(sponsorshipContracts)
        .orderBy(desc(sponsorshipContracts.createdAt));
      
      res.json(contracts);
    } catch (error) {
      console.error('Error al obtener contratos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Crear nuevo contrato
  apiRouter.post('/sponsorship-contracts', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const validatedData = insertSponsorshipContractSchema.parse(req.body);
      
      const [newContract] = await db
        .insert(sponsorshipContracts)
        .values(validatedData)
        .returning();
      
      res.status(201).json(newContract);
    } catch (error) {
      console.error('Error al crear contrato:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Obtener contratos por patrocinador
  apiRouter.get('/sponsors/:sponsorId/contracts', async (req: Request, res: Response) => {
    try {
      const { sponsorId } = req.params;
      const contracts = await db
        .select()
        .from(sponsorshipContracts)
        .where(eq(sponsorshipContracts.sponsorId, parseInt(sponsorId)))
        .orderBy(desc(sponsorshipContracts.createdAt));
      
      res.json(contracts);
    } catch (error) {
      console.error('Error al obtener contratos del patrocinador:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // ===== EVENTOS PATROCINADOS =====
  
  // Obtener todos los eventos patrocinados
  apiRouter.get('/sponsor-events', async (req: Request, res: Response) => {
    try {
      const events = await db
        .select()
        .from(sponsorEvents)
        .orderBy(desc(sponsorEvents.createdAt));
      
      res.json(events);
    } catch (error) {
      console.error('Error al obtener eventos patrocinados:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Crear nuevo evento patrocinado
  apiRouter.post('/sponsor-events', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const validatedData = insertSponsorEventSchema.parse(req.body);
      
      const [newEvent] = await db
        .insert(sponsorEvents)
        .values(validatedData)
        .returning();
      
      res.status(201).json(newEvent);
    } catch (error) {
      console.error('Error al crear evento patrocinado:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Obtener eventos de un patrocinador específico
  apiRouter.get('/sponsors/:sponsorId/events', async (req: Request, res: Response) => {
    try {
      const { sponsorId } = req.params;
      const result = await pool.query(`
        SELECT 
          id,
          sponsor_id as "sponsorId",
          event_name as "eventName",
          event_date as "eventDate",
          event_type as "eventType",
          participants_count as "participantsCount",
          budget_allocated as "budgetAllocated",
          description,
          created_at as "createdAt"
        FROM sponsorship_events 
        WHERE sponsor_id = $1
        ORDER BY created_at DESC
      `, [parseInt(sponsorId)]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error al obtener eventos del patrocinador:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // ===== MÉTRICAS DE PATROCINIO =====
  
  // Obtener métricas de un patrocinador
  apiRouter.get('/sponsors/:sponsorId/metrics', async (req: Request, res: Response) => {
    try {
      const { sponsorId } = req.params;
      const result = await pool.query(`
        SELECT 
          id,
          sponsor_id as "sponsorId",
          metric_type as "metricType",
          metric_value as "metricValue",
          measurement_date as "measurementDate",
          notes,
          created_at as "createdAt"
        FROM sponsorship_metrics 
        WHERE sponsor_id = $1
        ORDER BY measurement_date DESC
      `, [parseInt(sponsorId)]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error al obtener métricas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Crear nuevas métricas
  apiRouter.post('/sponsorship-metrics', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const validatedData = insertSponsorshipMetricsSchema.parse(req.body);
      
      const [newMetrics] = await db
        .insert(sponsorshipMetrics)
        .values(validatedData)
        .returning();
      
      res.status(201).json(newMetrics);
    } catch (error) {
      console.error('Error al crear métricas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // ===== ACTIVOS PROMOCIONALES =====
  
  // Obtener activos de un patrocinador
  apiRouter.get('/sponsors/:sponsorId/assets', async (req: Request, res: Response) => {
    try {
      const { sponsorId } = req.params;
      const result = await pool.query(`
        SELECT 
          id,
          sponsor_id as "sponsorId",
          asset_type as "assetType",
          asset_name as "assetName",
          file_url as "fileUrl",
          file_size as "fileSize",
          description,
          created_at as "createdAt"
        FROM sponsorship_assets 
        WHERE sponsor_id = $1
        ORDER BY created_at DESC
      `, [parseInt(sponsorId)]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error al obtener activos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Crear nuevo activo
  apiRouter.post('/sponsor-assets', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const validatedData = insertSponsorAssetSchema.parse(req.body);
      
      const [newAsset] = await db
        .insert(sponsorAssets)
        .values(validatedData)
        .returning();
      
      res.status(201).json(newAsset);
    } catch (error) {
      console.error('Error al crear activo:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Aprobar activo
  apiRouter.patch('/sponsor-assets/:id/approve', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { approvalStatus, approvedBy } = req.body;
      
      const [updatedAsset] = await db
        .update(sponsorAssets)
        .set({ 
          approvalStatus,
          approvedBy,
          approvedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(sponsorAssets.id, parseInt(id)))
        .returning();
      
      res.json(updatedAsset);
    } catch (error) {
      console.error('Error al aprobar activo:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // ===== EVALUACIONES DE PATROCINIO =====
  
  // Obtener evaluaciones de un patrocinador
  apiRouter.get('/sponsors/:sponsorId/evaluations', async (req: Request, res: Response) => {
    try {
      const { sponsorId } = req.params;
      const result = await pool.query(`
        SELECT 
          id,
          sponsor_id as "sponsorId",
          evaluator_name as "evaluatorName",
          evaluator_email as "evaluatorEmail",
          rating,
          feedback,
          evaluation_date as "evaluationDate",
          created_at as "createdAt"
        FROM sponsorship_evaluations 
        WHERE sponsor_id = $1
        ORDER BY evaluation_date DESC
      `, [parseInt(sponsorId)]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error al obtener evaluaciones:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Crear nueva evaluación
  apiRouter.post('/sponsorship-evaluations', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const validatedData = insertSponsorshipEvaluationSchema.parse(req.body);
      
      const [newEvaluation] = await db
        .insert(sponsorshipEvaluations)
        .values(validatedData)
        .returning();
      
      res.status(201).json(newEvaluation);
    } catch (error) {
      console.error('Error al crear evaluación:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // ===== RENOVACIONES =====
  
  // Obtener renovaciones pendientes
  apiRouter.get('/sponsorship-renewals', async (req: Request, res: Response) => {
    try {
      const renewals = await db
        .select()
        .from(sponsorshipRenewals)
        .orderBy(desc(sponsorshipRenewals.createdAt));
      
      res.json(renewals);
    } catch (error) {
      console.error('Error al obtener renovaciones:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Crear proceso de renovación
  apiRouter.post('/sponsorship-renewals', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const validatedData = insertSponsorshipRenewalSchema.parse(req.body);
      
      const [newRenewal] = await db
        .insert(sponsorshipRenewals)
        .values(validatedData)
        .returning();
      
      res.status(201).json(newRenewal);
    } catch (error) {
      console.error('Error al crear renovación:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // ===== DASHBOARD Y REPORTES =====
  
  // Dashboard general de patrocinios
  apiRouter.get('/sponsorship-dashboard', async (req: Request, res: Response) => {
    try {
      // Obtener estadísticas generales
      const [
        totalSponsors,
        activeContracts,
        totalRevenue,
        avgSatisfaction
      ] = await Promise.all([
        db.select().from(sponsors).then(result => result.length),
        db.select().from(sponsorshipContracts).where(eq(sponsorshipContracts.status, 'active')).then(result => result.length),
        db.select().from(sponsorshipContracts).then(result => 
          result.reduce((sum, contract) => sum + parseFloat(contract.totalValue || '0'), 0)
        ),
        db.select().from(sponsorshipEvaluations).then(result => {
          if (result.length === 0) return 0;
          const totalSatisfaction = result.reduce((sum, evaluation) => sum + (evaluation.overallSatisfaction || 0), 0);
          return totalSatisfaction / result.length;
        })
      ]);
      
      res.json({
        totalSponsors,
        activeContracts,
        totalRevenue,
        avgSatisfaction: Math.round(avgSatisfaction * 10) / 10
      });
    } catch (error) {
      console.error('Error al obtener dashboard:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Reporte de ROI por patrocinador
  apiRouter.get('/sponsors/:sponsorId/roi-report', async (req: Request, res: Response) => {
    try {
      const { sponsorId } = req.params;
      
      // Obtener datos del patrocinador, métricas y evaluaciones
      const [sponsor] = await db
        .select()
        .from(sponsors)
        .where(eq(sponsors.id, parseInt(sponsorId)))
        .limit(1);
      
      if (!sponsor) {
        return res.status(404).json({ error: 'Patrocinador no encontrado' });
      }
      
      const [metrics, evaluations, events] = await Promise.all([
        db.select().from(sponsorshipMetrics).where(eq(sponsorshipMetrics.sponsorId, parseInt(sponsorId))),
        db.select().from(sponsorshipEvaluations).where(eq(sponsorshipEvaluations.sponsorId, parseInt(sponsorId))),
        db.select().from(sponsorEvents).where(eq(sponsorEvents.sponsorId, parseInt(sponsorId)))
      ]);
      
      // Calcular ROI
      const totalInvestment = parseFloat(sponsor.contractValue || '0');
      const totalLeads = metrics.reduce((sum, m) => sum + (m.leadsGenerated || 0), 0);
      const totalConversions = metrics.reduce((sum, m) => sum + (m.conversions || 0), 0);
      const totalImpressions = metrics.reduce((sum, m) => sum + (m.impressions || 0), 0);
      const avgSatisfaction = evaluations.length > 0 
        ? evaluations.reduce((sum, evaluation) => sum + (evaluation.overallSatisfaction || 0), 0) / evaluations.length 
        : 0;
      
      res.json({
        sponsor,
        metrics: {
          totalInvestment,
          totalLeads,
          totalConversions,
          totalImpressions,
          avgSatisfaction,
          eventsCount: events.length,
          conversionRate: totalLeads > 0 ? (totalConversions / totalLeads * 100).toFixed(2) : 0,
          costPerLead: totalLeads > 0 ? (totalInvestment / totalLeads).toFixed(2) : 0,
          costPerConversion: totalConversions > 0 ? (totalInvestment / totalConversions).toFixed(2) : 0
        },
        detailedMetrics: metrics,
        evaluations
      });
    } catch (error) {
      console.error('Error al generar reporte ROI:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  console.log('✅ Rutas de patrocinios registradas correctamente');
}