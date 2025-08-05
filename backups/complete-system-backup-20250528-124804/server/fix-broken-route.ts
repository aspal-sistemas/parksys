// Archivo para corregir el problema de rutas
import { Express, Router } from 'express';
import { getVolunteerData } from './volunteerData';

export function registerVolunteerDataRoutes(app: Express, apiRouter: Router) {
  // Ruta específica para obtener datos completos de un voluntario
  apiRouter.get('/volunteer-data/:userId', async (req, res) => {
    await getVolunteerData(req, res);
  });
  
  console.log('✓ Rutas de datos de voluntario registradas correctamente');
}