import { Request, Response } from 'express';
import { pool } from './db';

/**
 * Obtiene el inventario de árboles usando consultas SQL directas
 * para evitar problemas con la estructura de la tabla
 */
export async function getTreeInventory(req: Request, res: Response) {
  try {
    // Parámetros de paginación y filtrado
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const searchTerm = req.query.search as string || '';
    const speciesId = req.query.speciesId as string || '';
    const parkId = req.query.parkId as string || '';
    const healthStatus = req.query.healthStatus as string || '';

    // Usar SQL nativo para evitar problemas con el ORM
    const query = `
      SELECT 
        t.id, t.species_id, t.park_id, t.latitude, t.longitude,
        t.planting_date, t.height, t.trunk_diameter, t.health_status,
        t.condition, t.location_description, t.notes, t.created_at, t.updated_at,
        t.last_maintenance_date,
        s.common_name, s.scientific_name, s.family, s.image_url as species_image,
        p.name as park_name, p.address as park_address
      FROM 
        trees t
        LEFT JOIN tree_species s ON t.species_id = s.id
        LEFT JOIN parks p ON t.park_id = p.id
      WHERE
        (t.location_description ILIKE $1 OR t.notes ILIKE $1 OR CAST(t.id AS TEXT) ILIKE $1)
        AND ($2 = '' OR $2 = 'all' OR t.species_id = CAST($2 AS INTEGER))
        AND ($3 = '' OR $3 = 'all' OR t.park_id = CAST($3 AS INTEGER))
        AND ($4 = '' OR $4 = 'all' OR t.health_status = $4)
      ORDER BY 
        t.id DESC
      LIMIT $5 OFFSET $6
    `;

    // Consulta para contar el total de registros con los mismos filtros
    const countQuery = `
      SELECT COUNT(*) as total
      FROM 
        trees t
      WHERE
        (t.location_description ILIKE $1 OR t.notes ILIKE $1 OR CAST(t.id AS TEXT) ILIKE $1)
        AND ($2 = '' OR $2 = 'all' OR t.species_id = CAST($2 AS INTEGER))
        AND ($3 = '' OR $3 = 'all' OR t.park_id = CAST($3 AS INTEGER))
        AND ($4 = '' OR $4 = 'all' OR t.health_status = $4)
    `;

    // Preparar los parámetros
    const searchValue = searchTerm ? `%${searchTerm}%` : '%%';
    const params = [
      searchValue,
      speciesId !== 'all' ? speciesId : '',
      parkId !== 'all' ? parkId : '',
      healthStatus !== 'all' ? healthStatus : '',
      limit,
      offset
    ];

    // Ejecutar las consultas
    const result = await pool.query(query, params);
    const countResult = await pool.query(countQuery, params.slice(0, 4));

    // Formatear los resultados para mantener la estructura esperada por el frontend
    const formattedTrees = result.rows.map(tree => ({
      id: tree.id,
      // Crear un código generado a partir del ID
      code: `ARB-${tree.id.toString().padStart(5, '0')}`,
      speciesId: tree.species_id,
      parkId: tree.park_id,
      latitude: tree.latitude,
      longitude: tree.longitude,
      plantingDate: tree.planting_date,
      height: tree.height,
      diameter: tree.trunk_diameter,
      healthStatus: tree.health_status,
      condition: tree.condition,
      locationDescription: tree.location_description,
      lastMaintenanceDate: tree.last_maintenance_date,
      notes: tree.notes,
      createdAt: tree.created_at,
      updatedAt: tree.updated_at,
      // Datos de las relaciones
      species: {
        id: tree.species_id,
        commonName: tree.common_name,
        scientificName: tree.scientific_name,
        family: tree.family,
        imageUrl: tree.species_image,
      },
      park: {
        id: tree.park_id,
        name: tree.park_name,
        address: tree.park_address
      }
    }));

    // Obtener el total de registros
    const total = parseInt(countResult.rows[0]?.total || '0');

    // Enviar la respuesta
    res.json({
      data: formattedTrees,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener el inventario de árboles:', error);
    res.status(500).json({ message: 'Error al obtener el inventario de árboles' });
  }
}