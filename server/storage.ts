import { db } from './db';
import { eq, sql } from "drizzle-orm";
import * as schema from "@shared/schema";

const {
  users,
  municipalities,
  parks,
  parkAmenities,
  amenities,
  trees,
  treeMaintenances,
  activities,
  incidents,
  parkImages,
  assets,
  volunteers,
  instructors,
  evaluations,
  documents
} = schema;

// Definición simplificada para almacenamiento
export interface IStorage {
  getParks(filters?: any): Promise<any[]>;
  getExtendedParks(filters?: any): Promise<any[]>;
  getPark(id: number): Promise<any>;
  updatePark(id: number, data: any): Promise<any>;
  deletePark(id: number): Promise<boolean>;
  getMunicipalities(): Promise<any[]>;
  getAmenities(): Promise<any[]>;
  getUser(id: number): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  getUsers(): Promise<any[]>;
  getUserByEmail(email: string): Promise<any>;
  createUser(userData: any): Promise<any>;
  updateUser(id: number, userData: any): Promise<any>;
  deleteUser(id: number): Promise<boolean>;
  getAssetCategories(): Promise<any[]>;
  getAssetCategory(id: number): Promise<any>;
  getCategoryAssets(categoryId: number): Promise<any[]>;
  createAssetCategory(category: any): Promise<any>;
  updateAssetCategory(id: number, category: any): Promise<any>;
  deleteAssetCategory(id: number): Promise<boolean>;
  getAssets(filters?: any): Promise<any[]>;
  getAsset(id: number): Promise<any>;
  getParkAmenities(parkId: number): Promise<any[]>;
  addAmenityToPark(data: any): Promise<any>;
  removeAmenityFromPark(parkId: number, amenityId: number): Promise<boolean>;
  isAmenityInUse(amenityId: number): Promise<boolean>;
  deleteAmenity(amenityId: number): Promise<boolean>;
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

  async getParkDependencies(parkId: number): Promise<{
    trees: number;
    treeMaintenances: number;
    activities: number;
    incidents: number;
    amenities: number;
    images: number;
    assets: number;
    volunteers: number;
    instructors: number;
    evaluations: number;
    documents: number;
    total: number;
  }> {
    try {
      // Usar consultas SQL directas para mayor compatibilidad
      const results = await db.execute(sql`
        SELECT 
          (SELECT COUNT(*) FROM trees WHERE park_id = ${parkId}) as trees,
          (SELECT COUNT(*) FROM tree_maintenances WHERE park_id = ${parkId}) as tree_maintenances,
          (SELECT COUNT(*) FROM activities WHERE park_id = ${parkId}) as activities,
          (SELECT COUNT(*) FROM incidents WHERE park_id = ${parkId}) as incidents,
          (SELECT COUNT(*) FROM park_amenities WHERE park_id = ${parkId}) as amenities,
          (SELECT COUNT(*) FROM park_images WHERE park_id = ${parkId}) as images,
          (SELECT COUNT(*) FROM assets WHERE park_id = ${parkId}) as assets,
          (SELECT COUNT(*) FROM volunteers WHERE preferred_park_id = ${parkId}) as volunteers,
          (SELECT COUNT(*) FROM instructors WHERE preferred_park_id = ${parkId}) as instructors,
          (SELECT COUNT(*) FROM evaluations WHERE park_id = ${parkId}) as evaluations,
          (SELECT COUNT(*) FROM documents WHERE park_id = ${parkId}) as documents
      `);
      
      const row = results.rows[0] as any;
      
      const dependencies = {
        trees: parseInt(row.trees) || 0,
        treeMaintenances: parseInt(row.tree_maintenances) || 0,
        activities: parseInt(row.activities) || 0,
        incidents: parseInt(row.incidents) || 0,
        amenities: parseInt(row.amenities) || 0,
        images: parseInt(row.images) || 0,
        assets: parseInt(row.assets) || 0,
        volunteers: parseInt(row.volunteers) || 0,
        instructors: parseInt(row.instructors) || 0,
        evaluations: parseInt(row.evaluations) || 0,
        documents: parseInt(row.documents) || 0,
        total: 0
      };
      
      dependencies.total = Object.values(dependencies).reduce((sum, count) => sum + count, 0) - dependencies.total;
      return dependencies;
    } catch (error) {
      console.error("Error obteniendo dependencias del parque:", error);
      // Retornar valores por defecto en caso de error
      return {
        trees: 0,
        treeMaintenances: 0,
        activities: 0,
        incidents: 0,
        amenities: 0,
        images: 0,
        assets: 0,
        volunteers: 0,
        instructors: 0,
        evaluations: 0,
        documents: 0,
        total: 0
      };
    }
  }

