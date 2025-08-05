/**
 * Script para generar un inventario completo de árboles
 * distribuyendo aleatoriamente las especies del catálogo entre los parques
 */
import { db } from './db';
import { trees, parks, treeSpecies } from '../shared/schema';
import { sql, eq } from 'drizzle-orm';

// Estados de salud posibles
const healthStatuses = [
  'excelente',
  'bueno', 
  'bueno',
  'bueno', // Más probabilidad de estar en buen estado
  'regular',
  'malo'
];

// Etapas de desarrollo
const developmentStages = [
  'plantula',
  'juvenil',
  'adulto',
  'adulto',
  'adulto', // Más probabilidad de ser adulto
  'maduro'
];

// Función para generar coordenadas aleatorias dentro de Guadalajara
function generateRandomCoordinates() {
  // Coordenadas aproximadas de Guadalajara
  const baseLatitude = 20.659698;
  const baseLongitude = -103.349609;
  
  // Variación aleatoria dentro de la ciudad (aproximadamente 0.1 grados)
  const latVariation = (Math.random() - 0.5) * 0.1;
  const lngVariation = (Math.random() - 0.5) * 0.1;
  
  return {
    latitude: (baseLatitude + latVariation).toFixed(8),
    longitude: (baseLongitude + lngVariation).toFixed(8)
  };
}

// Función para generar fechas aleatorias
function generateRandomDate(yearsBack: number = 10) {
  const now = new Date();
  const pastDate = new Date(now.getTime() - (Math.random() * yearsBack * 365 * 24 * 60 * 60 * 1000));
  return pastDate.toISOString().split('T')[0];
}

// Función para generar código único de árbol
function generateTreeCode(parkId: number, treeNumber: number) {
  return `ARB-P${parkId.toString().padStart(2, '0')}-${treeNumber.toString().padStart(4, '0')}`;
}

// Función para generar dimensiones realistas según la especie
function generateTreeDimensions(speciesName: string, ageYears: number) {
  let baseHeight = 3; // metros
  let baseDiameter = 0.1; // metros
  let baseCanopy = 2; // metros

  // Ajustar según el tipo de especie
  if (speciesName.includes('Ahuehuete') || speciesName.includes('Encino')) {
    baseHeight = 15;
    baseDiameter = 0.8;
    baseCanopy = 12;
  } else if (speciesName.includes('Jacaranda') || speciesName.includes('Fresno')) {
    baseHeight = 10;
    baseDiameter = 0.5;
    baseCanopy = 8;
  } else if (speciesName.includes('Mezquite') || speciesName.includes('Guamúchil')) {
    baseHeight = 8;
    baseDiameter = 0.4;
    baseCanopy = 6;
  }

  // Aplicar factor de edad
  const ageFactor = Math.min(ageYears / 20, 1); // Máximo crecimiento a los 20 años
  const randomFactor = 0.7 + (Math.random() * 0.6); // Factor aleatorio 0.7-1.3

  return {
    height: Math.round((baseHeight * ageFactor * randomFactor) * 10) / 10,
    diameter: Math.round((baseDiameter * ageFactor * randomFactor) * 100) / 100,
    canopyCoverage: Math.round((baseCanopy * ageFactor * randomFactor) * 10) / 10
  };
}

