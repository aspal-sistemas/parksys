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
      const result = await db.execute(`
        SELECT * FROM users WHERE email = $1
      `, [email]);
      return result.rows && result.rows.length > 0 ? result.rows[0] : undefined;
    } catch (error) {
      console.error("Error al obtener usuario por email:", error);
      return undefined;
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
      // Construir consulta base para obtener activos
      let queryStr = `
        SELECT a.id, a.name, a.description, a.serial_number as "serialNumber", 
               a.category_id as "categoryId", a.park_id as "parkId", 
               a.location_description as "locationDescription", a.latitude, a.longitude,
               a.acquisition_date as "acquisitionDate", a.acquisition_cost as "acquisitionCost",
               a.current_value as "currentValue", a.manufacturer, a.model, a.status, a.condition,
               a.maintenance_frequency as "maintenanceFrequency", 
               a.last_maintenance_date as "lastMaintenanceDate",
               a.next_maintenance_date as "nextMaintenanceDate",
               a.expected_lifespan as "expectedLifespan", a.notes, 
               a.qr_code as "qrCode", a.responsible_person_id as "responsiblePersonId",
               a.created_at as "createdAt", a.updated_at as "updatedAt",
               c.name as "categoryName", c.icon as "categoryIcon", c.color as "categoryColor",
               p.name as "parkName"
        FROM assets a
        LEFT JOIN asset_categories c ON a.category_id = c.id
        LEFT JOIN parks p ON a.park_id = p.id
        WHERE 1=1
      `;
      
      const params: any[] = [];
      let paramIndex = 1;
      
      // Aplicar filtros si se proporcionan
      if (filters) {
        if (filters.categoryId !== undefined) {
          queryStr += ` AND a.category_id = $${paramIndex++}`;
          params.push(filters.categoryId);
        }
        
        if (filters.parkId !== undefined) {
          queryStr += ` AND a.park_id = $${paramIndex++}`;
          params.push(filters.parkId);
        }
        
        if (filters.status) {
          queryStr += ` AND a.status = $${paramIndex++}`;
          params.push(filters.status);
        }
        
        if (filters.condition) {
          queryStr += ` AND a.condition = $${paramIndex++}`;
          params.push(filters.condition);
        }
        
        if (filters.search) {
          queryStr += ` AND (
            a.name ILIKE $${paramIndex} OR
            COALESCE(a.description, '') ILIKE $${paramIndex} OR
            COALESCE(a.serial_number, '') ILIKE $${paramIndex} OR
            COALESCE(a.model, '') ILIKE $${paramIndex} OR
            COALESCE(a.manufacturer, '') ILIKE $${paramIndex}
          )`;
          params.push(`%${filters.search}%`);
          paramIndex++;
        }
        
        if (filters.maintenanceDue === 'true') {
          queryStr += ` AND a.next_maintenance_date <= CURRENT_DATE`;
        }
      }
      
      // Ordenar resultados
      queryStr += ` ORDER BY a.name`;
      
      const result = await db.execute(queryStr, params);
      
      // Añadir propiedades adicionales para compatibilidad con frontend
      return (result.rows || []).map(asset => ({
        ...asset,
        photos: asset.photos || [],
        documents: asset.documents || [],
        // Añadir iconType para compatibilidad
        categoryIconType: "system",
        categoryCustomIconUrl: null
      }));
    } catch (error) {
      console.error("Error al obtener activos:", error);
      return [];
    }
  }
  
  async getAsset(id: number): Promise<any> {
    try {
      const result = await db.execute(`
        SELECT a.id, a.name, a.description, a.serial_number as "serialNumber", 
               a.category_id as "categoryId", a.park_id as "parkId", 
               a.location_description as "locationDescription", a.latitude, a.longitude,
               a.acquisition_date as "acquisitionDate", a.acquisition_cost as "acquisitionCost",
               a.current_value as "currentValue", a.manufacturer, a.model, a.status, a.condition,
               a.maintenance_frequency as "maintenanceFrequency", 
               a.last_maintenance_date as "lastMaintenanceDate",
               a.next_maintenance_date as "nextMaintenanceDate",
               a.expected_lifespan as "expectedLifespan", a.notes, 
               a.qr_code as "qrCode", a.responsible_person_id as "responsiblePersonId",
               a.created_at as "createdAt", a.updated_at as "updatedAt",
               c.name as "categoryName", c.icon as "categoryIcon", c.color as "categoryColor",
               p.name as "parkName"
        FROM assets a
        LEFT JOIN asset_categories c ON a.category_id = c.id
        LEFT JOIN parks p ON a.park_id = p.id
        WHERE a.id = $1
      `, [id]);
      
      if (result.rows && result.rows.length > 0) {
        // Añadir propiedades adicionales para compatibilidad con frontend
        return {
          ...result.rows[0],
          photos: result.rows[0].photos || [],
          documents: result.rows[0].documents || [],
          // Añadir iconType para compatibilidad
          categoryIconType: "system",
          categoryCustomIconUrl: null
        };
      }
      
      return undefined;
    } catch (error) {
      console.error(`Error al obtener activo ${id}:`, error);
      return undefined;
    }
  }
}

// Exportar instancia para uso en la aplicación
export const storage = new DatabaseStorage();