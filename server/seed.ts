import { db } from "./db";
import { 
  users, municipalities, parks, amenities, parkAmenities, DEFAULT_AMENITIES 
} from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Inicializa datos por defecto en la base de datos
 */
export async function seedDatabase() {
  console.log("Inicializando datos en la base de datos...");
  
  // Verificar si ya existen amenidades
  const existingAmenities = await db.select().from(amenities);
  
  // Si no hay amenidades, insertar las predeterminadas
  if (existingAmenities.length === 0) {
    console.log("Insertando amenidades predeterminadas...");
    
    await db.insert(amenities).values(DEFAULT_AMENITIES);
    
    console.log(`${DEFAULT_AMENITIES.length} amenidades insertadas correctamente.`);
  } else {
    console.log(`Ya existen ${existingAmenities.length} amenidades en la base de datos.`);
  }
  
  // Verificar si existe un municipio predeterminado
  const existingMunicipalities = await db.select().from(municipalities);
  
  // Si no hay municipios, crear uno predeterminado
  if (existingMunicipalities.length === 0) {
    console.log("Creando municipio de ejemplo...");
    
    const [cdmx] = await db.insert(municipalities).values({
      name: "Ciudad de México",
      state: "Ciudad de México",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Logo_CDMX.png/240px-Logo_CDMX.png",
      active: true
    }).returning();
    
    console.log(`Municipio ${cdmx.name} creado correctamente.`);
    
    // Crear usuario administrador para este municipio
    const existingUsers = await db.select().from(users).where(eq(users.username, "admin"));
    
    if (existingUsers.length === 0) {
      console.log("Creando usuario administrador...");
      
      await db.insert(users).values({
        username: "admin",
        password: "admin123", // En producción usar bcrypt
        fullName: "Administrador",
        email: "admin@parquesmx.com",
        role: "admin",
        municipalityId: cdmx.id
      });
      
      console.log("Usuario administrador creado correctamente.");
    }
    
    // Crear un parque de ejemplo
    console.log("Creando parque de ejemplo...");
    
    const [parqueMetropolitano] = await db.insert(parks).values({
      name: "Parque Metropolitano",
      municipalityId: cdmx.id,
      parkType: "metropolitano",
      description: "Gran parque con áreas verdes, lagos y espacios recreativos.",
      address: "Av. Principal #123, Col. Centro",
      postalCode: "01000",
      latitude: "19.432608",
      longitude: "-99.133209",
      area: "150 hectáreas",
      foundationYear: 1985,
      administrator: "Dirección de Parques y Jardines",
      conservationStatus: "bueno",
      openingHours: "Lunes a Domingo de 6:00 a 18:00",
      contactEmail: "parque.metro@cdmx.gob.mx",
      contactPhone: "55 1234 5678"
    }).returning();
    
    console.log(`Parque ${parqueMetropolitano.name} creado correctamente.`);
    
    // Verificar si ya existen amenidades asociadas al parque
    const parkAmenitiesData = await db.select().from(parkAmenities).where(eq(parkAmenities.parkId, parqueMetropolitano.id));
    
    // Si no hay amenidades asociadas, agregar algunas
    if (parkAmenitiesData.length === 0) {
      console.log("Asociando amenidades al parque...");
      
      // Obtener IDs de algunas amenidades para asociarlas
      const amenityList = await db.select().from(amenities).limit(6);
      
      // Asociar amenidades al parque
      for (const amenity of amenityList) {
        await db.insert(parkAmenities).values({
          parkId: parqueMetropolitano.id,
          amenityId: amenity.id
        });
      }
      
      console.log(`${amenityList.length} amenidades asociadas al parque correctamente.`);
    }
  } else {
    console.log(`Ya existen ${existingMunicipalities.length} municipios en la base de datos.`);
    
    // Asociar amenidades a parques existentes
    const existingParks = await db.select().from(parks);
    
    for (const park of existingParks) {
      // Verificar si ya existen amenidades asociadas al parque
      const parkAmenitiesData = await db.select().from(parkAmenities).where(eq(parkAmenities.parkId, park.id));
      
      // Si no hay amenidades asociadas, agregar algunas
      if (parkAmenitiesData.length === 0) {
        console.log(`Asociando amenidades al parque ${park.name}...`);
        
        // Obtener IDs de algunas amenidades para asociarlas
        const amenityList = await db.select().from(amenities).limit(6);
        
        // Asociar amenidades al parque
        for (const amenity of amenityList) {
          await db.insert(parkAmenities).values({
            parkId: park.id,
            amenityId: amenity.id
          });
        }
        
        console.log(`${amenityList.length} amenidades asociadas al parque ${park.name} correctamente.`);
      }
    }
  }
  
  console.log("Base de datos inicializada correctamente.");
}