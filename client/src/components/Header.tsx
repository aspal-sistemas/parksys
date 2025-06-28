import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activitiesMenuOpen, setActivitiesMenuOpen] = useState(false);
  
  const isAdmin = location.startsWith('/admin');
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  const toggleActivitiesMenu = () => {
    setActivitiesMenuOpen(prev => !prev);
  };

  const isActivitiesActive = location === '/activities' || 
                            location === '/calendar' || 
                            location === '/instructors';

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/">
              <div className="flex-shrink-0 flex items-center cursor-pointer">
                <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-8c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm4 8c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-8c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm7.5-4c.28 0 .5.22.5.5s-.22.5-.5.5-.5-.22-.5-.5.22-.5.5-.5zM5 12c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm7 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm1-8.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zM17 12c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm2-5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm-7-10c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm-4-8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"></path>
                </svg>
                <span className="ml-2 text-xl font-heading font-semibold text-gray-900">ParkSys</span>
              </div>
            </Link>
            
            {/* Desktop navigation */}
            {!isAdmin && (
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
                
                {/* Menú de Actividades con dropdown */}
                <div className="relative group">
                  <button
                    className={`border-b-2 pt-1 pb-3 px-1 text-sm font-medium flex items-center ${
                      isActivitiesActive
                        ? 'border-primary text-gray-900' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}>
                    Actividades
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </button>
                  
                  {/* Dropdown menu */}
                  <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link href="/activities"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                        Ver Actividades
                      </Link>
                      <Link href="/calendar"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                        Calendario
                      </Link>
                      <Link href="/instructors"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                        Instructores
                      </Link>
                    </div>
                  </div>
                </div>
                
                <Link href="/concessions"
                  className={`border-b-2 pt-1 pb-3 px-1 text-sm font-medium ${
                    location === '/concessions' 
                      ? 'border-primary text-gray-900' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}>
                  Concesiones
                </Link>
                
                {/* Enlace de registro de voluntarios removido */}
                
                <button 
                  onClick={() => window.scrollTo(0, document.body.scrollHeight)} 
                  className="border-b-2 border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-700 px-1 pt-1 pb-3 text-sm font-medium"
                >
                  Acerca de
                </button>
              </nav>
            )}
          </div>
          
          <div className="flex items-center">
            {isAdmin ? (
              location !== '/admin/login' && (
                <Link href="/">
                  <Button variant="outline" size="sm" className="mr-2">
                    Ver sitio público
                  </Button>
                </Link>
              )
            ) : (
              <Link href="/admin/login">
                <Button>
                  Acceso Institucional
                </Button>
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
            
            {/* Menú móvil de Actividades organizado */}
            <div className="space-y-1">
              <button
                onClick={toggleActivitiesMenu}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium ${
                  isActivitiesActive
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}>
                Actividades
                <ChevronDown className={`h-4 w-4 transition-transform ${activitiesMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {activitiesMenuOpen && (
                <div className="ml-4 space-y-1">
                  <Link href="/activities"
                    className={`block px-3 py-2 rounded-md text-sm font-medium ${
                      location === '/activities' 
                        ? 'bg-primary-100 text-primary-800' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    Ver Actividades
                  </Link>
                  
                  <Link href="/calendar"
                    className={`block px-3 py-2 rounded-md text-sm font-medium ${
                      location === '/calendar' 
                        ? 'bg-primary-100 text-primary-800' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    Calendario
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
            
            <Link href="/concessions"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location === '/concessions' 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}>
              Concesiones
            </Link>
            
            {/* Enlace móvil de registro de voluntarios removido */}
            
            <button 
              onClick={() => window.scrollTo(0, document.body.scrollHeight)} 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 w-full text-left"
            >
              Acerca de
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;