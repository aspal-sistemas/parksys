import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const volunteerData = [
  { name: 'Ana García López', email: 'ana.garcia@email.com', phone: '33-1234-5678', skills: 'Educación ambiental, Guía turística', age: 28, experience: 'Trabajo con niños en actividades recreativas', gender: 'female' },
  { name: 'Carlos Mendoza Ruiz', email: 'carlos.mendoza@email.com', phone: '33-2345-6789', skills: 'Mantenimiento de jardines, Carpintería', age: 35, experience: 'Jardinería profesional por 5 años', gender: 'male' },
  { name: 'María Elena Vásquez', email: 'maria.vasquez@email.com', phone: '33-3456-7890', skills: 'Primeros auxilios, Coordinación de eventos', age: 42, experience: 'Enfermera con experiencia en emergencias', gender: 'female' },
  { name: 'Luis Fernando Torres', email: 'luis.torres@email.com', phone: '33-4567-8901', skills: 'Fotografía, Redes sociales', age: 24, experience: 'Fotógrafo freelance especializado en naturaleza', gender: 'male' },
  { name: 'Sofía Morales Castro', email: 'sofia.morales@email.com', phone: '33-5678-9012', skills: 'Yoga, Meditación', age: 31, experience: 'Instructora de yoga certificada', gender: 'female' },
  { name: 'Roberto Jiménez Díaz', email: 'roberto.jimenez@email.com', phone: '33-6789-0123', skills: 'Seguridad, Vigilancia', age: 45, experience: 'Ex-policía municipal con 10 años de servicio', gender: 'male' },
  { name: 'Alejandra Romero Paz', email: 'alejandra.romero@email.com', phone: '33-7890-1234', skills: 'Arte y manualidades, Pintura', age: 26, experience: 'Artista plástica con talleres para niños', gender: 'female' },
  { name: 'Pedro Sánchez Herrera', email: 'pedro.sanchez@email.com', phone: '33-8901-2345', skills: 'Deportes acuáticos, Natación', age: 29, experience: 'Instructor de natación y salvavidas', gender: 'male' },
  { name: 'Claudia Ramírez Ochoa', email: 'claudia.ramirez@email.com', phone: '33-9012-3456', skills: 'Cocina, Repostería', age: 38, experience: 'Chef con experiencia en eventos masivos', gender: 'female' },
  { name: 'Fernando Aguilar López', email: 'fernando.aguilar@email.com', phone: '33-0123-4567', skills: 'Música, Guitarra', age: 32, experience: 'Músico profesional y profesor de guitarra', gender: 'male' },
  { name: 'Gabriela Núñez Silva', email: 'gabriela.nunez@email.com', phone: '33-1234-5679', skills: 'Danza folclórica, Baile', age: 27, experience: 'Bailarina de ballet folclórico mexicano', gender: 'female' },
  { name: 'Arturo Castillo Mora', email: 'arturo.castillo@email.com', phone: '33-2345-6780', skills: 'Mecánica, Reparaciones', age: 41, experience: 'Mecánico automotriz con taller propio', gender: 'male' },
  { name: 'Valeria Guerrero Pinto', email: 'valeria.guerrero@email.com', phone: '33-3456-7891', skills: 'Idiomas, Inglés', age: 25, experience: 'Profesora de inglés bilingüe', gender: 'female' },
  { name: 'Miguel Ángel Ramos', email: 'miguel.ramos@email.com', phone: '33-4567-8902', skills: 'Veterinaria, Cuidado animal', age: 34, experience: 'Veterinario especializado en fauna silvestre', gender: 'male' },
  { name: 'Paola Reyes Mendoza', email: 'paola.reyes@email.com', phone: '33-5678-9013', skills: 'Contabilidad, Administración', age: 36, experience: 'Contadora pública con experiencia en ONGs', gender: 'female' },
  { name: 'Jaime Delgado Vargas', email: 'jaime.delgado@email.com', phone: '33-6789-0124', skills: 'Electricidad, Mantenimiento', age: 39, experience: 'Electricista industrial certificado', gender: 'male' },
  { name: 'Leticia Flores Guzmán', email: 'leticia.flores@email.com', phone: '33-7890-1235', skills: 'Psicología, Terapia', age: 43, experience: 'Psicóloga clínica especializada en terapia grupal', gender: 'female' },
  { name: 'Ricardo Herrera Soto', email: 'ricardo.herrera@email.com', phone: '33-8901-2346', skills: 'Carpintería, Construcción', age: 37, experience: 'Carpintero con 15 años de experiencia', gender: 'male' },
  { name: 'Adriana Campos Ruiz', email: 'adriana.campos@email.com', phone: '33-9012-3457', skills: 'Diseño gráfico, Publicidad', age: 30, experience: 'Diseñadora gráfica freelance', gender: 'female' },
  { name: 'Héctor Martínez Luna', email: 'hector.martinez@email.com', phone: '33-0123-4568', skills: 'Informática, Programación', age: 28, experience: 'Desarrollador web con conocimientos en sistemas', gender: 'male' },
  { name: 'Verónica Peña Jiménez', email: 'veronica.pena@email.com', phone: '33-1234-5680', skills: 'Enfermería, Salud pública', age: 33, experience: 'Enfermera especializada en salud comunitaria', gender: 'female' },
  { name: 'Sergio Domínguez Cruz', email: 'sergio.dominguez@email.com', phone: '33-2345-6781', skills: 'Agricultura, Huertos urbanos', age: 40, experience: 'Ingeniero agrónomo con experiencia en permacultura', gender: 'male' },
  { name: 'Diana Ortega Vega', email: 'diana.ortega@email.com', phone: '33-3456-7892', skills: 'Comunicación, Periodismo', age: 29, experience: 'Periodista con experiencia en medios ambientales', gender: 'female' },
  { name: 'Oscar Navarro Peña', email: 'oscar.navarro@email.com', phone: '33-4567-8903', skills: 'Deportes, Entrenamiento', age: 31, experience: 'Entrenador deportivo certificado', gender: 'male' },
  { name: 'Mónica Salinas Rojas', email: 'monica.salinas@email.com', phone: '33-5678-9014', skills: 'Trabajo social, Comunidad', age: 35, experience: 'Trabajadora social con experiencia comunitaria', gender: 'female' },
  { name: 'Raúl Cervantes Mora', email: 'raul.cervantes@email.com', phone: '33-6789-0125', skills: 'Ecología, Biología', age: 27, experience: 'Biólogo especializado en conservación', gender: 'male' },
  { name: 'Karla Espinoza Lara', email: 'karla.espinoza@email.com', phone: '33-7890-1236', skills: 'Teatro, Actuación', age: 26, experience: 'Actriz y directora de teatro comunitario', gender: 'female' },
  { name: 'Javier Medina Castillo', email: 'javier.medina@email.com', phone: '33-8901-2347', skills: 'Albañilería, Construcción', age: 44, experience: 'Albañil con experiencia en obras públicas', gender: 'male' },
  { name: 'Cristina Vargas Fuentes', email: 'cristina.vargas@email.com', phone: '33-9012-3458', skills: 'Nutrición, Salud', age: 32, experience: 'Nutrióloga con consulta privada', gender: 'female' },
  { name: 'Andrés Molina Herrera', email: 'andres.molina@email.com', phone: '33-0123-4569', skills: 'Seguridad informática, Tecnología', age: 30, experience: 'Especialista en ciberseguridad', gender: 'male' }
];

