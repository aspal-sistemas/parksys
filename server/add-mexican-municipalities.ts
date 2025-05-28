/**
 * Script para agregar municipios reales de México a la base de datos
 */
import { db } from "./db";
import { municipalities } from "@shared/schema";
import { eq, ilike } from "drizzle-orm";

// Lista de municipios importantes de México por estado
const MEXICAN_MUNICIPALITIES = [
  // Ciudad de México
  { name: "Ciudad de México", state: "Ciudad de México" },
  
  // Estado de México
  { name: "Toluca", state: "Estado de México" },
  { name: "Ecatepec de Morelos", state: "Estado de México" },
  { name: "Guadalajara", state: "Jalisco" },
  { name: "Zapopan", state: "Jalisco" },
  { name: "Tlaquepaque", state: "Jalisco" },
  { name: "Tonalá", state: "Jalisco" },
  { name: "Puerto Vallarta", state: "Jalisco" },
  
  // Nuevo León
  { name: "Monterrey", state: "Nuevo León" },
  { name: "Guadalupe", state: "Nuevo León" },
  { name: "San Nicolás de los Garza", state: "Nuevo León" },
  { name: "Apodaca", state: "Nuevo León" },
  { name: "Santa Catarina", state: "Nuevo León" },
  
  // Puebla
  { name: "Puebla", state: "Puebla" },
  { name: "Tehuacán", state: "Puebla" },
  { name: "San Martín Texmelucan", state: "Puebla" },
  
  // Guanajuato
  { name: "León", state: "Guanajuato" },
  { name: "Irapuato", state: "Guanajuato" },
  { name: "Celaya", state: "Guanajuato" },
  { name: "Salamanca", state: "Guanajuato" },
  { name: "Guanajuato", state: "Guanajuato" },
  
  // Chihuahua
  { name: "Juárez", state: "Chihuahua" },
  { name: "Chihuahua", state: "Chihuahua" },
  
  // Baja California
  { name: "Tijuana", state: "Baja California" },
  { name: "Mexicali", state: "Baja California" },
  { name: "Ensenada", state: "Baja California" },
  
  // Sonora
  { name: "Hermosillo", state: "Sonora" },
  { name: "Ciudad Obregón", state: "Sonora" },
  
  // Tamaulipas
  { name: "Reynosa", state: "Tamaulipas" },
  { name: "Matamoros", state: "Tamaulipas" },
  { name: "Nuevo Laredo", state: "Tamaulipas" },
  { name: "Tampico", state: "Tamaulipas" },
  
  // Veracruz
  { name: "Veracruz", state: "Veracruz" },
  { name: "Xalapa", state: "Veracruz" },
  { name: "Coatzacoalcos", state: "Veracruz" },
  
  // Yucatán
  { name: "Mérida", state: "Yucatán" },
  
  // Quintana Roo
  { name: "Cancún", state: "Quintana Roo" },
  { name: "Playa del Carmen", state: "Quintana Roo" },
  { name: "Cozumel", state: "Quintana Roo" },
  
  // Oaxaca
  { name: "Oaxaca de Juárez", state: "Oaxaca" },
  
  // Michoacán
  { name: "Morelia", state: "Michoacán" },
  { name: "Uruapan", state: "Michoacán" },
  
  // Sinaloa
  { name: "Culiacán", state: "Sinaloa" },
  { name: "Mazatlán", state: "Sinaloa" },
  
  // Coahuila
  { name: "Saltillo", state: "Coahuila" },
  { name: "Torreón", state: "Coahuila" },
  
  // San Luis Potosí
  { name: "San Luis Potosí", state: "San Luis Potosí" },
  
  // Querétaro
  { name: "Querétaro", state: "Querétaro" },
  
  // Hidalgo
  { name: "Pachuca", state: "Hidalgo" },
  
  // Morelos
  { name: "Cuernavaca", state: "Morelos" },
  
  // Aguascalientes
  { name: "Aguascalientes", state: "Aguascalientes" },
  
  // Tlaxcala
  { name: "Tlaxcala", state: "Tlaxcala" },
  
  // Durango
  { name: "Durango", state: "Durango" },
  
  // Zacatecas
  { name: "Zacatecas", state: "Zacatecas" },
  
  // Tabasco
  { name: "Villahermosa", state: "Tabasco" },
  
  // Chiapas
  { name: "Tuxtla Gutiérrez", state: "Chiapas" },
  { name: "Tapachula", state: "Chiapas" },
  
  // Campeche
  { name: "Campeche", state: "Campeche" },
  
  // Colima
  { name: "Colima", state: "Colima" },
  { name: "Manzanillo", state: "Colima" },
  
  // Nayarit
  { name: "Tepic", state: "Nayarit" },
  
  // Baja California Sur
  { name: "La Paz", state: "Baja California Sur" },
  { name: "Los Cabos", state: "Baja California Sur" },
];

export async function addMexicanMunicipalities() {
  try {
    console.log("Agregando municipios de México...");

    for (const municipalityData of MEXICAN_MUNICIPALITIES) {
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

    console.log("Municipios de México agregados exitosamente.");
  } catch (error) {
    console.error("Error al agregar municipios de México:", error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  addMexicanMunicipalities().catch(console.error);
}