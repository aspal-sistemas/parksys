import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

async function createVolunteerAdSpaces() {
  try {
    // Crear espacios publicitarios para voluntarios
    const spaces = [
      {
        id: 20,
        name: 'Voluntarios - Sidebar 1',
        description: 'Primer espacio publicitario en sidebar de voluntarios',
        location: 'sidebar',
        page_type: 'volunteers',
        dimensions: '300x250',
        is_active: true
      },
      {
        id: 21,
        name: 'Voluntarios - Sidebar 2',
        description: 'Segundo espacio publicitario en sidebar de voluntarios',
        location: 'sidebar',
        page_type: 'volunteers',
        dimensions: '300x250',
        is_active: true
      },
      {
        id: 22,
        name: 'Voluntarios - Sidebar 3',
        description: 'Tercer espacio publicitario en sidebar de voluntarios',
        location: 'sidebar',
        page_type: 'volunteers',
        dimensions: '300x250',
        is_active: true
      },
      {
        id: 23,
        name: 'Voluntarios - Sidebar 4',
        description: 'Cuarto espacio publicitario en sidebar de voluntarios',
        location: 'sidebar',
        page_type: 'volunteers',
        dimensions: '300x250',
        is_active: true
      }
    ];

    for (const space of spaces) {
      await pool.query(`
        INSERT INTO ad_spaces (id, name, description, location, page_type, dimensions, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          location = EXCLUDED.location,
          page_type = EXCLUDED.page_type,
          dimensions = EXCLUDED.dimensions,
          is_active = EXCLUDED.is_active
      `, [space.id, space.name, space.description, space.location, space.page_type, space.dimensions, space.is_active]);
      
      console.log('✅ Espacio publicitario creado:', space.name);
    }

    // Crear anuncios para voluntarios
    const ads = [
      {
        id: 10,
        title: 'Programa de Voluntariado Comunitario',
        description: 'Únete a nuestro programa de voluntariado y contribuye al cuidado de parques urbanos. Actividades todos los fines de semana.',
        image_url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
        target_url: 'https://voluntarios.parques.guadalajara.gob.mx',
        alt_text: 'Programa de Voluntariado Comunitario',
        is_active: true
      },
      {
        id: 11,
        title: 'Capacitación para Voluntarios',
        description: 'Cursos especializados en jardinería urbana, educación ambiental y gestión comunitaria. Certificación incluida.',
        image_url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
        target_url: 'https://capacitacion.voluntarios.guadalajara.gob.mx',
        alt_text: 'Capacitación para Voluntarios',
        is_active: true
      },
      {
        id: 12,
        title: 'Eventos Comunitarios',
        description: 'Participa en eventos especiales: jornadas de limpieza, plantación de árboles y festivales ecológicos.',
        image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
        target_url: 'https://eventos.parques.guadalajara.gob.mx',
        alt_text: 'Eventos Comunitarios',
        is_active: true
      },
      {
        id: 13,
        title: 'Beneficios para Voluntarios',
        description: 'Acceso exclusivo a áreas verdes, descuentos en eventos, reconocimientos oficiales y networking comunitario.',
        image_url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
        target_url: 'https://beneficios.voluntarios.guadalajara.gob.mx',
        alt_text: 'Beneficios para Voluntarios',
        is_active: true
      }
    ];

    for (const ad of ads) {
      await pool.query(`
        INSERT INTO advertisements (id, title, description, image_url, target_url, alt_text, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          image_url = EXCLUDED.image_url,
          target_url = EXCLUDED.target_url,
          alt_text = EXCLUDED.alt_text,
          is_active = EXCLUDED.is_active
      `, [ad.id, ad.title, ad.description, ad.image_url, ad.target_url, ad.alt_text, ad.is_active]);
      
      console.log('✅ Anuncio creado:', ad.title);
    }

    // Crear asignaciones de anuncios a espacios
    const assignments = [
      {
        ad_space_id: 20,
        advertisement_id: 10,
        start_date: '2025-07-16',
        end_date: '2025-08-16'
      },
      {
        ad_space_id: 21,
        advertisement_id: 11,
        start_date: '2025-07-16',
        end_date: '2025-08-16'
      },
      {
        ad_space_id: 22,
        advertisement_id: 12,
        start_date: '2025-07-16',
        end_date: '2025-08-16'
      },
      {
        ad_space_id: 23,
        advertisement_id: 13,
        start_date: '2025-07-16',
        end_date: '2025-08-16'
      }
    ];

    for (const assignment of assignments) {
      await pool.query(`
        INSERT INTO ad_placements (ad_space_id, advertisement_id, start_date, end_date, is_active)
        VALUES ($1, $2, $3, $4, true)
        ON CONFLICT (ad_space_id, advertisement_id) DO UPDATE SET
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          is_active = EXCLUDED.is_active
      `, [assignment.ad_space_id, assignment.advertisement_id, assignment.start_date, assignment.end_date]);
      
      console.log('✅ Asignación creada: Espacio', assignment.ad_space_id, '← Anuncio', assignment.advertisement_id);
    }

    console.log('🎯 Sistema de publicidad para voluntarios completamente configurado');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

createVolunteerAdSpaces();