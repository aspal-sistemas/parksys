import { db } from './db';
import { eq, sql } from "drizzle-orm";
import * as schema from "@shared/schema";

const {
  users,
  municipalities,
  parks,
  parkAmenities,
  amenities
} = schema;

// Definición simplificada para almacenamiento
export interface IStorage {
  getParks(filters?: any): Promise<any[]>;
  getExtendedParks(filters?: any): Promise<any[]>;
  getAmenities(): Promise<any[]>;
  getUser(id: number): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  getUsers(): Promise<any[]>;
  getUserByEmail(email: string): Promise<any>;
  getAssetCategories(): Promise<any[]>;
  getAssetCategory(id: number): Promise<any>;
  getCategoryAssets(categoryId: number): Promise<any[]>;
  createAssetCategory(category: any): Promise<any>;
  updateAssetCategory(id: number, category: any): Promise<any>;
  deleteAssetCategory(id: number): Promise<boolean>;
  getAssets(filters?: any): Promise<any[]>;
  getAsset(id: number): Promise<any>;
}

// Implementación simplificada
export class DatabaseStorage implements IStorage {
  async getParks(filters?: any): Promise<any[]> {
    return getParksDirectly(filters);
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
    return getAmenitiesDirectly();
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
  
  async getUsers(): Promise<any[]> {
    try {
      const result = await db.execute(`
        SELECT id, username, email, role, full_name as "fullName", 
               municipality_id as "municipalityId", phone, gender, 
               birth_date as "birthDate", bio, profile_image_url as "profileImageUrl", 
               created_at as "createdAt", updated_at as "updatedAt"
        FROM users
        ORDER BY full_name
      `);
      return result.rows || [];
    } catch (error) {
      console.error("Error al obtener todos los usuarios:", error);
      return [];
    }
  }
  
  async getUserByEmail(email: string): Promise<any> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email));
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error("Error al obtener usuario por email:", error);
      return undefined;
    }
  }

  async createUser(userData: any): Promise<any> {
    try {
      const [newUser] = await db.insert(users).values({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        fullName: userData.fullName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        municipalityId: userData.municipalityId,
        phone: userData.phone || null,
        gender: userData.gender || null,
        birthDate: userData.birthDate ? new Date(userData.birthDate) : null,
        bio: userData.bio || null,
        profileImageUrl: userData.profileImageUrl || null,
        address: userData.address || null,
        emergencyContactName: userData.emergencyContactName || null,
        emergencyContactPhone: userData.emergencyContactPhone || null,
        preferredParkId: userData.preferredParkId || null,
        legalConsent: userData.legalConsent || false
      }).returning();
      return newUser;
    } catch (error) {
      console.error("Error al crear usuario:", error);
      throw error;
    }
  }

  async getParkImages(parkId: number): Promise<any[]> {
    try {
      const result = await db.execute(`
        SELECT id, park_id as "parkId", image_url as "imageUrl", is_primary as "isPrimary", caption
        FROM park_images
        WHERE park_id = $1
        ORDER BY is_primary DESC, id ASC
      `, [parkId]);
      return result.rows || [];
    } catch (error) {
      console.error("Error al obtener imágenes del parque:", error);
      return [];
    }
  }

  async getParkAmenities(parkId: number): Promise<any[]> {
    try {
      const result = await db.select({
        id: amenities.id,
        name: amenities.name,
        icon: amenities.icon,
        category: amenities.category,
        iconType: amenities.iconType,
        customIconUrl: amenities.customIconUrl
      })
      .from(amenities)
      .innerJoin(parkAmenities, eq(amenities.id, parkAmenities.amenityId))
      .where(eq(parkAmenities.parkId, parkId))
      .orderBy(amenities.name);
      
      return result || [];
    } catch (error) {
      console.error("Error al obtener amenidades del parque:", error);
      return [];
    }
  }
  
  async getAssetCategories(): Promise<any[]> {
    try {
      const result = await db.execute(`
        SELECT id, name, description, icon, color, parent_id as "parentId",
               created_at as "createdAt", updated_at as "updatedAt"
        FROM asset_categories
        ORDER BY name
      `);
      
      // Añadir propiedades predeterminadas para mantener compatibilidad con el frontend
      return (result.rows || []).map(category => ({
        ...category,
        iconType: "system",
        customIconUrl: null
      }));
    } catch (error) {
      console.error("Error al obtener categorías de activos:", error);
      return [];
    }
  }
  
  async getAssetCategory(id: number): Promise<any> {
    try {
      const result = await db.execute(`
        SELECT id, name, description, icon, color, parent_id as "parentId",
               created_at as "createdAt", updated_at as "updatedAt"
        FROM asset_categories
        WHERE id = $1
      `, [id]);
      
      if (result.rows && result.rows.length > 0) {
        // Añadir propiedades predeterminadas para mantener compatibilidad con el frontend
        return {
          ...result.rows[0],
          iconType: "system",
          customIconUrl: null
        };
      }
      
      return undefined;
    } catch (error) {
      console.error(`Error al obtener categoría de activo ${id}:`, error);
      return undefined;
    }
  }
  
  async getCategoryAssets(categoryId: number): Promise<any[]> {
    try {
      const result = await db.execute(`
        SELECT id, name
        FROM assets
        WHERE category_id = $1
      `, [categoryId]);
      return result.rows || [];
    } catch (error) {
      console.error(`Error al obtener activos de la categoría ${categoryId}:`, error);
      return [];
    }
  }
  
  async createAssetCategory(category: any): Promise<any> {
    try {
      const { name, description, icon, iconType, customIconUrl, color } = category;
      const result = await db.execute(`
        INSERT INTO asset_categories (
          name, description, icon, icon_type, custom_icon_url, color, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, NOW(), NOW()
        ) RETURNING id, name, description, icon, icon_type as "iconType", 
                   custom_icon_url as "customIconUrl", color,
                   created_at as "createdAt", updated_at as "updatedAt"
      `, [name, description, icon, iconType, customIconUrl, color]);
      
      return result.rows[0];
    } catch (error) {
      console.error("Error al crear categoría de activo:", error);
      throw error;
    }
  }
  
  async updateAssetCategory(id: number, category: any): Promise<any> {
    try {
      // Construir query dinámica para actualizar solo los campos proporcionados
      let setClause = [];
      let params = [];
      let paramIndex = 1;
      
      if (category.name !== undefined) {
        setClause.push(`name = $${paramIndex++}`);
        params.push(category.name);
      }
      
      if (category.description !== undefined) {
        setClause.push(`description = $${paramIndex++}`);
        params.push(category.description);
      }
      
      if (category.icon !== undefined) {
        setClause.push(`icon = $${paramIndex++}`);
        params.push(category.icon);
      }
      
      if (category.iconType !== undefined) {
        setClause.push(`icon_type = $${paramIndex++}`);
        params.push(category.iconType);
      }
      
      if (category.customIconUrl !== undefined) {
        setClause.push(`custom_icon_url = $${paramIndex++}`);
        params.push(category.customIconUrl);
      }
      
      if (category.color !== undefined) {
        setClause.push(`color = $${paramIndex++}`);
        params.push(category.color);
      }
      
      setClause.push(`updated_at = NOW()`);
      
      if (setClause.length === 0) {
        return this.getAssetCategory(id); // No hay nada que actualizar
      }
      
      // Agregar el ID como último parámetro
      params.push(id);
      
      const result = await db.execute(`
        UPDATE asset_categories
        SET ${setClause.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, name, description, icon, icon_type as "iconType", 
                 custom_icon_url as "customIconUrl", color,
                 created_at as "createdAt", updated_at as "updatedAt"
      `, params);
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error al actualizar categoría de activo ${id}:`, error);
      throw error;
    }
  }
  
  async deleteAssetCategory(id: number): Promise<boolean> {
    try {
      const result = await db.execute(`
        DELETE FROM asset_categories
        WHERE id = $1
        RETURNING id
      `, [id]);
      
      return result.rows && result.rows.length > 0;
    } catch (error) {
      console.error(`Error al eliminar categoría de activo ${id}:`, error);
      return false;
    }
  }
  
  async getAssets(filters?: any): Promise<any[]> {
    try {
      // Consulta SQL
      return [];
    } catch (error) {
      console.error("Error al obtener activos:", error);
      return [];
    }
  }
  
  async getAsset(id: number): Promise<any> {
    try {
      // Consulta SQL
      return null;
    } catch (error) {
      console.error(`Error al obtener activo ${id}:`, error);
      return undefined;
    }
  }
}

export const storage = new DatabaseStorage();

// Consulta directa para obtener parques sin usar el storage
export async function getParksDirectly(filters?: {
  municipalityId?: number;
  parkType?: string;
  postalCode?: string;
  search?: string;
}) {
  try {
    // Construimos la consulta SQL básica
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
    
    // Añadimos filtros si existen
    if (filters?.municipalityId !== undefined) {
      queryStr += ` AND municipality_id = $${paramIndex++}`;
      params.push(filters.municipalityId);
    }
    
    if (filters?.parkType) {
      queryStr += ` AND park_type = $${paramIndex++}`;
      params.push(filters.parkType);
    }
    
    if (filters?.postalCode) {
      queryStr += ` AND postal_code = $${paramIndex++}`;
      params.push(filters.postalCode);
    }
    
    if (filters?.search) {
      queryStr += ` AND (
        name ILIKE $${paramIndex} OR
        COALESCE(description, '') ILIKE $${paramIndex} OR
        address ILIKE $${paramIndex}
      )`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }
    
    // Ordenar por nombre
    queryStr += ` ORDER BY name`;
    
    // Ejecutar la consulta
    const result = await db.execute(queryStr, params);
    
    // Transformar los resultados
    return result.rows.map(park => ({
      ...park,
      // Añadimos estos campos para compatibilidad con la interfaz esperada
      createdAt: new Date(),
      updatedAt: new Date(),
      active: true,
      surfaceArea: park.area || null,
      closingHours: null,
      mainImageUrl: null,
      // Añadimos estructuras vacías para los datos relacionados
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
    console.error("Error en getParksDirectly:", error);
    return [];
  }
}

// Consulta directa para obtener amenidades sin usar el storage
export async function getAmenitiesDirectly() {
  try {
    // Consulta SQL directa
    const result = await db.execute(`
      SELECT id, name, icon, category, icon_type as "iconType", custom_icon_url as "customIconUrl"
      FROM amenities
      ORDER BY name
    `);
    
    // Añadimos campos requeridos por el frontend
    return result.rows.map(amenity => ({
      ...amenity,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  } catch (error) {
    console.error("Error en getAmenitiesDirectly:", error);
    return [];
  }
}