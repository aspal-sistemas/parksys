import { Router } from 'express';
import { db } from './db';
import { pool } from './db';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/advertising';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `ad-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// =====================================
// ENDPOINTS PARA GESTIÓN DE ESPACIOS
// =====================================

// Obtener todos los espacios publicitarios con métricas
router.get('/spaces', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM ad_spaces
      ORDER BY created_at DESC
    `);
    
    console.log('✅ Espacios obtenidos exitosamente:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error obteniendo espacios:', error);
    res.status(500).json({ error: 'Error obteniendo espacios publicitarios: ' + error.message });
  }
});

// Crear nuevo espacio publicitario
router.post('/spaces', async (req, res) => {
  try {
    const {
      name,
      description,
      page_type,
      position,
      page_identifier,
      width,
      height,
      category,
      is_active = true
    } = req.body;

    console.log('🔧 Creando espacio con datos:', req.body);

    const result = await pool.query(`
      INSERT INTO ad_spaces (
        name, description, page_type, position, page_identifier, 
        width, height, category, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [name, description, page_type, position, page_identifier, width, height, category, is_active]);

    console.log('✅ Espacio creado exitosamente:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creando espacio:', error);
    res.status(500).json({ error: 'Error creando espacio publicitario: ' + error.message });
  }
});

// Actualizar espacio publicitario
router.put('/spaces/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      page_type,
      position,
      page_identifier,
      width,
      height,
      category,
      is_active
    } = req.body;

    console.log('🔧 Actualizando espacio con datos:', req.body);

    const result = await pool.query(`
      UPDATE ad_spaces 
      SET name = $1, description = $2, page_type = $3, position = $4, 
          page_identifier = $5, width = $6, height = $7, category = $8,
          is_active = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `, [name, description, page_type, position, page_identifier, width, height, category, is_active, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Espacio no encontrado' });
    }

    console.log('✅ Espacio actualizado exitosamente:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error actualizando espacio:', error);
    res.status(500).json({ error: 'Error actualizando espacio publicitario: ' + error.message });
  }
});

// Eliminar espacio publicitario
router.delete('/spaces/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM ad_spaces WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Espacio no encontrado' });
    }

    res.json({ message: 'Espacio eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando espacio:', error);
    res.status(500).json({ error: 'Error eliminando espacio publicitario' });
  }
});

// =====================================
// ENDPOINTS PARA GESTIÓN DE ANUNCIOS
// =====================================

// Obtener todos los anuncios con métricas
router.get('/advertisements', async (req, res) => {
  try {
    const { ad_type, media_type, is_active } = req.query;
    
    let whereClause = '';
    const params = [];
    
    if (ad_type) {
      whereClause += ' WHERE a.ad_type = $' + (params.length + 1);
      params.push(ad_type);
    }
    
    if (media_type) {
      whereClause += (whereClause ? ' AND' : ' WHERE') + ' a.media_type = $' + (params.length + 1);
      params.push(media_type);
    }
    
    if (is_active !== undefined) {
      whereClause += (whereClause ? ' AND' : ' WHERE') + ' a.is_active = $' + (params.length + 1);
      params.push(is_active === 'true');
    }

    const result = await pool.query(`
      SELECT 
        a.*,
        c.name as campaign_name,
        COUNT(DISTINCT p.id) as active_placements,
        COUNT(DISTINCT m.id) FILTER (WHERE m.event_type = 'impression') as total_impressions,
        COUNT(DISTINCT m.id) FILTER (WHERE m.event_type = 'click') as total_clicks,
        ROUND(
          COALESCE(
            (COUNT(DISTINCT m.id) FILTER (WHERE m.event_type = 'click')::numeric / 
             NULLIF(COUNT(DISTINCT m.id) FILTER (WHERE m.event_type = 'impression'), 0)) * 100,
            0
          )::numeric, 2
        ) as click_rate
      FROM advertisements a
      LEFT JOIN ad_campaigns c ON a.campaign_id = c.id
      LEFT JOIN ad_placements p ON a.id = p.advertisement_id AND p.is_active = true
      LEFT JOIN ad_metrics m ON a.id = m.advertisement_id AND m.event_date >= CURRENT_DATE - INTERVAL '30 days'
      ${whereClause}
      GROUP BY a.id, c.name
      ORDER BY a.created_at DESC
    `, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo anuncios:', error);
    res.status(500).json({ error: 'Error obteniendo anuncios' });
  }
});

// Crear nuevo anuncio
router.post('/advertisements', async (req, res) => {
  try {
    const {
      title,
      description,
      image_url,
      link_url,
      alt_text,
      ad_type = 'institutional',
      media_type = 'image',
      frequency = 'always',
      start_date,
      end_date,
      priority = 5,
      is_active = true,
      video_url,
      html_content,
      carousel_images = [],
      scheduled_days = [],
      scheduled_hours = [],
      target_pages = [],
      target_positions = [],
      campaign_id
    } = req.body;

    const result = await pool.query(`
      INSERT INTO advertisements (
        title, description, image_url, link_url, alt_text, ad_type, media_type, 
        frequency, start_date, end_date, priority, is_active, video_url, html_content,
        carousel_images, scheduled_days, scheduled_hours, target_pages, target_positions,
        campaign_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *
    `, [
      title, description, image_url, link_url, alt_text, ad_type, media_type, 
      frequency, start_date, end_date, priority, is_active, video_url, html_content,
      carousel_images, scheduled_days, scheduled_hours, target_pages, target_positions,
      campaign_id
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando anuncio:', error);
    res.status(500).json({ error: 'Error creando anuncio' });
  }
});

// Actualizar anuncio
router.put('/advertisements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      image_url,
      link_url,
      alt_text,
      ad_type,
      media_type,
      frequency,
      start_date,
      end_date,
      priority,
      is_active,
      video_url,
      html_content,
      carousel_images,
      scheduled_days,
      scheduled_hours,
      target_pages,
      target_positions,
      campaign_id
    } = req.body;

    const result = await pool.query(`
      UPDATE advertisements 
      SET title = $1, description = $2, image_url = $3, link_url = $4, alt_text = $5,
          ad_type = $6, media_type = $7, frequency = $8, start_date = $9, end_date = $10,
          priority = $11, is_active = $12, video_url = $13, html_content = $14,
          carousel_images = $15, scheduled_days = $16, scheduled_hours = $17,
          target_pages = $18, target_positions = $19, campaign_id = $20,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $21
      RETURNING *
    `, [
      title, description, image_url, link_url, alt_text, ad_type, media_type, 
      frequency, start_date, end_date, priority, is_active, video_url, html_content,
      carousel_images, scheduled_days, scheduled_hours, target_pages, target_positions,
      campaign_id, id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Anuncio no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando anuncio:', error);
    res.status(500).json({ error: 'Error actualizando anuncio' });
  }
});

// Eliminar anuncio
router.delete('/advertisements/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM advertisements WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Anuncio no encontrado' });
    }

    res.json({ message: 'Anuncio eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando anuncio:', error);
    res.status(500).json({ error: 'Error eliminando anuncio' });
  }
});

