import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function addAdvertisingSpaces() {
  try {
    // Espacios publicitarios para instructores (IDs 13-17)
    const instructorSpaces = [
      { id: 13, name: 'Sidebar Certificaciones', description: 'Espacio para anuncios de certificaciones profesionales', position: 'sidebar', width: 300, height: 250 },
      { id: 14, name: 'Sidebar Capacitación', description: 'Espacio para anuncios de capacitación y cursos', position: 'sidebar', width: 300, height: 250 },
      { id: 15, name: 'Sidebar Oportunidades', description: 'Espacio para anuncios de oportunidades laborales', position: 'sidebar', width: 300, height: 250 },
      { id: 16, name: 'Sidebar Eventos', description: 'Espacio para anuncios de eventos para instructores', position: 'sidebar', width: 300, height: 250 },
      { id: 17, name: 'Sidebar Recursos', description: 'Espacio para anuncios de recursos y herramientas', position: 'sidebar', width: 300, height: 250 }
    ];

    // Espacios publicitarios para concesiones (IDs 18-23)
    const concessionSpaces = [
      { id: 18, name: 'Header Concesiones', description: 'Espacio publicitario header en página de concesiones', position: 'header', width: 728, height: 90 },
      { id: 19, name: 'Sidebar Servicios', description: 'Espacio para anuncios de servicios comerciales', position: 'sidebar', width: 300, height: 250 },
      { id: 20, name: 'Sidebar Oportunidades', description: 'Espacio para anuncios de oportunidades de negocio', position: 'sidebar', width: 300, height: 250 },
      { id: 21, name: 'Sidebar Inversión', description: 'Espacio para anuncios de inversión y financiamiento', position: 'sidebar', width: 300, height: 250 },
      { id: 22, name: 'Sidebar Eventos', description: 'Espacio para anuncios de eventos comerciales', position: 'sidebar', width: 300, height: 250 },
      { id: 23, name: 'Sidebar Recursos', description: 'Espacio para anuncios de recursos empresariales', position: 'sidebar', width: 300, height: 250 }
    ];

    const allSpaces = [...instructorSpaces, ...concessionSpaces];

    // Insertar espacios publicitarios
    for (const space of allSpaces) {
      await pool.query(`
        INSERT INTO ad_spaces (id, name, description, position, width, height, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          position = EXCLUDED.position,
          width = EXCLUDED.width,
          height = EXCLUDED.height,
          updated_at = NOW()
      `, [space.id, space.name, space.description, space.position, space.width, space.height]);
      
      console.log(`✅ Espacio publicitario agregado: ${space.name} (ID: ${space.id})`);
    }

    console.log('\n🎉 Todos los espacios publicitarios para instructores y concesiones fueron agregados exitosamente!');
    
  } catch (error) {
    console.error('❌ Error agregando espacios publicitarios:', error);
  } finally {
    await pool.end();
  }
}

addAdvertisingSpaces();