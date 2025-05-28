import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Script para agregar árboles al inventario
 */
export async function seedTreeData() {
  console.log('Iniciando la carga de árboles en el inventario...');

  try {
    // Obtener los parques disponibles
    const parksResult = await db.execute(sql`SELECT id, name FROM parks`);
    if (!parksResult.rows || parksResult.rows.length === 0) {
      console.error('No hay parques en la base de datos para asignar árboles.');
      return;
    }
    const parks = parksResult.rows;

    // Obtener las especies disponibles
    const speciesResult = await db.execute(sql`SELECT id, common_name FROM tree_species`);
    if (!speciesResult.rows || speciesResult.rows.length === 0) {
      console.error('No hay especies de árboles en el catálogo.');
      return;
    }
    const species = speciesResult.rows;

    console.log(`Se encontraron ${parks.length} parques y ${species.length} especies de árboles.`);

    // Estados de salud para asignar aleatoriamente
    const healthStatuses = ['Bueno', 'Regular', 'Malo', 'Crítico'];
    const conditions = ['Excelente', 'Bueno', 'Regular', 'Deteriorado', 'Crítico'];
    
    // Crear registros para 50 árboles
    let insertedCount = 0;
    
    for (let i = 0; i < 50; i++) {
      // Seleccionar parque aleatorio
      const parkIndex = Math.floor(Math.random() * parks.length);
      const park_id = parks[parkIndex].id;
      
      // Seleccionar especie aleatoria
      const speciesIndex = Math.floor(Math.random() * species.length);
      const species_id = species[speciesIndex].id;
      
      // Generar coordenadas dentro del parque (simuladas)
      const latitude = parseFloat((20.65 + (Math.random() * 0.05)).toFixed(6));
      const longitude = parseFloat((-103.35 + (Math.random() * 0.05)).toFixed(6));
      
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
      
      try {
        // Insertar el árbol en la base de datos usando la estructura real de la tabla
        await db.execute(sql`
          INSERT INTO trees (
            species_id, park_id, latitude, longitude, height, trunk_diameter,
            planting_date, location_description, notes, condition, health_status,
            created_at, updated_at
          )
          VALUES (
            ${species_id}, ${park_id}, ${latitude}, ${longitude},
            ${height}, ${trunk_diameter}, ${plantingDate},
            ${location_description}, ${notes}, ${condition},
            ${health_status}, NOW(), NOW()
          )
        `);
        
        insertedCount++;
      } catch (err) {
        console.error(`Error al insertar árbol #${i+1}:`, err);
      }
    }
    
    console.log(`Se han agregado exitosamente ${insertedCount} árboles al inventario.`);
    return insertedCount;
    
  } catch (error) {
    console.error('Error al crear árboles en el inventario:', error);
    throw error;
  }
}