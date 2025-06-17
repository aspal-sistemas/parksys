# Guía Rápida: Crear Nueva Aplicación con Módulo de Finanzas

## Paso 1: Preparar el Proyecto Base

### Opción A: Nuevo Proyecto desde Cero
```bash
# Crear directorio para tu nueva aplicación
mkdir mi-app-finanzas
cd mi-app-finanzas

# Copiar módulo exportado
cp -r ../exports/finanzas-export-2025-06-17/* .

# Personalizar nombre del proyecto
sed -i 's/parksys-sistema-de-finanzas/mi-app-finanzas/g' package.json
```

### Opción B: Integrar en Proyecto Existente
```bash
# Si ya tienes un proyecto React/Node.js
cd tu-proyecto-existente

# Copiar componentes específicos
cp -r ../exports/finanzas-export-2025-06-17/shared/schema.ts ./src/shared/
cp -r ../exports/finanzas-export-2025-06-17/server/routes.ts ./server/finance-routes.ts
cp -r ../exports/finanzas-export-2025-06-17/src/pages/ ./src/pages/finance/
```

## Paso 2: Configurar Base de Datos

### 2.1 Variables de Entorno
```bash
# Crear archivo .env
cat > .env << EOF
DATABASE_URL=postgresql://usuario:password@localhost:5432/mi_app_db
NODE_ENV=development
PORT=3001
EOF
```

### 2.2 Instalar Dependencias
```bash
npm install
```

### 2.3 Crear Tablas
```bash
npm run db:push
```

## Paso 3: Personalizar la Aplicación

### 3.1 Cambiar Branding
```typescript
// src/App.tsx - Actualizar nombre
<h1 className="text-2xl font-bold text-gray-900">Mi Sistema Financiero</h1>

// src/pages/dashboard.tsx - Personalizar contenido
<h1 className="text-3xl font-bold">Dashboard de Mi Empresa</h1>
```

### 3.2 Configurar Colores Corporativos
```css
/* tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#tu-color-principal',
        secondary: '#tu-color-secundario',
      }
    }
  }
}
```

### 3.3 Agregar Logo
```bash
# Reemplazar logo en public/
cp tu-logo.png public/logo.png
```

## Paso 4: Casos de Uso Específicos

### Para Restaurante
```typescript
// Personalizar categorías en shared/schema.ts
const restaurantIncomeCategories = [
  { code: 'VEN001', name: 'Ventas de Comida', description: 'Ingresos por alimentos' },
  { code: 'VEN002', name: 'Bebidas', description: 'Ingresos por bebidas' },
  { code: 'VEN003', name: 'Delivery', description: 'Servicios de entrega' }
];

const restaurantExpenseCategories = [
  { code: 'COM001', name: 'Ingredientes', description: 'Compra de insumos' },
  { code: 'PER001', name: 'Personal', description: 'Sueldos y prestaciones' },
  { code: 'SER001', name: 'Servicios', description: 'Luz, agua, gas' }
];
```

### Para Consultora
```typescript
// Categorías para consultora
const consultingCategories = [
  { code: 'HON001', name: 'Honorarios', description: 'Ingresos por consultoría' },
  { code: 'CAP001', name: 'Capacitación', description: 'Ingresos por cursos' },
  { code: 'PRO001', name: 'Proyectos', description: 'Ingresos por proyectos específicos' }
];
```

### Para Tienda Online
```typescript
// Categorías para e-commerce
const ecommerceCategories = [
  { code: 'VEN001', name: 'Ventas Online', description: 'Ventas por internet' },
  { code: 'VEN002', name: 'Ventas Físicas', description: 'Ventas en tienda' },
  { code: 'PUB001', name: 'Publicidad', description: 'Gastos en marketing digital' }
];
```

## Paso 5: Agregar Funcionalidades Específicas

### 5.1 Nuevas Páginas
```bash
# Crear página de reportes específicos
touch src/pages/reportes-especiales.tsx
```

### 5.2 APIs Personalizadas
```typescript
// server/routes.ts - Agregar endpoint personalizado
router.get("/api/reportes-mensuales", async (req, res) => {
  // Lógica específica para tu negocio
});
```

### 5.3 Integración con Servicios Externos
```typescript
// Integrar con facturación electrónica, bancos, etc.
const integrarBanco = async () => {
  // Conexión con API bancaria
};
```

## Paso 6: Desarrollo y Despliegue

### 6.1 Desarrollo Local
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run server

# Terminal 3: Base de datos (opcional)
npm run db:studio
```

### 6.2 Despliegue Producción
```bash
# Construir aplicación
npm run build

# Desplegar en Vercel/Netlify (frontend)
# Desplegar en Railway/Heroku (backend)
# Base de datos en Neon/Supabase
```

## Ejemplos de Personalización

### Dashboard Personalizado
```typescript
// src/pages/dashboard.tsx
const CustomDashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard title="Ventas Hoy" value="$5,234" />
      <MetricCard title="Gastos Mes" value="$3,456" />
      <MetricCard title="Utilidad" value="$1,778" />
      <MetricCard title="Meta Mensual" value="85%" />
    </div>
  );
};
```

### Formularios Específicos
```typescript
// Formulario adaptado a tu negocio
const RestaurantIncomeForm = () => {
  const [formData, setFormData] = useState({
    mesa: '',
    mesero: '',
    productos: [],
    total: 0,
    metodoPago: 'efectivo'
  });
  
  // Lógica específica del restaurante
};
```

## Ventajas de Este Enfoque

✅ **Rapidez**: Aplicación funcional en minutos, no semanas
✅ **Robustez**: Código probado en producción
✅ **Flexibilidad**: Fácil personalización para cualquier negocio
✅ **Escalabilidad**: Arquitectura profesional incluida
✅ **Mantenibilidad**: Documentación y estructura clara

## Soporte y Recursos

- **Documentación completa**: En docs/module-export-guide.md
- **Ejemplos de código**: En el módulo exportado
- **Estructura probada**: Basada en ParkSys en producción
- **Comunidad**: Soporte del equipo original

¿Listo para crear tu aplicación? ¡Solo sigue estos pasos!