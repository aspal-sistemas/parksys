// Estados posibles para un activo
export const ASSET_STATUSES = [
  'Activo',
  'Mantenimiento',
  'Almacenado',
  'Retirado',
  'Prestado',
  'Reparación'
];

// Condiciones posibles para un activo
export const ASSET_CONDITIONS = [
  'Excelente',
  'Bueno',
  'Regular',
  'Malo',
  'Crítico'
];

// Tipos de mantenimiento
export const MAINTENANCE_TYPES = [
  'Preventivo',
  'Correctivo',
  'Predictivo',
  'Mejora'
];

// Tipos de cambios en historial
export const ASSET_CHANGE_TYPES = [
  'acquisition', // Adquisición
  'update',      // Actualización
  'maintenance', // Mantenimiento
  'transfer',    // Transferencia
  'retirement'   // Retiro
];