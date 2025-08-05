import { pool } from './db';

async function createAdvertisingTables() {
  try {
    console.log('🎯 Creando tablas del sistema de publicidad...');
    
    // Crear tabla de campañas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ad_campaigns (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        client VARCHAR(255) NOT NULL,
        description TEXT,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        budget DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        priority VARCHAR(50) DEFAULT 'medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Crear tabla de espacios publicitarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ad_spaces (
        id SERIAL PRIMARY KEY,
        page_type VARCHAR(100) NOT NULL,
        position VARCHAR(100) NOT NULL,
        dimensions VARCHAR(50),
        max_file_size INTEGER DEFAULT 5242880,
        allowed_formats TEXT[] DEFAULT ARRAY['image/jpeg', 'image/png', 'image/gif'],
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Crear tabla de anuncios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS advertisements (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER REFERENCES ad_campaigns(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        link_url VARCHAR(500),
        alt_text VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Crear tabla de colocaciones
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ad_placements (
        id SERIAL PRIMARY KEY,
        advertisement_id INTEGER REFERENCES advertisements(id) ON DELETE CASCADE,
        ad_space_id INTEGER REFERENCES ad_spaces(id) ON DELETE CASCADE,
        priority INTEGER DEFAULT 1,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Crear tabla de analytics
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ad_analytics (
        id SERIAL PRIMARY KEY,
        placement_id INTEGER REFERENCES ad_placements(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        page_views INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        impressions INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Tablas del sistema de publicidad creadas exitosamente');
    
    // Crear algunos datos de ejemplo
    console.log('🎯 Agregando datos de ejemplo...');
    
    // Espacios publicitarios de ejemplo
    await pool.query(`
      INSERT INTO ad_spaces (page_type, position, dimensions, max_file_size, allowed_formats)
      VALUES 
        ('parks', 'header', '1200x90', 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif']),
        ('parks', 'sidebar', '300x250', 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif']),
        ('parks', 'footer', '728x90', 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif']),
        ('tree-species', 'header', '1200x90', 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif']),
        ('tree-species', 'sidebar', '300x250', 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif']),
        ('activities', 'header', '1200x90', 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif']),
        ('activities', 'sidebar', '300x250', 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif']),
        ('concessions', 'header', '1200x90', 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif']),
        ('concessions', 'sidebar', '300x250', 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif']),
        ('homepage', 'hero', '1920x600', 10485760, ARRAY['image/jpeg', 'image/png'])
      ON CONFLICT DO NOTHING
    `);
    
    // Campaña de ejemplo
    await pool.query(`
      INSERT INTO ad_campaigns (name, client, description, start_date, end_date, budget, status, priority)
      VALUES 
        ('Campaña Verde 2025', 'Eco Solutions', 'Promoción de productos ecológicos para parques', '2025-01-01', '2025-12-31', 15000.00, 'active', 'high'),
        ('Verano en los Parques', 'Deportes Guadalajara', 'Equipamiento deportivo para actividades de verano', '2025-06-01', '2025-08-31', 8000.00, 'active', 'medium')
      ON CONFLICT DO NOTHING
    `);
    
    // Anuncios de ejemplo
    await pool.query(`
      INSERT INTO advertisements (campaign_id, title, description, image_url, link_url, alt_text)
      VALUES 
        (1, 'Productos Ecológicos', 'Cuida el medio ambiente con nuestros productos', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&h=250&fit=crop', 'https://eco-solutions.com', 'Banner productos ecológicos'),
        (2, 'Equipo Deportivo', 'Todo para tus actividades al aire libre', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=250&fit=crop', 'https://deportes-gdl.com', 'Banner equipo deportivo')
      ON CONFLICT DO NOTHING
    `);
    
    console.log('✅ Datos de ejemplo agregados exitosamente');
    console.log('🎯 Sistema de publicidad digital inicializado completamente');
    
  } catch (error) {
    console.error('❌ Error creando tablas de publicidad:', error);
  } finally {
    await pool.end();
  }
}

createAdvertisingTables();