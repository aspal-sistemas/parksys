import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, ChevronDown, LogIn, Home, HelpCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlobalSearch from '@/components/GlobalSearch';
import { HelpCenter } from '@/components/HelpCenter';
import { LanguageSelector } from '@/components/LanguageSelector';
import UserProfileImage from '@/components/UserProfileImage';
import { useAuth } from '@/hooks/useAuth';
import logoImage from '@assets/logo_1751306368691.png';

const Header: React.FC = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contentMenuOpen, setContentMenuOpen] = useState(false);
  const [biodiversityMenuOpen, setBiodiversityMenuOpen] = useState(false);
  const [usersMenuOpen, setUsersMenuOpen] = useState(false);
  const [gestionMenuOpen, setGestionMenuOpen] = useState(false);
  
  const { user, logout } = useAuth();
  const isAdmin = location.startsWith('/admin');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  const toggleContentMenu = () => {
    setContentMenuOpen(prev => !prev);
  };

  const toggleBiodiversityMenu = () => {
    setBiodiversityMenuOpen(prev => !prev);
  };

  const toggleUsersMenu = () => {
    setUsersMenuOpen(prev => !prev);
  };

  const toggleGestionMenu = () => {
    setGestionMenuOpen(prev => !prev);
  };

  const isContentActive = location === '/activities' || 
                          location === '/reservations' ||
                          location === '/events' ||
                          location === '/calendar' || 
                          location === '/concessions';

  const isBiodiversityActive = location === '/tree-species' || 
                               location === '/fauna';

  const isUsersActive = location === '/volunteers' || 
                        location === '/instructors';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 shadow-sm border-b border-gray-200" style={{ backgroundColor: isAdmin ? '#D2EAEA' : 'white' }}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-20">
          <div className="flex items-center">
            {/* Logo y navegación - Solo mostrar para páginas públicas */}
            {!isAdmin && (
              <>
                <Link href="/">
                  <div className="flex-shrink-0 flex items-center cursor-pointer">
                    <img 
                      src={logoImage} 
                      alt="Logo Bosques Urbanos de Guadalajara" 
                      className="h-10 w-auto"
                    />
                  </div>
                </Link>
                
                {/* Desktop navigation */}
              <nav className="hidden md:ml-8 md:flex md:space-x-6">
                <Link href="/"
                  className={`border-b-2 pt-1 pb-3 px-1 text-sm font-medium ${
                    location === '/' 
                      ? 'border-primary text-gray-900' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}>
                  Inicio
                </Link>
                
                <Link href="/parks"
                  className={`border-b-2 pt-1 pb-3 px-1 text-sm font-medium ${
                    location === '/parks' 
                      ? 'border-primary text-gray-900' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}>
                  Parques
                </Link>
                
                {/* Menú de Contenido con dropdown */}
                <div className="relative group">
                  <button
                    className={`border-b-2 pt-1 pb-3 px-1 text-sm font-medium flex items-center ${
                      isContentActive
                        ? 'border-primary text-gray-900' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}>
                    Contenido
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </button>
                  
                  {/* Dropdown menu */}
                  <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link href="/activities"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                        Actividades
                      </Link>
                      <Link href="/reservations"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                        Reserva de Espacios
                      </Link>
                      <Link href="/events"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                        Eventos
                      </Link>
                      <Link href="/calendar"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                        Calendario
                      </Link>
                      <Link href="/concessions"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                        Servicios Comerciales
                      </Link>
                    </div>
                  </div>
                </div>
                
                {/* Menú de Biodiversidad con dropdown */}
                <div className="relative group">
                  <button
                    className={`border-b-2 pt-1 pb-3 px-1 text-sm font-medium flex items-center ${
                      isBiodiversityActive
                        ? 'border-primary text-gray-900' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}>
                    Biodiversidad
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </button>
                  
                  {/* Dropdown menu */}
                  <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link href="/tree-species"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                        Arbolado
                      </Link>
                      <Link href="/fauna"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                        Fauna
                      </Link>
                    </div>
                  </div>
                </div>
                
                {/* Menú de Usuarios con dropdown */}
                <div className="relative group">
                  <button
                    className={`border-b-2 pt-1 pb-3 px-1 text-sm font-medium flex items-center ${
                      isUsersActive
                        ? 'border-primary text-gray-900' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}>
                    Usuarios
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </button>
                  
                  {/* Dropdown menu */}
                  <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link href="/volunteers"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                        Voluntarios
                      </Link>
                      <Link href="/instructors"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                        Instructores
                      </Link>
                    </div>
                  </div>
                </div>
                
                {/* Enlace de registro de voluntarios removido */}
                {/* Botón "Acerca de" removido del menú principal */}
              </nav>
              </>
            )}
          </div>
          
          {/* Navegación para administradores - movida hacia la derecha */}
          {isAdmin && location !== '/admin/login' && (
            <div className="flex items-center gap-3 flex-1 justify-end mr-4">
              {/* Páneles de Control */}
              <Link href="/admin">
                <button
                  className={`py-2 px-3 text-sm font-medium flex items-center rounded-lg border transition-colors ${
                    location === '/admin' 
                      ? 'bg-primary text-white border-primary' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={{ 
                    backgroundColor: location !== '/admin' ? '#D2EAEA' : undefined,
                    borderColor: '#003D49'
                  }}>
                  <Home className="mr-2 h-4 w-4" />
                  Páneles de Control
                </button>
              </Link>

              {/* Menú de Gestión */}
              <div className="relative group">
                <button
                  className="py-2 px-3 text-sm font-medium flex items-center rounded-lg border text-gray-600 hover:text-gray-800 transition-colors"
                  style={{ 
                    backgroundColor: '#D2EAEA',
                    borderColor: '#003D49'
                  }}>
                  Gestión
                  <ChevronDown className="ml-1 h-3 w-3" />
                </button>
                
                {/* Dropdown menu */}
                <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link href="/admin/visitors/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                      Visitantes
                    </Link>
                    <Link href="/admin/parks/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                      Parques
                    </Link>
                    <Link href="/admin/trees/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                      Arbolado
                    </Link>
                    <Link href="/admin/organizador"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                      Actividades
                    </Link>
                    <Link href="/admin/amenities-dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                      Amenidades
                    </Link>
                  </div>
                </div>
              </div>

              {/* Menú O & M */}
              <div className="relative group">
                <button
                  className="py-2 px-3 text-sm font-medium flex items-center rounded-lg border text-gray-600 hover:text-gray-800 transition-colors"
                  style={{ 
                    backgroundColor: '#D2EAEA',
                    borderColor: '#003D49'
                  }}>
                  O & M
                  <ChevronDown className="ml-1 h-3 w-3" />
                </button>
                
                {/* Dropdown menu */}
                <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link href="/admin/assets/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                      Activos
                    </Link>
                    <Link href="/admin/incidents"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                      Incidencias
                    </Link>
                    <Link href="/admin/volunteers"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                      Voluntarios
                    </Link>
                  </div>
                </div>
              </div>

              {/* Menú Admin */}
              <div className="relative group">
                <button
                  className="py-2 px-3 text-sm font-medium flex items-center rounded-lg border text-gray-600 hover:text-gray-800 transition-colors"
                  style={{ 
                    backgroundColor: '#D2EAEA',
                    borderColor: '#003D49'
                  }}>
                  Admin
                  <ChevronDown className="ml-1 h-3 w-3" />
                </button>
                
                {/* Dropdown menu */}
                <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link href="/admin/finance"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                      Finanzas
                    </Link>
                    <Link href="/admin/accounting/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                      Contabilidad
                    </Link>
                    <Link href="/admin/concessions/reports"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                      Concesiones
                    </Link>
                  </div>
                </div>
              </div>

              {/* Menú Mkt y Comm */}
              <div className="relative group">
                <button
                  className="py-2 px-3 text-sm font-medium flex items-center rounded-lg border text-gray-600 hover:text-gray-800 transition-colors"
                  style={{ 
                    backgroundColor: '#D2EAEA',
                    borderColor: '#003D49'
                  }}>
                  Mkt y Comm
                  <ChevronDown className="ml-1 h-3 w-3" />
                </button>
                
                {/* Dropdown menu */}
                <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link href="/admin/marketing"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                      Marketing
                    </Link>
                    <Link href="/admin/advertising"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                      Publicidad
                    </Link>
                    <Link href="/admin/communications"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                      Comunicaciones
                    </Link>
                  </div>
                </div>
              </div>

              {/* Menú RH */}
              <Link href="/admin/hr/employees">
                <button
                  className="py-2 px-3 text-sm font-medium rounded-lg border text-gray-600 hover:text-gray-800 transition-colors"
                  style={{ 
                    backgroundColor: '#D2EAEA',
                    borderColor: '#003D49'
                  }}>
                  RH
                </button>
              </Link>


            </div>
          )}

          {/* Búsqueda Global y Ver Sitio Público - lado derecho */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Búsqueda Global - Solo en sitio público */}
            {!isAdmin && <GlobalSearch />}
            
            {isAdmin ? (
              location !== '/admin/login' && (
                <div className="flex items-center gap-2 mr-2">
                  <Link href="/">
                    <Button variant="outline" size="sm" className="rounded-lg border" style={{ 
                      backgroundColor: '#D2EAEA',
                      borderColor: '#003D49'
                    }}>
                      Sitio
                    </Button>
                  </Link>
                  <HelpCenter>
                    <Button variant="outline" size="sm" className="w-9 h-9 p-0 rounded-lg border" style={{ 
                      backgroundColor: '#D2EAEA',
                      borderColor: '#003D49'
                    }}>
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </HelpCenter>
                  <LanguageSelector />
                  <div className="flex items-center gap-2">
                    <UserProfileImage 
                      userId={(user as any)?.id || 0} 
                      role={(user as any)?.role || 'user'} 
                      name={(user as any)?.fullName || (user as any)?.username || 'Usuario'} 
                      size="sm" 
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800">
                        {(user as any)?.firstName && (user as any)?.lastName 
                          ? `${(user as any).firstName} ${(user as any).lastName}` 
                          : (user as any)?.fullName || (user as any)?.username || 'Usuario'}
                      </span>
                      <span className="text-xs text-gray-600">{(user as any)?.role || 'usuario'}</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 w-8 h-8 p-0"
                    title="Cerrar Sesión"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              )
            ) : (
              <Link href="/admin/login">
                <div className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors duration-200 shadow-md hover:shadow-lg">
                  <LogIn className="h-5 w-5 text-white" />
                </div>
              </Link>
            )}
            
            {/* Mobile menu button */}
            {!isAdmin && (
              <button 
                type="button" 
                className="md:hidden ml-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                onClick={toggleMobileMenu}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state. */}
      {mobileMenuOpen && !isAdmin && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location === '/' 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}>
              Inicio
            </Link>
            
            <Link href="/parks"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location === '/parks' 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}>
              Parques
            </Link>
            
            {/* Menú móvil de Contenido */}
            <div className="space-y-1">
              <button
                onClick={toggleContentMenu}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium ${
                  isContentActive
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}>
                Contenido
                <ChevronDown className={`h-4 w-4 transition-transform ${contentMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {contentMenuOpen && (
                <div className="ml-4 space-y-1">
                  <Link href="/activities"
                    className={`block px-3 py-2 rounded-md text-sm font-medium ${
                      location === '/activities' 
                        ? 'bg-primary-100 text-primary-800' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    Actividades
                  </Link>
                  
                  <Link href="/events"
                    className={`block px-3 py-2 rounded-md text-sm font-medium ${
                      location === '/events' 
                        ? 'bg-primary-100 text-primary-800' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    Eventos
                  </Link>
                  
                  <Link href="/calendar"
                    className={`block px-3 py-2 rounded-md text-sm font-medium ${
                      location === '/calendar' 
                        ? 'bg-primary-100 text-primary-800' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    Calendario
                  </Link>
                  
                  <Link href="/concessions"
                    className={`block px-3 py-2 rounded-md text-sm font-medium ${
                      location === '/concessions' 
                        ? 'bg-primary-100 text-primary-800' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    Servicios Comerciales
                  </Link>
                </div>
              )}
            </div>
            
            {/* Menú móvil de Biodiversidad */}
            <div className="space-y-1">
              <button
                onClick={toggleBiodiversityMenu}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium ${
                  isBiodiversityActive
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}>
                Biodiversidad
                <ChevronDown className={`h-4 w-4 transition-transform ${biodiversityMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {biodiversityMenuOpen && (
                <div className="ml-4 space-y-1">
                  <Link href="/tree-species"
                    className={`block px-3 py-2 rounded-md text-sm font-medium ${
                      location === '/tree-species' 
                        ? 'bg-primary-100 text-primary-800' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    Arbolado
                  </Link>
                  
                  <Link href="/fauna"
                    className={`block px-3 py-2 rounded-md text-sm font-medium ${
                      location === '/fauna' 
                        ? 'bg-primary-100 text-primary-800' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    Fauna
                  </Link>
                </div>
              )}
            </div>
            
            {/* Menú móvil de Usuarios */}
            <div className="space-y-1">
              <button
                onClick={toggleUsersMenu}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium ${
                  isUsersActive
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}>
                Usuarios
                <ChevronDown className={`h-4 w-4 transition-transform ${usersMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {usersMenuOpen && (
                <div className="ml-4 space-y-1">
                  <Link href="/volunteers"
                    className={`block px-3 py-2 rounded-md text-sm font-medium ${
                      location === '/volunteers' 
                        ? 'bg-primary-100 text-primary-800' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    Voluntarios
                  </Link>
                  
                  <Link href="/instructors"
                    className={`block px-3 py-2 rounded-md text-sm font-medium ${
                      location === '/instructors' 
                        ? 'bg-primary-100 text-primary-800' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    Instructores
                  </Link>
                </div>
              )}
            </div>
            
            {/* Enlace móvil de registro de voluntarios removido */}
            {/* Botón móvil "Acerca de" removido del menú */}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;