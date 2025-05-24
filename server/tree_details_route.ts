import { Request, Response } from 'express';
import { pool } from './db';

/**
 * Obtiene los detalles de un árbol específico usando SQL directo
 * para adaptarse a la estructura real de la tabla
 */
export async function getTreeDetails(req: Request, res: Response) {
  try {
    const treeId = Number(req.params.id);
    
    // Consulta SQL directa adaptada a la estructura real de la tabla trees
    // basada en la información obtenida de information_schema
    const query = `
      SELECT 
        t.id, t.species_id, t.park_id, t.latitude, t.longitude,
        t.planting_date, t.height, t.trunk_diameter, t.health_status,
        t.condition, t.location_description, t.notes, t.created_at, t.updated_at,
        t.last_maintenance_date, t.created_by,
        s.common_name, s.scientific_name, s.family, s.origin, s.image_url as species_image,
        p.name as park_name, p.address as park_address
      FROM 
        trees t
        LEFT JOIN tree_species s ON t.species_id = s.id
        LEFT JOIN parks p ON t.park_id = p.id
      WHERE 
        t.id = $1
    `;
    
    // Ejecutar la consulta
    const result = await pool.query(query, [treeId]);
    
    // Verificar si se encontró el árbol
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: 'Árbol no encontrado' });
    }
    
    const tree = result.rows[0];
    
    // Formatear el resultado para mantener la estructura esperada por el frontend
    // Generamos un código virtual a partir del ID
    const formattedTree = {
      id: tree.id,
      code: `ARB-${tree.id.toString().padStart(5, '0')}`,
      speciesId: tree.species_id,
      parkId: tree.park_id,
      latitude: tree.latitude,
      longitude: tree.longitude,
      plantingDate: tree.planting_date,
      height: tree.height,
      diameter: tree.trunk_diameter, // Renombramos trunk_diameter a diameter para el frontend
      healthStatus: tree.health_status,
      condition: tree.condition,
      locationDescription: tree.location_description,
      lastMaintenanceDate: tree.last_maintenance_date,
      createdBy: tree.created_by,
      notes: tree.notes,
      createdAt: tree.created_at,
      updatedAt: tree.updated_at,
      // Datos de las relaciones
      species: {
        id: tree.species_id,
        commonName: tree.common_name,
        scientificName: tree.scientific_name,
        family: tree.family,
        origin: tree.origin,
        imageUrl: tree.species_image,
      },
      park: {
        id: tree.park_id,
        name: tree.park_name,
        address: tree.park_address
      }
    };
    
    res.json(formattedTree);
  } catch (error) {
    console.error('Error al obtener detalles del árbol:', error);
    res.status(500).json({ message: 'Error al obtener los detalles del árbol' });
  }
}