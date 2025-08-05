# Sistema de Finanzas

Módulo completo de gestión financiera municipal

## Características

- ✅ Frontend React con TypeScript
- ✅ Backend Express con APIs REST
- ✅ Base de datos PostgreSQL con Drizzle ORM
- ✅ Componentes UI con Radix y Tailwind
- ✅ Gestión de estado con React Query
- ✅ Validación con Zod

## Instalación Rápida

```bash
# Instalar dependencias
npm install

# Configurar base de datos
cp .env.example .env
# Editar DATABASE_URL en .env

# Crear tablas
npm run db:push

# Iniciar desarrollo
npm run dev
```

## Estructura del Proyecto

```
├── src/
│   ├── pages/          # Páginas React
│   ├── components/     # Componentes reutilizables
│   └── lib/           # Utilidades
├── server/            # API del servidor
├── shared/            # Esquemas compartidos
└── docs/             # Documentación
```

## Páginas Incluidas

- **Dashboard**: Gestión de dashboard
- **Incomes**: Gestión de incomes
- **Expenses**: Gestión de expenses
- **Budget**: Gestión de budget
- **Reports**: Gestión de reports

## Base de Datos

Tablas incluidas:
- `income_categories`
- `expense_categories`
- `actual_incomes`
- `actual_expenses`
- `budgets`

## API Endpoints

Todos los endpoints siguen el patrón REST estándar:
- `GET /api/[recurso]` - Listar
- `POST /api/[recurso]` - Crear
- `PUT /api/[recurso]/:id` - Actualizar
- `DELETE /api/[recurso]/:id` - Eliminar

## Desarrollo

```bash
# Servidor de desarrollo (frontend)
npm run dev

# Servidor backend
npm run server

# Base de datos
npm run db:studio
```

## Personalización

1. **Colores**: Editar `tailwind.config.js`
2. **Logo**: Reemplazar archivos en `public/`
3. **Textos**: Modificar componentes en `src/pages/`
4. **API**: Agregar rutas en `server/routes.ts`

## Despliegue

El módulo está listo para desplegarse en:
- Vercel (frontend)
- Railway/Heroku (backend)
- Neon/Supabase (base de datos)

## Soporte

Para documentación completa y soporte, visita el repositorio principal de ParkSys.
