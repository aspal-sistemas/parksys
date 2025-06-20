import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import { parks, amenities, parkAmenities } from "@shared/schema";
import { eq } from 'drizzle-orm';

neonConfig.webSocketConstructor = ws;

/**
 * Sistema robusto de recuperación de datos originales de la base de datos
 */
export class DatabaseRecovery {
  private static instance: DatabaseRecovery;
  private pool: Pool | null = null;
  private cachedParks: any[] | null = null;
  private lastSuccessfulFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  static getInstance(): DatabaseRecovery {
    if (!DatabaseRecovery.instance) {
      DatabaseRecovery.instance = new DatabaseRecovery();
    }
    return DatabaseRecovery.instance;
  }

  private async getConnection() {
    if (!this.pool) {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 3000,
        idleTimeoutMillis: 10000,
        max: 5
      });
    }
    return this.pool;
  }

  private async executeWithRetry<T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Intento ${attempt}/${maxRetries} de conexión a BD...`);
        const result = await Promise.race([
          operation(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout de operación')), 10000)
          )
        ]);
        
        console.log(`✓ Conexión exitosa en intento ${attempt}`);
        return result;
      } catch (error: any) {
        lastError = error;
        console.log(`✗ Intento ${attempt} falló:`, error?.message || 'Error desconocido');
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`Esperando ${delay}ms antes del siguiente intento...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  async recoverAllParks(): Promise<any[]> {
    // Usar caché si está disponible y es reciente
    const now = Date.now();
    if (this.cachedParks && (now - this.lastSuccessfulFetch) < this.CACHE_DURATION) {
      console.log(`Usando datos en caché (${this.cachedParks.length} parques)`);
      return this.cachedParks;
    }

    try {
      const pool = await this.getConnection();
      const db = drizzle(pool, { schema: { parks, amenities, parkAmenities } });

      const allParks = await this.executeWithRetry(async () => {
        const parksData = await db.select().from(parks);
        
        // Enriquecer con amenidades
        const enrichedParks = parksData.map(park => ({
          ...park,
          amenities: [] as any[]
        }));
        
        for (const park of enrichedParks) {
          try {
            const parkAmenitiesData = await db
              .select({
                amenity: amenities
              })
              .from(parkAmenities)
              .innerJoin(amenities, eq(parkAmenities.amenityId, amenities.id))
              .where(eq(parkAmenities.parkId, park.id));
            
            park.amenities = parkAmenitiesData.map(pa => pa.amenity);
          } catch (amenityError: any) {
            console.log(`Error obteniendo amenidades para parque ${park.id}:`, amenityError?.message || 'Error desconocido');
            park.amenities = [];
          }
        }
        
        return enrichedParks;
      });

      // Actualizar caché
      this.cachedParks = allParks;
      this.lastSuccessfulFetch = now;
      
      console.log(`✓ Recuperados ${allParks.length} parques de la base de datos original`);
      
      // Mostrar resumen de los parques recuperados
      if (allParks.length > 0) {
        console.log("Parques recuperados:");
        allParks.slice(0, Math.min(5, allParks.length)).forEach((park, index) => {
          console.log(`${index + 1}. ${park.name} (${park.parkType}) - ${park.amenities?.length || 0} amenidades`);
        });
        
        if (allParks.length > 5) {
          console.log(`... y ${allParks.length - 5} parques más`);
        }
      }
      
      return allParks;
    } catch (error: any) {
      console.error("Error en recuperación de base de datos:", error?.message || 'Error desconocido');
      
      // Si tenemos caché, usarlo aunque sea viejo
      if (this.cachedParks && this.cachedParks.length > 0) {
        console.log(`Usando caché expirado (${this.cachedParks.length} parques)`);
        return this.cachedParks;
      }
      
      throw new Error(`No se pudo recuperar datos de la base de datos: ${error?.message || 'Error desconocido'}`);
    }
  }

  async cleanup() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

// Exportar instancia singleton
export const databaseRecovery = DatabaseRecovery.getInstance();