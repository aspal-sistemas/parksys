/**
 * Script para crear 10 concesiones activas que compilarán datos del catálogo, concesionarios y contratos
 */

import { db } from './db';
import { activeConcessions } from '../shared/schema';

interface ActiveConcessionData {
  name: string;
  description: string;
  concessionTypeId: number;
  concessionaireId: number;
  parkId: number;
  specificLocation: string;
  startDate: string;
  endDate: string;
  status: string;
  monthlyPayment: string;
  operatingHours: string;
  operatingDays: string;
  termsConditions: string;
  emergencyContact: string;
  emergencyPhone: string;
  notes: string;
  coordinates?: string;
  area?: string;
  contractNumber: string;
}

const activeConcessionData: ActiveConcessionData[] = [
  {
    name: 'Café Verde Bosque Los Colomos',
    description: 'Concesión especializada en café orgánico y productos naturales con certificación Fair Trade',
    concessionTypeId: 1, // Venta de alimentos
    concessionaireId: 72, // María Elena Rodríguez García
    parkId: 5, // Bosque Los Colomos
    specificLocation: 'Zona Norte del Bosque Los Colomos, junto al sendero principal',
    startDate: '2025-01-01',
    endDate: '2027-12-31',
    status: 'active',
    monthlyPayment: '1250.00',
    operatingHours: '7:00 AM - 7:00 PM',
    operatingDays: 'Lunes a Domingo',
    termsConditions: 'Café orgánico y productos naturales. Prohibida música amplificada después de las 6:00 PM. Limpieza diaria obligatoria.',
    emergencyContact: 'María Elena Rodríguez García',
    emergencyPhone: '33-1234-5678',
    notes: 'Capacidad para 40 personas. Certificación Fair Trade vigente.',
    coordinates: '20.7033, -103.3915',
    area: '150.5',
    contractNumber: 'CON-2025-001'
  },
  {
    name: 'Escuela Deportes Acuáticos Agua Azul',
    description: 'Escuela certificada de deportes acuáticos con instructores FMVELA y equipo de seguridad completo',
    concessionTypeId: 9, // Deportes Acuáticos y Kayak
    concessionaireId: 73, // Carlos Alberto Mendoza Ruiz
    parkId: 19, // Parque Agua Azul
    specificLocation: 'Laguna principal del Parque Agua Azul, muelle norte',
    startDate: '2025-02-01',
    endDate: '2028-01-31',
    status: 'active',
    monthlyPayment: '2083.33',
    operatingHours: '9:00 AM - 5:00 PM',
    operatingDays: 'Martes a Domingo',
    termsConditions: 'Máximo 20 personas por sesión. Instructores certificados obligatorios. Seguro de responsabilidad civil vigente.',
    emergencyContact: 'Carlos Alberto Mendoza Ruiz',
    emergencyPhone: '33-2345-6789',
    notes: 'Capacidad para 20 personas. Equipo de seguridad acuática completo.',
    coordinates: '20.6739, -103.3370',
    area: '500.0',
    contractNumber: 'CON-2025-002'
  },
  {
    concessionTypeId: 11, // Food Truck Cocina Internacional
    concessionaireId: 74, // Ana Sofía Luna Hernández
    parkId: 2, // Parque Metropolitano de Guadalajara
    contractId: 3,
    specificLocation: 'Área de food trucks, estacionamiento rotativo cada 3 meses',
    operatingHours: 'Miércoles a Domingo: 12:00 PM - 9:00 PM',
    capacity: 25,
    currentStatus: 'operational',
    startDate: '2025-01-15',
    endDate: '2026-01-14',
    monthlyFee: '666.67',
    terms: 'Cocina asiática fusion. Ubicación rotativa cada 3 meses. Generador eléctrico silencioso obligatorio.',
    emergencyContact: 'Ana Sofía Luna Hernández',
    emergencyPhone: '33-3456-7890',
    notes: 'Food truck especializado en comida asiática con ingredientes locales orgánicos',
    latitude: '20.6597',
    longitude: '-103.3496'
  },
  {
    concessionTypeId: 10, // Organización de Eventos Familiares
    concessionaireId: 75, // Roberto Javier Torres Sánchez
    parkId: 6, // Parque Mirador Independencia
    contractId: 4,
    specificLocation: 'Área de palapas y explanada de eventos familiares',
    operatingHours: 'Sábados y Domingos: 10:00 AM - 10:00 PM',
    capacity: 150,
    currentStatus: 'operational',
    startDate: '2025-03-01',
    endDate: '2027-02-28',
    monthlyFee: '1000.00',
    terms: 'Eventos hasta las 10:00 PM. Límite de ruido 65 decibeles. Limpieza obligatoria post-evento.',
    emergencyContact: 'Roberto Javier Torres Sánchez',
    emergencyPhone: '33-4567-8901',
    notes: 'Servicio integral para eventos familiares con catering y decoración incluidos',
    latitude: '20.6868',
    longitude: '-103.3370'
  },
  {
    concessionTypeId: 8, // Teatro y Espectáculos al Aire Libre
    concessionaireId: 76, // Guadalupe Fernández López
    parkId: 7, // Parque González Gallo
    contractId: 5,
    specificLocation: 'Anfiteatro natural, área de espectáculos',
    operatingHours: 'Sábados y Domingos: 4:00 PM - 8:00 PM',
    capacity: 100,
    currentStatus: 'operational',
    startDate: '2025-01-20',
    endDate: '2026-12-31',
    monthlyFee: '833.33',
    terms: 'Contenido familiar apropiado. Montaje y desmontaje el mismo día. Solo fines de semana.',
    emergencyContact: 'Guadalupe Fernández López',
    emergencyPhone: '33-5678-9012',
    notes: 'Compañía teatral especializada en obras familiares y cuentacuentos tradicionales',
    latitude: '20.6597',
    longitude: '-103.3932'
  },
  {
    concessionTypeId: 2, // Renta de bicicletas
    concessionaireId: 77, // Miguel Ángel Vargas Moreno
    parkId: 18, // Bosque Urbano Tlaquepaque
    contractId: 6,
    specificLocation: 'Entrada principal del bosque, estación de bicicletas',
    operatingHours: 'Lunes a Domingo: 8:00 AM - 6:00 PM',
    capacity: 50,
    currentStatus: 'operational',
    startDate: '2025-02-15',
    endDate: '2028-02-14',
    monthlyFee: '1500.00',
    terms: 'Mantenimiento semanal obligatorio. Cascos incluidos. Seguro de accidentes vigente.',
    emergencyContact: 'Miguel Ángel Vargas Moreno',
    emergencyPhone: '33-6789-0123',
    notes: 'Flota de 50 bicicletas ecológicas con estación de reparación',
    latitude: '20.6413',
    longitude: '-103.2946'
  },
  {
    concessionTypeId: 6, // Carrito de Helados
    concessionaireId: 78, // Patricia Isabel Ramírez Gutiérrez
    parkId: 4, // Parque Alcalde
    contractId: 7,
    specificLocation: 'Área de juegos infantiles, ubicación fija',
    operatingHours: 'Lunes a Domingo: 10:00 AM - 8:00 PM',
    capacity: 30,
    currentStatus: 'operational',
    startDate: '2025-01-10',
    endDate: '2026-06-30',
    monthlyFee: '500.00',
    terms: 'Productos sin conservadores artificiales. Sabores regionales de Jalisco. Higiene estricta.',
    emergencyContact: 'Patricia Isabel Ramírez Gutiérrez',
    emergencyPhone: '33-7890-1234',
    notes: 'Carrito artesanal con helados de sabores típicos: tequila, horchata, tamarindo',
    latitude: '20.6775',
    longitude: '-103.3370'
  },
  {
    concessionTypeId: 3, // Kiosco de información turística
    concessionaireId: 79, // Fernando José Castillo Herrera
    parkId: 20, // Parque Montenegro
    contractId: 8,
    specificLocation: 'Entrada principal del parque, kiosco de información',
    operatingHours: 'Lunes a Domingo: 9:00 AM - 6:00 PM',
    capacity: 10,
    currentStatus: 'operational',
    startDate: '2025-03-15',
    endDate: '2027-03-14',
    monthlyFee: '416.67',
    terms: 'Personal bilingüe obligatorio. Información actualizada mensualmente. Souvenirs ecológicos únicamente.',
    emergencyContact: 'Fernando José Castillo Herrera',
    emergencyPhone: '33-8901-2345',
    notes: 'Kiosco especializado en turismo sustentable con productos ecológicos certificados',
    latitude: '20.6684',
    longitude: '-103.3632'
  },
  {
    concessionTypeId: 5, // Eventos y espectáculos
    concessionaireId: 80, // Sandra Liliana Jiménez Paz
    parkId: 15, // Parque General Luis Quintanar
    contractId: 9,
    specificLocation: 'Explanada principal, área de eventos culturales',
    operatingHours: 'Viernes a Domingos: 6:00 PM - 10:00 PM',
    capacity: 200,
    currentStatus: 'operational',
    startDate: '2025-04-01',
    endDate: '2026-09-30',
    monthlyFee: '1166.67',
    terms: 'Eventos culturales y educativos únicamente. Aforo máximo 200 personas. Permisos municipales previos.',
    emergencyContact: 'Sandra Liliana Jiménez Paz',
    emergencyPhone: '33-9012-3456',
    notes: 'Organización especializada en eventos culturales con enfoque educativo y comunitario',
    latitude: '20.6908',
    longitude: '-103.3467'
  },
  {
    concessionTypeId: 4, // Escuela de deportes acuáticos
    concessionaireId: 81, // Alejandro Daniel Morales Castro
    parkId: 17, // Parque de la Liberación
    contractId: 10,
    specificLocation: 'Alberca olímpica, área de deportes acuáticos',
    operatingHours: 'Lunes a Sábado: 6:00 AM - 9:00 PM',
    capacity: 30,
    currentStatus: 'operational',
    startDate: '2025-05-01',
    endDate: '2028-04-30',
    monthlyFee: '1833.33',
    terms: 'Instructores certificados FINA. Grupos máximo 8 personas. Equipo de seguridad acuática obligatorio.',
    emergencyContact: 'Alejandro Daniel Morales Castro',
    emergencyPhone: '33-0123-4567',
    notes: 'Escuela profesional con certificaciones FINA, clases de natación y waterpolo',
    latitude: '20.6754',
    longitude: '-103.3370'
  }
];

