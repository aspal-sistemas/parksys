/**
 * Script para agregar registros de mantenimiento de muestra a los árboles existentes
 */
import { db } from "./db";
import { trees, treeMaintenances } from "@shared/schema";
import { sql } from "drizzle-orm";

export async function addSampleTreeMaintenances() {
  try {
    console.log("Iniciando creación de registros de mantenimiento de muestra...");
    
    // Obtener los IDs de los árboles existentes
    const existingTrees = await db.select({ id: trees.id }).from(trees).limit(20);
    
    if (existingTrees.length === 0) {
      console.log("No hay árboles en el inventario. Por favor, agregue árboles primero.");
      return;
    }
    
    console.log(`Se encontraron ${existingTrees.length} árboles para agregar mantenimientos.`);
    
    // Tipos de mantenimiento posibles
    const maintenanceTypes = [
      "Poda", 
      "Riego", 
      "Fertilización", 
      "Control de plagas", 
      "Tratamiento de enfermedades",
      "Inspección",
      "Otro"
    ];
    
    // Personal que puede realizar mantenimientos
    const personnel = [
      "Juan Pérez", 
      "María González", 
      "Carlos Rodríguez", 
      "Ana Martínez",
      "Roberto Sánchez",
      "Lucía Fernández",
      "Miguel Ángel Torres",
      "Equipo de Jardinería Municipal"
    ];
    
    // Notas de mantenimiento posibles
    const notes = [
      "Mantenimiento preventivo rutinario",
      "Se detectaron signos tempranos de enfermedad",
      "Poda para mejorar estructura y salud del árbol",
      "Aplicación de fertilizante orgánico",
      "Riego profundo debido a la sequía",
      "Tratamiento preventivo contra plagas",
      "Se observó debilitamiento en algunas ramas",
      "Inspección rutinaria sin observaciones negativas",
      "Remoción de ramas muertas o dañadas",
      "Tratamiento aplicado para fortalecer sistema radicular",
      "Se realizó aireación del suelo para mejorar crecimiento",
      "Aplicación de mulch orgánico en la base"
    ];
    
    // Fecha actual para referencia
    const now = new Date();
    
    // Crear múltiples registros de mantenimiento para cada árbol
    const maintenanceRecords = [];
    
    for (const tree of existingTrees) {
      // Número aleatorio de registros de mantenimiento por árbol (1-3)
      const numRecords = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numRecords; i++) {
        // Generar una fecha aleatoria en los últimos 6 meses
        const randomDays = Math.floor(Math.random() * 180);
        const maintenanceDate = new Date(now);
        maintenanceDate.setDate(maintenanceDate.getDate() - randomDays);
        
        maintenanceRecords.push({
          tree_id: tree.id,
          maintenance_type: maintenanceTypes[Math.floor(Math.random() * maintenanceTypes.length)],
          maintenance_date: maintenanceDate.toISOString(),
          performed_by: personnel[Math.floor(Math.random() * personnel.length)],
          notes: notes[Math.floor(Math.random() * notes.length)],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }
    
    // Insertar los registros en la base de datos
    if (maintenanceRecords.length > 0) {
      await db.insert(treeMaintenances).values(maintenanceRecords);
      console.log(`Se agregaron ${maintenanceRecords.length} registros de mantenimiento a ${existingTrees.length} árboles.`);
      return maintenanceRecords.length;
    } else {
      console.log("No se crearon registros de mantenimiento.");
      return 0;
    }
    
  } catch (error) {
    console.error("Error al agregar registros de mantenimiento de muestra:", error);
    throw error;
  }
}

// Auto-ejecutar el script
addSampleTreeMaintenances()
  .then(() => {
    console.log("Script completado correctamente.");
  })
  .catch((error) => {
    console.error("Error en el script:", error);
  });