import { pool } from './db';

/**
 * INTEGRACIÓN FINANZAS ↔ CONTABILIDAD
 * ===================================
 * 
 * Sistema de sincronización automática entre el módulo financiero
 * y el módulo contable para generar asientos contables automáticamente
 * desde las transacciones financieras.
 */

interface FinanceTransaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  category_id: number;
  description: string;
  date: string;
  reference?: string;
}

interface AccountingEntry {
  transaction_id: number;
  reference: string;
  description: string;
  date: string;
  total_amount: number;
  created_by: number;
}

interface AccountingEntryLine {
  entry_id: number;
  account_id: number;
  debit_amount: number;
  credit_amount: number;
  description: string;
}

/**
 * Mapeo automático basado en categorías contables (single source of truth)
 */
async function getAccountingCategoryMapping(transactionType: string): Promise<any> {
  // Obtener cuentas contables principales según el tipo de transacción
  const [cajaResult, operationalResult] = await Promise.all([
    // Cuenta de efectivo (código 101.01 - Caja y efectivo)
    pool.query(`
      SELECT id, code, name, account_nature
      FROM accounting_categories 
      WHERE code = '101.01'
      LIMIT 1
    `),
    // Cuenta operacional según el tipo
    pool.query(`
      SELECT id, code, name, account_nature
      FROM accounting_categories 
      WHERE code LIKE '${transactionType === 'income' ? '4' : '5'}%' 
      AND code != '${transactionType === 'income' ? '400' : '500'}'
      ORDER BY code LIMIT 1
    `)
  ]);

  if (cajaResult.rows.length === 0 || operationalResult.rows.length === 0) {
    throw new Error(`No se encontraron cuentas contables para tipo: ${transactionType}`);
  }

  const cajaAccount = cajaResult.rows[0];
  const operationalAccount = operationalResult.rows[0];

  return {
    cajaAccount,
    operationalAccount,
    mapping: transactionType === 'income' ? {
      debitAccount: cajaAccount,   // Entra dinero a caja
      creditAccount: operationalAccount // Se registra como ingreso
    } : {
      debitAccount: operationalAccount, // Se registra como gasto
      creditAccount: cajaAccount        // Sale dinero de caja
    }
  };
}

/**
 * Genera asiento contable automáticamente desde transacción CONTABLE
 * usando categorías contables como single source of truth
 */
export async function generateAccountingJournalEntry(transaction: any, userId: number): Promise<void> {
  try {
    console.log(`📊 Generando asiento contable para transacción contable ${transaction.id}`);
    
    // Obtener información de la categoría contable
    const categoryResult = await pool.query(`
      SELECT id, code, name, account_nature, nature
      FROM accounting_categories 
      WHERE id = $1
    `, [transaction.category_id]);
    
    if (categoryResult.rows.length === 0) {
      throw new Error(`Categoría contable ${transaction.category_id} no encontrada`);
    }
    
    const category = categoryResult.rows[0];
    
    // Obtener cuenta de efectivo (101.01 - Caja y efectivo)
    const cashResult = await pool.query(`
      SELECT id, code, name, account_nature
      FROM accounting_categories 
      WHERE code = '101.01'
      LIMIT 1
    `);
    
    if (cashResult.rows.length === 0) {
      throw new Error('Cuenta de efectivo (101.01) no encontrada');
    }
    
    const cashAccount = cashResult.rows[0];
    
    // Crear asiento contable principal
    const entryResult = await pool.query(`
      INSERT INTO accounting_journal_entries 
      (transaction_id, reference, description, date, total_amount, created_by, created_at, source_type)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, 'accounting_transaction')
      RETURNING id
    `, [
      transaction.id,
      `ACC-${transaction.id}`,
      `${transaction.transaction_type === 'income' ? 'Ingreso' : 'Gasto'}: ${transaction.concept || transaction.description}`,
      transaction.date,
      transaction.amount,
      userId
    ]);

    const entryId = entryResult.rows[0].id;

    // Crear líneas del asiento según el tipo de transacción
    if (transaction.transaction_type === 'income') {
      // INGRESO: Débito en Caja, Crédito en Ingresos
      await pool.query(`
        INSERT INTO accounting_journal_entry_lines 
        (entry_id, account_id, debit_amount, credit_amount, description)
        VALUES ($1, $2, $3, $4, $5)
      `, [entryId, cashAccount.id, transaction.amount, 0, `Ingreso: ${transaction.concept}`]);
      
      await pool.query(`
        INSERT INTO accounting_journal_entry_lines 
        (entry_id, account_id, debit_amount, credit_amount, description)
        VALUES ($1, $2, $3, $4, $5)
      `, [entryId, category.id, 0, transaction.amount, `Ingreso: ${transaction.concept}`]);
    } else {
      // GASTO: Débito en Gastos, Crédito en Caja
      await pool.query(`
        INSERT INTO accounting_journal_entry_lines 
        (entry_id, account_id, debit_amount, credit_amount, description)
        VALUES ($1, $2, $3, $4, $5)
      `, [entryId, category.id, transaction.amount, 0, `Gasto: ${transaction.concept}`]);
      
      await pool.query(`
        INSERT INTO accounting_journal_entry_lines 
        (entry_id, account_id, debit_amount, credit_amount, description)
        VALUES ($1, $2, $3, $4, $5)
      `, [entryId, cashAccount.id, 0, transaction.amount, `Gasto: ${transaction.concept}`]);
    }

    // Actualizar la transacción contable con el ID del asiento
    await pool.query(
      'UPDATE accounting_transactions SET journal_entry_id = $1 WHERE id = $2',
      [entryId, transaction.id]
    );

    console.log(`✅ Asiento contable ${entryId} generado exitosamente para transacción contable ${transaction.id}`);
    
  } catch (error) {
    console.error(`❌ Error generando asiento contable para transacción contable ${transaction.id}:`, error);
    throw error;
  }
}

