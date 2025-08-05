import { pool } from './db';

/**
 * Script para crear las tablas del sistema de contratos de patrocinio
 */
export async function createSponsorshipContractsTables() {
  try {
    console.log('🎯 Creando tablas del sistema de contratos de patrocinio...');

    // Tabla principal de contratos de patrocinio
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sponsorship_contracts (
        id SERIAL PRIMARY KEY,
        sponsor_id INTEGER REFERENCES sponsors(id) ON DELETE CASCADE,
        package_id INTEGER REFERENCES sponsorship_packages(id) ON DELETE SET NULL,
        campaign_id INTEGER REFERENCES sponsorship_campaigns(id) ON DELETE SET NULL,
        contract_number VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        total_amount DECIMAL(12,2) NOT NULL,
        payment_schedule VARCHAR(50) DEFAULT 'monthly',
        status VARCHAR(20) DEFAULT 'draft',
        signed_date DATE,
        contract_file_url VARCHAR(500),
        terms_conditions TEXT,
        deliverables TEXT,
        performance_metrics TEXT,
        contact_person VARCHAR(255),
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de pagos de contratos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contract_payments (
        id SERIAL PRIMARY KEY,
        contract_id INTEGER REFERENCES sponsorship_contracts(id) ON DELETE CASCADE,
        payment_number INTEGER NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        due_date DATE NOT NULL,
        payment_date DATE,
        payment_method VARCHAR(50),
        transaction_reference VARCHAR(100),
        status VARCHAR(20) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de eventos asociados a contratos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contract_events (
        id SERIAL PRIMARY KEY,
        contract_id INTEGER REFERENCES sponsorship_contracts(id) ON DELETE CASCADE,
        event_title VARCHAR(255) NOT NULL,
        event_date DATE NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        park_id INTEGER REFERENCES parks(id),
        description TEXT,
        expected_attendance INTEGER,
        sponsor_visibility VARCHAR(100),
        deliverables TEXT,
        status VARCHAR(20) DEFAULT 'planned',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de activos publicitarios por contrato
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contract_assets (
        id SERIAL PRIMARY KEY,
        contract_id INTEGER REFERENCES sponsorship_contracts(id) ON DELETE CASCADE,
        asset_type VARCHAR(50) NOT NULL,
        asset_name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        park_id INTEGER REFERENCES parks(id),
        dimensions VARCHAR(100),
        installation_date DATE,
        removal_date DATE,
        status VARCHAR(20) DEFAULT 'planned',
        image_url VARCHAR(500),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de renovaciones de contratos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contract_renewals (
        id SERIAL PRIMARY KEY,
        original_contract_id INTEGER REFERENCES sponsorship_contracts(id) ON DELETE CASCADE,
        new_contract_id INTEGER REFERENCES sponsorship_contracts(id) ON DELETE CASCADE,
        renewal_date DATE NOT NULL,
        reason TEXT,
        changes_made TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear índices para mejorar el rendimiento
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_sponsorship_contracts_sponsor ON sponsorship_contracts(sponsor_id);
      CREATE INDEX IF NOT EXISTS idx_sponsorship_contracts_status ON sponsorship_contracts(status);
      CREATE INDEX IF NOT EXISTS idx_sponsorship_contracts_dates ON sponsorship_contracts(start_date, end_date);
      CREATE INDEX IF NOT EXISTS idx_contract_payments_contract ON contract_payments(contract_id);
      CREATE INDEX IF NOT EXISTS idx_contract_payments_status ON contract_payments(status);
      CREATE INDEX IF NOT EXISTS idx_contract_events_contract ON contract_events(contract_id);
      CREATE INDEX IF NOT EXISTS idx_contract_assets_contract ON contract_assets(contract_id);
    `);

    console.log('✅ Tablas del sistema de contratos de patrocinio creadas exitosamente');
    
    return true;
  } catch (error) {
    console.error('Error al crear tablas del sistema de contratos de patrocinio:', error);
    throw error;
  }
}

/**
 * Función para agregar datos de ejemplo
 */
export async function addSampleContractData() {
  try {
    console.log('🎯 Agregando datos de ejemplo para contratos de patrocinio...');

    // Generar números de contrato únicos
    const contractNumbers = [
      'CTR-2025-001', 'CTR-2025-002', 'CTR-2025-003', 'CTR-2025-004', 'CTR-2025-005'
    ];

    // Contratos de ejemplo
    const sampleContracts = [
      {
        sponsor_id: 1, // Coca-Cola FEMSA
        package_id: 1, // Platino
        campaign_id: 1, // Temporada Primavera 2025
        contract_number: contractNumbers[0],
        title: 'Patrocinio Integral Temporada Primavera 2025',
        description: 'Patrocinio completo para la temporada primavera incluyendo eventos, señalización y actividades deportivas.',
        start_date: '2025-03-01',
        end_date: '2025-06-30',
        total_amount: 2500000.00,
        payment_schedule: 'quarterly',
        status: 'active',
        signed_date: '2025-02-15',
        terms_conditions: 'Términos y condiciones estándar para patrocinio integral.',
        deliverables: 'Señalización en 5 parques, 10 eventos deportivos, material promocional',
        performance_metrics: 'Alcance: 50,000 personas, Impresiones: 1,000,000',
        contact_person: 'María González',
        contact_email: 'maria.gonzalez@cocacola.com',
        contact_phone: '33-1234-5678',
        created_by: 1
      },
      {
        sponsor_id: 2, // Banco Santander
        package_id: 2, // Oro
        campaign_id: 2, // Verano en los Parques
        contract_number: contractNumbers[1],
        title: 'Patrocinio Eventos Verano 2025',
        description: 'Patrocinio para eventos de verano en parques metropolitanos.',
        start_date: '2025-06-01',
        end_date: '2025-09-30',
        total_amount: 1800000.00,
        payment_schedule: 'monthly',
        status: 'active',
        signed_date: '2025-05-20',
        terms_conditions: 'Términos específicos para eventos de verano.',
        deliverables: 'Patrocinio de 15 eventos, stands promocionales, material publicitario',
        performance_metrics: 'Alcance: 30,000 personas, Eventos: 15',
        contact_person: 'Carlos Mendoza',
        contact_email: 'carlos.mendoza@santander.com.mx',
        contact_phone: '33-2345-6789',
        created_by: 1
      },
      {
        sponsor_id: 3, // Farmacias Guadalajara
        package_id: 3, // Plata
        campaign_id: 1, // Temporada Primavera 2025
        contract_number: contractNumbers[2],
        title: 'Patrocinio Actividades Familiares',
        description: 'Patrocinio enfocado en actividades familiares y de salud.',
        start_date: '2025-04-01',
        end_date: '2025-07-31',
        total_amount: 950000.00,
        payment_schedule: 'monthly',
        status: 'draft',
        terms_conditions: 'Términos para actividades familiares y de salud.',
        deliverables: 'Patrocinio de 8 eventos familiares, material informativo de salud',
        performance_metrics: 'Alcance: 15,000 familias, Eventos: 8',
        contact_person: 'Ana Ruiz',
        contact_email: 'ana.ruiz@farmaciasguadalajara.com',
        contact_phone: '33-3456-7890',
        created_by: 1
      },
      {
        sponsor_id: 4, // Universidad de Guadalajara
        package_id: 4, // Bronce
        campaign_id: 2, // Verano en los Parques
        contract_number: contractNumbers[3],
        title: 'Patrocinio Educativo Ambiental',
        description: 'Patrocinio para talleres educativos y actividades ambientales.',
        start_date: '2025-07-01',
        end_date: '2025-12-31',
        total_amount: 750000.00,
        payment_schedule: 'biannual',
        status: 'pending',
        terms_conditions: 'Términos para actividades educativas y ambientales.',
        deliverables: 'Talleres educativos, material didáctico, conferencias',
        performance_metrics: 'Alcance: 5,000 estudiantes, Talleres: 20',
        contact_person: 'Dr. Pedro Hernández',
        contact_email: 'pedro.hernandez@udg.mx',
        contact_phone: '33-4567-8901',
        created_by: 1
      },
      {
        sponsor_id: 5, // Telmex
        package_id: 2, // Oro
        campaign_id: 1, // Temporada Primavera 2025
        contract_number: contractNumbers[4],
        title: 'Patrocinio Conectividad Digital',
        description: 'Patrocinio para instalación de WiFi y actividades digitales.',
        start_date: '2025-05-01',
        end_date: '2025-10-31',
        total_amount: 1200000.00,
        payment_schedule: 'monthly',
        status: 'expired',
        signed_date: '2025-04-15',
        terms_conditions: 'Términos para servicios de conectividad.',
        deliverables: 'WiFi gratuito en 10 parques, talleres digitales',
        performance_metrics: 'Usuarios conectados: 25,000, Talleres: 12',
        contact_person: 'Luis Morales',
        contact_email: 'luis.morales@telmex.com',
        contact_phone: '33-5678-9012',
        created_by: 1
      }
    ];

    // Insertar contratos
    for (const contract of sampleContracts) {
      await pool.query(`
        INSERT INTO sponsorship_contracts (
          sponsor_id, package_id, campaign_id, contract_number, title, description,
          start_date, end_date, total_amount, payment_schedule, status, signed_date,
          terms_conditions, deliverables, performance_metrics, contact_person,
          contact_email, contact_phone, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        ON CONFLICT (contract_number) DO NOTHING
      `, [
        contract.sponsor_id, contract.package_id, contract.campaign_id, 
        contract.contract_number, contract.title, contract.description,
        contract.start_date, contract.end_date, contract.total_amount,
        contract.payment_schedule, contract.status, contract.signed_date,
        contract.terms_conditions, contract.deliverables, contract.performance_metrics,
        contract.contact_person, contract.contact_email, contract.contact_phone,
        contract.created_by
      ]);
    }

    // Agregar pagos de ejemplo
    console.log('🎯 Agregando pagos de ejemplo...');
    
    const samplePayments = [
      { contract_id: 1, payment_number: 1, amount: 625000.00, due_date: '2025-03-31', payment_date: '2025-03-28', status: 'paid' },
      { contract_id: 1, payment_number: 2, amount: 625000.00, due_date: '2025-06-30', status: 'pending' },
      { contract_id: 2, payment_number: 1, amount: 300000.00, due_date: '2025-06-30', payment_date: '2025-06-25', status: 'paid' },
      { contract_id: 2, payment_number: 2, amount: 300000.00, due_date: '2025-07-31', status: 'pending' },
      { contract_id: 3, payment_number: 1, amount: 237500.00, due_date: '2025-04-30', status: 'overdue' }
    ];

    for (const payment of samplePayments) {
      await pool.query(`
        INSERT INTO contract_payments (contract_id, payment_number, amount, due_date, payment_date, status)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        payment.contract_id, payment.payment_number, payment.amount, 
        payment.due_date, payment.payment_date || null, payment.status
      ]);
    }

    // Agregar eventos de ejemplo
    console.log('🎯 Agregando eventos de ejemplo...');
    
    const sampleEvents = [
      {
        contract_id: 1,
        event_title: 'Torneo de Fútbol Coca-Cola',
        event_date: '2025-04-15',
        event_type: 'deportivo',
        park_id: 5,
        description: 'Torneo de fútbol juvenil patrocinado por Coca-Cola',
        expected_attendance: 2000,
        sponsor_visibility: 'Logo en uniformes y señalización',
        deliverables: 'Trofeos, medallas, refrescos para participantes',
        status: 'completed'
      },
      {
        contract_id: 2,
        event_title: 'Festival de Verano Santander',
        event_date: '2025-07-20',
        event_type: 'cultural',
        park_id: 2,
        description: 'Festival cultural de verano con actividades familiares',
        expected_attendance: 1500,
        sponsor_visibility: 'Stand promocional y material gráfico',
        deliverables: 'Escenario, sonido, actividades infantiles',
        status: 'planned'
      }
    ];

    for (const event of sampleEvents) {
      await pool.query(`
        INSERT INTO contract_events (
          contract_id, event_title, event_date, event_type, park_id, description,
          expected_attendance, sponsor_visibility, deliverables, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        event.contract_id, event.event_title, event.event_date, event.event_type,
        event.park_id, event.description, event.expected_attendance,
        event.sponsor_visibility, event.deliverables, event.status
      ]);
    }

    console.log('✅ Datos de ejemplo para contratos de patrocinio agregados exitosamente');
    
  } catch (error) {
    console.error('Error al agregar datos de ejemplo:', error);
    throw error;
  }
}