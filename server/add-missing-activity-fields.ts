import { db } from "./db";
import { sql } from "drizzle-orm";

/**
 * Script para agregar campos faltantes a la tabla activities
 */
async function addMissingActivityFields() {
  console.log("🔧 Agregando campos faltantes a la tabla activities...");

  try {
    // Verificar y agregar campo is_price_random
    try {
      await db.execute(sql`
        ALTER TABLE activities 
        ADD COLUMN IF NOT EXISTS is_price_random BOOLEAN DEFAULT false;
      `);
      console.log("✅ Campo is_price_random agregado");
    } catch (error) {
      console.log("⚠️ Campo is_price_random ya existe o error:", error);
    }

    // Verificar y agregar campo registration_instructions
    try {
      await db.execute(sql`
        ALTER TABLE activities 
        ADD COLUMN IF NOT EXISTS registration_instructions TEXT;
      `);
      console.log("✅ Campo registration_instructions agregado");
    } catch (error) {
      console.log("⚠️ Campo registration_instructions ya existe o error:", error);
    }

    // Verificar y agregar campo age_restrictions
    try {
      await db.execute(sql`
        ALTER TABLE activities 
        ADD COLUMN IF NOT EXISTS age_restrictions TEXT;
      `);
      console.log("✅ Campo age_restrictions agregado");
    } catch (error) {
      console.log("⚠️ Campo age_restrictions ya existe o error:", error);
    }

    // Verificar y agregar campo health_requirements
    try {
      await db.execute(sql`
        ALTER TABLE activities 
        ADD COLUMN IF NOT EXISTS health_requirements TEXT;
      `);
      console.log("✅ Campo health_requirements agregado");
    } catch (error) {
      console.log("⚠️ Campo health_requirements ya existe o error:", error);
    }

    console.log("🎉 Migración de campos completada exitosamente");

  } catch (error) {
    console.error("❌ Error durante la migración:", error);
    throw error;
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  addMissingActivityFields()
    .then(() => {
      console.log("✅ Script completado");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error ejecutando script:", error);
      process.exit(1);
    });
}

export { addMissingActivityFields };