import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  // Se podría añadir la consulta para obtener el nombre del municipio o parque si se necesita
  const { data: municipalityData } = useQuery({
    queryKey: ['/api/municipalities/current'],
    enabled: false, // Por ahora desactivada
  });

  const municipalityName = municipalityData?.name || 'ParquesMX';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <a className="flex items-center gap-2">
              <div className="bg-emerald-600 text-white p-2 rounded-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M17 14h.01" />
                  <path d="M7 7h.01" />
                  <path d="M7 14h.01" />
                  <path d="M12 14h.01" />
                  <path d="M12 7h.01" />
                  <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Z" />
                  <path d="M3 10h18" />
                  <path d="M10 3v18" />
                </svg>
              </div>
              <span className="font-bold text-lg text-emerald-800">{municipalityName}</span>
            </a>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/parques">
              <a className="text-gray-600 hover:text-emerald-700 transition-colors">
                Parques
              </a>
            </Link>
            <Link href="/actividades">
              <a className="text-gray-600 hover:text-emerald-700 transition-colors">
                Actividades
              </a>
            </Link>
            <Link href="/instructores">
              <a className="text-gray-600 hover:text-emerald-700 transition-colors">
                Instructores
              </a>
            </Link>
            <Link href="/calendario">
              <a className="text-gray-600 hover:text-emerald-700 transition-colors">
                Calendario
              </a>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-emerald-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Acerca de</h3>
              <p className="text-emerald-100 text-sm">
                ParquesMX es una plataforma dedicada a la gestión y promoción de espacios verdes y actividades recreativas en parques públicos.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Enlaces rápidos</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/parques">
                    <a className="text-emerald-100 hover:text-white transition-colors">
                      Parques
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/actividades">
                    <a className="text-emerald-100 hover:text-white transition-colors">
                      Actividades
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/instructores">
                    <a className="text-emerald-100 hover:text-white transition-colors">
                      Instructores
                    </a>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Participación</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/voluntarios">
                    <a className="text-emerald-100 hover:text-white transition-colors">
                      Voluntariado
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/reportes">
                    <a className="text-emerald-100 hover:text-white transition-colors">
                      Reportar incidentes
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/sugerencias">
                    <a className="text-emerald-100 hover:text-white transition-colors">
                      Enviar sugerencias
                    </a>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Contacto</h3>
              <address className="not-italic text-sm text-emerald-100">
                <p>Dirección de Parques y Jardines</p>
                <p>contacto@parquesmx.gob.mx</p>
                <p>Tel: (33) 3837-4400</p>
              </address>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-emerald-700 text-center text-sm text-emerald-200">
            &copy; {new Date().getFullYear()} ParquesMX. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}