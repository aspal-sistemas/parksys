import { 
  pgTable, 
  serial, 
  text, 
  varchar, 
  boolean,
  timestamp,
  integer,
  decimal,
  json,
  date,
  uuid,
  primaryKey,
  uniqueIndex,
  index
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// ===============================================
// CATEGORÍAS CONTABLES JERÁRQUICAS (5 NIVELES)
// ===============================================

export const accountingCategories = pgTable('accounting_categories', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 20 }).notNull().unique(), // A-B-C-D-E format
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  level: integer('level').notNull(), // 1-5 (A, B, C, D, E)
  parentId: integer('parent_id').references(() => accountingCategories.id),
  satCode: varchar('sat_code', { length: 20 }), // Código SAT mexicano
  accountNature: varchar('account_nature', { length: 10 }).notNull(), // 'deudora' | 'acreedora'
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: integer('created_by'),
  // Campos para estructura jerárquica
  fullPath: varchar('full_path', { length: 500 }), // A.B.C.D.E path completo
  sortOrder: integer('sort_order').default(0),
  // Metadatos
  metadata: json('metadata'), // Información adicional flexible
});

export const insertAccountingCategorySchema = createInsertSchema(accountingCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type AccountingCategory = typeof accountingCategories.$inferSelect;
export type InsertAccountingCategory = z.infer<typeof insertAccountingCategorySchema>;

// ===============================================
// TRANSACCIONES CONTABLES
// ===============================================

export const accountingTransactions = pgTable('accounting_transactions', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  date: date('date').notNull(),
  description: text('description').notNull(),
  reference: varchar('reference', { length: 100 }),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  categoryId: integer('category_id').references(() => accountingCategories.id).notNull(),
  transactionType: varchar('transaction_type', { length: 20 }).notNull(), // 'income' | 'expense'
  sourceModule: varchar('source_module', { length: 50 }), // 'hr', 'concessions', 'manual', etc.
  sourceId: integer('source_id'), // ID del registro origen
  status: varchar('status', { length: 20 }).default('completed'), // 'pending', 'completed', 'cancelled'
  isRecurring: boolean('is_recurring').default(false),
  recurringConfig: json('recurring_config'), // Configuración de recurrencia
  // Metadatos
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: integer('created_by'),
});

export const insertAccountingTransactionSchema = createInsertSchema(accountingTransactions).omit({
  id: true,
  uuid: true,
  createdAt: true,
  updatedAt: true,
});

export type AccountingTransaction = typeof accountingTransactions.$inferSelect;
export type InsertAccountingTransaction = z.infer<typeof insertAccountingTransactionSchema>;

// ===============================================
// ASIENTOS CONTABLES (PARTIDA DOBLE)
// ===============================================

export const accountingEntries = pgTable('accounting_entries', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  entryNumber: varchar('entry_number', { length: 50 }).notNull().unique(),
  date: date('date').notNull(),
  description: text('description').notNull(),
  reference: varchar('reference', { length: 100 }),
  totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull(),
  isBalanced: boolean('is_balanced').default(false),
  status: varchar('status', { length: 20 }).default('draft'), // 'draft', 'posted', 'cancelled'
  sourceTransactionId: integer('source_transaction_id').references(() => accountingTransactions.id),
  // Metadatos
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: integer('created_by'),
});

export const insertAccountingEntrySchema = createInsertSchema(accountingEntries).omit({
  id: true,
  uuid: true,
  createdAt: true,
  updatedAt: true,
});

export type AccountingEntry = typeof accountingEntries.$inferSelect;
export type InsertAccountingEntry = z.infer<typeof insertAccountingEntrySchema>;

// ===============================================
// DETALLE DE ASIENTOS CONTABLES
// ===============================================

