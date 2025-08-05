import { db, pool } from "./db";

/**
 * Script para actualizar las ubicaciones de actividades existentes
 * con nombres de amenidades del parque correspondiente
 */
export async function updateActivityLocations() {
  console.log("Iniciando actualización de ubicaciones de actividades...");

  try {
    // Obtener todas las actividades que no tienen ubicación o tienen ubicaciones genéricas
    const activitiesResult = await pool.query(`
      SELECT id, park_id, title, location, category
      FROM activities 
      WHERE location IS NULL 
         OR location = '' 
         OR location IN ('Plaza central', 'Área cultural', 'Anfiteatro', 'Auditorio')
      ORDER BY park_id, id
    `);

    console.log(`Encontradas ${activitiesResult.rows.length} actividades para actualizar`);

    let updatedCount = 0;

    for (const activity of activitiesResult.rows) {
      try {
        // Obtener amenidades del parque de la actividad
        const amenitiesResult = await pool.query(`
          SELECT DISTINCT a.name, a.category
          FROM amenities a
          INNER JOIN park_amenities pa ON a.id = pa.amenity_id
          WHERE pa.park_id = $1
          ORDER BY a.name
        `, [activity.park_id]);

        if (amenitiesResult.rows.length === 0) {
          console.log(`Parque ${activity.park_id} no tiene amenidades registradas`);
          continue;
        }

        // Seleccionar una amenidad apropiada basada en la categoría de la actividad
        let selectedAmenity = null;

        // Mapeo de categorías de actividades a tipos de amenidades preferidas
        const categoryMapping: { [key: string]: string[] } = {
          'artecultura': ['Escenarios culturales', 'Auditorio', 'Plaza principal'],
          'deportivo': ['Canchas deportivas', 'Áreas de ejercicio', 'Senderos para caminar'],
          'naturalezaciencia': ['Áreas verdes', 'Senderos para caminar', 'Mirador'],
          'recreacionbienestar': ['Áreas de picnic', 'Zona para mascotas', 'Juegos infantiles'],
          'comunidad': ['Plaza principal', 'Área de eventos', 'Estacionamiento'],
          'temporada': ['Escenarios culturales', 'Plaza principal', 'Área de eventos']
        };

        const preferredAmenities = categoryMapping[activity.category] || ['Plaza principal'];
        
        // Buscar amenidad preferida
        for (const preferred of preferredAmenities) {
          const found = amenitiesResult.rows.find(amenity => 
            amenity.name.toLowerCase().includes(preferred.toLowerCase()) ||
            preferred.toLowerCase().includes(amenity.name.toLowerCase())
          );
          if (found) {
            selectedAmenity = found.name;
            break;
          }
        }

        // Si no se encuentra una amenidad preferida, usar la primera disponible
        if (!selectedAmenity) {
          selectedAmenity = amenitiesResult.rows[0].name;
        }

        // Actualizar la actividad con la nueva ubicación
        await pool.query(`
          UPDATE activities 
          SET location = $1 
          WHERE id = $2
        `, [selectedAmenity, activity.id]);

        console.log(`✓ Actividad "${activity.title}" (ID: ${activity.id}) -> Ubicación: "${selectedAmenity}"`);
        updatedCount++;

      } catch (error) {
        console.error(`Error actualizando actividad ${activity.id}:`, error);
      }
    }

    console.log(`\n🎉 Actualización completada: ${updatedCount} actividades actualizadas`);

    // Mostrar resumen de ubicaciones asignadas
    const summaryResult = await pool.query(`
      SELECT location, COUNT(*) as count
      FROM activities 
      WHERE location IS NOT NULL AND location != ''
      GROUP BY location
      ORDER BY count DESC, location
    `);

    console.log("\n📊 Resumen de ubicaciones asignadas:");
    summaryResult.rows.forEach(row => {
      console.log(`  • ${row.location}: ${row.count} actividades`);
    });

  } catch (error) {
    console.error("Error en la actualización de ubicaciones:", error);
    throw error;
  }
}

// Función para verificar el estado actual de las ubicaciones
export async function checkActivityLocationsStatus() {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN location IS NOT NULL AND location != '' THEN 1 END) as with_location,
        COUNT(CASE WHEN location IS NULL OR location = '' THEN 1 END) as without_location
      FROM activities
    `);

    const stats = result.rows[0];
    console.log("\n📍 Estado actual de ubicaciones de actividades:");
    console.log(`  • Total de actividades: ${stats.total}`);
    console.log(`  • Con ubicación: ${stats.with_location}`);
    console.log(`  • Sin ubicación: ${stats.without_location}`);
    console.log(`  • Porcentaje completado: ${Math.round((stats.with_location / stats.total) * 100)}%`);

    return stats;
  } catch (error) {
    console.error("Error verificando estado de ubicaciones:", error);
    throw error;
  }
}

// Ejecutar si se llama directamente
async function main() {
  try {
    await checkActivityLocationsStatus();
    await updateActivityLocations();
    await checkActivityLocationsStatus();
    console.log("\n✅ Proceso completado exitosamente");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error en el proceso:", error);
    process.exit(1);
  }
}

// Solo ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}