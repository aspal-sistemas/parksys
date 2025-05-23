import { db } from './db';
import { sql } from 'drizzle-orm';
import { createAssetTables } from './create-asset-tables';

/**
 * Script para importar activos de muestra
 */
async function importAssetsSample() {
  try {
    console.log("Iniciando importación de activos de muestra...");
    
    // Paso 1: Crear las tablas si no existen
    await createAssetTables();
    
    // Paso 2: Verificar que tenemos al menos un parque para asignar los activos
    const parks = await db.execute(sql`SELECT id, name FROM parks LIMIT 1`);
    
    if (!parks.rows.length) {
      console.error("No hay parques disponibles para asignar los activos");
      return { success: false, error: "No hay parques disponibles" };
    }
    
    const parkId = parks.rows[0].id;
    const parkName = parks.rows[0].name;
    
    console.log(`Usando parque: ${parkName} (ID: ${parkId})`);
    
    // Paso 3: Verificar categorías
    const categories = await db.execute(sql`SELECT id, name FROM asset_categories LIMIT 10`);
    
    if (!categories.rows.length) {
      console.error("No hay categorías de activos disponibles");
      return { success: false, error: "No hay categorías disponibles" };
    }
    
    // Seleccionar categorías para los ejemplos
    const mobiliaroCatId = categories.rows.find(c => c.name === 'Mobiliario Urbano')?.id || categories.rows[0].id;
    const equipoDepCatId = categories.rows.find(c => c.name === 'Equipamiento Deportivo')?.id || categories.rows[0].id;
    const juegosCatId = categories.rows.find(c => c.name === 'Juegos Infantiles')?.id || categories.rows[0].id;
    
    // Paso 4: Insertar activos de muestra
    console.log("Insertando activos de muestra...");
    
    // Activo 1: Banca de parque
    await db.execute(sql`
      INSERT INTO assets (
        name, 
        description, 
        serial_number, 
        category_id, 
        park_id, 
        location_description,
        acquisition_date,
        acquisition_cost,
        status,
        condition,
        maintenance_frequency,
        last_maintenance_date,
        next_maintenance_date,
        notes
      ) VALUES (
        'Banca Modelo Colonial',
        'Banca de hierro fundido con acabados de madera tratada. Capacidad para 3 personas.',
        'BNC-2023-001',
        ${mobiliaroCatId},
        ${parkId},
        'Cerca de la entrada principal, lado norte',
        '2023-01-15',
        3500.00,
        'Activo',
        'Bueno',
        'Trimestral',
        '2023-10-20',
        '2024-01-20',
        'Instalada como parte del proyecto de renovación 2023'
      ) RETURNING id
    `);
    
    // Activo 2: Aparato de ejercicio
    await db.execute(sql`
      INSERT INTO assets (
        name, 
        description, 
        serial_number, 
        category_id, 
        park_id, 
        location_description,
        acquisition_date,
        acquisition_cost,
        status,
        condition,
        maintenance_frequency,
        last_maintenance_date,
        next_maintenance_date,
        notes
      ) VALUES (
        'Caminadora al aire libre',
        'Aparato de ejercicio tipo caminadora de uso rudo para exteriores',
        'EQP-2023-042',
        ${equipoDepCatId},
        ${parkId},
        'Zona de ejercicio, esquina sureste',
        '2023-03-10',
        12800.00,
        'Activo',
        'Excelente',
        'Mensual',
        '2023-11-05',
        '2023-12-05',
        'Equipo de alta demanda, revisar desgaste de superficie antiderrapante'
      ) RETURNING id
    `);
    
    // Activo 3: Juego infantil
    await db.execute(sql`
      INSERT INTO assets (
        name, 
        description, 
        serial_number, 
        category_id, 
        park_id, 
        location_description,
        acquisition_date,
        acquisition_cost,
        status,
        condition,
        maintenance_frequency,
        last_maintenance_date,
        next_maintenance_date,
        notes
      ) VALUES (
        'Resbaladilla con escalera',
        'Juego infantil combinado con resbaladilla de plástico y estructura metálica',
        'JI-2022-103',
        ${juegosCatId},
        ${parkId},
        'Área infantil central',
        '2022-07-22',
        8750.00,
        'Mantenimiento',
        'Regular',
        'Mensual',
        '2023-10-02',
        '2023-11-02',
        'Programar reemplazo de tornillería y verificar estabilidad de estructura'
      ) RETURNING id
    `);
    
    // Paso 5: Agregar un registro de mantenimiento para el juego infantil
    const assets = await db.execute(sql`SELECT id, name FROM assets WHERE name = 'Resbaladilla con escalera'`);
    
    if (assets.rows.length > 0) {
      const assetId = assets.rows[0].id;
      
      await db.execute(sql`
        INSERT INTO asset_maintenances (
          asset_id,
          maintenance_type,
          performed_by,
          date,
          cost,
          description,
          findings,
          actions,
          next_maintenance_date
        ) VALUES (
          ${assetId},
          'Correctivo',
          'Manuel Rodríguez',
          '2023-10-02',
          350.00,
          'Mantenimiento correctivo por desgaste en superficie de resbaladilla',
          'Se encontró desgaste excesivo en la superficie de la resbaladilla y tornillos flojos en la estructura.',
          'Se lijó y pulió la superficie de la resbaladilla. Se reemplazaron 6 tornillos y se ajustaron todas las uniones.',
          '2023-11-02'
        )
      `);
      
      // Actualizar la fecha del último mantenimiento
      await db.execute(sql`
        UPDATE assets SET last_maintenance_date = '2023-10-02' WHERE id = ${assetId}
      `);
    }
    
    console.log("Activos de muestra importados correctamente.");
    return { success: true };
  } catch (error) {
    console.error("Error al importar activos de muestra:", error);
    return { success: false, error };
  }
}

// Ejecutar la función inmediatamente
importAssetsSample()
  .then(result => {
    console.log("Resultado de la importación:", result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error("Error crítico en la importación:", error);
    process.exit(1);
  });

export { importAssetsSample };