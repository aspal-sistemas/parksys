/**
 * Script para crear 10 contratos de concesión que vinculan concesionarios con tipos de concesión
 */

import { db } from './db';
import { concessionContracts } from '../shared/schema';

interface ContractData {
  parkId: number;
  concessionaireId: number;
  concessionTypeId: number;
  startDate: string;
  endDate: string;
  fee: string;
  exclusivityClauses: string;
  restrictions: string;
  status: string;
  notes: string;
}

const contractsData: ContractData[] = [
  {
    parkId: 5, // Bosque Los Colomos
    concessionaireId: 72, // María Elena Rodríguez García
    concessionTypeId: 1, // Venta de alimentos
    startDate: '2025-01-01',
    endDate: '2027-12-31',
    fee: '15000.00',
    exclusivityClauses: 'Exclusividad en venta de café orgánico y productos naturales en zona norte del parque',
    restrictions: 'Horario de operación: 7:00 AM - 7:00 PM. Prohibida música amplificada después de las 6:00 PM',
    status: 'active',
    notes: 'Concesión para café especializado con enfoque en productos orgánicos y sustentables'
  },
  {
    parkId: 19, // Parque Agua Azul
    concessionaireId: 73, // Carlos Alberto Mendoza Ruiz
    concessionTypeId: 9, // Deportes Acuáticos y Kayak
    startDate: '2025-02-01',
    endDate: '2028-01-31',
    fee: '25000.00',
    exclusivityClauses: 'Exclusividad en deportes acuáticos en toda la laguna principal del parque',
    restrictions: 'Máximo 20 personas por sesión. Instructores certificados obligatorios. Seguros de responsabilidad civil',
    status: 'active',
    notes: 'Escuela de deportes acuáticos con enfoque en kayak, paddleboard y natación recreativa'
  },
  {
    parkId: 2, // Parque Metropolitano de Guadalajara
    concessionaireId: 74, // Ana Sofía Luna Hernández
    concessionTypeId: 11, // Food Truck Cocina Internacional
    startDate: '2025-01-15',
    endDate: '2026-01-14',
    fee: '8000.00',
    exclusivityClauses: 'Exclusividad en venta de comida asiática fusion en área de food trucks',
    restrictions: 'Ubicación rotativa cada 3 meses. Cumplimiento estricto normas sanitarias. Generador eléctrico silencioso',
    status: 'active',
    notes: 'Food truck especializado en cocina asiática fusion con ingredientes locales'
  },
  {
    parkId: 6, // Parque Mirador Independencia
    concessionaireId: 75, // Roberto Javier Torres Sánchez
    concessionTypeId: 10, // Organización de Eventos Familiares
    startDate: '2025-03-01',
    endDate: '2027-02-28',
    fee: '12000.00',
    exclusivityClauses: 'Exclusividad en organización de eventos familiares en palapas y área de eventos',
    restrictions: 'Eventos máximo hasta las 10:00 PM. Límite de ruido 65 decibeles. Limpieza obligatoria post-evento',
    status: 'active',
    notes: 'Organización profesional de eventos familiares con servicios integrales de decoración y catering'
  },
  {
    parkId: 7, // Parque González Gallo
    concessionaireId: 76, // Guadalupe Fernández López
    concessionTypeId: 8, // Teatro y Espectáculos al Aire Libre
    startDate: '2025-01-20',
    endDate: '2026-12-31',
    fee: '10000.00',
    exclusivityClauses: 'Exclusividad en presentaciones teatrales en anfiteatro natural del parque',
    restrictions: 'Presentaciones solo fines de semana. Contenido familiar apropiado. Montaje/desmontaje mismo día',
    status: 'active',
    notes: 'Compañía teatral especializada en obras familiares y espectáculos educativos al aire libre'
  },
  {
    parkId: 18, // Bosque Urbano Tlaquepaque
    concessionaireId: 77, // Miguel Ángel Vargas Moreno
    concessionTypeId: 2, // Renta de bicicletas
    startDate: '2025-02-15',
    endDate: '2028-02-14',
    fee: '18000.00',
    exclusivityClauses: 'Exclusividad en renta de bicicletas en todo el bosque urbano y senderos',
    restrictions: 'Mantenimiento semanal obligatorio. Cascos incluidos. Horario: 8:00 AM - 6:00 PM',
    status: 'active',
    notes: 'Servicio de renta de bicicletas ecológicas con estación de reparación y mantenimiento'
  },
  {
    parkId: 4, // Parque Alcalde
    concessionaireId: 78, // Patricia Isabel Ramírez Gutiérrez
    concessionTypeId: 6, // Carrito de Helados
    startDate: '2025-01-10',
    endDate: '2026-06-30',
    fee: '6000.00',
    exclusivityClauses: 'Exclusividad en venta de helados artesanales en área de juegos infantiles',
    restrictions: 'Productos sin conservadores artificiales. Ubicación fija junto a área infantil. Horario: 10:00 AM - 8:00 PM',
    status: 'active',
    notes: 'Carrito de helados artesanales con sabores regionales de Jalisco'
  },
  {
    parkId: 20, // Parque Montenegro
    concessionaireId: 79, // Fernando José Castillo Herrera
    concessionTypeId: 3, // Kiosco de información turística
    startDate: '2025-03-15',
    endDate: '2027-03-14',
    fee: '5000.00',
    exclusivityClauses: 'Exclusividad en servicios de información turística y venta de souvenirs ecológicos',
    restrictions: 'Personal bilingüe obligatorio. Información actualizada mensualmente. Materiales promocionales sustentables',
    status: 'active',
    notes: 'Kiosco de información turística con enfoque en turismo sustentable y productos ecológicos'
  },
  {
    parkId: 15, // Parque General Luis Quintanar
    concessionaireId: 80, // Sandra Liliana Jiménez Paz
    concessionTypeId: 5, // Eventos y espectáculos
    startDate: '2025-04-01',
    endDate: '2026-09-30',
    fee: '14000.00',
    exclusivityClauses: 'Exclusividad en eventos culturales y espectáculos en explanada principal',
    restrictions: 'Eventos culturales y educativos únicamente. Aforo máximo 200 personas. Permisos municipales previos',
    status: 'active',
    notes: 'Organización de eventos culturales y espectáculos artísticos con enfoque educativo'
  },
  {
    parkId: 17, // Parque de la Liberación
    concessionaireId: 81, // Alejandro Daniel Morales Castro
    concessionTypeId: 4, // Escuela de deportes acuáticos
    startDate: '2025-05-01',
    endDate: '2028-04-30',
    fee: '22000.00',
    exclusivityClauses: 'Exclusividad en enseñanza de natación y deportes acuáticos en alberca olímpica',
    restrictions: 'Instructores certificados FINA. Grupos máximo 8 personas. Equipo de seguridad acuática obligatorio',
    status: 'active',
    notes: 'Escuela profesional de natación y deportes acuáticos con certificaciones internacionales'
  }
];

