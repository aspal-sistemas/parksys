import { pool } from './db';

/**
 * INICIALIZACIÓN DEL MÓDULO DE CONTABILIDAD
 * ========================================
 * 
 * Sistema de categorías jerárquicas de 5 niveles (A→B→C→D→E)
 * Integrado con códigos SAT mexicanos
 * Filosofía de "única fuente de verdad" para clasificación financiera
 */

export async function createAccountingModule() {
  console.log('🧮 Inicializando Módulo de Contabilidad...');
  
  try {
    // Crear todas las tablas
    await createAccountingTables();
    
    // Insertar categorías jerárquicas
    await insertHierarchicalCategories();
    
    // Configurar configuraciones contables
    await setupAccountingSettings();
    
    // Crear centros de costo básicos
    await createBasicCostCenters();
    
    console.log('✅ Módulo de Contabilidad inicializado exitosamente');
    
  } catch (error) {
    console.error('❌ Error al inicializar el módulo de contabilidad:', error);
    throw error;
  }
}

async function createAccountingTables() {
  console.log('📊 Creando tablas del módulo contable...');
  
  // Tabla de categorías contables jerárquicas
  await pool.query(`
    CREATE TABLE IF NOT EXISTS accounting_categories (
      id SERIAL PRIMARY KEY,
      code VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      level INTEGER NOT NULL,
      parent_id INTEGER REFERENCES accounting_categories(id),
      sat_code VARCHAR(20),
      account_nature VARCHAR(10) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_by INTEGER,
      full_path VARCHAR(500),
      sort_order INTEGER DEFAULT 0,
      metadata JSONB
    );
  `);
  
  // Tabla de transacciones contables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS accounting_transactions (
      id SERIAL PRIMARY KEY,
      uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
      date DATE NOT NULL,
      description TEXT NOT NULL,
      reference VARCHAR(100),
      amount DECIMAL(15,2) NOT NULL,
      category_id INTEGER REFERENCES accounting_categories(id) NOT NULL,
      transaction_type VARCHAR(20) NOT NULL,
      source_module VARCHAR(50),
      source_id INTEGER,
      status VARCHAR(20) DEFAULT 'completed',
      is_recurring BOOLEAN DEFAULT false,
      recurring_config JSONB,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_by INTEGER
    );
  `);
  
  // Tabla de asientos contables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS accounting_entries (
      id SERIAL PRIMARY KEY,
      uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
      entry_number VARCHAR(50) UNIQUE NOT NULL,
      date DATE NOT NULL,
      description TEXT NOT NULL,
      reference VARCHAR(100),
      total_amount DECIMAL(15,2) NOT NULL,
      is_balanced BOOLEAN DEFAULT false,
      status VARCHAR(20) DEFAULT 'draft',
      source_transaction_id INTEGER REFERENCES accounting_transactions(id),
      metadata JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_by INTEGER
    );
  `);
  
  // Tabla de detalles de asientos
  await pool.query(`
    CREATE TABLE IF NOT EXISTS accounting_entry_details (
      id SERIAL PRIMARY KEY,
      entry_id INTEGER REFERENCES accounting_entries(id) NOT NULL,
      category_id INTEGER REFERENCES accounting_categories(id) NOT NULL,
      description TEXT,
      debit_amount DECIMAL(15,2) DEFAULT 0,
      credit_amount DECIMAL(15,2) DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Tabla de saldos de cuentas
  await pool.query(`
    CREATE TABLE IF NOT EXISTS account_balances (
      id SERIAL PRIMARY KEY,
      category_id INTEGER REFERENCES accounting_categories(id) NOT NULL,
      period VARCHAR(10) NOT NULL,
      beginning_balance DECIMAL(15,2) DEFAULT 0,
      debit_total DECIMAL(15,2) DEFAULT 0,
      credit_total DECIMAL(15,2) DEFAULT 0,
      ending_balance DECIMAL(15,2) DEFAULT 0,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(category_id, period)
    );
  `);
  
  // Tabla de activos fijos
  await pool.query(`
    CREATE TABLE IF NOT EXISTS fixed_assets (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      category_id INTEGER REFERENCES accounting_categories(id) NOT NULL,
      acquisition_date DATE NOT NULL,
      acquisition_cost DECIMAL(15,2) NOT NULL,
      useful_life INTEGER NOT NULL,
      residual_value DECIMAL(15,2) DEFAULT 0,
      depreciation_method VARCHAR(20) DEFAULT 'straight_line',
      accumulated_depreciation DECIMAL(15,2) DEFAULT 0,
      net_book_value DECIMAL(15,2) NOT NULL,
      status VARCHAR(20) DEFAULT 'active',
      location VARCHAR(200),
      metadata JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_by INTEGER
    );
  `);
  
  // Tabla de depreciación mensual
  await pool.query(`
    CREATE TABLE IF NOT EXISTS monthly_depreciation (
      id SERIAL PRIMARY KEY,
      asset_id INTEGER REFERENCES fixed_assets(id) NOT NULL,
      period VARCHAR(10) NOT NULL,
      monthly_amount DECIMAL(15,2) NOT NULL,
      accumulated_to_date DECIMAL(15,2) NOT NULL,
      remaining_value DECIMAL(15,2) NOT NULL,
      entry_id INTEGER REFERENCES accounting_entries(id),
      status VARCHAR(20) DEFAULT 'calculated',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(asset_id, period)
    );
  `);
  
  // Tabla de configuración contable
  await pool.query(`
    CREATE TABLE IF NOT EXISTS accounting_settings (
      id SERIAL PRIMARY KEY,
      key VARCHAR(100) UNIQUE NOT NULL,
      value TEXT NOT NULL,
      data_type VARCHAR(20) DEFAULT 'string',
      description TEXT,
      category VARCHAR(50) DEFAULT 'general',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Tabla de centros de costo
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cost_centers (
      id SERIAL PRIMARY KEY,
      code VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      parent_id INTEGER REFERENCES cost_centers(id),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Crear índices para optimización
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_accounting_categories_level ON accounting_categories(level);
    CREATE INDEX IF NOT EXISTS idx_accounting_categories_parent ON accounting_categories(parent_id);
    CREATE INDEX IF NOT EXISTS idx_accounting_transactions_date ON accounting_transactions(date);
    CREATE INDEX IF NOT EXISTS idx_accounting_transactions_category ON accounting_transactions(category_id);
    CREATE INDEX IF NOT EXISTS idx_accounting_entries_date ON accounting_entries(date);
    CREATE INDEX IF NOT EXISTS idx_account_balances_period ON account_balances(period);
  `);
  
  console.log('✅ Tablas del módulo contable creadas exitosamente');
}

async function insertHierarchicalCategories() {
  console.log('🏗️ Insertando categorías contables jerárquicas...');
  
  // Verificar si ya existen categorías
  const existingCategories = await pool.query('SELECT COUNT(*) FROM accounting_categories');
  if (parseInt(existingCategories.rows[0].count) > 0) {
    console.log('📋 Las categorías contables ya existen');
    return;
  }
  
  const categories = [
    // NIVEL A - CUENTAS PRINCIPALES
    { code: 'A', name: 'Activos', level: 1, parent_id: null, sat_code: '100', account_nature: 'deudora', full_path: 'A' },
    { code: 'B', name: 'Pasivos', level: 1, parent_id: null, sat_code: '200', account_nature: 'acreedora', full_path: 'B' },
    { code: 'C', name: 'Capital', level: 1, parent_id: null, sat_code: '300', account_nature: 'acreedora', full_path: 'C' },
    { code: 'D', name: 'Ingresos', level: 1, parent_id: null, sat_code: '400', account_nature: 'acreedora', full_path: 'D' },
    { code: 'E', name: 'Costos', level: 1, parent_id: null, sat_code: '500', account_nature: 'deudora', full_path: 'E' },
    { code: 'F', name: 'Gastos', level: 1, parent_id: null, sat_code: '600', account_nature: 'deudora', full_path: 'F' },
  ];
  
  // Insertar categorías nivel A
  for (const category of categories) {
    await pool.query(`
      INSERT INTO accounting_categories (code, name, level, parent_id, sat_code, account_nature, full_path, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [category.code, category.name, category.level, category.parent_id, category.sat_code, category.account_nature, category.full_path, categories.indexOf(category)]);
  }
  
  // Obtener IDs de categorías nivel A
  const activosResult = await pool.query(`SELECT id FROM accounting_categories WHERE code = 'A'`);
  const pasivosResult = await pool.query(`SELECT id FROM accounting_categories WHERE code = 'B'`);
  const capitalResult = await pool.query(`SELECT id FROM accounting_categories WHERE code = 'C'`);
  const ingresosResult = await pool.query(`SELECT id FROM accounting_categories WHERE code = 'D'`);
  const costosResult = await pool.query(`SELECT id FROM accounting_categories WHERE code = 'E'`);
  const gastosResult = await pool.query(`SELECT id FROM accounting_categories WHERE code = 'F'`);
  
  const activosId = activosResult.rows[0].id;
  const pasivosId = pasivosResult.rows[0].id;
  const capitalId = capitalResult.rows[0].id;
  const ingresosId = ingresosResult.rows[0].id;
  const costosId = costosResult.rows[0].id;
  const gastosId = gastosResult.rows[0].id;
  
  // NIVEL B - SUBCATEGORÍAS PRINCIPALES
  const levelBCategories = [
    // Activos
    { code: 'A-1', name: 'Activos Circulantes', level: 2, parent_id: activosId, sat_code: '101', account_nature: 'deudora', full_path: 'A.A-1' },
    { code: 'A-2', name: 'Activos Fijos', level: 2, parent_id: activosId, sat_code: '102', account_nature: 'deudora', full_path: 'A.A-2' },
    { code: 'A-3', name: 'Activos Diferidos', level: 2, parent_id: activosId, sat_code: '103', account_nature: 'deudora', full_path: 'A.A-3' },
    
    // Pasivos
    { code: 'B-1', name: 'Pasivos Circulantes', level: 2, parent_id: pasivosId, sat_code: '201', account_nature: 'acreedora', full_path: 'B.B-1' },
    { code: 'B-2', name: 'Pasivos Fijos', level: 2, parent_id: pasivosId, sat_code: '202', account_nature: 'acreedora', full_path: 'B.B-2' },
    { code: 'B-3', name: 'Pasivos Diferidos', level: 2, parent_id: pasivosId, sat_code: '203', account_nature: 'acreedora', full_path: 'B.B-3' },
    
    // Capital
    { code: 'C-1', name: 'Capital Social', level: 2, parent_id: capitalId, sat_code: '301', account_nature: 'acreedora', full_path: 'C.C-1' },
    { code: 'C-2', name: 'Capital Ganado', level: 2, parent_id: capitalId, sat_code: '302', account_nature: 'acreedora', full_path: 'C.C-2' },
    
    // Ingresos
    { code: 'D-1', name: 'Ingresos Operacionales', level: 2, parent_id: ingresosId, sat_code: '401', account_nature: 'acreedora', full_path: 'D.D-1' },
    { code: 'D-2', name: 'Ingresos No Operacionales', level: 2, parent_id: ingresosId, sat_code: '402', account_nature: 'acreedora', full_path: 'D.D-2' },
    
    // Costos
    { code: 'E-1', name: 'Costos Directos', level: 2, parent_id: costosId, sat_code: '501', account_nature: 'deudora', full_path: 'E.E-1' },
    { code: 'E-2', name: 'Costos Indirectos', level: 2, parent_id: costosId, sat_code: '502', account_nature: 'deudora', full_path: 'E.E-2' },
    
    // Gastos
    { code: 'F-1', name: 'Gastos Operacionales', level: 2, parent_id: gastosId, sat_code: '601', account_nature: 'deudora', full_path: 'F.F-1' },
    { code: 'F-2', name: 'Gastos No Operacionales', level: 2, parent_id: gastosId, sat_code: '602', account_nature: 'deudora', full_path: 'F.F-2' },
  ];
  
  // Insertar categorías nivel B
  for (const category of levelBCategories) {
    await pool.query(`
      INSERT INTO accounting_categories (code, name, level, parent_id, sat_code, account_nature, full_path, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [category.code, category.name, category.level, category.parent_id, category.sat_code, category.account_nature, category.full_path, levelBCategories.indexOf(category)]);
  }
  
  // Obtener algunos IDs para nivel C
  const activosCirculantesResult = await pool.query(`SELECT id FROM accounting_categories WHERE code = 'A-1'`);
  const activosFijosResult = await pool.query(`SELECT id FROM accounting_categories WHERE code = 'A-2'`);
  const gastosOperacionalesResult = await pool.query(`SELECT id FROM accounting_categories WHERE code = 'F-1'`);
  const ingresosOperacionalesResult = await pool.query(`SELECT id FROM accounting_categories WHERE code = 'D-1'`);
  
  const activosCirculantesId = activosCirculantesResult.rows[0].id;
  const activosFijosId = activosFijosResult.rows[0].id;
  const gastosOperacionalesId = gastosOperacionalesResult.rows[0].id;
  const ingresosOperacionalesId = ingresosOperacionalesResult.rows[0].id;
  
  // NIVEL C - SUBCATEGORÍAS ESPECÍFICAS
  const levelCCategories = [
    // Activos Circulantes
    { code: 'A-1-1', name: 'Efectivo y Equivalentes', level: 3, parent_id: activosCirculantesId, sat_code: '101-01', account_nature: 'deudora', full_path: 'A.A-1.A-1-1' },
    { code: 'A-1-2', name: 'Cuentas por Cobrar', level: 3, parent_id: activosCirculantesId, sat_code: '101-02', account_nature: 'deudora', full_path: 'A.A-1.A-1-2' },
    { code: 'A-1-3', name: 'Inventarios', level: 3, parent_id: activosCirculantesId, sat_code: '101-03', account_nature: 'deudora', full_path: 'A.A-1.A-1-3' },
    
    // Activos Fijos
    { code: 'A-2-1', name: 'Terrenos', level: 3, parent_id: activosFijosId, sat_code: '102-01', account_nature: 'deudora', full_path: 'A.A-2.A-2-1' },
    { code: 'A-2-2', name: 'Edificios', level: 3, parent_id: activosFijosId, sat_code: '102-02', account_nature: 'deudora', full_path: 'A.A-2.A-2-2' },
    { code: 'A-2-3', name: 'Maquinaria y Equipo', level: 3, parent_id: activosFijosId, sat_code: '102-03', account_nature: 'deudora', full_path: 'A.A-2.A-2-3' },
    
    // Gastos Operacionales
    { code: 'F-1-1', name: 'Gastos de Administración', level: 3, parent_id: gastosOperacionalesId, sat_code: '601-01', account_nature: 'deudora', full_path: 'F.F-1.F-1-1' },
    { code: 'F-1-2', name: 'Gastos de Ventas', level: 3, parent_id: gastosOperacionalesId, sat_code: '601-02', account_nature: 'deudora', full_path: 'F.F-1.F-1-2' },
    { code: 'F-1-3', name: 'Gastos de Mantenimiento', level: 3, parent_id: gastosOperacionalesId, sat_code: '601-03', account_nature: 'deudora', full_path: 'F.F-1.F-1-3' },
    
    // Ingresos Operacionales
    { code: 'D-1-1', name: 'Ingresos por Servicios', level: 3, parent_id: ingresosOperacionalesId, sat_code: '401-01', account_nature: 'acreedora', full_path: 'D.D-1.D-1-1' },
    { code: 'D-1-2', name: 'Ingresos por Concesiones', level: 3, parent_id: ingresosOperacionalesId, sat_code: '401-02', account_nature: 'acreedora', full_path: 'D.D-1.D-1-2' },
    { code: 'D-1-3', name: 'Ingresos por Patrocinios', level: 3, parent_id: ingresosOperacionalesId, sat_code: '401-03', account_nature: 'acreedora', full_path: 'D.D-1.D-1-3' },
  ];
  
  // Insertar categorías nivel C
  for (const category of levelCCategories) {
    await pool.query(`
      INSERT INTO accounting_categories (code, name, level, parent_id, sat_code, account_nature, full_path, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [category.code, category.name, category.level, category.parent_id, category.sat_code, category.account_nature, category.full_path, levelCCategories.indexOf(category)]);
  }
  
  console.log('✅ Categorías contables jerárquicas insertadas exitosamente');
}

async function setupAccountingSettings() {
  console.log('⚙️ Configurando configuraciones contables...');
  
  const settings = [
    { key: 'fiscal_year_start', value: '01-01', data_type: 'string', description: 'Inicio del año fiscal (MM-DD)', category: 'fiscal' },
    { key: 'fiscal_year_end', value: '12-31', data_type: 'string', description: 'Fin del año fiscal (MM-DD)', category: 'fiscal' },
    { key: 'currency', value: 'MXN', data_type: 'string', description: 'Moneda base del sistema', category: 'general' },
    { key: 'tax_rate', value: '16', data_type: 'number', description: 'Tasa de IVA (%)', category: 'fiscal' },
    { key: 'auto_generate_entries', value: 'true', data_type: 'boolean', description: 'Generar asientos automáticamente', category: 'automation' },
    { key: 'depreciation_method', value: 'straight_line', data_type: 'string', description: 'Método de depreciación por defecto', category: 'assets' },
    { key: 'entry_number_format', value: 'AST-{YYYY}-{MM}-{####}', data_type: 'string', description: 'Formato de número de asiento', category: 'numbering' },
    { key: 'require_balanced_entries', value: 'true', data_type: 'boolean', description: 'Requerir asientos balanceados', category: 'validation' },
  ];
  
  for (const setting of settings) {
    await pool.query(`
      INSERT INTO accounting_settings (key, value, data_type, description, category)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (key) DO NOTHING
    `, [setting.key, setting.value, setting.data_type, setting.description, setting.category]);
  }
  
  console.log('✅ Configuraciones contables establecidas');
}

async function createBasicCostCenters() {
  console.log('🏢 Creando centros de costo básicos...');
  
  const costCenters = [
    { code: 'ADM', name: 'Administración General', description: 'Gastos administrativos generales' },
    { code: 'PAR', name: 'Operación de Parques', description: 'Gastos operativos de parques' },
    { code: 'MAN', name: 'Mantenimiento', description: 'Gastos de mantenimiento' },
    { code: 'SEG', name: 'Seguridad', description: 'Gastos de seguridad' },
    { code: 'MKT', name: 'Marketing', description: 'Gastos de marketing y promoción' },
  ];
  
  for (const center of costCenters) {
    await pool.query(`
      INSERT INTO cost_centers (code, name, description)
      VALUES ($1, $2, $3)
      ON CONFLICT (code) DO NOTHING
    `, [center.code, center.name, center.description]);
  }
  
  console.log('✅ Centros de costo básicos creados');
}