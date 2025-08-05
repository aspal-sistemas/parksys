/**
 * Script para añadir la columna "skills" a la tabla de voluntarios
 */

import { pool } from "./db";

async function addSkillsColumn() {
  console.log("🔧 Añadiendo columna de habilidades a la tabla de voluntarios...");
  
  try {
    // Verificar si la columna ya existe
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'volunteers' AND column_name = 'skills'
    `);
    
    if (checkResult.rows && checkResult.rows.length > 0) {
      console.log("ℹ️ La columna 'skills' ya existe en la tabla de voluntarios");
      return;
    }
    
    // Añadir la columna si no existe
    await pool.query(`
      ALTER TABLE volunteers
      ADD COLUMN skills TEXT DEFAULT NULL
    `);
    
    console.log("✅ Columna 'skills' añadida correctamente a la tabla de voluntarios");
    
  } catch (error) {
    console.error("❌ Error al añadir la columna:", error);
  }
}

// Ejecutar la función
addSkillsColumn();