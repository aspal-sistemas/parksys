import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Rutas de API simuladas para nuestras nuevas secciones
app.get('/api/trees', (req, res) => {
  // Datos de muestra para árboles
  const sampleTrees = [
    {
      id: 1,
      species_id: 1,
      park_id: 1,
      latitude: "19.4326",
      longitude: "-99.1332",
      height: 15.5,
      trunk_diameter: 45.2,
      health_status: "bueno",
      condition: "saludable",
      location_description: "Área norte del parque",
      notes: "Árbol maduro en excelentes condiciones",
      species: {
        id: 1,
        common_name: "Ahuehuete",
        scientific_name: "Taxodium mucronatum",
        image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Taxodium_mucronatum_Mexico.jpg/320px-Taxodium_mucronatum_Mexico.jpg"
      },
      park: {
        id: 1,
        name: "Parque Chapultepec"
      }
    },
    {
      id: 2,
      species_id: 2,
      park_id: 1,
      latitude: "19.4329",
      longitude: "-99.1336",
      height: 8.2,
      trunk_diameter: 28.5,
      health_status: "regular",
      condition: "podado recientemente",
      location_description: "Cerca de la fuente principal",
      notes: "Requiere seguimiento de poda reciente",
      species: {
        id: 2,
        common_name: "Jacaranda",
        scientific_name: "Jacaranda mimosifolia",
        image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Jacaranda_mimosifolia_2.jpg/320px-Jacaranda_mimosifolia_2.jpg"
      },
      park: {
        id: 1,
        name: "Parque Chapultepec"
      }
    },
    {
      id: 3,
      species_id: 3,
      park_id: 2,
      latitude: "19.3556",
      longitude: "-99.0653",
      height: 12.3,
      trunk_diameter: 35.8,
      health_status: "excelente",
      condition: "maduro",
      location_description: "Entrada este",
      notes: "Árbol insignia del parque",
      species: {
        id: 3,
        common_name: "Fresno",
        scientific_name: "Fraxinus uhdei",
        image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Fraxinus_uhdei.jpg/320px-Fraxinus_uhdei.jpg"
      },
      park: {
        id: 2,
        name: "Parque Viveros de Coyoacán"
      }
    },
    {
      id: 4,
      species_id: 4,
      park_id: 3,
      latitude: "19.4012",
      longitude: "-99.1748",
      height: 6.8,
      trunk_diameter: 18.2,
      health_status: "crítico",
      condition: "enfermo",
      location_description: "Zona sur",
      notes: "Presenta signos de plaga, requiere tratamiento urgente",
      species: {
        id: 4,
        common_name: "Colorín",
        scientific_name: "Erythrina americana",
        image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Erythrina_americana.jpg/320px-Erythrina_americana.jpg"
      },
      park: {
        id: 3,
        name: "Parque México"
      }
    },
    {
      id: 5,
      species_id: 5,
      park_id: 3,
      latitude: "19.4015",
      longitude: "-99.1752",
      height: 20.1,
      trunk_diameter: 52.6,
      health_status: "bueno",
      condition: "maduro",
      location_description: "Centro del parque",
      notes: "Árbol centenario, patrimonio natural",
      species: {
        id: 5,
        common_name: "Encino",
        scientific_name: "Quercus rugosa",
        image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Quercus_rugosa_3.jpg/320px-Quercus_rugosa_3.jpg"
      },
      park: {
        id: 3,
        name: "Parque México"
      }
    }
  ];

  res.json({ data: sampleTrees });
});

app.get('/api/parks', (req, res) => {
  // Datos de muestra para parques
  const sampleParks = [
    {
      id: 1,
      name: "Parque Chapultepec",
      municipalityId: 1,
      parkType: "urbano",
      address: "Paseo de la Reforma, Miguel Hidalgo",
      latitude: "19.4193",
      longitude: "-99.1908"
    },
    {
      id: 2,
      name: "Parque Viveros de Coyoacán",
      municipalityId: 2,
      parkType: "vivero",
      address: "Av. Universidad, Coyoacán",
      latitude: "19.3458",
      longitude: "-99.1756"
    },
    {
      id: 3,
      name: "Parque México",
      municipalityId: 3,
      parkType: "urbano",
      address: "Condesa, Cuauhtémoc",
      latitude: "19.4118",
      longitude: "-99.1722"
    }
  ];

  res.json({ data: sampleParks });
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../dist')));

// Manejar rutas SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(port, () => {
  console.log(`Servidor simple ejecutándose en http://localhost:${port}`);
});