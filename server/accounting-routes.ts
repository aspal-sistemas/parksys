import { Request, Response } from 'express';
import { pool } from './db';
import { generateAccountingEntry, syncExistingTransactions, getIntegrationStats, generateAccountingJournalEntry, updateCashFlowMatrix } from './finance-accounting-integration';

/**
 * RUTAS DEL MÓDULO DE CONTABILIDAD
 * ===============================
 * 
 * Sistema contable completo con categorías jerárquicas,
 * transacciones, asientos contables y reportes financieros
 */

export function registerAccountingRoutes(app: any, apiRouter: any, isAuthenticated: any) {
  console.log('🧮 Registrando rutas del módulo de contabilidad...');

  // =====================================
  // CATEGORÍAS CONTABLES JERÁRQUICAS
  // =====================================

  // Obtener todas las categorías con estructura jerárquica
  apiRouter.get('/accounting/categories', async (req: Request, res: Response) => {
    try {
      const { level, parent_id, search } = req.query;
      
      let query = `
        SELECT 
          ac.*,
          parent.name as parent_name,
          (SELECT COUNT(*) FROM accounting_categories child WHERE child.parent_id = ac.id) as children_count
        FROM accounting_categories ac
        LEFT JOIN accounting_categories parent ON ac.parent_id = parent.id
        WHERE ac.is_active = true
      `;
      
      const params: any[] = [];
      
      if (level) {
        query += ` AND ac.level = $${params.length + 1}`;
        params.push(level);
      }
      
      if (parent_id) {
        query += ` AND ac.parent_id = $${params.length + 1}`;
        params.push(parent_id);
      }
      
      if (search) {
        query += ` AND (ac.name ILIKE $${params.length + 1} OR ac.code ILIKE $${params.length + 1})`;
        params.push(`%${search}%`);
      }
      
      query += ` ORDER BY ac.level, ac.sort_order, ac.name`;
      
      const result = await pool.query(query, params);
      
      res.json({
        categories: result.rows.map(row => ({
          id: row.id,
          code: row.code,
          name: row.name,
          description: row.description,
          level: row.level,
          parentId: row.parent_id, // Convertir a camelCase
          parent_name: row.parent_name,
          sat_code: row.sat_code,
          type: row.type,
          nature: row.nature,
          account_type: row.account_type,
          color: row.color,
          account_nature: row.account_nature,
          full_path: row.full_path,
          sort_order: row.sort_order,
          children_count: parseInt(row.children_count),
          is_active: row.is_active,
          created_at: row.created_at,
          updated_at: row.updated_at
        }))
      });
      
    } catch (error) {
      console.error('Error obteniendo categorías contables:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Crear nueva categoría contable
  apiRouter.post('/accounting/categories', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { 
        code, name, description, level, parent_id, sat_code, type, nature, account_type, color, is_active 
      } = req.body;
      
      // Validar que el código no exista
      const existingCategory = await pool.query(
        'SELECT id FROM accounting_categories WHERE code = $1',
        [code]
      );
      
      if (existingCategory.rows.length > 0) {
        return res.status(400).json({ error: 'El código ya existe' });
      }
      
      // Construir full_path
      let fullPath = code;
      if (parent_id) {
        const parent = await pool.query(
          'SELECT full_path FROM accounting_categories WHERE id = $1',
          [parent_id]
        );
        if (parent.rows.length > 0) {
          fullPath = `${parent.rows[0].full_path}.${code}`;
        }
      }
      
      const result = await pool.query(`
        INSERT INTO accounting_categories 
        (code, name, description, level, parent_id, sat_code, type, nature, account_type, color, is_active, full_path, sort_order, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `, [code, name, description, level, parent_id, sat_code, type, nature, account_type, color, is_active, fullPath, 1, req.user?.id]);
      
      res.status(201).json({
        category: {
          id: result.rows[0].id,
          code: result.rows[0].code,
          name: result.rows[0].name,
          description: result.rows[0].description,
          level: result.rows[0].level,
          parent_id: result.rows[0].parent_id,
          sat_code: result.rows[0].sat_code,
          type: result.rows[0].type,
          nature: result.rows[0].nature,
          account_type: result.rows[0].account_type,
          color: result.rows[0].color,
          full_path: result.rows[0].full_path,
          sort_order: result.rows[0].sort_order,
          is_active: result.rows[0].is_active,
          created_at: result.rows[0].created_at
        }
      });
      
    } catch (error) {
      console.error('Error creando categoría contable:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Actualizar categoría contable
  apiRouter.put('/accounting/categories/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description, satCode, sortOrder } = req.body;
      
      const result = await pool.query(`
        UPDATE accounting_categories 
        SET name = $1, description = $2, sat_code = $3, sort_order = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
      `, [name, description, satCode, sortOrder, id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }
      
      res.json({
        category: {
          id: result.rows[0].id,
          code: result.rows[0].code,
          name: result.rows[0].name,
          description: result.rows[0].description,
          level: result.rows[0].level,
          parentId: result.rows[0].parent_id,
          satCode: result.rows[0].sat_code,
          accountNature: result.rows[0].account_nature,
          fullPath: result.rows[0].full_path,
          sortOrder: result.rows[0].sort_order,
          isActive: result.rows[0].is_active,
          updatedAt: result.rows[0].updated_at
        }
      });
      
    } catch (error) {
      console.error('Error actualizando categoría contable:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Eliminar categoría contable
  apiRouter.delete('/accounting/categories/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Verificar que no tenga transacciones asociadas
      const transactions = await pool.query(
        'SELECT COUNT(*) FROM accounting_transactions WHERE category_id = $1',
        [id]
      );
      
      if (parseInt(transactions.rows[0].count) > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar la categoría porque tiene transacciones asociadas' 
        });
      }
      
      // Verificar que no tenga subcategorías
      const children = await pool.query(
        'SELECT COUNT(*) FROM accounting_categories WHERE parent_id = $1',
        [id]
      );
      
      if (parseInt(children.rows[0].count) > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar la categoría porque tiene subcategorías' 
        });
      }
      
      const result = await pool.query(
        'UPDATE accounting_categories SET is_active = false WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }
      
      res.json({ message: 'Categoría eliminada exitosamente' });
      
    } catch (error) {
      console.error('Error eliminando categoría contable:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // =====================================
  // TRANSACCIONES CONTABLES
  // =====================================

  // Obtener todas las transacciones
  apiRouter.get('/accounting/transactions', async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10, search, category_id, transaction_type, status, year, date_from, date_to } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      console.log('📊 Parámetros de filtro recibidos:', { search, category_id, transaction_type, status, year });
      
      let query = `
        SELECT 
          t.*,
          c.name as category_name,
          c.code as category_code,
          c.account_nature
        FROM accounting_transactions t
        JOIN accounting_categories c ON t.category_id = c.id
        WHERE 1=1
      `;
      
      const params: any[] = [];
      
      if (search) {
        query += ` AND (t.description ILIKE $${params.length + 1} OR t.reference ILIKE $${params.length + 1} OR t.concept ILIKE $${params.length + 1})`;
        params.push(`%${search}%`);
      }
      
      if (category_id) {
        query += ` AND t.category_id = $${params.length + 1}`;
        params.push(category_id);
      }
      
      if (transaction_type) {
        query += ` AND t.transaction_type = $${params.length + 1}`;
        params.push(transaction_type);
      }
      
      if (status) {
        query += ` AND t.status = $${params.length + 1}`;
        params.push(status);
      }
      
      if (year) {
        query += ` AND EXTRACT(YEAR FROM t.date) = $${params.length + 1}`;
        params.push(year);
      }
      
      if (date_from) {
        query += ` AND t.date >= $${params.length + 1}`;
        params.push(date_from);
      }
      
      if (date_to) {
        query += ` AND t.date <= $${params.length + 1}`;
        params.push(date_to);
      }
      
      query += ` ORDER BY t.date DESC, t.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
      
      const result = await pool.query(query, params);
      
      // Contar total de registros
      const countQuery = query.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) FROM').replace(/ORDER BY.*?LIMIT.*?OFFSET.*?$/, '');
      const countParams = params.slice(0, -2);
      const totalResult = await pool.query(countQuery, countParams);
      
      res.json({
        transactions: result.rows.map(row => ({
          id: row.id,
          uuid: row.uuid,
          concept: row.concept,
          date: row.date,
          description: row.description,
          reference: row.reference,
          amount: parseFloat(row.amount),
          categoryId: row.category_id,
          categoryName: row.category_name,
          categoryCode: row.category_code,
          accountNature: row.account_nature,
          transactionType: row.transaction_type,
          sourceModule: row.source_module,
          sourceId: row.source_id,
          status: row.status,
          isRecurring: row.is_recurring,
          recurringConfig: row.recurring_config,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        })),
        total: parseInt(totalResult.rows[0]?.count || '0'),
        currentPage: parseInt(page as string),
        totalPages: Math.ceil(parseInt(totalResult.rows[0]?.count || '0') / parseInt(limit as string))
      });
      
    } catch (error) {
      console.error('Error obteniendo transacciones:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Crear nueva transacción
  apiRouter.post('/accounting/transactions', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { 
        concept, amount, transaction_type, category_a, category_b, category_c, 
        category_d, category_e, transaction_date, status, income_source, 
        bank, description, add_iva, amount_without_iva, iva_amount, reference_number
      } = req.body;
      
      // Determinar la categoría principal (la más específica no vacía/null)
      let primaryCategoryId = category_a || 28;
      if (category_e && category_e !== 0) primaryCategoryId = category_e;
      else if (category_d && category_d !== 0) primaryCategoryId = category_d;
      else if (category_c && category_c !== 0) primaryCategoryId = category_c;
      else if (category_b && category_b !== 0) primaryCategoryId = category_b;
      
      console.log('📊 Creando nueva transacción con datos:', {
        concept, amount, transaction_type, description, category_a, category_b, category_c, primaryCategoryId
      });
      
      const result = await pool.query(`
        INSERT INTO accounting_transactions 
        (concept, date, description, reference, amount, category_id, transaction_type, 
         category_a, category_b, category_c, category_d, category_e, status, 
         income_source, bank, add_iva, amount_without_iva, iva_amount, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING *
      `, [
        concept || '', 
        transaction_date || new Date().toISOString().split('T')[0], 
        description || '', 
        reference_number || '', 
        amount || 0, 
        primaryCategoryId, // Usar la categoría más específica
        transaction_type || 'income', 
        category_a || 28, // Default category_a
        category_b || null, 
        category_c || null, 
        category_d || null, 
        category_e || null, 
        status || 'pending', 
        income_source || '', 
        bank || '', 
        add_iva || false, 
        amount_without_iva || 0, 
        iva_amount || 0, 
        req.user?.id
      ]);
      
      console.log('✅ Transacción creada exitosamente:', result.rows[0]);
      
      // INTEGRACIÓN AUTOMÁTICA: Generar asiento contable automáticamente
      console.log('🔄 INICIANDO integración automática para transacción', result.rows[0].id);
      try {
        console.log('🔄 Llamando generateAccountingJournalEntry...');
        await generateAccountingJournalEntry({
          id: result.rows[0].id,
          concept: result.rows[0].concept,
          amount: parseFloat(result.rows[0].amount),
          transaction_type: result.rows[0].transaction_type,
          category_id: result.rows[0].category_id,
          date: result.rows[0].date,
          description: result.rows[0].description,
          reference: result.rows[0].reference
        }, req.user?.id || 1);
        
        console.log('🔄 Asiento contable generado automáticamente para transacción', result.rows[0].id);
      } catch (error) {
        console.error('⚠️ Error generando asiento contable automático:', error);
        console.error('⚠️ Stack trace:', error.stack);
        // No fallar la transacción si falla el asiento
      }
      
      // INTEGRACIÓN AUTOMÁTICA: Actualizar matriz de flujo de efectivo
      console.log('💰 INICIANDO actualización matriz de flujo para transacción', result.rows[0].id);
      try {
        console.log('💰 Llamando updateCashFlowMatrix...');
        await updateCashFlowMatrix({
          transaction_id: result.rows[0].id,
          amount: parseFloat(result.rows[0].amount),
          transaction_type: result.rows[0].transaction_type,
          category_id: result.rows[0].category_id,
          date: result.rows[0].date
        });
        
        console.log('💰 Matriz de flujo actualizada automáticamente para transacción', result.rows[0].id);
      } catch (error) {
        console.error('⚠️ Error actualizando matriz de flujo:', error);
        console.error('⚠️ Stack trace:', error.stack);
      }
      
      res.status(201).json({
        transaction: {
          id: result.rows[0].id,
          uuid: result.rows[0].uuid,
          concept: result.rows[0].concept,
          date: result.rows[0].date,
          description: result.rows[0].description,
          reference: result.rows[0].reference,
          amount: parseFloat(result.rows[0].amount),
          categoryId: result.rows[0].category_id,
          categoryA: result.rows[0].category_a,
          categoryB: result.rows[0].category_b,
          categoryC: result.rows[0].category_c,
          categoryD: result.rows[0].category_d,
          categoryE: result.rows[0].category_e,
          transactionType: result.rows[0].transaction_type,
          status: result.rows[0].status,
          incomeSource: result.rows[0].income_source,
          bank: result.rows[0].bank,
          addIva: result.rows[0].add_iva,
          amountWithoutIva: result.rows[0].amount_without_iva,
          ivaAmount: result.rows[0].iva_amount,
          createdAt: result.rows[0].created_at
        }
      });
      
    } catch (error) {
      console.error('Error creando transacción:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Eliminar transacción
  apiRouter.delete('/accounting/transactions/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      console.log('🗑️ Eliminando transacción con ID:', id);
      
      const result = await pool.query(
        'DELETE FROM accounting_transactions WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Transacción no encontrada' });
      }
      
      console.log('✅ Transacción eliminada exitosamente:', result.rows[0]);
      
      res.json({ 
        message: 'Transacción eliminada exitosamente',
        transaction: result.rows[0]
      });
      
    } catch (error) {
      console.error('Error eliminando transacción:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // =====================================
  // DASHBOARD Y ESTADÍSTICAS
  // =====================================

  // Dashboard principal del módulo contable
  apiRouter.get('/accounting/dashboard', async (req: Request, res: Response) => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      
      // Estadísticas generales
      const stats = await pool.query(`
        SELECT 
          COUNT(*) as total_categories,
          (SELECT COUNT(*) FROM accounting_transactions WHERE date >= CURRENT_DATE - INTERVAL '30 days') as recent_transactions,
          (SELECT COUNT(*) FROM accounting_entries WHERE status = 'posted') as posted_entries,
          (SELECT COUNT(*) FROM fixed_assets WHERE status = 'active') as active_assets
        FROM accounting_categories 
        WHERE is_active = true
      `);
      
      // Transacciones por tipo del mes actual
      const transactionsByType = await pool.query(`
        SELECT 
          transaction_type,
          COUNT(*) as count,
          SUM(amount) as total_amount
        FROM accounting_transactions 
        WHERE date >= DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY transaction_type
      `);
      
      // Top 5 categorías por movimiento
      const topCategories = await pool.query(`
        SELECT 
          c.name,
          c.code,
          COUNT(t.id) as transaction_count,
          SUM(t.amount) as total_amount
        FROM accounting_categories c
        JOIN accounting_transactions t ON c.id = t.category_id
        WHERE t.date >= DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY c.id, c.name, c.code
        ORDER BY transaction_count DESC
        LIMIT 5
      `);
      
      // Saldos por nivel de categoría
      const balancesByLevel = await pool.query(`
        SELECT 
          c.level,
          c.account_nature,
          COUNT(c.id) as category_count,
          COALESCE(SUM(ab.ending_balance), 0) as total_balance
        FROM accounting_categories c
        LEFT JOIN account_balances ab ON c.id = ab.category_id AND ab.period = $1
        WHERE c.is_active = true
        GROUP BY c.level, c.account_nature
        ORDER BY c.level
      `, [currentMonth]);
      
      res.json({
        stats: {
          totalCategories: parseInt(stats.rows[0].total_categories),
          recentTransactions: parseInt(stats.rows[0].recent_transactions),
          postedEntries: parseInt(stats.rows[0].posted_entries),
          activeAssets: parseInt(stats.rows[0].active_assets)
        },
        transactionsByType: transactionsByType.rows.map(row => ({
          type: row.transaction_type,
          count: parseInt(row.count),
          totalAmount: parseFloat(row.total_amount)
        })),
        topCategories: topCategories.rows.map(row => ({
          name: row.name,
          code: row.code,
          transactionCount: parseInt(row.transaction_count),
          totalAmount: parseFloat(row.total_amount)
        })),
        balancesByLevel: balancesByLevel.rows.map(row => ({
          level: row.level,
          accountNature: row.account_nature,
          categoryCount: parseInt(row.category_count),
          totalBalance: parseFloat(row.total_balance)
        }))
      });
      
    } catch (error) {
      console.error('Error obteniendo dashboard contable:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // =====================================
  // CONFIGURACIÓN CONTABLE
  // =====================================

  // Obtener configuraciones
  apiRouter.get('/accounting/settings', async (req: Request, res: Response) => {
    try {
      const result = await pool.query(`
        SELECT * FROM accounting_settings 
        WHERE is_active = true 
        ORDER BY category, key
      `);
      
      res.json({
        settings: result.rows.map(row => ({
          id: row.id,
          key: row.key,
          value: row.value,
          dataType: row.data_type,
          description: row.description,
          category: row.category,
          isActive: row.is_active
        }))
      });
      
    } catch (error) {
      console.error('Error obteniendo configuraciones:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Actualizar configuración
  apiRouter.put('/accounting/settings/:key', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      
      const result = await pool.query(`
        UPDATE accounting_settings 
        SET value = $1, updated_at = CURRENT_TIMESTAMP
        WHERE key = $2
        RETURNING *
      `, [value, key]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Configuración no encontrada' });
      }
      
      res.json({
        setting: {
          key: result.rows[0].key,
          value: result.rows[0].value,
          dataType: result.rows[0].data_type,
          description: result.rows[0].description,
          category: result.rows[0].category,
          updatedAt: result.rows[0].updated_at
        }
      });
      
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // =======================================
  // CÓDIGOS SAT
  // =======================================

  // Importar códigos SAT oficiales
  apiRouter.post('/accounting/import-sat-codes', isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Códigos SAT principales estructurados
      const satCodes = [
        // ACTIVO - 100
        { code: '100', name: 'Activo', level: 1, parent_code: null, account_nature: 'debit', section: 'Activo' },
        { code: '100.01', name: 'Activo a corto plazo', level: 2, parent_code: '100', account_nature: 'debit', section: 'Activo' },
        { code: '101', name: 'Caja', level: 3, parent_code: '100.01', account_nature: 'debit', section: 'Activo' },
        { code: '101.01', name: 'Caja y efectivo', level: 4, parent_code: '101', account_nature: 'debit', section: 'Activo' },
        { code: '102', name: 'Bancos', level: 3, parent_code: '100.01', account_nature: 'debit', section: 'Activo' },
        { code: '102.01', name: 'Bancos nacionales', level: 4, parent_code: '102', account_nature: 'debit', section: 'Activo' },
        { code: '102.02', name: 'Bancos extranjeros', level: 4, parent_code: '102', account_nature: 'debit', section: 'Activo' },
        { code: '103', name: 'Inversiones', level: 3, parent_code: '100.01', account_nature: 'debit', section: 'Activo' },
        { code: '103.01', name: 'Inversiones temporales', level: 4, parent_code: '103', account_nature: 'debit', section: 'Activo' },
        { code: '105', name: 'Clientes', level: 3, parent_code: '100.01', account_nature: 'debit', section: 'Activo' },
        { code: '105.01', name: 'Clientes nacionales', level: 4, parent_code: '105', account_nature: 'debit', section: 'Activo' },
        { code: '115', name: 'Inventario', level: 3, parent_code: '100.01', account_nature: 'debit', section: 'Activo' },
        { code: '115.01', name: 'Inventario', level: 4, parent_code: '115', account_nature: 'debit', section: 'Activo' },
        
        // ACTIVO FIJO - 100.02
        { code: '100.02', name: 'Activo a largo plazo', level: 2, parent_code: '100', account_nature: 'debit', section: 'Activo' },
        { code: '151', name: 'Terrenos', level: 3, parent_code: '100.02', account_nature: 'debit', section: 'Activo' },
        { code: '151.01', name: 'Terrenos', level: 4, parent_code: '151', account_nature: 'debit', section: 'Activo' },
        { code: '152', name: 'Edificios', level: 3, parent_code: '100.02', account_nature: 'debit', section: 'Activo' },
        { code: '152.01', name: 'Edificios', level: 4, parent_code: '152', account_nature: 'debit', section: 'Activo' },
        { code: '153', name: 'Maquinaria y equipo', level: 3, parent_code: '100.02', account_nature: 'debit', section: 'Activo' },
        { code: '153.01', name: 'Maquinaria y equipo', level: 4, parent_code: '153', account_nature: 'debit', section: 'Activo' },
        { code: '154', name: 'Automóviles, autobuses, camiones de carga', level: 3, parent_code: '100.02', account_nature: 'debit', section: 'Activo' },
        { code: '154.01', name: 'Automóviles, autobuses, camiones de carga', level: 4, parent_code: '154', account_nature: 'debit', section: 'Activo' },
        { code: '155', name: 'Mobiliario y equipo de oficina', level: 3, parent_code: '100.02', account_nature: 'debit', section: 'Activo' },
        { code: '155.01', name: 'Mobiliario y equipo de oficina', level: 4, parent_code: '155', account_nature: 'debit', section: 'Activo' },
        { code: '156', name: 'Equipo de cómputo', level: 3, parent_code: '100.02', account_nature: 'debit', section: 'Activo' },
        { code: '156.01', name: 'Equipo de cómputo', level: 4, parent_code: '156', account_nature: 'debit', section: 'Activo' },
        
        // PASIVO - 200
        { code: '200', name: 'Pasivo', level: 1, parent_code: null, account_nature: 'credit', section: 'Pasivo' },
        { code: '200.01', name: 'Pasivo a corto plazo', level: 2, parent_code: '200', account_nature: 'credit', section: 'Pasivo' },
        { code: '201', name: 'Proveedores', level: 3, parent_code: '200.01', account_nature: 'credit', section: 'Pasivo' },
        { code: '201.01', name: 'Proveedores nacionales', level: 4, parent_code: '201', account_nature: 'credit', section: 'Pasivo' },
        { code: '202', name: 'Cuentas por pagar a corto plazo', level: 3, parent_code: '200.01', account_nature: 'credit', section: 'Pasivo' },
        { code: '202.01', name: 'Documentos por pagar bancario y financiero nacional', level: 4, parent_code: '202', account_nature: 'credit', section: 'Pasivo' },
        { code: '210', name: 'Provisión de sueldos y salarios por pagar', level: 3, parent_code: '200.01', account_nature: 'credit', section: 'Pasivo' },
        { code: '210.01', name: 'Provisión de sueldos y salarios por pagar', level: 4, parent_code: '210', account_nature: 'credit', section: 'Pasivo' },
        { code: '213', name: 'Impuestos y derechos por pagar', level: 3, parent_code: '200.01', account_nature: 'credit', section: 'Pasivo' },
        { code: '213.01', name: 'IVA por pagar', level: 4, parent_code: '213', account_nature: 'credit', section: 'Pasivo' },
        { code: '213.03', name: 'ISR por pagar', level: 4, parent_code: '213', account_nature: 'credit', section: 'Pasivo' },
        
        // PASIVO LARGO PLAZO - 200.02
        { code: '200.02', name: 'Pasivo a largo plazo', level: 2, parent_code: '200', account_nature: 'credit', section: 'Pasivo' },
        { code: '251', name: 'Acreedores diversos a largo plazo', level: 3, parent_code: '200.02', account_nature: 'credit', section: 'Pasivo' },
        { code: '251.01', name: 'Socios, accionistas o representante legal', level: 4, parent_code: '251', account_nature: 'credit', section: 'Pasivo' },
        { code: '252', name: 'Cuentas por pagar a largo plazo', level: 3, parent_code: '200.02', account_nature: 'credit', section: 'Pasivo' },
        { code: '252.01', name: 'Documentos bancarios y financieros por pagar a largo plazo', level: 4, parent_code: '252', account_nature: 'credit', section: 'Pasivo' },
        
        // CAPITAL - 300
        { code: '300', name: 'Capital', level: 1, parent_code: null, account_nature: 'credit', section: 'Capital' },
        { code: '301', name: 'Capital social', level: 2, parent_code: '300', account_nature: 'credit', section: 'Capital' },
        { code: '301.01', name: 'Capital social', level: 3, parent_code: '301', account_nature: 'credit', section: 'Capital' },
        { code: '302', name: 'Aportaciones para futuros aumentos de capital', level: 2, parent_code: '300', account_nature: 'credit', section: 'Capital' },
        { code: '302.01', name: 'Aportaciones para futuros aumentos de capital', level: 3, parent_code: '302', account_nature: 'credit', section: 'Capital' },
        { code: '303', name: 'Prima en venta de acciones', level: 2, parent_code: '300', account_nature: 'credit', section: 'Capital' },
        { code: '303.01', name: 'Prima en venta de acciones', level: 3, parent_code: '303', account_nature: 'credit', section: 'Capital' },
        { code: '304', name: 'Reserva legal', level: 2, parent_code: '300', account_nature: 'credit', section: 'Capital' },
        { code: '304.01', name: 'Reserva legal', level: 3, parent_code: '304', account_nature: 'credit', section: 'Capital' },
        { code: '305', name: 'Otras reservas', level: 2, parent_code: '300', account_nature: 'credit', section: 'Capital' },
        { code: '305.01', name: 'Otras reservas', level: 3, parent_code: '305', account_nature: 'credit', section: 'Capital' },
        { code: '306', name: 'Utilidades retenidas', level: 2, parent_code: '300', account_nature: 'credit', section: 'Capital' },
        { code: '306.01', name: 'Utilidades retenidas', level: 3, parent_code: '306', account_nature: 'credit', section: 'Capital' },
        
        // INGRESOS - 400
        { code: '400', name: 'Ingresos', level: 1, parent_code: null, account_nature: 'credit', section: 'Ingresos' },
        { code: '401', name: 'Ingresos por ventas', level: 2, parent_code: '400', account_nature: 'credit', section: 'Ingresos' },
        { code: '401.01', name: 'Ventas', level: 3, parent_code: '401', account_nature: 'credit', section: 'Ingresos' },
        { code: '402', name: 'Ingresos por servicios', level: 2, parent_code: '400', account_nature: 'credit', section: 'Ingresos' },
        { code: '402.01', name: 'Ingresos por servicios', level: 3, parent_code: '402', account_nature: 'credit', section: 'Ingresos' },
        { code: '403', name: 'Ingresos por arrendamiento', level: 2, parent_code: '400', account_nature: 'credit', section: 'Ingresos' },
        { code: '403.01', name: 'Ingresos por arrendamiento', level: 3, parent_code: '403', account_nature: 'credit', section: 'Ingresos' },
        { code: '404', name: 'Ingresos por intereses', level: 2, parent_code: '400', account_nature: 'credit', section: 'Ingresos' },
        { code: '404.01', name: 'Ingresos por intereses', level: 3, parent_code: '404', account_nature: 'credit', section: 'Ingresos' },
        { code: '405', name: 'Otros ingresos', level: 2, parent_code: '400', account_nature: 'credit', section: 'Ingresos' },
        { code: '405.01', name: 'Otros ingresos', level: 3, parent_code: '405', account_nature: 'credit', section: 'Ingresos' },
        
        // GASTOS - 500
        { code: '500', name: 'Gastos', level: 1, parent_code: null, account_nature: 'debit', section: 'Gastos' },
        { code: '501', name: 'Gastos de administración', level: 2, parent_code: '500', account_nature: 'debit', section: 'Gastos' },
        { code: '501.01', name: 'Sueldos y salarios', level: 3, parent_code: '501', account_nature: 'debit', section: 'Gastos' },
        { code: '501.02', name: 'Honorarios', level: 3, parent_code: '501', account_nature: 'debit', section: 'Gastos' },
        { code: '501.03', name: 'Arrendamientos', level: 3, parent_code: '501', account_nature: 'debit', section: 'Gastos' },
        { code: '501.04', name: 'Servicios públicos', level: 3, parent_code: '501', account_nature: 'debit', section: 'Gastos' },
        { code: '501.05', name: 'Mantenimiento y reparaciones', level: 3, parent_code: '501', account_nature: 'debit', section: 'Gastos' },
        { code: '502', name: 'Gastos de venta', level: 2, parent_code: '500', account_nature: 'debit', section: 'Gastos' },
        { code: '502.01', name: 'Publicidad y promoción', level: 3, parent_code: '502', account_nature: 'debit', section: 'Gastos' },
        { code: '502.02', name: 'Comisiones sobre ventas', level: 3, parent_code: '502', account_nature: 'debit', section: 'Gastos' },
        { code: '503', name: 'Gastos financieros', level: 2, parent_code: '500', account_nature: 'debit', section: 'Gastos' },
        { code: '503.01', name: 'Intereses pagados', level: 3, parent_code: '503', account_nature: 'debit', section: 'Gastos' },
        { code: '503.02', name: 'Comisiones bancarias', level: 3, parent_code: '503', account_nature: 'debit', section: 'Gastos' },
        { code: '504', name: 'Otros gastos', level: 2, parent_code: '500', account_nature: 'debit', section: 'Gastos' },
        { code: '504.01', name: 'Otros gastos', level: 3, parent_code: '504', account_nature: 'debit', section: 'Gastos' }
      ];

      let insertedCount = 0;
      let updatedCount = 0;

      for (const satCode of satCodes) {
        try {
          // Buscar categoría padre si existe
          let parentId = null;
          if (satCode.parent_code) {
            const parentResult = await pool.query(
              'SELECT id FROM accounting_categories WHERE code = $1 LIMIT 1',
              [satCode.parent_code]
            );
            if (parentResult.rows.length > 0) {
              parentId = parentResult.rows[0].id;
            }
          }

          // Verificar si ya existe
          const existingResult = await pool.query(
            'SELECT id FROM accounting_categories WHERE code = $1',
            [satCode.code]
          );

          if (existingResult.rows.length > 0) {
            // Actualizar existente
            await pool.query(`
              UPDATE accounting_categories 
              SET name = $1, level = $2, parent_id = $3, sat_code = $4, 
                  account_nature = $5, description = $6, updated_at = NOW()
              WHERE code = $7
            `, [
              satCode.name,
              satCode.level,
              parentId,
              satCode.code,
              satCode.account_nature,
              `Código SAT oficial - ${satCode.section}`,
              satCode.code
            ]);
            updatedCount++;
          } else {
            // Insertar nuevo
            await pool.query(`
              INSERT INTO accounting_categories 
              (code, name, level, parent_id, sat_code, account_nature, is_active, description, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
            `, [
              satCode.code,
              satCode.name,
              satCode.level,
              parentId,
              satCode.code,
              satCode.account_nature,
              true,
              `Código SAT oficial - ${satCode.section}`
            ]);
            insertedCount++;
          }
        } catch (error) {
          console.error(`Error procesando código SAT ${satCode.code}:`, error);
        }
      }

      res.json({
        success: true,
        message: `Códigos SAT importados exitosamente`,
        stats: {
          inserted: insertedCount,
          updated: updatedCount,
          total: insertedCount + updatedCount
        }
      });
    } catch (error) {
      console.error('Error al importar códigos SAT:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // =======================================
  // ACTIVOS FIJOS
  // =======================================

  // Obtener todos los activos fijos
  apiRouter.get('/accounting/fixed-assets', async (req: Request, res: Response) => {
    try {
      const result = await pool.query(`
        SELECT 
          fa.id, 
          fa.name, 
          ac.name as category,
          fa.acquisition_date as "acquisitionDate",
          fa.acquisition_cost as "acquisitionCost",
          fa.useful_life as "usefulLife",
          fa.depreciation_method as "depreciationMethod",
          fa.net_book_value as "currentValue",
          fa.accumulated_depreciation as "accumulatedDepreciation",
          fa.location,
          fa.description,
          fa.status,
          fa.created_at as "createdAt",
          fa.updated_at as "updatedAt"
        FROM fixed_assets fa
        LEFT JOIN accounting_categories ac ON fa.category_id = ac.id
        ORDER BY fa.name
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error al obtener activos fijos:', error);
      res.status(500).json({ error: 'Error al obtener activos fijos' });
    }
  });

  // Crear un nuevo activo fijo
  apiRouter.post('/accounting/fixed-assets', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { 
        name, 
        category, 
        acquisitionDate, 
        acquisitionCost, 
        usefulLife, 
        depreciationMethod, 
        location, 
        description 
      } = req.body;

      // Encontrar el ID de la categoría
      const categoryResult = await pool.query(
        'SELECT id FROM asset_categories WHERE name = $1 LIMIT 1',
        [category]
      );
      
      const categoryId = categoryResult.rows[0]?.id || 1; // Default a categoría 1 si no se encuentra

      // Calcular depreciación inicial
      const monthsOwned = Math.floor((new Date().getTime() - new Date(acquisitionDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
      const monthlyDepreciation = acquisitionCost / (usefulLife * 12);
      const accumulatedDepreciation = Math.min(monthsOwned * monthlyDepreciation, acquisitionCost);
      const currentValue = acquisitionCost - accumulatedDepreciation;

      const result = await pool.query(`
        INSERT INTO fixed_assets (
          name, 
          category_id, 
          acquisition_date, 
          acquisition_cost, 
          useful_life, 
          depreciation_method, 
          net_book_value, 
          accumulated_depreciation, 
          location, 
          description, 
          status,
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
        RETURNING *
      `, [
        name, 
        categoryId, 
        acquisitionDate, 
        acquisitionCost, 
        usefulLife, 
        depreciationMethod || 'straight-line', 
        currentValue, 
        accumulatedDepreciation, 
        location, 
        description || null,
        'active',
        req.user?.id || 1
      ]);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error al crear activo fijo:', error);
      res.status(500).json({ error: 'Error al crear activo fijo' });
    }
  });

  // Obtener un activo fijo específico
  apiRouter.get('/accounting/fixed-assets/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        SELECT 
          fa.id, 
          fa.name, 
          ac.name as category,
          fa.acquisition_date as "acquisitionDate",
          fa.acquisition_cost as "acquisitionCost",
          fa.useful_life as "usefulLife",
          fa.depreciation_method as "depreciationMethod",
          fa.net_book_value as "currentValue",
          fa.accumulated_depreciation as "accumulatedDepreciation",
          fa.location,
          fa.description,
          fa.status,
          fa.created_at as "createdAt",
          fa.updated_at as "updatedAt"
        FROM fixed_assets fa
        LEFT JOIN asset_categories ac ON fa.category_id = ac.id
        WHERE fa.id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Activo fijo no encontrado' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error al obtener activo fijo:', error);
      res.status(500).json({ error: 'Error al obtener activo fijo' });
    }
  });

  // Actualizar un activo fijo
  apiRouter.put('/accounting/fixed-assets/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { 
        name, 
        category, 
        acquisitionDate, 
        acquisitionCost, 
        usefulLife, 
        depreciationMethod, 
        location, 
        description 
      } = req.body;

      // Encontrar el ID de la categoría
      const categoryResult = await pool.query(
        'SELECT id FROM asset_categories WHERE name = $1 LIMIT 1',
        [category]
      );
      
      const categoryId = categoryResult.rows[0]?.id || 1; // Default a categoría 1 si no se encuentra

      // Recalcular depreciación
      const monthsOwned = Math.floor((new Date().getTime() - new Date(acquisitionDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
      const monthlyDepreciation = acquisitionCost / (usefulLife * 12);
      const accumulatedDepreciation = Math.min(monthsOwned * monthlyDepreciation, acquisitionCost);
      const currentValue = acquisitionCost - accumulatedDepreciation;

      const result = await pool.query(`
        UPDATE fixed_assets 
        SET 
          name = $1, 
          category_id = $2, 
          acquisition_date = $3, 
          acquisition_cost = $4, 
          useful_life = $5, 
          depreciation_method = $6, 
          net_book_value = $7, 
          accumulated_depreciation = $8, 
          location = $9, 
          description = $10, 
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $11 
        RETURNING *
      `, [
        name, 
        categoryId, 
        acquisitionDate, 
        acquisitionCost, 
        usefulLife, 
        depreciationMethod, 
        currentValue, 
        accumulatedDepreciation, 
        location, 
        description || null,
        id
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Activo fijo no encontrado' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error al actualizar activo fijo:', error);
      res.status(500).json({ error: 'Error al actualizar activo fijo' });
    }
  });

  // Eliminar un activo fijo
  apiRouter.delete('/accounting/fixed-assets/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await pool.query('DELETE FROM fixed_assets WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Activo fijo no encontrado' });
      }
      
      res.json({ message: 'Activo fijo eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar activo fijo:', error);
      res.status(500).json({ error: 'Error al eliminar activo fijo' });
    }
  });

  // =====================================
  // ASIENTOS CONTABLES (JOURNAL ENTRIES)
  // =====================================

  // Obtener asientos contables
  apiRouter.get('/accounting/journal-entries', async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10, search, status, type, date_from, date_to } = req.query;
      
      let query = `
        SELECT 
          je.id,
          je.entry_number,
          je.date,
          je.description,
          je.reference,
          je.type,
          je.status,
          je.total_debit,
          je.total_credit,
          je.created_at,
          je.updated_at
        FROM journal_entries je
        WHERE 1=1
      `;
      
      const params: any[] = [];
      
      if (search) {
        query += ` AND (je.entry_number ILIKE $${params.length + 1} OR je.description ILIKE $${params.length + 1} OR je.reference ILIKE $${params.length + 1})`;
        params.push(`%${search}%`);
      }
      
      if (status && status !== 'all') {
        query += ` AND je.status = $${params.length + 1}`;
        params.push(status);
      }
      
      if (type && type !== 'all') {
        query += ` AND je.type = $${params.length + 1}`;
        params.push(type);
      }
      
      if (date_from) {
        query += ` AND je.date >= $${params.length + 1}`;
        params.push(date_from);
      }
      
      if (date_to) {
        query += ` AND je.date <= $${params.length + 1}`;
        params.push(date_to);
      }
      
      query += ` ORDER BY je.date DESC, je.created_at DESC`;
      
      // Agregar paginación
      query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      params.push(limit, offset);
      
      const result = await pool.query(query, params);
      
      // Contar total de registros
      const countQuery = query.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) FROM').replace(/ORDER BY.*?LIMIT.*?OFFSET.*?$/, '');
      const countParams = params.slice(0, -2);
      const totalResult = await pool.query(countQuery, countParams);
      
      res.json({
        journalEntries: result.rows.map(row => ({
          id: row.id,
          entryNumber: row.entry_number,
          date: row.date,
          description: row.description,
          reference: row.reference,
          type: row.type,
          status: row.status,
          totalDebit: parseFloat(row.total_debit || 0),
          totalCredit: parseFloat(row.total_credit || 0),
          createdAt: row.created_at,
          updatedAt: row.updated_at
        })),
        total: parseInt(totalResult.rows[0]?.count || '0'),
        currentPage: parseInt(page as string),
        totalPages: Math.ceil(parseInt(totalResult.rows[0]?.count || '0') / parseInt(limit as string))
      });
      
    } catch (error) {
      console.error('Error obteniendo asientos contables:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Crear nuevo asiento contable
  apiRouter.post('/accounting/journal-entries', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { date, description, reference, type, entries } = req.body;
      
      // Validar que el total de débito sea igual al total de crédito
      const totalDebit = entries.reduce((sum: number, entry: any) => sum + (entry.debit || 0), 0);
      const totalCredit = entries.reduce((sum: number, entry: any) => sum + (entry.credit || 0), 0);
      
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        return res.status(400).json({ error: 'El total de débito debe ser igual al total de crédito' });
      }
      
      // Generar número de asiento
      const entryNumber = `AUTO-${Date.now()}`;
      
      // Insertar el asiento principal
      const journalResult = await pool.query(`
        INSERT INTO journal_entries 
        (entry_number, date, description, reference, type, status, total_debit, total_credit, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [entryNumber, date, description, reference, type, 'draft', totalDebit, totalCredit, req.user?.id]);
      
      const journalEntryId = journalResult.rows[0].id;
      
      // Insertar las entradas del asiento
      for (const entry of entries) {
        await pool.query(`
          INSERT INTO journal_entry_details 
          (journal_entry_id, account_id, debit, credit, description)
          VALUES ($1, $2, $3, $4, $5)
        `, [journalEntryId, entry.account_id, entry.debit || 0, entry.credit || 0, entry.description]);
      }
      
      res.status(201).json({
        journalEntry: {
          id: journalResult.rows[0].id,
          entryNumber: journalResult.rows[0].entry_number,
          date: journalResult.rows[0].date,
          description: journalResult.rows[0].description,
          reference: journalResult.rows[0].reference,
          type: journalResult.rows[0].type,
          status: journalResult.rows[0].status,
          totalDebit: parseFloat(journalResult.rows[0].total_debit),
          totalCredit: parseFloat(journalResult.rows[0].total_credit),
          createdAt: journalResult.rows[0].created_at
        }
      });
      
    } catch (error) {
      console.error('Error creando asiento contable:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Generar asientos automáticos
  apiRouter.post('/accounting/journal-entries/generate-automatic', isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Obtener transacciones no procesadas
      const transactionsResult = await pool.query(`
        SELECT t.*, c.name as category_name, c.code as category_code, c.account_nature
        FROM accounting_transactions t
        JOIN accounting_categories c ON t.category_id = c.id
        WHERE t.journal_entry_id IS NULL
        ORDER BY t.date DESC
        LIMIT 10
      `);
      
      let processedCount = 0;
      
      for (const transaction of transactionsResult.rows) {
        const entryNumber = `AUTO-${transaction.id}${Date.now()}`;
        
        // Crear asiento automático
        const journalResult = await pool.query(`
          INSERT INTO journal_entries 
          (entry_number, date, description, reference, type, status, total_debit, total_credit, created_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *
        `, [
          entryNumber, 
          transaction.date, 
          `Transacción automática: ${transaction.description}`, 
          `TRANS-${transaction.id}`, 
          'automatic', 
          'approved', 
          transaction.amount, 
          transaction.amount,
          req.user?.id
        ]);
        
        const journalEntryId = journalResult.rows[0].id;
        
        // Crear entradas según el tipo de transacción
        if (transaction.transaction_type === 'income') {
          // Débito: Caja/Bancos, Crédito: Categoría de ingreso
          await pool.query(`
            INSERT INTO journal_entry_details 
            (journal_entry_id, account_id, debit, credit, description)
            VALUES ($1, $2, $3, $4, $5)
          `, [journalEntryId, 1, transaction.amount, 0, 'Ingreso por ' + transaction.description]);
          
          await pool.query(`
            INSERT INTO journal_entry_details 
            (journal_entry_id, account_id, debit, credit, description)
            VALUES ($1, $2, $3, $4, $5)
          `, [journalEntryId, transaction.category_id, 0, transaction.amount, transaction.description]);
        } else {
          // Débito: Categoría de gasto, Crédito: Caja/Bancos
          await pool.query(`
            INSERT INTO journal_entry_details 
            (journal_entry_id, account_id, debit, credit, description)
            VALUES ($1, $2, $3, $4, $5)
          `, [journalEntryId, transaction.category_id, transaction.amount, 0, transaction.description]);
          
          await pool.query(`
            INSERT INTO journal_entry_details 
            (journal_entry_id, account_id, debit, credit, description)
            VALUES ($1, $2, $3, $4, $5)
          `, [journalEntryId, 1, 0, transaction.amount, 'Pago por ' + transaction.description]);
        }
        
        // Actualizar la transacción con el asiento creado
        await pool.query(`
          UPDATE accounting_transactions 
          SET journal_entry_id = $1 
          WHERE id = $2
        `, [journalEntryId, transaction.id]);
        
        processedCount++;
      }
      
      res.json({
        message: `Se generaron ${processedCount} asientos automáticos`,
        processedCount
      });
      
    } catch (error) {
      console.error('Error generando asientos automáticos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // =====================================
  // BALANZA (TRIAL BALANCE)
  // =====================================

  // Obtener balanza
  apiRouter.get('/accounting/trial-balance', async (req: Request, res: Response) => {
    try {
      const { period } = req.query;
      
      // Si no se especifica período, usar el mes actual
      const selectedPeriod = period || new Date().toISOString().slice(0, 7);
      
      // Obtener todas las cuentas con sus saldos
      const result = await pool.query(`
        SELECT 
          c.id,
          c.code,
          c.name,
          c.level,
          c.account_nature,
          c.full_path,
          COALESCE(ab.beginning_balance, 0) as opening_balance,
          COALESCE(ab.ending_balance, 0) as ending_balance,
          COALESCE(
            (SELECT SUM(jed.debit) 
             FROM journal_entry_details jed 
             JOIN journal_entries je ON jed.journal_entry_id = je.id 
             WHERE jed.account_id = c.id 
             AND DATE_TRUNC('month', je.date) = DATE_TRUNC('month', $1::date)
            ), 0
          ) as period_debits,
          COALESCE(
            (SELECT SUM(jed.credit) 
             FROM journal_entry_details jed 
             JOIN journal_entries je ON jed.journal_entry_id = je.id 
             WHERE jed.account_id = c.id 
             AND DATE_TRUNC('month', je.date) = DATE_TRUNC('month', $1::date)
            ), 0
          ) as period_credits
        FROM accounting_categories c
        LEFT JOIN account_balances ab ON c.id = ab.category_id 
          AND ab.period = $1
        WHERE c.is_active = true
        ORDER BY c.code
      `, [selectedPeriod + '-01']);

      const trialBalance = result.rows.map(row => {
        const openingBalance = parseFloat(row.opening_balance);
        const periodDebits = parseFloat(row.period_debits);
        const periodCredits = parseFloat(row.period_credits);
        
        // Calcular saldo final basado en naturaleza de la cuenta
        let endingBalance = openingBalance;
        if (row.account_nature === 'debit') {
          endingBalance = openingBalance + periodDebits - periodCredits;
        } else {
          endingBalance = openingBalance + periodCredits - periodDebits;
        }
        
        return {
          id: row.id,
          code: row.code,
          name: row.name,
          level: row.level,
          nature: row.account_nature,
          fullPath: row.full_path,
          previousBalance: openingBalance,
          debits: periodDebits,
          credits: periodCredits,
          currentBalance: Math.abs(endingBalance),
          balanceType: endingBalance >= 0 ? 
            (row.account_nature === 'debit' ? 'debit' : 'credit') : 
            (row.account_nature === 'debit' ? 'credit' : 'debit')
        };
      });

      // Calcular totales
      const totals = {
        previousBalance: {
          debit: trialBalance.filter(item => item.nature === 'debit').reduce((sum, item) => sum + item.previousBalance, 0),
          credit: trialBalance.filter(item => item.nature === 'credit').reduce((sum, item) => sum + item.previousBalance, 0)
        },
        movements: {
          debit: trialBalance.reduce((sum, item) => sum + item.debits, 0),
          credit: trialBalance.reduce((sum, item) => sum + item.credits, 0)
        },
        currentBalance: {
          debit: trialBalance.filter(item => item.balanceType === 'debit').reduce((sum, item) => sum + item.currentBalance, 0),
          credit: trialBalance.filter(item => item.balanceType === 'credit').reduce((sum, item) => sum + item.currentBalance, 0)
        }
      };

      res.json({
        trialBalance,
        totals,
        period: selectedPeriod,
        generatedAt: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error obteniendo balanza:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // =====================================
  // ESTADOS FINANCIEROS
  // =====================================

  // Obtener Balance General
  apiRouter.get('/accounting/balance-sheet', async (req: Request, res: Response) => {
    try {
      const { cutoff_date } = req.query;
      const cutoffDate = cutoff_date || new Date().toISOString().split('T')[0];
      
      // Obtener activos (categorías con naturaleza deudora)
      const assetsResult = await pool.query(`
        SELECT 
          c.id,
          c.code,
          c.name,
          c.level,
          c.account_nature,
          c.full_path,
          COALESCE(ab.ending_balance, 0) as balance
        FROM accounting_categories c
        LEFT JOIN account_balances ab ON c.id = ab.category_id 
        WHERE c.is_active = true 
          AND c.account_nature = 'debit'
          AND c.code LIKE '1%'
        ORDER BY c.code
      `);

      // Obtener pasivos (categorías con naturaleza acreedora - código 2)
      const liabilitiesResult = await pool.query(`
        SELECT 
          c.id,
          c.code,
          c.name,
          c.level,
          c.account_nature,
          c.full_path,
          COALESCE(ab.ending_balance, 0) as balance
        FROM accounting_categories c
        LEFT JOIN account_balances ab ON c.id = ab.category_id 
        WHERE c.is_active = true 
          AND c.account_nature = 'credit'
          AND c.code LIKE '2%'
        ORDER BY c.code
      `);

      // Obtener patrimonio (categorías con naturaleza acreedora - código 3)
      const equityResult = await pool.query(`
        SELECT 
          c.id,
          c.code,
          c.name,
          c.level,
          c.account_nature,
          c.full_path,
          COALESCE(ab.ending_balance, 0) as balance
        FROM accounting_categories c
        LEFT JOIN account_balances ab ON c.id = ab.category_id 
        WHERE c.is_active = true 
          AND c.account_nature = 'credit'
          AND c.code LIKE '3%'
        ORDER BY c.code
      `);

      res.json({
        balanceSheet: {
          assets: assetsResult.rows.map(row => ({
            id: row.id,
            code: row.code,
            name: row.name,
            level: row.level,
            balance: parseFloat(row.balance)
          })),
          liabilities: liabilitiesResult.rows.map(row => ({
            id: row.id,
            code: row.code,
            name: row.name,
            level: row.level,
            balance: parseFloat(row.balance)
          })),
          equity: equityResult.rows.map(row => ({
            id: row.id,
            code: row.code,
            name: row.name,
            level: row.level,
            balance: parseFloat(row.balance)
          }))
        },
        cutoffDate,
        generatedAt: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error obteniendo balance general:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Obtener Estado de Resultados
  apiRouter.get('/accounting/income-statement', async (req: Request, res: Response) => {
    try {
      const { cutoff_date } = req.query;
      const cutoffDate = cutoff_date || new Date().toISOString().split('T')[0];
      
      // Obtener ingresos (categorías con naturaleza acreedora - código 4)
      const revenueResult = await pool.query(`
        SELECT 
          c.id,
          c.code,
          c.name,
          c.level,
          c.account_nature,
          c.full_path,
          COALESCE(ab.ending_balance, 0) as balance,
          COALESCE(
            (SELECT SUM(t.amount) 
             FROM accounting_transactions t 
             WHERE t.category_id = c.id 
             AND t.transaction_type = 'income'
             AND t.date <= $1::date
            ), 0
          ) as period_amount
        FROM accounting_categories c
        LEFT JOIN account_balances ab ON c.id = ab.category_id 
        WHERE c.is_active = true 
          AND c.account_nature = 'credit'
          AND c.code LIKE '4%'
        ORDER BY c.code
      `, [cutoffDate]);

      // Obtener gastos (categorías con naturaleza deudora - código 5)
      const expensesResult = await pool.query(`
        SELECT 
          c.id,
          c.code,
          c.name,
          c.level,
          c.account_nature,
          c.full_path,
          COALESCE(ab.ending_balance, 0) as balance,
          COALESCE(
            (SELECT SUM(t.amount) 
             FROM accounting_transactions t 
             WHERE t.category_id = c.id 
             AND t.transaction_type = 'expense'
             AND t.date <= $1::date
            ), 0
          ) as period_amount
        FROM accounting_categories c
        LEFT JOIN account_balances ab ON c.id = ab.category_id 
        WHERE c.is_active = true 
          AND c.account_nature = 'debit'
          AND c.code LIKE '5%'
        ORDER BY c.code
      `, [cutoffDate]);

      const revenue = revenueResult.rows.map(row => ({
        id: row.id,
        code: row.code,
        name: row.name,
        level: row.level,
        amount: parseFloat(row.period_amount) || parseFloat(row.balance)
      }));

      const expenses = expensesResult.rows.map(row => ({
        id: row.id,
        code: row.code,
        name: row.name,
        level: row.level,
        amount: parseFloat(row.period_amount) || parseFloat(row.balance)
      }));

      const totalRevenue = revenue.reduce((sum, item) => sum + item.amount, 0);
      const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
      const netIncome = totalRevenue - totalExpenses;

      res.json({
        incomeStatement: {
          revenue,
          expenses,
          totals: {
            totalRevenue,
            totalExpenses,
            netIncome
          }
        },
        cutoffDate,
        generatedAt: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error obteniendo estado de resultados:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // =======================================
  // INTEGRACIÓN CON MÓDULO FINANCIERO
  // =======================================

  // Obtener estadísticas de integración
  apiRouter.get('/accounting/integration/stats', async (req: Request, res: Response) => {
    try {
      const stats = await getIntegrationStats();
      res.json({ success: true, stats });
    } catch (error) {
      console.error('Error obteniendo estadísticas de integración:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Sincronizar transacciones financieras existentes
  apiRouter.post('/accounting/integration/sync', isAuthenticated, async (req: Request, res: Response) => {
    try {
      await syncExistingTransactions(req.user?.id || 1);
      const stats = await getIntegrationStats();
      res.json({ 
        success: true, 
        message: 'Sincronización completada exitosamente',
        stats 
      });
    } catch (error) {
      console.error('Error en sincronización:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Generar asiento contable para transacción específica
  apiRouter.post('/accounting/integration/generate-entry', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { transactionId, type } = req.body;
      
      if (!transactionId || !type) {
        return res.status(400).json({ error: 'transactionId y type son requeridos' });
      }

      // Obtener datos de la transacción
      const table = type === 'income' ? 'actual_incomes' : 'actual_expenses';
      const result = await pool.query(
        `SELECT id, amount, category_id, description, date FROM ${table} WHERE id = $1`,
        [transactionId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Transacción no encontrada' });
      }

      const transaction = { ...result.rows[0], type };
      await generateAccountingEntry(transaction, req.user?.id || 1);
      
      res.json({ 
        success: true, 
        message: 'Asiento contable generado exitosamente' 
      });
    } catch (error) {
      console.error('Error generando asiento contable:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Sincronizar categorías financieras con categorías contables
  apiRouter.post('/accounting/sync-financial-categories', isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Importar función de sincronización
      const { syncFinancialCategories, getSyncStats } = await import('./financial-category-sync');
      
      await syncFinancialCategories();
      const stats = await getSyncStats();
      
      res.json({
        success: true,
        message: 'Categorías financieras sincronizadas exitosamente',
        stats
      });
    } catch (error) {
      console.error('Error en sincronización de categorías:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  console.log('✅ Rutas del módulo de contabilidad registradas correctamente');
}