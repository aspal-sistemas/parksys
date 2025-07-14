import { Request, Response } from 'express';
import { db } from './db';
import { sponsorshipPackages, sponsors, sponsorshipCampaigns, insertSponsorshipPackageSchema, insertSponsorSchema, insertSponsorshipCampaignSchema } from '../shared/schema';
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
  
  console.log('✅ Rutas de patrocinios registradas correctamente');
}