const availabilityOptions = [
  ['Lunes', 'Miércoles', 'Viernes'],
  ['Martes', 'Jueves'],
  ['Sábado', 'Domingo'],
  ['Lunes', 'Martes', 'Miércoles'],
  ['Jueves', 'Viernes', 'Sábado'],
  ['Domingo'],
  ['Lunes', 'Miércoles', 'Viernes', 'Domingo'],
  ['Martes', 'Jueves', 'Sábado']
];

async function seedVolunteers() {
  try {
    console.log('🌱 Iniciando creación de 30 voluntarios...');
    
    // Obtener parques disponibles
    const parksResult = await pool.query('SELECT id, name FROM parks ORDER BY id');
    const parks = parksResult.rows;
    console.log(`📍 Parques disponibles: ${parks.length}`);
    parks.forEach(park => console.log(`  - ${park.name} (ID: ${park.id})`));
    
    // Limpiar voluntarios existentes (opcional)
    await pool.query('DELETE FROM volunteers WHERE id > 0');
    console.log('🧹 Voluntarios anteriores eliminados');
    
    // Insertar nuevos voluntarios
    for (let i = 0; i < volunteerData.length; i++) {
      const volunteer = volunteerData[i];
      const parkIndex = i % parks.length; // Distribuir entre parques
      const park = parks[parkIndex];
      const availability = availabilityOptions[i % availabilityOptions.length];
      
      const result = await pool.query(
        `INSERT INTO volunteers (
          full_name, email, phone, preferred_park_id, 
          available_days, skills, status, age, 
          previous_experience, gender, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) 
        RETURNING id`,
        [
          volunteer.name,
          volunteer.email,
          volunteer.phone,
          park.id,
          availability, // Enviar array directamente
          volunteer.skills,
          'active',
          volunteer.age,
          volunteer.experience,
          volunteer.gender
        ]
      );
      
      console.log(`✅ Voluntario ${i + 1}/30: ${volunteer.name} → ${park.name} (ID: ${result.rows[0].id})`);
    }
    
    // Mostrar estadísticas finales
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM volunteers');
    const byParkResult = await pool.query(`
      SELECT p.name, COUNT(v.id) as volunteer_count 
      FROM parks p
      LEFT JOIN volunteers v ON p.id = v.preferred_park_id
      GROUP BY p.id, p.name
      ORDER BY volunteer_count DESC
    `);
    
    console.log('\n📊 ESTADÍSTICAS FINALES:');
    console.log(`Total de voluntarios: ${totalResult.rows[0].total}`);
    console.log('\nVoluntarios por parque:');
    byParkResult.rows.forEach(row => {
      console.log(`  ${row.name}: ${row.volunteer_count} voluntarios`);
    });
    
    console.log('\n🎉 ¡Proceso completado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error al crear voluntarios:', error);
  } finally {
    await pool.end();
  }
}

seedVolunteers();