export async function generateTreeInventory() {
  try {
    console.log('🌳 Iniciando generación de inventario de árboles...');

    // Obtener todos los parques
    const allParks = await db.select().from(parks);
    console.log(`📍 Encontrados ${allParks.length} parques`);

    // Obtener todas las especies del catálogo
    const allSpecies = await db.select().from(treeSpecies);
    console.log(`🌿 Encontradas ${allSpecies.length} especies en el catálogo`);

    if (allParks.length === 0 || allSpecies.length === 0) {
      console.log('❌ No hay parques o especies disponibles');
      return;
    }

    // Verificar si ya hay árboles en el inventario
    const existingTrees = await db.select().from(trees);
    if (existingTrees.length > 0) {
      console.log(`⚠️  Ya existen ${existingTrees.length} árboles en el inventario. Eliminando para recrear...`);
      await db.delete(trees);
    }

    const treesToInsert = [];
    let treeCounter = 1;

    // Generar entre 8-15 árboles por parque
    for (const park of allParks) {
      const treesPerPark = Math.floor(Math.random() * 8) + 8; // 8-15 árboles
      console.log(`🏞️  Generando ${treesPerPark} árboles para ${park.name}`);

      for (let i = 0; i < treesPerPark; i++) {
        // Seleccionar especie aleatoria
        const randomSpecies = allSpecies[Math.floor(Math.random() * allSpecies.length)];
        
        // Generar coordenadas aleatorias
        const coordinates = generateRandomCoordinates();
        
        // Generar fecha de plantación (último 10 años)
        const plantingDate = generateRandomDate(10);
        const plantingYear = new Date(plantingDate).getFullYear();
        const currentYear = new Date().getFullYear();
        const ageYears = currentYear - plantingYear;
        
        // Generar dimensiones basadas en especie y edad
        const dimensions = generateTreeDimensions(randomSpecies.commonName || '', ageYears);
        
        // Seleccionar estado de salud y etapa de desarrollo
        const healthStatus = healthStatuses[Math.floor(Math.random() * healthStatuses.length)];
        const developmentStage = developmentStages[Math.floor(Math.random() * developmentStages.length)];
        
        // Generar fecha de última inspección (últimos 3 meses)
        const lastInspectionDate = generateRandomDate(0.25);

        const newTree = {
          species_id: randomSpecies.id,
          park_id: park.id,
          latitude: coordinates.latitude.toString(),
          longitude: coordinates.longitude.toString(),
          planting_date: plantingDate,
          height: dimensions.height.toString(),
          trunk_diameter: dimensions.diameter.toString(),
          condition: developmentStage,
          health_status: healthStatus,
          last_maintenance_date: lastInspectionDate,
          location_description: `Sector ${Math.floor(Math.random() * 10) + 1}`,
          notes: `Árbol ${randomSpecies.commonName} plantado en ${park.name}. Estado: ${healthStatus}.`
        };

        treesToInsert.push(newTree);
        treeCounter++;
      }
    }

    console.log(`📝 Insertando ${treesToInsert.length} árboles en la base de datos...`);

    // Insertar en lotes para mejor rendimiento
    const batchSize = 50;
    for (let i = 0; i < treesToInsert.length; i += batchSize) {
      const batch = treesToInsert.slice(i, i + batchSize);
      await db.insert(trees).values(batch);
      console.log(`✅ Insertados árboles ${i + 1} - ${Math.min(i + batchSize, treesToInsert.length)}`);
    }

    // Estadísticas finales
    console.log('📊 Generando estadísticas del inventario...');
    
    const totalTrees = await db.select({ count: sql`count(*)` }).from(trees);
    const treesByPark = await db.select({
      parkName: parks.name,
      count: sql`count(*)`
    })
    .from(trees)
    .leftJoin(parks, sql`${trees.park_id} = ${parks.id}`)
    .groupBy(parks.name);

    const treesBySpecies = await db.select({
      speciesName: treeSpecies.commonName,
      count: sql`count(*)`
    })
    .from(trees)
    .leftJoin(treeSpecies, sql`${trees.species_id} = ${treeSpecies.id}`)
    .groupBy(treeSpecies.commonName)
    .orderBy(sql`count(*) desc`)
    .limit(10);

    console.log('\n🎉 ¡Inventario de árboles generado exitosamente!');
    console.log('═'.repeat(50));
    console.log(`📊 ESTADÍSTICAS GENERALES:`);
    console.log(`   Total de árboles: ${totalTrees[0]?.count || 0}`);
    console.log(`   Distribuidos en: ${allParks.length} parques`);
    console.log(`   Especies utilizadas: ${allSpecies.length}`);
    
    console.log('\n🏞️  ÁRBOLES POR PARQUE:');
    treesByPark.forEach(item => {
      console.log(`   ${item.parkName}: ${item.count} árboles`);
    });
    
    console.log('\n🌿 TOP 10 ESPECIES MÁS PLANTADAS:');
    treesBySpecies.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.speciesName}: ${item.count} árboles`);
    });
    
    console.log('═'.repeat(50));
    console.log('✅ Inventario listo para consultar en /admin/trees/inventory');

  } catch (error) {
    console.error('❌ Error generando inventario de árboles:', error);
    throw error;
  }
}

// Función para actualizar estadísticas del inventario
export async function updateInventoryStats() {
  try {
    const stats = await db.select({
      totalTrees: sql`count(*)`,
      avgHeight: sql`avg(${trees.height})`,
      healthyTrees: sql`count(case when ${trees.health_status} in ('excelente', 'bueno') then 1 end)`,
      needAttention: sql`count(case when ${trees.health_status} in ('regular', 'malo') then 1 end)`
    }).from(trees);

    console.log('📈 Estadísticas actualizadas del inventario:', stats[0]);
    return stats[0];
  } catch (error) {
    console.error('Error actualizando estadísticas:', error);
    return null;
  }
}