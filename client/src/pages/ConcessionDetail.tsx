import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Calendar, Building2, Clock, ArrowLeft, Store, User, FileText } from "lucide-react";
import { Link, useParams } from "wouter";

interface ConcessionImage {
  id: number;
  image_url: string;
  title?: string;
  description?: string;
  image_type: string;
  is_primary: boolean;
  display_order: number;
}

interface ConcessionDetail {
  id: number;
  name: string;
  description: string;
  concession_type_id: number;
  concessionaire_id: number;
  park_id: number;
  specific_location: string;
  start_date: string;
  end_date: string;
  status: string;
  priority: string;
  monthly_payment: string;
  operating_hours: string;
  operating_days: string;
  emergency_contact: string;
  emergency_phone: string;
  concessionTypeName: string;
  concessionTypeDescription: string;
  impactLevel: string;
  concessionaireName: string;
  concessionaireEmail: string;
  concessionairePhone?: string;
  parkName: string;
  parkLocation: string;
  imageCount: number;
  primaryImage?: string;
  images: ConcessionImage[];
}

export default function ConcessionDetail() {
  const { id } = useParams();

  const { data: concessionResponse, isLoading, error } = useQuery({
    queryKey: [`/api/active-concessions/${id}`],
    enabled: !!id,
  });

  const concession = (concessionResponse as any)?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-300 rounded-lg mb-6"></div>
            <div className="h-48 bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !concession) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Concesión no encontrada</h1>
          <p className="text-gray-600 mb-6">
            La concesión que buscas no existe o ha sido removida.
          </p>
          <Link href="/concessions">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a concesiones
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'activo':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'por vencer':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'vencido':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'alimentario':
        return '🍽️';
      case 'comercial':
        return '🛍️';
      case 'servicios':
        return '⚙️';
      case 'recreativo':
        return '🎯';
      default:
        return '🏪';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/concessions">
            <Button variant="outline" className="mb-4 border-green-300 text-green-700 hover:bg-green-50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a concesiones
            </Button>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{getTypeIcon(concession.concessionTypeName)}</span>
                <h1 className="text-3xl font-bold text-gray-900">
                  {concession.name}
                </h1>
              </div>
              <p className="text-lg text-gray-600">
                Operado por: {concession.concessionaireName}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Badge className={`text-sm px-3 py-1 ${getStatusColor(concession.status)}`}>
                {concession.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Galería de fotos */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-64">
            {/* Imagen principal - ocupa 2x2 */}
            <div className="col-span-2 row-span-2 relative">
              <img 
                src={concession.image_url || '/api/placeholder/400/400'} 
                alt={`${concession.name} - Imagen principal`}
                className="w-full h-full object-contain rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 rounded-lg cursor-pointer" />
            </div>
            
            {/* 4 imágenes secundarias - cada una ocupa 1x1 */}
            {concession.images && concession.images
              .filter(img => !img.is_primary)
              .slice(0, 4)
              .map((image, index) => (
                <div key={image.id} className="relative">
                  <img 
                    src={image.image_url} 
                    alt={`${concession.name} - Imagen ${index + 2}`}
                    className="w-full h-full object-contain rounded-lg shadow-md"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 rounded-lg cursor-pointer" />
                </div>
              ))
            }
            
            {/* Relleno con placeholders si hay menos de 4 imágenes secundarias */}
            {concession.images && 
              concession.images.filter(img => !img.is_primary).length < 4 &&
              [...Array(4 - concession.images.filter(img => !img.is_primary).length)].map((_, index) => (
                <div key={`placeholder-${index}`} className="relative bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Sin imagen</span>
                </div>
              ))
            }
          </div>
        </div>

      {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descripción */}
            {concession.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    Descripción
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {concession.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Horarios de Operación */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  Horarios de Operación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <strong>Horarios:</strong> {concession.operating_hours}
                  </p>
                  <p className="text-gray-700">
                    <strong>Días:</strong> {concession.operating_days}
                  </p>
                </div>
              </CardContent>
            </Card>


          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información de contacto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-600" />
                  Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Concesionario</label>
                  <p className="text-gray-900 font-medium mt-1">{concession.concessionaireName}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Contacto de emergencia</label>
                  <p className="text-gray-900 font-medium mt-1">{concession.emergency_contact}</p>
                </div>

                {concession.emergency_phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Teléfono de emergencia</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a 
                        href={`tel:${concession.emergency_phone}`}
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        {concession.emergency_phone}
                      </a>
                    </div>
                  </div>
                )}

                {concession.concessionaireEmail && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a 
                        href={`mailto:${concession.concessionaireEmail}`}
                        className="text-green-600 hover:text-green-700 font-medium break-all"
                      >
                        {concession.concessionaireEmail}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Parque */}
            {concession.parkName && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-gray-600" />
                    Parque
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/parque/${concession.parkName.toLowerCase().replace(/\s+/g, '-')}-${concession.park_id}`}>
                    <div className="flex items-center gap-2 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="text-green-600 hover:text-green-700 font-medium">
                        {concession.parkName}
                      </span>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}