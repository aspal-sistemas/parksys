import { db } from "./db";
import { sql } from "drizzle-orm";

/**
 * Script para crear las tablas de recibos de nómina
 */
export async function createPayrollReceiptsTables() {
  try {
    console.log("Iniciando creación de tablas de recibos de nómina...");

    // Crear enum para status de recibos
    await db.execute(sql`
      CREATE TYPE payroll_receipt_status AS ENUM ('draft', 'generated', 'sent', 'confirmed')
    `).catch(() => {
      console.log("Enum payroll_receipt_status ya existe");
    });

    // Crear tabla payroll_receipts
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS payroll_receipts (
        id SERIAL PRIMARY KEY,
        period_id INTEGER NOT NULL REFERENCES payroll_periods(id),
        employee_id INTEGER NOT NULL REFERENCES employees(id),
        receipt_number VARCHAR(50) NOT NULL UNIQUE,
        generated_date TIMESTAMP DEFAULT NOW(),
        pay_date DATE NOT NULL,
        
        employee_name VARCHAR(200) NOT NULL,
        employee_position VARCHAR(100),
        employee_department VARCHAR(100),
        employee_rfc VARCHAR(20),
        
        total_gross DECIMAL(15,2) NOT NULL,
        total_deductions DECIMAL(15,2) NOT NULL,
        total_net DECIMAL(15,2) NOT NULL,
        
        pdf_file_name VARCHAR(255),
        pdf_path TEXT,
        pdf_generated BOOLEAN DEFAULT FALSE,
        
        status payroll_receipt_status DEFAULT 'draft',
        notes TEXT,
        generated_by_id INTEGER REFERENCES users(id),
        
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("Tabla payroll_receipts creada exitosamente");

    // Crear tabla payroll_receipt_details
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS payroll_receipt_details (
        id SERIAL PRIMARY KEY,
        receipt_id INTEGER NOT NULL REFERENCES payroll_receipts(id),
        concept_id INTEGER NOT NULL REFERENCES payroll_concepts(id),
        
        concept_code VARCHAR(20) NOT NULL,
        concept_name VARCHAR(100) NOT NULL,
        concept_type VARCHAR(20) NOT NULL,
        concept_category VARCHAR(50) NOT NULL,
        
        quantity DECIMAL(10,2) DEFAULT 1.00,
        rate DECIMAL(15,2),
        amount DECIMAL(15,2) NOT NULL,
        
        description TEXT,
        sort_order INTEGER DEFAULT 0,
        
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("Tabla payroll_receipt_details creada exitosamente");

    // Crear índices para mejor rendimiento
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_payroll_receipts_period_id ON payroll_receipts(period_id)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_payroll_receipts_employee_id ON payroll_receipts(employee_id)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_payroll_receipt_details_receipt_id ON payroll_receipt_details(receipt_id)
    `);

    console.log("Tablas de recibos de nómina inicializadas correctamente");
  } catch (error) {
    console.error("Error al crear tablas de recibos de nómina:", error);
    throw error;
  }
}