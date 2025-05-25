// storage.ts
import { db } from "./db";
import { eq } from "drizzle-orm";
import * as schema from "@shared/schema";

const {
  users,
  municipalities,
  parks,
  parkAmenities,
  amenities,
  parkDocuments,
  parkImages,
  activities,
  trees,
  treeSpecies
} = schema;

// Definición simplificada para almacenamiento
export interface IStorage {
  getParks(filters?: any): Promise<any[]>;
  getExtendedParks(filters?: any): Promise<any[]>;
  getAmenities(): Promise<any[]>;
  getUser(id: number): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
}

// Implementación simplificada
export class DatabaseStorage implements IStorage {
  async getParks(filters?: any): Promise<any[]> {
    try {
      // Consulta SQL directa
      let queryStr = `
        SELECT 
          id, name, municipality_id as "municipalityId", 
          park_type as "parkType", description, address, 
          postal_code as "postalCode", latitude, longitude, 
          area, foundation_year as "foundationYear",
          administrator, conservation_status as "conservationStatus",
          regulation_url as "regulationUrl", opening_hours as "openingHours", 
          contact_email as "contactEmail", contact_phone as "contactPhone"
        FROM parks
        WHERE 1=1
      `;
      
      const params: any[] = [];
      let paramIndex = 1;
      
      if (filters) {
        if (filters.municipalityId !== undefined) {
          queryStr += ` AND municipality_id = $${paramIndex++}`;
          params.push(filters.municipalityId);
        }
        
        if (filters.parkType) {
          queryStr += ` AND park_type = $${paramIndex++}`;
          params.push(filters.parkType);
        }
        
        if (filters.postalCode) {
          queryStr += ` AND postal_code = $${paramIndex++}`;
          params.push(filters.postalCode);
        }
        
        if (filters.search) {
          queryStr += ` AND (
            name ILIKE $${paramIndex} OR
            COALESCE(description, '') ILIKE $${paramIndex} OR
            address ILIKE $${paramIndex}
          )`;
          params.push(`%${filters.search}%`);
          paramIndex++;
        }
      }
      
      queryStr += ` ORDER BY name`;
      
      const result = await db.execute(queryStr, params);
      
      return result.rows.map(park => ({
        ...park,
        createdAt: new Date(),
        updatedAt: new Date(),
        active: true,
        surfaceArea: park.area || null,
        closingHours: null,
        mainImageUrl: null
      }));
    } catch (error) {
      console.error("Error al obtener parques:", error);
      return [];
    }
  }
  
  async getExtendedParks(filters?: any): Promise<any[]> {
    try {
      const parksData = await this.getParks(filters);
      
      // Agregamos datos extendidos vacíos para compatibilidad
      return parksData.map(park => ({
        ...park,
        amenities: [],
        activities: [],
        documents: [],
        images: [],
        trees: {
          total: 0,
          bySpecies: {},
          byHealth: {
            'Bueno': 0,
            'Regular': 0,
            'Malo': 0,
            'Desconocido': 0
          }
        }
      }));
    } catch (error) {
      console.error("Error al obtener parques extendidos:", error);
      return [];
    }
  }
  
  async getAmenities(): Promise<any[]> {
    try {
      const result = await db.execute(`
        SELECT id, name, icon, category, icon_type as "iconType", custom_icon_url as "customIconUrl"
        FROM amenities
        ORDER BY name
      `);
      
      return result.rows.map(row => ({
        ...row,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
    } catch (error) {
      console.error("Error al obtener amenidades:", error);
      return [];
    }
  }
  
  async getUser(id: number): Promise<any> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      return undefined;
    }
  }
  
  async getUserByUsername(username: string): Promise<any> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error("Error al obtener usuario por nombre:", error);
      return undefined;
    }
  }
}

// Exportar instancia para uso en la aplicación
export const storage = new DatabaseStorage();