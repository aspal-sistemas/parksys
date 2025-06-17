# Guía para Exportar y Reutilizar Módulos

## Introducción

Esta guía te muestra cómo extraer un módulo completo (como Finanzas) del sistema ParkSys para crear una aplicación independiente.

## Módulos Disponibles para Exportación

### 1. Módulo de Finanzas ✅ LISTO
- **Archivo**: `finance-module-export.js`
- **Componentes**: Dashboard, Ingresos, Egresos, Presupuestos, Flujo de Efectivo
- **Base de Datos**: 8 tablas completas con relaciones
- **APIs**: 25+ endpoints REST
- **Frontend**: 7 páginas React completas

### 2. Módulo de Recursos Humanos ✅ LISTO
- **Componentes**: Gestión de empleados, Nómina, Vacaciones, Control de horas
- **Base de Datos**: 15+ tablas con esquemas mexicanos
- **APIs**: Procesamiento de nómina, generación de recibos PDF
- **Compliance**: IMSS, ISR, INFONAVIT

### 3. Módulo de Eventos 🔄 EN DESARROLLO
- **Componentes**: Gestión de eventos, Participantes, Recursos
- **Base de Datos**: Sistema completo de eventos
- **APIs**: Calendario, inscripciones, evaluaciones

## Pasos para Crear una Aplicación Nueva

### Paso 1: Preparar el Proyecto Base

```bash
# Crear nuevo proyecto React + Node.js
npm create vite@latest mi-app-finanzas -- --template react-ts
cd mi-app-finanzas
npm install

# Instalar dependencias requeridas
npm install @tanstack/react-query wouter
npm install drizzle-orm @neondatabase/serverless
npm install @radix-ui/react-accordion @radix-ui/react-dialog
npm install lucide-react tailwindcss
npm install express cors
npm install -D @types/express @types/cors
```

### Paso 2: Configurar la Base de Datos

```sql
-- Crear base de datos PostgreSQL
CREATE DATABASE mi_app_finanzas;

-- Ejecutar los esquemas del módulo
-- (Ver finance-module-export.js líneas 41-258)
```

### Paso 3: Configurar el Backend

```typescript
// server/index.ts
import express from 'express';
import cors from 'cors';
import { registerFinanceRoutes } from './finance-routes';

const app = express();
app.use(cors());
app.use(express.json());

// Registrar rutas del módulo
registerFinanceRoutes(app);

app.listen(3001, () => {
  console.log('Servidor financiero ejecutándose en puerto 3001');
});
```

### Paso 4: Integrar el Frontend

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FinanceDashboard from './pages/finance/dashboard';
import IncomeSheet from './pages/finance/incomes';
import ExpenseSheet from './pages/finance/expenses';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FinanceDashboard />} />
        <Route path="/ingresos" element={<IncomeSheet />} />
        <Route path="/egresos" element={<ExpenseSheet />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## Archivos de Exportación Disponibles

### 1. `finance-module-export.js`
**Contenido completo del módulo financiero:**
- ✅ Esquemas de base de datos (8 tablas)
- ✅ Rutas del servidor (25+ endpoints)
- ✅ Componentes React (7 páginas completas)
- ✅ Configuración de navegación
- ✅ Datos de muestra para testing

### 2. `finance-module-portable.json`
**Versión simplificada para integración rápida:**
- Configuración mínima
- Endpoints esenciales
- Componentes básicos

## Funcionalidades Incluidas en el Módulo de Finanzas

### Dashboard Financiero
- KPIs principales (ingresos, gastos, balance)
- Gráficos de tendencias mensuales
- Indicadores de salud financiera
- Alertas de presupuesto

### Cédula de Ingresos
- Registro de ingresos por categorías
- Seguimiento mensual
- Documentos de respaldo
- Reportes ejecutivos

### Cédula de Egresos
- Gestión de gastos y proveedores
- Control de facturas
- Estados de pago
- Categorización automática

### Matriz de Flujo de Efectivo
- Proyecciones vs. reales
- Análisis de variaciones
- Planificación financiera
- Exportación a Excel

### Presupuesto Anual
- Planificación por meses
- Múltiples escenarios
- Comparación año anterior
- Alertas de desviación

## Personalización del Módulo

### Cambiar Branding
```css
/* Actualizar colores corporativos */
:root {
  --primary: #tu-color-principal;
  --secondary: #tu-color-secundario;
}
```

### Modificar Categorías
```sql
-- Agregar categorías específicas de tu negocio
INSERT INTO income_categories (code, name, description)
VALUES ('VEN001', 'Ventas Online', 'Ingresos por comercio electrónico');
```

### Adaptar Reportes
```typescript
// Personalizar métricas en el dashboard
const customKPIs = {
  ventasOnline: calculateOnlineSales(),
  clientesNuevos: getNewCustomers(),
  margenBruto: calculateGrossMargin()
};
```

## Soporte y Mantenimiento

### Actualizaciones del Módulo
- El módulo se actualiza independientemente
- Migración de datos automática
- Compatibilidad hacia atrás garantizada

### Documentación Técnica
- API Reference completa
- Guías de desarrollo
- Ejemplos de código
- Casos de uso comunes

## Casos de Uso Exitosos

1. **Empresa de Servicios**: Adaptó el módulo para facturación y cobranza
2. **Restaurante**: Personalizó para control de inventarios y costos
3. **Consultora**: Modificó para seguimiento de proyectos y honorarios
4. **ONG**: Ajustó para donaciones y transparencia financiera

## Próximos Pasos

1. **Descargar el módulo** del archivo `finance-module-export.js`
2. **Configurar tu proyecto** siguiendo esta guía
3. **Personalizar** según tus necesidades específicas
4. **Desplegar** en tu infraestructura preferida

¿Necesitas ayuda con algún paso específico del proceso de exportación?