# Sistema Financiero para Restaurante

## Instalación Rápida

### 1. Configurar Base de Datos
```bash
# Crear base de datos PostgreSQL
createdb restaurante_db

# Configurar variables de entorno
cp .env.example .env
# Editar DATABASE_URL en .env con tus credenciales
```

### 2. Instalar y Ejecutar
```bash
# Instalar dependencias
npm install

# Crear tablas de base de datos
npm run db:push

# Iniciar aplicación
npm run dev    # Frontend en puerto 5173
npm run server # Backend en puerto 3001
```

## Funcionalidades Específicas del Restaurante

### Dashboard Principal
- Métricas diarias de ventas
- Control de flujo de efectivo
- Indicadores de rendimiento

### Ventas Diarias
- Registro por mesa y mesero
- Métodos de pago (efectivo, tarjeta, transferencia)
- Cálculo automático de tickets promedio
- Histórico de transacciones

### Categorías Financieras Predefinidas

#### Ingresos
- **VEN001**: Ventas de Alimentos
- **VEN002**: Ventas de Bebidas  
- **VEN003**: Servicios de Delivery
- **VEN004**: Eventos y Banquetes

#### Egresos
- **COM001**: Compra de Ingredientes
- **PER001**: Nómina y Prestaciones
- **SER001**: Servicios (luz, agua, gas)
- **MAN001**: Mantenimiento de Equipo
- **ALQ001**: Renta del Local

### Personalización Adicional

#### Agregar Nuevas Categorías
```sql
INSERT INTO income_categories (code, name, description) 
VALUES ('VEN005', 'Catering', 'Servicios de catering externos');

INSERT INTO expense_categories (code, name, description)
VALUES ('MAR001', 'Marketing', 'Publicidad y promociones');
```

#### Modificar Colores del Sistema
```css
/* En tailwind.config.js */
theme: {
  extend: {
    colors: {
      'restaurant-primary': '#f97316',  // Naranja
      'restaurant-secondary': '#ea580c', // Naranja oscuro
    }
  }
}
```

## Casos de Uso Específicos

### Registro de Venta por Mesa
1. Acceder a "Ventas Diarias"
2. Llenar formulario con:
   - Número de mesa
   - Mesero responsable
   - Total de la cuenta
   - Método de pago
3. El sistema registra automáticamente fecha y hora

### Control de Gastos Diarios
1. Usar página "Gastos" (expenses)
2. Categorizar por tipo (ingredientes, servicios, etc.)
3. Adjuntar facturas o comprobantes
4. Generar reportes mensuales

### Reportes de Rentabilidad
- Dashboard muestra balance diario
- Comparación mes actual vs anterior
- Identificación de días más rentables
- Análisis por método de pago

## Integraciones Disponibles

### Facturación Electrónica (México)
- Compatible con SAT
- Generación automática de CFDI
- Campos RFC y régimen fiscal configurables

### Sistemas POS
- API REST para integración con terminales
- Webhooks para sincronización automática
- Soporte para múltiples sucursales

### Reportes Contables
- Exportación a Excel
- Formato para contadores
- Conciliación bancaria

## Configuración Avanzada

### Variables de Entorno del Restaurante
```bash
RESTAURANT_NAME="Tu Restaurante"
CURRENCY="MXN"
TIMEZONE="America/Mexico_City"
RFC_RESTAURANT="XAXX010101000"
```

### Backup Automático
```bash
# Configurar backup diario de base de datos
crontab -e
# Agregar: 0 2 * * * pg_dump restaurante_db > backup_$(date +\%Y\%m\%d).sql
```

## Escalabilidad

### Múltiples Sucursales
- Agregar campo `sucursal_id` a transacciones
- Dashboard consolidado por sucursal
- Reportes comparativos

### Integración con Inventarios
- Control de stock de ingredientes
- Alertas de productos agotados
- Costo de platillos automático

### Sistema de Reservas
- Módulo adicional para reservas
- Integración con ventas
- Análisis de ocupación

## Soporte y Mantenimiento

### Logs del Sistema
```bash
# Ver logs del servidor
npm run server 2>&1 | tee logs/server.log

# Monitorear base de datos
npm run db:studio
```

### Actualizaciones
- Sistema modular permite actualizaciones independientes
- Backup antes de cada actualización
- Rollback automático en caso de errores

## Contacto y Soporte

Para soporte técnico o personalizaciones adicionales:
- Documentación completa en `/docs`
- Ejemplos de código en `/examples`
- API Reference en `/api-docs`

¡Tu sistema financiero está listo para gestionar las operaciones de tu restaurante!