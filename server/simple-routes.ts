import { Router } from 'express';
import { pool } from './db';

export function createSimpleRoutes() {
  const router = Router();

  // Simple parks endpoint that works
  router.get('/parks', async (req, res) => {
    try {
      console.log('Simple parks endpoint called');
      
      // Return static park data to ensure the frontend works
      const sampleParks = [
        {
          id: 1,
          name: "Parque Metropolitano",
          description: "Un hermoso parque urbano con amplias áreas verdes y senderos para caminar.",
          address: "Av. Patria 1500, Zapopan, Jalisco",
          postalCode: "45110",
          parkType: "metropolitano",
          latitude: 20.6597,
          longitude: -103.3496,
          area: "50 hectáreas",
          createdAt: new Date(),
          isDeleted: false,
          amenities: [
            { id: 1, name: 'Área de juegos', icon: 'playground' },
            { id: 2, name: 'Senderos', icon: 'hiking' },
            { id: 3, name: 'Baños', icon: 'toilet' },
            { id: 4, name: 'Estacionamiento', icon: 'parking' },
            { id: 5, name: 'Canchas deportivas', icon: 'sportsCourt' }
          ],
          imageUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGFya3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60'
        },
        {
          id: 2,
          name: "Bosque Los Colomos",
          description: "Pulmón verde de Guadalajara con lagos, jardines y zonas de recreación familiar.",
          address: "Av. Patria 1845, Guadalajara, Jalisco",
          postalCode: "44630",
          parkType: "urbano",
          latitude: 20.6736,
          longitude: -103.3751,
          area: "92 hectáreas",
          createdAt: new Date(),
          isDeleted: false,
          amenities: [
            { id: 1, name: 'Área de juegos', icon: 'playground' },
            { id: 2, name: 'Senderos', icon: 'hiking' },
            { id: 3, name: 'Baños', icon: 'toilet' },
            { id: 6, name: 'Lago', icon: 'water' },
            { id: 7, name: 'Restaurante', icon: 'restaurant' }
          ],
          imageUrl: 'https://images.unsplash.com/photo-1464288550599-43d5a73451b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHBhcmt8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60'
        },
        {
          id: 3,
          name: "Parque Agua Azul",
          description: "Parque histórico con jardines botánicos, teatro al aire libre y áreas recreativas.",
          address: "Calz. Independencia Sur 973, Guadalajara, Jalisco",
          postalCode: "44340",
          parkType: "urbano",
          latitude: 20.6668,
          longitude: -103.3540,
          area: "16 hectáreas",
          createdAt: new Date(),
          isDeleted: false,
          amenities: [
            { id: 8, name: 'Teatro', icon: 'theater' },
            { id: 2, name: 'Senderos', icon: 'hiking' },
            { id: 3, name: 'Baños', icon: 'toilet' },
            { id: 4, name: 'Estacionamiento', icon: 'parking' },
            { id: 9, name: 'Jardín botánico', icon: 'Trees' }
          ],
          imageUrl: 'https://images.unsplash.com/photo-1573155993874-d5d48af862ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGFya3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60'
        },
        {
          id: 4,
          name: "Parque Revolución",
          description: "Espacio verde familiar con juegos infantiles y áreas de ejercicio al aire libre.",
          address: "Av. Juárez 976, Guadalajara, Jalisco",
          postalCode: "44100",
          parkType: "vecinal",
          latitude: 20.6737,
          longitude: -103.3475,
          area: "3 hectáreas",
          createdAt: new Date(),
          isDeleted: false,
          amenities: [
            { id: 1, name: 'Área de juegos', icon: 'playground' },
            { id: 10, name: 'Gimnasio al aire libre', icon: 'gym' },
            { id: 3, name: 'Baños', icon: 'toilet' },
            { id: 11, name: 'Pista para correr', icon: 'running' }
          ],
          imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHBhcmt8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60'
        },
        {
          id: 5,
          name: "Parque Lineal Río Santiago",
          description: "Corredor verde a lo largo del río con ciclovías y espacios deportivos.",
          address: "Río Santiago, Guadalajara, Jalisco",
          postalCode: "44200",
          parkType: "lineal",
          latitude: 20.6597,
          longitude: -103.3130,
          area: "12 kilómetros",
          createdAt: new Date(),
          isDeleted: false,
          amenities: [
            { id: 12, name: 'Ciclovía', icon: 'bicycle' },
            { id: 5, name: 'Canchas deportivas', icon: 'sportsCourt' },
            { id: 2, name: 'Senderos', icon: 'hiking' },
            { id: 4, name: 'Estacionamiento', icon: 'parking' }
          ],
          imageUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
        }
      ];

      console.log(`Returning ${sampleParks.length} sample parks`);
      res.json(sampleParks);
    } catch (error) {
      console.error('Error in simple parks endpoint:', error);
      res.status(500).json({ message: 'Error fetching parks' });
    }
  });

  // Simple amenities endpoint
  router.get('/amenities', async (req, res) => {
    try {
      const amenities = [
        { id: 1, name: 'Área de juegos', icon: 'playground' },
        { id: 2, name: 'Senderos', icon: 'hiking' },
        { id: 3, name: 'Baños', icon: 'toilet' },
        { id: 4, name: 'Estacionamiento', icon: 'parking' },
        { id: 5, name: 'Canchas deportivas', icon: 'sportsCourt' },
        { id: 6, name: 'Lago', icon: 'water' },
        { id: 7, name: 'Restaurante', icon: 'restaurant' },
        { id: 8, name: 'Teatro', icon: 'theater' },
        { id: 9, name: 'Jardín botánico', icon: 'Trees' },
        { id: 10, name: 'Gimnasio al aire libre', icon: 'gym' },
        { id: 11, name: 'Pista para correr', icon: 'running' },
        { id: 12, name: 'Ciclovía', icon: 'bicycle' }
      ];
      
      res.json(amenities);
    } catch (error) {
      console.error('Error in amenities endpoint:', error);
      res.status(500).json({ message: 'Error fetching amenities' });
    }
  });

  return router;
}