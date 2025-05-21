import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Definir la estructura de un elemento de menú para mejor mantenibilidad
interface MenuItem {
  href: string;
  label: string;
  onClick?: () => void;
}

const Header: React.FC = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isAdmin = location.startsWith('/admin');
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  // Lista organizada de elementos del menú público
  const publicMenuItems: MenuItem[] = [
    { href: "/", label: "Inicio" },
    { href: "/parks", label: "Parques" },
    { href: "/activities", label: "Actividades" },
    { href: "/instructors", label: "Instructores" },
    { href: "/calendar", label: "Calendario" },
    { href: "/voluntarios/registro", label: "Registro de Voluntarios" },
    { 
      href: "#", 
      label: "Acerca de", 
      onClick: () => window.scrollTo(0, document.body.scrollHeight) 
    }
  ];

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
                <span className="ml-2 text-xl font-heading font-semibold text-gray-900">ParquesMX</span>
              </div>
            </Link>
            
            {/* Desktop navigation */}
            {!isAdmin && (
              <nav className="hidden md:ml-8 md:flex md:space-x-6">
                {publicMenuItems.map((item, index) => (
                  item.onClick ? (
                    <button 
                      key={index}
                      onClick={item.onClick} 
                      className="border-b-2 border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-700 px-1 pt-1 pb-3 text-sm font-medium"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link 
                      key={index}
                      href={item.href}
                      className={`border-b-2 pt-1 pb-3 px-1 text-sm font-medium ${
                        location === item.href 
                          ? 'border-primary text-gray-900' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                ))}
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
            {publicMenuItems.map((item, index) => (
              item.onClick ? (
                <button 
                  key={index}
                  onClick={item.onClick} 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 w-full text-left"
                >
                  {item.label}
                </button>
              ) : (
                <Link 
                  key={index}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location === item.href 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              )
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
