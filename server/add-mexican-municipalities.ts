/**
 * Script para agregar municipios de la Zona Metropolitana de Guadalajara a la base de datos
 */
import { db } from "./db";
import { municipalities } from "@shared/schema";
import { eq, ilike } from "drizzle-orm";

// Lista de municipios de la Zona Metropolitana de Guadalajara, Jalisco
const GUADALAJARA_METROPOLITAN_MUNICIPALITIES = [
  // Zona Metropolitana de Guadalajara (AMG - Área Metropolitana de Guadalajara)
  { name: "Guadalajara", state: "Jalisco" },
  { name: "Zapopan", state: "Jalisco" },
  { name: "San Pedro Tlaquepaque", state: "Jalisco" },
  { name: "Tonalá", state: "Jalisco" },
  { name: "Tlajomulco de Zúñiga", state: "Jalisco" },
  { name: "El Salto", state: "Jalisco" },
  { name: "Juanacatlán", state: "Jalisco" },
  { name: "Ixtlahuacán de los Membrillos", state: "Jalisco" },
  { name: "Zapotlanejo", state: "Jalisco" },
];

export async function addMexicanMunicipalities() {
  try {
    console.log("Agregando municipios de la Zona Metropolitana de Guadalajara...");

    for (const municipalityData of GUADALAJARA_METROPOLITAN_MUNICIPALITIES) {
      try {
        // Verificar si el municipio ya existe
        const existing = await db.select()
          .from(municipalities)
          .where(eq(municipalities.name, municipalityData.name))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(municipalities).values({
            name: municipalityData.name,
            state: municipalityData.state,
            active: true,
            logoUrl: null
          });
          
          console.log(`✓ Agregado: ${municipalityData.name}, ${municipalityData.state}`);
        } else {
          console.log(`- Ya existe: ${municipalityData.name}, ${municipalityData.state}`);
        }
      } catch (error) {
        console.error(`Error al agregar ${municipalityData.name}:`, error);
      }
    }

    console.log("Municipios de la Zona Metropolitana de Guadalajara agregados exitosamente.");
  } catch (error) {
    console.error("Error al agregar municipios de la Zona Metropolitana de Guadalajara:", error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  addMexicanMunicipalities().catch(console.error);
}