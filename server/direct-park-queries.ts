// direct-park-queries.ts
import { pool } from './db';

// Función para obtener la lista de parques
export async function getParksDirectly(filters?: any) {
  try {
    // Construir la consulta SQL básica
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
    
    // Añadir filtros si existen
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
    
    // Ordenar por nombre
    queryStr += ` ORDER BY name`;
    
    // Ejecutar la consulta
    const result = await pool.query(queryStr, params);
    
    // Transformar los resultados
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

// Función para obtener un parque específico con todos sus datos relacionados
export async function getParkByIdDirectly(parkId: number) {
  try {
    console.log("Consultando parque con ID:", parkId);

    // Verificación simple para asegurar que el ID es válido
    if (!parkId || isNaN(parkId)) {
      console.error("ID de parque inválido:", parkId);
      return null;
    }
    
    // Obtener datos básicos del parque - Usando try/catch individual para cada consulta
    let park;
    try {
      const parkResult = await pool.query(`
        SELECT 
          id, name, municipality_id as "municipalityId", 
          park_type as "parkType", description, address, 
          postal_code as "postalCode", latitude, longitude, 
          area, foundation_year as "foundationYear",
          administrator, conservation_status as "conservationStatus",
          regulation_url as "regulationUrl", opening_hours as "openingHours", 
          contact_email as "contactEmail", contact_phone as "contactPhone"
        FROM parks
        WHERE id = $1
      `, [parkId]);
      
      console.log("Resultados de la consulta de parque:", parkResult.rowCount);
      
      if (parkResult.rowCount === 0) {
        return null;
      }
      
      park = parkResult.rows[0];
      console.log("Datos básicos del parque obtenidos:", park.name);
    } catch (err) {
      console.error("Error al obtener datos básicos del parque:", err);
      // Si falla esta consulta esencial, retornamos null
      return null;
    }
    
    // Inicializamos las propiedades que iremos rellenando
    const extendedPark = {
      ...park,
      createdAt: new Date(),
      updatedAt: new Date(),
      active: true,
      surfaceArea: park.area || null,
      closingHours: null,
      mainImageUrl: null,
      amenities: [],
      images: [],
      documents: [],
      activities: [],
      trees: {
        total: 0,
        byHealth: {
          'Bueno': 0,
          'Regular': 0,
          'Malo': 0,
          'Desconocido': 0
        },
        bySpecies: {}
      }
    };
    
    // Obtener amenidades del parque
    try {
      const amenitiesResult = await pool.query(`
        SELECT a.id, a.name, a.icon, a.category, a.icon_type as "iconType", a.custom_icon_url as "customIconUrl"
        FROM amenities a
        JOIN park_amenities pa ON a.id = pa.amenity_id
        WHERE pa.park_id = $1
      `, [parkId]);
      
      console.log("Amenidades encontradas:", amenitiesResult.rowCount);
      extendedPark.amenities = amenitiesResult.rows || [];
    } catch (err) {
      console.error("Error al obtener amenidades:", err);
      // Continuamos con el resto de consultas aunque esta falle
    }
    
    // Obtener imágenes del parque
    try {
      const imagesResult = await pool.query(`
        SELECT id, park_id as "parkId", image_url as "imageUrl", is_primary as "isPrimary", 
               position, description, caption
        FROM park_images
        WHERE park_id = $1
        ORDER BY is_primary DESC, position ASC
      `, [parkId]);
      
      console.log("Imágenes encontradas:", imagesResult.rowCount);
      extendedPark.images = imagesResult.rows || [];
      
      // Encontrar la imagen principal, si existe
      const mainImage = extendedPark.images.find((img: any) => img.isPrimary);
      if (mainImage) {
        extendedPark.mainImageUrl = mainImage.imageUrl;
      }
    } catch (err) {
      console.error("Error al obtener imágenes:", err);
    }
    
    // Obtener documentos del parque
    try {
      const documentsResult = await pool.query(`
        SELECT id, park_id as "parkId", name, file_url as "fileUrl", 
               file_type as "fileType", description, uploaded_at as "uploadedAt"
        FROM park_documents
        WHERE park_id = $1
      `, [parkId]);
      
      console.log("Documentos encontrados:", documentsResult.rowCount);
      extendedPark.documents = documentsResult.rows || [];
    } catch (err) {
      console.error("Error al obtener documentos:", err);
    }
    
    // Obtener actividades del parque
    try {
      const activitiesResult = await pool.query(`
        SELECT id, park_id as "parkId", title, description, activity_type as "activityType", 
               start_date as "startDate", end_date as "endDate", capacity, 
               instructor_id as "instructorId", status, image_url as "imageUrl"
        FROM activities
        WHERE park_id = $1
        ORDER BY start_date DESC
      `, [parkId]);
      
      console.log("Actividades encontradas:", activitiesResult.rowCount);
      extendedPark.activities = activitiesResult.rows || [];
    } catch (err) {
      console.error("Error al obtener actividades:", err);
    }
    
    // Contar árboles del parque para estadísticas básicas
    try {
      const treeStatsResult = await pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN health_condition = 'Bueno' THEN 1 END) as good,
          COUNT(CASE WHEN health_condition = 'Regular' THEN 1 END) as regular,
          COUNT(CASE WHEN health_condition = 'Malo' THEN 1 END) as bad,
          COUNT(CASE WHEN health_condition IS NULL OR health_condition = '' THEN 1 END) as unknown
        FROM trees
        WHERE park_id = $1
      `, [parkId]);
      
      console.log("Estadísticas de árboles obtenidas:", treeStatsResult.rows[0]?.total || 0);
      
      if (treeStatsResult.rows && treeStatsResult.rows.length > 0) {
        extendedPark.trees = {
          total: parseInt(treeStatsResult.rows[0]?.total || '0'),
          byHealth: {
            'Bueno': parseInt(treeStatsResult.rows[0]?.good || '0'),
            'Regular': parseInt(treeStatsResult.rows[0]?.regular || '0'),
            'Malo': parseInt(treeStatsResult.rows[0]?.bad || '0'),
            'Desconocido': parseInt(treeStatsResult.rows[0]?.unknown || '0')
          },
          bySpecies: {}
        };
      }
    } catch (err) {
      console.error("Error al obtener estadísticas de árboles:", err);
    }
    
    console.log("Preparando objeto de parque extendido");
    return extendedPark;
  } catch (error) {
    console.error("Error global al obtener parque:", error);
    throw error;
  }
}