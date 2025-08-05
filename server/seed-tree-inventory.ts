import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Script para agregar 50 árboles de inventario distribuidos en diferentes parques
 */
export async function seedTreeInventory() {
  console.log('Iniciando la carga de árboles en el inventario...');

  try {
    // Obtener los parques disponibles
    const parks = await db.query.parks.findMany();
    if (parks.length === 0) {
      console.error('No hay parques en la base de datos para asignar árboles.');
      return;
    }

    // Obtener las especies disponibles
    const species = await db.query.treeSpecies.findMany();
    if (species.length === 0) {
      console.error('No hay especies de árboles en el catálogo.');
      return;
    }

    console.log(`Se encontraron ${parks.length} parques y ${species.length} especies de árboles.`);

    // Estados de salud para asignar aleatoriamente
    const healthStatuses = ['Bueno', 'Regular', 'Malo', 'Crítico'];
    const conditions = ['Excelente', 'Bueno', 'Regular', 'Deteriorado', 'Crítico'];
    
    // Distribución de árboles por especie (para asegurar variedad)
    const treesToCreate = [];

    // Crear 50 árboles en total
    for (let i = 0; i < 50; i++) {
      // Seleccionar parque aleatorio
      const park = parks[Math.floor(Math.random() * parks.length)];
      
      // Seleccionar especie aleatoria
      const species_id = species[Math.floor(Math.random() * species.length)].id;
      
      // Generar coordenadas dentro del parque (simuladas)
      const baseLatitude = 20.65 + (Math.random() * 0.05);
      const baseLongitude = -103.35 + (Math.random() * 0.05);
      
      // Valores aleatorios para características del árbol
      const height = parseFloat((Math.random() * 15 + 1).toFixed(2)); // Entre 1 y 16 metros
      const trunk_diameter = parseFloat((Math.random() * 80 + 5).toFixed(2)); // Entre 5 y 85 cm
      const health_status = healthStatuses[Math.floor(Math.random() * healthStatuses.length)];
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      
      // Calcular fecha de plantación aleatoria (entre 1 y 20 años atrás)
      const currentDate = new Date();
      const yearsAgo = Math.floor(Math.random() * 20) + 1;
      const plantingDate = new Date(currentDate);
      plantingDate.setFullYear(currentDate.getFullYear() - yearsAgo);
      
      // Descripción de ubicación dentro del parque
      const locations = [
        'Cerca de la entrada principal', 
        'En el área de juegos', 
        'Junto al lago', 
        'En el área de picnic', 
        'En el perímetro norte', 
        'En el perímetro sur', 
        'En el jardín central', 
        'Junto a la ciclovía',
        'Cerca del área deportiva',
        'En la zona de descanso'
      ];
      const location_description = locations[Math.floor(Math.random() * locations.length)];
      
      // Notas aleatorias sobre el árbol
      const notesList = [
        'Árbol en buen estado general',
        'Presenta algunas ramas secas que requieren poda',
        'Ha sido tratado recientemente contra plagas',
        'Es un ejemplar notable por su tamaño',
        'Ha sobrevivido a condiciones climáticas extremas',
        'Requiere evaluación detallada próximamente',
        'Plantado durante campaña de reforestación municipal',
        'Provee sombra a un área de descanso',
        'Es parte de un grupo de árboles de la misma especie',
        'Es un árbol joven con buen desarrollo'
      ];
      const notes = notesList[Math.floor(Math.random() * notesList.length)];
      
      // Crear objeto con los datos del árbol
      treesToCreate.push({
        species_id,
        park_id: park.id,
        latitude: baseLatitude,
        longitude: baseLongitude,
        height,
        trunk_diameter,
        planting_date: plantingDate,
        location_description,
        notes,
        condition,
        health_status,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // Insertar todos los árboles en la base de datos
    const insertQuery = sql`
      INSERT INTO trees (
        species_id, park_id, latitude, longitude, height, trunk_diameter,
        planting_date, location_description, notes, condition, health_status,
        created_at, updated_at
      )
      VALUES ${sql.join(
        treesToCreate.map(
          tree => sql`(
            ${tree.species_id}, ${tree.park_id}, ${tree.latitude}, ${tree.longitude},
            ${tree.height}, ${tree.trunk_diameter}, ${tree.planting_date},
            ${tree.location_description}, ${tree.notes}, ${tree.condition},
            ${tree.health_status}, ${tree.created_at}, ${tree.updated_at}
          )`
        ),
        ','
      )}
      RETURNING id
    `;

    const result = await db.execute(insertQuery);
    
    console.log(`Se han agregado exitosamente ${treesToCreate.length} árboles al inventario.`);
    return treesToCreate.length;
    
  } catch (error) {
    console.error('Error al crear árboles en el inventario:', error);
    throw error;
  }
}

// Para ejecutar directamente: node -r esbuild-register server/seed-tree-inventory.ts
if (require.main === module) {
  seedTreeInventory()
    .then(() => {
      console.log('Proceso de carga de árboles completado.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error en el proceso de carga:', err);
      process.exit(1);
    });
}