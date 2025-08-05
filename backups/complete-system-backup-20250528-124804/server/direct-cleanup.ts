import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Script simplificado para eliminar instructores específicos que son duplicados
 */
async function removeSpecificDuplicates() {
  console.log("Iniciando limpieza específica de instructores duplicados...");
  
  // Lista de IDs a eliminar (identificados manualmente como duplicados)
  // No incluye los IDs más recientes que queremos mantener
  const duplicateIds = [
    // Duplicados de Patricia Montes de Oca (mantenemos ID 75)
    15, 30, 45, 60,
    
    // Duplicados de Miguel Ángel Torres Herrera (mantenemos ID 64)
    4, 19, 34, 49,
    
    // Duplicados de Javier López Castro (mantenemos ID 70)
    10, 25, 40, 55,
    
    // Duplicados de Isabel Morales Jiménez (mantenemos ID 69)
    9, 24, 39, 54,
    
    // Duplicados de Luis Fernando Ríos Ochoa (mantenemos ID 72)
    12, 27, 42, 57,
    
    // Duplicados de Karla Medina Ruiz (mantenemos ID 71)
    11, 26, 41, 56,
    
    // Duplicados de María Fernanda Gutiérrez Lara (mantenemos ID 73)
    13, 28, 43, 58,
    
    // Duplicados de Héctor Navarro Campos (mantenemos ID 68)
    8, 23, 38, 53,
    
    // Duplicados de Alejandra Robles Quintero (mantenemos ID 65)
    5, 20, 35, 50,
    
    // Duplicados de Noé Valenzuela Cervantes (mantenemos ID 74)
    14, 29, 44, 59,
    
    // Duplicados de Carla Ramírez Soto (mantenemos ID 61)
    1, 16, 31, 46,
    
    // Duplicados de Daniel Ortega Miranda (mantenemos ID 66)
    6, 21, 36, 51,
    
    // Duplicados de Elena Vázquez Duarte (mantenemos ID 63)
    3, 18, 33, 48,
    
    // Duplicados de Gabriela Estrada Figueroa (mantenemos ID 67)
    7, 22, 37, 52,

    // Duplicados de Roberto Molina Vargas (mantenemos ID 62)
    2, 17, 32, 47
  ];
  
  // Para cada ID, actualizamos referencias antes de eliminar
  for (const deleteId of duplicateIds) {
    // Determinamos el ID a mantener para este instructor
    let keepId;
    
    if ([15, 30, 45, 60].includes(deleteId)) keepId = 75; // Patricia Montes de Oca
    else if ([4, 19, 34, 49].includes(deleteId)) keepId = 64; // Miguel Ángel Torres Herrera
    else if ([10, 25, 40, 55].includes(deleteId)) keepId = 70; // Javier López Castro
    else if ([9, 24, 39, 54].includes(deleteId)) keepId = 69; // Isabel Morales Jiménez
    else if ([12, 27, 42, 57].includes(deleteId)) keepId = 72; // Luis Fernando Ríos Ochoa
    else if ([11, 26, 41, 56].includes(deleteId)) keepId = 71; // Karla Medina Ruiz
    else if ([13, 28, 43, 58].includes(deleteId)) keepId = 73; // María Fernanda Gutiérrez Lara
    else if ([8, 23, 38, 53].includes(deleteId)) keepId = 68; // Héctor Navarro Campos
    else if ([5, 20, 35, 50].includes(deleteId)) keepId = 65; // Alejandra Robles Quintero
    else if ([14, 29, 44, 59].includes(deleteId)) keepId = 74; // Noé Valenzuela Cervantes
    else if ([1, 16, 31, 46].includes(deleteId)) keepId = 61; // Carla Ramírez Soto
    else if ([6, 21, 36, 51].includes(deleteId)) keepId = 66; // Daniel Ortega Miranda
    else if ([3, 18, 33, 48].includes(deleteId)) keepId = 63; // Elena Vázquez Duarte
    else if ([7, 22, 37, 52].includes(deleteId)) keepId = 67; // Gabriela Estrada Figueroa
    else if ([2, 17, 32, 47].includes(deleteId)) keepId = 62; // Roberto Molina Vargas
    
    console.log(`Procesando duplicado: ID ${deleteId} → ID ${keepId}`);
    
    try {
      // 1. Actualizar referencias en instructor_assignments
      await db.execute(sql`
        UPDATE instructor_assignments 
        SET instructor_id = ${keepId} 
        WHERE instructor_id = ${deleteId}
      `);
      
      // 2. Actualizar referencias en instructor_evaluations
      await db.execute(sql`
        UPDATE instructor_evaluations 
        SET instructor_id = ${keepId} 
        WHERE instructor_id = ${deleteId}
      `);
      
      // 3. Actualizar referencias en instructor_recognitions
      await db.execute(sql`
        UPDATE instructor_recognitions 
        SET instructor_id = ${keepId} 
        WHERE instructor_id = ${deleteId}
      `);
      
      // 4. Eliminar el instructor duplicado
      await db.execute(sql`
        DELETE FROM instructors 
        WHERE id = ${deleteId}
      `);
      
      console.log(`✓ Eliminado instructor duplicado ID ${deleteId}`);
    } catch (error) {
      console.error(`✗ Error al procesar ID ${deleteId}:`, error);
    }
  }
  
  console.log("Limpieza específica completada.");
}

// Ejecutar el script
removeSpecificDuplicates()
  .then(() => {
    console.log("Proceso finalizado.");
    process.exit(0);
  })
  .catch(error => {
    console.error("Error en el proceso:", error);
    process.exit(1);
  });