/**
 * Actualiza matriz de flujo de efectivo desde transacción contable
 */
export async function updateCashFlowMatrix(transaction: any): Promise<void> {
  try {
    console.log(`💰 Actualizando matriz de flujo para transacción contable ${transaction.transaction_id}`);
    
    const transactionDate = new Date(transaction.date);
    const year = transactionDate.getFullYear();
    const month = transactionDate.getMonth() + 1;
    
    // Obtener información de la categoría
    const categoryResult = await pool.query(`
      SELECT id, code, name, level, parent_id
      FROM accounting_categories 
      WHERE id = $1
    `, [transaction.category_id]);
    
    if (categoryResult.rows.length === 0) {
      console.log(`⚠️ Categoría ${transaction.category_id} no encontrada para flujo de efectivo`);
      return;
    }
    
    const category = categoryResult.rows[0];
    
    // Determinar el tipo de flujo basado en el código SAT
    let flowType = 'operational';
    if (category.code.startsWith('1')) flowType = 'investment'; // Activos
    else if (category.code.startsWith('2') || category.code.startsWith('3')) flowType = 'financing'; // Pasivos/Capital
    else if (category.code.startsWith('4') || category.code.startsWith('5')) flowType = 'operational'; // Ingresos/Gastos
    
    // Insertar o actualizar en la matriz de flujo
    await pool.query(`
      INSERT INTO cash_flow_matrix 
      (year, month, category_id, category_name, flow_type, amount, transaction_type, source_id, source_type, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      ON CONFLICT (year, month, category_id, source_id, source_type) 
      DO UPDATE SET 
        amount = cash_flow_matrix.amount + $6,
        updated_at = CURRENT_TIMESTAMP
    `, [
      year,
      month,
      transaction.category_id,
      category.name,
      flowType,
      transaction.transaction_type === 'income' ? transaction.amount : -transaction.amount,
      transaction.transaction_type,
      transaction.transaction_id,
      'accounting_transaction'
    ]);
    
    console.log(`✅ Matriz de flujo actualizada para transacción contable ${transaction.transaction_id}`);
    
  } catch (error) {
    console.error(`❌ Error actualizando matriz de flujo para transacción contable ${transaction.transaction_id}:`, error);
    throw error;
  }
}

/**
 * Genera asiento contable automáticamente desde transacción financiera
 * usando categorías contables como single source of truth
 */