  async deleteParkWithDependencies(id: number): Promise<boolean> {
    try {
      console.log(`Iniciando eliminación completa del parque ${id} con todas sus dependencias`);
      
      // Usar transacción SQL directa para mayor control
      await db.execute(sql`
        BEGIN;
        
        -- Eliminar en orden de dependencias (de más específico a más general)
        DELETE FROM tree_maintenances WHERE park_id = ${id};
        DELETE FROM trees WHERE park_id = ${id};
        DELETE FROM evaluations WHERE park_id = ${id};
        DELETE FROM documents WHERE park_id = ${id};
        DELETE FROM park_amenities WHERE park_id = ${id};
        DELETE FROM park_images WHERE park_id = ${id};
        DELETE FROM activities WHERE park_id = ${id};
        DELETE FROM incidents WHERE park_id = ${id};
        DELETE FROM assets WHERE park_id = ${id};
        
        -- Actualizar referencias de voluntarios e instructores (no eliminar usuarios)
        UPDATE volunteers SET preferred_park_id = NULL WHERE preferred_park_id = ${id};
        UPDATE instructors SET preferred_park_id = NULL WHERE preferred_park_id = ${id};
        
        -- Finalmente eliminar el parque
        DELETE FROM parks WHERE id = ${id};
        
        COMMIT;
      `);
      
      console.log(`Parque ${id} y todas sus dependencias eliminados exitosamente`);
      return true;
    } catch (error) {
      console.error("Error al eliminar parque con dependencias:", error);
      // Intentar rollback en caso de error
      try {
        await db.execute(sql`ROLLBACK;`);
      } catch (rollbackError) {
        console.error("Error en rollback:", rollbackError);
      }
      return false;
    }
  }

  async deletePark(id: number): Promise<boolean> {
    // Usar la nueva función que maneja dependencias
    return this.deleteParkWithDependencies(id);
  }

  async removeAmenityFromPark(parkId: number, amenityId: number): Promise<boolean> {
    try {
      const result = await db.delete(parkAmenities)
        .where(sql`park_id = ${parkId} AND amenity_id = ${amenityId}`);
      return true;
    } catch (error) {
      console.error("Error al remover amenidad del parque:", error);
      return false;
    }
  }

  async isAmenityInUse(amenityId: number): Promise<boolean> {
    try {
      const [result] = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM park_amenities 
        WHERE amenity_id = ${amenityId}
      `);
      const count = Number(result.count || 0);
      console.log(`Amenidad ${amenityId} está siendo usada en ${count} parques`);
      return count > 0;
    } catch (error) {
      console.error("Error al verificar uso de amenidad:", error);
      return true; // Por seguridad, asumimos que está en uso si hay error
    }
  }

  async deleteAmenity(amenityId: number): Promise<boolean> {
    try {
      const result = await db.delete(amenities)
        .where(eq(amenities.id, amenityId));
      console.log(`Amenidad ${amenityId} eliminada exitosamente`);
      return true;
    } catch (error) {
      console.error("Error al eliminar amenidad:", error);
      return false;
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

  async updateUser(id: number, userData: any): Promise<any> {
    try {
      const [updatedUser] = await db.update(users)
        .set({
          ...userData,
          updatedAt: new Date()
        })
        .where(eq(users.id, id))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error(`Error al actualizar usuario ${id}:`, error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const result = await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error(`Error al eliminar usuario ${id}:`, error);
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
  
  async getPark(id: number): Promise<any> {
    try {
      const result = await db.select().from(parks).where(eq(parks.id, id));
      return result[0] || null;
    } catch (error) {
      console.error("Error al obtener parque:", error);
      return null;
    }
  }

  async updatePark(id: number, data: any): Promise<any> {
    try {
      const result = await db.update(parks)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(parks.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error("Error al actualizar parque:", error);
      throw error;
    }
  }

  async getMunicipalities(): Promise<any[]> {
    try {
      console.log("Obteniendo municipios...");
      const result = await db.select().from(municipalities);
      console.log("Municipios encontrados:", result);
      return result || [];
    } catch (error) {
      console.error("Error al obtener municipios:", error);
      return [];
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

  async getParkAmenities(parkId: number): Promise<any[]> {
    try {
      const result = await db.execute(`
        SELECT 
          pa.id,
          pa.park_id as "parkId",
          pa.amenity_id as "amenityId",
          pa.quantity,
          pa.description,
          a.name as "amenityName",
          a.icon as "amenityIcon"
        FROM park_amenities pa
        JOIN amenities a ON pa.amenity_id = a.id
        WHERE pa.park_id = $1
        ORDER BY a.name
      `, [parkId]);
      
      return result.rows || [];
    } catch (error) {
      console.error(`Error al obtener amenidades del parque ${parkId}:`, error);
      return [];
    }
  }

  async addAmenityToPark(data: any): Promise<any> {
    try {
      const result = await db.insert(parkAmenities).values({
        parkId: data.parkId,
        amenityId: data.amenityId,
        quantity: data.quantity || 1,
        description: data.description || ''
      }).returning();
      
      return result[0];
    } catch (error) {
      console.error("Error al agregar amenidad al parque:", error);
      throw error;
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