export async function seedConcessionContracts() {
  try {
    console.log('🏢 Iniciando creación de contratos de concesión...');

    // Eliminar contratos existentes para evitar duplicados
    await db.delete(concessionContracts);
    console.log('🗑️ Contratos existentes eliminados');

    // Insertar nuevos contratos
    const insertedContracts = await db.insert(concessionContracts).values(
      contractsData.map(contract => ({
        parkId: contract.parkId,
        concessionaireId: contract.concessionaireId,
        concessionTypeId: contract.concessionTypeId,
        startDate: contract.startDate,
        endDate: contract.endDate,
        fee: contract.fee,
        exclusivityClauses: contract.exclusivityClauses,
        restrictions: contract.restrictions,
        status: contract.status,
        notes: contract.notes,
        createdById: 1 // Admin user
      }))
    ).returning();

    console.log(`✅ ${insertedContracts.length} contratos de concesión creados exitosamente`);
    
    // Mostrar resumen de contratos creados
    console.log('\n📋 Resumen de contratos creados:');
    contractsData.forEach((contract, index) => {
      console.log(`${index + 1}. Parque ${contract.parkId} - Concesionario ${contract.concessionaireId} - Tipo ${contract.concessionTypeId} - $${contract.fee}`);
    });

    return insertedContracts;
  } catch (error) {
    console.error('❌ Error al crear contratos de concesión:', error);
    throw error;
  }
}

// Ejecutar directamente si el archivo se ejecuta solo
if (require.main === module) {
  seedConcessionContracts()
    .then(() => {
      console.log('🎉 Proceso de creación de contratos completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en el proceso:', error);
      process.exit(1);
    });
}