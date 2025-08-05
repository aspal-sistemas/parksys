import { Request, Response } from 'express';
import { Router } from 'express';

/**
 * Registra rutas adicionales para arreglar los problemas con las evaluaciones
 */
export function registerFixRoutes(apiRouter: Router) {
  // Importamos los endpoints simplificados
  const { 
    getExampleInstructorEvaluations, 
    createExampleInstructorEvaluations 
  } = require('./simple-data-endpoint');
  
  // Ruta simplificada para obtener evaluaciones
  apiRouter.get("/instructors-evaluations-demo", async (req: Request, res: Response) => {
    return getExampleInstructorEvaluations(req, res);
  });
  
  // Ruta simplificada para crear evaluaciones de ejemplo
  apiRouter.post("/admin/seed/instructor-evaluations-demo", async (req: Request, res: Response) => {
    return createExampleInstructorEvaluations(req, res);
  });
}