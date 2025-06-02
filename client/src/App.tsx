import React, { Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProfileCompletionProvider } from "@/components/ProfileCompletionContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Parks from "@/pages/parks";
import ParkDetail from "@/pages/park-detail";
import AdminDashboard from "@/pages/admin";
import AdminParks from "@/pages/admin/parks";
import AdminParkEdit from "@/pages/admin/park-edit";
import AdminParksImport from "@/pages/admin/parks-import";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminDocuments from "@/pages/admin/documents";
import AdminComments from "@/pages/admin/comments";
import AdminIncidents from "@/pages/admin/incidents";
import AdminUsers from "@/pages/admin/users";
import AdminActivities from "@/pages/admin/activities-simple";
import AdminAmenities from "@/pages/admin/amenities";
import AdminSettings from "@/pages/admin/settings";
import AdminLogin from "@/pages/admin/login";
import AdminVolunteers from "@/pages/admin/volunteers";
// El import de AdminVolunteerNew ha sido eliminado
import AdminVolunteerParticipations from "@/pages/admin/volunteers/participations";
import AdminParticipationEdit from "@/pages/admin/volunteers/participations/edit";
import AdminVolunteerEvaluations from "@/pages/admin/volunteers/evaluations";
import AdminEvaluationEdit from "@/pages/admin/volunteers/evaluations/edit";
import DashboardPage from "@/pages/admin/volunteers/dashboard-page";
import Header from "@/components/Header";

