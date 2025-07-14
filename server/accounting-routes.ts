import { Request, Response } from 'express';
import { pool } from './db';

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
          parentId: row.parent_id,
          parentName: row.parent_name,
          satCode: row.sat_code,
          accountNature: row.account_nature,
          fullPath: row.full_path,
          sortOrder: row.sort_order,
          childrenCount: parseInt(row.children_count),
          isActive: row.is_active,
          createdAt: row.created_at,
          updatedAt: row.updated_at
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
        code, name, description, level, parentId, satCode, accountNature, sortOrder 
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
      if (parentId) {
        const parent = await pool.query(
          'SELECT full_path FROM accounting_categories WHERE id = $1',
          [parentId]
        );
        if (parent.rows.length > 0) {
          fullPath = `${parent.rows[0].full_path}.${code}`;
        }
      }
      
      const result = await pool.query(`
        INSERT INTO accounting_categories 
        (code, name, description, level, parent_id, sat_code, account_nature, full_path, sort_order, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [code, name, description, level, parentId, satCode, accountNature, fullPath, sortOrder, req.user?.id]);
      
      res.status(201).json({
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
          createdAt: result.rows[0].created_at
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
      const { page = 1, limit = 10, search, category_id, transaction_type, date_from, date_to } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
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
        query += ` AND (t.description ILIKE $${params.length + 1} OR t.reference ILIKE $${params.length + 1})`;
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
        total: parseInt(totalResult.rows[0].count),
        currentPage: parseInt(page as string),
        totalPages: Math.ceil(parseInt(totalResult.rows[0].count) / parseInt(limit as string))
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
        date, description, reference, amount, categoryId, transactionType, 
        sourceModule, sourceId, isRecurring, recurringConfig 
      } = req.body;
      
      const result = await pool.query(`
        INSERT INTO accounting_transactions 
        (date, description, reference, amount, category_id, transaction_type, source_module, source_id, is_recurring, recurring_config, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [date, description, reference, amount, categoryId, transactionType, sourceModule, sourceId, isRecurring, recurringConfig, req.user?.id]);
      
      res.status(201).json({
        transaction: {
          id: result.rows[0].id,
          uuid: result.rows[0].uuid,
          date: result.rows[0].date,
          description: result.rows[0].description,
          reference: result.rows[0].reference,
          amount: parseFloat(result.rows[0].amount),
          categoryId: result.rows[0].category_id,
          transactionType: result.rows[0].transaction_type,
          sourceModule: result.rows[0].source_module,
          sourceId: result.rows[0].source_id,
          status: result.rows[0].status,
          isRecurring: result.rows[0].is_recurring,
          recurringConfig: result.rows[0].recurring_config,
          createdAt: result.rows[0].created_at
        }
      });
      
    } catch (error) {
      console.error('Error creando transacción:', error);
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

  console.log('✅ Rutas del módulo de contabilidad registradas correctamente');
}