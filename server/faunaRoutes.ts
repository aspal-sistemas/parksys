import { Router } from 'express';
import { z } from 'zod';
import { db } from './db';
import { faunaSpecies, insertFaunaSpeciesSchema } from '../shared/schema';
import { eq, like, desc, asc, count } from 'drizzle-orm';

const router = Router();

// Obtener todas las especies de fauna con paginación y filtros
router.get('/species', async (req, res) => {
  try {
    const { 
      page = '1', 
      limit = '9', 
      search = '', 
      category = '',
      conservation_status = '',
      sort_by = 'commonName',
      sort_order = 'asc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Construir filtros dinámicamente
    const filters: any[] = [];
    
    if (search) {
      filters.push(like(faunaSpecies.commonName, `%${search}%`));
    }
    
    if (category && category !== 'all') {
      filters.push(eq(faunaSpecies.category, category as any));
    }
    
    if (conservation_status && conservation_status !== 'all') {
      filters.push(eq(faunaSpecies.conservationStatus, conservation_status as any));
    }

    // Determinar orden
    const orderBy = sort_order === 'desc' 
      ? desc(faunaSpecies[sort_by as keyof typeof faunaSpecies] as any)
      : asc(faunaSpecies[sort_by as keyof typeof faunaSpecies] as any);

    // Obtener datos con filtros
    const speciesQuery = db
      .select()
      .from(faunaSpecies)
      .limit(limitNum)
      .offset(offset)
      .orderBy(orderBy);

    // Aplicar filtros si existen
    const species = filters.length > 0 
      ? await speciesQuery.where(filters.reduce((acc, filter) => acc && filter))
      : await speciesQuery;

    // Obtener total para paginación
    const totalQuery = filters.length > 0 
      ? await db.select({ count: count() }).from(faunaSpecies).where(filters.reduce((acc, filter) => acc && filter))
      : await db.select({ count: count() }).from(faunaSpecies);

    const total = totalQuery[0]?.count || 0;

    res.json({
      success: true,
      data: species,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching fauna species:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener especies de fauna' 
    });
  }
});

// Obtener una especie específica por ID
router.get('/species/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const species = await db
      .select()
      .from(faunaSpecies)
      .where(eq(faunaSpecies.id, id))
      .limit(1);

    if (species.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Especie no encontrada' 
      });
    }

    res.json({
      success: true,
      data: species[0]
    });
  } catch (error) {
    console.error('Error fetching fauna species:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener la especie' 
    });
  }
});

// Crear nueva especie
router.post('/species', async (req, res) => {
  try {
    const validatedData = insertFaunaSpeciesSchema.parse(req.body);
    
    const newSpecies = await db
      .insert(faunaSpecies)
      .values(validatedData)
      .returning();

    res.status(201).json({
      success: true,
      data: newSpecies[0]
    });
  } catch (error) {
    console.error('Error creating fauna species:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Datos inválidos',
        details: error.errors 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Error al crear la especie' 
    });
  }
});

// Actualizar especie
router.put('/species/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertFaunaSpeciesSchema.parse(req.body);
    
    const updatedSpecies = await db
      .update(faunaSpecies)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(faunaSpecies.id, id))
      .returning();

    if (updatedSpecies.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Especie no encontrada' 
      });
    }

    res.json({
      success: true,
      data: updatedSpecies[0]
    });
  } catch (error) {
    console.error('Error updating fauna species:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Datos inválidos',
        details: error.errors 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Error al actualizar la especie' 
    });
  }
});

// Eliminar especie
router.delete('/species/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const deletedSpecies = await db
      .delete(faunaSpecies)
      .where(eq(faunaSpecies.id, id))
      .returning();

    if (deletedSpecies.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Especie no encontrada' 
      });
    }

    res.json({
      success: true,
      message: 'Especie eliminada correctamente'
    });
  } catch (error) {
    console.error('Error deleting fauna species:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al eliminar la especie' 
    });
  }
});

// Obtener estadísticas de fauna
router.get('/stats', async (req, res) => {
  try {
    // Total de especies
    const totalSpecies = await db
      .select({ count: count() })
      .from(faunaSpecies);

    // Especies por categoría
    const speciesByCategory = await db
      .select({ 
        category: faunaSpecies.category, 
        count: count() 
      })
      .from(faunaSpecies)
      .groupBy(faunaSpecies.category);

    // Especies en peligro
    const endangeredSpecies = await db
      .select({ count: count() })
      .from(faunaSpecies)
      .where(eq(faunaSpecies.isEndangered, true));

    // Especies por estado de conservación
    const speciesByConservationStatus = await db
      .select({ 
        status: faunaSpecies.conservationStatus, 
        count: count() 
      })
      .from(faunaSpecies)
      .groupBy(faunaSpecies.conservationStatus);

    res.json({
      success: true,
      data: {
        total: Number(totalSpecies[0]?.count || 0),
        byCategory: speciesByCategory.map(item => ({
          category: item.category,
          count: Number(item.count)
        })),
        endangered: Number(endangeredSpecies[0]?.count || 0),
        byConservationStatus: speciesByConservationStatus.map(item => ({
          status: item.status,
          count: Number(item.count)
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching fauna stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener estadísticas de fauna' 
    });
  }
});

export default router;