export async function generateAccountingEntry(transaction: FinanceTransaction, userId: number): Promise<void> {
  try {
    console.log(`📊 Generando asiento contable para transacción ${transaction.id}`);
    
    // Obtener mapeo dinámico desde categorías contables
    const { mapping } = await getAccountingCategoryMapping(transaction.type);
    
    const debitAccountId = mapping.debitAccount.id;
    const creditAccountId = mapping.creditAccount.id;

    // Crear asiento contable principal
    const entryResult = await pool.query(`
      INSERT INTO accounting_journal_entries 
      (transaction_id, reference, description, date, total_amount, created_by, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING id
    `, [
      transaction.id,
      `FIN-${transaction.id}`,
      `${transaction.type === 'income' ? 'Ingreso' : 'Gasto'}: ${transaction.description}`,
      transaction.date,
      transaction.amount,
      userId
    ]);

    const entryId = entryResult.rows[0].id;

    // Crear líneas del asiento (débito y crédito)
    if (transaction.type === 'income') {
      // INGRESO: Débito en Caja, Crédito en Ingresos
      await pool.query(`
        INSERT INTO accounting_journal_entry_lines 
        (entry_id, account_id, debit_amount, credit_amount, description)
        VALUES ($1, $2, $3, $4, $5)
      `, [entryId, debitAccountId, transaction.amount, 0, `Ingreso por ${transaction.description}`]);
      
      await pool.query(`
        INSERT INTO accounting_journal_entry_lines 
        (entry_id, account_id, debit_amount, credit_amount, description)
        VALUES ($1, $2, $3, $4, $5)
      `, [entryId, creditAccountId, 0, transaction.amount, `Ingreso por ${transaction.description}`]);
    } else {
      // GASTO: Débito en Gastos, Crédito en Caja
      await pool.query(`
        INSERT INTO accounting_journal_entry_lines 
        (entry_id, account_id, debit_amount, credit_amount, description)
        VALUES ($1, $2, $3, $4, $5)
      `, [entryId, creditAccountId, transaction.amount, 0, `Gasto por ${transaction.description}`]);
      
      await pool.query(`
        INSERT INTO accounting_journal_entry_lines 
        (entry_id, account_id, debit_amount, credit_amount, description)
        VALUES ($1, $2, $3, $4, $5)
      `, [entryId, debitAccountId, 0, transaction.amount, `Gasto por ${transaction.description}`]);
    }

    // Actualizar estado de la transacción financiera
    await pool.query(
      'UPDATE actual_incomes SET accounting_entry_id = $1 WHERE id = $2',
      [entryId, transaction.id]
    );
    
    await pool.query(
      'UPDATE actual_expenses SET accounting_entry_id = $1 WHERE id = $2',
      [entryId, transaction.id]
    );

    console.log(`✅ Asiento contable ${entryId} generado exitosamente para transacción ${transaction.id}`);
    
  } catch (error) {
    console.error(`❌ Error generando asiento contable para transacción ${transaction.id}:`, error);
    throw error;
  }
}

/**
 * Sincroniza transacciones financieras existentes con contabilidad
 */
export async function syncExistingTransactions(userId: number): Promise<void> {
  try {
    console.log('🔄 Sincronizando transacciones financieras existentes...');
    
    // Obtener ingresos sin asiento contable
    const incomeResult = await pool.query(`
      SELECT id, amount, category_id, description, date, 'income' as type
      FROM actual_incomes 
      WHERE accounting_entry_id IS NULL
    `);
    
    // Obtener gastos sin asiento contable
    const expenseResult = await pool.query(`
      SELECT id, amount, category_id, description, date, 'expense' as type
      FROM actual_expenses 
      WHERE accounting_entry_id IS NULL
    `);
    
    const allTransactions = [...incomeResult.rows, ...expenseResult.rows];
    
    console.log(`📋 Encontradas ${allTransactions.length} transacciones para sincronizar`);
    
    // Procesar cada transacción
    for (const transaction of allTransactions) {
      await generateAccountingEntry(transaction, userId);
    }
    
    console.log('✅ Sincronización completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
    throw error;
  }
}

/**
 * Obtiene estadísticas de integración
 */
export async function getIntegrationStats(): Promise<any> {
  try {
    const [incomeStats, expenseStats, entryStats] = await Promise.all([
      pool.query('SELECT COUNT(*) as total, COUNT(accounting_entry_id) as synced FROM actual_incomes'),
      pool.query('SELECT COUNT(*) as total, COUNT(accounting_entry_id) as synced FROM actual_expenses'),
      pool.query('SELECT COUNT(*) as total FROM accounting_journal_entries WHERE transaction_id IS NOT NULL')
    ]);
    
    return {
      incomes: {
        total: parseInt(incomeStats.rows[0].total),
        synced: parseInt(incomeStats.rows[0].synced)
      },
      expenses: {
        total: parseInt(expenseStats.rows[0].total),
        synced: parseInt(expenseStats.rows[0].synced)
      },
      entries: {
        total: parseInt(entryStats.rows[0].total)
      }
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw error;
  }
}