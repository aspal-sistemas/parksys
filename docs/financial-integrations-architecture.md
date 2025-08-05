# Arquitectura de Integraciones Financieras - ParkSys

## Visión General
Sistema de integración automática donde cada módulo operativo alimenta automáticamente al módulo de Finanzas, creando un flujo de datos financieros en tiempo real.

## Principios de Diseño

### 1. Fuente Única de Verdad
- Cada tipo de transacción tiene UN SOLO módulo de origen
- Los datos financieros se generan automáticamente desde el módulo operativo
- Finanzas es receptor, no editor de datos integrados

### 2. Trazabilidad Completa
- Cada registro financiero mantiene referencia a su transacción original
- Posibilidad de navegar desde Finanzas al registro fuente
- Historial de cambios automático

### 3. Tiempo Real
- Los cambios en módulos operativos se reflejan inmediatamente en Finanzas
- Sin necesidad de procesos batch o sincronización manual

## Integraciones Planificadas

### INGRESOS (hacia actual_income)

#### 1. Concesiones → Ingresos
**Módulo Origen:** Concesiones  
**Tipo:** Ingresos por rentas, permisos, porcentajes de ventas
```
Datos de origen:
- Pagos de concesionarios
- Renovaciones de contratos
- Multas por incumplimiento
- Porcentajes de ventas reportados

Flujo automático:
Concesiones → Categorías de Ingreso → Registro en actual_income
```

#### 2. Actividades y Eventos → Ingresos
**Módulo Origen:** Eventos  
**Tipo:** Ingresos por inscripciones, entradas, servicios
```
Datos de origen:
- Inscripciones a actividades pagadas
- Venta de entradas a eventos
- Servicios adicionales (estacionamiento, alimentos)
- Patrocinios de eventos

Flujo automático:
Eventos → Categorías de Ingreso → Registro en actual_income
```

#### 3. Marketing y Promociones → Ingresos
**Módulo Origen:** Marketing  
**Tipo:** Ingresos por publicidad, patrocinios, promociones
```
Datos de origen:
- Contratos de publicidad en el parque
- Patrocinios de empresas
- Promociones especiales
- Licencias de marca

Flujo automático:
Marketing → Categorías de Ingreso → Registro en actual_income
```

### EGRESOS (hacia actual_expenses)

#### 4. Activos y Mantenimiento → Egresos
**Módulo Origen:** Gestión de Activos  
**Tipo:** Gastos de mantenimiento, reparaciones, depreciación
```
Datos de origen:
- Órdenes de mantenimiento preventivo
- Reparaciones de emergencia
- Compra de repuestos
- Servicios de mantenimiento externo

Flujo automático:
Activos → Categorías de Gasto → Registro en actual_expenses
```

#### 5. Árboles e Inventario → Egresos
**Módulo Origen:** Gestión de Árboles  
**Tipo:** Gastos de jardinería, nuevas plantaciones, tratamientos
```
Datos de origen:
- Compra de nuevos árboles
- Tratamientos fitosanitarios
- Servicios de poda
- Fertilizantes y productos químicos

Flujo automático:
Árboles → Categorías de Gasto → Registro en actual_expenses
```

#### 6. Voluntarios → Egresos
**Módulo Origen:** Gestión de Voluntarios  
**Tipo:** Gastos en reconocimientos, capacitación, materiales
```
Datos de origen:
- Gastos de capacitación
- Reconocimientos y premios
- Materiales para voluntarios
- Seguros de voluntarios

Flujo automático:
Voluntarios → Categorías de Gasto → Registro en actual_expenses
```

#### 7. Incidentes y Seguridad → Egresos
**Módulo Origen:** Gestión de Incidentes  
**Tipo:** Gastos de reparaciones por incidentes, seguridad, seguros
```
Datos de origen:
- Reparaciones por vandalismo
- Gastos de seguridad adicional
- Reclamaciones de seguros
- Servicios de emergencia

Flujo automático:
Incidentes → Categorías de Gasto → Registro en actual_expenses
```

## Implementación Técnica

### Estructura de Base de Datos
```sql
-- Tabla de mapeo módulo-categoría
module_category_mapping:
- id
- source_module (enum: 'hr', 'concessions', 'events', 'assets', etc.)
- category_id (FK a income_categories o expense_categories)
- is_income (boolean)
- auto_generate (boolean)

-- Tabla de trazabilidad
financial_transaction_sources:
- id
- transaction_type ('income' | 'expense')
- transaction_id (FK a actual_income o actual_expenses)
- source_module
- source_table
- source_id
- created_at
```

### Patrones de Integración

#### 1. Event-Driven Architecture
```typescript
// Evento disparado desde cualquier módulo
interface FinancialImpactEvent {
  module: string;
  action: 'create' | 'update' | 'delete';
  entityType: string;
  entityId: number;
  financialData: {
    amount: number;
    description: string;
    categoryCode: string;
    date: string;
  };
}
```

#### 2. Middleware de Integración
```typescript
class FinancialIntegrationMiddleware {
  async processEvent(event: FinancialImpactEvent) {
    // Validar datos
    // Mapear a categoría financiera
    // Crear registro en tabla correspondiente
    // Mantener trazabilidad
  }
}
```

### API Endpoints Unificados
```
GET /api/financial-integrations/summary
GET /api/financial-integrations/by-module/{module}
POST /api/financial-integrations/sync/{module}
GET /api/financial-integrations/trace/{transactionId}
```

## Beneficios del Sistema

### 1. Visibilidad Financiera Completa
- Dashboard financiero con datos de todos los módulos
- Identificación inmediata del origen de cada transacción
- Análisis de rentabilidad por módulo/actividad

### 2. Eficiencia Operativa
- Eliminación de doble captura
- Reducción de errores humanos
- Procesos automatizados de reporte

### 3. Cumplimiento y Auditoría
- Trazabilidad completa de todas las transacciones
- Registros automáticos con timestamps
- Facilita auditorías internas y externas

### 4. Toma de Decisiones
- Datos financieros actualizados en tiempo real
- Análisis de costos por módulo/actividad
- Identificación de áreas más/menos rentables

## Roadmap de Implementación

### Fase 1: Fundación (Completada)
- ✅ Integración HR → Finanzas
- ✅ Arquitectura base de integración

### Fase 2: Ingresos Principales
- 🔄 Concesiones → Ingresos
- 🔄 Eventos → Ingresos
- 🔄 Marketing → Ingresos

### Fase 3: Egresos Operativos
- ⏳ Activos → Egresos
- ⏳ Árboles → Egresos
- ⏳ Voluntarios → Egresos

### Fase 4: Completar Ecosistema
- ⏳ Incidentes → Egresos
- ⏳ Dashboard unificado
- ⏳ Reportes automáticos

## Notas de Implementación

### Manejo de Conflictos
- Los datos integrados son de solo lectura en Finanzas
- Modificaciones solo desde el módulo de origen
- Sistema de validación de integridad

### Performance
- Eventos asíncronos para no bloquear operaciones
- Cache de categorías más utilizadas
- Índices optimizados en tablas de trazabilidad

### Seguridad
- Validación de permisos por módulo
- Log de todos los cambios automáticos
- Rollback automático en caso de errores