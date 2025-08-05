import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Calendar, 
  Users, 
  TreePine, 
  Camera, 
  FileText, 
  Star,
  ArrowRight,
  ArrowDown,
  Settings,
  Eye,
  Globe,
  Database,
  Zap,
  BarChart3,
  Building2,
  Activity,
  User,
  Image,
  Wrench,
  AlertTriangle,
  Briefcase,
  Download
} from "lucide-react";

interface FeatureCard {
  icon: any;
  title: string;
  description: string;
  color: string;
  adminPath: string;
  publicPath?: string;
  features: string[];
}

export default function ParksModuleShowcase() {
  const [selectedFlow, setSelectedFlow] = useState<'admin' | 'public' | 'integration'>('admin');

  const adminFeatures: FeatureCard[] = [
    {
      icon: MapPin,
      title: "Información Básica",
      description: "Gestión completa de datos fundamentales del parque",
      color: "bg-emerald-500",
      adminPath: "/admin/parks/:id/edit",
      publicPath: "/parque/:slug",
      features: [
        "Nombre, ubicación y descripción",
        "Coordenadas GPS precisas",
        "Horarios de funcionamiento",
        "Información de contacto",
        "Estado operativo"
      ]
    },
    {
      icon: Building2,
      title: "Amenidades",
      description: "Catálogo completo de instalaciones y servicios",
      color: "bg-blue-500",
      adminPath: "/admin/parks/:id/amenities",
      publicPath: "/parque/:slug#amenidades",
      features: [
        "27+ tipos de amenidades",
        "Iconos personalizados",
        "Estados operativos",
        "Descripción detallada",
        "Gestión visual"
      ]
    },
    {
      icon: Activity,
      title: "Actividades",
      description: "Programación y gestión de eventos del parque",
      color: "bg-purple-500",
      adminPath: "/admin/activities",
      publicPath: "/parque/:slug#actividades",
      features: [
        "Calendario de actividades",
        "6 categorías temáticas",
        "Asignación de instructores",
        "Gestión de capacidad",
        "Sistema de precios"
      ]
    },
    {
      icon: TreePine,
      title: "Inventario de Árboles",
      description: "Catálogo científico y seguimiento de arbolado",
      color: "bg-green-600",
      adminPath: "/admin/trees/inventory",
      publicPath: "/parque/:slug#arboles",
      features: [
        "223 especies mexicanas",
        "Geolocalización GPS",
        "Estado de salud",
        "Fotografías científicas",
        "Datos botánicos completos"
      ]
    },
    {
      icon: User,
      title: "Instructores",
      description: "Equipo humano especializado del parque",
      color: "bg-indigo-500",
      adminPath: "/admin/activities/instructors",
      publicPath: "/parque/:slug#instructores",
      features: [
        "Perfiles profesionales",
        "Especialidades certificadas",
        "Evaluaciones ciudadanas",
        "Fotografías de perfil",
        "Asignación de actividades"
      ]
    },
    {
      icon: Users,
      title: "Voluntarios",
      description: "Programa de participación ciudadana",
      color: "bg-orange-500",
      adminPath: "/admin/volunteers",
      publicPath: "/parque/:slug#voluntarios",
      features: [
        "Registro de voluntarios",
        "Áreas de interés",
        "Disponibilidad temporal",
        "Reconocimientos",
        "Evaluaciones de desempeño"
      ]
    },
    {
      icon: Image,
      title: "Multimedia",
      description: "Galería visual y documentación oficial",
      color: "bg-pink-500",
      adminPath: "/admin/parks/:id/multimedia",
      publicPath: "/parque/:slug#galeria",
      features: [
        "Galería de imágenes",
        "Imagen principal",
        "Documentos oficiales",
        "Reglamentos PDF",
        "Material promocional"
      ]
    },
    {
      icon: Briefcase,
      title: "Concesiones",
      description: "Servicios comerciales autorizados",
      color: "bg-cyan-500",
      adminPath: "/admin/concessions/active",
      publicPath: "/parque/:slug#concesiones",
      features: [
        "16 tipos de concesiones",
        "Contratos vigentes",
        "Ubicaciones específicas",
        "Información de contacto",
        "Galería de servicios"
      ]
    },
    {
      icon: Wrench,
      title: "Activos e Infraestructura",
      description: "Inventario y mantenimiento de equipamiento",
      color: "bg-slate-500",
      adminPath: "/admin/assets/inventory",
      features: [
        "Inventario completo",
        "22 categorías de activos",
        "Programación de mantenimiento",
        "Geolocalización GPS",
        "Valor patrimonial"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Gestión de Incidencias",
      description: "Sistema de reportes y seguimiento",
      color: "bg-red-500",
      adminPath: "/admin/incidents",
      features: [
        "7 etapas de lifecycle",
        "15 categorías de incidentes",
        "Asignación automática",
        "Seguimiento temporal",
        "Reportes ejecutivos"
      ]
    }
  ];

  const flowSteps = {
    admin: [
      { title: "Gestión Administrativa", desc: "Los administradores gestionan todos los datos desde el panel admin" },
      { title: "Base de Datos Centralizada", desc: "Toda la información se almacena de forma estructurada" },
      { title: "Sincronización Automática", desc: "Los cambios se reflejan inmediatamente en las páginas públicas" }
    ],
    public: [
      { title: "Landing Pages Automáticas", desc: "Cada parque tiene su página pública generada automáticamente" },
      { title: "Datos en Tiempo Real", desc: "La información siempre está actualizada desde el admin" },
      { title: "Experiencia Ciudadana", desc: "Los visitantes acceden a información completa y actualizada" }
    ],
    integration: [
      { title: "Single Source of Truth", desc: "Una sola base de datos alimenta todo el sistema" },
      { title: "APIs Unificadas", desc: "Endpoints centralizados para admin y páginas públicas" },
      { title: "Automatización Total", desc: "Sin duplicación manual de datos" }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                Módulo de Gestión de Parques
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ecosistema completo que conecta la gestión administrativa con la experiencia ciudadana.
              <span className="block mt-2 font-semibold text-emerald-700">
                De la administración interna a las páginas públicas automáticas.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Flow Selector */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center gap-4 mb-8">
          {[
            { key: 'admin', label: 'Vista Administrativa', icon: Settings },
            { key: 'public', label: 'Vista Pública', icon: Globe },
            { key: 'integration', label: 'Integración', icon: Zap }
          ].map((flow) => (
            <Button
              key={flow.key}
              variant={selectedFlow === flow.key ? "default" : "outline"}
              onClick={() => setSelectedFlow(flow.key as any)}
              className="gap-2"
            >
              <flow.icon className="h-4 w-4" />
              {flow.label}
            </Button>
          ))}
        </div>

        {/* Flow Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {flowSteps[selectedFlow].map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-emerald-700 font-bold">{index + 1}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.desc}</p>
              {index < flowSteps[selectedFlow].length - 1 && (
                <ArrowDown className="h-6 w-6 text-gray-400 mx-auto mt-4 hidden md:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Componentes del Sistema
          </h2>
          <p className="text-lg text-gray-600">
            Cada componente del admin se refleja automáticamente en las páginas públicas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminFeatures.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center`}>
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {feature.features.map((feat, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {feat}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Admin:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {feature.adminPath}
                      </code>
                    </div>
                    
                    {feature.publicPath && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-emerald-500" />
                        <span className="text-gray-600">Público:</span>
                        <code className="bg-emerald-50 px-2 py-1 rounded text-xs">
                          {feature.publicPath}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Integration Flow */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Flujo de Integración Completo
            </h2>
            <p className="text-lg text-gray-600">
              Arquitectura Single Source of Truth: Un cambio en admin se refleja instantáneamente en todas las páginas públicas
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Admin Side */}
            <Card className="border-2 border-emerald-200">
              <CardHeader className="text-center bg-emerald-50">
                <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-emerald-800">Panel Administrativo</CardTitle>
                <p className="text-emerald-600">Gestión centralizada</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm">Crear/editar parques</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm">Gestionar amenidades</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm">Programar actividades</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm">Subir multimedia</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm">Asignar instructores</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Flow Arrow */}
            <div className="text-center">
              <div className="flex flex-col items-center gap-4">
                <Database className="h-12 w-12 text-blue-600" />
                <ArrowRight className="h-8 w-8 text-gray-400 hidden lg:block" />
                <ArrowDown className="h-8 w-8 text-gray-400 lg:hidden" />
                <div className="text-center">
                  <p className="font-semibold text-blue-700">Base de Datos PostgreSQL</p>
                  <p className="text-sm text-gray-600">Single Source of Truth</p>
                </div>
              </div>
            </div>

            {/* Public Side */}
            <Card className="border-2 border-blue-200">
              <CardHeader className="text-center bg-blue-50">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-blue-800">Páginas Públicas</CardTitle>
                <p className="text-blue-600">Experiencia ciudadana</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Landing pages automáticas</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Información actualizada</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Galerías interactivas</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Perfiles de instructores</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Sistema de evaluaciones</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para ver el sistema en acción?
          </h2>
          <p className="text-xl mb-8 text-emerald-100">
            Explora tanto el panel administrativo como las páginas públicas generadas automáticamente
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="gap-2">
              <Settings className="h-5 w-5" />
              Acceder al Panel Admin
            </Button>
            <Button size="lg" variant="outline" className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Eye className="h-5 w-5" />
              Ver Páginas Públicas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}