// =====================================
// ENDPOINTS PARA GESTIÓN DE ASIGNACIONES
// =====================================

// Obtener todas las asignaciones
router.get('/assignments', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        a.title as advertisement_title,
        a.description as advertisement_description,
        a.image_url as advertisement_image_url,
        a.ad_type as advertisement_ad_type,
        a.media_type as advertisement_media_type,
        s.name as space_name,
        s.page_type as space_page_type,
        s.position as space_position,
        s.dimensions as space_dimensions
      FROM ad_placements p
      LEFT JOIN advertisements a ON p.advertisement_id = a.id
      LEFT JOIN ad_spaces s ON p.ad_space_id = s.id
      ORDER BY p.created_at DESC
    `);
    
    // Transformar datos para coincidir con interfaz
    const transformedData = result.rows.map(row => ({
      id: row.id,
      adSpaceId: row.ad_space_id,
      advertisementId: row.advertisement_id,
      startDate: row.start_date,
      endDate: row.end_date,
      frequency: row.frequency,
      priority: row.priority,
      isActive: row.is_active,
      advertisement: {
        id: row.advertisement_id,
        title: row.advertisement_title,
        description: row.advertisement_description,
        imageUrl: row.advertisement_image_url,
        adType: row.advertisement_ad_type,
        mediaType: row.advertisement_media_type,
        isActive: true
      },
      space: {
        id: row.ad_space_id,
        name: row.space_name,
        pageType: row.space_page_type,
        position: row.space_position,
        dimensions: row.space_dimensions
      }
    }));
    
    res.json(transformedData);
  } catch (error) {
    console.error('Error obteniendo asignaciones:', error);
    res.status(500).json({ error: 'Error obteniendo asignaciones publicitarias' });
  }
});

// Crear nueva asignación
router.post('/assignments', async (req, res) => {
  try {
    const {
      ad_space_id,
      advertisement_id,
      start_date,
      end_date,
      frequency = 'always',
      priority = 5,
      is_active = true
    } = req.body;

    const result = await pool.query(`
      INSERT INTO ad_placements (
        ad_space_id, advertisement_id, start_date, end_date, frequency, priority, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [ad_space_id, advertisement_id, start_date, end_date, frequency, priority, is_active]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando asignación:', error);
    res.status(500).json({ error: 'Error creando asignación publicitaria' });
  }
});