export const accountingEntryDetails = pgTable('accounting_entry_details', {
  id: serial('id').primaryKey(),
  entryId: integer('entry_id').references(() => accountingEntries.id).notNull(),
  categoryId: integer('category_id').references(() => accountingCategories.id).notNull(),
  description: text('description'),
  debitAmount: decimal('debit_amount', { precision: 15, scale: 2 }).default('0'),
  creditAmount: decimal('credit_amount', { precision: 15, scale: 2 }).default('0'),
  sortOrder: integer('sort_order').default(0),
  // Metadatos
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const insertAccountingEntryDetailSchema = createInsertSchema(accountingEntryDetails).omit({
  id: true,
  createdAt: true,
});

export type AccountingEntryDetail = typeof accountingEntryDetails.$inferSelect;
export type InsertAccountingEntryDetail = z.infer<typeof insertAccountingEntryDetailSchema>;

// ===============================================
// SALDOS DE CUENTAS
// ===============================================

export const accountBalances = pgTable('account_balances', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => accountingCategories.id).notNull(),
  period: varchar('period', { length: 10 }).notNull(), // YYYY-MM format
  beginningBalance: decimal('beginning_balance', { precision: 15, scale: 2 }).default('0'),
  debitTotal: decimal('debit_total', { precision: 15, scale: 2 }).default('0'),
  creditTotal: decimal('credit_total', { precision: 15, scale: 2 }).default('0'),
  endingBalance: decimal('ending_balance', { precision: 15, scale: 2 }).default('0'),
  lastUpdated: timestamp('last_updated').defaultNow(),
}, (table) => ({
  uniquePeriodCategory: uniqueIndex('unique_period_category').on(table.categoryId, table.period),
}));

export const insertAccountBalanceSchema = createInsertSchema(accountBalances).omit({
  id: true,
  lastUpdated: true,
});

export type AccountBalance = typeof accountBalances.$inferSelect;
export type InsertAccountBalance = z.infer<typeof insertAccountBalanceSchema>;

// ===============================================
// ACTIVOS FIJOS
// ===============================================

export const fixedAssets = pgTable('fixed_assets', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  categoryId: integer('category_id').references(() => accountingCategories.id).notNull(),
  acquisitionDate: date('acquisition_date').notNull(),
  acquisitionCost: decimal('acquisition_cost', { precision: 15, scale: 2 }).notNull(),
  usefulLife: integer('useful_life').notNull(), // en meses
  residualValue: decimal('residual_value', { precision: 15, scale: 2 }).default('0'),
  depreciationMethod: varchar('depreciation_method', { length: 20 }).default('straight_line'),
  accumulatedDepreciation: decimal('accumulated_depreciation', { precision: 15, scale: 2 }).default('0'),
  netBookValue: decimal('net_book_value', { precision: 15, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).default('active'), // 'active', 'disposed', 'fully_depreciated'
  location: varchar('location', { length: 200 }),
  // Metadatos
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: integer('created_by'),
});

export const insertFixedAssetSchema = createInsertSchema(fixedAssets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type FixedAsset = typeof fixedAssets.$inferSelect;
export type InsertFixedAsset = z.infer<typeof insertFixedAssetSchema>;

// ===============================================
// DEPRECIACIÓN MENSUAL
// ===============================================

export const monthlyDepreciation = pgTable('monthly_depreciation', {
  id: serial('id').primaryKey(),
  assetId: integer('asset_id').references(() => fixedAssets.id).notNull(),
  period: varchar('period', { length: 10 }).notNull(), // YYYY-MM format
  monthlyAmount: decimal('monthly_amount', { precision: 15, scale: 2 }).notNull(),
  accumulatedToDate: decimal('accumulated_to_date', { precision: 15, scale: 2 }).notNull(),
  remainingValue: decimal('remaining_value', { precision: 15, scale: 2 }).notNull(),
  entryId: integer('entry_id').references(() => accountingEntries.id), // Asiento contable generado
  status: varchar('status', { length: 20 }).default('calculated'), // 'calculated', 'posted'
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  uniqueAssetPeriod: uniqueIndex('unique_asset_period').on(table.assetId, table.period),
}));

export const insertMonthlyDepreciationSchema = createInsertSchema(monthlyDepreciation).omit({
  id: true,
  createdAt: true,
});

export type MonthlyDepreciation = typeof monthlyDepreciation.$inferSelect;
export type InsertMonthlyDepreciation = z.infer<typeof insertMonthlyDepreciationSchema>;

// ===============================================
// CONFIGURACIÓN CONTABLE
// ===============================================

export const accountingSettings = pgTable('accounting_settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull(),
  dataType: varchar('data_type', { length: 20 }).default('string'), // 'string', 'number', 'boolean', 'json'
  description: text('description'),
  category: varchar('category', { length: 50 }).default('general'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertAccountingSettingSchema = createInsertSchema(accountingSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type AccountingSetting = typeof accountingSettings.$inferSelect;
export type InsertAccountingSetting = z.infer<typeof insertAccountingSettingSchema>;

// ===============================================
// CENTROS DE COSTO
// ===============================================

export const costCenters = pgTable('cost_centers', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  parentId: integer('parent_id').references(() => costCenters.id),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertCostCenterSchema = createInsertSchema(costCenters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CostCenter = typeof costCenters.$inferSelect;
export type InsertCostCenter = z.infer<typeof insertCostCenterSchema>;