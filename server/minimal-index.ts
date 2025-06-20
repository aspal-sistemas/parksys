import express, { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple parks endpoint
app.get("/api/parks", async (req: Request, res: Response) => {
  try {
    console.log('Parks endpoint called with query:', req.query);
    
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

    // Apply filters if provided
    let filteredParks = sampleParks;

    if (req.query.parkType) {
      filteredParks = filteredParks.filter(park => park.parkType === req.query.parkType);
    }

    if (req.query.search) {
      const searchTerm = String(req.query.search).toLowerCase();
      filteredParks = filteredParks.filter(park => 
        park.name.toLowerCase().includes(searchTerm) || 
        park.description.toLowerCase().includes(searchTerm)
      );
    }

    if (req.query.postalCode) {
      filteredParks = filteredParks.filter(park => park.postalCode === req.query.postalCode);
    }

    console.log(`Returning ${filteredParks.length} parks`);
    res.json(filteredParks);
  } catch (error) {
    console.error('Parks endpoint error:', error);
    res.status(500).json({ message: 'Error fetching parks' });
  }
});

// Simple amenities endpoint
app.get("/api/amenities", async (req: Request, res: Response) => {
  try {
    const amenities = [
      { id: 1, name: 'Área de juegos', icon: 'playground', createdAt: new Date() },
      { id: 2, name: 'Senderos', icon: 'hiking', createdAt: new Date() },
      { id: 3, name: 'Baños', icon: 'toilet', createdAt: new Date() },
      { id: 4, name: 'Estacionamiento', icon: 'parking', createdAt: new Date() },
      { id: 5, name: 'Canchas deportivas', icon: 'sportsCourt', createdAt: new Date() },
      { id: 6, name: 'Lago', icon: 'water', createdAt: new Date() },
      { id: 7, name: 'Restaurante', icon: 'restaurant', createdAt: new Date() },
      { id: 8, name: 'Teatro', icon: 'theater', createdAt: new Date() },
      { id: 9, name: 'Jardín botánico', icon: 'Trees', createdAt: new Date() },
      { id: 10, name: 'Gimnasio al aire libre', icon: 'gym', createdAt: new Date() },
      { id: 11, name: 'Pista para correr', icon: 'running', createdAt: new Date() },
      { id: 12, name: 'Ciclovía', icon: 'bicycle', createdAt: new Date() }
    ];
    
    res.json(amenities);
  } catch (error) {
    console.error('Amenities endpoint error:', error);
    res.status(500).json({ message: 'Error fetching amenities' });
  }
});

// Initialize Vite and serve static files
const server = await setupVite(app, path.resolve(__dirname, "..", "client"));

// Serve static files for assets
app.use("/uploads", serveStatic(path.resolve(__dirname, "..", "uploads")));
app.use("/public", serveStatic(path.resolve(__dirname, "..", "public")));

// Error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const port = 5000;
server.listen(port, "0.0.0.0", () => {
  log(`Server running on port ${port}`);
});