export async function seedActiveConcessions() {
  try {
    console.log('🏊 Iniciando creación de concesiones activas...');

    // Eliminar concesiones activas existentes para evitar duplicados
    await db.delete(activeConcessions);
    console.log('🗑️ Concesiones activas existentes eliminadas');

    // Insertar nuevas concesiones activas
    const insertedConcessions = await db.insert(activeConcessions).values(
      activeConcessionData.map(concession => ({
        concessionTypeId: concession.concessionTypeId,
        concessionaireId: concession.concessionaireId,
        parkId: concession.parkId,
        contractId: concession.contractId,
        specificLocation: concession.specificLocation,
        operatingHours: concession.operatingHours,
        capacity: concession.capacity,
        currentStatus: concession.currentStatus,
        startDate: concession.startDate,
        endDate: concession.endDate,
        monthlyFee: concession.monthlyFee,
        terms: concession.terms,
        emergencyContact: concession.emergencyContact,
        emergencyPhone: concession.emergencyPhone,
        notes: concession.notes,
        latitude: concession.latitude,
        longitude: concession.longitude,
        createdById: 1 // Admin user
      }))
    ).returning();

    console.log(`✅ ${insertedConcessions.length} concesiones activas creadas exitosamente`);
    
    // Mostrar resumen de concesiones activas creadas
    console.log('\n🎯 Resumen de concesiones activas creadas:');
    activeConcessionData.forEach((concession, index) => {
      console.log(`${index + 1}. ${concession.specificLocation} - Capacidad: ${concession.capacity} - $${concession.monthlyFee}/mes`);
    });

    console.log('\n📊 Estadísticas generales:');
    const totalCapacity = activeConcessionData.reduce((sum, c) => sum + c.capacity, 0);
    const totalMonthlyRevenue = activeConcessionData.reduce((sum, c) => sum + parseFloat(c.monthlyFee), 0);
    console.log(`- Capacidad total combinada: ${totalCapacity} personas`);
    console.log(`- Ingresos mensuales estimados: $${totalMonthlyRevenue.toFixed(2)}`);
    console.log(`- Parques con concesiones activas: ${new Set(activeConcessionData.map(c => c.parkId)).size}`);

    return insertedConcessions;
  } catch (error) {
    console.error('❌ Error al crear concesiones activas:', error);
    throw error;
  }
}

// Ejecutar directamente
seedActiveConcessions()
  .then(() => {
    console.log('🎉 Proceso de creación de concesiones activas completado');
  })
  .catch((error) => {
    console.error('💥 Error en el proceso:', error);
  });