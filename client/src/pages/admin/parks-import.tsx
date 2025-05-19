import React, { useState } from 'react';
import { useLocation } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileUp, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';

const ParkImportPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: number;
    details?: string[];
  } | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      // Validar que sea Excel o CSV
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          selectedFile.type === 'application/vnd.ms-excel' ||
          selectedFile.type === 'text/csv' ||
          selectedFile.name.endsWith('.xlsx') ||
          selectedFile.name.endsWith('.xls') ||
          selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Formato no válido",
          description: "Por favor, sube un archivo Excel (.xlsx, .xls) o CSV (.csv)",
          variant: "destructive",
        });
        e.target.value = '';
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "No hay archivo seleccionado",
        description: "Por favor, selecciona un archivo para importar",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/parks/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error en la importación');
      }

      const result = await response.json();
      setImportResults({
        success: result.imported || 0,
        errors: result.errors || 0,
        details: result.errorDetails || [],
      });

      toast({
        title: "Importación completada",
        description: `Se importaron ${result.imported} parques correctamente${result.errors ? `, con ${result.errors} errores` : ''}`,
        variant: result.errors ? "default" : "default",
      });
    } catch (error) {
      console.error('Error importing parks:', error);
      toast({
        title: "Error en la importación",
        description: "No se pudieron importar los parques. Por favor, verifica el formato del archivo e intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    // En una aplicación real, esto debería apuntar a un archivo de plantilla real
    window.location.href = '/api/parks/import-template';
  };

  return (
    <AdminLayout title="Importación de Parques">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Importación Masiva de Parques</h1>
            <p className="text-muted-foreground">
              Importa múltiples parques desde un archivo Excel o CSV
            </p>
          </div>
          <Button variant="outline" onClick={() => setLocation('/admin/parks')}>
            Volver a Parques
          </Button>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Instrucciones */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Instrucciones</CardTitle>
              <CardDescription>
                Cómo importar parques masivamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">1. Descarga la plantilla</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Utiliza nuestra plantilla con los campos requeridos para asegurar una importación exitosa.
                </p>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full" 
                  onClick={downloadTemplate}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Plantilla
                </Button>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">2. Completa los datos</h3>
                <p className="text-sm text-muted-foreground">
                  Llena la plantilla con la información de tus parques. Los campos marcados con * son obligatorios.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">3. Importa el archivo</h3>
                <p className="text-sm text-muted-foreground">
                  Sube el archivo completado en el formulario de la derecha y haz clic en "Importar Parques".
                </p>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Importante</AlertTitle>
                <AlertDescription>
                  Asegúrate de que los datos sean correctos antes de importar. Las coordenadas deben estar en formato decimal (ej: 20.123456).
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Formulario de importación */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Subir Archivo</CardTitle>
              <CardDescription>
                Sube un archivo Excel (.xlsx, .xls) o CSV (.csv)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <FileUp className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Arrastra y suelta el archivo aquí, o
                  </p>
                  <label className="inline-block">
                    <Input 
                      type="file" 
                      accept=".xlsx,.xls,.csv" 
                      className="hidden" 
                      onChange={handleFileChange} 
                    />
                    <Button variant="secondary" size="sm" asChild>
                      <span>Seleccionar Archivo</span>
                    </Button>
                  </label>
                </div>
                
                {file && (
                  <div className="bg-muted p-3 rounded flex items-center justify-between">
                    <div className="flex items-center">
                      <FileUp className="h-4 w-4 mr-2 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setFile(null)}
                    >
                      Eliminar
                    </Button>
                  </div>
                )}
                
                {importResults && (
                  <div className={`border p-4 rounded-lg ${importResults.errors > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                    <div className="flex items-start">
                      {importResults.errors > 0 ? (
                        <AlertCircle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 mr-2 mt-0.5" />
                      )}
                      <div>
                        <h4 className="font-medium">Resultados de la importación</h4>
                        <p className="text-sm mt-1">
                          {importResults.success} parques importados exitosamente
                          {importResults.errors > 0 && `, ${importResults.errors} con errores`}
                        </p>
                        
                        {importResults.errors > 0 && importResults.details && importResults.details.length > 0 && (
                          <div className="mt-2">
                            <h5 className="text-sm font-medium mb-1">Detalles de los errores:</h5>
                            <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
                              {importResults.details.map((error, i) => (
                                <li key={i} className="text-amber-700">{error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleImport} 
                disabled={!file || isUploading}
                className="w-full"
              >
                {isUploading ? 'Importando...' : 'Importar Parques'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ParkImportPage;