import { db } from './db';
import { treeSpecies } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Script para cargar árboles en el inventario usando la estructura real de la tabla
 */
export async function loadTreeInventory() {
  console.log('Iniciando carga de árboles en el inventario...');
  
  try {
    // Consultar los parques existentes
    const parks = await db.query.parks.findMany();
    if (!parks || parks.length === 0) {
      console.error('No hay parques disponibles para asignar árboles');
      return;
    }
    
    // Consultar las especies existentes
    const species = await db.query.treeSpecies.findMany();
    if (!species || species.length === 0) {
      console.error('No hay especies de árboles disponibles');
      return;
    }
    
    console.log(`Encontrados ${parks.length} parques y ${species.length} especies para crear árboles`);
    
    // Valores posibles para condición y estado
    const healthStatuses = ['Bueno', 'Regular', 'Malo', 'Crítico'];
    const conditions = ['Excelente', 'Bueno', 'Regular', 'Deteriorado', 'Crítico'];
    
    // Contador de árboles insertados
    let insertedCount = 0;
    
    // Insertar 50 árboles
    for (let i = 0; i < 50; i++) {
      try {
        // Seleccionar un parque aleatorio
        const randomParkIndex = Math.floor(Math.random() * parks.length);
        const park = parks[randomParkIndex];
        
        // Seleccionar una especie aleatoria
        const randomSpeciesIndex = Math.floor(Math.random() * species.length);
        const specie = species[randomSpeciesIndex];
        
        // Generar coordenadas (latitud/longitud)
        const latitude = 20.65 + (Math.random() * 0.05);
        const longitude = -103.35 + (Math.random() * 0.05);
        
        // Generar altura y diámetro aleatorios
        const height = parseFloat((Math.random() * 15 + 1).toFixed(2)); // Entre 1 y 16 metros
        const trunkDiameter = parseFloat((Math.random() * 80 + 5).toFixed(2)); // Entre 5 y 85 cm
        
        // Seleccionar estado de salud y condición aleatorios
        const healthStatus = healthStatuses[Math.floor(Math.random() * healthStatuses.length)];
        const condition = conditions[Math.floor(Math.random() * conditions.length)];
        
        // Generar fecha de plantación aleatoria (entre 1 y 20 años atrás)
        const plantingDate = new Date();
        const yearsAgo = Math.floor(Math.random() * 20) + 1;
        plantingDate.setFullYear(plantingDate.getFullYear() - yearsAgo);
        
        // Descripción de ubicación
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
        const locationDescription = locations[Math.floor(Math.random() * locations.length)];
        
        // Notas y observaciones
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
        
        // Ejecutar la inserción directa en la base de datos usando sql tag de drizzle
        const result = await db.execute(
          `INSERT INTO trees (
            species_id, park_id, latitude, longitude, 
            height, trunk_diameter, planting_date, 
            location_description, notes, condition, health_status,
            created_at, updated_at
          ) 
          VALUES (
            ${specie.id}, ${park.id}, ${latitude}, ${longitude},
            ${height}, ${trunkDiameter}, ${plantingDate},
            ${locationDescription}, ${notes}, ${condition},
            ${healthStatus}, NOW(), NOW()
          )
          RETURNING id`
        );
        
        insertedCount++;
        
        if (insertedCount % 10 === 0) {
          console.log(`Progreso: ${insertedCount} árboles insertados...`);
        }
      } catch (error) {
        console.error(`Error al insertar árbol #${i+1}:`, error);
      }
    }
    
    console.log(`¡Carga completada! Se insertaron ${insertedCount} árboles en el inventario.`);
    return insertedCount;
    
  } catch (error) {
    console.error('Error en el proceso de carga de árboles:', error);
    throw error;
  }
}