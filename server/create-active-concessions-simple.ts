/**
 * Script simplificado para crear 10 concesiones activas
 */

import { db } from './db';
import { activeConcessions } from '../shared/schema';

export async function createActiveConcessions() {
  try {
    console.log('🏊 Creando concesiones activas...');

    // Eliminar existentes
    await db.delete(activeConcessions);

    // Insertar 10 concesiones activas
    const concessions = await db.insert(activeConcessions).values([
      {
        name: 'Café Verde Bosque Los Colomos',
        description: 'Concesión especializada en café orgánico y productos naturales con certificación Fair Trade',
        concessionTypeId: 1,
        concessionaireId: 72,
        parkId: 5,
        specificLocation: 'Zona Norte del Bosque Los Colomos, junto al sendero principal',
        startDate: '2025-01-01',
        endDate: '2027-12-31',
        status: 'active',
        monthlyPayment: '1250.00',
        operatingHours: '7:00 AM - 7:00 PM',
        operatingDays: 'Lunes a Domingo',
        termsConditions: 'Café orgánico y productos naturales. Prohibida música amplificada después de las 6:00 PM.',
        emergencyContact: 'María Elena Rodríguez García',
        emergencyPhone: '33-1234-5678',
        notes: 'Capacidad para 40 personas. Certificación Fair Trade vigente.',
        coordinates: '20.7033, -103.3915',
        area: '150.5',
        contractNumber: 'CON-2025-001'
      },
      {
        name: 'Escuela Deportes Acuáticos Agua Azul',
        description: 'Escuela certificada de deportes acuáticos con instructores FMVELA',
        concessionTypeId: 9,
        concessionaireId: 73,
        parkId: 19,
        specificLocation: 'Laguna principal del Parque Agua Azul, muelle norte',
        startDate: '2025-02-01',
        endDate: '2028-01-31',
        status: 'active',
        monthlyPayment: '2083.33',
        operatingHours: '9:00 AM - 5:00 PM',
        operatingDays: 'Martes a Domingo',
        termsConditions: 'Máximo 20 personas por sesión. Instructores certificados obligatorios.',
        emergencyContact: 'Carlos Alberto Mendoza Ruiz',
        emergencyPhone: '33-2345-6789',
        notes: 'Capacidad para 20 personas. Equipo de seguridad acuática completo.',
        coordinates: '20.6739, -103.3370',
        area: '500.0',
        contractNumber: 'CON-2025-002'
      },
      {
        name: 'Food Truck Asia Fusion',
        description: 'Food truck especializado en comida asiática fusion con ingredientes locales',
        concessionTypeId: 11,
        concessionaireId: 74,
        parkId: 2,
        specificLocation: 'Área de food trucks, estacionamiento rotativo',
        startDate: '2025-01-15',
        endDate: '2026-01-14',
        status: 'active',
        monthlyPayment: '666.67',
        operatingHours: '12:00 PM - 9:00 PM',
        operatingDays: 'Miércoles a Domingo',
        termsConditions: 'Ubicación rotativa cada 3 meses. Generador eléctrico silencioso obligatorio.',
        emergencyContact: 'Ana Sofía Luna Hernández',
        emergencyPhone: '33-3456-7890',
        notes: 'Capacidad para 25 personas. Cocina asiática fusion.',
        coordinates: '20.6597, -103.3496',
        area: '25.0',
        contractNumber: 'CON-2025-003'
      },
      {
        name: 'Eventos Familiares Mirador',
        description: 'Organización integral de eventos familiares con catering y decoración',
        concessionTypeId: 10,
        concessionaireId: 75,
        parkId: 6,
        specificLocation: 'Área de palapas y explanada de eventos familiares',
        startDate: '2025-03-01',
        endDate: '2027-02-28',
        status: 'active',
        monthlyPayment: '1000.00',
        operatingHours: '10:00 AM - 10:00 PM',
        operatingDays: 'Sábados y Domingos',
        termsConditions: 'Eventos hasta las 10:00 PM. Límite de ruido 65 decibeles.',
        emergencyContact: 'Roberto Javier Torres Sánchez',
        emergencyPhone: '33-4567-8901',
        notes: 'Capacidad para 150 personas. Servicio integral.',
        coordinates: '20.6868, -103.3370',
        area: '300.0',
        contractNumber: 'CON-2025-004'
      },
      {
        name: 'Teatro Familiar González Gallo',
        description: 'Compañía teatral especializada en obras familiares y cuentacuentos',
        concessionTypeId: 8,
        concessionaireId: 76,
        parkId: 7,
        specificLocation: 'Anfiteatro natural, área de espectáculos',
        startDate: '2025-01-20',
        endDate: '2026-12-31',
        status: 'active',
        monthlyPayment: '833.33',
        operatingHours: '4:00 PM - 8:00 PM',
        operatingDays: 'Sábados y Domingos',
        termsConditions: 'Contenido familiar apropiado. Montaje y desmontaje el mismo día.',
        emergencyContact: 'Guadalupe Fernández López',
        emergencyPhone: '33-5678-9012',
        notes: 'Capacidad para 100 personas. Obras familiares.',
        coordinates: '20.6597, -103.3932',
        area: '200.0',
        contractNumber: 'CON-2025-005'
      },
      {
        name: 'EcoBikes Tlaquepaque',
        description: 'Estación de bicicletas ecológicas con servicio de reparación',
        concessionTypeId: 2,
        concessionaireId: 77,
        parkId: 18,
        specificLocation: 'Entrada principal del bosque, estación de bicicletas',
        startDate: '2025-02-15',
        endDate: '2028-02-14',
        status: 'active',
        monthlyPayment: '1500.00',
        operatingHours: '8:00 AM - 6:00 PM',
        operatingDays: 'Lunes a Domingo',
        termsConditions: 'Mantenimiento semanal obligatorio. Cascos incluidos.',
        emergencyContact: 'Miguel Ángel Vargas Moreno',
        emergencyPhone: '33-6789-0123',
        notes: 'Flota de 50 bicicletas ecológicas.',
        coordinates: '20.6413, -103.2946',
        area: '100.0',
        contractNumber: 'CON-2025-006'
      },
      {
        name: 'Helados Artesanales Alcalde',
        description: 'Carrito artesanal con helados de sabores típicos de Jalisco',
        concessionTypeId: 6,
        concessionaireId: 78,
        parkId: 4,
        specificLocation: 'Área de juegos infantiles, ubicación fija',
        startDate: '2025-01-10',
        endDate: '2026-06-30',
        status: 'active',
        monthlyPayment: '500.00',
        operatingHours: '10:00 AM - 8:00 PM',
        operatingDays: 'Lunes a Domingo',
        termsConditions: 'Productos sin conservadores artificiales. Sabores regionales.',
        emergencyContact: 'Patricia Isabel Ramírez Gutiérrez',
        emergencyPhone: '33-7890-1234',
        notes: 'Capacidad para 30 personas. Sabores típicos.',
        coordinates: '20.6775, -103.3370',
        area: '15.0',
        contractNumber: 'CON-2025-007'
      },
      {
        name: 'Kiosco Turístico Montenegro',
        description: 'Centro de información turística con productos ecológicos',
        concessionTypeId: 3,
        concessionaireId: 79,
        parkId: 20,
        specificLocation: 'Entrada principal del parque, kiosco de información',
        startDate: '2025-03-15',
        endDate: '2027-03-14',
        status: 'active',
        monthlyPayment: '416.67',
        operatingHours: '9:00 AM - 6:00 PM',
        operatingDays: 'Lunes a Domingo',
        termsConditions: 'Personal bilingüe obligatorio. Información actualizada mensualmente.',
        emergencyContact: 'Fernando José Castillo Herrera',
        emergencyPhone: '33-8901-2345',
        notes: 'Capacidad para 10 personas. Turismo sustentable.',
        coordinates: '20.6684, -103.3632',
        area: '30.0',
        contractNumber: 'CON-2025-008'
      },
      {
        name: 'Eventos Culturales Quintanar',
        description: 'Organización de eventos culturales con enfoque educativo',
        concessionTypeId: 5,
        concessionaireId: 80,
        parkId: 15,
        specificLocation: 'Explanada principal, área de eventos culturales',
        startDate: '2025-04-01',
        endDate: '2026-09-30',
        status: 'active',
        monthlyPayment: '1166.67',
        operatingHours: '6:00 PM - 10:00 PM',
        operatingDays: 'Viernes a Domingos',
        termsConditions: 'Eventos culturales y educativos únicamente. Aforo máximo 200 personas.',
        emergencyContact: 'Sandra Liliana Jiménez Paz',
        emergencyPhone: '33-9012-3456',
        notes: 'Capacidad para 200 personas. Eventos educativos.',
        coordinates: '20.6908, -103.3467',
        area: '400.0',
        contractNumber: 'CON-2025-009'
      },
      {
        name: 'Escuela Natación Liberación',
        description: 'Escuela profesional de natación con certificaciones FINA',
        concessionTypeId: 4,
        concessionaireId: 81,
        parkId: 17,
        specificLocation: 'Alberca olímpica, área de deportes acuáticos',
        startDate: '2025-05-01',
        endDate: '2028-04-30',
        status: 'active',
        monthlyPayment: '1833.33',
        operatingHours: '6:00 AM - 9:00 PM',
        operatingDays: 'Lunes a Sábado',
        termsConditions: 'Instructores certificados FINA. Grupos máximo 8 personas.',
        emergencyContact: 'Alejandro Daniel Morales Castro',
        emergencyPhone: '33-0123-4567',
        notes: 'Capacidad para 30 personas. Certificaciones FINA.',
        coordinates: '20.6754, -103.3370',
        area: '800.0',
        contractNumber: 'CON-2025-010'
      }
    ]).returning();

    console.log(`✅ ${concessions.length} concesiones activas creadas exitosamente`);

    // Estadísticas
    const totalMonthlyRevenue = concessions.reduce((sum, c) => sum + parseFloat(c.monthlyPayment || '0'), 0);
    console.log(`📊 Ingresos mensuales estimados: $${totalMonthlyRevenue.toFixed(2)}`);
    console.log(`📊 Parques con concesiones: ${new Set(concessions.map(c => c.parkId)).size}`);

    return concessions;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Ejecutar directamente
createActiveConcessions()
  .then(() => {
    console.log('🎉 Concesiones activas creadas completamente');
  })
  .catch((error) => {
    console.error('💥 Error:', error);
  });