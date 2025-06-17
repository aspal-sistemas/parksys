import React, { Suspense } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";

// Páginas del módulo
const DashboardPage = React.lazy(() => import('./pages/dashboard'));
const VentasDiariasPage = React.lazy(() => import('./pages/ventas-diarias'));
const IncomesPage = React.lazy(() => import('./pages/incomes'));
const ExpensesPage = React.lazy(() => import('./pages/expenses'));
const BudgetPage = React.lazy(() => import('./pages/budget'));
const ReportsPage = React.lazy(() => import('./pages/reports'));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-orange-600 shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">🍽️ Mi Restaurante - Sistema Financiero</h1>
            <div className="flex space-x-4">
              <a href="/" className="text-orange-100 hover:text-white px-3 py-2 rounded-md">Dashboard</a>
              <a href="/ventas-diarias" className="text-orange-100 hover:text-white px-3 py-2 rounded-md">Ventas Diarias</a>
              <a href="/gastos" className="text-orange-100 hover:text-white px-3 py-2 rounded-md">Gastos</a>
              <a href="/reportes" className="text-orange-100 hover:text-white px-3 py-2 rounded-md">Reportes</a>
            </div>
          </div>
        </nav>
        
        <main className="container mx-auto p-6">
          <Switch>
            <Route path="/">
              <Suspense fallback={<div className="text-center py-8">Cargando...</div>}>
                <DashboardPage />
              </Suspense>
            </Route>
            
            
            <Route path="/dashboard">
              <Suspense fallback={<div className="text-center py-8">Cargando dashboard...</div>}>
                <DashboardPage />
              </Suspense>
            </Route>
            <Route path="/incomes">
              <Suspense fallback={<div className="text-center py-8">Cargando incomes...</div>}>
                <IncomesPage />
              </Suspense>
            </Route>
            <Route path="/expenses">
              <Suspense fallback={<div className="text-center py-8">Cargando expenses...</div>}>
                <ExpensesPage />
              </Suspense>
            </Route>
            <Route path="/budget">
              <Suspense fallback={<div className="text-center py-8">Cargando budget...</div>}>
                <BudgetPage />
              </Suspense>
            </Route>
            <Route path="/reports">
              <Suspense fallback={<div className="text-center py-8">Cargando reports...</div>}>
                <ReportsPage />
              </Suspense>
            </Route>
            
            <Route>
              <div className="text-center py-16">
                <h2 className="text-xl font-semibold mb-4">Página no encontrada</h2>
                <p>La página que buscas no existe.</p>
              </div>
            </Route>
          </Switch>
        </main>
        
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
