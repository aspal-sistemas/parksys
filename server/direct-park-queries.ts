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
        contact_email as "contactEmail", contact_phone as "contactPhone",
        video_url as "videoUrl"
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
    
    // Crear array para almacenar los parques con sus imágenes
    const parksWithImages = [];
    
    // Procesar cada parque para añadir sus imágenes
    for (const park of result.rows) {
      // Buscar imágenes para este parque
      let primaryImage = null;
      
      try {
        // Verificar si la tabla park_images existe
        const tableExists = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'park_images'
          ) as exists
        `);
        
        if (tableExists.rows[0].exists) {
          // Obtener la imagen principal del parque
          const imageQuery = `
            SELECT image_url 
            FROM park_images 
            WHERE park_id = $1
            ORDER BY is_primary DESC
            LIMIT 1
          `;
          
          const imageResult = await pool.query(imageQuery, [park.id]);
          
          if (imageResult.rows.length > 0) {
            primaryImage = imageResult.rows[0].image_url;
          }
        }
      } catch (err) {
        console.error(`Error al obtener imagen para parque ${park.id}:`, err);
      }
      
      // Obtener amenidades del parque
      let amenities = [];
      try {
        // Verificar si la tabla park_amenities existe
        const amenitiesTableExists = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'park_amenities'
          ) as exists
        `);
        
        if (amenitiesTableExists.rows[0].exists) {
          // Consultamos las amenidades relacionadas con este parque
          const amenitiesQuery = `
            SELECT a.id, a.name, a.icon, a.custom_icon_url as "customIconUrl"
            FROM amenities a
            INNER JOIN park_amenities pa ON a.id = pa.amenity_id
            WHERE pa.park_id = $1
          `;
          
          const amenitiesResult = await pool.query(amenitiesQuery, [park.id]);
          amenities = amenitiesResult.rows || [];
        }
      } catch (err) {
        console.error(`Error al obtener amenidades para parque ${park.id}:`, err);
      }

      // Agregar el parque con su imagen y amenidades al array
      parksWithImages.push({
        ...park,
        createdAt: new Date(),
        updatedAt: new Date(),
        active: true,
        surfaceArea: park.area || null,
        closingHours: null,
        mainImageUrl: primaryImage,
        primaryImage: primaryImage,  // Este campo es el que usa ParkCard
        amenities: amenities        // Añadimos las amenidades
      });
    }
    
    return parksWithImages;
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
          contact_email as "contactEmail", contact_phone as "contactPhone",
          video_url as "videoUrl"
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
    
    // Obtener los nombres de columnas de la tabla park_images para adaptar la consulta
    try {
      // Primero, verificamos qué columnas existen en la tabla park_images
      const imageColumns = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'park_images'
      `);
      
      console.log("Columnas disponibles en park_images:", imageColumns.rows.map(r => r.column_name).join(', '));
      
      // Construimos una consulta dinámica basada en las columnas disponibles
      const columnsArray = [];
      
      // Añadimos campos básicos que deben existir
      columnsArray.push('id');
      columnsArray.push('park_id as "parkId"');
      
      // Comprobamos campos opcionales
      if (imageColumns.rows.some(col => col.column_name === 'image_url')) {
        columnsArray.push('image_url as "imageUrl"');
      }
      if (imageColumns.rows.some(col => col.column_name === 'is_primary')) {
        columnsArray.push('is_primary as "isPrimary"');
      }
      if (imageColumns.rows.some(col => col.column_name === 'description')) {
        columnsArray.push('description');
      }
      if (imageColumns.rows.some(col => col.column_name === 'caption')) {
        columnsArray.push('caption');
      }
      
      // Ahora construimos y ejecutamos la consulta
      const query = `
        SELECT ${columnsArray.join(', ')}
        FROM park_images
        WHERE park_id = $1
        ${imageColumns.rows.some(col => col.column_name === 'is_primary') ? 'ORDER BY is_primary DESC' : ''}
      `;
      
      console.log("Consulta de imágenes generada:", query);
      const imagesResult = await pool.query(query, [parkId]);
      
      console.log("Imágenes encontradas:", imagesResult.rowCount);
      extendedPark.images = imagesResult.rows || [];
      
      // Encontrar la imagen principal, si existe
      const mainImage = extendedPark.images.find((img: any) => img.isPrimary);
      if (mainImage && mainImage.imageUrl) {
        extendedPark.mainImageUrl = mainImage.imageUrl;
      }
    } catch (err) {
      console.error("Error al obtener imágenes:", err);
      // Si hay error, dejamos el array vacío que ya se inicializó
    }
    
    // Documentos - la tabla no existe, así que dejamos el array vacío
    console.log("Omitiendo consulta de documentos porque la tabla no existe");
    
    // Verificamos las columnas disponibles en la tabla activities
    try {
      const activityColumns = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'activities'
      `);
      
      console.log("Columnas disponibles en activities:", activityColumns.rows.map(r => r.column_name).join(', '));
      
      // Construimos columnas para la consulta
      const columnsArray = [];
      
      // Añadimos campos básicos que deben existir
      columnsArray.push('id');
      columnsArray.push('park_id as "parkId"');
      columnsArray.push('title');
      
      // Comprobamos campos opcionales
      if (activityColumns.rows.some(col => col.column_name === 'description')) {
        columnsArray.push('description');
      }
      
      // Comprobamos si existe type o activity_type
      if (activityColumns.rows.some(col => col.column_name === 'type')) {
        columnsArray.push('type as "activityType"');
      } else if (activityColumns.rows.some(col => col.column_name === 'activity_type')) {
        columnsArray.push('activity_type as "activityType"');
      }
      
      if (activityColumns.rows.some(col => col.column_name === 'start_date')) {
        columnsArray.push('start_date as "startDate"');
      }
      if (activityColumns.rows.some(col => col.column_name === 'end_date')) {
        columnsArray.push('end_date as "endDate"');
      }
      if (activityColumns.rows.some(col => col.column_name === 'capacity')) {
        columnsArray.push('capacity');
      }
      if (activityColumns.rows.some(col => col.column_name === 'instructor_id')) {
        columnsArray.push('instructor_id as "instructorId"');
      }
      if (activityColumns.rows.some(col => col.column_name === 'status')) {
        columnsArray.push('status');
      }
      if (activityColumns.rows.some(col => col.column_name === 'image_url')) {
        columnsArray.push('image_url as "imageUrl"');
      }
      
      // Ahora construimos y ejecutamos la consulta
      const query = `
        SELECT ${columnsArray.join(', ')}
        FROM activities
        WHERE park_id = $1
        ${activityColumns.rows.some(col => col.column_name === 'start_date') ? 'ORDER BY start_date DESC' : ''}
      `;
      
      console.log("Consulta de actividades generada:", query);
      const activitiesResult = await pool.query(query, [parkId]);
      
      console.log("Actividades encontradas:", activitiesResult.rowCount);
      extendedPark.activities = activitiesResult.rows || [];
    } catch (err) {
      console.error("Error al obtener actividades:", err);
      // Si hay error, dejamos el array vacío que ya se inicializó
    }
    
    // Contar árboles del parque - adaptado a la estructura real
    try {
      // Verificamos si la tabla trees existe
      const tableExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'trees'
        ) as exists
      `);
      
      // Si la tabla no existe, usamos valores predeterminados
      if (!tableExists.rows[0].exists) {
        console.log("La tabla trees no existe, usando valores predeterminados");
        extendedPark.trees = {
          total: 0,
          byHealth: {
            'Bueno': 0, 
            'Regular': 0, 
            'Malo': 0, 
            'Desconocido': 0
          },
          bySpecies: {}
        };
        return;
      }
      
      // Consultamos los campos disponibles en la tabla trees
      const treeColumns = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'trees'
      `);
      
      console.log("Columnas disponibles en trees:", treeColumns.rows.map(r => r.column_name).join(', '));
      
      // Verificamos si existe la columna health_condition o estado
      const healthColumnName = treeColumns.rows.find(col => 
        col.column_name === 'health_condition' || 
        col.column_name === 'estado' || 
        col.column_name === 'health' || 
        col.column_name === 'condition'
      )?.column_name;
      
      // Construimos la consulta según los campos disponibles
      let treeQuery;
      if (healthColumnName) {
        treeQuery = `
          SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN ${healthColumnName} = 'Bueno' THEN 1 END) as good,
            COUNT(CASE WHEN ${healthColumnName} = 'Regular' THEN 1 END) as regular,
            COUNT(CASE WHEN ${healthColumnName} = 'Malo' THEN 1 END) as bad,
            COUNT(CASE WHEN ${healthColumnName} IS NULL OR ${healthColumnName} = '' THEN 1 END) as unknown
          FROM trees
          WHERE park_id = $1
        `;
      } else {
        // Si no existe la columna, simplemente contamos el total
        treeQuery = `
          SELECT 
            COUNT(*) as total
          FROM trees
          WHERE park_id = $1
        `;
      }
      
      console.log("Consulta de árboles generada:", treeQuery);
      const treeStatsResult = await pool.query(treeQuery, [parkId]);
      
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