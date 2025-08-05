import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Award, Clock, ClipboardCheck } from 'lucide-react';
import { useLocation, useParams } from 'wouter';

export default function VolunteerDashboardPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const volunteerId = params?.id || '1';
  
  // Datos del voluntario (simulados para demostración)
  // En una implementación real, usaríamos el ID para cargar los datos
  console.log("Mostrando dashboard para el voluntario ID:", volunteerId);
  
  const volunteerData = {
    id: 1,
    fullName: 'Ana García Martínez',
    email: 'ana.garcia@example.com',
    status: 'Activo',
    phoneNumber: '123-456-7890',
    address: 'Calle Hidalgo 123, Guadalajara',
    totalHours: 120,
    createdAt: '2023-04-15',
    activities: [
      { id: 1, name: 'Limpieza del parque', date: '2023-06-10', hours: 4, parkName: 'Parque Metropolitano' },
      { id: 2, name: 'Plantación de árboles', date: '2023-05-20', hours: 6, parkName: 'Parque Colomos' }
    ],
    evaluations: [
      { id: 1, date: '2023-06-15', punctuality: 5, attitude: 5, responsibility: 4, overall: 4.7 },
      { id: 2, date: '2023-05-25', punctuality: 4, attitude: 5, responsibility: 4, overall: 4.3 }
    ],
    recognitions: [
      { id: 1, type: 'Voluntario del Mes', date: '2023-06-30', description: 'Por su dedicación y compromiso' },
      { id: 2, type: 'Mejor Equipo', date: '2023-05-15', description: 'Por coordinar eficientemente la plantación' }
    ]
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => setLocation('/admin/volunteers')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a voluntarios
          </Button>
          
          <h1 className="text-3xl font-bold">Dashboard de Voluntario</h1>
          <p className="text-gray-500">Visión general del voluntario y sus actividades</p>
        </div>
        
        {/* Información del voluntario */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="col-span-3 md:col-span-1">
            <CardHeader>
              <CardTitle>Información del Voluntario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-4">
                  {volunteerData.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                
                <div>
                  <h3 className="text-xl font-bold">{volunteerData.fullName}</h3>
                  <p className="text-gray-500">{volunteerData.email}</p>
                </div>
                
                <div className="pt-4">
                  <div className="flex items-center mb-2">
                    <ClipboardCheck className="h-5 w-5 mr-2 text-gray-500" />
                    <span>Miembro desde: {new Date(volunteerData.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 mr-2 text-gray-500" />
                    <span>Horas totales: {volunteerData.totalHours}</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-5 w-5 mr-2 text-gray-500" />
                    <span>Reconocimientos: {volunteerData.recognitions.length}</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <span className="inline-block bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2">
                    {volunteerData.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Estadísticas de actividad */}
          <Card className="col-span-3 md:col-span-2">
            <CardHeader>
              <CardTitle>Estadísticas de Actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">Participaciones</h3>
                  <p className="text-3xl font-bold">{volunteerData.activities.length}</p>
                  <p className="text-gray-500">Actividades completadas</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-700 mb-2">Horas Contribuidas</h3>
                  <p className="text-3xl font-bold">{volunteerData.totalHours}</p>
                  <p className="text-gray-500">Tiempo total de voluntariado</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-700 mb-2">Calificación</h3>
                  <p className="text-3xl font-bold">
                    {volunteerData.evaluations.reduce((acc, evaluation) => acc + evaluation.overall, 0) / 
                     volunteerData.evaluations.length || 0}
                  </p>
                  <p className="text-gray-500">Promedio de evaluaciones</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Actividades recientes */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Actividades Recientes</CardTitle>
              <CardDescription>Últimas participaciones del voluntario</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parque</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {volunteerData.activities.map((activity) => (
                      <tr key={activity.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">{activity.name}</td>
                        <td className="py-4 px-4 text-sm text-gray-500">{new Date(activity.date).toLocaleDateString()}</td>
                        <td className="py-4 px-4 text-sm text-gray-500">{activity.parkName}</td>
                        <td className="py-4 px-4 text-sm text-gray-500">{activity.hours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Evaluaciones y Reconocimientos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Evaluaciones */}
          <Card>
            <CardHeader>
              <CardTitle>Evaluaciones</CardTitle>
              <CardDescription>Desempeño en actividades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {volunteerData.evaluations.map((evaluation) => (
                  <div key={evaluation.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Evaluación #{evaluation.id}</span>
                      <span className="text-gray-500">{new Date(evaluation.date).toLocaleDateString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Puntualidad:</span> {evaluation.punctuality}/5
                      </div>
                      <div>
                        <span className="text-gray-500">Actitud:</span> {evaluation.attitude}/5
                      </div>
                      <div>
                        <span className="text-gray-500">Responsabilidad:</span> {evaluation.responsibility}/5
                      </div>
                      <div>
                        <span className="text-gray-500">General:</span> {evaluation.overall}/5
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Reconocimientos */}
          <Card>
            <CardHeader>
              <CardTitle>Reconocimientos</CardTitle>
              <CardDescription>Logros obtenidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {volunteerData.recognitions.map((recognition) => (
                  <div key={recognition.id} className="border-l-4 border-yellow-400 pl-4 py-2">
                    <div className="flex justify-between">
                      <h4 className="font-bold text-lg">{recognition.type}</h4>
                      <span className="text-gray-500 text-sm">{new Date(recognition.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600 mt-1">{recognition.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}