// Actualizar asignación
router.put('/assignments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      ad_space_id,
      advertisement_id,
      start_date,
      end_date,
      frequency,
      priority,
      is_active
    } = req.body;

    const result = await pool.query(`
      UPDATE ad_placements 
      SET ad_space_id = $1, advertisement_id = $2, start_date = $3, end_date = $4,
          frequency = $5, priority = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [ad_space_id, advertisement_id, start_date, end_date, frequency, priority, is_active, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando asignación:', error);
    res.status(500).json({ error: 'Error actualizando asignación publicitaria' });
  }
});

// Eliminar asignación
router.delete('/assignments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM ad_placements WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }

    res.json({ message: 'Asignación eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando asignación:', error);
    res.status(500).json({ error: 'Error eliminando asignación publicitaria' });
  }
});

// =====================================
// ENDPOINTS PARA SUBIDA DE ARCHIVOS
// =====================================

// Subir archivo multimedia
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    const fileUrl = `/uploads/advertising/${req.file.filename}`;
    
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
  } catch (error) {
    console.error('Error subiendo archivo:', error);
    res.status(500).json({ error: 'Error subiendo archivo' });
  }
});

// Subir múltiples archivos para carrusel
router.post('/upload-multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se subieron archivos' });
    }

    const files = (req.files as Express.Multer.File[]).map(file => ({
      url: `/uploads/advertising/${file.filename}`,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size
    }));

    res.json({
      success: true,
      files
    });
  } catch (error) {
    console.error('Error subiendo archivos:', error);
    res.status(500).json({ error: 'Error subiendo archivos' });
  }
});

// =====================================
// ENDPOINTS PARA MÉTRICAS Y ANALYTICS
// =====================================

// Obtener métricas generales
router.get('/metrics', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    
    const result = await pool.query(`
      SELECT 
        COUNT(DISTINCT ad_space_id) as total_spaces,
        COUNT(DISTINCT advertisement_id) as total_advertisements,
        COUNT(DISTINCT id) FILTER (WHERE event_type = 'impression') as total_impressions,
        COUNT(DISTINCT id) FILTER (WHERE event_type = 'click') as total_clicks,
        ROUND(
          COALESCE(
            (COUNT(DISTINCT id) FILTER (WHERE event_type = 'click')::numeric / 
             NULLIF(COUNT(DISTINCT id) FILTER (WHERE event_type = 'impression'), 0)) * 100,
            0
          )::numeric, 2
        ) as click_rate,
        COUNT(DISTINCT DATE(created_at)) as active_days
      FROM ad_metrics
      WHERE event_date >= CURRENT_DATE - INTERVAL '${period} days'
    `);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo métricas:', error);
    res.status(500).json({ error: 'Error obteniendo métricas' });
  }
});

// Obtener métricas por espacio
router.get('/metrics/spaces', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        s.name,
        s.page_type,
        s.position,
        COUNT(DISTINCT m.id) FILTER (WHERE m.event_type = 'impression') as impressions,
        COUNT(DISTINCT m.id) FILTER (WHERE m.event_type = 'click') as clicks,
        ROUND(
          COALESCE(
            (COUNT(DISTINCT m.id) FILTER (WHERE m.event_type = 'click')::numeric / 
             NULLIF(COUNT(DISTINCT m.id) FILTER (WHERE m.event_type = 'impression'), 0)) * 100,
            0
          )::numeric, 2
        ) as click_rate
      FROM ad_spaces s
      LEFT JOIN ad_metrics m ON s.id = m.ad_space_id AND m.event_date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY s.id, s.name, s.page_type, s.position
      ORDER BY impressions DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo métricas por espacio:', error);
    res.status(500).json({ error: 'Error obteniendo métricas por espacio' });
  }
});

// Registrar impresión
router.post('/track-impression', async (req, res) => {
  try {
    const { 
      ad_space_id, 
      advertisement_id, 
      placement_id, 
      page_url, 
      user_agent, 
      ip_address 
    } = req.body;
    
    const now = new Date();
    
    await pool.query(`
      INSERT INTO ad_metrics (
        ad_space_id, advertisement_id, placement_id, event_type, 
        event_date, event_hour, page_url, user_agent, ip_address
      ) VALUES ($1, $2, $3, 'impression', $4, $5, $6, $7, $8)
    `, [
      ad_space_id, advertisement_id, placement_id, 
      now.toISOString().split('T')[0], 
      now.getHours(), 
      page_url, 
      user_agent, 
      ip_address
    ]);
    
    // Actualizar contador en advertisement
    await pool.query(`
      UPDATE advertisements 
      SET impression_count = impression_count + 1 
      WHERE id = $1
    `, [advertisement_id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error registrando impresión:', error);
    res.status(500).json({ error: 'Error registrando impresión' });
  }
});

// Registrar click
router.post('/track-click', async (req, res) => {
  try {
    const { 
      ad_space_id, 
      advertisement_id, 
      placement_id, 
      page_url, 
      user_agent, 
      ip_address 
    } = req.body;
    
    const now = new Date();
    
    await pool.query(`
      INSERT INTO ad_metrics (
        ad_space_id, advertisement_id, placement_id, event_type, 
        event_date, event_hour, page_url, user_agent, ip_address
      ) VALUES ($1, $2, $3, 'click', $4, $5, $6, $7, $8)
    `, [
      ad_space_id, advertisement_id, placement_id, 
      now.toISOString().split('T')[0], 
      now.getHours(), 
      page_url, 
      user_agent, 
      ip_address
    ]);
    
    // Actualizar contador en advertisement
    await pool.query(`
      UPDATE advertisements 
      SET click_count = click_count + 1 
      WHERE id = $1
    `, [advertisement_id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error registrando click:', error);
    res.status(500).json({ error: 'Error registrando click' });
  }
});

export default router;