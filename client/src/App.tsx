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
import AdminAmenities from "@/pages/admin/amenities";
import AdminSettings from "@/pages/admin/settings";
import AdminLogin from "@/pages/admin/login";
import AdminVolunteers from "@/pages/admin/volunteers";
import AdminVolunteerNew from "@/pages/admin/volunteers/new";
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
        <Route path="/admin/parks-import" component={AdminParksImport} />
        <Route path="/admin/parks/new" component={AdminParkEdit} />
        <Route path="/admin/parks/:id" component={AdminParkEdit} />
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
        <Route path="/admin/analytics" component={AdminAnalytics} />
        <Route path="/admin/documents" component={AdminDocuments} />
        <Route path="/admin/comments" component={AdminComments} />
        <Route path="/admin/incidents" component={AdminIncidents} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/amenities" component={AdminAmenities} />
        <Route path="/admin/settings" component={AdminSettings} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/permissions">
          <Suspense fallback={<div className="p-8 text-center">Cargando gestión de permisos...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/permissions')))}
          </Suspense>
        </Route>
        <Route path="/admin/volunteers" component={AdminVolunteers} />
        <Route path="/admin/volunteers/new" component={AdminVolunteerNew} />
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
        
        {/* La ruta de registro público de voluntarios ha sido eliminada */}
        <Route path="/admin/volunteers/:id">
          <Suspense fallback={<div className="p-8 text-center">Cargando editor de voluntarios...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/volunteers/edit')))}
          </Suspense>
        </Route>
        
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
        <Route path="/admin/assets/:id">
          <Suspense fallback={<div className="p-8 text-center">Cargando detalles del activo...</div>}>
            {React.createElement(React.lazy(() => import('@/pages/admin/assets/[id]')))}
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