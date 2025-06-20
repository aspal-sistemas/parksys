import { Router } from 'express';
import { execute_sql_tool } from './execute-sql';

export function createSimpleParksRouter() {
  const router = Router();

  router.get('/parks', async (req, res) => {
    try {
      // Simple query to get parks with basic amenities
      const parksQuery = `
        SELECT 
          p.id, 
          p.name, 
          p.description, 
          p.address, 
          p.postal_code as "postalCode",
          p.park_type as "parkType", 
          p.latitude, 
          p.longitude, 
          p.area,
          p.created_at as "createdAt", 
          p.is_deleted as "isDeleted"
        FROM parks p
        WHERE p.is_deleted = FALSE
        ORDER BY p.name
      `;

      const result = await pool.query(parksQuery);
      
      // Add amenities and default image for each park
      const parksWithData = result.rows.map(park => ({
        ...park,
        amenities: [
          { id: 1, name: 'Área de juegos', icon: 'playground' },
          { id: 2, name: 'Senderos', icon: 'hiking' },
          { id: 3, name: 'Baños', icon: 'toilet' },
          { id: 4, name: 'Estacionamiento', icon: 'parking' }
        ],
        imageUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGFya3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60'
      }));

      res.json(parksWithData);
    } catch (error) {
      console.error('Error in simple parks endpoint:', error);
      res.status(500).json({ message: 'Error fetching parks' });
    }
  });

  return router;
}