/**
 * Script para crear las tablas relacionadas con el módulo de contratos de concesiones
 */

import { db } from './db';
import { concessionContracts } from '../shared/schema';
import { sql } from 'drizzle-orm';

export async function createConcessionContractsTables() {
  console.log("Creando tablas para el módulo de contratos de concesiones...");
  
  try {
    // Verificar si la tabla ya existe
    const tablesResult = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'concession_contracts'
    `);
    
    if (tablesResult.rowCount === 0) {
      console.log("Creando tabla 'concession_contracts'...");
      
      // Crear la tabla
      await db.execute(sql`
        CREATE TABLE concession_contracts (
          id SERIAL PRIMARY KEY,
          park_id INTEGER NOT NULL,
          concessionaire_id INTEGER NOT NULL,
          concession_type_id INTEGER NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          fee DECIMAL(10, 2) NOT NULL,
          exclusivity_clauses TEXT,
          restrictions TEXT,
          contract_file_url TEXT,
          status VARCHAR(20) NOT NULL DEFAULT 'active',
          has_extension BOOLEAN DEFAULT FALSE,
          extension_date DATE,
          notes TEXT,
          created_by_id INTEGER,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        )
      `);
      
      console.log("Tabla 'concession_contracts' creada exitosamente");
      
      // Crear índices
      await db.execute(sql`
        CREATE INDEX idx_concession_contracts_park_id ON concession_contracts(park_id)
      `);
      
      await db.execute(sql`
        CREATE INDEX idx_concession_contracts_concessionaire_id ON concession_contracts(concessionaire_id)
      `);
      
      await db.execute(sql`
        CREATE INDEX idx_concession_contracts_concession_type_id ON concession_contracts(concession_type_id)
      `);
      
      await db.execute(sql`
        CREATE INDEX idx_concession_contracts_status ON concession_contracts(status)
      `);
      
      await db.execute(sql`
        CREATE INDEX idx_concession_contracts_end_date ON concession_contracts(end_date)
      `);
      
      console.log("Índices creados exitosamente");
    } else {
      console.log("La tabla 'concession_contracts' ya existe");
    }
    
    console.log("Tablas para el módulo de contratos de concesiones creadas correctamente");
    return true;
    
  } catch (error) {
    console.error("Error al crear tablas para el módulo de contratos de concesiones:", error);
    return false;
  }
}

// Si se ejecuta directamente este script
if (require.main === module) {
  createConcessionContractsTables()
    .then(() => {
      console.log("Script de creación de tablas de contratos de concesiones completado");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error en script de creación de tablas de contratos de concesiones:", error);
      process.exit(1);
    });
}