import express from 'express';
import { db } from './db';
import { 
  universalEvaluations, 
  evaluationCriteria, 
  evaluationResponses,
  evaluationCriteriaAssignments,
  parkEvaluations,
  parks,
  instructorEvaluations,
  instructors,
  volunteerEvaluations,
  volunteers,
  activities,
  concessionaireProfiles
} from '../shared/schema';
import { eq, desc, sql, count, and } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

const router = express.Router();

// Estadísticas generales del sistema de evaluaciones
router.get('/api/evaluations/stats', async (req, res) => {
  try {
    // Obtener estadísticas de parques
    const parkStats = await db
      .select({
        total: count(),
        avgRating: sql`COALESCE(AVG(CAST(${parkEvaluations.overallRating} AS DECIMAL)), 0)`
      })
      .from(parkEvaluations);

    // Obtener estadísticas de instructores
    const instructorStats = await db
      .select({
        total: count(),
        avgRating: sql`COALESCE(AVG(CAST(${instructorEvaluations.overallRating} AS DECIMAL)), 0)`
      })
      .from(instructorEvaluations);

    // Obtener estadísticas de voluntarios
    const volunteerStats = await db
      .select({
        total: count(),
        avgRating: sql`COALESCE(AVG(CAST(${volunteerEvaluations.overallRating} AS DECIMAL)), 0)`
      })
      .from(volunteerEvaluations);

    // Obtener estadísticas de evaluaciones universales (actividades, concesionarios, eventos)
    const universalStats = await db
      .select({
        entityType: universalEvaluations.entityType,
        total: count(),
        avgRating: sql`COALESCE(AVG(CAST(${universalEvaluations.overallRating} AS DECIMAL)), 0)`
      })
      .from(universalEvaluations)
      .groupBy(universalEvaluations.entityType);

    // Compilar estadísticas
    const stats = {
      parks: {
        total: parkStats[0]?.total || 0,
        averageRating: parseFloat(parkStats[0]?.avgRating?.toString() || '0')
      },
      instructors: {
        total: instructorStats[0]?.total || 0,
        averageRating: parseFloat(instructorStats[0]?.avgRating?.toString() || '0')
      },
      volunteers: {
        total: volunteerStats[0]?.total || 0,
        averageRating: parseFloat(volunteerStats[0]?.avgRating?.toString() || '0')
      },
      activities: {
        total: 0,
        averageRating: 0
      },
      concessionaires: {
        total: 0,
        averageRating: 0
      },
      events: {
        total: 0,
        averageRating: 0
      }
    };

    // Procesar estadísticas universales
    universalStats.forEach((stat: any) => {
      const entityType = stat.entityType as string;
      if (entityType === 'activity') {
        stats.activities.total = stat.total;
        stats.activities.averageRating = parseFloat(stat.avgRating?.toString() || '0');
      } else if (entityType === 'concessionaire') {
        stats.concessionaires.total = stat.total;
        stats.concessionaires.averageRating = parseFloat(stat.avgRating?.toString() || '0');
      } else if (entityType === 'event') {
        stats.events.total = stat.total;
        stats.events.averageRating = parseFloat(stat.avgRating?.toString() || '0');
      }
    });

    const totals = {
      totalEvaluations: stats.parks.total + stats.instructors.total + stats.volunteers.total + 
                       stats.activities.total + stats.concessionaires.total + stats.events.total,
      averageOverallRating: ((stats.parks.averageRating + stats.instructors.averageRating + 
                             stats.volunteers.averageRating + stats.activities.averageRating + 
                             stats.concessionaires.averageRating + stats.events.averageRating) / 6).toFixed(1)
    };

    res.json({
      ...stats,
      ...totals,
      categories: [
        { name: 'Parques', value: 'parks', count: stats.parks.total },
        { name: 'Instructores', value: 'instructors', count: stats.instructors.total },
        { name: 'Voluntarios', value: 'volunteers', count: stats.volunteers.total },
        { name: 'Actividades', value: 'activities', count: stats.activities.total },
        { name: 'Concesionarios', value: 'concessionaires', count: stats.concessionaires.total },
        { name: 'Eventos', value: 'events', count: stats.events.total }
      ]
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de evaluaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener evaluaciones de parques
router.get('/api/evaluations/parks', async (req, res) => {
  try {
    const evaluations = await db
      .select({
        id: parkEvaluations.id,
        parkName: parks.name,
        evaluatorName: parkEvaluations.evaluatorName,
        overallRating: parkEvaluations.overallRating,
        status: parkEvaluations.status,
        createdAt: parkEvaluations.createdAt
      })
      .from(parkEvaluations)
      .leftJoin(parks, eq(parkEvaluations.parkId, parks.id))
      .orderBy(desc(parkEvaluations.createdAt));

    res.json(evaluations);
  } catch (error) {
    console.error('Error al obtener evaluaciones de parques:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener evaluaciones de instructores
router.get('/api/evaluations/instructors', async (req, res) => {
  try {
    const evaluations = await db
      .select({
        id: instructorEvaluations.id,
        instructorName: sql`${instructors.firstName} || ' ' || ${instructors.lastName}`,
        evaluatorName: instructorEvaluations.evaluatorName,
        overallRating: instructorEvaluations.overallRating,
        status: instructorEvaluations.status,
        createdAt: instructorEvaluations.createdAt
      })
      .from(instructorEvaluations)
      .leftJoin(instructors, eq(instructorEvaluations.instructorId, instructors.id))
      .orderBy(desc(instructorEvaluations.createdAt));

    res.json(evaluations);
  } catch (error) {
    console.error('Error al obtener evaluaciones de instructores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener evaluaciones de voluntarios
router.get('/api/evaluations/volunteers', async (req, res) => {
  try {
    const evaluations = await db
      .select({
        id: universalEvaluations.id,
        volunteerName: sql`'Voluntario ID: ' || ${universalEvaluations.entityId}`,
        evaluatorName: universalEvaluations.evaluatorName,
        overallRating: universalEvaluations.overallRating,
        status: universalEvaluations.status,
        createdAt: universalEvaluations.createdAt
      })
      .from(universalEvaluations)
      .where(eq(universalEvaluations.entityType, 'volunteer'))
      .orderBy(desc(universalEvaluations.createdAt));

    res.json(evaluations);
  } catch (error) {
    console.error('Error al obtener evaluaciones de voluntarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener evaluaciones de actividades
router.get('/api/evaluations/activities', async (req, res) => {
  try {
    const evaluations = await db
      .select({
        id: universalEvaluations.id,
        activityName: activities.title,
        evaluatorName: universalEvaluations.evaluatorName,
        overallRating: universalEvaluations.overallRating,
        status: universalEvaluations.status,
        createdAt: universalEvaluations.createdAt
      })
      .from(universalEvaluations)
      .leftJoin(activities, eq(universalEvaluations.entityId, activities.id))
      .where(eq(universalEvaluations.entityType, 'activity'))
      .orderBy(desc(universalEvaluations.createdAt));

    res.json(evaluations);
  } catch (error) {
    console.error('Error al obtener evaluaciones de actividades:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener evaluaciones de concesionarios
router.get('/api/evaluations/concessionaires', async (req, res) => {
  try {
    const evaluations = await db
      .select({
        id: universalEvaluations.id,
        concessionaireName: concessionaireProfiles.businessName,
        evaluatorName: universalEvaluations.evaluatorName,
        overallRating: universalEvaluations.overallRating,
        status: universalEvaluations.status,
        createdAt: universalEvaluations.createdAt
      })
      .from(universalEvaluations)
      .leftJoin(concessionaireProfiles, eq(universalEvaluations.entityId, concessionaireProfiles.id))
      .where(eq(universalEvaluations.entityType, 'concessionaire'))
      .orderBy(desc(universalEvaluations.createdAt));

    res.json(evaluations);
  } catch (error) {
    console.error('Error al obtener evaluaciones de concesionarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener evaluaciones de eventos
router.get('/api/evaluations/events', async (req, res) => {
  try {
    const evaluations = await db
      .select({
        id: universalEvaluations.id,
        eventName: sql`'Evento ID: ' || ${universalEvaluations.entityId}`,
        evaluatorName: universalEvaluations.evaluatorName,
        overallRating: universalEvaluations.overallRating,
        status: universalEvaluations.status,
        createdAt: universalEvaluations.createdAt
      })
      .from(universalEvaluations)
      .where(eq(universalEvaluations.entityType, 'event'))
      .orderBy(desc(universalEvaluations.createdAt));

    res.json(evaluations);
  } catch (error) {
    console.error('Error al obtener evaluaciones de eventos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener criterios de evaluación
router.get('/api/evaluations/criteria', async (req, res) => {
  try {
    const criteria = await db
      .select()
      .from(evaluationCriteria)
      .where(eq(evaluationCriteria.isActive, true))
      .orderBy(evaluationCriteria.sortOrder, evaluationCriteria.name);

    res.json(criteria);
  } catch (error) {
    console.error('Error al obtener criterios de evaluación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener criterios por tipo de entidad
router.get('/api/evaluations/criteria/:entityType', async (req, res) => {
  try {
    const { entityType } = req.params;
    
    const criteria = await db
      .select({
        id: evaluationCriteria.id,
        name: evaluationCriteria.name,
        label: evaluationCriteria.label,
        description: evaluationCriteria.description,
        fieldType: evaluationCriteria.fieldType,
        minValue: evaluationCriteria.minValue,
        maxValue: evaluationCriteria.maxValue,
        isRequired: evaluationCriteriaAssignments.isRequired,
        sortOrder: evaluationCriteriaAssignments.sortOrder
      })
      .from(evaluationCriteria)
      .innerJoin(evaluationCriteriaAssignments, eq(evaluationCriteria.id, evaluationCriteriaAssignments.criteriaId))
      .where(
        and(
          eq(evaluationCriteriaAssignments.entityType, entityType),
          eq(evaluationCriteria.isActive, true),
          eq(evaluationCriteriaAssignments.isActive, true)
        )
      )
      .orderBy(evaluationCriteriaAssignments.sortOrder, evaluationCriteria.name);

    res.json(criteria);
  } catch (error) {
    console.error('Error al obtener criterios por tipo de entidad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo criterio de evaluación
router.post('/api/evaluations/criteria', async (req, res) => {
  try {
    console.log('📊 [EVALUACIONES] Creando nuevo criterio de evaluación:', req.body);
    
    const { name, label, description, fieldType, minValue, maxValue, isRequired, isActive, sortOrder, icon, category } = req.body;
    
    // Validar datos requeridos
    if (!name || !label || !fieldType) {
      return res.status(400).json({ error: 'Nombre, etiqueta y tipo de campo son requeridos' });
    }
    
    const [newCriteria] = await db
      .insert(evaluationCriteria)
      .values({
        name,
        label,
        description,
        fieldType,
        minValue: minValue || 1,
        maxValue: maxValue || 5,
        isRequired: isRequired !== undefined ? isRequired : true,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0,
        icon: icon || 'Star',
        category: category || 'experiencia'
      })
      .returning();
    
    console.log('✅ [EVALUACIONES] Criterio creado:', newCriteria);
    res.status(201).json(newCriteria);
  } catch (error) {
    console.error('❌ Error creando criterio de evaluación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar criterio de evaluación
router.put('/api/evaluations/criteria/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`📊 [EVALUACIONES] Actualizando criterio ${id}:`, req.body);
    
    const { name, label, description, fieldType, minValue, maxValue, isRequired, isActive, sortOrder, icon, category } = req.body;
    
    const [updatedCriteria] = await db
      .update(evaluationCriteria)
      .set({
        name,
        label,
        description,
        fieldType,
        minValue,
        maxValue,
        isRequired,
        isActive,
        sortOrder,
        icon,
        category,
        updatedAt: new Date()
      })
      .where(eq(evaluationCriteria.id, id))
      .returning();
    
    if (!updatedCriteria) {
      return res.status(404).json({ error: 'Criterio no encontrado' });
    }
    
    console.log('✅ [EVALUACIONES] Criterio actualizado:', updatedCriteria);
    res.json(updatedCriteria);
  } catch (error) {
    console.error('❌ Error actualizando criterio de evaluación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar criterio de evaluación
router.delete('/api/evaluations/criteria/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`📊 [EVALUACIONES] Eliminando criterio ${id}`);
    
    // Verificar si el criterio está siendo usado en asignaciones
    const assignments = await db
      .select()
      .from(evaluationCriteriaAssignments)
      .where(eq(evaluationCriteriaAssignments.criteriaId, id));
    
    if (assignments.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el criterio porque está siendo usado en formularios de evaluación' 
      });
    }
    
    const [deletedCriteria] = await db
      .delete(evaluationCriteria)
      .where(eq(evaluationCriteria.id, id))
      .returning();
    
    if (!deletedCriteria) {
      return res.status(404).json({ error: 'Criterio no encontrado' });
    }
    
    console.log('✅ [EVALUACIONES] Criterio eliminado:', deletedCriteria);
    res.json({ message: 'Criterio eliminado exitosamente' });
  } catch (error) {
    console.error('❌ Error eliminando criterio de evaluación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Asignar criterios a un tipo de entidad (construir formulario)
router.post('/api/evaluations/criteria/assign/:entityType', async (req, res) => {
  try {
    const entityType = req.params.entityType;
    const { criteria } = req.body;
    
    console.log(`📊 [EVALUACIONES] Asignando criterios para ${entityType}:`, criteria);
    
    // Eliminar asignaciones existentes para este tipo de entidad
    await db
      .delete(evaluationCriteriaAssignments)
      .where(eq(evaluationCriteriaAssignments.entityType, entityType));
    
    // Crear nuevas asignaciones
    if (criteria && criteria.length > 0) {
      const assignments = criteria.map((c: any) => ({
        criteriaId: c.criteriaId,
        entityType,
        isRequired: c.isRequired,
        isActive: true,
        sortOrder: c.sortOrder
      }));
      
      await db
        .insert(evaluationCriteriaAssignments)
        .values(assignments);
    }
    
    console.log(`✅ [EVALUACIONES] Criterios asignados exitosamente para ${entityType}`);
    res.json({ message: 'Formulario configurado exitosamente', entityType, criteriaCount: criteria?.length || 0 });
  } catch (error) {
    console.error('❌ Error asignando criterios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;