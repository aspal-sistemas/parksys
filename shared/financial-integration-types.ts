/**
 * Tipos y interfaces para el sistema de integración financiera
 */

export type SourceModule = 
  | 'hr'
  | 'concessions' 
  | 'events'
  | 'marketing'
  | 'assets'
  | 'trees'
  | 'volunteers'
  | 'incidents';

export type TransactionType = 'income' | 'expense';

export interface FinancialImpactEvent {
  module: SourceModule;
  action: 'create' | 'update' | 'delete';
  entityType: string;
  entityId: number;
  transactionType: TransactionType;
  financialData: {
    amount: number;
    description: string;
    categoryCode: string;
    date: string;
    reference?: string;
    metadata?: Record<string, any>;
  };
}

export interface ModuleCategoryMapping {
  id: number;
  sourceModule: SourceModule;
  categoryId: number;
  isIncome: boolean;
  autoGenerate: boolean;
  categoryCode: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialTransactionSource {
  id: number;
  transactionType: TransactionType;
  transactionId: number;
  sourceModule: SourceModule;
  sourceTable: string;
  sourceId: number;
  originalAmount: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mapeo de categorías predefinidas por módulo
export const DEFAULT_CATEGORY_MAPPINGS = {
  hr: {
    income: [],
    expense: [
      { code: 'PERS-SAL', name: 'Salarios y Sueldos' },
      { code: 'PERS-BON', name: 'Bonificaciones' },
      { code: 'PERS-OVT', name: 'Tiempo Extra' },
      { code: 'PERS-CAP', name: 'Capacitación Personal' }
    ]
  },
  concessions: {
    income: [
      { code: 'CONC-REN', name: 'Rentas de Concesiones' },
      { code: 'CONC-POR', name: 'Porcentajes de Ventas' },
      { code: 'CONC-MUL', name: 'Multas por Incumplimiento' },
      { code: 'CONC-REV', name: 'Renovaciones de Contratos' }
    ],
    expense: [
      { code: 'CONC-ADM', name: 'Administración de Concesiones' },
      { code: 'CONC-INS', name: 'Inspecciones y Supervisión' }
    ]
  },
  events: {
    income: [
      { code: 'EVEN-INS', name: 'Inscripciones a Eventos' },
      { code: 'EVEN-ENT', name: 'Venta de Entradas' },
      { code: 'EVEN-PAT', name: 'Patrocinios de Eventos' },
      { code: 'EVEN-SER', name: 'Servicios Adicionales' }
    ],
    expense: [
      { code: 'EVEN-ORG', name: 'Organización de Eventos' },
      { code: 'EVEN-MAT', name: 'Materiales para Eventos' },
      { code: 'EVEN-PRO', name: 'Promoción de Eventos' }
    ]
  },
  marketing: {
    income: [
      { code: 'MARK-PUB', name: 'Contratos de Publicidad' },
      { code: 'MARK-PAT', name: 'Patrocinios Comerciales' },
      { code: 'MARK-LIC', name: 'Licencias de Marca' }
    ],
    expense: [
      { code: 'MARK-CAM', name: 'Campañas Publicitarias' },
      { code: 'MARK-MAT', name: 'Material Promocional' },
      { code: 'MARK-EVE', name: 'Eventos Promocionales' }
    ]
  },
  assets: {
    income: [],
    expense: [
      { code: 'ACTI-MAN', name: 'Mantenimiento de Activos' },
      { code: 'ACTI-REP', name: 'Reparaciones' },
      { code: 'ACTI-COM', name: 'Compra de Activos' },
      { code: 'ACTI-SER', name: 'Servicios Externos' }
    ]
  },
  trees: {
    income: [],
    expense: [
      { code: 'ARBO-COM', name: 'Compra de Árboles' },
      { code: 'ARBO-TRA', name: 'Tratamientos Fitosanitarios' },
      { code: 'ARBO-POD', name: 'Servicios de Poda' },
      { code: 'ARBO-FER', name: 'Fertilizantes y Químicos' }
    ]
  },
  volunteers: {
    income: [],
    expense: [
      { code: 'VOLU-CAP', name: 'Capacitación de Voluntarios' },
      { code: 'VOLU-REC', name: 'Reconocimientos y Premios' },
      { code: 'VOLU-MAT', name: 'Materiales para Voluntarios' },
      { code: 'VOLU-SEG', name: 'Seguros de Voluntarios' }
    ]
  },
  incidents: {
    income: [
      { code: 'INCI-SEG', name: 'Recuperación de Seguros' }
    ],
    expense: [
      { code: 'INCI-REP', name: 'Reparaciones por Incidentes' },
      { code: 'INCI-SEG', name: 'Gastos de Seguridad' },
      { code: 'INCI-EME', name: 'Servicios de Emergencia' }
    ]
  }
} as const;

// Utilidades para trabajar con integraciones
export class FinancialIntegrationUtils {
  static generateReference(module: SourceModule, entityId: number, date: Date): string {
    const moduleCode = module.toUpperCase().substring(0, 4);
    const dateCode = date.toISOString().slice(0, 7).replace('-', '');
    return `${moduleCode}-${dateCode}-${entityId}`;
  }

  static validateFinancialData(data: FinancialImpactEvent['financialData']): boolean {
    return !!(
      data.amount &&
      data.amount > 0 &&
      data.description &&
      data.categoryCode &&
      data.date
    );
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }
}