function Router() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin');
  
  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && <Header />}
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/parks" component={Parks} />
        <Route path="/parks/:id" component={ParkDetail} />
        <Route path="/instructors">
          <Suspense fallback={<div className="p-8 text-center">Cargando instructores...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/instructors')))}
          </Suspense>
        </Route>
        <Route path="/calendar">
          <Suspense fallback={<div className="p-8 text-center">Cargando calendario...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/calendar')))}
          </Suspense>
        </Route>

        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/parks" component={AdminParks} />
        <Route path="/admin/parks/dashboard">
          <Suspense fallback={<div className="p-8 text-center">Cargando dashboard de parques...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/parks-dashboard')))}
          </Suspense>
        </Route>
        <Route path="/admin/parks-dashboard">
          <Suspense fallback={<div className="p-8 text-center">Cargando dashboard de parques...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/parks-dashboard')))}
          </Suspense>
        </Route>
        <Route path="/admin/parks-import" component={AdminParksImport} />
        <Route path="/admin/parks/new" component={AdminParkEdit} />
        <Route path="/admin/parks/:id" component={AdminParkEdit} />
        <Route path="/admin/parks/:id/view">
          <Suspense fallback={<div className="p-8 text-center">Cargando vista del parque...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/park-view')))}
          </Suspense>
        </Route>
        <Route path="/admin/parks/:id/edit">
          <Suspense fallback={<div className="p-8 text-center">Cargando editor del parque...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/parks/[id]/edit')))}
          </Suspense>
        </Route>
        <Route path="/admin/organizador">
          <Suspense fallback={<div className="p-8 text-center">Cargando Organizador...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/organizador')))}
          </Suspense>
        </Route>
        <Route path="/admin/organizador/nueva-actividad">
          <Suspense fallback={<div className="p-8 text-center">Cargando formulario de actividad...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/organizador/nueva-actividad')))}
          </Suspense>
        </Route>
        <Route path="/admin/organizador/catalogo/crear">
          <Suspense fallback={<div className="p-8 text-center">Cargando formulario de nueva actividad...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/organizador/catalogo/crear')))}
          </Suspense>
        </Route>
        <Route path="/admin/organizador/catalogo/ver">
          <Suspense fallback={<div className="p-8 text-center">Cargando actividades disponibles...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/organizador/catalogo/ver')))}
          </Suspense>
        </Route>
        <Route path="/admin/organizador/catalogo/editar/:id">
          <Suspense fallback={<div className="p-8 text-center">Cargando editor de actividad...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/organizador/catalogo/editar-nuevo')))}
          </Suspense>
        </Route>
        <Route path="/admin/organizador/catalogo/:id">
          <Suspense fallback={<div className="p-8 text-center">Cargando detalles de actividad...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/organizador/catalogo/detalle-basico')))}
          </Suspense>
        </Route>
        <Route path="/admin/activities" component={AdminActivities} />
        <Route path="/admin/activities/calendar">
          <Suspense fallback={<div className="p-8 text-center">Cargando calendario...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/activities/calendar')))}
          </Suspense>
        </Route>
        <Route path="/admin/analytics" component={AdminAnalytics} />
        <Route path="/admin/documents" component={AdminDocuments} />
        <Route path="/admin/comments" component={AdminComments} />
        <Route path="/admin/incidents" component={AdminIncidents} />
        <Route path="/admin/incidents/dashboard">
          <Suspense fallback={<div className="p-8 text-center">Cargando dashboard de incidencias...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/incidents/dashboard')))}
          </Suspense>
        </Route>
        <Route path="/admin/incidents/categories">
          <Suspense fallback={<div className="p-8 text-center">Cargando categorías de incidencias...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/incidents/categories')))}
          </Suspense>
        </Route>
        <Route path="/admin/incidents/:id">
          <Suspense fallback={<div className="p-8 text-center">Cargando detalles de incidencia...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/incidents/[id]')))}
          </Suspense>
        </Route>
        {/* Página de acceso directo al dashboard */}
        <Route path="/admin/incidentes-dashboard">
          <Suspense fallback={<div className="p-8 text-center">Cargando página de acceso al dashboard...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/incidentes-dashboard')))}
          </Suspense>
        </Route>
        
        {/* Nueva página dedicada para acceso al dashboard de incidencias */}
        <Route path="/admin/dashboard-incidencias">
          <Suspense fallback={<div className="p-8 text-center">Cargando acceso al dashboard...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/dashboard-incidencias')))}
          </Suspense>
        </Route>
        <Route path="/admin/users">
          <Suspense fallback={<div className="p-8 text-center">Cargando gestión de usuarios...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/users')))}
          </Suspense>
        </Route>

        {/* Rutas para concesionarios movidas al módulo de Concesiones */}
        <Route path="/admin/amenities" component={AdminAmenities} />
        <Route path="/admin/amenities-dashboard">
          <Suspense fallback={<div className="p-8 text-center">Cargando dashboard de amenidades...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/amenities-dashboard')))}
          </Suspense>
        </Route>
        <Route path="/admin/settings" component={AdminSettings} />
        <Route path="/admin/permissions">
          <Suspense fallback={<div className="p-8 text-center">Cargando permisos...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/permissions')))}
          </Suspense>
        </Route>
        <Route path="/admin/settings/profile">
          <Suspense fallback={<div className="p-8 text-center">Cargando perfil...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/settings/profile')))}
          </Suspense>
        </Route>
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/permissions">
          <Suspense fallback={<div className="p-8 text-center">Cargando gestión de permisos...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/permissions')))}
          </Suspense>
        </Route>
        <Route path="/admin/volunteers">
          <Suspense fallback={<div className="p-8 text-center">Cargando gestión de voluntarios...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/volunteers/index')))}
          </Suspense>
        </Route>
        <Route path="/admin/volunteers/participations" component={AdminVolunteerParticipations} />
        <Route path="/admin/volunteers/participations/:id" component={AdminParticipationEdit} />
        <Route path="/admin/volunteers/evaluations" component={AdminVolunteerEvaluations} />
        <Route path="/admin/volunteers/evaluations/:id" component={AdminEvaluationEdit} />
        <Route path="/admin/volunteers/recognitions">
          <Suspense fallback={<div className="p-8 text-center">Cargando reconocimientos...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/volunteers/recognitions')))}
          </Suspense>
        </Route>
        <Route path="/admin/volunteers/dashboard">
          <Suspense fallback={<div className="p-8 text-center">Cargando dashboard de voluntariado...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/volunteers/dashboard/index')))}
          </Suspense>
        </Route>
        <Route path="/admin/volunteers/settings">
          <Suspense fallback={<div className="p-8 text-center">Cargando configuración de voluntariado...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/volunteers/settings/index')))}
          </Suspense>
        </Route>
        
        {/* La ruta de registro y edición de voluntarios ha sido eliminada del módulo de Voluntarios
             ya que ahora se gestiona desde el módulo de Usuarios */}
        
        {/* Rutas para el módulo de instructores */}
        <Route path="/admin/instructors/evaluations">
          <Suspense fallback={<div className="p-8 text-center">Cargando evaluaciones de instructores...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/instructors/evaluations/index')))}
          </Suspense>
        </Route>
        <Route path="/admin/instructors/cards">
          <Suspense fallback={<div className="p-8 text-center">Cargando tarjetas de instructores...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/instructors/cards')))}
          </Suspense>
        </Route>
        <Route path="/admin/instructors/detail/:id">
          <Suspense fallback={<div className="p-8 text-center">Cargando perfil de instructor...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/instructors/detail')))}
          </Suspense>
        </Route>
        <Route path="/admin/instructors/:id">
          <Suspense fallback={<div className="p-8 text-center">Cargando perfil de instructor...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/instructors/detail')))}
          </Suspense>
        </Route>
        <Route path="/admin/instructors">
          <Suspense fallback={<div className="p-8 text-center">Cargando lista de instructores...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/instructors/index')))}
          </Suspense>
        </Route>
        
        {/* Rutas para el módulo de eventos */}
        <Route path="/admin/events">
          <Suspense fallback={<div className="p-8 text-center">Cargando eventos...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/events/index')))}
          </Suspense>
        </Route>
        <Route path="/admin/events/new">
          <Suspense fallback={<div className="p-8 text-center">Cargando formulario de nuevo evento...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/events/new')))}
          </Suspense>
        </Route>
        <Route path="/admin/events/:id">
          <Suspense fallback={<div className="p-8 text-center">Cargando detalles del evento...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/events/[id]')))}
          </Suspense>
        </Route>
        <Route path="/admin/events/:id/edit">
          <Suspense fallback={<div className="p-8 text-center">Cargando editor de evento...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/events/edit')))}
          </Suspense>
        </Route>
        <Route path="/admin/events/participants/:id">
          <Suspense fallback={<div className="p-8 text-center">Cargando gestión de participantes...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/events/participants/[id]')))}
          </Suspense>
        </Route>
        
        {/* Ruta para el calendario de actividades */}
        <Route path="/admin/activities/calendar">
          <Suspense fallback={<div className="p-8 text-center">Cargando calendario de actividades...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/activities/calendar')))}
          </Suspense>
        </Route>

        {/* Rutas para el módulo de activos */}
        <Route path="/admin/assets/dashboard">
          <Suspense fallback={<div className="p-8 text-center">Cargando dashboard de activos...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/assets/dashboard-static')))}
          </Suspense>
        </Route>
        <Route path="/admin/assets">
          <Suspense fallback={<div className="p-8 text-center">Cargando gestión de activos...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/assets/index')))}
          </Suspense>
        </Route>
        <Route path="/admin/assets/new">
          <Suspense fallback={<div className="p-8 text-center">Cargando formulario de nuevo activo...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/assets/new')))}
          </Suspense>
        </Route>
        <Route path="/admin/assets/categories">
          <Suspense fallback={<div className="p-8 text-center">Cargando categorías de activos...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/assets/categories/index')))}
          </Suspense>
        </Route>
        <Route path="/admin/assets/inventory">
          <Suspense fallback={<div className="p-8 text-center">Cargando inventario de activos...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/assets/inventory/index')))}
          </Suspense>
        </Route>
        <Route path="/admin/assets/map">
          <Suspense fallback={<div className="p-8 text-center">Cargando mapa de activos...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/assets/map-simple')))}
          </Suspense>
        </Route>
        <Route path="/admin/assets/maintenance/calendar">
          <Suspense fallback={<div className="p-8 text-center">Cargando calendario de mantenimiento...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/assets/maintenance-calendar-simple')))}
          </Suspense>
        </Route>
        
        <Route path="/admin/assets/maintenance/schedule">
          <Suspense fallback={<div className="p-8 text-center">Cargando formulario de mantenimiento...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/assets/schedule-maintenance')))}
          </Suspense>
        </Route>
        
        <Route path="/admin/assets/assign-manager">
          <Suspense fallback={<div className="p-8 text-center">Cargando asignación de responsable...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/assets/assign-manager')))}
          </Suspense>
        </Route>
        
        <Route path="/admin/assets/report-issue">
          <Suspense fallback={<div className="p-8 text-center">Cargando formulario de reporte...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/assets/report-issue')))}
          </Suspense>
        </Route>
        
        <Route path="/admin/assets/assign-equipment">
          <Suspense fallback={<div className="p-8 text-center">Cargando asignación de equipamiento...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/assets/assign-equipment')))}
          </Suspense>
        </Route>
        
        <Route path="/admin/assets/:id/location">
          <Suspense fallback={<div className="p-8 text-center">Cargando editor de ubicación...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/assets/edit-location')))}
          </Suspense>
        </Route>
        <Route path="/admin/assets/:id/edit">
          <Suspense fallback={<div className="p-8 text-center">Cargando editor de activo...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/assets/edit')))}
          </Suspense>
        </Route>
        <Route path="/admin/assets/:id/edit-simple">
          <Suspense fallback={<div className="p-8 text-center">Cargando editor simple...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/assets/edit-simple')))}
          </Suspense>
        </Route>
        <Route path="/admin/assets/:id/edit-basic">
          <Suspense fallback={<div className="p-8 text-center">Cargando editor básico...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/assets/edit-basic')))}
          </Suspense>
        </Route>
        <Route path="/admin/assets/:id">
          <Suspense fallback={<div className="p-8 text-center">Cargando detalles del activo...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/assets/[id]')))}
          </Suspense>
        </Route>
        
        {/* Rutas para el módulo de árboles */}
        <Route path="/admin/trees/catalog">
          <Suspense fallback={<div className="p-8 text-center">Cargando catálogo de especies arbóreas...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/trees/catalog/index')))}
          </Suspense>
        </Route>
        <Route path="/admin/trees/catalog/new">
          <Suspense fallback={<div className="p-8 text-center">Cargando formulario de nueva especie arbórea...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/trees/catalog/new/index')))}
          </Suspense>
        </Route>
        <Route path="/admin/trees/catalog/:id">
          <Suspense fallback={<div className="p-8 text-center">Cargando detalles de especie arbórea...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/trees/catalog/[id]/index')))}
          </Suspense>
        </Route>
        <Route path="/admin/trees/catalog/:id/edit">
          <Suspense fallback={<div className="p-8 text-center">Cargando formulario de edición de especie arbórea...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/trees/catalog/[id]/edit/index')))}
          </Suspense>
        </Route>
        <Route path="/admin/trees/dashboard">
          <Suspense fallback={<div className="p-8 text-center">Cargando dashboard de arbolado...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/trees/dashboard/index')))}
          </Suspense>
        </Route>
        
        {/* Ruta del Mapa de Árboles */}
        <Route path="/admin/trees/map">
          <Suspense fallback={<div className="p-8 text-center">Cargando mapa de árboles...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/trees/map/fixed-map')))}
          </Suspense>
        </Route>

        {/* Rutas del Inventario de Árboles */}
        <Route path="/admin/trees/inventory">
          <Suspense fallback={<div className="p-8 text-center">Cargando inventario de árboles...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/trees/inventory/index')))}
          </Suspense>
        </Route>
        <Route path="/admin/trees/inventory/new">
          <Suspense fallback={<div className="p-8 text-center">Cargando formulario de nuevo árbol...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/trees/inventory/new/index')))}
          </Suspense>
        </Route>
        <Route path="/admin/trees/inventory/:id">
          <Suspense fallback={<div className="p-8 text-center">Cargando detalles del árbol...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/trees/inventory/[id]/index')))}
          </Suspense>
        </Route>
        <Route path="/admin/trees/inventory/:id/edit">
          <Suspense fallback={<div className="p-8 text-center">Cargando formulario de edición del árbol...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/trees/inventory/[id]/edit/index')))}
          </Suspense>
        </Route>
        
        {/* Ruta para Reportes de Árboles */}
        <Route path="/admin/trees/reports">
          <Suspense fallback={<div className="p-8 text-center">Cargando reportes de árboles...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/trees/reports/index')))}
          </Suspense>
        </Route>

        {/* Rutas para Gestión Técnica de Árboles */}
        <Route path="/admin/trees/technical">
          <Suspense fallback={<div className="p-8 text-center">Cargando gestión técnica de árboles...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/trees/technical/index')))}
          </Suspense>
        </Route>

        {/* Rutas para Gestión Ambiental de Árboles */}
        <Route path="/admin/trees/environmental">
          <Suspense fallback={<div className="p-8 text-center">Cargando gestión ambiental de árboles...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/trees/environmental/index')))}
          </Suspense>
        </Route>
        
        {/* Ruta para Gestión de Mantenimiento de Árboles */}
        <Route path="/admin/trees/maintenance">
          <Suspense fallback={<div className="p-8 text-center">Cargando gestión de mantenimiento de árboles...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/trees/maintenance/index')))}
          </Suspense>
        </Route>
        
        {/* Rutas para el Módulo de Concesiones */}
        <Route path="/admin/concessions/catalog">
          <Suspense fallback={<div className="p-8 text-center">Cargando catálogo de concesiones...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/concessions/catalog/index')))}
          </Suspense>
        </Route>
        
        <Route path="/admin/concessions/concessionaires">
          <Suspense fallback={<div className="p-8 text-center">Cargando gestión de concesionarios...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/concessions/concessionaires/ConcessionairesTabbed')))}
          </Suspense>
        </Route>
        
        <Route path="/admin/concessions/contracts">
          <Suspense fallback={<div className="p-8 text-center">Cargando contratos de concesiones...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/concessions/contracts/index')))}
          </Suspense>
        </Route>

        {/* Nuevas rutas para el módulo extendido de concesiones */}
        <Route path="/admin/concessions/locations">
          <Suspense fallback={<div className="p-8 text-center">Cargando ubicaciones de concesiones...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/concessions/locations/index')))}
          </Suspense>
        </Route>

        <Route path="/admin/concessions/payments">
          <Suspense fallback={<div className="p-8 text-center">Cargando gestión financiera de concesiones...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/concessions/payments/index')))}
          </Suspense>
        </Route>

        <Route path="/admin/concessions/evaluations">
          <Suspense fallback={<div className="p-8 text-center">Cargando evaluaciones de concesiones...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/concessions/evaluations/index')))}
          </Suspense>
        </Route>

        {/* Rutas para el módulo financiero reestructurado */}
        <Route path="/admin/finance/dashboard">
          <Suspense fallback={<div className="p-8 text-center">Cargando dashboard financiero...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/finance/dashboard')))}
          </Suspense>
        </Route>
        
        <Route path="/admin/finance/incomes">
          <Suspense fallback={<div className="p-8 text-center">Cargando cédula de ingresos...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/finance/incomes')))}
          </Suspense>
        </Route>
        
        <Route path="/admin/finance/expenses">
          <Suspense fallback={<div className="p-8 text-center">Cargando cédula de egresos...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/finance/expenses')))}
          </Suspense>
        </Route>
        

        
        <Route path="/admin/finance/cash-flow-matrix">
          <Suspense fallback={<div className="p-8 text-center">Cargando matriz de flujo de efectivo...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/finance/cash-flow-matrix')))}
          </Suspense>
        </Route>
        
        <Route path="/admin/finance/calculator">
          <Suspense fallback={<div className="p-8 text-center">Cargando calculadora avanzada...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/finance/AdvancedCalculator')))}
          </Suspense>
        </Route>
        
        <Route path="/admin/finance/budget">
          <Suspense fallback={<div className="p-8 text-center">Cargando módulo de presupuesto...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/finance/budget')))}
          </Suspense>
        </Route>
        
        {/* Redirección de compatibilidad para la calculadora avanzada */}
        <Route path="/admin/finance/advanced-calculator">
          <Suspense fallback={<div className="p-8 text-center">Cargando calculadora avanzada...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/finance/AdvancedCalculator')))}
          </Suspense>
        </Route>
        
        <Route path="/admin/finance/reports">
          <Suspense fallback={<div className="p-8 text-center">Cargando reportes ejecutivos...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/finance/reports')))}
          </Suspense>
        </Route>
        
        <Route path="/admin/finance/catalog">
          <Suspense fallback={<div className="p-8 text-center">Cargando catálogo...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/finance/catalog')))}
          </Suspense>
        </Route>
        
        <Route path="/admin/finance/annual-budget">
          <Suspense fallback={<div className="p-8 text-center">Cargando presupuesto anual...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/finance/annual-budget-advanced')))}
          </Suspense>
        </Route>
        <Route path="/admin/finance/annual-budget-advanced">
          <Suspense fallback={<div className="p-8 text-center">Cargando presupuesto anual avanzado...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/finance/annual-budget-advanced')))}
          </Suspense>
        </Route>

        {/* Rutas del módulo de Recursos Humanos */}
        <Route path="/admin/hr/employees">
          <Suspense fallback={<div className="p-8 text-center">Cargando gestión de personal...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/hr/employees')))}
          </Suspense>
        </Route>
        
        <Route path="/admin/hr/training">
          <Suspense fallback={<div className="p-8 text-center">Cargando módulo de capacitación...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/hr/training')))}
          </Suspense>
        </Route>
        
        <Route path="/admin/hr/payroll">
          <Suspense fallback={<div className="p-8 text-center">Cargando módulo de nómina...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/hr/payroll')))}
          </Suspense>
        </Route>
        
        <Route path="/admin/hr/wellness">
          <Suspense fallback={<div className="p-8 text-center">Cargando módulo de bienestar...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/hr/wellness')))}
          </Suspense>
        </Route>
        
        <Route path="/admin/hr/analytics">
          <Suspense fallback={<div className="p-8 text-center">Cargando analytics de RH...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/hr/analytics')))}
          </Suspense>
        </Route>

        {/* Rutas del módulo de Marketing */}
        <Route path="/admin/marketing/sponsors">
          <Suspense fallback={<div className="p-8 text-center">Cargando gestión de patrocinios...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/marketing/sponsors')))}
          </Suspense>
        </Route>

        {/* Ruta de redirección para compatibilidad */}
        <Route path="/admin/finance">
          <Suspense fallback={<div className="p-8 text-center">Cargando dashboard financiero...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/finance/dashboard')))}
          </Suspense>
        </Route>
        
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProfileCompletionProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ProfileCompletionProvider>
    </QueryClientProvider>
  );
}

export default App;