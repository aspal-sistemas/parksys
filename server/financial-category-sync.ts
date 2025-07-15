import { pool } from './db';

/**
 * SINCRONIZACIÓN DE CATEGORÍAS FINANCIERAS
 * =======================================
 * 
 * Este módulo mantiene las categorías financieras sincronizadas
 * con las categorías contables (single source of truth).
 * 
 * Las categorías contables en /admin/accounting/categories
 * son la fuente principal de toda la clasificación.
 */

/**
 * Sincroniza categorías financieras con categorías contables
 * basado en el principio "single source of truth"
 */
export async function syncFinancialCategories(): Promise<void> {
  try {
    console.log('🔄 Iniciando sincronización de categorías financieras...');
    
    // Obtener todas las categorías contables activas
    const accountingCategories = await pool.query(`
      SELECT id, code, name, description, type, nature, level
      FROM accounting_categories 
      WHERE is_active = true 
      ORDER BY code
    `);
    
    // En lugar de eliminar categorías, vamos a sincronizarlas por código
    // Primero marcar todas las categorías existentes como no sincronizadas
    await pool.query('UPDATE income_categories SET is_active = false, accounting_category_id = NULL');
    await pool.query('UPDATE expense_categories SET is_active = false, accounting_category_id = NULL');
    
    let incomeCategoriesCreated = 0;
    let expenseCategoriesCreated = 0;
    
    // Procesar cada categoría contable
    for (const category of accountingCategories.rows) {
      const { id, code, name, description, type, nature, level } = category;
      
      // Mapear categorías contables a financieras según el tipo
      if (type === 'Ingreso' || code.startsWith('4')) {
        // Crear categoría de ingresos
        await pool.query(`
          INSERT INTO income_categories (code, name, description, accounting_category_id, is_active)
          VALUES ($1, $2, $3, $4, true)
          ON CONFLICT (code) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          accounting_category_id = EXCLUDED.accounting_category_id
        `, [code, name, description || `Categoría de ingresos - ${name}`, id]);
        
        incomeCategoriesCreated++;
      } 
      else if (type === 'Gasto' || code.startsWith('5')) {
        // Crear categoría de gastos
        await pool.query(`
          INSERT INTO expense_categories (code, name, description, accounting_category_id, is_active)
          VALUES ($1, $2, $3, $4, true)
          ON CONFLICT (code) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          accounting_category_id = EXCLUDED.accounting_category_id
        `, [code, name, description || `Categoría de gastos - ${name}`, id]);
        
        expenseCategoriesCreated++;
      }
    }
    
    console.log(`✅ Sincronización completada:`);
    console.log(`   - ${incomeCategoriesCreated} categorías de ingresos creadas`);
    console.log(`   - ${expenseCategoriesCreated} categorías de gastos creadas`);
    
  } catch (error) {
    console.error('❌ Error en sincronización de categorías:', error);
    throw error;
  }
}

/**
 * Obtiene estadísticas de sincronización
 */
export async function getSyncStats(): Promise<any> {
  try {
    const [accountingStats, incomeStats, expenseStats] = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM accounting_categories WHERE is_active = true'),
      pool.query('SELECT COUNT(*) as total FROM income_categories WHERE is_active = true'),
      pool.query('SELECT COUNT(*) as total FROM expense_categories WHERE is_active = true')
    ]);
    
    return {
      accounting: parseInt(accountingStats.rows[0].total),
      income: parseInt(incomeStats.rows[0].total),
      expense: parseInt(expenseStats.rows[0].total),
      lastSync: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas de sincronización:', error);
    throw error;
  }
}

/**
 * Verifica si las categorías financieras están sincronizadas
 */
export async function checkSyncStatus(): Promise<boolean> {
  try {
    const [accountingCount, totalFinancialCount] = await Promise.all([
      pool.query(`
        SELECT COUNT(*) as total 
        FROM accounting_categories 
        WHERE is_active = true AND (type IN ('Ingreso', 'Gasto') OR code LIKE '4%' OR code LIKE '5%')
      `),
      pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM income_categories WHERE is_active = true) +
          (SELECT COUNT(*) FROM expense_categories WHERE is_active = true) as total
      `)
    ]);
    
    const accountingTotal = parseInt(accountingCount.rows[0].total);
    const financialTotal = parseInt(totalFinancialCount.rows[0].total);
    
    return accountingTotal === financialTotal;
  } catch (error) {
    console.error('Error verificando estado de sincronización:', error);
    return false;
  }
}